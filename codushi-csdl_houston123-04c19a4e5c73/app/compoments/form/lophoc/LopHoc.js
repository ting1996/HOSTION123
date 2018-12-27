import React from 'react';
import { connect } from 'react-redux';
import style from '../style.css';
import mystyle from './mystyle.css'
import Calendar from '../calendar/Calendar.js';
import Select from 'react-select';
import Lop from '../elements/Lop';
import Button from '../elements/Button';
var ReactDOM = require('react-dom');
let time_countdown2 = 0;
function thongbaothanhcong() {
    $('.successed_function').show();
    if ( time_countdown2 <= 0 ) {
        time_countdown2 = 2;
        var timer2 = setInterval(function() {
            time_countdown2--;
            if (time_countdown2 < 0) {
                clearInterval(timer2);
                $('.successed_function').hide();
                $('.loading2').hide();
                ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
            }
        }, 500);
    } else {
        time_countdown2 = 2;
    }
}
let time_countdown3 = 0;
function thongbaothanhcong2() {
    $('.successed_function').show();
    if ( time_countdown3 <= 0 ) {
        time_countdown3 = 2;
        var timer2 = setInterval(function() {
            time_countdown3--;
            if (time_countdown3 < 0) {
                clearInterval(timer2);
                $('.successed_function').hide();
            }
        }, 500);
    } else {
        time_countdown3 = 2;
    }
}

