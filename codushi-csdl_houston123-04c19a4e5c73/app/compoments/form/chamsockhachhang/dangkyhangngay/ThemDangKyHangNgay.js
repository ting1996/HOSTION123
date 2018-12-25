import React from 'react';
import { connect } from 'react-redux';
import style from '../../style.css';
import SoDienThoai from '../../elements/SoDienThoai';
import DiaChi from '../../DiaChi';
import Select from 'react-select';

import Lop from '../../elements/Lop';
var ReactDOM = require('react-dom');

class ThemDangKyHangNgay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dulieudata: null,
            danhsachdata: [],

            monhocdukien: [],
            danhsachmonhoc: [],
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
        let query = '';
        if (hanhdong == 'laydulieu_trave') {
            if (dulieuguive != null) {
                switch (dulieuguive.fn) {
                    case 'chamsockhachhang_dangkyhangngay_load_danhsachmonhoc':
                        let danhsachmonhoc = [];
                        let monhocdukien = [];
                        let mhdk = null;
                        if (this.props.action == 'edit' && this.props.data != null) {
                            mhdk = this.props.data['monhocdukien'];
                            if (mhdk != null) {
                                mhdk = mhdk.split(',');
                            }
                        }
                        for (let row of rows) {
                            danhsachmonhoc.push({label: row['Tên Môn'], value: row['Mã Môn Học']});
                            if (mhdk != null && mhdk.indexOf(row['Mã Môn Học']) != -1) {
                                monhocdukien.push({label: row['Tên Môn'], value: row['Mã Môn Học']});
                            }
                        }
                        this.setState({
                            danhsachmonhoc: danhsachmonhoc,
                            monhocdukien: monhocdukien,
                        });
                        break;
                    case 'chamsockhachhang_dangkyhangngay_them_kiemtracacsodienthoai':
                        let checkfail = false;
                        let noidung = '';
                        for (let i = 0; i < rows.length; i++) {
                            let row = rows[i];
                            if (row.length > 0) {
                                checkfail = true;
                                noidung += '"';
                                for (let r of row) {
                                    noidung += r['Họ Và Tên'] + ', '
                                }
                                noidung += '" đang sử dụng các số điện thoại đã nhập ở bảng !\?!.\n'.replace('!\?!', dulieuguive.table[i]);
                            }
                        }
                        
                        if (noidung != '') {
                            noidung +=  '\nOK nếu chắc chắn muốn thêm!';
                            if (confirm(noidung)) {
                                checkfail = false;
                            }
                        }

                        if (!checkfail) {
                            let manhanvien = $('#lable_button_nexttoicon').attr('value');
                            let date = new Date();
                            let ngaydangky = date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2);
                            let hovaten = this.refs.hovaten.value;
                            let truong = this.refs.truong.value;
                            let lop = this.refs.lop.value();
                            let ngaysinh = this.refs.ngaysinh.value;
                            let sodienthoai = this.sodienthoai.state.value;
                            let diachi = this.diachi.value();
                            let hovatennt1 = this.refs.hovatennt1.value;
                            let sodienthoaint1 = this.sodienthoaint1.state.value;
                            let nghenghiepnt1 = this.refs.nghenghiepnt1.value;
                            let hovatennt2 = this.refs.hovatennt2.value;
                            let sodienthoaint2 = this.sodienthoaint2.state.value;
                            let nghenghiepnt2 = this.refs.nghenghiepnt2.value;
                            let ngayhocdukien = this.refs.ngayhocdukien.value;
                            let monhocdukien = '';
                            for (let monhoc of this.state.monhocdukien) {
                                if (monhocdukien == '') {
                                    monhocdukien += monhoc.value;
                                } else {
                                    monhocdukien += ',' + monhoc.value;
                                }                                
                            }
                            let noidungdangky = this.refs.noidungdangky.value;

                            query = 'INSERT INTO `quanlyhocsinh`.`DATADANGKYHANGNGAY` (`Mã Nhân Viên`, `Ngày Đăng Ký`, `Họ Và Tên`, `Lớp`, `Số Điện Thoại`, `Ngày Sinh`, `Địa Chỉ`, `Họ Và Tên (NT1)`, `Số Điện Thoại (NT1)`, `Nghề Nghiệp (NT1)`, `Họ Và Tên (NT2)`, `Số Điện Thoại (NT2)`, `Nghề Nghiệp (NT2)`, `Tên Trường`, `Nguồn`, `Ngày Học Dự Kiến`, `monhocdukien`, `Cơ Sở`, `isBusy`, `isOLD`, `isDeactivate`, `Ghi Chú`) VALUES (\'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'0\', \'0\', \'0\', \'!\?!\');'
                            query = query.replace('!\?!', manhanvien);
                            query = query.replace('!\?!', ngaydangky);
                            query = query.replace('!\?!', hovaten);
                            query = query.replace('!\?!', lop);
                            query = query.replace('!\?!', sodienthoai);
                            query = query.replace('!\?!', ngaysinh);
                            query = query.replace('!\?!', diachi);
                            query = query.replace('!\?!', hovatennt1);
                            query = query.replace('!\?!', sodienthoaint1);
                            query = query.replace('!\?!', nghenghiepnt1);
                            query = query.replace('!\?!', hovatennt2);
                            query = query.replace('!\?!', sodienthoaint2);
                            query = query.replace('!\?!', nghenghiepnt2);
                            query = query.replace('!\?!', truong);
                            query = query.replace('!\?!', $('#lable_button_nexttoicon').attr('value'));
                            query = query.replace('!\?!', ngayhocdukien);
                            query = query.replace('!\?!', monhocdukien);
                            query = query.replace('!\?!', $('.khuvuc').attr('value'));
                            query = query.replace('!\?!', noidungdangky);
                            query = query.replace(/\''/g, 'null');
                            query = query.replace(/\'null'/g, 'null');
                            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                                fn: 'chamsockhachhang_dangkyhangngay_them_success',
                                transaction: true,
                            });
                        }
                        break;
                    case 'chamsockhachhang_dangkyhangngay_them_checkdatatruongtiemnang':
                        let danhsachdata = [];
                        for (let value of rows) {
                            danhsachdata.push({ value: value['ID'], label: value['Họ Và Tên'], data: value});
                        }    
                        this.setState({
                            danhsachdata: danhsachdata,
                        });
                        break;
                    case 'chamsockhachhang_dangkyhangngay_them_success':
                        let insertId = rows.insertId;
                        let v = this.state.dulieudata;
                        if (v != null) {
                            let data = v.data;
                            query = 'SELECT * FROM quanlyhocsinh.CALLDATA WHERE `ID-DATA` = \'!\?!\';';
                            query = query.replace('!\?!', data['ID']);
                            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                                fn: 'chamsockhachhang_dangkyhangngay_them_movecalldata',
                                insertId: insertId,
                                id: data['ID'],
                                transaction: true,
                            });
                        } else {
                            query = 'SELECT * FROM quanlyhocsinh.DATADANGKYHANGNGAY WHERE `ID` = \'!\?!\''.replace('!\?!', insertId);
                            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                                fn: 'chamsockhachhang_dangkyhangngay_sua_success',
                                isSuccess: true,
                                isReload: true,
                                reloadPageName: 'cskhdangkyhangngay',
                                transaction: true,
                                transactioncommit: true,
                            });
                        }
                        break;
                    case 'chamsockhachhang_dangkyhangngay_them_movecalldata':
                        let changequery = '';
                        for (let row of rows) {
                            query = 'INSERT INTO `quanlyhocsinh`.`CALLDANGKYHANGNGAY` (`ID-DATA`, `Mã Nhân Viên`, `Ngày Kế Hoạch`, `Kế Hoạch`, `Ngày Gọi`, `Tình Trạng Cuộc Gọi`, `Chương Trình Gọi`, `Loại Thái Độ`, `Loại Nhu Cầu`, `Tình Hình Sử Dụng Sản Phẩm`, `Kế Hoạch Học Hè`, `Thời Gian PH Hẹn Lên`,`Nội Dung Cuộc Gọi`, `Hotline`, `fromCallDataTong`) VALUES (\'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'1\'); ';
                            query = query.replace('!\?!', dulieuguive.insertId);
                            query = query.replace('!\?!', row['Mã Nhân Viên']);
                            if (row['Ngày Kế Hoạch'] != null && row['Ngày Kế Hoạch'] != '') {
                                let date2 = (new Date(row['Ngày Kế Hoạch'])).toLocaleDateString('en-GB').split('/');                              
                                query = query.replace('!\?!', date2[2] + '-' + date2[1] + '-' + date2[0]);
                            } else {
                                query = query.replace('!\?!', 'null');
                            }
                            query = query.replace('!\?!', row['Kế Hoạch']);
                            if (row['Ngày Gọi'] != null && row['Ngày Gọi'] != '') {
                                let date = (new Date(row['Ngày Gọi'])).toLocaleDateString('en-GB').split('/');                              
                                query = query.replace('!\?!', date[2] + '-' + date[1] + '-' + date[0] + ' ' + (new Date(row['Ngày Gọi'])).toLocaleTimeString('en-GB'));
                            } else {
                                query = query.replace('!\?!', 'null');
                            }
                            query = query.replace('!\?!', row['Tình Trạng Cuộc Gọi']);
                            query = query.replace('!\?!', row['Chương Trình Gọi']);
                            query = query.replace('!\?!', row['Loại Thái Độ']);
                            query = query.replace('!\?!', row['Loại Nhu Cầu']);
                            query = query.replace('!\?!', row['Tình Hình Sử Dụng Sản Phẩm']);
                            query = query.replace('!\?!', row['Kế Hoạch Học Hè']);
                            query = query.replace('!\?!', row['Thời Gian PH Hẹn Lên']);
                            query = query.replace('!\?!', row['Nội Dung Cuộc Gọi']);
                            query = query.replace('!\?!', row['Hotline']);
                            query = query.replace(/\'null'/g, 'null');
                            changequery += query;
                            changequery += 'DELETE FROM `quanlyhocsinh`.`CALLDATA` WHERE `ID`=\'!\?!\'; '.replace('!\?!', row['ID']);
                        }

                        if (changequery != '') {
                            this.SocketEmit('gui-query-den-database', changequery , 'laydulieu_trave', {
                                fn: 'chamsockhachhang_dangkyhangngay_them_movesuccess',
                                id: dulieuguive.id,
                                transaction: true,
                            }); 
                        } else {
                            query = 'DELETE FROM `quanlyhocsinh`.`DATA_TRUONGTIEMNANG` WHERE `ID`=\'!\?!\'; '.replace('!\?!', dulieuguive.id);
                            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                                fn: 'chamsockhachhang_dangkyhangngay_sua_success',
                                isSuccess: true,
                                isReload: true,
                                reloadPageName: 'cskhdangkyhangngay',
                                transaction: true,
                                transactioncommit: true,
                            });
                        }
                        break;
                    case 'chamsockhachhang_dangkyhangngay_them_movesuccess':
                        query = 'DELETE FROM `quanlyhocsinh`.`DATA_TRUONGTIEMNANG` WHERE `ID`=\'!\?!\'; '.replace('!\?!', dulieuguive.id);
                        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                            fn: 'chamsockhachhang_dangkyhangngay_sua_success',
                            isSuccess: true,
                            isReload: true,
                            reloadPageName: 'cskhdangkyhangngay',
                            transaction: true,
                            transactioncommit: true,
                        });
                        break;
                    case 'chamsockhachhang_dangkyhangngay_sua_success':
                        this.close();
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
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
        this.changeSize();

        query = 'SELECT * FROM quanlyhocsinh.MONHOC_!\?!';
        query = query.replace('!\?!', $('.khuvuc').attr('value'));
        this.props.socket.emit('gui-query-den-database', query, 'laydulieu_trave', {
            fn : 'chamsockhachhang_dangkyhangngay_load_danhsachmonhoc',
        });
        

        switch (this.props.action) {
            case 'add':
                break;
            case 'edit':            
                let data = this.props.data;                
                this.refs.hovaten.value = data['Họ Và Tên'];
                this.refs.truong.value = data['Tên Trường'];
                this.refs.lop.value(data['Lớp']);
                if (data['Ngày Sinh'] != null && data['Ngày Sinh'] != '') {
                    let date2 = new Date(data['Ngày Sinh']);
                    this.refs.ngaysinh.value = date2.getFullYear() + '-' + ("0" + (date2.getMonth() + 1)).slice(-2) + '-' + ("0" + date2.getDate()).slice(-2);
                }
                this.sodienthoai.setState({value: data['Số Điện Thoại']});
                this.diachi.value(data['Địa Chỉ']);
                this.refs.hovatennt1.value = data['Họ Và Tên (NT1)'];
                this.sodienthoaint1.setState({value: data['Số Điện Thoại (NT1)']});
                this.refs.nghenghiepnt1.value = data['Nghề Nghiệp (NT1)'];
                this.refs.hovatennt2.value = data['Họ Và Tên (NT2)'];
                this.sodienthoaint2.setState({value: data['Số Điện Thoại (NT2)']});
                this.refs.nghenghiepnt2.value = data['Nghề Nghiệp (NT2)'];
                if (data['Ngày Học Dự Kiến'] != null && data['Ngày Học Dự Kiến'] != '') {
                    let date3 = new Date(data['Ngày Học Dự Kiến']);
                    this.refs.ngayhocdukien.value = date3.getFullYear() + '-' + ("0" + (date3.getMonth() + 1)).slice(-2) + '-' + ("0" + date3.getDate()).slice(-2);
                }
                this.refs.noidungdangky.value = data['Ghi Chú'];
                break;
            default:
                this.close();
        }   
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.changeSize);
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.monhocdukien != this.state.monhocdukien) {
            this.changeSize();
        }
    }

    dongy () {
        let checkfail = false;
        let sodienthoai = '';
        let querycheck = '';
        this.refs.hovaten.style.borderColor  = 'rgb(204, 204, 204)';
        this.sodienthoai.refs.input.style.borderColor = 'rgb(204, 204, 204)';
        this.sodienthoaint1.refs.input.style.borderColor = 'rgb(204, 204, 204)';
        this.sodienthoaint2.refs.input.style.borderColor = 'rgb(204, 204, 204)';

        if (this.sodienthoai.state.value != null && this.sodienthoai.state.value != '' && this.sodienthoai.state.value.length >= 10) {
            sodienthoai = this.sodienthoai.state.value
            querycheck += '`Số Điện Thoại` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT1)` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT2)` LIKE \'%!\?!%\' OR '.replace(/\!\?!/g, sodienthoai);
            if (sodienthoai[0] == '0') {
                querycheck += '`Số Điện Thoại` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT1)` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT2)` LIKE \'%!\?!%\' OR '.replace(/\!\?!/g, sodienthoai.substring(1, sodienthoai.length));;
            }
        } else if (this.sodienthoai.state.value != null && this.sodienthoai.state.value != '' && this.sodienthoai.state.value.length < 10) {
            this.sodienthoai.refs.input.style.borderColor = 'red';
        }

        let sodienthoaint1 = ''
        if (this.sodienthoaint1.state.value != null && this.sodienthoaint1.state.value != '' && this.sodienthoaint1.state.value.length >= 10) {
            sodienthoaint1 = this.sodienthoaint1.state.value
            querycheck += '`Số Điện Thoại` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT1)` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT2)` LIKE \'%!\?!%\' OR '.replace(/\!\?!/g, sodienthoaint1);
            if (sodienthoaint1[0] == '0') {
                querycheck += '`Số Điện Thoại` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT1)` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT2)` LIKE \'%!\?!%\' OR '.replace(/\!\?!/g, sodienthoaint1.substring(1, sodienthoaint1.length));;
            }
        } else if (this.sodienthoaint1.state.value != null && this.sodienthoaint1.state.value != '' && this.sodienthoaint1.state.value.length < 10) {
            this.sodienthoaint1.refs.input.style.borderColor = 'red';
        }

        let sodienthoaint2 = ''        
        if (this.sodienthoaint2.state.value != null && this.sodienthoaint2.state.value != '' && this.sodienthoaint2.state.value.length >= 10) {
            sodienthoaint2 = this.sodienthoaint2.state.value
            querycheck += '`Số Điện Thoại` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT1)` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT2)` LIKE \'%!\?!%\' OR '.replace(/\!\?!/g, sodienthoaint2);
            if (sodienthoaint2[0] == '0') {
                querycheck += '`Số Điện Thoại` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT1)` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT2)` LIKE \'%!\?!%\' OR '.replace(/\!\?!/g, sodienthoaint2.substring(1, sodienthoaint2.length));;
            }
        } else if (this.sodienthoaint2.state.value != null && this.sodienthoaint2.state.value != '' && this.sodienthoaint2.state.value.length < 10) {
            this.sodienthoaint2.refs.input.style.borderColor = 'red';
        }
        
        if (querycheck != '') {
            querycheck = querycheck.substring(0, querycheck.length - ' OR '.length);
        }

        let hovaten = this.refs.hovaten.value;
        if (hovaten == '') {
            this.refs.hovaten.style.borderColor = 'red';
            checkfail = true;
        }
        
        if (sodienthoai == '' && sodienthoaint1 == '' && sodienthoaint2 == '') {
            this.sodienthoai.refs.input.style.borderColor = 'red';
            this.sodienthoaint1.refs.input.style.borderColor = 'red';
            this.sodienthoaint2.refs.input.style.borderColor = 'red';
            checkfail = true;
        }

        if (checkfail) {
            return;
        } else {
            let query = '';
            switch (this.props.action) {
                case 'add':
                    query = 'SELECT * FROM quanlyhocsinh.DATADANGKYHANGNGAY WHERE ' + querycheck + '; ' +
                    'SELECT * FROM quanlyhocsinh.USERS WHERE ' + querycheck + ';';
                    this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                        fn: 'chamsockhachhang_dangkyhangngay_them_kiemtracacsodienthoai',
                        table: ['Đăng Ký Hàng Ngày', 'Users'],
                    });
                    break;
                case 'edit':
                    let hovaten = this.refs.hovaten.value;
                    let truong = this.refs.truong.value;
                    let lop = this.refs.lop.value();
                    let ngaysinh = this.refs.ngaysinh.value;
                    let sodienthoai = this.sodienthoai.state.value;
                    let diachi = this.diachi.value();
                    let hovatennt1 = this.refs.hovatennt1.value;
                    let sodienthoaint1 = this.sodienthoaint1.state.value;
                    let nghenghiepnt1 = this.refs.nghenghiepnt1.value;
                    let hovatennt2 = this.refs.hovatennt2.value;
                    let sodienthoaint2 = this.sodienthoaint2.state.value;
                    let nghenghiepnt2 = this.refs.nghenghiepnt2.value;
                    let ngayhocdukien = this.refs.ngayhocdukien.value;
                    let monhocdukien = '';
                    for (let monhoc of this.state.monhocdukien) {
                        if (monhocdukien == '') {
                            monhocdukien += monhoc.value;
                        } else {
                            monhocdukien += ',' + monhoc.value;
                        }                                
                    }
                    let noidungdangky = this.refs.noidungdangky.value;

                    query = 'UPDATE `quanlyhocsinh`.`DATADANGKYHANGNGAY` SET `Họ Và Tên`=\'!\?!\', `Lớp`=\'!\?!\', `Số Điện Thoại`=\'!\?!\', `Ngày Sinh`=\'!\?!\', `Địa Chỉ`=\'!\?!\', `Họ Và Tên (NT1)`=\'!\?!\', `Số Điện Thoại (NT1)`=\'!\?!\', `Nghề Nghiệp (NT1)`=\'!\?!\', `Họ Và Tên (NT2)`=\'!\?!\', `Số Điện Thoại (NT2)`=\'!\?!\', `Nghề Nghiệp (NT2)`=\'!\?!\', `Tên Trường`=\'!\?!\', `Ngày Học Dự Kiến`=\'!\?!\', `monhocdukien`=\'!\?!\', `Ghi Chú`=\'!\?!\' WHERE `ID`=\'!\?!\';'
                    query = query.replace('!\?!', hovaten);
                    query = query.replace('!\?!', lop);
                    query = query.replace('!\?!', sodienthoai);
                    query = query.replace('!\?!', ngaysinh);
                    query = query.replace('!\?!', diachi);
                    query = query.replace('!\?!', hovatennt1);
                    query = query.replace('!\?!', sodienthoaint1);
                    query = query.replace('!\?!', nghenghiepnt1);
                    query = query.replace('!\?!', hovatennt2);
                    query = query.replace('!\?!', sodienthoaint2);
                    query = query.replace('!\?!', nghenghiepnt2);
                    query = query.replace('!\?!', truong);
                    query = query.replace('!\?!', ngayhocdukien);
                    query = query.replace('!\?!', monhocdukien);
                    query = query.replace('!\?!', noidungdangky);
                    query = query.replace('!\?!', this.props.data['ID']);
                    query = query.replace(/\''/g, 'null');
                    query = query.replace(/\'null'/g, 'null');
                    this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                        fn: 'chamsockhachhang_dangkyhangngay_sua_success',
                        isSuccess: true,
                        isReload: true,
                    });
                    break;
                default:
            }          
        }
    }

    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    }

    updateData (v) {
        this.setState({
            dulieudata: v,
        });

        if (v != null) {
            let data = v.data;
            this.refs.hovaten.value = data['Họ Và Tên'];
            this.refs.truong.value = data['Tên Trường'];
            this.refs.lop.value(data['Lớp']);
            if (data['Ngày Sinh'] != null && data['Ngày Sinh'] != '') {
                let date2 = new Date(data['Ngày Sinh']);
                this.refs.ngaysinh.value = date2.getFullYear() + '-' + ("0" + (date2.getMonth() + 1)).slice(-2) + '-' + ("0" + date2.getDate()).slice(-2);
            }
            this.diachi.value(data['Địa Chỉ']);
            this.refs.hovatennt1.value = data['Họ Và Tên (NT1)'];
            this.sodienthoaint1.setState({value: data['Số Điện Thoại (NT1)']});
            this.refs.nghenghiepnt1.value = data['Nghề Nghiệp (NT1)'];
            this.refs.hovatennt2.value = data['Họ Và Tên (NT2)'];
            this.sodienthoaint2.setState({value: data['Số Điện Thoại (NT2)']});
            this.refs.nghenghiepnt2.value = data['Nghề Nghiệp (NT2)'];
        } else {
            this.refs.hovaten.value = '';
            this.refs.truong.value = '';
            this.refs.lop.value('');
            this.refs.ngaysinh.value = '';
            this.diachi.value('');
            this.refs.hovatennt1.value = '';
            this.sodienthoaint1.setState({value: ''});
            this.refs.nghenghiepnt1.value = '';
            this.refs.hovatennt2.value = '';
            this.sodienthoaint2.setState({value: ''});
            this.refs.nghenghiepnt2.value = '';
        }
    }

    onPhoneChange (e, name) {
        if (this.props.action == 'add') {
            let querycheck = '';
            let sodienthoai = '';
            if (name != 'sodienthoai' && this.sodienthoai.state.value != null && this.sodienthoai.state.value != '' && this.sodienthoai.state.value.length >= 10) {
                sodienthoai = this.sodienthoai.state.value
                querycheck += '`Số Điện Thoại` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT1)` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT2)` LIKE \'%!\?!%\' OR '.replace(/\!\?!/g, sodienthoai);
                if (sodienthoai[0] == '0') {
                    querycheck += '`Số Điện Thoại` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT1)` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT2)` LIKE \'%!\?!%\' OR '.replace(/\!\?!/g, sodienthoai.substring(1, sodienthoai.length));;
                }
            }
    
            let sodienthoaint1 = '';
            if (name != 'sodienthoaint1' && this.sodienthoaint1.state.value != null && this.sodienthoaint1.state.value != '' && this.sodienthoaint1.state.value.length >= 10) {
                sodienthoaint1 = this.sodienthoaint1.state.value
                querycheck += '`Số Điện Thoại` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT1)` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT2)` LIKE \'%!\?!%\' OR '.replace(/\!\?!/g, sodienthoaint1);
                if (sodienthoaint1[0] == '0') {
                    querycheck += '`Số Điện Thoại` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT1)` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT2)` LIKE \'%!\?!%\' OR '.replace(/\!\?!/g, sodienthoaint1.substring(1, sodienthoaint1.length));;
                }
            }
    
            let sodienthoaint2 = '';
            if (name != 'sodienthoaint2' && this.sodienthoaint2.state.value != null && this.sodienthoaint2.state.value != '' && this.sodienthoaint2.state.value.length >= 10) {
                sodienthoaint2 = this.sodienthoaint2.state.value
                querycheck += '`Số Điện Thoại` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT1)` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT2)` LIKE \'%!\?!%\' OR '.replace(/\!\?!/g, sodienthoaint2);
                if (sodienthoaint2[0] == '0') {
                    querycheck += '`Số Điện Thoại` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT1)` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT2)` LIKE \'%!\?!%\' OR '.replace(/\!\?!/g, sodienthoaint2.substring(1, sodienthoaint2.length));;
                }
            }

            if (e.target.value != null && e.target.value.length >= 10) {
                let value = e.target.value;
                querycheck += '`Số Điện Thoại` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT1)` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT2)` LIKE \'%!\?!%\' OR '.replace(/\!\?!/g, value);
                if (value[0] == '0') {
                    querycheck += '`Số Điện Thoại` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT1)` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT2)` LIKE \'%!\?!%\' OR '.replace(/\!\?!/g, value.substring(1, value.length));
                }
            }
            
            if (querycheck != '') {
                querycheck = querycheck.substring(0, querycheck.length - ' OR '.length);
                let query = 'SELECT * FROM quanlyhocsinh.DATA_TRUONGTIEMNANG WHERE ' + querycheck;
                this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                    fn: 'chamsockhachhang_dangkyhangngay_them_checkdatatruongtiemnang',
                });
            }
        }
    }

    onChangeMonHocDuKien (v) {
        this.setState({
            monhocdukien: v,
        })
    }

    render () {
        let title = '';
        switch (this.props.action) {
            case 'add':
                title = 'Thêm Đăng Ký Hàng Ngày';
                break;
            case 'edit':
                title = 'Cập Nhật Đăng Ký Hàng Ngày';
                break;
            default:
        }

        let showdanhsachdata = 'none';
        if (this.state.danhsachdata.length > 0) {
            showdanhsachdata = 'block';
        }

        return (
            <div className={style.formstyle} ref="background">
                <div className="form_body" ref="body" style={{'width': '1100px'}}>
                    <div className="header">
                        <h2>{title}</h2>
                    </div>
                    <div className="body">
                        <div style={{
                            "display": "grid",
                            "grid-template-columns": "50% 50%",
                        }}>
                            <div>
                                <div className='divformstyle'>
                                    <div>
                                        <label for="" >Họ Và Tên: </label>
                                        <input type="text" name="" ref='hovaten'/>
                                    </div>
                                    <div>
                                        <label for="" >Trường Học: </label>
                                        <input type="text" name="" ref='truong'/>
                                    </div>
                                    <div>
                                        <Lop ref="lop"/>
                                    </div>
                                    <div>
                                        <label for="" >Ngày Sinh: </label>
                                        <input type="date" name="" ref='ngaysinh'/>
                                    </div>
                                    <div>
                                        <SoDienThoai
                                            name='sodienthoai'
                                            getMe={me => this.sodienthoai = me}
                                            maxlength="11"
                                            onChange={this.onPhoneChange.bind(this)}
                                        />
                                    </div>
                                </div>
                                <div className="unsetdivformstyle" style={{"display": showdanhsachdata}}>
                                    <label for="Dữ Liệu Từ Data">Dữ Liệu Từ Data: </label>
                                    <Select
                                        name="Dữ Liệu Từ Data"
                                        placeholder="--- Chọn Dữ Liệu Data Nếu Khớp ---"
                                        value={this.state.dulieudata}
                                        options={this.state.danhsachdata}
                                        onChange={this.updateData.bind(this)}
                                    />
                                </div>
                                <div className="unsetdivformstyle">
                                        <DiaChi getMe={me => this.diachi = me}/>
                                </div>
                                <div className='divformstyle'>
                                    <div>
                                        <label for="" >Ngày Học Dự Kiến: </label>
                                        <input type="date" name="" ref='ngayhocdukien'/>
                                    </div>
                                </div>
                                <div className='unsetdivformstyle'>
                                    <label for="">Môn Học Dự Kiến: </label>
                                    <Select
                                        name="Môn Học Dự Kiến"
                                        placeholder="--- Môn Học Dự Kiến ---"
                                        value={this.state.monhocdukien}
                                        options={this.state.danhsachmonhoc}
                                        onChange={this.onChangeMonHocDuKien.bind(this)}
                                        multi
                                    />
                                </div>
                            </div>
                            <div>
                                <div className='divformstyle'>
                                    <div>
                                        <label for="Bạn Biết Houston123 Như Thế Nào ?">Bạn Biết Houston123 Như Thế Nào ?: </label>
                                        <div style={{
                                            'text-align': 'center',
                                            'display': 'grid',
                                            'grid-template-columns': '50% 50%',
                                            'padding': '0',
                                        }}>
                                            <div>
                                                <input style={{'width': 'auto'}} type="radio" name="__biethouston__ghidanh__" value="Tờ rơi"/>
                                                Tờ rơi<br/>
                                                <input style={{'width': 'auto'}} type="radio" name="__biethouston__ghidanh__" value="Bạn rủ bạn (phụ huynh giới thiệu phụ huynh)"/>
                                                Bạn rủ bạn (phụ huynh giới thiệu phụ huynh)<br/>
                                                <input style={{'width': 'auto'}} type="radio" name="__biethouston__ghidanh__" value="Gần nhà, đi ngang trung tâm"/>
                                                Gần nhà, đi ngang trung tâm<br/>
                                                <input style={{'width': 'auto'}} type="radio" name="__biethouston__ghidanh__" value="Học sinh cũ"/> 
                                                Học sinh cũ<br/>
                                                <input style={{'width': 'auto'}} type="radio" name="__biethouston__ghidanh__" value="Facebook, zalo"/> 
                                                Facebook, zalo, website
                                            </div>
                                            <div>
                                                <input style={{'width': 'auto'}} type="radio" name="__biethouston__ghidanh__" value="Tư vấn trực tiếp + tờ rơi"/> 
                                                Tư vấn trực tiếp + tờ rơi<br/>
                                                <input style={{'width': 'auto'}} type="radio" name="__biethouston__ghidanh__" value="Tư vấn gián tiếp qua điện thoại"/>
                                                Tư vấn gián tiếp qua điện thoại<br/>
                                                <input style={{'width': 'auto'}} type="radio" name="__biethouston__ghidanh__" value="Loa phát thanh"/> 
                                                Loa phát thanh<br/>
                                                <input style={{'width': 'auto'}} type="radio" name="__biethouston__ghidanh__" value="Phiếu học thử"/> 
                                                Phiếu học thử<br/>
                                                <input style={{'width': 'auto'}} type="radio" name="__biethouston__ghidanh__" value="other"/>
                                                <input style={{'width': 'auto'}} type="text" name="" placeholder="Khác..." ref="biethoustonkhac"/> 
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label for="" >Người Thân (Bố/Anh/Chú): </label>
                                        <input type="text" name="" ref='hovatennt1'/>
                                    </div>
                                    <div>
                                        <SoDienThoai
                                            name='sodienthoaint1'
                                            getMe={me => this.sodienthoaint1 = me}
                                            maxlength="11"
                                            onChange={this.onPhoneChange.bind(this)}
                                        />
                                    </div>
                                    <div>
                                        <label for="" >Nghề Nghiệp: </label>
                                        <input type="text" name="" ref='nghenghiepnt1'/>
                                    </div>
                                    <div>
                                        <label for="" >Người Thân (Mẹ/Chị/Dì): </label>
                                        <input type="text" name="" ref='hovatennt2'/>
                                    </div>
                                    <div>
                                        <SoDienThoai
                                            name='sodienthoaint2'
                                            getMe={me => this.sodienthoaint2 = me}
                                            maxlength="11"
                                            onChange={this.onPhoneChange.bind(this)}
                                        />
                                    </div>
                                    <div>
                                        <label for="" >Nghề Nghiệp: </label>
                                        <input type="text" name="" ref='nghenghiepnt2'/>
                                    </div>
                                    <div>
                                        <label for="" >Nội Dung Đăng Ký: </label>
                                        <textarea 
                                            ref="noidungdangky"
                                            rows="4"
                                            cols="50"
                                            maxLength="5000"
                                            style={{'height' : '75px'}}>
                                        </textarea>
                                    </div>
                                </div>
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
}) (ThemDangKyHangNgay);
