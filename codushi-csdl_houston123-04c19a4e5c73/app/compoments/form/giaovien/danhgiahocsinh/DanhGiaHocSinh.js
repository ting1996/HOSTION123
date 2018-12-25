import React from 'react';
import style from '../../style.css';
import { connect } from 'react-redux';
import Table from './Table.js';
var ReactDOM = require('react-dom');

class DanhGiaHocSinh extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tenlop: '',
            giaovien: '',
            hocsinh: [],
            malop: '',
            scoreType: null,
        };
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
        let that = this;
        if (hanhdong == 'laydulieu_trave' && dulieuguive != null) {
            switch (dulieuguive.fn) {
                case 'form_giaovien_danhgiahocsinh_loadInformation':
                    if (rows[0] != null && rows[0][0] != null) {
                        this.setState({
                            malop: rows[0][0]['Mã Lớp'],
                            scoreType: rows[0][0]['scoreType'],
                            tenlop: rows[0][0]['Mã Lớp'] + ' - ' + rows[0][0]['name'] + ' - Lớp ' + rows[0][0]['Lớp'],
                            giaovien: rows[0][0]['Mã Giáo Viên'] + ' - ' + rows[0][0]['Họ Và Tên'],
                            hocsinh: rows[1],
                        });
                    }
                    break;
                default:
                    break;
            }
        }
    }

    componentDidMount () {
        window.addEventListener("resize", this.changeSize);
        this.changeSize();
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);  
        var query = 'SELECT * '+
        'FROM ((LOPHOC '+
        'LEFT JOIN GIAOVIEN on GIAOVIEN.`Mã Giáo Viên` = LOPHOC.`Mã Giáo Viên`) '+
        'LEFT JOIN DANHSACHMONHOC ON DANHSACHMONHOC.`mamon` = LOPHOC.`Mã Môn Học`) '+
        'WHERE `Mã Lớp` = \'~\'; ';
        query += 'SELECT DANHSACHHOCSINHTRONGLOP.*, USERS.`Họ Và Tên` '+
        'FROM DANHSACHHOCSINHTRONGLOP '+
        'LEFT JOIN USERS ON DANHSACHHOCSINHTRONGLOP.`User ID` = USERS.`User ID` '+
        'WHERE DANHSACHHOCSINHTRONGLOP.`Mã Lớp` = \'~\' OR DANHSACHHOCSINHTRONGLOP.`Mã Lớp Chuyển` LIKE \'%~%\'; ';
        query = query.replace(/~/g, this.props.id);
        this.props.socket.emit('gui-query-den-database', query, 'laydulieu_trave', {
            fn: 'form_giaovien_danhgiahocsinh_loadInformation',
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
        this.bangdiem.accept();
    }

    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    }

    render () {
        var xhtml = this.state.hocsinh.length <= 0 ? 
            <p style={{"text-align": "center", "color": "#ff0000", "font-size" : "20px", "top": "0", }}> Lớp học không có học sinh... </p> : 
            <div style={{
                "padding": "0",
                "margin": "0",
            }} className={style.coustomtable}>
                <Table
                    getMe={(me) => this.bangdiem = me}
                    value={this.state.hocsinh}
                    buttonaccept={this.refs.dongy}
                    malop={this.state.malop }
                    scoreType={this.state.scoreType}
                    close={this.close.bind(this)}
                />
                <div>
                    <a>(*) Học sinh có màu xanh lục là học sinh chuyển từ lớp khác đến.</a>
                </div>
            </div>            
        return (
            <div className={style.formstyle} ref="background">
                <div className="form_body" ref="body" style={{"width": "1100px"}}>
                    <div className="header">
                        { /*<img src="" alt="Icon Image"/> */}
                        <h2>Bảng Điểm</h2>
                    </div>
                    <div className="body">
                        <div className="divformstyle">
                            <div>
                                <h2 style={{"text-align": "center"}}>{ this.state.tenlop }</h2>
                            </div>
                            <div>
                                <label for="Giáo Viên">Giáo Viên Phụ Trách: </label>
                                <input className="read_only" type="text" name="Giáo Viên" value={ this.state.giaovien } style={{"text-align": "center"}} disabled/>
                            </div>
                            <div>
                                <label for="">Danh Sách Học Sinh: </label>
                                {xhtml}
                            </div>   
                        </div>                     
                    </div>
                    <div className="footer">
                        <input type="button" onClick={this.close.bind(this)} value="Thoát"/>
                        <input type="button" onClick={this.dongy.bind(this)} value="Đồng Ý" ref='dongy'/>
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
  }) (DanhGiaHocSinh);;
