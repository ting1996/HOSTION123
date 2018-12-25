import React from 'react';
import { connect } from 'react-redux';
import styleRowCall from './styleRowCall.css';
var ReactDOM = require('react-dom');
import SoDienThoai from '../elements/SoDienThoai';
import Select from 'react-select';

import {Bar, Line, Pie, Chart} from 'react-chartjs-2';

class RowCallCSKH extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tinhtrangcuocgoi: null,
            mucdohailong: null,

            danhsachgiaovien: [],
            danhsachquanly: [],
            dsgvphanhoi: [],
            dsqlphanhoi: [],
            scores: {},
            thangnam: {},
            chartData: {
                labels: [],
                datasets: [],
            },
            maxValue: 10,
            qlph: false,
            gvph: false,
            moreInfor: false,
            
            soluongkehoachtrongngay: null,
            nhamang: null,

            listNhanvienph: [],
            nhanvienph: null,

            now: 0,
            isLoad: false,
            shownext: 'block',
            showback: 'block',
        }
        this.callBackDataFormDatabase = this.callBackDataFormDatabase.bind(this);
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
                    case 'goidiendata_rowcall_loadtongngaykehoach': {
                        this.setState({soluongkehoachtrongngay: rows[0]['count']});
                    } break;
                    case 'form_call_rowcallcskh_loadthongtin': {
                        let danhsachquanly = [];
                        let danhsachgiaovien = [];
                        for (let row of rows[0]) {
                            if (row != null) {
                                danhsachquanly.push({
                                    label: row['Mã Quản Lý'] + ' - ' + row['Họ Và Tên'],
                                    value: row['Mã Quản Lý']
                                })
                            }
                        }

                        for (let row of rows[1]) {
                            if (row != null) {
                                danhsachgiaovien.push({
                                    label: row['Mã Giáo Viên'] + ' - ' + row.gvname,
                                    value: row['Mã Giáo Viên']
                                })
                            }
                        }

                        let scores = {};
                        let listnam = [];
                        let chartData = this.state.chartData;
                        let listmon = [];
                        for (let row of rows[2]) {
                            if (scores[row.year] == null) {
                                scores[row.year] = {};
                                listnam.push({label: row.year, value: row.year});
                            }
                            if (scores[row.year][row.month] == null) {
                                scores[row.year][row.month] = [];
                            }
                            if (chartData.labels.indexOf(row.month + '/' + row.year) == -1) {
                                chartData.labels.push(row.month + '/' + row.year);
                            }
                            if (listmon.indexOf(row.mamon) == -1) {
                                listmon.push(row.mamon);                                
                                let r = Math.floor((Math.random() * 255) + 1);
                                let g = Math.floor((Math.random() * 255) + 1);                                
                                let b = Math.floor((Math.random() * 255) + 1);
                                chartData.datasets.push({
                                    key: row.mamon,
                                    label: row.name,
                                    backgroundColor: "rgba(?, ?, ?, 0.6)".replace('?', r).replace('?', g).replace('?', b),
                                    borderColor: "rgba(?, ?, ?, 1)".replace('?', r).replace('?', g).replace('?', b),
                                    borderWidth: 1,
                                    data: [],
                                })
                            }
                            scores[row.year][row.month].push(row)
                        }

                        for (let l of chartData.labels) {
                            let a = l.split('/');
                            for (let d of chartData.datasets) {
                                let s = scores[a[1]][a[0]];
                                let diem = 0;
                                for (let a of s) {
                                    if (a.mamon == d.key) {                                        
                                        diem = JSON.parse(a.score).thucte;
                                        if (isNaN(diem)) {
                                            let a = 0;
                                            let count = 0;
                                            for (let d of diem) {
                                                if (!isNaN(d.d)
                                                && d.d.trim() != '') {
                                                    a += Number(d.d);
                                                    count ++;
                                                }
                                            }
                                            diem = a / count;
                                        }
                                    }
                                }
                                d.data.push(diem);
                            }
                        }                        

                        this.setState({
                            danhsachgiaovien: danhsachgiaovien,
                            danhsachquanly: danhsachquanly,
                            scores: scores,
                            chartData: chartData,
                            thangnam: {listnam: listnam, },
                        })
                    } break;
                    case 'form_call_rowcallcskh_addreportcskh': {
                        let reportcskh = '';
                        let IDs = [];
                        if (this.state.qlph) {
                            for (let value of this.state.dsqlphanhoi) {
                                reportcskh += 'INSERT INTO `quanlyhocsinh`.`REPORTCSKH` (`CCID`, `staffCode`, `isDeactivate`) VALUES (\'!\?!\', \'!\?!\', \'0\'); ';
                                reportcskh = reportcskh.replace('!\?!', rows[0].insertId);
                                reportcskh = reportcskh.replace('!\?!', value.value);
                                IDs.push(value.value);
                            }
                        }
                
                        if (this.state.gvph) {
                            for (let value of this.state.dsgvphanhoi) {
                                reportcskh += 'INSERT INTO `quanlyhocsinh`.`REPORTCSKH` (`CCID`, `staffCode`, `isDeactivate`) VALUES (\'!\?!\', \'!\?!\', \'0\'); ';
                                reportcskh = reportcskh.replace('!\?!', rows[0].insertId);
                                reportcskh = reportcskh.replace('!\?!', value.value);
                                IDs.push(value.value);
                            }
                        }

                        this.SocketEmit('gui-query-den-database', reportcskh , 'laydulieu_trave', {
                            fn: 'form_call_rowcallcskh_Successed',
                            transaction: true,
                            transactioncommit: true,
                        });
                        this.SocketEmit('all-notification-update', {
                            to: 'users',
                            IDs: IDs,
                            fn: 'dailynotification',
                            elements: ['chamsockhachhang']
                        });
                    } break;
                    case 'form_call_rowcallcskh_Successed': {
                        try {
                            this.fn();
                        } catch (e) {
                            this.close();
                        }
                    } break;
                    case 'form_call_rowcallcskh_loadphanhoikhachhang': {
                        let listNhanvienph = [];
                        for (let row of rows) {
                            listNhanvienph.push({...row, label: row['Mã Nhân Viên Phản Hồi'] + ' - ' + row['Họ Và Tên Nhân Viên Phản Hồi']});
                        }
                        this.setState({
                            listNhanvienph: listNhanvienph,
                            nhanvienph: null,
                        });
                    } break;
                    default:
                }
            }
        }  
    }

    componentDidMount () {
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
        this.props.getMe(this);
        this.loadData();
        if (this.props.dataOld != null) {
            this.setState({
                now: this.props.dataOld.length - 1,
                isLoad: true,
            })
        }
    }

    componentWillUnmount() {
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.data != this.props.data) {
            this.loadData();
        }

        if (this.props.dataOld != null && prevProps.dataOld != this.props.dataOld) {
            this.setState({
                now: this.props.dataOld.length - 1,
                isLoad: true,
            })
        }

        if (this.state.isLoad == true) {
            this.loadData_Old();
            this.setState({isLoad: false});
        }
    }

    loadData () {
        if (this.props.data != null) {
            let rows = this.props.data;
            this.refs.hovaten.value = rows['Họ Và Tên'];
            this.refs.truong.value = rows['Tên Trường'];
            this.refs.lop.value = rows['Lớp'];
            if (rows['Số Điện Thoại'] != null) {
                this.sodienthoai.value(rows['Số Điện Thoại']);
            } else {
                this.sodienthoai.value('');
            }
            this.refs.hovatennt1.value = rows['Họ Và Tên (NT1)'];
            if (rows['Số Điện Thoại (NT1)'] != null) {
                this.sodienthoaint1.value(rows['Số Điện Thoại (NT1)']);
            } else {
                this.sodienthoaint1.value('');
            }
            this.refs.nghenghiepnt1.value = rows['Nghề Nghiệp (NT1)'];
            this.refs.hovatennt2.value = rows['Họ Và Tên (NT2)'];
            if (rows['Số Điện Thoại (NT2)'] != null) {
                this.sodienthoaint2.value(rows['Số Điện Thoại (NT2)']);
            } else {
                this.sodienthoaint2.value('');
            }
            this.refs.nghenghiepnt2.value = rows['Nghề Nghiệp (NT2)'];

            this.setState({
                tinhtrangcuocgoi: null,
                mucdohailong: null,
                danhsachgiaovien: [],
                danhsachquanly: [],
                dsgvphanhoi: [],
                dsqlphanhoi: [],
                qlph: false,
                gvph: false,
                soluongkehoachtrongngay: null,
                nhamang: rows['Nhà Mạng'],
            })
            this.refs.ngaykehoach.value = '';
            this.refs.kehoach.value = '';
            this.refs.noidungcuocgoi.value = '';
            this.refs.phanloaimucdo.value = 0;

            let query = 'SELECT QUANLY.`Họ Và Tên`, QUANLY.`Mã Quản Lý` FROM QUANLY WHERE ' +
            '(permission = \'tbmvanhoa\' OR ' +
            'permission = \'tbmanhvan\' OR ' +
            'permission = \'cskh\' OR ' +
            'permission = \'ketoan\' OR ' +
            'permission = \'thuquy\' OR ' +
            'permission = \'modtpmar\' OR ' +
            'permission = \'modtpcl\' OR ' +
            'permission = \'modcl\' OR ' +
            'permission = \'modmar\' OR ' +
            'permission = \'mod\') AND ' +
            '(QUANLY.`Cơ Sở` = \'!\?!\' OR '.replace('!\?!', $('.khuvuc').attr('value')) +
            'QUANLY.`Cơ Sở` LIKE \'%!\?!,%\' OR '.replace('!\?!', $('.khuvuc').attr('value')) +
            'QUANLY.`Cơ Sở` LIKE \'%,!\?!%\') AND '.replace('!\?!', $('.khuvuc').attr('value')) +
            'QUANLY.`Ngày Nghỉ` IS NULL; ' +
            'SELECT LOPHOC.`Mã Lớp`, GIAOVIEN.`Mã Giáo Viên`, GIAOVIEN.`Họ Và Tên` AS `gvname`, ' +
            'LOPHOC.`Mã Môn Học`, DANHSACHMONHOC.name ' +
            'FROM DANHSACHHOCSINHTRONGLOP ' +
            'LEFT JOIN LOPHOC ON LOPHOC.`Mã Lớp` = DANHSACHHOCSINHTRONGLOP.`Mã Lớp` ' +
            'LEFT JOIN GIAOVIEN ON LOPHOC.`Mã Giáo Viên` = GIAOVIEN.`Mã Giáo Viên` ' +
            'LEFT JOIN DANHSACHMONHOC ON LOPHOC.`Mã Môn Học` = DANHSACHMONHOC.mamon ' +
            'WHERE `User ID` = \'!\?!\'; ';
            query += 'SELECT SCORESHEETS.*, DANHSACHMONHOC.mamon, DANHSACHMONHOC.name, GIAOVIEN.`Họ Và Tên` AS `teacherName` FROM SCORESHEETS ' + 
            'LEFT JOIN LOPHOC ON LOPHOC.`Mã Lớp` = SCORESHEETS.`classID` ' +
            'LEFT JOIN DANHSACHMONHOC ON DANHSACHMONHOC.`mamon` = LOPHOC.`Mã Môn Học` ' + 
            'LEFT JOIN GIAOVIEN ON GIAOVIEN.`Mã Giáo Viên` = LOPHOC.`Mã Giáo Viên` ' +
            'WHERE SCORESHEETS.`userID` = \'!\?!\'; ';
            query = query.replace(/!\?!/g, rows['User ID']);
            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                fn : 'form_call_rowcallcskh_loadthongtin',
            });
        }
    }

    loadData_Old () {
        if (this.props.dataOld != null
        && this.props.dataOld.length > 0) {
            let __now = this.state.now;
            let data = this.props.dataOld[__now];
            this.refs.old_hovatennhanvien.value = data['Họ Tên Nhân Viên'];
            if (data['Ngày Gọi'] != '' && data['Ngày Gọi'] != null) {
                this.refs.old_ngaygoi.value = new Date(data['Ngày Gọi']).toLocaleDateString('en-GB') + ' ' + new Date(data['Ngày Gọi']).toLocaleTimeString();
            }
            this.refs.old_noidungcuocgoi.value = data['Nội Dung Cuộc Gọi'];
            if (data['Ngày Kế Hoạch'] != '' && data['Ngày Kế Hoạch'] != null) {
                this.refs.old_ngaykehoach.value = new Date(data['Ngày Kế Hoạch']).toLocaleDateString('en-GB');
            }
            this.refs.old_kehoach.value = data['Kế Hoạch'];
            this.refs.old_trinhtrangcuocgoi.value = data['Tình Trạng Cuộc Gọi'];
            if (data['Mức Độ Hài Lòng'] == null) {
                this.refs.old_mucdohailong.value = '';
            } else {
                this.refs.old_mucdohailong.value = data['Mức Độ Hài Lòng'];
            }
            this.refs.old_phanhoi.value = '';
            
            let query = 'SELECT * FROM quanlyhocsinh.REPORTCSKH_VIEW WHERE `CCID` = \'!\?!\' '
            query = query.replace('!\?!', data['ID']);
            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                fn: 'form_call_rowcallcskh_loadphanhoikhachhang',
            });

            let shownext = 'block';
            let showback = 'block';

            if (__now == 0) {
                showback = 'none';
            }

            if (__now == (this.props.dataOld.length - 1)) {
                shownext = 'none';
            }

            this.setState({
                now: __now,
                shownext: shownext,
                showback: showback,
            })
        }
    }

    onChangeNgayKeHoach () {
        let ngaykehoach = this.refs.ngaykehoach.value;
        if (ngaykehoach != null && ngaykehoach != '') {
            let query = 'SELECT COUNT(CHAMSOCKHACHHANG_VIEW.`ID`) AS count ' +
            'FROM CHAMSOCKHACHHANG_VIEW ' +
            'WHERE CHAMSOCKHACHHANG_VIEW.`Ngày Kế Hoạch` = \'!\?!\' ' +
            'AND CHAMSOCKHACHHANG_VIEW.`Cơ Sở` = \'!\?!\'';
            query = query.replace('!\?!', ngaykehoach);
            query = query.replace('!\?!', $('.khuvuc').attr('value'));
            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                fn : 'goidiendata_rowcall_loadtongngaykehoach',
            });
        } else {
            this.setState({soluongkehoachtrongngay: null});
        }
    }

    dongy (fn, fn2) {
        this.fn = fn;
        let check = false;
        this.refs.tinhtrangcuocgoi.wrapper.getElementsByClassName('Select-control')[0].style.borderColor = 'rgb(204, 204, 204)';
        this.refs.mucdohailong.wrapper.getElementsByClassName('Select-control')[0].style.borderColor = 'rgb(204, 204, 204)';
        this.refs.noidungcuocgoi.style.borderColor = 'rgb(204, 204, 204)';
        this.refs.ngaykehoach.style.borderColor = 'rgb(204, 204, 204)';
        this.refs.kehoach.style.borderColor = 'rgb(204, 204, 204)';

        if (this.state.tinhtrangcuocgoi == null) {
            this.refs.tinhtrangcuocgoi.wrapper.getElementsByClassName('Select-control')[0].style.borderColor = 'red';
            check = true;
        } else if (this.state.tinhtrangcuocgoi.value == 'Cuộc gọi thành công') {
            if (this.state.mucdohailong == null) {
                this.refs.mucdohailong.wrapper.getElementsByClassName('Select-control')[0].style.borderColor = 'red';
                check = true;
            }
            
            if (this.refs.noidungcuocgoi == null || this.refs.noidungcuocgoi.value == '') {
                this.refs.noidungcuocgoi.style.borderColor = 'red';
                check = true;
            }

            if (this.refs.ngaykehoach == null || this.refs.ngaykehoach.value == '') {
                this.refs.ngaykehoach.style.borderColor = 'red';
                check = true;
            }

            if (this.refs.kehoach == null || this.refs.kehoach.value == '') {
                this.refs.kehoach.style.borderColor = 'red';
                check = true;
            }
        }

        if (check) {
            try {
                fn2();
            } catch (e) {
                
            }
            return;
        }

        let id = this.props.data['ID'];
        let userid = this.props.data['User ID'];
        let manhanvien = $('#lable_button_nexttoicon').attr('value');
        let ngaykehoach = this.refs.ngaykehoach.value;
        let kehoach = this.refs.kehoach.value;
        let date = new Date();
        let time = ("0" + date.getHours()).slice(-2) + ':' + ("0" + date.getMinutes()).slice(-2) + ':' + ("0" + date.getSeconds()).slice(-2);
        date = date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2);
        let ngaygoi = date + ' ' + time;
        let tinhtrangcuocgoi = this.state.tinhtrangcuocgoi.value;
        let mucdohailong = this.state.mucdohailong;
        if (mucdohailong != null) {
            mucdohailong = this.state.mucdohailong.value;
        }
        let noidungcuocgoi = this.refs.noidungcuocgoi.value;
        let phanloaimucdo = this.refs.phanloaimucdo.value;
        let hotline = this.props.sohotline;

        let query = '';
        query = 'INSERT INTO `CHAMSOCKHACHHANG` (`User ID`, `Mã Nhân Viên`, `Ngày Kế Hoạch`, `Kế Hoạch`, `Ngày Gọi`, `Tình Trạng Cuộc Gọi`, `Mức Độ Hài Lòng`, `Phân Loại Mức Độ`, `Nội Dung Cuộc Gọi`, `Hotline`) VALUES (\'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\'); ' +
        'UPDATE `USERS` SET `Lớp`=\'!\?!\', `Họ Và Tên (NT1)`=\'!\?!\', `Nghề Nghiệp (NT1)`=\'!\?!\', `Họ Và Tên (NT2)`=\'!\?!\', `Nghề Nghiệp (NT2)`=\'!\?!\', `Tên Trường`=\'!\?!\' WHERE `ID`=\'!\?!\'; ';

        query = query.replace('!\?!', userid);
        query = query.replace('!\?!', manhanvien);
        if (ngaykehoach == '') {
            query = query.replace('!\?!', 'null');
        } else {
            query = query.replace('!\?!', ngaykehoach);
        }
        query = query.replace('!\?!', kehoach);
        query = query.replace('!\?!', ngaygoi);
        query = query.replace('!\?!', tinhtrangcuocgoi);
        query = query.replace('!\?!', mucdohailong);
        query = query.replace('!\?!', phanloaimucdo);
        query = query.replace('!\?!', noidungcuocgoi);
        query = query.replace('!\?!', hotline);
        query = query.replace(/\'null\'/g, 'null');

        query = query.replace('!\?!', this.refs.lop.value);
        query = query.replace('!\?!', this.refs.hovatennt1.value);
        query = query.replace('!\?!', this.refs.nghenghiepnt1.value);
        query = query.replace('!\?!', this.refs.hovatennt2.value);
        query = query.replace('!\?!', this.refs.nghenghiepnt2.value);
        query = query.replace('!\?!', this.refs.truong.value);
        query = query.replace('!\?!', id);

        let transaction = false;
        if (this.state.qlph
        || this.state.gvph) {
            transaction = true;
        }
                
        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn: 'form_call_rowcallcskh_addreportcskh',
            isReload: true,
            isSuccess: true,
            transaction: transaction,
        });
        if (transaction == false) {
            fn();
        }
    }

    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    }

    back () {
        if (this.props.dataOld != null && this.props.dataOld.length > 0) {
            let __now = this.state.now - 1;
            this.setState({
                now: __now,
                isLoad: true,
            })
        }
    }

    next () {
        if (this.props.dataOld != null && this.props.dataOld.length > 0) {
            let __now = this.state.now + 1;
            this.setState({
                now: __now,
                isLoad: true,
            })
        }
    }

    render () {
        let mindate = ''
        let today = new Date();
        mindate = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);

        let soluongkehoachtrongngay = '';
        if (this.state.soluongkehoachtrongngay != null) {
            soluongkehoachtrongngay = 
            <span style={{
                "color": "red",
                "font-style": "italic",
            }}>
                {'Có ' + this.state.soluongkehoachtrongngay + ' data đang được kế hoạch!'}
            </span>
        }

        let display_old = 'none';
        let columns_grid = null;
        if (this.props.dataOld != null && this.props.dataOld.length > 0) {
            display_old = 'block';
            columns_grid = '33.33% auto';
        }

        let nhamang = '';
        if (this.state.nhamang != null
        && this.state.nhamang != '') {
            nhamang = 
            <div style={{
                'background': '#c2e0ff',
                'font-weight': 'bold',
                'color': 'blue',
            }}>
                {this.state.nhamang}
            </div>
        }

        return (
            <div style={{
                "display": "grid",
                "grid-template-columns": columns_grid,
            }}>
                <div style={{'display': display_old}}>
                    <div>
                        <fieldset style={{
                            'margin': '5px',
                            'padding': '0',
                        }}>
                            <legend>
                                <div style={{
                                    'float': 'left',
                                    'padding': '0 10px',
                                    'display': this.state.showback,
                                }} onClick={this.back.bind(this)} className="custombutton">
                                    <i class="fa fa-chevron-circle-left" aria-hidden="true"></i>
                                </div>
                                {'Lịch Sử Cuộc Gọi'}
                                <div style={{
                                    'float': 'right',
                                    'padding': '0 10px',
                                    'display': this.state.shownext,
                                }} onClick={this.next.bind(this)} className="custombutton">
                                    <i class="fa fa-chevron-circle-right" aria-hidden="true"></i>
                                </div>
                            </legend>
                            <div className='divformstyle'>
                                <div>
                                    <label for="" >Họ Và Tên Nhân Viên: </label>
                                    <input type="text" name="" ref='old_hovatennhanvien' disabled={true} className='read_only'/>
                                </div>
                                <div>
                                    <label for="" >Ngày Gọi: </label>
                                    <input type="text" name="" ref='old_ngaygoi' disabled={true} className='read_only'/>
                                </div>
                                <div>
                                    <label for="" >Tình Trạng Cuộc Gọi: </label>
                                    <input type="text" name="" ref='old_trinhtrangcuocgoi' disabled={true} className='read_only'/>
                                </div>
                                <div>
                                    <label for="" >Mức Độ Hài Lòng: </label>
                                    <input type="text" name="" ref='old_mucdohailong' disabled={true} className='read_only'/>
                                </div>
                                <div>
                                    <label for="" >Nội Dung Cuộc Gọi: </label>
                                    <textarea 
                                        ref="old_noidungcuocgoi"
                                        style={{'height' : '75px'}}
                                        disabled={true}
                                        className='read_only'>
                                    </textarea>
                                </div>
                                <div>
                                    <label for="" >Ngày Kế Hoạch: </label>
                                    <input type="text" name="" ref='old_ngaykehoach' disabled={true} className='read_only'/>
                                </div>
                                <div>
                                    <label for="" >Kế Hoạch: </label>
                                    <input type="text" name="" ref='old_kehoach' disabled={true} className='read_only'/>
                                </div>
                            </div>
                            <div className="unsetdivformstyle">
                                <label for="">Nhân Viên Phản Hồi: </label>
                                <Select
                                    placeholder="--- Nhân Viên Phản Hồi ---"
                                    value={this.state.nhanvienph}
                                    options={this.state.listNhanvienph}
                                    onChange={(v) => {
                                        this.setState({nhanvienph: v})
                                        if (v != null
                                        && v['Nội Dung Phản Hồi'] != null) {
                                            this.refs.old_phanhoi.value = v['Nội Dung Phản Hồi'];
                                        } else {
                                            this.refs.old_phanhoi.value = '';
                                        }
                                    }}
                                />
                            </div>
                            <div className='divformstyle'>
                                <div>
                                    <label for="">Nội Dung Phản Hồi: </label>
                                    <textarea 
                                        ref="old_phanhoi"
                                        style={{'height' : '75px'}}
                                        disabled={true}
                                        className='read_only'>
                                    </textarea>
                                </div>
                            </div>
                        </fieldset>
                    </div>
                </div>
                <div
                    className={styleRowCall.container}
                >
                    <div>
                        <label for="" >Họ Và Tên: </label>
                        <input type="text" name="" ref='hovaten' disabled={true} className='read_only' className={styleRowCall.item}/>
                    </div>
                    <div>
                        <label for="" >Trường: </label>
                        <input type="text" name="" ref='truong' className={styleRowCall.item}/>
                    </div>
                    <div>
                        <label for="" >Lớp: </label>
                        <input type="text" name="" ref='lop' className={styleRowCall.item}/>
                    </div>
                    <div>
                        <SoDienThoai getMe={me => this.sodienthoai = me} disabled={true} chuyendausonhamang={this.props.chuyendausonhamang} className={styleRowCall.item}/>
                        {nhamang}
                    </div>
                    <div
                        style={{
                            position: 'relative',
                            overflow: 'hidden',
                            height: (() => {
                                if (this.state.moreInfor) {
                                    return '340px';
                                }
                                return '20px';
                            })(),
                            transition: '0.3s',
                        }}
                    >
                        <div
                            style={{
                                cursor: 'pointer',
                                userSelect: 'none',
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                        >
                            <div
                                onClick={() => {
                                    this.setState({
                                        moreInfor: !this.state.moreInfor,
                                    })
                                }}
                                className={styleRowCall.buttonShowhide}
                            >
                                {(() => {
                                    if (this.state.moreInfor) {
                                        return 'Hiển thị tối giản...';
                                    }
                                    return 'Hiển thị thêm thông tin...';
                                })()}
                            </div>
                        </div>
                        <div
                            style={{
                                position: 'absolute',
                                marginTop: '3px',
                                width: 'calc(100% - 32px)',
                            }}
                        >                            
                            <div>
                                <label for="" >Người Thân (Bố/Anh/Chú): </label>
                                <input type="text" name="" ref='hovatennt1' className={styleRowCall.item}/>
                            </div>
                            <div>
                                <SoDienThoai getMe={me => this.sodienthoaint1 = me} disabled={true} chuyendausonhamang={this.props.chuyendausonhamang} className={styleRowCall.item}/>
                            </div>
                            <div>
                                <label for="" >Nghề Nghiệp: </label>
                                <input type="text" name="" ref='nghenghiepnt1' className={styleRowCall.item}/>
                            </div>
                            <div>
                                <label for="" >Người Thân (Mẹ/Chị/Dì): </label>
                                <input type="text" name="" ref='hovatennt2' className={styleRowCall.item}/>
                            </div>
                            <div>
                                <SoDienThoai getMe={me => this.sodienthoaint2 = me} disabled={true} chuyendausonhamang={this.props.chuyendausonhamang} className={styleRowCall.item}/>
                            </div>
                            <div>
                                <label for="" >Nghề Nghiệp: </label>
                                <input type="text" name="" ref='nghenghiepnt2' className={styleRowCall.item}/>
                            </div>
                        </div>
                    </div>                    
                    <div style={{
                        height: '200px',
                    }}>
                        <Bar
                            ref="chartjs_bar"
                            data={this.state.chartData}
                            height={200}
                            options={{
                                // onClick: this.onClickChart.bind(this),
                                maintainAspectRatio: false,
                                legend:{
                                    display: true,
                                    position:'top',
                                },
                                barValueSpacing: 20,
                                scales: {
                                    yAxes: [{
                                        ticks: {
                                            min: 0,
                                            max: this.state.maxValue,
                                        }
                                    }]
                                }
                            }}
                        />
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '50% 50%',
                    }}>
                        <Select
                            placeholder="--- Năm ---"
                            value={this.state.thangnam.nam}
                            options={this.state.thangnam.listnam}
                            onChange={(v) => {
                                let a = this.state.thangnam;
                                let thang = [];
                                if (v != null) {
                                    for (let key in this.state.scores[v.value]) {
                                        thang.push({label: key, value: key, })
                                    }
                                }
                                a.listthang = thang;
                                a.thang = null;
                                a.listmon = null;
                                a.nam = v;
                                this.setState({thangnam: a})
                            }}
                        />
                        <Select
                            placeholder="--- Tháng ---"
                            value={this.state.thangnam.thang}
                            options={this.state.thangnam.listthang}
                            onChange={(v) => {
                                let a = this.state.thangnam;
                                a.thang = v;                                    
                                let listMon = null;
                                if (v != null) {
                                    let data = this.state.scores[this.state.thangnam.nam.value][v.value];
                                    let check = [];
                                    listMon = [];
                                    let change = null;
                                    for (let a of data) {
                                        if (check.indexOf(a.mamon) == -1) {
                                            check.push(a.mamon);
                                            listMon.push({value: a.mamon, label: a.name, })
                                            if (change == null) {
                                                change = {value: a.mamon, label: a.name, };
                                            }
                                        }
                                    }
                                    a.mon = change;
                                }
                                a.listmon = listMon;
                                this.setState({thangnam: a})
                            }}
                        />
                    </div>
                    {(() => {                                    
                        if (this.state.thangnam.listmon != null) {
                            return (
                                <div>
                                    <Select
                                        placeholder="--- Môn học ---"
                                        value={this.state.thangnam.mon}
                                        options={this.state.thangnam.listmon}
                                        onChange={(v) => {
                                            if (v != null) {
                                                let a = this.state.thangnam;
                                                a.mon = v;
                                                this.setState({thangnam: a})
                                            }
                                        }}
                                    />
                                </div>
                            )
                        }                                    
                    })()}
                    {(() => {                                    
                        if (this.state.thangnam.listmon != null
                        && this.state.thangnam.mon != null) {
                            let data = this.state.scores[this.state.thangnam.nam.value][this.state.thangnam.thang.value];                            
                            let value = [];
                            for (let d of data) {
                                if (d.mamon == this.state.thangnam.mon.value) {
                                    let score = JSON.parse(d.score);
                                    let score_view = null;
                                    if (!isNaN(score.thucte)) {                                        
                                        score_view = {diem: [{d: score.thucte}]};
                                    } else {
                                        score_view = {diem: score.thucte};
                                    }
                                    try {
                                        let nx = d.content;
                                        nx = nx.replace(/\n/g, '\\n');
                                        nx = nx.replace(/\r/g, '\\r');    
                                        nx = JSON.parse(nx);
                                        score_view.nhanxet = nx.nhanxet;
                                        score_view.giaiphap = nx.giaiphap;
                                    } catch (error) {
                                        score_view.nhanxet = '';
                                        score_view.giaiphap = '';
                                    }                                    
                                    value.push(score_view);
                                }
                            }                            
                            return (
                                <div>
                                    {
                                        value.map(v => {
                                            return (
                                                <div style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'max-content auto',
                                                    border: '1px dashed #444',
                                                    padding: '5px',
                                                    marginBottom: '5px',
                                                }}>
                                                    <div style={{
                                                        margin: '0px 10px',
                                                    }}>
                                                        {v.diem.map(v2 => {
                                                            let d = v2.d;
                                                            if (!isNaN(v2.d)) {
                                                                switch (true) {
                                                                    case d >= 9:
                                                                        d = 'A'
                                                                        break;                                                                
                                                                    case d < 9 && d >= 7:
                                                                        d = 'B'
                                                                        break;
                                                                    case d < 7 && d >= 5:
                                                                        d = 'C'
                                                                        break;
                                                                    case d < 5:
                                                                        d = 'F'
                                                                        break;
                                                                }
                                                            }
                                                            
                                                            if (v2.l != null) {
                                                                return (
                                                                    <div>
                                                                        {v2.l + ': ' + d + ' (' + v2.d + ')'}
                                                                    </div>
                                                                )
                                                            }
                                                            return (
                                                                <div>
                                                                    {d + ' (' + v2.d + ')'}
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                    <div>
                                                        <div>
                                                            <b>Nhận xét: </b>{v.nhanxet}
                                                        </div>
                                                        <div>
                                                            <b>Giải pháp: </b>{v.giaiphap}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            )
                        }                                    
                    })()}
                    <div>
                        <label for="">Tình Trạng Cuộc Gọi: </label>
                        <Select
                            placeholder="--- Tình Trạng Cuộc Gọi ---"
                            value={this.state.tinhtrangcuocgoi}
                            options={this.props.bangthongtin['Tình Trạng Cuộc Gọi']}
                            onChange={(v) => this.setState({tinhtrangcuocgoi: v})}
                            ref="tinhtrangcuocgoi"
                        />
                    </div>
                    <div>
                        <label for="">Mức Độ Hài Lòng: </label>
                        <Select
                            placeholder="--- Mức Độ Hài Lòng ---"
                            value={this.state.mucdohailong}
                            options={this.props.bangthongtin['Mức Độ Hài Lòng']}
                            onChange={(v) => this.setState({mucdohailong: v})}
                            ref="mucdohailong"
                        />
                    </div>
                    <div>
                        Tình Trạng Chăm Sóc:
                        <select ref="phanloaimucdo" className={styleRowCall.item}>
                            <option value="0">Phản hồi theo chu kỳ</option>
                            <option value="1">Phản hồi gấp</option>
                        </select>
                    </div>
                    <div>
                        <label for="" >Nội Dung Cuộc Gọi: </label>
                        <textarea 
                            ref="noidungcuocgoi" 
                            rows="4" 
                            cols="50"
                            style={{'height' : '75px'}}
                            className={styleRowCall.item}
                        ></textarea>
                    </div>
                    <div>
                        <input type="checkbox" style={{"width": "auto"}} checked={this.state.qlph} onChange={() => {this.setState({qlph: !this.state.qlph})}}/>
                        <label for="">Yêu Cầu Quản Lý Phản Hồi: </label>
                        {
                            (() => {
                                if (this.state.qlph) {
                                    return (
                                        <Select
                                            placeholder="--- Chọn Quản Lý Phản Hồi Ý Kiến Khách Hàng ---"
                                            value={this.state.dsqlphanhoi}
                                            options={this.state.danhsachquanly}
                                            onChange={(v) => this.setState({dsqlphanhoi: v})}
                                            multi
                                            ref="tinhtrangcuocgoi"
                                        />
                                    )  
                                } else {
                                    return (<div></div>)
                                }
                            })()
                        }
                    </div>
                    <div>
                        <input type="checkbox" style={{"width": "auto"}} checked={this.state.gvph} onChange={() => {this.setState({gvph: !this.state.gvph})}}/>
                        <label for="">Yêu Cầu Giáo Viên Phản Hồi: </label>
                        {
                            (() => {
                                if (this.state.gvph) {
                                    return (
                                        <Select
                                            placeholder="--- Chọn Giáo Viên Phản Hồi Ý Kiến Khách Hàng ---"
                                            value={this.state.dsgvphanhoi}
                                            options={this.state.danhsachgiaovien}
                                            onChange={(v) => this.setState({dsgvphanhoi: v})}
                                            multi
                                            ref="tinhtrangcuocgoi"
                                        />
                                    );
                                } else {
                                    return (<div></div>);
                                }
                            })()
                        }
                    </div>
                    <div>
                        <label for="" >Ngày Kế Hoạch: </label>
                        <input type="date" name="" ref='ngaykehoach' min={mindate} onChange={this.onChangeNgayKeHoach.bind(this)} className={styleRowCall.item}/>
                        {soluongkehoachtrongngay}
                    </div>
                    <div>
                        <label for="" >Kế Hoạch: </label>
                        <textarea 
                            ref="kehoach" 
                            rows="4" 
                            cols="50"
                            style={{'height' : '75px'}}
                            className={styleRowCall.item}
                        ></textarea>
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
  }) (RowCallCSKH);
