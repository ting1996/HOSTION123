import React from 'react';
var { Provider } = require('react-redux');
var store = require('store');
import { connect } from 'react-redux';
import style from '../../style.css';
import mystyle from './mystyle.css';
var ReactDOM = require('react-dom');

class SelectGhiDanh extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

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
        if (hanhdong == 'laydulieu_trave') {
            if (dulieuguive != null) {
                switch (dulieuguive.fn) {
                    case 'hocsinh_ghidanh_selectghidanh_loaddanhsachmonhoc':
                    default:                        
                }
                
            }
        }  
    }

    componentDidMount () {
        window.addEventListener("resize", this.changeSize);
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
        this.changeSize();
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.changeSize);
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    }

    dangkyhangngay () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
        let ThemDangKyHangNgay = require('../../chamsockhachhang/dangkyhangngay/ThemDangKyHangNgay');
        ReactDOM.render(
            <Provider store={store}>
                <ThemDangKyHangNgay action="add"/>
            </Provider>,
            document.getElementById('form-react')            
        );
    }

    ghidanh () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
        let ThemUser = require('../../hocsinh/ghidanh/GhiDanh');
        ReactDOM.render(
            <Provider store={store}>
                <ThemUser action="add"/>
            </Provider>,
            document.getElementById('form-react')            
        );
    }

    hocthu () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
        let ThemUser = require('../../hocsinh/ghidanh/GhiDanh');
        ReactDOM.render(
            <Provider store={store}>
                <ThemUser action="add" hocthu={true}/>
            </Provider>,
            document.getElementById('form-react')            
        );
    }

    render () {
        return (
            <div className={style.formstyle} ref="background">
                <div className="form_body" ref="body">
                    <div className="header">
                        { /*<img src="" alt="Icon Image"/> */}
                        <h2>Ghi Danh</h2>
                    </div>
                    <div className="body">
                        <div style={{
                            "display": "grid",
                            "grid-template-columns": "33.33% 33.33% 33.33%",
                        }}
                            className={mystyle.selectGhiDanh}
                        >
                            <div className={mystyle.buttonSelect} onClick={this.dangkyhangngay.bind(this)}>
                                <div>
                                    <img src="img/dailyRegistered.png" height="100px"></img>
                                </div>
                                <br/>
                                <h3>Đăng Ký Hằng Ngày</h3>
                            </div>
                            <div className={mystyle.buttonSelect} onClick={this.ghidanh.bind(this)}>
                                <div>
                                    <img src="img/registered.png" height="100px"></img>
                                </div>
                                <br/>
                                <h3>Nhập Học</h3>
                            </div>
                            <div className={mystyle.buttonSelect} onClick={this.hocthu.bind(this)}>
                                <div>
                                    <img src="img/tryout.png" height="100px"></img>
                                </div>
                                <br/>
                                <h3>Học Thử</h3>
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
}) (SelectGhiDanh);
