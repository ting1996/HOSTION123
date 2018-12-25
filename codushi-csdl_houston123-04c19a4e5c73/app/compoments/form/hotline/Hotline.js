import React from 'react';
import { connect } from 'react-redux';
import style from '../style.css';
var ReactDOM = require('react-dom');
import SoDienThoai from '../elements/SoDienThoai';

class Hotline extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            phonenumber: [],
        }
        this.callBackDataFormDatabase = this.callBackDataFormDatabase.bind(this);
        this.SocketEmit = this.SocketEmit.bind(this);
        this.changeSize = this.changeSize.bind(this);
    }

    changeSize () {
        if (window.innerHeight < this.refs.body.offsetHeight) {
            this.refs.background.style.paddingTop = '0px';
        } else {
            this.refs.background.style.paddingTop = ((window.innerHeight - this.refs.body.offsetHeight) / 2) + 'px';
        }
    }

    SocketEmit () {
        if (arguments[0] == 'gui-query-den-database') {
            $('.loading').show();
        }

        switch (arguments.length) {
            case 2:
                this.props.socket.emit(arguments[0], arguments[1]);
                break;
            case 3:
                this.props.socket.emit(arguments[0], arguments[1], arguments[2]);
                break;
            case 4:
                this.props.socket.emit(arguments[0], arguments[1], arguments[2], arguments[3]);
                break;
            default:                
        }
    }

    callBackDataFormDatabase ( rows, hanhdong, dulieuguive ) {
        let query;
        if (hanhdong == 'laydulieu_trave') {
            if (dulieuguive != null) {
                switch (dulieuguive.fn) {
                    case 'hotline_loadsodienthoai':
                        this.setState({
                            phonenumber: rows,
                        });
                        break;
                    case 'hotline_addsodienthoai':
                        query = 'SELECT * FROM quanlyhocsinh.HOTLINE WHERE `Cơ Sở` = \'?\'';
                        query = query.replace('?', $('.khuvuc').attr('value'));
                        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                            fn : 'hotline_loadsodienthoai',
                        });
                        break;
                    case 'hotline_reload':
                        query = 'SELECT * FROM quanlyhocsinh.HOTLINE WHERE `Cơ Sở` = \'?\'';
                        query = query.replace('?', $('.khuvuc').attr('value'));
                        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                            fn : 'hotline_loadsodienthoai',
                        });
                        break;
                    default:                        
                }
                
            }
        }

        if (hanhdong == 'loi-cu-phap') {
            if (dulieuguive != null) {
                switch (dulieuguive.fn) {
                    case 'hotline_addsodienthoai':
                        this.props.dispatch({
                            type: 'ALERT_NOTIFICATION_ADD',
                            content: 'Số điện thoại bị trùng trong cơ sở dữ liệu!',
                            notifyType: 'warning',
                        })
                        break;
                    default:                        
                }
                
            }
        }
    }

    componentDidMount () {
        let query;
        let that = this;
        window.addEventListener("resize", this.changeSize);
        this.changeSize();
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);

        query = 'SELECT * FROM quanlyhocsinh.HOTLINE WHERE `Cơ Sở` = \'?\'';
        query = query.replace('?', $('.khuvuc').attr('value'));
        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'hotline_loadsodienthoai',
        });
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.changeSize);
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentDidUpdate(prevProps, prevState) {
        this.changeSize();
    }

    dongy () {

    }

    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    }

    AddSoDienThoai () {
        let query = 'INSERT INTO `quanlyhocsinh`.`HOTLINE` (`Số Điện Thoại`, `Cơ Sở`) VALUES (\'?\', \'?\');';
        query = query.replace('?', this.sodienthoai.state.value);
        query = query.replace('?', $('.khuvuc').attr('value'));

        if (this.sodienthoai.state.value != '' && this.sodienthoai.state.value != null) {
            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                fn: 'hotline_addsodienthoai',
                ignoringError: true,
            });
    
            this.sodienthoai.setState({
                value: '',
            })
        } else {
            this.props.dispatch({
                type: 'ALERT_NOTIFICATION_ADD',
                content: 'Không được để trống ô nhập số điện thoại!',
                notifyType: 'warning',
            })
        }
    }

    HuyKichHoat (v) {
        let query = 'UPDATE `quanlyhocsinh`.`HOTLINE` SET `isActivated`=\'0\' WHERE `Số Điện Thoại`=\'?\';';
        query = query.replace('?', v);
        
        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn: 'hotline_reload',
        });
    }

    KichHoat (v) {
        let query = 'UPDATE `quanlyhocsinh`.`HOTLINE` SET `isActivated`=\'1\' WHERE `Số Điện Thoại`=\'?\';';
        query = query.replace('?', v);
        
        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn: 'hotline_reload',
        });
    }

    XoaSoDienThoai (v) {
        let query = 'DELETE FROM `quanlyhocsinh`.`HOTLINE` WHERE `Số Điện Thoại`=\'?\';';
        query = query.replace('?', v);

        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn: 'hotline_reload',
        });
    }

    render () {
        return (
            <div className={style.formstyle} ref="background">
                <div className="form_body" ref="body">
                    <div className="header">
                        { /*<img src="" alt="Icon Image"/> */}
                        <h2>Đường Dây Nóng</h2>
                    </div>
                    <div className="body">
                        <div className="divformstyle">
                            <div>
                                <fieldset style={{"padding": "0"}}>
                                    <legend style={{"text-align": "center"}}>Số Điện Thoại Đã Tồn Tại: </legend>
                                    <div style={{
                                        "height": "500px",
                                        "overflow-y": "scroll",
                                        "overflow-x": "hidden",
                                    }}>
                                    {
                                        this.state.phonenumber.map((v, i) => {
                                            let isActivated = 
                                                <input 
                                                    type="button"
                                                    value="Kích Hoạt"
                                                    onClick={this.KichHoat.bind(this, v['Số Điện Thoại'])}
                                                    style={{
                                                        "margin-right": "4px",
                                                    }}
                                                />
                                            if (v['isActivated'] == 1) {
                                                isActivated = 
                                                <input 
                                                    type="button"
                                                    value="Hủy Kích Hoạt"
                                                    onClick={this.HuyKichHoat.bind(this, v['Số Điện Thoại'])}
                                                    style={{
                                                        "margin-right": "4px",
                                                    }}    
                                                />;
                                            }
                                            return (
                                                <div style={{
                                                    'padding': '0',
                                                    'display': 'flex',
                                                }}>
                                                    <input
                                                        type="text" 
                                                        value={'0' + v['Số Điện Thoại']}
                                                        style={{
                                                            "margin-right": "4px",
                                                        }}
                                                    />
                                                    {isActivated}
                                                    <input 
                                                        type="button"
                                                        value="Xóa"
                                                        onClick={this.XoaSoDienThoai.bind(this, v['Số Điện Thoại'])}
                                                        style={{
                                                            "margin-right": "0",
                                                        }}
                                                    />
                                                </div>
                                            )
                                        })
                                    }
                                    </div>
                                </fieldset>
                            </div>
                            <div>
                                <SoDienThoai getMe={me => this.sodienthoai = me} multi={false}/>
                            </div>
                            <div>
                                <input type="button" value="Thêm Số Điện Thoại" onClick={this.AddSoDienThoai.bind(this)}/>
                            </div>
                        </div>
                    </div>
                    <div className="footer">
                        <input type="button" onClick={this.close.bind(this)} value="Thoát"/>
                        {/* <input type="button" onClick={this.dongy.bind(this)} value="Đồng Ý"/> */}
                    </div>
                </div>
            </div>
        )
    }
}

module.exports = connect(function (state) {
    return {
      socket: state.socket,
    };
  }) (Hotline);
