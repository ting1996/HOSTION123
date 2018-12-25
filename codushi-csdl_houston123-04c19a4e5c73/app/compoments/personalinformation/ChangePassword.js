import React from 'react';
import { connect } from 'react-redux';
import style from './style.css';
var ReactDOM = require('react-dom');
import SoDienThoai from '../form/elements/SoDienThoai';
import Webcam from '../form/elements/Webcam';

class ChangePassword extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            myinfo: [],
            type: null,
        }
        this.callBackDataFormDatabase = this.callBackDataFormDatabase.bind(this);
        this.changeSize = this.changeSize.bind(this);
    }

    changeSize () {
        if (window.innerHeight < this.refs.body.offsetHeight) {
            this.refs.background.style.paddingTop = '0px';
        } else {
            this.refs.background.style.paddingTop = ((window.innerHeight - this.refs.body.offsetHeight) / 2) + 'px';
        }
    }

    callBackDataFormDatabase (rows, hanhdong, dulieuguive ) {
        if (hanhdong == 'laydulieu_trave') {
            if (dulieuguive != null) {
                switch (dulieuguive.fn) {
                    default:                        
                }                
            }
        }  
    }

    componentDidMount () {
        window.addEventListener("resize", this.changeSize);
        this.changeSize();
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);

        if (this.props.data != null) {
            let data = null;
            if (this.props.data[0][0] != null) {
                this.props.data[0][0]['Mã'] = this.props.data[0][0]['Mã Quản Lý'];
                data = this.props.data[0][0];
                this.setState({
                    myinfo: this.props.data[0][0],
                    type: 'quanly',
                });
            } else if (this.props.data[1][0] != null) {
                this.props.data[1][0]['Mã'] = this.props.data[1][0]['Mã Giáo Viên'];
                data = this.props.data[1][0];
                this.setState({
                    myinfo: this.props.data[1][0],
                    type: 'giaovien',
                });
            } else {
                this.close();
                return;                
            }
        }
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.changeSize);
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentDidUpdate(prevProps, prevState) {
        this.changeSize();
    }

    dongy () {
        let that = this;
        let check = false;
        this.refs.matkhaucu.style.borderColor = 'black';
        this.refs.matkhaumoi.style.borderColor = 'black';
        this.refs.nhaplaimatkhau.style.borderColor = 'black';

        if(this.refs.matkhaucu.value.trim() == '') {
            check = true;
            this.refs.matkhaucu.style.borderColor = 'red';
        }

        if (this.refs.matkhaumoi.value.trim() == '') {
            check = true;
            this.refs.matkhaumoi.style.borderColor = 'red';
        }
        
        if (this.refs.nhaplaimatkhau.value.trim() == ''
        || this.refs.matkhaumoi.value.trim() != this.refs.nhaplaimatkhau.value.trim()) {
            check = true;
            this.refs.nhaplaimatkhau.style.borderColor = 'red';
        }

        if(!check) {
            $.ajax({
            url: '/doimatkhau',
            type: 'post',
            dataType: 'json',
            data: {
                oldpass: this.refs.matkhaucu.value.trim(),
                newpass: this.refs.nhaplaimatkhau.value.trim(),
            },
            statusCode: {
                200: function (response) {
                    that.props.dispatch({
                        type: 'ALERT_NOTIFICATION_ADD',
                        content: 'Đổi mật khẩu thành công!',
                        notifyType: 'information',
                    });
                    window.location = '/dangxuat';
                },
                401: function (response) {
                    that.props.dispatch({
                        type: 'ALERT_NOTIFICATION_ADD',
                        content: response.responseText,
                        notifyType: 'error',
                    });
                },
                500: function (response) {
                    that.props.dispatch({
                        type: 'ALERT_NOTIFICATION_ADD',
                        content: 'Lỗi sever không thể đổi mật khẩu!',
                        notifyType: 'warning',
                    });
                    window.location = '/dangxuat';
                }
            },
            success : function(response){
            }
            });
        }
    }

    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    }

    render () {
        let title = null;
        if (this.state.myinfo != null) {
            title = this.state.myinfo['Mã'] + ' - ' + this.state.myinfo['Họ Và Tên'];
        }
        
        return (
            <div className={style.formstyle2} ref="background">
                <div className={style.background} ref="body">
                    <div className={style.header}>
                        <h2>{title}</h2>
                    </div>
                    <div className={style.body}>
                        <div style={{
                            padding: '10px',
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                                <label
                                    style={{
                                        whiteSpace: 'nowrap',
                                    }}
                                >Mật khẩu cũ: </label>
                                <input type="password" ref="matkhaucu"/>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                                <label
                                    style={{
                                        whiteSpace: 'nowrap',
                                    }}
                                >Mật khẩu mới: </label>
                                <input type="password" ref="matkhaumoi"/>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                                <label
                                    style={{
                                        whiteSpace: 'nowrap',
                                    }}
                                >Nhập lại mật khẩu: </label>
                                <input type="password" ref="nhaplaimatkhau"/>
                            </div>
                        </div>
                        <div style={{
                            'padding': '5px 0px',
                            'margin': '0',
                            'display': 'grid',
                            'grid-template-columns': '20% 30% 30% 20%',
                            'grid-column-start': '1',
                            'grid-column-end': '3',
                        }}>
                            <div></div>
                            <input style={{
                                'margin': 'auto'
                            }} type="button" onClick={this.dongy.bind(this)} value="Đồng Ý"/>
                            <input style={{
                                'margin': 'auto'
                            }} type="button" onClick={this.close.bind(this)} value="Thoát"/>
                            <div></div>
                        </div>
                    </div>
                    <div className={style.footer}>
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
  }) (ChangePassword);
