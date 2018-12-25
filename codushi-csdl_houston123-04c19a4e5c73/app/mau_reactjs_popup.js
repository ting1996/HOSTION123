import React from 'react';
import { connect } from 'react-redux';
import style from '../../style.css';
var ReactDOM = require('react-dom');

class DangKyMonHoc extends React.Component {
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
                    case 'dangkymonhoc_loaddanhsachmonhoc':
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

        // console.log(this.props.userid);
        // query = 'SELECT * FROM quanlyhocsinh.MONHOC';
        // this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
        //     fn : 'dangkymonhoc_loaddanhsachmonhoc',
        // });
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
        try {
            this.props.onClose();
        } catch (e) {
            
        }
    }

    render () {
        return (
            <div className={style.formstyle} ref="background">
                <div className="form_body popup" ref="body">
                    <div className="header">
                        <h2 style={{'margin': '5px', 'color': '#444'}}>Học Sinh Đang Học Tại H123</h2>
                        <div onClick={this.close.bind(this)} style={{
                            'position': 'absolute',
                            'top': '10px',
                            'right': '10px',
                            'color': '#444',
                            'text-shadow': '1px 1px 4px #ccc',
                        }}>
                            <i class="fa fa-times fa-lg" aria-hidden="true"></i>
                        </div>
                    </div>
                    <div className="body">
                        
                    </div>
                </div>
            </div>
        )
    }
}

module.exports = connect(function (state) {
    return {
      socket: state.socket,
      userInfo: state.userinformation,
    };
}) (DangKyMonHoc);
