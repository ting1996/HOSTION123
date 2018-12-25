import React from 'react';
import { connect } from 'react-redux';
import style from '../../style.css';
var ReactDOM = require('react-dom');
import HocSinhTraiBuoi from './HocSinhTraiBuoi';
import Button from '../../elements/Button';

class XepLichTraiBuoi extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hocsinhtronglop: [],
            lophoccothehoc: [],
            giaovien: [],
            giohoc: [],
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
                    case 'xeplichhoctraibuoi_hocsinhtronglop':
                        this.setState({hocsinhtronglop: rows});
                        break;
                    case 'xeplichhoctraibuoi_laylophoc':
                        this.setState({lophoccothehoc: rows});
                        let checkgv = [];
                        for (let val of rows) {
                            if (checkgv.indexOf(val['Mã Giáo Viên']) == -1) {
                                checkgv.push(val['Mã Giáo Viên']);
                                this.setState({giaovien: this.state.giaovien.concat(val)});
                            }
                        }
                        break;
                    case 'xeplichhoctraibuoi_laygiohoc':
                        this.setState({giohoc: rows});
                        break;
                    default:
                        
                }
                
            }
        }  
    }

    componentDidMount () {
        let query;
        let that = this;
        let socket = this.props.socket;
        window.addEventListener("resize", this.changeSize);
        this.changeSize();
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);

        query = 'SELECT * FROM USERS WHERE ' +
        'EXISTS(SELECT * FROM DANHSACHHOCSINHTRONGLOP WHERE `User ID` = USERS.`User ID` AND `Mã Lớp` = \'!\?!\')';
        query = query.replace('!\?!', this.props.data['Mã Lớp']);
        socket.emit('gui-query-den-database', query, 'laydulieu_trave', {
            fn : 'xeplichhoctraibuoi_hocsinhtronglop'
        });

        query = 'SELECT LOPHOC.`Mã Lớp`, '+
        'LOPHOC.`Mã Môn Học`, '+
        'DANHSACHMONHOC.`name` AS `Tên Môn`, '+
        'LOPHOC.`Mã Giáo Viên`, '+
        'GIAOVIEN.`Họ Và Tên`, '+
        'demhocsinh.`Số Lượng Học Sinh` '+
        'FROM (((LOPHOC '+
        'LEFT JOIN DANHSACHMONHOC ON DANHSACHMONHOC.`mamon` = LOPHOC.`Mã Môn Học`) '+
        'LEFT JOIN GIAOVIEN ON GIAOVIEN.`Mã Giáo Viên` = LOPHOC.`Mã Giáo Viên`) '+
        'LEFT JOIN (SELECT DANHSACHHOCSINHTRONGLOP.`Mã Lớp`, ' +
        'COUNT(DANHSACHHOCSINHTRONGLOP.`Mã Lớp`) AS `Số Lượng Học Sinh` ' +
        'FROM DANHSACHHOCSINHTRONGLOP ' +
        'GROUP BY DANHSACHHOCSINHTRONGLOP.`Mã Lớp`) AS demhocsinh ' +
        'ON demhocsinh.`Mã Lớp` = LOPHOC.`Mã Lớp`) ' +
        'WHERE LOPHOC.`Mã Môn Học` = \'!\?!\' ' + 
        'AND LOPHOC.`Mã Lớp` != \'!\?!\' ' + 
        'AND LOPHOC.`Ngày Kết Thúc` >= CURDATE()';
        query = query.replace('!\?!', this.props.data['Mã Môn Học']);
        query = query.replace('!\?!', this.props.data['Mã Lớp']);
        // query = query.replace(/\?/g, $('.khuvuc').attr('value'));
        socket.emit('gui-query-den-database', query, 'laydulieu_trave', {
            fn : 'xeplichhoctraibuoi_laylophoc'
        });

        query = 'SELECT * FROM LICHHOC WHERE `Mã Lớp` = \'?\' ORDER BY `Thứ` ASC'
        query = query.replace('?', this.props.data['Mã Lớp']);
        socket.emit('gui-query-den-database', query, 'laydulieu_trave', {
            fn : 'xeplichhoctraibuoi_laygiohoc'
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
        this.state.hocsinhtronglop.map((value, index) => {
            this['hocsinh' + index].dongy();
        });
    }
    
    checkBusy () {
        let index = 0;
        for (let val of this.state.hocsinhtronglop) {
            if (this['hocsinh' + index].state.isBusy == true) {
                break;
            }
            index++;
        }
        
        if (this.state.hocsinhtronglop.length == index) {
            ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
        }
    }

    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    }

    render () {
        let title = '';
        title = this.props.data['Mã Lớp'] + ' - ' + this.props.data['Tên Môn'] + ' - Lớp ' + this.props.data['Lớp'];

        return (
            <div className={style.formstyle} ref="background">
                <div className="form_body" ref="body">
                    <div className="header">
                        { /*<img src="" alt="Icon Image"/> */}
                        <h2>Xếp Lịch Học Cho Học Sinh Trái Buổi</h2>
                    </div>
                    <div className="body">
                        <div className="divformstyle">
                            <div style={{'text-align': 'center'}}>
                                <h3 style={{'margin': '5px'}}>{title}</h3>
                            </div>
                        </div>
                        <div className="divformstyle">
                            <div style={{
                                'max-height': '600px',
                                'overflow-y': 'auto',
                                'overflow-x': 'hidden',
                            }}>
                                {
                                    this.state.hocsinhtronglop.map((value, index) => {
                                        return (
                                            <HocSinhTraiBuoi 
                                                socket={this.props.socket} 
                                                data={value} 
                                                getMe={me => (this['hocsinh' + index] = me)} 
                                                lophoc={this.state.lophoccothehoc}
                                                giaovien={this.state.giaovien}
                                                giohoc={this.state.giohoc}
                                                malop={this.props.data['Mã Lớp']}
                                                checkBusy={this.checkBusy.bind(this)}
                                                onChange={this.changeSize}
                                            />
                                        )
                                    })
                                }
                            </div>
                        </div>
                    </div>
                    <div className="footer">
                        <Button 
                            onClick={this.close.bind(this)}
                            value="Thoát"
                            icon="close"
                            style={{'float': 'right', 'margin-right': '10px',}}
                        />
                        <Button 
                            onClick={this.dongy.bind(this)}
                            value="Đồng Ý"
                            icon="agree"
                            style={{'float': 'right', 'margin-right': '10px',}}
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
  }) (XepLichTraiBuoi);
