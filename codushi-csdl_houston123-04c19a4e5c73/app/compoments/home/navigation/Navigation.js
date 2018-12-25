import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';
import store from 'store';
import style from './style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBars,
    faBell,
    faSignOutAlt,
    faWrench,
    faAddressCard,
    faSearch,
} from '@fortawesome/free-solid-svg-icons';

class Navigation extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            image: 'img/h123er.png',
            imageUrl: null,
        }
        this.callBackDataFormDatabase = this.callBackDataFormDatabase.bind(this);
        this.callBackWebDav = this.callBackWebDav.bind(this);
        this.SocketEmit = this.SocketEmit.bind(this);
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
                    case 'home_navigation_loadsuathongtincanhan':
                        let ThongTinCaNhan = require('../../personalinformation/PersonalInformation');
                        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                        ReactDOM.render(
                            <Provider store={store}>
                                <ThongTinCaNhan data={rows}/>
                            </Provider>,
                            document.getElementById('form-react')            
                        );
                        break;
                    case 'home_navigation_loaddoimatkhau': {
                        let ChangePassword = require('../../personalinformation/ChangePassword');
                        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                        ReactDOM.render(
                            <Provider store={store}>
                                <ChangePassword data={rows}/>
                            </Provider>,
                            document.getElementById('form-react')            
                        );
                    } break;
                    default:                        
                }
            }
        }  
    }

    callBackWebDav (data, err) {
        switch (data.key) {
            case 'home_navigation_icon': {
                let image = 'img/h123er.png';
                if (!err) {
                    let arrayBufferView = data.buffer;
                    let blob = new Blob( [ arrayBufferView ], { type: data.imageType } );
                    let urlCreator = window.URL || window.webkitURL;
                    let imageUrl = urlCreator.createObjectURL( blob );
                    image = imageUrl;
                }
                this.setState({
                    image: image,
                })
            } break;
            default:                        
        }
    }

    componentDidMount () {
        this.props.socket.on('webdav', this.callBackWebDav);
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentWillUnmount() {
        this.props.socket.off('webdav', this.callBackWebDav);
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.imageUrl != this.props.userIcon) {
            this.props.socket.emit('webdav', {
                fn: 'read',
                url: '/Public/img/avatar/' + this.props.userIcon,
                key: 'home_navigation_icon',
                imageType: 'image/jpeg',
            });
            this.setState({imageUrl: this.props.userIcon});
        }
    }

    render () {
        return (
            <div className={style.container}>
                <div className={style.left}>
                    <div
                        className={style.menu + ' ' + style.button}
                        onClick={() => {
                            try {
                                this.props.onMenuClick();
                            } catch (error) {
                                
                            }
                        }}
                    >
                        <FontAwesomeIcon icon={faBars}/>
                        <div style={{padding: '5px'}} className={style.text}>
                            {'  Thực Đơn'}
                        </div>
                    </div>
                </div>
                <div className={style.middle}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                    }}>
                        <div className={style.middleEffect + ' ' + style.search}>
                            <div style={{
                                background: '#ffffff99',
                                borderRadius: '20px',
                                padding: '2px 5px',
                            }}>
                                <FontAwesomeIcon icon={faSearch}/>
                                <input 
                                    className={style.searchInput}
                                    placeholder="@tên, #số điện thoại..."
                                    type="text"
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        borderBottom: '1px dashed #fff',
                                        outline: 'none',
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                    }}>
                        <div className={style.middleEffect + ' ' + style.pageStatus}>
                            {this.props.title}
                        </div>
                    </div>
                </div>
                <div className={style.right}>
                    <div
                        className={style.userfn}
                        style={{padding: '0px 5px', height: 'inherit', position: 'relative'}}
                    >
                        <img src={this.state.image} style={{
                            height: '35px',
                            width: '35px',
                            borderRadius: '100%',
                        }}/>
                        <div style={{padding: '5px'}} className={style.text}>
                            {this.props.userName}
                        </div>
                        <div className={style.menuUser}>
                            <div 
                                className={style.button}
                                onClick={() => {
                                    let query = 'SELECT * FROM quanlyhocsinh.QUANLY WHERE `Mã Quản Lý` = \'?\'; ' +
                                    'SELECT * FROM quanlyhocsinh.GIAOVIEN WHERE `Mã Giáo Viên` = \'?\';';
                                    query = query.replace(/\?/g, this.props.id);
                                    this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                                        fn: 'home_navigation_loadsuathongtincanhan',
                                    });
                                }}
                            >
                                <FontAwesomeIcon icon={faAddressCard}/>
                                {'  Thông Tin Cá Nhân'}
                            </div>
                            <div 
                                className={style.button}
                                onClick={() => {
                                    let query = 'SELECT * FROM quanlyhocsinh.QUANLY WHERE `Mã Quản Lý` = \'?\'; ' +
                                    'SELECT * FROM quanlyhocsinh.GIAOVIEN WHERE `Mã Giáo Viên` = \'?\';';
                                    query = query.replace(/\?/g, this.props.id);
                                    this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                                        fn: 'home_navigation_loaddoimatkhau',
                                    });
                                }}
                            >
                                <FontAwesomeIcon icon={faWrench}/>
                                {'  Đổi Mật Khẩu'}
                            </div>
                            <div 
                                className={style.button}
                                onClick={() => {window.location.replace('/dangxuat');}}
                            >
                                <FontAwesomeIcon icon={faSignOutAlt}/>
                                {'  Đăng Xuất'}
                            </div>
                        </div>
                    </div>
                    <div
                        className={style.notification + ' ' + style.button}
                        onClick={() => {
                            try {
                                this.props.onNotificationClick();
                            } catch (error) {
                                
                            }
                        }}
                    >
                        <FontAwesomeIcon icon={faBell}/>
                        <div style={{padding: '5px'}} className={style.text}>
                            {'  Thông Báo'}
                        </div>
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
}) (Navigation);
