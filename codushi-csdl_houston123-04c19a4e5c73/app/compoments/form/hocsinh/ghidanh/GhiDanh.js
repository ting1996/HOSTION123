import React from 'react';
import { connect } from 'react-redux';
import style from '../../style.css';
import mystyle from './mystyle.css';
import Select from 'react-select';
import SoDienThoai from '../../elements/SoDienThoai';
import DiaChi from '../../DiaChi';
import Lop from '../../elements/Lop'
import Webcam from '../../elements/Webcam';
var ReactDOM = require('react-dom');

import DaCoTaiKhoan from './DaCoTaiKhoan';
import PhieuThuHocPhi from '../../hoadon/phieuthu/PhieuThuHocPhi';
import DangKyMonHoc from '../dangkymonhoc/DangKyMonHoc';

let titleghidanhhocthu = 'Học Thử';
let titlesuauser = 'Cập Nhật Thông Tin Học Sinh';
let titleghidanh = 'Ghi Danh';
let titletinhtien = 'Tính Tiền';
let titledangkymonhoc = 'Đăng Ký Môn Học & Xếp Lớp'

let colorchoose = 'lightblue';
let colordiscount = '#f006';

class GhiDanh extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dacothongtin: false,
            id: null,
            tenhocsinh: null,
            hohang: [],
            lop: null,
            thongtindadangky: null,
            blockCheckAgain: {
                sdt: null,
                sdt1: null,
                sdt2: null,
            },

            title: null,
            truonghoctiemnang: [],
            danhsachhocsinh: [],
            dulieudata: [],
            danhsachdata: [],
            hocsinhdangkysonay: [],
            image: 'img/image_upload.png',
            imageIsChange: false,
            
            xeplop: false,                      
            monhocdadangky: null,
            querydangkymonhoc: null,
            objMonhoc: null,

            tinhtien: false,
            isAlreadyPay: false,

            isOpenWebcam: false,
            fileCapture: false,
        }
        this.callBackDataFormDatabase = this.callBackDataFormDatabase.bind(this);
        this.callBackWebDav = this.callBackWebDav.bind(this);
        this.SocketEmit = this.SocketEmit.bind(this);
        this.changeSize = this.changeSize.bind(this);
    }

    dataURItoBlob(dataURI) {
        // convert base64/URLEncoded data component to raw binary data held in a string
        let byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0)
            byteString = atob(dataURI.split(',')[1]);
        else
            byteString = unescape(dataURI.split(',')[1]);
    
        // separate out the mime component
        let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    
        // write the bytes of the string to a typed array
        let ia = new Uint8Array(byteString.length);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        let blod = new Blob([ia], {type:mimeString});
        return blod;
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
        let query;
        if (hanhdong == 'laydulieu_trave') {
            if (dulieuguive != null) {
                switch (dulieuguive.fn) {
                    case 'ghidanh_loadhocsinh_hohang':
                        let danhsachhocsinh = [];
                        let hohang = [];
                        let _hohang = null;
                        if (this.props.action == 'edit' && this.props.data != null && this.props.data.length > 0) {
                            let data = this.props.data[0];
                            _hohang = data['Họ Hàng'];
                            if (_hohang != null) {
                                _hohang = _hohang.split(',');
                            }
                        }
                        for (let value of rows) {
                            danhsachhocsinh.push({value: value['User ID'], label: value['User ID'] + ' - ' + value['Họ Và Tên']});
                            if (_hohang != null && _hohang.indexOf(value['User ID']) != -1) {
                                hohang.push({value: value['User ID'], label: value['User ID'] + ' - ' + value['Họ Và Tên']});
                            }
                        }
                        this.setState({
                            danhsachhocsinh: danhsachhocsinh,
                            hohang: hohang,
                        });
                        break;
                    case 'ghidanh_loadhocsinh_danhsachdata':
                        let danhsachdata = [];
                        let dulieudatacu = this.state.dulieudata;
                        for (var i = 0; i < rows.length; i++) {
                            let row = rows[i];
                            for (let value of row) {
                                danhsachdata.push({value: value['ID'], label: value['Họ Và Tên'], data: value, table:dulieuguive.table[i]});
                            }
                        }
                        let dulieudata = [];
                        for (let dulieu of dulieudatacu) {
                            for (let data of danhsachdata) {
                                if (dulieu.value == data.value) {
                                    dulieudata.push(data)
                                    break;
                                }
                            }
                        }
                        this.setState({
                            dulieudata: dulieudata,
                            danhsachdata: danhsachdata,
                        });
                        break;
                    case 'ghidanh_loadhocsinh_dadangkysodienthoai':
                        this.setState({
                            hocsinhdangkysonay: rows,
                        });
                        break;
                    case 'ghidanh_loadtruonghoctiemnang':
                        this.setState({truonghoctiemnang: rows});
                        break;
                    case 'ghidanh_ghidanhthanhcong':
                        query = 'SELECT * FROM USERS WHERE `Họ Và Tên` = \'!\?!\' AND `Hình Ảnh` = \'!\?!\' ORDER BY `User ID` DESC LIMIT 1';
                        query = query.replace('!\?!', dulieuguive.data.hovaten);
                        query = query.replace('!\?!', dulieuguive.data.hinhanh);
                        if (dulieuguive.data.userID != null) {
                            query = 'SELECT * FROM USERS WHERE `User ID` = \'!\?!\'';
                            query = query.replace('!\?!', dulieuguive.data.userID);
                        }
                        this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
                            fn: 'ghidanh_xeplop',
                        });
                        break;
                    case 'ghidanh_xeplop':
                        query = 'SELECT * FROM MONHOC_!\?!; ';
                        query = query.replace('!\?!', $('.khuvuc').attr('value'));

                        if (this.props.action == 'pay') {
                            query += 'SELECT * FROM DANGKIMONHOC WHERE `User ID` = \'!\?!\'; '.replace('!\?!', this.props.userID);
                        }

                        this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
                            fn : 'ghidanh_loaddanhsachmonhoc',
                        });

                        this.setState({
                            title: titledangkymonhoc,
                            xeplop: true,
                            id: rows[0]['User ID'],
                            tenhocsinh: rows[0]['Họ Và Tên'],
                            lop: rows[0]['Lớp'],
                            hohang: rows[0]['Họ Hàng'],
                            thongtindadangky: rows[0],
                        });
                        break;
                    case 'ghidanh_loaddanhsachmonhoc':
                        let monhocdadangky = null;
                        if (this.props.action == 'pay') {
                            monhocdadangky = rows[1];
                            if (monhocdadangky.length > 0) {
                                monhocdadangky = JSON.parse(monhocdadangky[0].monhoc);
                            } else {
                                monhocdadangky = null;
                            }
                            rows = rows[0];
                        }

                        if (this.state.chuongtrinhhoc != null
                            && this.state.chuongtrinhhocbosung.length > 0
                            && this.state.chuongtrinhhoc != ''
                        ) {
                            let danhsachmonhoc = [];
                            let danhsachmonhoctrongoi = [];
                            this.state.chuongtrinhhocbosung.map((v, i) => {
                                if (v['ID'] == this.state.chuongtrinhhoc) {;
                                    let monhoc = v['Chương Trình Học'].split(',');        
                                    for (let value of monhoc) {
                                        let val = value.split(':');
                                        for (let val2 of rows) {
                                            val2.classNumber = 1;
                                            val2.price = val2['Bảng Giá'];
                                            if (val[0] == val2['Mã Môn Học'] && val[0] != 'TG') {
                                                val2['Bảng Giá'] = val[1];
                                                val2.price = val2['Bảng Giá'];
                                                danhsachmonhoc.push(val2);
                                                if (v['Trọn Gói'] != null && v['Trọn Gói'].indexOf(val[0]) != -1) {
                                                    val2['Trọn Gói'] = this.state.lop.toString();
                                                    danhsachmonhoctrongoi.push(val2)
                                                } else {
                                                    val2['Trọn Gói'] = null;
                                                }
                                                break;
                                            }
                                        }
                                    }
                                }
                            });

                            this.setState({
                                danhsachmonhoc: danhsachmonhoc,
                                danhsachmonhoctrongoi: danhsachmonhoctrongoi,
                                trongoi: false,
                            });
                        } else {
                            let mhtg = [];
                            for (let row of rows) {
                                row.classNumber = 1;
                                if (monhocdadangky != null) {
                                    for (let i in monhocdadangky) {
                                        if (monhocdadangky.hasOwnProperty(i)) {
                                            if (monhocdadangky[i].mamon == row['Mã Môn Học']) {
                                                row.classNumber = monhocdadangky[i].soluong;
                                                row.checked = true;
                                            }                                
                                        }
                                    }
                                }
                                row.price = row['Bảng Giá'];
                                if (row['Trọn Gói'] != null && (row['Trọn Gói'].indexOf(this.state.lop) != -1)) {
                                    mhtg.push(row);
                                }
                                if (row['Bảng Giá'] != null && row['Bảng Giá'].split(',').length > 1) {
                                    for (let value of row['Bảng Giá'].split(',')) {
                                        let val = value.split(':');
                                        if (val[1] == this.state.lop) {
                                            row['Bảng Giá'] = val[0];
                                            row.price = row['Bảng Giá'];
                                        }
                                    }
                                }
                            }
    
                            query = 'SELECT * FROM quanlyhocsinh.CHUONGTRINHHOCBOSUNG ' +
                            'WHERE (`expiresDate` IS NULL OR `expiresDate` >= NOW()) ' +
                            'AND (`Cơ Sở` = \'ALL\' OR `Cơ Sở` = \'!\?!\') ' +
                            'AND (`Lớp Áp Dụng` IS NULL OR `Lớp Áp Dụng` = \'!\?!\')';
                            query = query.replace('!\?!', $('.khuvuc').attr('value'));
                            query = query.replace('!\?!', this.state.lop);
                            this.SocketEmit('gui-query-den-database',
                                query,
                                'laydulieu_trave',
                                {
                                fn : 'ghidanh_loaddanhsachchuongtrinhhoc',
                            });

                            if (monhocdadangky != null) {
                                this.setState({
                                    danhsachmonhoc: rows,
                                    danhsachmonhoctrongoi: mhtg,
                                    trongoi: false,
                                    tinhtien: true,
                                    isAlreadyPay: true,
                                });
                            } else {
                                this.setState({
                                    danhsachmonhoc: rows,
                                    danhsachmonhoctrongoi: mhtg,
                                    trongoi: false,
                                });
                            }
                        }
                        break;
                    case 'ghidanh_loaddanhsachchuongtrinhhoc':
                        this.setState({chuongtrinhhocbosung: rows});
                        break;
                    case 'ghidanh_suathanhcong':
                        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                        break;
                    case 'ghidanh_loaddanhsachlophocdangco':
                        query = '';
                        for (let row of rows) {
                            let _query = 'SELECT * FROM quanlyhocsinh.LICHHOC_~ WHERE `Mã Lớp` = \'!\?!\'; ';
                            _query = _query.replace(/~/g, $('.khuvuc').attr('value'));
                            _query = _query.replace('!\?!', row['Mã Lớp']);
                            query += _query;

                            if (dulieuguive.class == row['Mã Lớp']) {
                                row.isReady = true;
                            }
                        }

                        if (query != '') {
                            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                                fn : 'ghidanh_loadthongtindanhsachlophocdangco',
                                data: rows,
                            });
                        }

                        this.setState({
                            lopcothevao: [],
                            informationclass: null,
                        });
                        break;
                    case 'ghidanh_loadthongtindanhsachlophocdangco':
                        let lopcothevao = dulieuguive.data;
                        for (let value of lopcothevao) {
                            value.data = null;
                            for (let row of rows) {
                                if (row[0] != null) {
                                    if (row[0]['Mã Lớp'] == value['Mã Lớp']) {
                                        value.data = row;
                                        break;
                                    }
                                }
                            }
                        }
                        this.setState({
                            lopcothevao: lopcothevao,
                        });
                        break;
                    case 'ghidanh_dangkymonvalopthanhcong':
                        this.SocketEmit('all-notification-update', $('.permission').attr('value'));
                        break;
                    case 'form_ghidanh_dangkychinhthuc': {
                        if (rows[0] != null) {
                            this.loadData(rows[0]);
                            this.setState({
                                id: rows[0]['User ID'],
                                dacothongtin: true,
                                dulieudata: [],
                            })
                        }
                    } break;
                    default:                        
                }
            }
        }  
    }

    callBackWebDav (data, err) {
        switch (data.key) {
            case 'form_hocsinh_ghidanh_loadimage':
                let image = 'img/image_upload.png';
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
                break;
            default:                        
        }
    }

    componentDidMount () {
        let query;
        this.changeSize();
        window.addEventListener("resize", this.changeSize);
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
        this.props.socket.on('webdav', this.callBackWebDav);
        let title;
        if (this.props.action == 'edit') {
            title = titlesuauser;
        } else {
            title= titleghidanh;
        }

        if (this.props.hocthu) {
            title = titleghidanhhocthu;
        }
        this.setState({title: title});

        try {
            $('input[name="__biethouston__ghidanh__"]')[0].checked = true;
            let date = new Date();
            this.refs.ngaynhaphoc.value = date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2);
        } catch (e) {
            
        }
        
        query = 'SELECT * FROM quanlyhocsinh.USERS WHERE `Cơ Sở` = \'' + $('.khuvuc').attr('value') + '\'';
        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'ghidanh_loadhocsinh_hohang',
        });

        query = 'SELECT * FROM quanlyhocsinh.TRUONGTIEMNANG WHERE `Cơ Sở` LIKE \'%' + $('.khuvuc').attr('value') + '%\' OR `Cơ Sở` LIKE \'%ALL%\'';
        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'ghidanh_loadtruonghoctiemnang',
        });

        if (this.props.action == 'edit' && this.props.data != null && this.props.data.length > 0) {
            this.loadData(this.props.data[0]);
        }
    }

    loadData (data) {
        this.props.socket.emit('webdav', {
            fn: 'read',
            url: '/Public/img/avatar/' + data['Hình Ảnh'],
            key: 'form_hocsinh_ghidanh_loadimage',
            imageType: 'image/jpeg',
        });
        this.refs.hovaten.value = data['Họ Và Tên'];
        this.refs.lop.value(data['Lớp']);
        this.sodienthoai.value(data['Số Điện Thoại']);
        this.diachi.value(data['Địa Chỉ']);
        if (data['Ngày Sinh'] != null && data['Ngày Sinh'] != '') {
            let date2 = new Date(data['Ngày Sinh']);
            this.refs.ngaysinh.value = date2.getFullYear() + '-' + ("0" + (date2.getMonth() + 1)).slice(-2) + '-' + ("0" + date2.getDate()).slice(-2);
        }
        this.refs.hoclucdauvao.value = data['Học Lực Đầu Vào'];
        if (data['Ngày Nhập Học'] != null
        && data['Ngày Nhập Học'] != ''
        && this.props.action == 'edit') {
            let date = new Date(data['Ngày Nhập Học']);
            this.refs.ngaynhaphoc.value = date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2);
        }
        this.refs.truonghoc.value = data['Tên Trường'];
        let biethouston = false;
        for (let val of $('input[name="__biethouston__ghidanh__"]')) {
            if (val.value == data['Biết Houston123 Như Thế Nào']){
                val.checked = true;
                biethouston = true;
                break;
            }
        }
        if (!biethouston) {
            for (let val of $('input[name="__biethouston__ghidanh__"]')) {
                if (val.value == 'other'){
                    val.checked = true;
                    this.refs.biethoustonkhac.value = data['Biết Houston123 Như Thế Nào'];
                    break;
                }
            }
        }            
        this.refs.hovatennguoithan1.value = data['Họ Và Tên (NT1)'];
        if (data['Số Điện Thoại (NT1)'] == null) {
            data['Số Điện Thoại (NT1)'] = ''
        }
        this.sodienthoainguoithan1.value(data['Số Điện Thoại (NT1)']);
        this.refs.nghenghiepnguoithan1.value = data['Nghề Nghiệp (NT1)'];
        this.refs.hovatennguoithan2.value = data['Họ Và Tên (NT2)'];
        if (data['Số Điện Thoại (NT2)'] == null) {
            data['Số Điện Thoại (NT2)'] = ''
        }
        this.sodienthoainguoithan2.value(data['Số Điện Thoại (NT2)']);
        this.refs.nghenghiepnguoithan2.value = data['Nghề Nghiệp (NT2)'];
        this.refs.ghichu.value = data['Ghi Chú'];
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.changeSize);
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
        this.props.socket.off('webdav', this.callBackWebDav);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.chuongtrinhhoc != this.state.chuongtrinhhoc) {
            this.updateTruongTrinhHoc();
        }

        if (prevState.dulieudata != this.state.dulieudata) {
            let blockCheckAgain = this.state.blockCheckAgain;
            blockCheckAgain.sdt = this.sodienthoai.value();
            blockCheckAgain.sdt1 = this.sodienthoainguoithan1.value();
            blockCheckAgain.sdt2 = this.sodienthoainguoithan2.value();
            this.setState({
                blockCheckAgain: blockCheckAgain,
            })
        }

        this.changeSize();
    }

    updateHoHang (value) {
        this.setState({
            hohang: value,
        });
    }

    openFileImage () {
        let that = this;
        let fileSelector = this.refs.loadhinh;
        fileSelector.addEventListener('change', function(evt){
          var files = evt.target.files; // FileList object
    
          // Loop through the FileList and render image files as thumbnails.
          for (var i = 0, f; f = files[i]; i++) {
            // Only process image files.
            if (!f.type.match('image.*')) {
              continue;
            }
    
            var reader = new FileReader();
    
            // Closure to capture the file information.
            reader.onload = (function(theFile) {
              return function(e) {
                // Render thumbnail.
                that.setState({
                    fileCapture: false,
                    imageIsChange: true,
                    image: e.target.result,
                });
              };
            })(f);
    
            // Read in the image file as a data URL.
            reader.readAsDataURL(f);
          }
        }, false);
        fileSelector.click();
        return false;
    }

    updateData (v) {
        if (v != null && v.length > 0) {
            let data = v[0].data;
            //Ho va ten
            if (this.refs.hovaten.value.trim() == '') {
                this.refs.hovaten.value = data['Họ Và Tên'];
            }

            //Lop
            if (data['Lớp'] != ''
            && data['Lớp'] != null
            && this.state.dacothongtin == false) {
                this.refs.lop.value(data['Lớp']);
            }

            //Ngay sinh
            if (data['Ngày Sinh'] != ''
            && data['Ngày Sinh'] != null
            && this.refs.ngaysinh.value.trim() == '') {
                let date = new Date(data['Ngày Sinh']);
                this.refs.ngaysinh.value = date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2);
            }

            //Dia chi
            if (data['Địa Chỉ'] != ''
            && data['Địa Chỉ'] != null
            && (this.diachi.value() == null
            || this.diachi.value() == '')) {
                this.diachi.value(data['Địa Chỉ']);
            }

            //Truong Hoc
            if (this.refs.truonghoc.value.trim() == '') {
                this.refs.truonghoc.value = data['Tên Trường'];
            }

            //Nguoi Than 1
            if (this.refs.hovatennguoithan1.value.trim() == '') {
                this.refs.hovatennguoithan1.value = data['Họ Và Tên (NT1)'];
            }
            if (data['Số Điện Thoại (NT1)'] == null) {
                data['Số Điện Thoại (NT1)'] = ''
            }
            if (this.sodienthoainguoithan1.value() == '') {
                this.sodienthoainguoithan1.value(data['Số Điện Thoại (NT1)']);
            }
            if (this.refs.nghenghiepnguoithan1.value.trim() == '') {
                this.refs.nghenghiepnguoithan1.value = data['Nghề Nghiệp (NT1)'];
            }

            //Nguoi Than 2
            if (this.refs.hovatennguoithan2.value.trim() == '') {
                this.refs.hovatennguoithan2.value = data['Họ Và Tên (NT2)'];
            }
            if (data['Số Điện Thoại (NT2)'] == null) {
                data['Số Điện Thoại (NT2)'] = ''
            }
            if (this.sodienthoainguoithan2.value() == '') {
                this.sodienthoainguoithan2.value(data['Số Điện Thoại (NT2)']);
            }
            if (this.refs.nghenghiepnguoithan2.value.trim() == '') {
                this.refs.nghenghiepnguoithan2.value = data['Nghề Nghiệp (NT2)'];
            }
        } else if (this.state.dacothongtin == false) {
            this.refs.hovaten.value = '';
            this.refs.lop.value('');
            this.refs.ngaysinh.value = null;
            this.diachi.value('');
            this.refs.truonghoc.value = '';
            this.refs.hovatennguoithan1.value = '';
            this.sodienthoainguoithan1.value('');
            this.refs.nghenghiepnguoithan1.value = '';
            this.refs.hovatennguoithan2.value = '';
            this.sodienthoainguoithan2.value('');
            this.refs.nghenghiepnguoithan2.value = '';
        }
        this.setState({
            dulieudata: v,
        });
    }

    dongy () {
        let that = this;
        let hovaten = this.refs.hovaten.value;
        let lop = this.refs.lop.value();
        let sodienthoai = this.sodienthoai.state.value;
        let diachi = this.diachi.value();
        let ngaysinh = this.refs.ngaysinh.value;
        let hoclucdauvao = this.refs.hoclucdauvao.value;
        let ngaynhaphoc = this.refs.ngaynhaphoc.value;
        let truonghocchinhkhoa = this.refs.truonghoc.value;
        let biethouston = $('input[name="__biethouston__ghidanh__"]:checked').val();
        if (biethouston == 'other') {
            biethouston = this.refs.biethoustonkhac.value;
        }
        let hohang = '';
        if (this.state.hohang != null) {
            for (let _hohang of this.state.hohang) {
                if (hohang == '') {
                    hohang += _hohang.value;
                } else {
                    hohang += ',' + _hohang.value;
                }
            }
        }
        let hovatennguoithan1 = this.refs.hovatennguoithan1.value;
        let sodienthoainguoithan1 =  this.sodienthoainguoithan1.state.value;
        let nghenghiepnguoithan1 = this.refs.nghenghiepnguoithan1.value;
        let hovatennguoithan2 = this.refs.hovatennguoithan2.value;
        let sodienthoainguoithan2 =  this.sodienthoainguoithan2.state.value;
        let nghenghiepnguoithan2 = this.refs.nghenghiepnguoithan2.value;
        let chinhthuc = '1';
        if (this.props.hocthu) { 
            chinhthuc = '0';
        }
        let ghichu = this.refs.ghichu.value.trim();

        let checkfail = false;
        if (this.state.imageIsChange == false) {
            // this.props.dispatch({
            //     type: 'ALERT_NOTIFICATION_ADD',
            //     content: 'Vui lòng chọn hình ảnh!',
            //     notifyType: 'warning',
            // });
            // checkfail = true;
        }

        this.refs.hovaten.style.borderColor = 'rgb(204, 204, 204)';
        if (hovaten == '' || hovaten == null) {
            this.refs.hovaten.style.borderColor = 'red';
            checkfail = true;
        }

        this.sodienthoai.refs.input.style.borderColor = 'rgb(204, 204, 204)';
        if (sodienthoai == '' || sodienthoai.length < 10) {
            this.sodienthoai.refs.input.style.borderColor = 'red';
            checkfail = true;
        }

        this.diachi.setState({borderColor: 'rgb(204, 204, 204)'});
        if (diachi == null) {
            this.diachi.setState({borderColor: 'red'});
            checkfail = true;
        }

        this.refs.ngaysinh.style.borderColor = 'rgb(204, 204, 204)';
        if (ngaysinh == '') {
            this.refs.ngaysinh.style.borderColor = 'red';
            checkfail = true;
        }

        this.refs.ngaynhaphoc.style.borderColor = 'rgb(204, 204, 204)';
        if (ngaynhaphoc == '') {
            this.refs.ngaynhaphoc.style.borderColor = 'red';
            checkfail = true;
        }
        
        this.refs.truonghoc.style.borderColor = 'rgb(204, 204, 204)';
        if (truonghocchinhkhoa == '') {
            this.refs.truonghoc.style.borderColor = 'red';
            checkfail = true;
        }

        this.refs.biethoustonkhac.style.borderColor = 'rgb(204, 204, 204)';
        if (biethouston == '') {
            this.refs.biethoustonkhac.style.borderColor = 'red';
            checkfail = true;
        }
        
        let query = '';
        if (checkfail) {
            return;
        } else if (this.state.dacothongtin == true) {
            query = 'UPDATE `quanlyhocsinh`.`USERS` SET ' +
            '`Họ Và Tên`=\'!\?!\', '+
            '`Hình Ảnh`=\'!\?!\', '+
            '`Lớp`=\'!\?!\', '+
            '`Số Điện Thoại`=\'!\?!\', ' +
            '`Địa Chỉ`=\'!\?!\', ' +
            '`Ngày Sinh`=\'!\?!\', ' +
            '`Học Lực Đầu Vào`=\'!\?!\', '+
            '`Ngày Nhập Học`=\'!\?!\', '+
            '`Tên Trường`=\'!\?!\', '+
            '`Biết Houston123 Như Thế Nào`=\'!\?!\', '+
            '`Họ Hàng`=\'!\?!\', '+
            '`Họ Và Tên (NT1)`=\'!\?!\', '+
            '`Số Điện Thoại (NT1)`=\'!\?!\', '+
            '`Nghề Nghiệp (NT1)`=\'!\?!\', '+
            '`Họ Và Tên (NT2)`=\'!\?!\', '+
            '`Số Điện Thoại (NT2)`=\'!\?!\', '+
            '`Nghề Nghiệp (NT2)`=\'!\?!\', '+
            '`Ghi Chú`=\'!\?!\', ' +
            '`Cơ Sở`=\'!\?!\', ' +
            '`Chính Thức`=\'1\', ' +
            '`Ngày Nghỉ Học`=null, ' +
            '`Lý Do Nghỉ`=null, ' +
            '`isDeactivate`=\'0\' ' +
            'WHERE `User ID`=\'!\?!\'';

            query = query.replace('!\?!', hovaten);
            query = query.replace('!\?!', '~');
            query = query.replace('!\?!', lop);
            query = query.replace('!\?!', sodienthoai);
            query = query.replace('!\?!', diachi);
            query = query.replace('!\?!', ngaysinh);
            query = query.replace('!\?!', hoclucdauvao);
            query = query.replace('!\?!', ngaynhaphoc);
            query = query.replace('!\?!', truonghocchinhkhoa);
            query = query.replace('!\?!', biethouston);
            query = query.replace('!\?!', hohang);
            query = query.replace('!\?!', hovatennguoithan1);
            query = query.replace('!\?!', sodienthoainguoithan1);
            query = query.replace('!\?!', nghenghiepnguoithan1);
            query = query.replace('!\?!', hovatennguoithan2);
            query = query.replace('!\?!', sodienthoainguoithan2);
            query = query.replace('!\?!', nghenghiepnguoithan2);
            query = query.replace('!\?!', ghichu);
            query = query.replace('!\?!', $('.khuvuc').attr('value'));
            query = query.replace('!\?!', this.state.id);
            query = query.replace(/''/g, 'null');
            query = query.replace(/'null'/g, 'null');
            
            if (this.state.imageIsChange) {
                let fd = new FormData();
                if (this.state.fileCapture) {
                    fd.append('image', this.dataURItoBlob(this.state.image));
                } else {
                    fd.append('file', this.refs.loadhinh.files[0]);
                }
                fd.append('oldimagename', this.props.data[0]['Hình Ảnh']);
                $.ajax({
                    url: '/trangchu/reupimage',
                    type: 'post',
                    enctype:'multipart/form-data',
                    data: fd,
                    processData: false,
                    contentType: false,
                    statusCode: {
                        200: function (response) {
                            query = query.replace('~', response);
                            that.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
                                fn: 'ghidanh_ghidanhthanhcong',
                                data: {userID: that.state.id},
                                isReload: true,
                                reloadPageName: 'hocsinh',
                                isSuccess: true,
                            });
                        },
                        400: function (response) {
                            that.props.dispatch({
                                type: 'ALERT_NOTIFICATION_ADD',
                                content: 'Lỗi khi resize ảnh: ' + response.responseText,
                                notifyType: 'error',
                            });
                        },
                        501: function (response) {
                            that.props.dispatch({
                                type: 'ALERT_NOTIFICATION_ADD',
                                content: response.responseText,
                                notifyType: 'error',
                            });
                        },
                    },
                    success : function(response){
                    }
                });
            } else {
                query = query.replace('`Hình Ảnh`=\'~\', ', '');
                this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
                    fn: 'ghidanh_ghidanhthanhcong',
                    data: {userID: this.state.id},
                    isReload: true,
                    reloadPageName: 'hocsinh',
                    isSuccess: true,
                });
            }
        } else if (this.props.action == 'add') {
            query =  'INSERT INTO `quanlyhocsinh`.`USERS` ' +
            '(`Họ Và Tên`, `Hình Ảnh`, `Lớp`, `Số Điện Thoại`, `Địa Chỉ`, `Ngày Sinh`, `Học Lực Đầu Vào`, `Ngày Nhập Học`, `Tên Trường`, `Cơ Sở`, `Họ Hàng`, `Biết Houston123 Như Thế Nào`, `Họ Và Tên (NT1)`, `Số Điện Thoại (NT1)`, `Nghề Nghiệp (NT1)`, `Họ Và Tên (NT2)`, `Số Điện Thoại (NT2)`, `Nghề Nghiệp (NT2)`, `Chính Thức`, `Ghi Chú`) VALUES ' +
            '(\'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\')';

            query = query.replace('!\?!', hovaten);
            query = query.replace('!\?!', '~');
            query = query.replace('!\?!', lop);
            query = query.replace('!\?!', sodienthoai);
            query = query.replace('!\?!', diachi);
            query = query.replace('!\?!', ngaysinh);
            query = query.replace('!\?!', hoclucdauvao);
            query = query.replace('!\?!', ngaynhaphoc);
            query = query.replace('!\?!', truonghocchinhkhoa);
            query = query.replace('!\?!', $('.khuvuc').attr('value'));
            query = query.replace('!\?!', hohang);
            query = query.replace('!\?!', biethouston);
            query = query.replace('!\?!', hovatennguoithan1);
            query = query.replace('!\?!', sodienthoainguoithan1);
            query = query.replace('!\?!', nghenghiepnguoithan1);
            query = query.replace('!\?!', hovatennguoithan2);
            query = query.replace('!\?!', sodienthoainguoithan2);
            query = query.replace('!\?!', nghenghiepnguoithan2);
            query = query.replace('!\?!', chinhthuc);
            query = query.replace('!\?!', ghichu);
            query = query.replace(/''/g, 'null');
            query = query.replace(/'null'/g, 'null');

            if (this.state.imageIsChange) {
                let fd = new FormData();
                if (this.state.fileCapture) {
                    fd.append('image', this.dataURItoBlob(this.state.image));
                } else {
                    fd.append('file', this.refs.loadhinh.files[0]);
                }
                $.ajax({
                    url: '/trangchu/uploadimage',
                    type: 'post',
                    enctype:'multipart/form-data',
                    data: fd,
                    processData: false,
                    contentType: false,
                    statusCode: {
                        200: function (response) {
                            query = query.replace('~', response)
                            let dahoctaih123 = '';
                            if (that.state.dulieudata != null && that.state.dulieudata.length > 0) {
                                for (let val of that.state.dulieudata) {
                                    let _deactive = 'UPDATE `quanlyhocsinh`.`!\?!` SET `isDeactivate`=\'1\' WHERE `ID`=\'!\?!\'; '
                                    _deactive = _deactive.replace('!\?!', val.table);
                                    _deactive = _deactive.replace('!\?!', val.value);
                                    dahoctaih123 += _deactive;
                                }
                            }
                            query = dahoctaih123 + query;
                            that.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
                                fn: 'ghidanh_ghidanhthanhcong',
                                data: {hinhanh: response, hovaten: hovaten},
                                isReload: true,
                                reloadPageName: 'hocsinh',
                                isSuccess: true,
                            });
                        },
                        400: function (response) {
                            that.props.dispatch({
                                type: 'ALERT_NOTIFICATION_ADD',
                                content: 'Lỗi khi resize ảnh: ' + response.responseText,
                                notifyType: 'error',
                            });
                        },
                    },
                    success : function(response){
                    }
                });
            } else {
                let response = 'null'
                query = query.replace('~', response)
                let dahoctaih123 = '';
                if (this.state.dulieudata != null && this.state.dulieudata.length > 0) {
                    for (let val of that.state.dulieudata) {
                        let _deactive = 'UPDATE `quanlyhocsinh`.`!\?!` SET `isDeactivate`=\'1\' WHERE `ID`=\'!\?!\'; '
                        _deactive = _deactive.replace('!\?!', val.table);
                        _deactive = _deactive.replace('!\?!', val.value);
                        dahoctaih123 += _deactive;
                    }
                }
                query = dahoctaih123 + query;
                this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
                    fn: 'ghidanh_ghidanhthanhcong',
                    data: {hinhanh: response, hovaten: hovaten},
                    isReload: true,
                    reloadPageName: 'hocsinh',
                    isSuccess: true,
                });
            }
        } else if (this.props.action == 'edit') {
            query = 'UPDATE `quanlyhocsinh`.`USERS` SET ' +
            '`Họ Và Tên`=\'!\?!\', '+
            '`Hình Ảnh`=\'!\?!\', '+
            '`Lớp`=\'!\?!\', '+
            '`Số Điện Thoại`=\'!\?!\', ' +
            '`Địa Chỉ`=\'!\?!\', ' +
            '`Ngày Sinh`=\'!\?!\', ' +
            '`Học Lực Đầu Vào`=\'!\?!\', '+
            '`Ngày Nhập Học`=\'!\?!\', '+
            '`Tên Trường`=\'!\?!\', '+
            '`Biết Houston123 Như Thế Nào`=\'!\?!\', '+
            '`Họ Hàng`=\'!\?!\', '+
            '`Họ Và Tên (NT1)`=\'!\?!\', '+
            '`Số Điện Thoại (NT1)`=\'!\?!\', '+
            '`Nghề Nghiệp (NT1)`=\'!\?!\', '+
            '`Họ Và Tên (NT2)`=\'!\?!\', '+
            '`Số Điện Thoại (NT2)`=\'!\?!\', '+
            '`Nghề Nghiệp (NT2)`=\'!\?!\', '+
            '`Ghi Chú`=\'!\?!\' '+
            'WHERE `User ID`=\'!\?!\'';

            query = query.replace('!\?!', hovaten);
            query = query.replace('!\?!', '~');
            query = query.replace('!\?!', lop);
            query = query.replace('!\?!', sodienthoai);
            query = query.replace('!\?!', diachi);
            query = query.replace('!\?!', ngaysinh);
            query = query.replace('!\?!', hoclucdauvao);
            query = query.replace('!\?!', ngaynhaphoc);
            query = query.replace('!\?!', truonghocchinhkhoa);
            query = query.replace('!\?!', biethouston);
            query = query.replace('!\?!', hohang);
            query = query.replace('!\?!', hovatennguoithan1);
            query = query.replace('!\?!', sodienthoainguoithan1);
            query = query.replace('!\?!', nghenghiepnguoithan1);
            query = query.replace('!\?!', hovatennguoithan2);
            query = query.replace('!\?!', sodienthoainguoithan2);
            query = query.replace('!\?!', nghenghiepnguoithan2);
            query = query.replace('!\?!', ghichu);
            query = query.replace('!\?!', this.props.data[0]['User ID']);
            query = query.replace(/''/g, 'null');
            query = query.replace(/'null'/g, 'null');
            
            if (this.state.imageIsChange) {
                let fd = new FormData();
                if (this.state.fileCapture) {
                    fd.append('image', this.dataURItoBlob(this.state.image));
                } else {
                    fd.append('file', this.refs.loadhinh.files[0]);
                }
                fd.append('oldimagename', this.props.data[0]['Hình Ảnh']);
                $.ajax({
                    url: '/trangchu/reupimage',
                    type: 'post',
                    enctype:'multipart/form-data',
                    data: fd,
                    processData: false,
                    contentType: false,
                    statusCode: {
                        200: function (response) {
                            query = query.replace('~', response);
                            that.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
                                fn: 'ghidanh_suathanhcong',
                                isReload: true,
                                reloadPageName: 'hocsinh',
                                isSuccess: true,
                            });
                        },
                        400: function (response) {
                            that.props.dispatch({
                                type: 'ALERT_NOTIFICATION_ADD',
                                content: 'Lỗi khi resize ảnh: ' + response.responseText,
                                notifyType: 'error',
                            });
                        },
                        501: function (response) {
                            that.props.dispatch({
                                type: 'ALERT_NOTIFICATION_ADD',
                                content: response.responseText,
                                notifyType: 'error',
                            });
                        },
                    },
                    success : function(response){
                    }
                });
            } else {
                query = query.replace('`Hình Ảnh`=\'~\', ', '');
                this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
                    fn: 'ghidanh_suathanhcong',
                    isReload: true,
                    reloadPageName: 'hocsinh',
                    isSuccess: true,
                });
            }
        }
    }

    onDongYXepLop (query, obj, listSubject) {
        try {
            if (query != null) {
                if (this.props.hocthu) {
                    query = query.replace('@@@', JSON.stringify(obj));
                    this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
                        fn: 'ghidanh_dangkymonvalopthanhcong',
                        isReload: true,
                        reloadPageName: 'hocsinhhocthu',
                        isSuccess: true,
                    });
                    this.close();
                } else {
                    this.setState({
                        tinhtien: true,
                        monhocdadangky: listSubject,
                        querydangkymonhoc: query,
                        objMonhoc: obj,
                    });
                }
            } else {
                this.close();
            }
        } catch (e) {
            this.close();
        }
    }

    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    }
    
    backdangkymonhoc () {
        this.setState({
            tinhtien: false,
            title: titledangkymonhoc,
            discount: [],
        });
    }

    onBlurSoDienThoai (e) {
        let blockCheckAgain = this.state.blockCheckAgain;
        if (((this.sodienthoai.value().length >= 10 && this.sodienthoai.value() != blockCheckAgain.sdt)
        || (this.sodienthoainguoithan1.value().length >= 10 && this.sodienthoainguoithan1.value() != blockCheckAgain.sdt1)
        || (this.sodienthoainguoithan2.value().length >= 10 && this.sodienthoainguoithan2.value() != blockCheckAgain.sdt2)) && this.props.action == 'add' && this.state.dacothongtin == false) {
            let sdt = '';
            if (this.sodienthoai.value().length >= 10) {
                sdt += '`Số Điện Thoại` LIKE \'%~%\' OR `Số Điện Thoại (NT1)` LIKE \'%~%\' OR `Số Điện Thoại (NT2)` LIKE \'%~%\' OR ';
                sdt = sdt.replace(/~/g, this.sodienthoai.value().substring(1, this.sodienthoai.value().length));
            }
            if (this.sodienthoainguoithan1.value().length >= 10) {
                sdt += '`Số Điện Thoại` LIKE \'%~%\' OR `Số Điện Thoại (NT1)` LIKE \'%~%\' OR `Số Điện Thoại (NT2)` LIKE \'%~%\' OR ';
                sdt = sdt.replace(/~/g, this.sodienthoainguoithan1.value().substring(1, this.sodienthoainguoithan1.value().length));
            }
            if (this.sodienthoainguoithan2.value().length >= 10) {
                sdt += '`Số Điện Thoại` LIKE \'%~%\' OR `Số Điện Thoại (NT1)` LIKE \'%~%\' OR `Số Điện Thoại (NT2)` LIKE \'%~%\' OR ';
                sdt = sdt.replace(/~/g, this.sodienthoainguoithan2.value().substring(1, this.sodienthoainguoithan2.value().length));
            }
            sdt = sdt.substring(0, sdt.length - ' OR '.length);
            let query = 'SELECT * FROM DATA_TRUONGTIEMNANG WHERE ' + sdt + '; SELECT * FROM DATADANGKYHANGNGAY WHERE ' + sdt;
            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                fn : 'ghidanh_loadhocsinh_danhsachdata',
                table: ['DATA_TRUONGTIEMNANG', 'DATADANGKYHANGNGAY'],
            });

            query = 'SELECT * FROM USERS WHERE ' + sdt;
            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                fn : 'ghidanh_loadhocsinh_dadangkysodienthoai',
            });
        }        
        blockCheckAgain.sdt = this.sodienthoai.value();
        blockCheckAgain.sdt1 = this.sodienthoainguoithan1.value();
        blockCheckAgain.sdt2 = this.sodienthoainguoithan2.value();
        this.setState({blockCheckAgain: blockCheckAgain});
    }

    render () {
        let btnaccept_title = 'Đồng Ý';
        let color = '';
        if (this.state.trongoi) {
            color = colorchoose;
        }
        let showdanhsachdata = 'none';
        if (this.state.danhsachdata.length > 0) {
            showdanhsachdata = 'block';
        }
        let hocsinhdangkysonay = '';
        if (this.state.hocsinhdangkysonay.length > 0) {
            hocsinhdangkysonay = 
            <DaCoTaiKhoan 
                onClose={() => this.setState({hocsinhdangkysonay: []})}
                onClick={(id) => {
                    let query = 'SELECT * FROM USERS WHERE `User ID` = \'!\?!\' ';
                    query = query.replace('!\?!', id)
                    this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
                        fn: 'form_ghidanh_dangkychinhthuc',
                    });
                }}
                Data={this.state.hocsinhdangkysonay}
            />
        }

        let wc = '';
        if (this.state.isOpenWebcam == true) {
            wc = 
            <Webcam 
                onClose={() => this.setState({isOpenWebcam: false})}
                onTakePictureCompleted={(data) => {
                    this.setState({
                        imageIsChange: true,
                        fileCapture: true,
                        image: data,
                    });
                }}
            />
        }

        if (!this.state.xeplop) {
            return (
                <div className={style.formstyle} ref="background">
                    <div className="form_body" ref="body"style={{'width': '1100px'}}>
                        <div className="header">
                            { /*<img src="" alt="Icon Image"/> */}
                            <h2>{this.state.title}</h2>
                        </div>
                        <div className="body" 
                            style={{
                                'text-align': 'center',
                                'display': 'grid',
                                'grid-template-columns': '50% 50%',
                            }}
                        >
                            <div>
                                <div className="unsetdivformstyle">
                                    <div style={{'text-align': 'center'}}>
                                        <input type="file" name="Hình Ảnh" hidden ref="loadhinh"/>
                                        <img src={this.state.image} name="" ref="uploadimage"
                                            style={{
                                                'margin': 'auto',
                                                'border': '2px solid #969696',
                                                'width': '100px',
                                                'height': '140px',
                                            }}
                                        />
                                        <div style={{
                                            'display': 'grid',
                                            'grid-template-columns': '20% 30% 30% 20%',
                                        }}>
                                            <div></div>
                                            <div onClick={() => this.setState({isOpenWebcam: true})} style={{
                                                'background': '#ccc',
                                                'color': '#8e001e',
                                                'border': '0px solid #ccc',
                                                'border-radius': '20px',
                                                'box-shadow': '1px 1px 4px #33333330',
                                                'margin': '5px 10px',
                                            }}>
                                                <i class="fa fa-video-camera fa-2x" aria-hidden="true"></i>
                                            </div>
                                            <div onClick={this.openFileImage.bind(this)} style={{
                                                'background': '#ccc',
                                                'color': '#8e001e',
                                                'border': '0px solid #ccc',
                                                'border-radius': '20px',
                                                'box-shadow': '1px 1px 4px #33333330',
                                                'margin': '5px 10px',
                                            }}>
                                                <i class="fa fa-folder-open-o fa-2x" aria-hidden="true"></i>
                                            </div>
                                            <div></div>
                                        </div>
                                    </div>
                                </div>                                    
                                <div className="divformstyle">
                                    <div>
                                        <label for="Họ Và Tên">Họ Và Tên: </label>
                                        <input type="text" name="Họ Và Tên" ref="hovaten"/>
                                    </div>
                                    <div>
                                        <Lop ref="lop"/>
                                    </div>
                                    <div>
                                        <SoDienThoai
                                            getMe={me => this.sodienthoai = me}
                                            onBlur={this.onBlurSoDienThoai.bind(this)}
                                            maxlength="11"
                                        />
                                    </div>
                                </div>
                                <div className="unsetdivformstyle" style={{"display": showdanhsachdata}}>
                                    <label for="Dữ Liệu Từ Data">Dữ Liệu Từ Data: </label>
                                    <Select
                                        name="Dữ Liệu Từ Data"
                                        placeholder="--- Chọn Dữ Liệu Data Nếu Khớp ---"
                                        multi
                                        value={this.state.dulieudata}
                                        options={this.state.danhsachdata}
                                        onChange={this.updateData.bind(this)}
                                    />
                                </div>
                                <div className="divformstyle">
                                    <div>
                                        <label for="Ngày Sinh">Ngày Sinh: </label>
                                        <input type="date" name="Ngày Sinh" min="" ref="ngaysinh"/>
                                    </div>
                                </div>
                                <div className="unsetdivformstyle">
                                    <DiaChi getMe={me => this.diachi = me}/>
                                </div>
                                <div className="divformstyle">    
                                    <div>
                                        <label for="Học Lực Đầu Vào">Học Lực Đầu Vào: </label>
                                        <select name="Học Lực Đầu Vào" ref="hoclucdauvao">
                                            <option value="Yếu">Yếu</option>
                                            <option value="Trung Bình">Trung Bình</option>
                                            <option value="Khá">Khá</option>
                                            <option value="Giỏi">Giỏi</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label for="">Ngày Đăng Ký: </label>
                                        <input type="date" name="" min="" ref="ngaynhaphoc"/>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="divformstyle">
                                    <div>
                                        <label for="Tên Trường">Trường Học Chính Khóa: </label>
                                        <input type="text" name="Tên Trường" list="truonghoc" ref="truonghoc"/>
                                        <datalist id="truonghoc">
                                        {
                                            this.state.truonghoctiemnang.map((v, i) => 
                                                <option key={i} value={v['Tên Trường']}></option>
                                            )
                                        }
                                        </datalist>
                                    </div>
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
                                </div>
                                <div className="unsetdivformstyle">
                                    <label for="Họ Hàng">Họ Hàng: </label>
                                    <Select
                                        name="Họ Hàng"
                                        placeholder="--- Chọn Họ Hàng Nếu Có ---"
                                        value={this.state.hohang}
                                        options={this.state.danhsachhocsinh}
                                        onChange={this.updateHoHang.bind(this)}
                                        multi
                                    />
                                </div>
                                <div className="divformstyle">
                                    <div>
                                        <label for="Họ Và Tên">Họ Và Tên Người Thân 1 (Ba/Anh/Chú): </label>
                                        <input type="text" name="Họ Và Tên" ref="hovatennguoithan1"/>
                                    </div>
                                    <div>
                                        <SoDienThoai
                                            getMe={me => this.sodienthoainguoithan1 = me}
                                            onBlur={this.onBlurSoDienThoai.bind(this)}
                                            maxlength="11"
                                        />
                                    </div>
                                    <div>
                                        <label for="Họ Và Tên">Nghề Nghiệp: </label>
                                        <input type="text" name="Họ Và Tên" ref="nghenghiepnguoithan1"/>
                                    </div>
                                    <div>
                                        <label for="Họ Và Tên">Họ Và Tên Người Thân 2 (Mẹ/Chị/Dì): </label>
                                        <input type="text" name="Họ Và Tên" ref="hovatennguoithan2"/>
                                    </div>
                                    <div>
                                        <SoDienThoai
                                            getMe={me => this.sodienthoainguoithan2 = me}
                                            onBlur={this.onBlurSoDienThoai.bind(this)}
                                            maxlength="11"
                                        />
                                    </div>
                                    <div>
                                        <label for="Họ Và Tên">Nghề Nghiệp: </label>
                                        <input type="text" name="Họ Và Tên" ref="nghenghiepnguoithan2"/>
                                    </div>
                                    <div>
                                        <a>Ghi Chú: </a>
                                        <textarea ref="ghichu" style={{'height' : '100px'}}></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="footer">
                            <input type="button" onClick={this.close.bind(this)} value="Thoát"/>
                            <input type="button" onClick={this.dongy.bind(this)} value={btnaccept_title}/>
                        </div>
                    </div>
                    {wc}
                    {hocsinhdangkysonay}
                </div>
            );
        } else if (this.state.xeplop && !this.state.tinhtien) {
            btnaccept_title = 'Tiếp Tục';
            if (this.props.hocthu) {
                btnaccept_title = 'Đồng Ý';
            }
            return (
                <DangKyMonHoc 
                    data={this.state.thongtindadangky}
                    onAgree={this.onDongYXepLop.bind(this)}
                />
            );
        } else {
            return (
                <PhieuThuHocPhi
                    data={this.state.thongtindadangky}
                    action='add'
                    queryMonHoc={this.state.querydangkymonhoc}
                    objMonhoc={this.state.objMonhoc}
                    onBack={this.backdangkymonhoc.bind(this)}
                />
            );
        }
    }
}

module.exports = connect(function (state) {
    return {
      socket: state.socket,
    };
}) (GhiDanh);
