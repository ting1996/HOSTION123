import React from 'react';
import { connect } from 'react-redux';
import style from '../style.css';
var ReactDOM = require('react-dom');
import RowCall from './RowCall';

class GoiDienTuVan extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sohotline: null,
            danhsachhotline: [],
            danhsachsochuagoi: [],
            tinhtrangcuocgoi: [],
            SetBusy: null,
            disbutton: true,
        }
        this.callBackDataFormDatabase = this.callBackDataFormDatabase.bind(this);
    }

    callBackDataFormDatabase ( rows, hanhdong, dulieuguive ) {
        if (hanhdong == 'laydulieu_trave') {
            if (dulieuguive != null) {
                switch (dulieuguive.fn) {
                    case 'goidientuvan_loadtinhtrangcuocgoi':
                        let tinhtrang = [];
                        for (let value of rows) {
                            tinhtrang.push({value: value['Tình Trạng Cuộc Gọi'], label: value['Tình Trạng Cuộc Gọi']});
                        }
                        this.setState({tinhtrangcuocgoi: tinhtrang});
                        break;
                    case 'goidientuvan_loaddanhsachsochuagoi' + $('#lable_button_nexttoicon').attr('value'):
                        let query = '';
                        for (let value of rows) {
                            query += 'UPDATE `quanlyhocsinh`.`MARKETING` SET `isBusy`=\'1\' WHERE `ID`=\'?\'; '.replace('?', value['ID']);
                        }
                        query = query.replace(/\?/g, $('.khuvuc').attr('value'));

                        if (query != '') {
                            this.props.socket.emit('gui-query-den-database', query , 'laydulieu_trave', {
                                fn : 'goidientuvan_trackisBusy',
                            });
                            this.setState({
                                danhsachsochuagoi: rows,
                                SetBusy: query,
                            });
                        } else {
                            this.props.dispatch({
                                type: 'ALERT_NOTIFICATION_ADD',
                                content: 'Không có dữ liệu để gọi hoặc đã hết dữ liệu!',
                                notifyType: 'information',
                            })
                            this.close();
                        }
                        break;
                    case 'goidientuvan_trackisBusy':
                        if (rows.changedRows == 1) {
                            this.setState({disbutton: false});
                            let query = this.state.SetBusy;
                            let date = new Date().toLocaleDateString('en-GB').split('/');
                            let get2h = new Date();
                            get2h.setHours(get2h.getHours() + 2);
                            let time = get2h.toLocaleTimeString('en-GB').split('/');
                            let ngaygoi = date[2] + '-' + date[1] + '-' + date[0] + ' ' + time;
                            query = query.replace(/`isBusy`=\'1\'/g, '`expires_on`=\'' + ngaygoi + '\'');
                            this.props.socket.emit('gui-query-den-database', query , 'laydulieu_trave', {
                            });
                        } else {
                            let query = 'SELECT * FROM quanlyhocsinh.MARKETING ' +
                            'WHERE !EXISTS(SELECT * FROM quanlyhocsinh.GOIDIENTUVAN_VIEW ' +
                            'WHERE GOIDIENTUVAN_VIEW.`Số Điện Thoại` = MARKETING.`Số Điện Thoại`) ' +
                            'AND MARKETING.`Mã Nhân Viên Đi Tư Vấn` IS NOT NULL ' +
                            'AND MARKETING.`isBusy` = \'0\' ' +
                            'AND `Cơ Sở` = \'?\' ' +
                            'LIMIT 1';
                            query = query.replace(/\?/g, $('.khuvuc').attr('value'));

                            let that = this;
                            let timer = setInterval(function() {
                                that.props.socket.emit('gui-query-den-database', query , 'laydulieu_trave', {
                                    fn : 'goidientuvan_loaddanhsachsochuagoi' + $('#lable_button_nexttoicon').attr('value'),
                                });
                                clearInterval(timer);
                            }, 1000);
                        }
                        break;
                    case 'goidientuvan_trackisBusynone':
                        break;
                    case 'goidientuvan_close':
                        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                        break;
                    case 'goidientuvan_loadhotline':
                        this.setState({
                            danhsachhotline: rows,
                        });
                        break;
                    default:                        
                }                
            }
        }

        if (hanhdong == 'loi-cu-phap') {
            this.setState({
                disbutton: false,
            })
        }
    }

    componentDidMount () {
        let query;
        let that = this;
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
      
        query = 'SELECT * FROM quanlyhocsinh.GOIDIENTUVAN_TINHTRANGCUOCGOI'
        this.props.socket.emit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'goidientuvan_loadtinhtrangcuocgoi',
        });

        query = 'SELECT * FROM quanlyhocsinh.MARKETING ' +
        'WHERE !EXISTS(SELECT * FROM quanlyhocsinh.GOIDIENTUVAN_VIEW ' +
        'WHERE GOIDIENTUVAN_VIEW.`Số Điện Thoại` = MARKETING.`Số Điện Thoại`) ' +
        'AND MARKETING.`Mã Nhân Viên Đi Tư Vấn` IS NOT NULL ' +
        'AND MARKETING.`isBusy` = \'0\' ' +
        'AND `Cơ Sở` = \'?\' ' +
        'LIMIT 1';
        query = query.replace(/\?/g, $('.khuvuc').attr('value'));
        this.props.socket.emit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'goidientuvan_loaddanhsachsochuagoi' + $('#lable_button_nexttoicon').attr('value'),
        });

        query = 'SELECT * FROM quanlyhocsinh.HOTLINE WHERE `Cơ Sở` = \'?\' AND `isActivated` = \'1\';';
        query = query.replace('?', $('.khuvuc').attr('value'));
        this.props.socket.emit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'goidientuvan_loadhotline',
        });
    }

    componentWillUnmount() {
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);

        let query = this.state.SetBusy;
        if (query != null) {
            query = query.replace(/`isBusy`=\'1\'/g, '`isBusy`=\'0\', expires_on=null');
            this.props.socket.emit('gui-query-den-database', query , 'laydulieu_trave', {
                fn : 'goidientuvan_trackisBusynone',
            });
        }
    }

    componentDidUpdate(prevProps, prevState) {
    }

    next () {
        if (this.state.sohotline == null) {
            var sohotline = $('input[name=goidientuvan_sohotline]:checked').val();
            if (sohotline != null) {
                this.setState({
                    sohotline: sohotline,
                })
            }
        } else {
            
        }
    }

    dongy () {
        this.state.danhsachsochuagoi.map((v, i) => {
            this['rowcall' + i].dongy();
        });

        let query = this.state.SetBusy;
        query = query.replace(/`isBusy`=\'1\'/g, '`isBusy`=\'0\', expires_on=null');
        this.props.socket.emit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'goidientuvan_close',
        });
    }

    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    }

    render () {
        let title = '';
        title = $('#lable_button_nexttoicon').attr('value') + ' - ' + $('#lable_button_nexttoicon')[0].innerText;

        if (this.state.sohotline == null) {
            return (
                <div className={style.formstyle}>
                <div className="form_body">
                    <div className="header">
                        <h2>Chọn Hotline</h2>
                    </div>
                    <div className="body">
                        <div className="divformstyle">
                            <div>
                                <fieldset>
                                    <legend>Số Điện Thoại: </legend>
                                    {
                                        this.state.danhsachhotline.map((v, i) => {
                                            return (
                                                <div>
                                                    <input 
                                                        type="radio"
                                                        name="goidientuvan_sohotline"
                                                        value={v['Số Điện Thoại']}
                                                        style={{
                                                            "width": "auto",
                                                        }}
                                                    />
                                                    {' 0' + v['Số Điện Thoại']}
                                                    <br/>
                                                </div>
                                            )
                                        })
                                    }
                                </fieldset>
                            </div>
                        </div>
                    </div>
                    <div className="footer">
                        <input type="button" onClick={this.close.bind(this)} value="Thoát" disabled={this.state.disbutton}/>
                        <input type="button" onClick={this.next.bind(this)} value="Tiếp Tục" disabled={this.state.disbutton}/>
                    </div>
                </div>
                <div className="daithem">
                </div>
            </div> 
            )
        } else {
            return (
                <div className={style.formstyle}>
                    <div className="form_body" style={{'width': '1100px'}}>
                        <div className="header">
                            { /*<img src="" alt="Icon Image"/> */}
                            <h2>Danh Sách Số Điện Thoại Gọi</h2>
                        </div>
                        <div className="body">
                            <div className="divformstyle">
                                <div>
                                    <h2 style={{'margin': '0', 'text-align': 'center'}}>
                                        {title}
                                    </h2>
                                </div>
                            </div>
                            {
                                this.state.danhsachsochuagoi.map((v, i) => {
                                    return (
                                        <RowCall 
                                            data={v}
                                            key={i}
                                            tinhtrangcuocgoi={this.state.tinhtrangcuocgoi}
                                            getMe={me => this['rowcall' + i] = me}
                                        />
                                    )
                                })
                            }
                        </div>
                        <div className="footer">
                            <input type="button" onClick={this.close.bind(this)} value="Thoát" disabled={this.state.disbutton}/>
                            <input type="button" onClick={this.dongy.bind(this)} value="Lưu" disabled={this.state.disbutton}/>
                            <input type="button" onClick={this.next.bind(this)} value="Tiếp Tục" disabled={this.state.disbutton}/>
                        </div>
                    </div>
                    <div className="daithem">
                    </div>
                </div>
            )
        }
    }
}

module.exports = connect(function (state) {
    return {
      socket: state.socket,
    };
  }) (GoiDienTuVan);
