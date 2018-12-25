import React from 'react';
import { connect } from 'react-redux';
import style from '../../style.css';
var ReactDOM = require('react-dom');
import Calendar from '../../calendar/Calendar';
import Button from '../../elements/Button';

class LopHoc extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: '',
            giaovien: '',
            magiaovien: '',
            ngaybatdau: null,
            ngayketthuc: null,
            count: 0,
            lichhoc: [],
            hocsinh: [],
            hocsinhtrongngay: [],
            arrayChangedSchedule:[],
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
                    case 'information_monhoc_lop':
                        let title = rows[0]['Mã Lớp'] + ' - ' + rows[0]['name'] + ' - Lớp ' + rows[0]['Lớp'];
                        this.calendar.localCalendar(rows[0]['Ngày Bắt Đầu'], rows[0]['Ngày Kết Thúc'], rows);
                        let count = (new Date(rows[0]['Ngày Kết Thúc']) - new Date(rows[0]['Ngày Bắt Đầu']))/86400000;
                        this.refs.back.hidden = true;
                        this.setState({
                            title: title,
                            giaovien: rows[0]['Họ Và Tên'],
                            magiaovien: rows[0]['Mã Giáo Viên'],
                            lichhoc: rows,
                            ngaybatdau: rows[0]['Ngày Bắt Đầu'],
                            ngayketthuc: rows[0]['Ngày Kết Thúc'],
                            count: count,
                        })
                        break;
                    case 'information_monhoc_hocsinh':
                        this.setState({hocsinh: rows, hocsinhtrongngay: rows});
                        break;
                    case 'information_lichthaydoi':
                        let array =[];
                        for(let v of rows)
                        {
                            let offset= -6;
                            let giobatdauchuyentoi = (parseInt(v['Giờ Bắt Đầu Chuyển Tới'].split(':')[0]) + offset) * 2;
                            if (v['Giờ Bắt Đầu Chuyển Tới'].split(':')[1] >= 30) {
                            giobatdauchuyentoi++;
                            }
                            let giobatdautruocdo = (parseInt(v['Giờ Bắt Đầu Trước Đó'].split(':')[0]) + offset) * 2;
                            if (v['Giờ Bắt Đầu Trước Đó'].split(':')[1] >= 30) {
                            giobatdautruocdo++;
                            }
                            let lichthaydoi = {
                                malop:v['Mã Lớp'],
                                ngaychuyentoi:new Date(v['Ngày Chuyển Tới']).toLocaleDateString('zh-Hans-CN').replace(/\//g,'-'),
                                giobatdauchuyentoi:giobatdauchuyentoi,
                                ngaytruocdo:new Date(v['Ngày Trước Đó']).toLocaleDateString('zh-Hans-CN').replace(/\//g,'-'),
                                giobatdautruocdo:giobatdautruocdo,
                                thoiluongday:v['Thời Lượng Dạy'],
                                }
                            array.push(lichthaydoi)
                        }
                        
                        this.setState({arrayChangedSchedule:array})

                        this.resetCalendar();
                        break;
                    default:
                        
                }
                
            }
        }  
    }

    componentDidMount () {
        let query;
        window.addEventListener("resize", this.changeSize);
        this.changeSize();
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);

        query = 'SELECT LOPHOC.`Mã Lớp`, ' +
        'LICHHOC.`Mã Phòng Học`, ' +
        'LICHHOC.`Thời Gian Sử Dụng Phòng`, ' +
        'LICHHOC.`Thứ`, ' +
        'LICHHOC.`Giờ Bắt Đầu`, ' +
        'LICHHOC.`Giờ Kết Thúc`, ' +
        'LOPHOC.`Mã Môn Học`, ' +
        'DANHSACHMONHOC.`name`, ' +
        'LOPHOC.`Mã Giáo Viên`, ' +
        'GIAOVIEN.`Họ Và Tên`, ' +
        'LOPHOC.`Ngày Bắt Đầu`, ' +
        'LOPHOC.`Ngày Kết Thúc`, ' +
        'LOPHOC.`Lớp` ' +
        'FROM (((quanlyhocsinh.LOPHOC ' +
        'LEFT JOIN quanlyhocsinh.DANHSACHMONHOC ON DANHSACHMONHOC.`mamon` = LOPHOC.`Mã Môn Học`) ' + 
        'LEFT JOIN quanlyhocsinh.GIAOVIEN ON GIAOVIEN.`Mã Giáo Viên` = LOPHOC.`Mã Giáo Viên`) ' +
        'LEFT JOIN quanlyhocsinh.LICHHOC ON LICHHOC.`Mã Lớp` = LOPHOC.`Mã Lớp`) ' +
        'WHERE LOPHOC.`Mã Lớp` = \'!\?!\'';
        query = query.replace('!\?!', this.props.classid);
        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'information_monhoc_lop',
        });

        query = 'SELECT DANHSACHHOCSINHTRONGLOP.*, USERS.`Họ Và Tên` ' +
        'FROM DANHSACHHOCSINHTRONGLOP ' +
        'LEFT JOIN USERS ON DANHSACHHOCSINHTRONGLOP.`User ID` = USERS.`User ID` ' +
        'WHERE DANHSACHHOCSINHTRONGLOP.`Mã Lớp` = \'~\' ' +
        'OR DANHSACHHOCSINHTRONGLOP.`Thời Gian Chuyển` LIKE \'%"malopchuyen":"~"%\'';        
        query = query.replace(/~/g, this.props.classid);
        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'information_monhoc_hocsinh',
        });

        query ='SELECT * FROM LICHHOCTHAYDOI '+
                'WHERE `Mã Lớp` = \'~\''
        query = query.replace('~', this.props.classid);
        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'information_lichthaydoi',
        });
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.changeSize);
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentDidUpdate(prevProps, prevState) {
        this.changeSize();
    }

    resetCalendar()
    {
        let ngaybatdau = new Date(this.state.ngaybatdau);
        let ngayketthuc = new Date(this.state.ngayketthuc);
        this.calendar.localCalendar(ngaybatdau.toISOString(), ngayketthuc.toISOString(), this.state.lichhoc)
    }

    nextCalendar () {
        let ngaybatdau = new Date(this.state.ngaybatdau);
        let ngayketthuc = new Date(this.state.ngayketthuc);
        let nextSunday = 7 - ngaybatdau.getDay();
        this.refs.back.hidden = false;
        ngaybatdau.setDate(ngaybatdau.getDate() + nextSunday);
        
        if ((ngayketthuc - ngaybatdau)/86400000 <= 7) {
            this.refs.next.hidden = true;
        }
        
        this.calendar.localCalendar(ngaybatdau.toISOString(), ngayketthuc.toISOString(), this.state.lichhoc)

        this.setState({
            ngaybatdau: ngaybatdau.toISOString(),
        })
    }

    backCalendar () {
        let ngaybatdau = new Date(this.state.ngaybatdau);
        let ngayketthuc = new Date(this.state.ngayketthuc);
        let count = this.state.count;
        this.refs.next.hidden = false;

        let sub = count - ((ngayketthuc - ngaybatdau)/86400000);
        if (sub > 7) {
            ngaybatdau.setDate(ngaybatdau.getDate() - 7);
        } else {
            ngaybatdau.setDate(ngaybatdau.getDate() - sub);
            this.refs.back.hidden = true;
        }

        this.calendar.localCalendar(ngaybatdau.toISOString(), ngayketthuc.toISOString(), this.state.lichhoc);
        this.setState({
            ngaybatdau: ngaybatdau.toISOString(),
        })
    }

    calendarClick (thutrongtuan, giobatdau) {
        let curr = new Date(this.state.ngaybatdau); // get current date
        let first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
        let last = first + 6; // last day is the first day + 6
        let firstday = new Date(curr.setDate(first));
        firstday.setDate(firstday.getDate() + (thutrongtuan - 1));

        let hocsinh = this.state.hocsinh;
        let newlisthocsinh = [];
        for (let val of hocsinh) {
            let malop = val['Mã Lớp'];
            if (malop == this.props.classid) {
                if (newlisthocsinh.indexOf(val) == -1) {
                    newlisthocsinh.push(val);
                }
            } else {
                try {
                    let thoigianchuyen = JSON.parse(val['Thời Gian Chuyển']);
                    for (let _chuyenlop of thoigianchuyen) {
                        if (_chuyenlop.malopchuyen == this.props.classid) {
                            if (_chuyenlop.repeat) {
                                if (_chuyenlop.thuchuyentoi == thutrongtuan) {
                                    for (let val2 of this.state.lichhoc) {
                                        if (val2['Thứ'] == _chuyenlop.thuchuyentoi) {
                                            if (giobatdau >= val2['Giờ Bắt Đầu']
                                            && giobatdau <= val2['Giờ Kết Thúc']
                                            && _chuyenlop.giochuyentoi == val2['Giờ Bắt Đầu']) {        
                                                if (newlisthocsinh.indexOf(val) == -1) {
                                                    newlisthocsinh.push(val);
                                                }
                                            }
                                        }
                                    }
                                }
                            } else {
                                
                            }
                        }
                    }
                } catch (e) {
                    
                }
            }
        }
        this.setState({hocsinhtrongngay: newlisthocsinh});
    }

    dongy () {
    }

    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    }

    render () {
        let curr = new Date(this.state.ngaybatdau); // get current date
        let first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
        let last = first + 6; // last day is the first day + 6
        let firstday = new Date(curr.setDate(first));
        firstday = ("0" + firstday.getDate()).slice(-2) + '/' + ("0" + (firstday.getMonth() + 1)).slice(-2) + '/' + firstday.getFullYear();
        let lastday = new Date(curr.setDate(last));
        lastday = ("0" + lastday.getDate()).slice(-2) + '/' + ("0" + (lastday.getMonth() + 1)).slice(-2) + '/' + lastday.getFullYear();
        let rangedate = 'Từ ';
        rangedate += firstday + ' đến ' + lastday;

        return (
            <div className={style.formstyle} ref="background">
                <div className="form_body" ref="body" style={{'width': '1100px'}}>
                    <div className="header">
                        <h2>Thông Tin Lớp Học</h2>
                    </div>
                    <div className="body">
                        <div className="divformstyle">
                        <div>
                            <h2 style={{'margin': '0', 'text-align': 'center',}}>
                                {this.state.title}
                            </h2>
                        </div>
                        <div>
                            <label for="Giáo Viên">Giáo Viên Phụ Trách: </label>
                            <input className="read_only" type="text" name="Giáo Viên" value={this.state.magiaovien + ' - ' + this.state.giaovien} style={{"text-align": "center"}} disabled/>
                        </div>
                        <div style={{
                            'display': 'grid',
                            'grid-template-columns': '10% 80% 10%',
                        }}>
                            <div style={{"padding": "0"}}>
                                <div onClick={this.backCalendar.bind(this)} className="button" ref="back" style={{"padding": "0", "float": "left", 'padding-left': '20px'}}>
                                    <i class="fa fa-chevron-circle-left fa-2x" aria-hidden="true"></i>
                                </div> 
                            </div>
                            <h3 style={{'margin': '0', 'text-align': 'center',}}>{rangedate}</h3>
                            <div style={{"padding": "0"}}>
                                <div onClick={this.nextCalendar.bind(this)} className="button" ref="next" style={{"padding": "0", "float": "right", 'padding-right': '20px'}}>
                                    <i class="fa fa-chevron-circle-right fa-2x" aria-hidden="true"></i>
                                </div>
                            </div>
                        </div>
                        <div style={{
                            'display': 'grid',
                            'grid-template-columns': '35% 65%'
                        }}>
                            <div style={{"padding": "0", }}>
                                <fieldset style={{"padding": "0", }}>
                                    <legend>Danh Sách Học Sinh Trong Lớp: </legend>
                                    <div style={{
                                        "padding": "0",
                                        'overflow-y': 'scroll',
                                        'overflow-x': 'hidden',
                                        'height': '565px',
                                    }}>
                                    {
                                        this.state.hocsinhtrongngay.map((val, index) => {
                                            let color = 'lightblue';
                                            let content = ''
                                            if (val['Mã Lớp'] != this.props.classid) {
                                                color = 'lightgreen';
                                                content = '(Lớp hiện tại: ' + val['Mã Lớp'] + ')';
                                            }
                                            return (
                                                <div style={{
                                                    'background': color, 
                                                    'margin': '10px 5px',
                                                    'padding': '10px 16px',
                                                }} key={index}>
                                                    {val['User ID'] + ' - ' + val['Họ Và Tên']}<br/>
                                                    {content}
                                                </div>
                                            )
                                        })
                                    }
                                    </div>
                                </fieldset>                       
                            </div>
                            <Calendar
                                getMe={me => (this.calendar = me)}
                                calendarClick={this.calendarClick.bind(this)}
                                action='view'
                                arrayChangedSchedule={this.state.arrayChangedSchedule}
                                infoLichHoc = {this.state.lichhoc}
                            />
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
  }) (LopHoc);