class LopHoc extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            danhsachgiaovien: [],
            danhsachmonhoc: [],
            danhsachmail: {},
            giaovienselect: null,
            email: null,
            fisttime: null,
            tatcacaclop: false,
            hocsinhchuacolop: [],
            hocsinhtronglop: [],
            listidEvent: [],
            maphonghoc: $('.khuvuc').attr('value') + 'P001',
            lichhoc:[],
            malopold: null,
            lopold: null,
            monhocold: null,
            magiaovienold: null,
            ngaybatdauold: null,
            ngayketthucold: null,
            themhocsinhvaolop: [],
            xoahocsinhkhoilop: [],
            arrayChangedSchedule:[],
            btnDisable: false,
            isFromGoogle: false,
        }
        this.callBackGoogleApi = this.callBackGoogleApi.bind(this);
        this.callBackDataFormDatabase = this.callBackDataFormDatabase.bind(this);
        this.updateHocSinhTrongLop = this.updateHocSinhTrongLop.bind(this);
        this.updateLichHoc = this.updateLichHoc.bind(this);
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
        if (arguments[0] == 'gui-query-den-database'
        || arguments[0] == 'googleapi') {
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

    updateHocSinhTrongLop () {
        let them = this.state.themhocsinhvaolop;
        let xoa = this.state.xoahocsinhkhoilop;
        let query = '';
        if ((them.length + xoa.length) > 0) {
            if (them.length > 0) {
                let x = them;
                for (let i = 0; i < x.length; i++) {
                    query += 'INSERT INTO DANHSACHHOCSINHTRONGLOP (`User ID`, `Mã Lớp`) VALUES (\'!\?!\', \'!\?!\'); ';
                    query = query.replace('!\?!', x[i]['User ID']);
                    query = query.replace('!\?!', this.state.malopold);
                }
            }

            if (xoa.length > 0) {
                let x = xoa;
                for (let i = 0; i < x.length; i++) {
                    query += 'DELETE FROM DANHSACHHOCSINHTRONGLOP WHERE `User ID`=\'?\' AND `Mã Lớp` = \'?\'; ';
                    query = query.replace('?', x[i]['User ID']);
                    query = query.replace('?', this.state.malopold);
                }
            }

            if (query != '') {
                this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
                    isReload: true,
                    isSuccess: true,
                });
            }
        }

        this.updateLichHoc(this.state.malopold);
        this.props.dispatch({
            type: 'ALERT_NOTIFICATION_ADD',
            content: 'Đã sửa lịch và cập nhật lên google calendar!',
            notifyType: 'information',
        })
    }

    updateLichHoc (malop) {
        let query = 'DELETE FROM LICHHOC WHERE `Mã Lớp` = \'!\?!\'';
        query = query.replace('!\?!', malop);
        this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
            fn : 'form_lophoc_xoalichhoccu',
            malop: malop,
        });
    }

    callBackGoogleApi (key, data) {
        let query = '';
        switch (key) {
            case 'calendar_laylichgiaovien': {
                    if (data != null
                    && data.email != null
                    && this.props.action == 'edit') {
                        let listidEvent = [];
                        for (let value of data.email) {
                            if (value.summary == this.props.data['Mã Lớp']) {
                                listidEvent.push({
                                    evenid: value.id,
                                    calendarid: value.organizer.email
                                })
                            }
                        }
                        this.setState({listidEvent: listidEvent});
                    }
                    $('.loading2').hide();
            } break;
            case 'calendar_themlophoc':
                if (data == 'done') {
                    if (this.props.action == 'edit') {
                        this.updateHocSinhTrongLop();
                    } else if (this.props.action == 'add') {
                        query = '';
                        let ma_lop = this.calendar.state.malop;
                        if (ma_lop != '') {
                            var x = this.state.hocsinhtronglop;
                            for (var i = 0; i < x.length; i++) {
                                query += 'INSERT INTO DANHSACHHOCSINHTRONGLOP (`User ID`, `Mã Lớp`) VALUES (\'!\?!\', \'!\?!\'); ';
                                query = query.replace('!\?!', x[i]['User ID']);
                                query = query.replace('!\?!', ma_lop);
                            }

                            if (query != '') {
                                this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
                                    isReload : true,
                                    isSuccess: true,
                                });
                            }

                            this.updateLichHoc(ma_lop);
                            this.props.dispatch({
                                type: 'ALERT_NOTIFICATION_ADD',
                                content: 'Đã thêm lịch học lên google calendar!',
                                notifyType: 'information',
                            })
                        }     
                    } else {
                        thongbaothanhcong();
                    }       
                }
                break;
            case 'calendar_xoalophoc':
                if (data == 'done') {
                    thongbaothanhcong2();
                    let calendarname = this.calendar.state.lop;
                    let email = this.calendar.state.email;
                    let coso = $('.khuvuc').attr('value');
                    let ngaybatdau = $(this.calendar.refs.ngaybatdau).val();
                    let ngaykethuc = $(this.calendar.refs.ngayketthuc).val();
                    let startTime = new Date(ngaybatdau);
                    startTime.setHours(0, 0, 0, 0);
                    let endTime = new Date(ngaykethuc);
                    endTime.setHours(23, 59, 59, 0);
                    this.SocketEmit('googleapi', {
                        function: 'themlophoc',
                        calendarname: [calendarname, ],
                        mamon: this.state.malopold,
                        coso: coso,
                        email: email,
                        objadd: this.calendar.state.objadd,
                        startTime: startTime.toISOString(),
                        endTime: endTime.toISOString(),
                        key: 'calendar_themlophoc',
                    });
                }
                break;
            case 'error':
                this.setState({
                    btnDisable: false,
                })
                $('.loading2').hide();
            break;
            default:
        }
    }
    
    callBackDataFormDatabase ( rows, hanhdong, dulieuguive ) {
        let query = '';
        if (hanhdong == 'laydulieu_trave') {
            if (dulieuguive != null) {
                switch (dulieuguive.fn) {
                    case 'form_lophoc_loadLocalCalendar': {
                        this.setState({lichhoc:rows})
                        if(this.props.action == "edit")
                            this.calendar.showFullLocalCalendar(rows,this.props.data['Mã Lớp'])
                        else
                            this.calendar.showFullLocalCalendar(rows,null)
                        
                    } break;
                    case 'lophoc_danhsachgiaovien': {
                            let options = [];
                            let listmail = {};
                            for (let value of rows) {
                                options.push({ value: value['Mã Giáo Viên'], label: value['Mã Giáo Viên'] + ' - ' + value['Họ Và Tên'] });
                                listmail[value['Mã Giáo Viên']] = value['Email'];
                            }
                            this.setState({
                                danhsachgiaovien: options,
                                danhsachmail: listmail,
                            });
                    } break;
                    case 'lophoc_danhsachmonhoc': {
                            this.setState({danhsachmonhoc: rows});
                    } break;
                    case 'lophoc_hocsinhchuacolop': {
                            let hsccl = [];                            
                            for (let row of rows) {
                                let add = true;                                
                                row.label = row['User ID'] + '-' + row['Họ Và Tên'] + ' (' + row['Lớp'] + ')';
                                row.value = row['User ID'];
                                for (let v of this.state.hocsinhtronglop) {
                                    if (v['User ID'] == row['User ID']) {
                                        add = false;
                                    }
                                }
                                if (add) {
                                    hsccl.push(row);
                                }
                            }
                            this.setState({hocsinhchuacolop: hsccl});
                    } break;
                    case 'form_lophoc_laymalop': {
                            let ma_lop = null;
                            if (rows[0] != null) {
                                ma_lop = rows[0]['Mã Lớp']
                            }                    
                            if (ma_lop != null && ma_lop != '') {
                                if (this.state.isFromGoogle) {
                                    this.calendar.setState({ malop: ma_lop });
                                    let calendarname = this.calendar.state.lop;
                                    let email = this.calendar.state.email;
                                    let coso = $('.khuvuc').attr('value');
                                    let ngaybatdau = $(this.calendar.refs.ngaybatdau).val();
                                    let ngaykethuc = $(this.calendar.refs.ngayketthuc).val();
                                    let startTime = new Date(ngaybatdau);
                                    startTime.setHours(0, 0, 0, 0);
                                    let endTime = new Date(ngaykethuc);
                                    endTime.setHours(23, 59, 59, 0);
                                    this.SocketEmit('googleapi', {
                                        function: 'themlophoc',
                                        calendarname: [calendarname, ],
                                        mamon: ma_lop,
                                        coso: coso,
                                        email: email,
                                        objadd: this.calendar.state.objadd,
                                        startTime: startTime.toISOString(),
                                        endTime: endTime.toISOString(),
                                        key: 'calendar_themlophoc',
                                    });
                                } else {
                                    var x = this.state.hocsinhtronglop;
                                    for (var i = 0; i < x.length; i++) {
                                        query += 'INSERT INTO DANHSACHHOCSINHTRONGLOP (`User ID`, `Mã Lớp`) VALUES (\'!\?!\', \'!\?!\'); ';
                                        query = query.replace('!\?!', x[i]['User ID']);
                                        query = query.replace('!\?!', ma_lop);
                                    }

                                    if (query != '') {
                                        this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
                                            isReload : true,
                                            isSuccess: true,
                                        });
                                    }
                                    this.updateLichHoc(ma_lop);
                                }
                            } else {
                                this.props.dispatch({
                                    type: 'ALERT_NOTIFICATION_ADD',
                                    content: 'Không tìm thấy mã lớp!',
                                    notifyType: 'warning',
                                })
                                this.SocketEmit('huy-query');
                                ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                            }
                    } break;
                    case 'lophoc_hocsinhtronglop': { 
                            for (let row of rows) {
                                row.dacolop = true;
                                row.label = row['User ID'] + '-' + row['Họ Và Tên'] + ' (' + row['Lớp'] + ')';
                                row.value = row['User ID'];
                            }
                            this.setState({hocsinhtronglop: rows});
                    } break;
                    case 'lophoc_updatelophoc': {
                            if (dulieuguive.changeCalendar && this.state.isFromGoogle) {
                                if (this.state.listidEvent != null && this.state.listidEvent.length > 0) {
                                    this.SocketEmit('googleapi', {
                                        function: 'xoalichhoc',
                                        data: this.state.listidEvent,
                                        key: 'calendar_xoalophoc',
                                    }); 
                                } else {
                                    let calendarname = this.calendar.state.lop;
                                    let email = this.calendar.state.email;
                                    let coso = $('.khuvuc').attr('value');
                                    let ngaybatdau = $(this.calendar.refs.ngaybatdau).val();
                                    let ngaykethuc = $(this.calendar.refs.ngayketthuc).val();
                                    let startTime = new Date(ngaybatdau);
                                    startTime.setHours(0, 0, 0, 0);
                                    let endTime = new Date(ngaykethuc);
                                    endTime.setHours(23, 59, 59, 0);                                
                                    this.SocketEmit('googleapi', {
                                        function: 'themlophoc',
                                        calendarname: [calendarname, ],
                                        mamon: this.state.malopold,
                                        coso: coso,
                                        email: email,
                                        objadd: this.calendar.state.objadd,
                                        startTime: startTime.toISOString(),
                                        endTime: endTime.toISOString(),
                                        key: 'calendar_themlophoc',
                                    });
                                }
                            } else {
                                this.updateHocSinhTrongLop();
                            }
                    } break;
                    case 'form_lophoc_xoalichhoccu': {
                            let lich = this.calendar.state.objadd;
                            query = '';
                            for (let value in lich) {
                                if (lich.hasOwnProperty(value)) {
                                    let _objthu = value.split('!')[0];
                                    let _objstartend = value.split('!')[2];
                                    let valueend = value.slice(0, value.length - 1) + '1';
                                    if (_objstartend == 0) {
                                        let giobatdau = lich[value];
                                        let gioketthuc = lich[valueend];
                                        let thu = _objthu;
                                        query += 'INSERT INTO `LICHHOC` (`Mã Lớp`, `Mã Phòng Học`, `Thứ`, `Giờ Bắt Đầu`, `Giờ Kết Thúc`) VALUES (\'?\', \'?\', \'?\', \'?\', \'?\'); '
                                        query = query.replace('?', dulieuguive.malop);
                                        query = query.replace('?', this.state.maphonghoc);
                                        query = query.replace('?', thu);
                                        query = query.replace('?', giobatdau);
                                        query = query.replace('?', gioketthuc);
                                    }
                                }
                            }
                            if (query != '') {
                                this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
                                    isReload : false,
                                    isSuccess: true,
                                });
                            }
                            // this.SocketEmit( 'all-notification-update', $('.permission').attr('value'));
                            thongbaothanhcong();
                    } break;
                    case 'form_lophoc_createclass_successed': {
                            query = 'SELECT * FROM LOPHOC WHERE `ID` = \'!\?!\'; '
                            query = query.replace('!\?!', rows.insertId);
                            this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
                                fn: 'form_lophoc_laymalop',
                                isReload : true,
                                isSuccess: true,
                                transaction: true,
                                transactioncommit: true,
                            });
                    } break;
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
                            console.log(new Date(v['Ngày Chuyển Tới']).toLocaleDateString('zh-Hans-CN').replace(/\//g,'-'))
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
                        //this.resetCalendar();
                    break;
                    default:                        
                }
                
            }
        }

        if (hanhdong == 'loi-cu-phap') {
            this.setState({
                btnDisable: false,
            })
        }
    }

    componentDidMount () {
        $(this.calendar.refs.ngaybatdau).on( "change", function(){
            this.resetCalendar()
        }.bind(this) )
        $(this.calendar.refs.ngayketthuc).on( "change", function(){
            this.resetCalendar()
        }.bind(this) )
        let query;
        window.addEventListener("resize", this.changeSize);
        this.changeSize();
        this.props.socket.on('googleapicallback', this.callBackGoogleApi);
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);

        query = 'SELECT * FROM GIAOVIEN ' + 
        'WHERE (`Cơ Sở` = \'!\?!\' ' +
        'OR `Cơ Sở` LIKE \'%!\?!,%\' ' +
        'OR `Cơ Sở` LIKE \'%,!\?!%\' ' +
        'OR `Cơ Sở` = \'ALL\') ' + 
        'AND (`Ngày Nghỉ` IS NULL ' +
        'OR `Mã Giáo Viên` = \'!~!\') ';
        query = query.replace(/!\?!/g, $('.khuvuc').attr('value'));
        if (this.props.data != null) {
            query = query.replace('!~!', this.props.data['Mã Giáo Viên']);
        }
        this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
            fn : 'lophoc_danhsachgiaovien'
        });

        query = 'SELECT * FROM quanlyhocsinh.DANHSACHMONHOC';
        // if ($('.permission').attr('value') == 'tbmanhvan'
        // || $('.permission').attr('value') == 'tbmvanhoa') {
        //     query += ' WHERE EXISTS (SELECT * FROM quanlyhocsinh.QUANLY ' +
        //     'WHERE `Chức Vụ` LIKE DANHSACHMONHOC.`managerAllow` ' +
        //     'AND `Mã Quản Lý` = \'!\?!\')';
        //     query = query.replace('!\?!' , $('#lable_button_nexttoicon').attr('value'));
        // }
        this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', { 
            fn : 'lophoc_danhsachmonhoc'
        });

        

        if (this.props.action == "edit") {
            query = 'SELECT * FROM quanlyhocsinh.USERS WHERE ' +
            'EXISTS(SELECT * FROM quanlyhocsinh.DANHSACHHOCSINHTRONGLOP WHERE `User ID` = USERS.`User ID` AND `Mã Lớp` = \'?\')';
            query = query.replace('?', this.props.data['Mã Lớp']);
            this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
                fn : 'lophoc_hocsinhtronglop'
            });

            query ='SELECT * FROM LICHHOCTHAYDOI '+
                'WHERE `Mã Giáo Viên` = \'~\''
            query = query.replace('~', this.props.data['Mã Giáo Viên']);
            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                fn : 'information_lichthaydoi',
            });
        }
    }

    componentWillUnmount() {
        $(this.calendar.refs.ngaybatdau).off( "change")
        $(this.calendar.refs.ngayketthuc).off( "change")
        window.removeEventListener("resize", this.changeSize);
        this.props.socket.off('googleapicallback', this.callBackGoogleApi);
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentDidUpdate(prevProps, prevState) {
        this.changeSize();

        if (this.state.danhsachmonhoc.length > 0
        && this.state.fisttime == null) {
            if (this.props.action == 'add' && this.props.data != null) {
                this.refs.danhsachmonhoc.value = this.props.data['mamonhoc'];
                this.refs.lop.value(this.props.data['lop']);
            }
            this.onChangeMonVaLop();
            this.setState({fisttime: ''});
        }

        if (this.props.action == "edit") {
            if (this.state.danhsachmonhoc.length > 0 && this.state.monhocold == null) {
                let mamon = this.props.data['Mã Môn Học'];
                let lop = this.props.data['Lớp'];
                this.refs.danhsachmonhoc.value = mamon;
                this.refs.lop.value(lop);
                let year, month, day;
                if (this.props.data['Ngày Bắt Đầu'] != null) {
                    let batdau = new Date(this.props.data['Ngày Bắt Đầu']);
                    year = batdau.getFullYear();
                    month = ("0" + (batdau.getMonth() + 1)).slice(-2);
                    day = ("0" + batdau.getDate()).slice(-2);
                    $(this.calendar.refs.ngaybatdau).val(year + '-' + month + '-' + day);
                }
                if (this.props.data['Ngày Kết Thúc'] != null) {
                    let ketthuc = new Date(this.props.data['Ngày Kết Thúc']);
                    year = ketthuc.getFullYear();
                    month = ("0" + (ketthuc.getMonth() + 1)).slice(-2);
                    day = ("0" + ketthuc.getDate()).slice(-2);
                    $(this.calendar.refs.ngayketthuc).val(year + '-' + month + '-' + day);
                }
                this.refs.danhsachmonhoc.disabled = true;
                this.refs.lop.disabled = true;
                this.setState({
                    lopold: lop, 
                    monhocold: mamon, 
                    malopold: this.props.data['Mã Lớp'],
                    ngaybatdauold: new Date(this.props.data['Ngày Bắt Đầu']),
                    ngayketthucold: new Date(this.props.data['Ngày Kết Thúc']),
                });
                this.onChangeMonVaLop();
            }

            if (this.state.danhsachgiaovien.length > 0 && this.state.magiaovienold == null) {
                let magv = this.props.data['Mã Giáo Viên'];
                for (let v of this.state.danhsachgiaovien) {
                    if (v.value == magv) {
                        this.setState({magiaovienold: magv});
                        this.updateValue(v);
                        break;
                    }
                }
            } 
        }

        if (prevState.tatcacaclop != this.state.tatcacaclop) {            
            this.onChangeMonVaLop();
        }
    }

    updateValue (newValue) {
        let email = null;
        if (newValue != null) {
            email = this.state.danhsachmail[newValue.value];
        }
        this.setState({
            giaovienselect: newValue,
            email: email,
        });
        // $('.loading2').show();
        if (this.state.isFromGoogle) {
            this.calendar.emailChange(email);
        } else {
            if (newValue != null) {
                let query = 'SELECT LOPHOC.*,DANHSACHMONHOC.`name`, LICHHOC.`Thứ`, LICHHOC.`Giờ Bắt Đầu`, LICHHOC.`Giờ Kết Thúc` FROM ((LOPHOC ' +
                'LEFT JOIN LICHHOC ON LOPHOC.`Mã Lớp` = LICHHOC.`Mã Lớp`) ' +
                'LEFT JOIN DANHSACHMONHOC ON DANHSACHMONHOC.`mamon` = LOPHOC.`Mã Môn Học`) ' + 
                'WHERE LOPHOC.`Mã Giáo Viên` = \'!\?!\' ' +
                'AND (CONVERT_TZ(CURDATE(), @@session.time_zone,\'+07:00\') <= LOPHOC.`Ngày Kết Thúc` ' +
                'OR LOPHOC.`Mã Lớp` = \'!\?!\') ';
                query = query.replace('!\?!', newValue.value);
                if (this.props.data != null) {
                    query = query.replace('!\?!', this.props.data['Mã Lớp']);
                }
                this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
                    fn: 'form_lophoc_loadLocalCalendar',
                });
            } else {
                this.calendar.resetLich();
            }
        }
    }

    onChangeMonVaLop () {
        let query;
        let mamon = this.refs.danhsachmonhoc.value;
        let lop = this.refs.lop.value();
        if (mamon == 'TG') {
            query = 'SELECT * FROM USERS ' +
            'WHERE EXISTS (SELECT * FROM DANGKIMONHOC WHERE DANGKIMONHOC.`User ID` = `USERS`.`User ID` and `monhoc` LIKE \'%"trongoi":true%\') ' +
            'AND !EXISTS (SELECT * FROM (SELECT DANHSACHHOCSINHTRONGLOP.*, LOPHOC.`Mã Môn Học`, LOPHOC.`Lớp` ' +
            'FROM DANHSACHHOCSINHTRONGLOP, LOPHOC ' +
            'WHERE DANHSACHHOCSINHTRONGLOP.`Mã Lớp` = LOPHOC.`Mã Lớp` AND CONVERT_TZ(CURDATE(), @@session.time_zone,\'+07:00\') <= LOPHOC.`Ngày Kết Thúc`) AS TB1 ' +
            'WHERE TB1.`User ID` = `USERS`.`User ID` ' +
            'AND TB1.`Mã Môn Học` = \'!\?!\' ' +
            'AND TB1.`Lớp` = USERS.`Lớp`) ' +
            'AND USERS.`Cơ Sở` = \'!\?!\' ' +
            'AND USERS.`Ngày Nghỉ Học` IS NULL ';
        } else {
            query = 'SELECT * FROM USERS ' +
            'WHERE EXISTS (SELECT * FROM DANGKIMONHOC WHERE DANGKIMONHOC.`User ID` = `USERS`.`User ID` and `monhoc` LIKE \'%"mamon":"!\?!"%\') ' +
            'AND !EXISTS (SELECT * FROM (SELECT DANHSACHHOCSINHTRONGLOP.*, LOPHOC.`Mã Môn Học`, LOPHOC.`Lớp` ' +
            'FROM DANHSACHHOCSINHTRONGLOP, LOPHOC ' +
            'WHERE DANHSACHHOCSINHTRONGLOP.`Mã Lớp` = LOPHOC.`Mã Lớp` AND CONVERT_TZ(CURDATE(), @@session.time_zone,\'+07:00\') <= LOPHOC.`Ngày Kết Thúc`) AS TB1 ' +
            'WHERE TB1.`User ID` = `USERS`.`User ID` ' +
            'AND TB1.`Mã Môn Học` = \'!\?!\' ' +
            'AND TB1.`Lớp` = USERS.`Lớp`) ' +
            'AND USERS.`Cơ Sở` = \'!\?!\' ' +
            'AND USERS.`Ngày Nghỉ Học` IS NULL ';
            query = query.replace('!\?!', mamon);
        }
        query = query.replace('!\?!', mamon);
        query = query.replace('!\?!', $('.khuvuc').attr('value'));
        if (!this.state.tatcacaclop) {
            query += 'AND USERS.`Lớp` = \'!\?!\' ';
            query = query.replace('!\?!', lop);
        }
        this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
            fn: 'lophoc_hocsinhchuacolop'
        });
    }
    resetCalendar()
    {
        this.calendar.showFullLocalCalendar(this.state.lichhoc,this.props.data!=null?this.props.data['Mã Lớp']:null)
    }
    onClickChuaCoLop (data, element) {
        let array = this.state.hocsinhchuacolop;
        array.splice(data.index, 1);
        this.setState({hocsinhchuacolop: array});
        
        array = this.state.hocsinhtronglop;
        array.push(data.value);
        this.setState({hocsinhtronglop: array});
        
        array = this.state.xoahocsinhkhoilop;
        if (this.props.action == 'edit') {
            if (data.value.dacolop) {
                if (array.indexOf(data.value) != -1) {
                    array.splice(array.indexOf(data.value), 1);
                    this.setState({xoahocsinhkhoilop: array});
                }
            } else {
                this.setState({themhocsinhvaolop: this.state.themhocsinhvaolop.concat(data.value)})
            }
            
        }
    }

    onClickTrongLop (data, element) {
        let array = this.state.hocsinhtronglop;
        array.splice(data.index, 1);
        this.setState({hocsinhtronglop: array});
        
        array = this.state.hocsinhchuacolop;
        array.push(data.value);
        this.setState({hocsinhchuacolop: array});

        array = this.state.themhocsinhvaolop;
        if (this.props.action == 'edit') {
            if (data.value.dacolop) {
                this.setState({xoahocsinhkhoilop: this.state.xoahocsinhkhoilop.concat(data.value)})
            } else if (array.indexOf(data.value) != -1) {
                array.splice(array.indexOf(data.value), 1);
                this.setState({themhocsinhvaolop: array});
            }
        }
    }

    dongy () {
        if ($('.cellisclick').length <= 0) {
            this.props.dispatch({
                type: 'ALERT_NOTIFICATION_ADD',
                content: 'Vui lòng chọn ca học ở lịch phía dưới!',
                notifyType: 'warning',
            })
            return;
        }
        
        if (this.calendar.state.error == '') {
            if (this.props.action == 'edit') {
                this.setState({
                    btnDisable: true,
                })
                let ma_giao_vien = this.state.giaovienselect.value;
                if (ma_giao_vien != null && ma_giao_vien != '') {
                    let ngaybatdau = $(this.calendar.refs.ngaybatdau).val();
                    let ngayketthuc = $(this.calendar.refs.ngayketthuc).val();
                
                    if (ngaybatdau != '' && ngayketthuc != '') {
                        let startTime = new Date(ngaybatdau);
                        let endTime = new Date(ngayketthuc);
                        endTime.setHours(23);
                        endTime.setMinutes(59);
                        if (startTime < endTime) {
                            let objadd = {};
                            let objcheck = {};
                            for (let i of $('.cellisclick')) {
                                let gio;
                                let phut;
                                let rowindex = i.parentElement.rowIndex - 1;
                                if ((rowindex % 2) == 0) {
                                    gio = Math.floor(rowindex / 2) + 6;
                                    phut = 0;
                                } else {
                                    gio = Math.floor(rowindex / 2) + 6;
                                    phut = 30;
                                }
                                let thu = i.cellIndex;
                                let nextcell = i.parentElement.nextElementSibling.cells[i.cellIndex];
                                let th = new Date();
                                let today = new Date();
                                th.setDate(today.getDate() - (today.getDay() - (thu - 1)));                                
                    
                                /**
                                 * get time at to google calendar
                                 */
                                if (nextcell.className.indexOf('cellisclick') != -1) {
                                    if (objcheck[thu] == null) {
                                        if (objadd[thu + '!0!' + '0'] == null) {
                                            th.setHours(gio, phut, 0, 0);
                                            objadd[thu + '!0!' + '0'] = ('0' + th.getHours()).slice(-2) + ':' + ('0' + th.getMinutes()).slice(-2) + ':' + ('0' + th.getSeconds()).slice(-2);
                                            th.setHours(gio, phut + 30, 0, 0);
                                            objadd[thu + '!0!' + '1'] = ('0' + th.getHours()).slice(-2) + ':' + ('0' + th.getMinutes()).slice(-2) + ':' + ('0' + th.getSeconds()).slice(-2);
                                        } else {
                                            th.setHours(gio, phut + 30, 0, 0);
                                            objadd[thu + '!0!' + '1'] = ('0' + th.getHours()).slice(-2) + ':' + ('0' + th.getMinutes()).slice(-2) + ':' + ('0' + th.getSeconds()).slice(-2);
                                        }
                                    } else {
                                        let num =  objcheck[thu].num + 1;
                                        if (objadd[thu + '!' + num + '!' + '0'] == null) {
                                            th.setHours(gio, phut, 0, 0);
                                            objadd[thu + '!' + num + '!' + '0'] = ('0' + th.getHours()).slice(-2) + ':' + ('0' + th.getMinutes()).slice(-2) + ':' + ('0' + th.getSeconds()).slice(-2);
                                            th.setHours(gio, phut + 30, 0, 0);
                                            objadd[thu + '!' + num + '!' + '1'] = ('0' + th.getHours()).slice(-2) + ':' + ('0' + th.getMinutes()).slice(-2) + ':' + ('0' + th.getSeconds()).slice(-2);
                                        } else {
                                            th.setHours(gio, phut + 30, 0, 0);
                                            objadd[thu + '!' + num + '!' + '1'] = ('0' + th.getHours()).slice(-2) + ':' + ('0' + th.getMinutes()).slice(-2) + ':' + ('0' + th.getSeconds()).slice(-2);
                                        }
                                    }
                                } else {
                                    if (objcheck[thu] == null) {
                                        th.setHours(gio, phut + 30, 0, 0);
                                        objadd[thu + '!0!' + '1'] = ('0' + th.getHours()).slice(-2) + ':' + ('0' + th.getMinutes()).slice(-2) + ':' + ('0' + th.getSeconds()).slice(-2);
                                        objcheck[thu] = {num: 0};
                                    } else {
                                        let num =  objcheck[thu].num + 1;
                                        th.setHours(gio, phut + 30, 0, 0);
                                        objadd[thu + '!' + num + '!' + '1'] = ('0' + th.getHours()).slice(-2) + ':' + ('0' + th.getMinutes()).slice(-2) + ':' + ('0' + th.getSeconds()).slice(-2);
                                        objcheck[thu] = {num: num};
                                    }
                                }
                            }
                    
                            let lophoc = this.refs.lop.getLabel();
                            
                            this.calendar.setState({
                                objadd: objadd,
                                lop: lophoc,
                                email: this.state.email,
                            });

                            let check = false;
                            let checkcal = true;
                            let query = 'UPDATE `LOPHOC` SET ~ WHERE `Mã Lớp`=\'?\'';
                            if (ma_giao_vien != this.state.magiaovienold) {
                                query = query.replace('~', '`Mã Giáo Viên`=\'?\', ~');
                                query = query.replace('?', ma_giao_vien);
                                check = true;
                            }

                            let obd = this.state.ngaybatdauold;
                            if (ngaybatdau != (obd.getFullYear() + '-' + ("0" + (obd.getMonth() + 1)).slice(-2) + '-' + ("0" + obd.getDate()).slice(-2))) {
                                query = query.replace('~', '`Ngày Bắt Đầu`=\'?\', ~');
                                query = query.replace('?', ngaybatdau);
                                check = true;
                                checkcal = true;
                            }

                            let okt = this.state.ngayketthucold;                            
                            if (ngayketthuc != (okt.getFullYear() + '-' + ("0" + (okt.getMonth() + 1)).slice(-2) + '-' + ("0" + okt.getDate()).slice(-2))) {
                                query = query.replace('~', '`Ngày Kết Thúc`=\'?\', ~');
                                query = query.replace('?', ngayketthuc);
                                check = true;
                                checkcal = true;
                            }

                            query = query.replace(', ~', '');
                            query = query.replace('?', this.state.malopold);
                            
                            if (check) {
                                this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', { 
                                    fn: 'lophoc_updatelophoc',
                                    changeCalendar: checkcal,
                                });
                            } else {
                                if (checkcal && this.state.isFromGoogle) {
                                    if (this.state.listidEvent != null && this.state.listidEvent.length > 0) {
                                        this.SocketEmit('googleapi', {
                                            function: 'xoalichhoc',
                                            data: this.state.listidEvent,
                                            key: 'calendar_xoalophoc',
                                        }); 
                                    } else {
                                        let calendarname = lophoc;
                                        let email = this.state.email;
                                        let coso = $('.khuvuc').attr('value');
                                        let ngaybatdau = $(this.calendar.refs.ngaybatdau).val();
                                        let ngaykethuc = $(this.calendar.refs.ngayketthuc).val();
                                        let startTime = new Date(ngaybatdau);
                                        startTime.setHours(0, 0, 0, 0);
                                        let endTime = new Date(ngaykethuc);
                                        endTime.setHours(23, 59, 59, 0);                                        
                                        this.SocketEmit('googleapi', {
                                            function: 'themlophoc',
                                            calendarname: [calendarname, ],
                                            mamon: this.state.malopold,
                                            coso: coso,
                                            email: email,
                                            objadd: objadd,
                                            startTime: startTime.toISOString(),
                                            endTime: endTime.toISOString(),
                                            key: 'calendar_themlophoc',
                                        });
                                    }
                                } else {
                                    this.updateHocSinhTrongLop();
                                }
                            }
                        } else {
                            this.props.dispatch({
                                type: 'ALERT_NOTIFICATION_ADD',
                                content: 'Ngày bắt đầu phải lớn hơn ngày kết thúc!',
                                notifyType: 'warning',
                            })
                            this.setState({
                                btnDisable: false,
                            })
                        }
                    } else {
                        if (ngaybatdau == '') {
                            $(this.calendar.refs.ngaybatdau).css('border-color', 'red');
                        } else {
                            $(this.calendar.refs.ngaybatdau).css('border-color', '#ccc');
                        }
                        if (ngayketthuc == '') {
                            $(this.calendar.refs.ngayketthuc).css('border-color', 'red');
                        } else {
                            $(this.calendar.refs.ngayketthuc).css('border-color', '#ccc');
                        }
                        this.setState({
                            btnDisable: false,
                        })
                    }
                } else {
                    this.props.dispatch({
                        type: 'ALERT_NOTIFICATION_ADD',
                        content: 'Vui lòng chọn giáo viên!',
                        notifyType: 'warning',
                    })
                    this.setState({
                        btnDisable: false,
                    })
                }
            } else if (this.props.action == 'add') {
                this.setState({
                    btnDisable: true,
                })
                let ma_giao_vien = null;
                if (this.state.giaovienselect != null) {
                    ma_giao_vien = this.state.giaovienselect.value;
                }
                if (ma_giao_vien != null && ma_giao_vien != '') {
                    let ngaybatdau = $(this.calendar.refs.ngaybatdau).val();
                    let ngayketthuc = $(this.calendar.refs.ngayketthuc).val();
                
                    if (ngaybatdau != '' && ngayketthuc != '') {
                        let startTime = new Date(ngaybatdau);
                        let endTime = new Date(ngayketthuc);
                        endTime.setHours(23);
                        endTime.setMinutes(59);
                        if (startTime < endTime) {
                            let objadd = {};
                            let objcheck = {};
                            for (let i of $('.cellisclick')) {
                                let gio;
                                let phut;
                                let rowindex = i.parentElement.rowIndex - 1;
                                if ((rowindex % 2) == 0) {
                                    gio = Math.floor(rowindex / 2) + 6;
                                    phut = 0;
                                } else {
                                    gio = Math.floor(rowindex / 2) + 6;
                                    phut = 30;
                                }
                                let thu = i.cellIndex;
                                let nextcell = i.parentElement.nextElementSibling.cells[i.cellIndex];
                                let th = new Date();
                                let today = new Date();
                                th.setDate(today.getDate() - (today.getDay() - (thu - 1)));                                
                    
                                /**
                                 * get time at to google calendar
                                 */
                                if (nextcell.className.indexOf('cellisclick') != -1) {
                                    if (objcheck[thu] == null) {
                                        if (objadd[thu + '!0!' + '0'] == null) {
                                            th.setHours(gio, phut, 0, 0);
                                            objadd[thu + '!0!' + '0'] = ('0' + th.getHours()).slice(-2) + ':' + ('0' + th.getMinutes()).slice(-2) + ':' + ('0' + th.getSeconds()).slice(-2);
                                            th.setHours(gio, phut + 30, 0, 0);
                                            objadd[thu + '!0!' + '1'] = ('0' + th.getHours()).slice(-2) + ':' + ('0' + th.getMinutes()).slice(-2) + ':' + ('0' + th.getSeconds()).slice(-2);
                                        } else {
                                            th.setHours(gio, phut + 30, 0, 0);
                                            objadd[thu + '!0!' + '1'] = ('0' + th.getHours()).slice(-2) + ':' + ('0' + th.getMinutes()).slice(-2) + ':' + ('0' + th.getSeconds()).slice(-2);
                                        }
                                    } else {
                                        let num =  objcheck[thu].num + 1;
                                        if (objadd[thu + '!' + num + '!' + '0'] == null) {
                                            th.setHours(gio, phut, 0, 0);
                                            objadd[thu + '!' + num + '!' + '0'] = ('0' + th.getHours()).slice(-2) + ':' + ('0' + th.getMinutes()).slice(-2) + ':' + ('0' + th.getSeconds()).slice(-2);
                                            th.setHours(gio, phut + 30, 0, 0);
                                            objadd[thu + '!' + num + '!' + '1'] = ('0' + th.getHours()).slice(-2) + ':' + ('0' + th.getMinutes()).slice(-2) + ':' + ('0' + th.getSeconds()).slice(-2);
                                        } else {
                                            th.setHours(gio, phut + 30, 0, 0);
                                            objadd[thu + '!' + num + '!' + '1'] = ('0' + th.getHours()).slice(-2) + ':' + ('0' + th.getMinutes()).slice(-2) + ':' + ('0' + th.getSeconds()).slice(-2);
                                        }
                                    }
                                } else {
                                    if (objcheck[thu] == null) {
                                        th.setHours(gio, phut + 30, 0, 0);
                                        objadd[thu + '!0!' + '1'] = ('0' + th.getHours()).slice(-2) + ':' + ('0' + th.getMinutes()).slice(-2) + ':' + ('0' + th.getSeconds()).slice(-2);
                                        objcheck[thu] = {num: 0};
                                    } else {
                                        let num =  objcheck[thu].num + 1;
                                        th.setHours(gio, phut + 30, 0, 0);
                                        objadd[thu + '!' + num + '!' + '1'] = ('0' + th.getHours()).slice(-2) + ':' + ('0' + th.getMinutes()).slice(-2) + ':' + ('0' + th.getSeconds()).slice(-2);
                                        objcheck[thu] = {num: num};
                                    }
                                }
                            }
                    
                            let lophoc = this.refs.lop.getLabel();                            
                            this.calendar.setState({
                                objadd: objadd,
                                lop: lophoc,
                                email: this.state.email,
                            });
                            let ma_mon_hoc = this.refs.danhsachmonhoc.value;
                            let lop_hoc = this.refs.lop.value();
                            let query = 'INSERT INTO LOPHOC (`Lớp`, `Mã Môn Học`, `Mã Giáo Viên`, `Ngày Bắt Đầu`, `Ngày Kết Thúc`, `branch`) VALUES (\'?\', \'?\', \'?\', \'?\', \'?\', \'?\')';
                            query = query.replace('?', lop_hoc);
                            query = query.replace('?', ma_mon_hoc);
                            query = query.replace('?', ma_giao_vien);
                            query = query.replace('?', ngaybatdau);
                            query = query.replace('?', ngayketthuc);
                            query = query.replace('?', $('.khuvuc').attr('value'));
                            this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', { 
                                fn : 'form_lophoc_createclass_successed',
                                transaction: true,
                            });
                        } else {
                            this.props.dispatch({
                                type: 'ALERT_NOTIFICATION_ADD',
                                content: 'Ngày bắt đầu phải lớn hơn ngày kết thúc!',
                                notifyType: 'warning',
                            })
                            this.setState({
                                btnDisable: false,
                            })
                        }
                    } else {
                        if (ngaybatdau == '') {
                        $(this.calendar.refs.ngaybatdau).css('border-color', 'red');
                        } else {
                        $(this.calendar.refs.ngaybatdau).css('border-color', '#ccc');
                        }
                        if (ngayketthuc == '') {
                        $(this.calendar.refs.ngayketthuc).css('border-color', 'red');
                        } else {
                        $(this.calendar.refs.ngayketthuc).css('border-color', '#ccc');
                        }
                        this.setState({
                            btnDisable: false,
                        })
                    }
                } else {
                    this.props.dispatch({
                        type: 'ALERT_NOTIFICATION_ADD',
                        content: 'Vui lòng chọn giáo viên!',
                        notifyType: 'warning',
                    })
                    this.setState({
                        btnDisable: false,
                    })
                }
            } else {
                ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
            }      
        } else {
            ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
        }
    }
    deleteShadow(e)
    {   
        if(e.nativeEvent.target.dataset.v==null||
            e.nativeEvent.target.dataset.v=="")
            this.calendar.onMouseOff()
    }
    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    }

    render () {
        let title = null;
        let title2 = null;
        if (this.props.action == 'add') {
            title = "Thêm Lớp Học";
        } else if (this.props.action == 'edit') {
            title = "Cập Nhật Lớp Học";
            title2 = 
            <h2 style={{'margin': '5px'}}>
                {this.props.data['Mã Lớp'] + ' - ' + this.props.data['name'] + ' - Lớp ' + this.props.data['Lớp']}
            </h2>;
        }

        return (
            <div  onMouseMove={this.deleteShadow.bind(this)} className={style.formstyle} ref="background">
                <div className="form_body" ref="body" style={{'width': '1100px'}}>
                    <div className="header">
                        <h2>{title}</h2>
                    </div>
                    <div className="body">
                        {title2}
                        <div className={mystyle.girdcontainer}>
                            <div>
                                <div className="unsetdivformstyle">
                                    <label for="Danh Sách Giáo Viên">Giáo Viên Phụ Trách: </label><br/>
                                    <Select
                                        name="Danh Sách Giáo Viên"
                                        value={this.state.giaovienselect}
                                        options={this.state.danhsachgiaovien}
                                        onChange={this.updateValue.bind(this)}
                                    />
                                </div>
                                <div className="divformstyle">
                                    <div>
                                        <label for="Danh Sách Môn Học">Môn Học: </label><br/>
                                        <select name="Danh Sách Môn Học" ref="danhsachmonhoc" onChange={this.onChangeMonVaLop.bind(this)}>
                                        {
                                            this.state.danhsachmonhoc.map((value, index) => {
                                                return (
                                                    <option value={value['mamon']} key={index}>
                                                        {value['mamon'] + ' - ' +value['name']}
                                                    </option>
                                                );
                                            })
                                        }
                                        </select>
                                    </div>
                                    <div>
                                        <Lop
                                            ref="lop"
                                            onChange={this.onChangeMonVaLop.bind(this)}
                                        />
                                        Học sinh trong tất cả các lớp:
                                        <input 
                                            type="checkbox"
                                            onChange={() => {
                                                this.setState({
                                                    tatcacaclop: !this.state.tatcacaclop,
                                                });
                                            }}
                                            style={{
                                                'width': 'auto',
                                            }}
                                        />
                                    </div>
                                {/* </div>
                                <div className="unsetdivformstyle"> */}
                                    <div>
                                        <div style={{
                                            'padding': '0',
                                            'display': 'grid',
                                            'grid-template-columns': '50% 50%'
                                        }}>
                                            <div style={{'padding': '0px 5px 0px 0px'}}>
                                                <input type="text" onChange={(e) => {
                                                    let hsccl = this.state.hocsinhchuacolop;
                                                    for (let i of hsccl) {
                                                        var str = i.label;
                                                        str = str.toLowerCase();
                                                        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
                                                        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
                                                        str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
                                                        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
                                                        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
                                                        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
                                                        str = str.replace(/đ/g,"d");
                                                        str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g," ");
                                                        str = str.replace(/ + /g," ");
                                                        str = str.trim();
                                                        if (str.indexOf(e.target.value) == -1) {
                                                            i.hiden = true;
                                                        } else if (e.target.value.trim() == '') {
                                                            i.hiden = false;
                                                        } else {
                                                            i.hiden = false;
                                                        }
                                                    }
                                                    this.setState({
                                                        hocsinhchuacolop: hsccl,
                                                    })
                                                }}/>
                                                <label for="">Học sinh chưa có lớp:</label>
                                                <ul className={mystyle.ulstyle}>
                                                {
                                                    this.state.hocsinhchuacolop.map((value, index) => {
                                                        let myclass = '';
                                                        let style = {display: 'block'};
                                                        if (value.dacolop) {
                                                            myclass = mystyle.inclass
                                                        }
                                                        if (value.hiden) {
                                                            style = {display: 'none'};
                                                        }
                                                        return (
                                                            <li style={style} className={myclass} key={index} onClick={this.onClickChuaCoLop.bind(this, {value: value, index: index})}> 
                                                                {value.label}
                                                            </li>
                                                        )
                                                    })
                                                }
                                                </ul>
                                            </div>
                                            <div style={{'padding': '0px 0px 0px 5px'}}>
                                                <input type="text" onChange={(e) => {
                                                    let hsdcl = this.state.hocsinhtronglop;
                                                    for (let i of hsdcl) {
                                                        var str = i.label;
                                                        str = str.toLowerCase();
                                                        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
                                                        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
                                                        str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
                                                        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
                                                        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
                                                        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
                                                        str = str.replace(/đ/g,"d");
                                                        str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g," ");
                                                        str = str.replace(/ + /g," ");
                                                        str = str.trim();
                                                        if (str.indexOf(e.target.value) == -1) {
                                                            i.hiden = true;
                                                        } else if (e.target.value.trim() == '') {
                                                            i.hiden = false;
                                                        } else {
                                                            i.hiden = false;
                                                        }
                                                    }
                                                    this.setState({
                                                        hocsinhtronglop: hsdcl,
                                                    })
                                                }}/>
                                                <label for="">Học sinh trong lớp:</label>
                                                <ul className={mystyle.ulstyle}>
                                                {
                                                    this.state.hocsinhtronglop.map((value, index) => {
                                                        let myclass = '';
                                                        let style = {display: 'block'};
                                                        if (value.dacolop) {
                                                            myclass = mystyle.inclass
                                                        }
                                                        if (value.hiden) {
                                                            style = {display: 'none'};
                                                        }
                                                        return (
                                                            <li style={style} className={myclass} key={index} onClick={this.onClickTrongLop.bind(this, {value: value, index: index})}> 
                                                                {value.label}
                                                            </li>
                                                        )
                                                    })
                                                }
                                                </ul>                                                 
                                            </div>                                                
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="divformstyle">
                                <div>
                                <Calendar
                                    getMe={(me) => {this.calendar = me}}
                                    action={this.props.action}
                                    data={this.props.data}
                                    arrayChangedSchedule = {this.state.arrayChangedSchedule}
                                    onChangeEdit = {this.resetCalendar.bind(this)}
                                    infoLichHoc ={this.state.lichhoc}
                                />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="footer" ref="footer">
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
}) (LopHoc);
