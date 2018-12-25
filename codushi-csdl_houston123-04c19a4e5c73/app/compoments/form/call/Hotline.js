import React from 'react';
import { connect } from 'react-redux';
import style from '../style.css';
var ReactDOM = require('react-dom');
import Button from '../elements/Button';

class Hotline extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            danhsachhotline: [],
            btnDisable: true,
        }
        this.callBackDataFormDatabase = this.callBackDataFormDatabase.bind(this);
        this.SocketEmit = this.SocketEmit.bind(this);
        this.changeSize = this.changeSize.bind(this);
    }

    changeSize () {
        try {
            if (window.innerHeight < this.refs.body.offsetHeight) {
                this.refs.background.style.paddingTop = '0px';
            } else {
                this.refs.background.style.paddingTop = ((window.innerHeight - this.refs.body.offsetHeight) / 2) + 'px';
            }
        } catch (e) {
            
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
        if (hanhdong == 'laydulieu_trave') {
            if (dulieuguive != null) {
                switch (dulieuguive.fn) {
                    case 'form_call_loadhotline':
                        this.setState({
                            danhsachhotline: rows,
                            btnDisable: false,
                        });
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

        query = 'SELECT HOTLINE.*, DANHSACHDAUSONHAMANG.`Nhà Mạng` FROM HOTLINE ' +
        'LEFT JOIN DANHSACHDAUSONHAMANG ON ' +
        'HOTLINE.`Số Điện Thoại` LIKE CONCAT(DANHSACHDAUSONHAMANG.`Đầu Số`, \'%\') ' +
        'OR HOTLINE.`Số Điện Thoại` LIKE CONCAT(\'0\', DANHSACHDAUSONHAMANG.`Đầu Số`, \'%\') ' +
        'WHERE HOTLINE.`Cơ Sở` = \'!?!\' AND HOTLINE.`isActivated` = \'1\'; ';
        query = query.replace('!?!', $('.khuvuc').attr('value'));
        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'form_call_loadhotline',
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
        let sohotline = $('input[name=goidientuvan_sohotline]:checked').val();
        if (sohotline != null) {
            let softNetwork = '';
            let softNetwork_plane = '';
            this.state.danhsachhotline.map((v, i) => {
                if (v['Số Điện Thoại'] == sohotline) {
                    softNetwork = 'ORDER BY FIELD(`Nhà Mạng`, \'!\?!\') DESC ';
                    softNetwork_plane = ', FIELD(`Nhà Mạng`, \'!\?!\') DESC';
                    softNetwork = softNetwork.replace('!\?!', v['Nhà Mạng']);
                    softNetwork_plane = softNetwork_plane.replace('!\?!', v['Nhà Mạng']);
                }
            })

            try {
                this.props.onAgree(sohotline, softNetwork, softNetwork_plane);
            } catch (e) {
                this.close();
            }
        } else {
            this.props.dispatch({
                type: 'ALERT_NOTIFICATION_ADD',
                content: 'Vui lòng chọn hotline trước khi thực hiện cuộc gọi!',
                notifyType: 'warning',
            })
        }
    }

    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    }

    render () {
        return (
            <div className={style.formstyle} ref="background">
                <div className="form_body" ref="body">
                    <div className="header">
                        <h2>Chọn Hotline</h2>
                    </div>
                    <div className="body">
                        <div className="divformstyle">
                            <div>
                                <fieldset style={{
                                    "padding-right": "0",
                                    "padding-bottom": "0",
                                }}>
                                    <legend>Số Điện Thoại: </legend>
                                    <div style={{
                                        "padding": "0px",
                                        "height": "400px",
                                        "overflow-y": "scroll",
                                        "overflow-x": "hidden",
                                    }}>
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
                                                    {' 0' + v['Số Điện Thoại'] + ' (Nhà mạng: ' + v['Nhà Mạng'] + ')'}
                                                    <br/>
                                                </div>
                                            )
                                        })
                                    }
                                    </div>
                                </fieldset>
                            </div>
                            {this.props.filter}
                        </div>
                    </div>
                    <div className="footer">
                        <Button 
                            onClick={this.close.bind(this)}
                            value="Thoát"
                            icon="close"
                            style={{'float': 'right', 'margin-right': '10px',}}
                            disabled={this.state.btnDisable}
                        />
                        <Button 
                            onClick={this.dongy.bind(this)}
                            value="Đồng Ý"
                            icon="agree"
                            style={{'float': 'right', 'margin-right': '10px',}}
                            disabled={this.state.btnDisable}
                        />
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
