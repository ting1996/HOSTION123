import React from 'react';
import { connect } from 'react-redux';
import style from '../style.css';
var ReactDOM = require('react-dom');
import mystyle from './style.css';
import HocPhi from './HocPhi';
import DichVu from './DichVu';
import ChuongTrinhHoc from './ChuongTrinhHoc';
import DuTru from './DuTru';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faQuestion,
    faBook,
    faArchive,
    faMoneyBill,
    faClipboardList,
} from '@fortawesome/free-solid-svg-icons';

class BieuPhi extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            listMenu: [
                {value: 'Học Phí', icon: faBook, tab: <HocPhi />},
                {value: 'Chương Trình Học', icon: faArchive, tab: <ChuongTrinhHoc />},
                {value: 'Dịch Vụ', icon: faMoneyBill, tab: <DichVu />},
                {value: 'Dự Trù', icon: faClipboardList, tab: <DuTru />},
            ],
            tabContent: <div style={{
                'margin': '330px auto',
                'font-size': 'x-large',
                'color': '#999',
            }}>
                Vui lòng chọn mục...
            </div>,
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
                        console.log(rows);
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
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    }

    render () {
        return (
            <div className={style.formstyle} ref="background">
                <div className="form_body" ref="body" style={{'width':'1100px'}}>
                    <div className="header">
                        { /*<img src="" alt="Icon Image"/> */}
                        <h2>Biểu Phí</h2>
                    </div>
                    <div className="body">
                        <div style={{
                            'display': 'grid',
                            'grid-template-columns': '250px calc(100% - 250px)',
                            'height': '700px',
                        }}>
                            <div className={mystyle.menu}>
                                {
                                    this.state.listMenu.map((v, i) => {
                                        let sty = mystyle.option;
                                        let a;
                                        if (v.selected == true) {
                                            sty = mystyle.selected;
                                            a = <div style={{
                                                'float': 'right',
                                                'margin-right': '4px',
                                            }}>
                                                <i class="fa fa-caret-left fa-lg" aria-hidden="true"/>
                                            </div>
                                        }
                                        let icon = faQuestion;
                                        if (v.icon != null) {
                                            icon = v.icon;
                                        }
                                        return (
                                            <div 
                                                className={sty}
                                                onClick={() => {
                                                    let listMenu = this.state.listMenu;
                                                    listMenu.map((v1, i1) => {
                                                        if (i1 == i) {
                                                            v1.selected = true;
                                                        } else {
                                                            v1.selected = false;
                                                        }
                                                    })
                                                    this.setState({
                                                        listMenu: listMenu,
                                                        tabContent: v.tab,
                                                    });
                                                }}
                                            >
                                                <FontAwesomeIcon icon={icon}/>
                                                {'   ' + v.value}
                                                {a}
                                            </div>
                                        );
                                    })
                                }
                            </div>
                            <div className={mystyle.content}>
                                {this.state.tabContent}
                            </div>
                        </div>
                    </div>
                    <div className="footer">
                        <input type="button" onClick={this.close.bind(this)} value="Thoát"/>
                        <input type="button" onClick={this.dongy.bind(this)} value="Đồng Ý"/>
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
}) (BieuPhi);
