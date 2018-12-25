import React from 'react';
import { connect } from 'react-redux';
import style from '../../style.css';
var ReactDOM = require('react-dom');
import Tien from '../../Tien';
import printJS from 'print-js';

import Button from '../../elements/Button';

let colorchoose = 'lightblue';
let colordiscount = '#f006';

class DangKyMonHoc extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            danhsachmonhoc: [],
            queryMonHoc: null,

            tong: null,
            discount: [],
            isChangeSubject: false,
            discountIsChange: false,
            tongphaithanhtoan: null,
            sothangdong: 1,
            maxdiscount: 0,
            discountCustom: false,
            blockBackButton: false,
            nocu: 0,
            nocumoi: 0,
            chotchuky: null,
            thongtin_chotchuky: null,
            phieuthutruoc: null,

            dathanhtoan: 0,

            isPrint: false,
            lydodongtien: '',
            giamhocphi: '',
            tanghocphi: '',
            sotienbangso: '',
            sotienbangchu: '',
            ngaydonghangthang: '',
            maphieuthu: '',
            makiemtra: '',
            maphieuno: null,
            dongtientungay: '',
            dongtiendenngay: '',
            tongtien: '',
            tongtiensaukhigiam: '',
            conno: '',
            ghichu: '',

            isDisable: false,
            _isDisable: false,

            btnDongYDisable: false,
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
        let query;
        if (hanhdong == 'laydulieu_trave') {
            if (dulieuguive != null) {
                switch (dulieuguive.fn) {
                    case 'form_hoadon_phieuthu_phieuthuhocphi_loaddanhsachmonhoc':
                        let monhocdadangky = null;
                        let _nocu = this.state.nocu;                        
                        let _dathanhtoan = this.state.dathanhtoan;
                        switch (this.props.action) {
                            case 'add':
                            case 'pay':
                                monhocdadangky = rows[2];
                                if (monhocdadangky != null && monhocdadangky.length > 0) {
                                    monhocdadangky = JSON.parse(monhocdadangky[0].monhoc);
                                } else {
                                    monhocdadangky = null;
                                }
                                if (this.props.action == 'add') {
                                    monhocdadangky = this.props.objMonhoc;
                                }

                                if (monhocdadangky != null) {
                                    for (let i in monhocdadangky) {
                                        if (monhocdadangky.hasOwnProperty(i)) {
                                            if (monhocdadangky[i].idchuongtrinhhoc != null) {
                                                for (let ct of rows[1]) {
                                                    if (ct['ID'] == monhocdadangky[i].idchuongtrinhhoc) {
                                                        monhocdadangky[i].tenchuongtrinhhoc = ct['Tên Chương Trình'];
                                                        let cth = JSON.parse(ct['Chương Trình Học']);
                                                        for (let i1 in cth) {
                                                            if (cth.hasOwnProperty(i1)) {
                                                                if (cth[i1].mamon == monhocdadangky[i].mamon) {
                                                                    monhocdadangky[i].forceSubject = cth[i1].forceSubject;
                                                                    monhocdadangky[i].gia = cth[i1].gia;
                                                                    break;
                                                                }
                                                            }
                                                        }
                                                        monhocdadangky[i].giatrongoi = ct['Trọn Gói']
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                rows = rows[0];
                                break;
                            case 'print':
                                if (this.props.phieuthucu.hoadontruoc != null
                                && this.props.phieuthucu['Mã Phiếu Nợ'] == null
                                && this.props.phieuthucu.hoadontruoc['Còn Nợ'] != 0) {
                                    _nocu = this.props.phieuthucu.hoadontruoc['Còn Nợ'];
                                }
                                if (this.props.phieuthucu.hoadontruoc != null 
                                && this.props.phieuthucu['Mã Phiếu Nợ'] != null) {
                                    _dathanhtoan = this.props.phieuthucu.hoadontruoc['Đã Thanh Toán'];
                                }
                            case 'payDebt':
                                let editdata = {};
                                let monhocedit = this.props.phieuthucu['Nội Dung'].split(',');
                                let numr = 0;
                                let cthoc = {};
                                for (let ct of rows[1]) {
                                    cthoc[ct['ID']] = ct['Tên Chương Trình'];
                                }
                                for (let mon of monhocedit) {
                                    if (mon != '') {
                                        mon = mon.split(':');
                                        // console.log(mon);
                                        let trongoi = false;
                                        if (mon[5] == 1) {
                                            trongoi = true;
                                        }
                                        editdata[numr] = 
                                        {
                                            mamon: mon[0],
                                            soluong: mon[2],
                                            gia: mon[1],
                                            idchuongtrinhhoc: mon[3],
                                            giatrongoi: mon[4],
                                            trongoi: trongoi,
                                            tenchuongtrinhhoc: cthoc[mon[3]],
                                        };
                                        numr++;
                                    }
                                }
                                monhocdadangky = editdata;
                                rows = rows[0];
                                break;
                            default:                                
                        }

                        let danhsachmonhoc = [];
                        if (monhocdadangky != null) {
                            for (let i in monhocdadangky) {
                                if (monhocdadangky.hasOwnProperty(i)) {
                                    for (let row of rows) {
                                        if (monhocdadangky[i].mamon == row['Mã Môn Học']) {
                                            let mon = {...row};
                                            mon.classNumber = monhocdadangky[i].soluong;
                                            if (monhocdadangky[i].gia != null) {
                                                mon['Bảng Giá'] = (monhocdadangky[i].gia / monhocdadangky[i].soluong).toString();
                                            }
                                            mon.price = mon['Bảng Giá'];
                                            mon.tenchuongtrinhhoc = monhocdadangky[i].tenchuongtrinhhoc;
                                            mon.idchuongtrinhhoc = monhocdadangky[i].idchuongtrinhhoc;
                                            mon.giatrongoi = monhocdadangky[i].giatrongoi;
                                            mon.trongoi = monhocdadangky[i].trongoi;
                                            mon.checked = true;
                                            if (mon.classNumber > 1) {
                                                let _price = mon['Bảng Giá'].split(',');
                                                if (_price.length > 1) {
                                                    let temp = [];
                                                    for (let _p of _price) {
                                                        let t = _p.split(':');
                                                        t[0] = t[0] * mon.classNumber;
                                                        t = t.join(':');
                                                        temp.push(t);
                                                    }
                                                    _price = temp.join(',');
                                                } else {
                                                    _price = _price * mon.classNumber;
                                                }
                                                mon.price = _price;
                                            }
                                            danhsachmonhoc.push(mon)
                                            break;
                                        }
                                    }
                                }
                            }                       
                        }

                        this.setState({
                            danhsachmonhoc: danhsachmonhoc,
                            nocu: _nocu,
                            nocumoi: _nocu,
                            dathanhtoan: _dathanhtoan,
                        });

                        this.SocketEmit('gui-query-den-database',
                            'SELECT * FROM quanlyhocsinh.DISCOUNT ' +
                            'WHERE (`expiresDate` IS NULL OR `expiresDate` >= NOW()) ' +
                            'AND (`Cơ Sở` LIKE \'%!\?!%\' OR `Cơ Sở` LIKE \'%ALL%\')'.replace('!\?!', $('.khuvuc').attr('value')),
                            'laydulieu_trave',
                            {
                                fn: 'form_hoadon_phieuthu_phieuthuhocphi_loaddiscount',
                        });
                        break;
                    case 'form_hoadon_phieuthu_phieuthuhocphi_loaddiscount':
                        let max = 0;
                        let discount = [];
                        if (this.props.action == 'payDebt' || this.props.action == 'print') {
                            if (this.props.phieuthucu['Chương Trình Giảm Giá'] != null) {
                                let giamgia = 0;
                                let lydo ='';
                                let ctgiamgia = this.props.phieuthucu['Chương Trình Giảm Giá'].split(',');
                                for (let ct of ctgiamgia) {
                                    if (ct != null) {
                                        ct = ct.split(':');
                                        if (ct[1] != null) {
                                            giamgia = giamgia + Number(ct[1]);
                                            lydo += ct[0] + ', ';
                                        }
                                    }
                                }
                                this.refs.giamhocphi.value = giamgia;
                                this.refs.lydogiamhocphi.value = lydo;
                                this.setState({
                                    discountCustom: true,
                                })
                            }
                            
                            if (this.props.phieuthucu['Giảm Giá Khác'] != null) {
                                let giamgiakhac = JSON.parse(this.props.phieuthucu['Giảm Giá Khác']);
                                this.refs.giamhocphi.value = giamgiakhac.giamhocphi;
                                this.refs.lydogiamhocphi.value = giamgiakhac.lydogiamhocphi;
                                this.refs.tanghocphi.value = giamgiakhac.tanghocphi;
                                this.refs.lydotanghocphi.value = giamgiakhac.lydotanghocphi;
                                this.setState({
                                    discountCustom: true,
                                })
                            }
                        }

                        if (this.state.chuongtrinhhoc != null
                            && this.state.chuongtrinhhocbosung.length > 0
                            && this.state.chuongtrinhhoc != ''
                        ) {
                            this.state.chuongtrinhhocbosung.map(val => {
                                if (val['ID'] == this.state.chuongtrinhhoc && val['Giảm Giá Áp Dụng'] != null) {
                                    let giamgiaapdung = val['Giảm Giá Áp Dụng'].split('|');
                                    giamgiaapdung.map(val2 => {
                                        for (let row of rows) {
                                            if (row['Loại'] == val2 || row['Loại'] == 'max') {
                                                if (row['manual'] != null && row['manual'] == '1') {
                                                    row.disabled = false;
                                                }
                                                discount.push(row);
                                            }
                                        }
                                    })
                                }
                            })
                        } else {
                            for (let val of rows) {
                                if (val['special'] == 0) {
                                    discount.push(val);
                                }
                            }
                        }

                        for (let row of discount) {
                            if (row.disabled == null) {
                                row.disabled = true; 
                            }
                            if (row['Loại'] == 'Có đăng ký trọn gói' && this.state.trongoi) {
                                row.checked = true;
                                row.disabled = false;
                            }
                            if (row['Loại'] == 'max') {
                                max = Number(row['Mức Giảm']);
                            }
                            if (row['Loại'] == 'Có người thân' && this.state.hohang != null && this.state.hohang != '') {
                                row.checked = true;
                                row.disabled = false;
                            }
                        }

                        this.setState({
                            discount: discount,
                            maxdiscount: max,
                            discountIsChange: true,
                        });
                        break;
                    case 'form_hoadon_phieuthu_phieuthuhocphi_xuathoadon':
                        if (dulieuguive.isPrint == true) {
                            if (rows.length > 0) {
                                rows = rows[0];
                            }
                            let idprint = rows.insertId;
                            if (this.props.action == 'payDebt' && this.props.phieuthucu == null) {
                                this.close();
                            } else if (this.props.action == 'payDebt'
                                && this.props.phieuthucu != null
                                && dulieuguive.isEdit != true) {
                                idprint = this.props.phieuthucu['ID'];
                            }

                            query = 'SELECT * FROM quanlyhocsinh.BIENLAIHOCPHI WHERE `ID` = \'!\?!\'; ';
                            query = query.replace('!\?!', idprint);                    
                            this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
                                fn: 'form_hoadon_phieuthu_phieuthuhocphi_inphieuthu',
                                isEdit: dulieuguive.isEdit,
                            });
                        } else {
                            this.close();
                        }
                        break;
                    case 'form_hoadon_phieuthu_phieuthuhocphi_inphieuthu':
                        let maphieuthu = rows[0]['Mã Phiếu'];
                        let maphieuno = rows[0]['Mã Phiếu Nợ'];
                        if (maphieuno == null
                        && this.props.phieuthucu != null
                        && this.props.phieuthucu.hoadontruoc != null
                        && this.props.phieuthucu.hoadontruoc['Còn Nợ'] != 0) {
                            maphieuno = this.props.phieuthucu.hoadontruoc['Mã Phiếu'];
                        }
                        let makiemtra = '';
                        let dongtientungay = new Date(rows[0]['Đầu Chu Kỳ']).toLocaleDateString('en-GB');
                        let dongtiendenngay = new Date(rows[0]['Cuối Chu Kỳ']).toLocaleDateString('en-GB');
                        let ngaydonghangthang = new Date(rows[0]['Cuối Chu Kỳ']);
                        ngaydonghangthang.setDate(ngaydonghangthang.getDate() + 1);
                        ngaydonghangthang = ngaydonghangthang.toLocaleDateString('en-GB');                        
                        this.setState({
                            ngaydonghangthang: ngaydonghangthang,
                            maphieuthu: maphieuthu,
                            makiemtra: makiemtra,
                            maphieuno: maphieuno,
                            dongtientungay: dongtientungay,
                            dongtiendenngay: dongtiendenngay,
                            isPrint: true,
                        });
                        this.close();
                        break;
                    case 'form_hoadon_phieuthu_phieuthuhocphi_loadthongtinhoadon':
                        let chotchuky = null;
                        let nocu = 0;
                        if (rows[0][0] != null) {
                            chotchuky = new Date(rows[0][0]['ngaychot']);
                        }

                        if (rows[1][0] != null && rows[1][0].isOwe == 1) {
                            nocu = rows[1][0]['Còn Nợ'];
                        }

                        if (rows[1][0] != null && chotchuky != null && rows[1][0].isChange == 0) {
                            this.setState({
                                chotchuky: chotchuky,
                            })

                            let cuoichuky = new Date(rows[1][0]['Cuối Chu Kỳ']);
                            let dauchuky = new Date(rows[1][0]['Đầu Chu Kỳ']);
                            if (chotchuky > dauchuky && chotchuky < cuoichuky) {
                                cuoichuky.setDate(cuoichuky.getDate() + 1);
                                let songay = (cuoichuky - dauchuky) / 86400000;                                                              
                                let songaydahoc = (chotchuky - dauchuky) / 86400000;

                                let tientanggiam = rows[1][0]['Tổng Đã Giảm Giá'];
                                tientanggiam = tientanggiam - this.lamtron((tientanggiam / songay) * songaydahoc);
                               
                                this.setState({
                                    thongtin_chotchuky: {
                                        tientanggiam: tientanggiam,
                                        songay: songay,
                                        songaydahoc: songaydahoc,
                                    },                                    
                                })
                            }
                        }

                        if (rows[1][0] != null && this.props.action != 'payDebt') {
                            let ngaybatdauchuky = new Date(rows[1][0]['Cuối Chu Kỳ']);
                            ngaybatdauchuky.setDate(ngaybatdauchuky.getDate() + 1);
                            this.refs.ngaybatdauchuky.value = ngaybatdauchuky.getFullYear() + '-' + ("0" + (ngaybatdauchuky.getMonth() + 1)).slice(-2) + '-' + ("0" + ngaybatdauchuky.getDate()).slice(-2);                            
                            this.refs.ngayketthucchuky.min = this.refs.ngaybatdauchuky.value;
                            ngaybatdauchuky.setMonth(ngaybatdauchuky.getMonth() + this.state.sothangdong);
                            ngaybatdauchuky.setDate(ngaybatdauchuky.getDate() - 1);
                            this.refs.ngayketthucchuky.value = ngaybatdauchuky.getFullYear() + '-' + ("0" + (ngaybatdauchuky.getMonth() + 1)).slice(-2) + '-' + ("0" + ngaybatdauchuky.getDate()).slice(-2);
                            this.refs.ngayketthucchuky.max = ngaybatdauchuky.getFullYear() + '-' + ("0" + (ngaybatdauchuky.getMonth() + 1)).slice(-2) + '-' + ("0" + ngaybatdauchuky.getDate()).slice(-2);
                        }

                        this.setState({
                            nocu: nocu,
                            nocumoi: nocu,
                            phieuthutruoc: rows[1][0],
                        });
                        break;
                    default:                        
                }                
            }
        }

        if (hanhdong == 'loi-cu-phap') {
            if (dulieuguive != null) {
                switch (dulieuguive.fn) {
                    case 'form_hoadon_phieuthu_phieuthuhocphi_loaddanhsachmonhoc':
                    case 'form_hoadon_phieuthu_phieuthuhocphi_loaddiscount':
                    case 'form_hoadon_phieuthu_phieuthuhocphi_xuathoadon':
                    case 'form_hoadon_phieuthu_phieuthuhocphi_inphieuthu':
                    case 'form_hoadon_phieuthu_phieuthuhocphi_loadthongtinhoadon':
                        this.setState({
                            btnDongYDisable: false,
                        });
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

        switch (this.props.action) {
            case 'print':
                if (this.props.phieuthucu != null) {
                    this.refs.noidungghichu.value = this.props.phieuthucu['Ghi Chú'];
                }
            case 'payDebt':
                if (this.props.phieuthucu == null) {
                    this.close();
                } else {
                    let ngaybatdauchuky = new Date(this.props.phieuthucu['Đầu Chu Kỳ']);
                    let ngayketthucchuky = new Date(this.props.phieuthucu['Cuối Chu Kỳ']);
                    this.refs.ngaybatdauchuky.value = ngaybatdauchuky.getFullYear() + '-' + ("0" + (ngaybatdauchuky.getMonth() + 1)).slice(-2) + '-' + ("0" + ngaybatdauchuky.getDate()).slice(-2);
                    this.refs.ngayketthucchuky.value = ngayketthucchuky.getFullYear() + '-' + ("0" + (ngayketthucchuky.getMonth() + 1)).slice(-2) + '-' + ("0" + ngayketthucchuky.getDate()).slice(-2);
                    this.refs.ngayketthucchuky.min = this.refs.ngaybatdauchuky.value;
                    ngaybatdauchuky.setMonth(ngaybatdauchuky.getMonth() + this.props.phieuthucu['Số Tháng Đóng']);
                    ngaybatdauchuky.setDate(ngaybatdauchuky.getDate() - 1);
                    this.refs.ngayketthucchuky.max = ngaybatdauchuky.getFullYear() + '-' + ("0" + (ngaybatdauchuky.getMonth() + 1)).slice(-2) + '-' + ("0" + ngaybatdauchuky.getDate()).slice(-2);
                    this.tientanggiam.value(this.props.phieuthucu['Tiền Tăng Giảm']);
                    let dathanhtoan = 0;
                    if (this.props.action == 'payDebt') {
                        dathanhtoan = this.props.phieuthucu['Đã Thanh Toán'];
                    }
                    this.setState({
                        sothangdong: this.props.phieuthucu['Số Tháng Đóng'],
                        dathanhtoan: dathanhtoan,
                        isDisable: true,
                        _isDisable: true,
                    })
                }
                break;
            default:                
        }

        query = 'SELECT * FROM quanlyhocsinh.MONHOC_!\?!; ';
        query = query.replace('!\?!', $('.khuvuc').attr('value'));
        query += 'SELECT * FROM quanlyhocsinh.CHUONGTRINHHOCBOSUNG WHERE (`Cơ Sở` = \'ALL\' OR `Cơ Sở` = \'!\?!\') AND (`Lớp Áp Dụng` = \'!\?!\' OR `Lớp Áp Dụng` IS NULL); ';
        query = query.replace('!\?!', $('.khuvuc').attr('value'));
        query = query.replace('!\?!', this.props.data['Lớp']);
        if (this.props.action == 'pay') {
            query += 'SELECT * FROM quanlyhocsinh.DANGKIMONHOC WHERE `User ID` = \'!\?!\'; ';
            query = query.replace('!\?!', this.props.data['User ID']);
        }
        this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
            fn : 'form_hoadon_phieuthu_phieuthuhocphi_loaddanhsachmonhoc',
        });

        if (this.props.action == 'add'
        || this.props.action == 'pay') {
            query = 'SELECT * FROM CHOTHOCPHI ' +
            'WHERE (branch = \'ALL\' OR branch = \'!\?!\') ' +
            'AND expiresDate >= CURDATE() ' +
            'AND expiresDate IS NOT NULL; ';
            query += 'SELECT * FROM BIENLAIHOCPHI WHERE `User ID` = \'!\?!\' ' +
            'AND BIENLAIHOCPHI.`Ngày Hủy Phiếu` IS NULL ' +
            'AND BIENLAIHOCPHI.`Nội Dung` NOT LIKE \'@@@%\' ' +
            'ORDER BY BIENLAIHOCPHI.`Mã Phiếu` DESC LIMIT 1; ';
            query = query.replace('!\?!', $('.khuvuc').attr('value'));
            query = query.replace('!\?!', this.props.data['User ID']);
            this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
                fn : 'form_hoadon_phieuthu_phieuthuhocphi_loadthongtinhoadon',
            });
        }
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.changeSize);
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentDidUpdate(prevProps, prevState) {
        this.changeSize();

        if (this.state.discountIsChange == true) {
            this.setState({
                discountIsChange: false
            });
            this.tinhtongtien();
        }

        if (this.state.isChangeSubject == true) {
            this.setState({
                isChangeSubject: false
            });
            this.tinhtongtien();
        }

        if (prevState.sothangdong != this.state.sothangdong) {
            this.onChangeNgayChuky();
        }

        if (this.state.isPrint == true) {
            this.setState({
                isPrint: false,
            })  
            printJS({
                printable: 'form_hoadon_phieuthu_phieuthuhocphi_printform', 
                type: 'html',
                documentTitle: 'Phiếu Thu',
                css: 'home/style_phieuthu.css',
                modalMessage: 'Đang chuẩn bị phiếu thu...',
                showModal: true,
                honorMarginPadding: false,
            });
        }

        if (this.state.isDisable != this.state._isDisable) {
            this.close();
        }
    }

    lamtron (number) {
        let phanngan = Math.floor(number / 1000) * 1000;
        let phandu = number - phanngan;

        if (phandu >= 500) {
            phanngan = phanngan + 1000;
        }

        return phanngan;
    }

    tinhtongtien () {
        let tong = 0;
        let tongphaithanhtoan = 0;
        let discount = this.state.discount;

        let datinh = [];        
        this.state.danhsachmonhoc.map((e, i) => {
            if (e.checked) {
                let tienmonhoc = this[e['Mã Môn Học'] + '_' + i].value();
                if (e.idchuongtrinhhoc != null 
                    && e.trongoi == true) {
                    if (datinh.indexOf(e.idchuongtrinhhoc) == -1) {
                        tienmonhoc = Number(e.giatrongoi);
                        datinh.push(e.idchuongtrinhhoc);
                    } else {
                        tienmonhoc = 0;
                    }
                }

                if (tienmonhoc != null) {
                    tong += tienmonhoc;
                    tongphaithanhtoan += tienmonhoc;
                }
            }
        });

        tong = tong * this.state.sothangdong;
        tongphaithanhtoan = tongphaithanhtoan * this.state.sothangdong;

        if (this.refs.ngaybatdauchuky.value != '' && this.refs.ngayketthucchuky.value != '') {
            let ngbd = new Date(this.refs.ngaybatdauchuky.value);
            let ngkt = new Date(this.refs.ngayketthucchuky.value);
            ngkt.setDate(ngkt.getDate() + 1);
            let songay = (ngkt - ngbd) / 86400000;

            ngbd = new Date(this.refs.ngaybatdauchuky.value);
            ngkt = new Date(this.refs.ngaybatdauchuky.value);
            ngkt.setMonth(ngkt.getMonth() + Number(this.state.sothangdong));
            let songaychuky = (ngkt - ngbd) / 86400000;

            if (songay != songaychuky) {
                tong = this.lamtron((tong / songaychuky) * songay);
                tongphaithanhtoan = (tongphaithanhtoan / songaychuky) * songay;
            }
        }
        
        for (let val of discount) {
            if (val['Phương Thức'] == 'trên tổng tiền' && val.checked) {
                tongphaithanhtoan -= ((tong * val['Mức Giảm']) / 100);
            }
        }

        let tonggiam = ((tong - tongphaithanhtoan) / tong) * 100;
        if (tonggiam > this.state.maxdiscount) {
            tongphaithanhtoan = tong - ((tong * this.state.maxdiscount) / 100);
        }

        if (this.state.discountCustom == true) {
            let tanggiam = 0;
            if (this.refs.tanghocphi.value != '') {
                tanggiam = tanggiam - Number(this.refs.tanghocphi.value);
            }

            if (this.refs.giamhocphi.value != '') {
                tanggiam = tanggiam + Number(this.refs.giamhocphi.value);
            }

            if (tanggiam != 0) {
                tongphaithanhtoan = tong - ((tong * tanggiam) / 100);
            } else {
                tongphaithanhtoan = tong;
            }
        }

        let nocu = this.state.nocu;
        if (this.state.thongtin_chotchuky != null) {
            let nochotchuky = tongphaithanhtoan / this.state.sothangdong;
            nochotchuky = nochotchuky - this.lamtron((nochotchuky / this.state.thongtin_chotchuky.songay) * this.state.thongtin_chotchuky.songaydahoc);
            nochotchuky = nochotchuky - this.state.thongtin_chotchuky.tientanggiam;
            nocu = nocu + nochotchuky;
        }
        let dathanhtoan = this.state.dathanhtoan;
        let tientanggiambosung = 0;
        if (this.tientanggiambosung != null) {
            tientanggiambosung = Number(this.tientanggiambosung.value());
        }
        tongphaithanhtoan = Number(tongphaithanhtoan) + Number(this.tientanggiam.value()) + tientanggiambosung + nocu - dathanhtoan;
        tongphaithanhtoan = this.lamtron(tongphaithanhtoan);
        
        this.setState({
            tong: tong,
            tongphaithanhtoan: tongphaithanhtoan,
            nocumoi: nocu,
        })
    }

    onDiscountChoose (e) {
        let discount = this.state.discount;
        for (let val of discount) {
            if (val['Loại'] == e) {
                if (val.checked) {
                    val.checked = false;
                } else {
                    val.checked = true;
                }
                break;
            }
        }

        this.setState({
            discount: discount,
            discountIsChange: true,
        })
    }

    onChangeTongPhaiThanhToan () {
        if (this.props.action == 'print') {
            this.sotiendadong.value(this.props.phieuthucu['Đã Thanh Toán']);
            this.sotienconno.value(Number(this.state.tongphaithanhtoan) - Number(this.sotiendadong.value()));
        } else {
            this.sotiendadong.value(this.state.tongphaithanhtoan);
        }
    }

    onChangeNhapTienVao () {
        this.sotienconno.value(Number(this.state.tongphaithanhtoan) - Number(this.sotiendadong.value()));
    }

    onChangeSoThangDong (element) {
        let sothangdong = element.target.value;
        if (sothangdong < 1) {
            sothangdong = 1;
        }
        let maxdiscount = 0;

        let discount = this.state.discount;
        for (let val of discount) {
            if (val['Month'] != null) {
                if (sothangdong >= val['Month']) {
                    if (maxdiscount < val['Month']) {
                        maxdiscount = val['Month'];
                    }
                }
            }
        }

        for (let val of discount) {
            if (val['Month'] != null) {
                if (val['Month'] == maxdiscount) {
                    val.checked = true;
                    val.disabled = false;
                } else {
                    val.checked = false;
                    val.disabled = true;
                }
            }
        }

        this.setState({
            sothangdong: sothangdong,
            discount: discount,
        });
    }

    onChangeNgayChuky (isNgayKetThuc) {
        if (isNgayKetThuc == true) {
            if (this.refs.ngayketthucchuky.value != '') {
                let ngayketthucchuky = new Date(this.refs.ngayketthucchuky.value);
                if (ngayketthucchuky > new Date(this.refs.ngayketthucchuky.max)) {
                    this.refs.ngayketthucchuky.value = this.refs.ngayketthucchuky.max;
                }
    
                if (ngayketthucchuky < new Date(this.refs.ngayketthucchuky.min)) {
                    this.refs.ngayketthucchuky.value = this.refs.ngayketthucchuky.min;
                }
            } else {
                this.refs.ngayketthucchuky.value = this.refs.ngayketthucchuky.max;
            }
        } else {
            let ngaydauchuky;
            if (this.refs.ngaybatdauchuky.value != '') {
                ngaydauchuky = new Date(this.refs.ngaybatdauchuky.value);
                let dongtientungay = ngaydauchuky.getFullYear() + '-' + ("0" + (ngaydauchuky.getMonth() + 1)).slice(-2) + '-' + ("0" + ngaydauchuky.getDate()).slice(-2);
                ngaydauchuky.setMonth(ngaydauchuky.getMonth() + Number(this.state.sothangdong));
                ngaydauchuky.setDate(ngaydauchuky.getDate() - 1);
                let dongtiendenngay = ngaydauchuky.getFullYear() + '-' + ("0" + (ngaydauchuky.getMonth() + 1)).slice(-2) + '-' + ("0" + ngaydauchuky.getDate()).slice(-2);
                this.refs.ngaybatdauchuky.value = dongtientungay;
                this.refs.ngayketthucchuky.value = dongtiendenngay;
    
                this.refs.ngayketthucchuky.min = dongtientungay;
                this.refs.ngayketthucchuky.max = dongtiendenngay;
            }
        }
        this.tinhtongtien();
    }

    dongy (isPrint) {
        if (this.state.tong <= 0) {
            this.props.dispatch({
                type: 'ALERT_NOTIFICATION_ADD',
                content: 'Tổng tạm tính không thể bằng không (0), vui lòng kiểm tra lại!',
                notifyType: 'warning',
            })
            return;
        }
        let ghichu = '';
        let noidung = '';
        let lydodongtien = '';
        let giamhocphi = '';
        let tanghocphi = '';
        let sotienbangso = '';
        let sotienbangchu = '';
        let objMonhoc = this.props.objMonhoc;

        let chuongtrinhtrongoi = {};
        let giatrongoi = {};
        this.state.danhsachmonhoc.map((e, i) => {
            if (e.checked) {
                let tienmonhoc = this[e['Mã Môn Học'] + '_' + i].value();
                if (tienmonhoc != null) {
                    if (e.idchuongtrinhhoc != null) {
                        let tg = 0;
                        if (e.trongoi == true) {
                            tg = 1;
                        }
                        noidung += e['Mã Môn Học'] + ':' 
                        + tienmonhoc +  ':' 
                        + e.classNumber + ':' 
                        + e.idchuongtrinhhoc + ':'
                        + e.giatrongoi + ':' 
                        + tg + ',';
                    } else {
                        noidung += e['Mã Môn Học'] + ':' + tienmonhoc +  ':' + e.classNumber + ',';
                    }

                    let cthoc = '';
                    if (e.idchuongtrinhhoc != null 
                    && e.trongoi == true) {
                        if (chuongtrinhtrongoi[e.idchuongtrinhhoc] == null) {
                            chuongtrinhtrongoi[e.idchuongtrinhhoc] = e.tenchuongtrinhhoc + ' (';
                            giatrongoi[e.idchuongtrinhhoc] = e.giatrongoi;
                        }
                        chuongtrinhtrongoi[e.idchuongtrinhhoc] += e['Tên Môn'] + ', ';
                    } else {
                        if (e.idchuongtrinhhoc != null) {
                            cthoc = '[' + e.tenchuongtrinhhoc + '] ';
                        }
                        lydodongtien += cthoc + e['Tên Môn'] + ' (Số Lượng: ' + e.classNumber + '): ' + this[e['Mã Môn Học'] + '_' + i].getMoneyValue() + ', ';
                    }

                    if (objMonhoc != null
                    && isNaN(e['Bảng Giá'])) {
                        for (var i in objMonhoc) {
                            if (objMonhoc.hasOwnProperty(i)) {
                                if (objMonhoc[i].mamon == e['Mã Môn Học']) {
                                    objMonhoc[i].gia = tienmonhoc / e.classNumber;
                                }
                            }
                        }
                    }
                }
            }
        })

        for (let i in chuongtrinhtrongoi) {
            if (chuongtrinhtrongoi.hasOwnProperty(i)) {
                chuongtrinhtrongoi[i] = chuongtrinhtrongoi[i].substr(0, chuongtrinhtrongoi[i].length - 2);
                chuongtrinhtrongoi[i] += '): ' + giatrongoi[i] + ' VNĐ, ';
                lydodongtien += chuongtrinhtrongoi[i];
            }
        }
        
        let truongtrinhgiamgia = '';
        for (let val of this.state.discount) {
            if (val.checked) {
                truongtrinhgiamgia += val['Loại'] + ':' + val['Mức Giảm'] + ',';
                if (val['Phương Thức'] != null) {
                    giamhocphi += val['Mức Giảm'] + '% ' + val['Loại'] + ' (' + val['Phương Thức'] + '), ';
                } else {
                    giamhocphi += val['Mức Giảm'] + '% ' + val['Loại'] + ', ';
                }
                
            }
        }

        sotienbangso = this.sotiendadong.getMoneyValue();
        try {
            sotienbangchu = window.to_vietnamese(this.sotiendadong.value());
        } catch (e) {
        }
        
        let date = new Date();
        let mannhanvien = $('#lable_button_nexttoicon').attr('value');
        let userid = this.props.data['User ID'];
        let ngaylaphoadon = date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2);
        let sothangdong = this.state.sothangdong;
        let tong = this.state.tong;
        let tongdagiam = this.state.tongphaithanhtoan;
        let dathanhtoan = this.sotiendadong.value();
        let isowe = '0';
        let conno = this.sotienconno.value();
        if (conno != 0) {
            isowe = '1';
        }
        let coso = $('.khuvuc').attr('value');
        let ngaydauchuky = new Date();
        if (this.refs.ngaybatdauchuky.value != '') {
            ngaydauchuky = new Date(this.refs.ngaybatdauchuky.value);
        }
        let dongtientungay = ngaydauchuky.getFullYear() + '-' + ("0" + (ngaydauchuky.getMonth() + 1)).slice(-2) + '-' + ("0" + ngaydauchuky.getDate()).slice(-2);
        if (this.refs.ngaybatdauchuky.value != '') {
            ngaydauchuky = new Date(this.refs.ngayketthucchuky.value);
        } else {
            ngaydauchuky.setMonth(ngaydauchuky.getMonth() + Number(sothangdong));
            ngaydauchuky.setDate(ngaydauchuky.getDate() - 1);
        }
        let dongtiendenngay = ngaydauchuky.getFullYear() + '-' + ("0" + (ngaydauchuky.getMonth() + 1)).slice(-2) + '-' + ("0" + ngaydauchuky.getDate()).slice(-2);
        let giamgiakhac = '';

        if (this.state.discountCustom == true) {
            if (this.refs.giamhocphi.value != '' || this.refs.tanghocphi.value != '') {
                let obj = {
                    giamhocphi: this.refs.giamhocphi.value,
                    lydogiamhocphi: this.refs.lydogiamhocphi.value,
                    tanghocphi: this.refs.tanghocphi.value,
                    lydotanghocphi: this.refs.lydotanghocphi.value,
                }
                if (this.refs.giamhocphi.value != '') {
                    giamhocphi = this.refs.giamhocphi.value + ' % (' + this.refs.lydogiamhocphi.value + ')';
                }
                if (this.refs.tanghocphi.value != '') {
                    tanghocphi = this.refs.tanghocphi.value + ' % (' + this.refs.lydotanghocphi.value + ')';
                }
                giamgiakhac = JSON.stringify(obj);
            }
        }

        ghichu = this.refs.noidungghichu.value.trim();

        let query = 'INSERT INTO `quanlyhocsinh`.`BIENLAIHOCPHI` (`Mã Phiếu Nợ`, `Mã Nhân Viên`, `User ID`, `Ngày Lập Hóa Đơn`, `Nội Dung`, `Chương Trình Giảm Giá`, `Số Tháng Đóng`, `Tổng`, `Tổng Đã Giảm Giá`, `Đã Thanh Toán`, `Còn Nợ`, `Đầu Chu Kỳ`, `Cuối Chu Kỳ`, `Giảm Giá Khác`, `Ghi Chú`, `isOwe`, `Cơ Sở`, `Tiền Tăng Giảm`) VALUES (\'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\'); '
        if (this.props.action == 'payDebt' && this.props.phieuthucu != null) {
            query = query.replace('!\?!', this.props.phieuthucu['Mã Phiếu']);
        } else {
            query = query.replace('!\?!', 'null');
        }
        query = query.replace('!\?!', mannhanvien);
        query = query.replace('!\?!', userid);
        query = query.replace('!\?!', ngaylaphoadon);
        query = query.replace('!\?!', noidung);
        query = query.replace('!\?!', truongtrinhgiamgia);
        query = query.replace('!\?!', sothangdong);
        query = query.replace('!\?!', tong);
        query = query.replace('!\?!', tongdagiam);
        query = query.replace('!\?!', dathanhtoan);
        query = query.replace('!\?!', conno);
        query = query.replace('!\?!', dongtientungay);
        query = query.replace('!\?!', dongtiendenngay);
        query = query.replace('!\?!', giamgiakhac);
        query = query.replace('!\?!', ghichu);
        query = query.replace('!\?!', isowe);
        query = query.replace('!\?!', coso);
        let tientanggiambosung = 0;
        if (this.tientanggiambosung != null) {
            tientanggiambosung = Number(this.tientanggiambosung.value());
        }
        query = query.replace('!\?!', Number(this.tientanggiam.value()) + tientanggiambosung);
        query = query.replace(/''/g, 'null');
        query = query.replace(/'null'/g, 'null');

        if (isPrint == true) {
            sotienbangchu = sotienbangchu.trim();
            sotienbangchu = sotienbangchu.charAt(0).toUpperCase() + sotienbangchu.slice(1);
            let _tientanggiam = '';
            if (this.tientanggiam.value() != 0) {
                if (this.tientanggiam.value() > 0) {
                    _tientanggiam = ' + ' + this.tientanggiam.getMoneyValue();
                } else {
                    _tientanggiam = ' ' + this.tientanggiam.getMoneyValue();
                }
            }
            if (this.tientanggiambosung != null
            && this.tientanggiambosung.value() != 0) {
                if (this.tientanggiambosung.value() > 0) {
                    _tientanggiam = ' + ' + this.tientanggiambosung.getMoneyValue();
                } else {
                    _tientanggiam = ' ' + this.tientanggiambosung.getMoneyValue();
                }
            }
            let _nocu = '';
            if (this.state.nocumoi != 0) {
                if (this.refs.nocu.value() > 0) {
                    _nocu = ' + ' + this.refs.nocu.getMoneyValue();
                } else {
                    _nocu = ' ' + this.refs.nocu.getMoneyValue();
                }
                _nocu += ' (Nợ cũ)';
            }
            let _dathanhtoan = '';
            if (this.state.dathanhtoan != 0
            && this.refs.dathanhtoan.value() > 0) {
                _dathanhtoan = ' - ' + this.refs.dathanhtoan.getMoneyValue();
                _dathanhtoan += ' (Đã thanh toán rồi)';
            }
            this.setState({
                lydodongtien: lydodongtien,
                giamhocphi: giamhocphi,
                tanghocphi: tanghocphi,
                sotienbangso: sotienbangso,
                sotienbangchu: sotienbangchu,
                tongtien: this.refs.tongtien.getMoneyValue() + _tientanggiam + _dathanhtoan + _nocu,
                tongtiensaukhigiam: this.refs.tongtiensaugiam.getMoneyValue(),
                conno: this.refs.tienconno.getMoneyValue(),
                ghichu: ghichu,
            });
        }
        
        if (this.props.action == 'print') {
            let maphieuthu = this.props.phieuthucu['Mã Phiếu'];
            let maphieuno = this.props.phieuthucu['Mã Phiếu Nợ'];
            if (maphieuno == null
            && this.props.phieuthucu != null
            && this.props.phieuthucu.hoadontruoc != null
            && this.props.phieuthucu.hoadontruoc['Còn Nợ'] != 0) {
                maphieuno = this.props.phieuthucu.hoadontruoc['Mã Phiếu'];
            }
            let makiemtra = '';
            let dongtientungay = new Date(this.props.phieuthucu['Đầu Chu Kỳ']).toLocaleDateString('en-GB');
            let dongtiendenngay = new Date(this.props.phieuthucu['Cuối Chu Kỳ']).toLocaleDateString('en-GB');
            let ngaydonghangthang = new Date(this.props.phieuthucu['Cuối Chu Kỳ']);
            ngaydonghangthang.setDate(ngaydonghangthang.getDate() + 1);
            ngaydonghangthang = ngaydonghangthang.toLocaleDateString('en-GB');
            this.setState({
                maphieuthu: maphieuthu,
                makiemtra: makiemtra,
                maphieuno: maphieuno,
                dongtientungay: dongtientungay,
                dongtiendenngay: dongtiendenngay,
                ngaydonghangthang: ngaydonghangthang,
                isPrint: true,
            });
        } else {
            this.setState({
                btnDongYDisable: true,
            })

            if (this.state.phieuthutruoc != null) {
                let query_setno = 'UPDATE `quanlyhocsinh`.`BIENLAIHOCPHI` SET `isOwe`=\'0\'!\?! WHERE `ID`=\'!\?!\'; ';
                let chot = '';
                if (this.state.thongtin_chotchuky != null ) {
                    chot = ', `Còn Nợ`=\'!\?!\', `isChange`=\'1\'';
                    chot = chot.replace('!\?!', conno);
                }
                query_setno = query_setno.replace('!\?!', chot);
                query_setno = query_setno.replace('!\?!', this.state.phieuthutruoc['ID']);
                query += query_setno;
            }

            if (this.props.action == 'payDebt' && this.props.phieuthucu == null) {
                this.close();
            } else if (this.props.action == 'payDebt' && this.props.phieuthucu != null) {
                this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
                    fn: 'form_hoadon_phieuthu_phieuthuhocphi_xuathoadon',
                    isReload: true,
                    reloadPageName: 'hoadon',
                    isSuccess: true,
                    isPrint: isPrint,
                });
            }

            if ((this.props.action == 'add' && this.props.queryMonHoc == null)
            || this.props.action == 'pay') {
                this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
                    fn: 'form_hoadon_phieuthu_phieuthuhocphi_xuathoadon',
                    isReload: true,
                    reloadPageName: 'hoadon',
                    isSuccess: true,
                    isPrint: isPrint,
                });
            } else if (this.props.action == 'add' && this.props.queryMonHoc != null) {
                let queryMonHoc = this.props.queryMonHoc.replace('@@@', JSON.stringify(objMonhoc));                
                this.SocketEmit('gui-query-den-database', queryMonHoc);
                this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
                    fn: 'form_hoadon_phieuthu_phieuthuhocphi_xuathoadon',
                    isReload: true,
                    reloadPageName: 'hoadon',
                    isSuccess: true,
                    isPrint: isPrint,
                });
            }
        }
    }

    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    }

    render () {
        let title = 'Phiếu Thu Học Phí';
        let btnBack = '';
        if (this.props.onBack != null) {
            btnBack = 
            <Button 
                onClick={this.props.onBack}
                value="Quay Lại"
                icon="back"
                style={{'float': 'right', 'margin-right': '10px',}}
                disabled={this.state.btnDongYDisable}
            />
        }

        let listBtn = '';
        let date = new Date();
        if (this.props.action != 'print') {
            listBtn = 
            <div>
                <Button 
                    onClick={this.close.bind(this)}
                    value="Thoát"
                    icon="close"
                    style={{'float': 'right', 'margin-right': '10px',}}
                />
                <Button 
                    onClick={this.dongy.bind(this, false)}
                    value="Đồng Ý"
                    icon="agree"
                    style={{'float': 'right', 'margin-right': '10px',}}
                    disabled={this.state.btnDongYDisable}
                />
                <Button 
                    onClick={this.dongy.bind(this, true)}
                    value="Đồng Ý Và In Hóa Đơn"
                    icon="print"
                    style={{'float': 'right', 'margin-right': '10px',}}
                    disabled={this.state.btnDongYDisable}
                />
                {btnBack}
            </div>
        } else {
            listBtn = 
            <div>
                <Button 
                    onClick={this.close.bind(this)}
                    value="Thoát"
                    icon="close"
                    style={{'float': 'right', 'margin-right': '10px',}}
                />
                <Button 
                    onClick={this.dongy.bind(this, true)}
                    value="In"
                    icon="print"
                    style={{'float': 'right', 'margin-right': '10px',}}
                    disabled={this.state.btnDongYDisable}
                />
            </div>
            date = new Date(this.props.phieuthucu['Ngày Lập Hóa Đơn']);
            title = 'Thông Tin Phiếu ' + this.props.phieuthucu['Mã Phiếu'];
        }

        let nocu = '';
        if (this.state.nocumoi != 0) {
            nocu = 
            <Tien 
                label={'Nợ cũ:'}
                value={this.state.nocumoi}
                fn={this.tinhtongtien.bind(this)}
                spacechar={'.'}
                style={{
                    'padding': '0',
                }}
                ref="nocu"
            />
        }

        let dathanhtoan = '';
        if (this.state.dathanhtoan != 0) {
            dathanhtoan =
            <Tien 
                label={'Đã thanh toán:'}
                value={this.state.dathanhtoan}
                spacechar={'.'}
                style={{
                    'padding': '0',
                }}
                ref="dathanhtoan"
            />
        }

        let disabledWithoutPrint = this.state.isDisable;
        let tanggiambosung = null;
        if (this.props.action == 'payDebt') {
            disabledWithoutPrint = false;
            tanggiambosung = 
            <Tien 
                label={'Tiền tăng giảm bổ sung:'}
                fn={this.tinhtongtien.bind(this)}
                spacechar={'.'}
                style={{
                    'padding': '0',
                }}
                canInput={true}
                getMe={me => this.tientanggiambosung = me}
            />
        }

        let maphieuno = '';
        if (this.state.maphieuno != null) {
            maphieuno = <div>Mã Phiếu Nợ: {this.state.maphieuno}<br/></div>
        }

        let sdt = '';
        if (this.props.data['Số Điện Thoại'] != null) {
            sdt = this.props.data['Số Điện Thoại'];
            if (sdt[0] != '0') {
                sdt = '0' + sdt;
            }
        }

        let sdt1 = '';
        if (this.props.data['Số Điện Thoại (NT1)'] != null) {
            sdt1 = this.props.data['Số Điện Thoại (NT1)'];
            if (sdt1[0] != '0') {
                sdt1 = '0' + sdt1;
            }
            sdt1 = ' - ' + sdt1;
        }

        let sdt2 = '';
        if (this.props.data['Số Điện Thoại (NT2)'] != null) {
            sdt2 = this.props.data['Số Điện Thoại (NT2)'];
            if (sdt2[0] != '0') {
                sdt2 = '0' + sdt2;
            }
            sdt2 = ' - ' + sdt2;
        }

        return (
            <div>
                <div className={style.formstyle} ref="background">
                    <div className="form_body" ref="body"style={{'width': '1100px'}}>
                        <div className="header">
                            <h2>{title}</h2>
                        </div>
                        <div className="body">
                            <h2 style={{
                                'text-align': 'center',
                                'margin': '0',
                            }}>
                                {this.props.data['Họ Và Tên'] + ' - Lớp ' + this.props.data['Lớp']}
                            </h2>
                            <div style={{
                                    'text-align': 'center',
                                    'display': 'grid',
                                    'grid-template-columns': '50% 50%',
                                }}
                            >
                                <div className="divformstyle" style={{'border-right': '1px solid #888'}}>
                                    <div style={{'border-top': '1px solid #888'}}>
                                        Ngày bắt đầu chu kỳ:
                                        <input
                                            type="date"
                                            ref="ngaybatdauchuky" 
                                            onChange={this.onChangeNgayChuky.bind(this, false)}
                                            disabled={this.state.isDisable}
                                        />
                                    </div>
                                    <div style={{'border-bottom': '1px solid #888'}}>
                                        Ngày kết thúc chu kỳ:
                                        <input 
                                            type="date"
                                            ref="ngayketthucchuky"
                                            onChange={this.onChangeNgayChuky.bind(this, true)}
                                            disabled={this.state.isDisable}
                                        />
                                    </div>
                                    <div style={{
                                        'padding': '0',
                                        'height': '600px',
                                        'overflow-y': 'auto',
                                        'overflow-x': 'hidden',
                                    }}>
                                        {this.state.danhsachmonhoc.map((e, i) => {
                                            let color = null;
                                            let ghichu = '';
                                            let discount = null;
                                            if (e.tenchuongtrinhhoc != null) {
                                                ghichu += '(' + e.tenchuongtrinhhoc + ')'
                                            }
                                            let checked = e.checked;
                                            return (
                                                <div>
                                                    <input 
                                                        type="checkbox" 
                                                        style={{'width': 'auto'}} 
                                                        checked={checked} 
                                                        onChange={() => {
                                                            let danhsachmonhoc = this.state.danhsachmonhoc;
                                                            danhsachmonhoc.map((v1, i1) => {
                                                                if (i == i1
                                                                || (e.trongoi && v1.trongoi)) {
                                                                    if (v1.checked == true) {
                                                                        v1.checked = false;
                                                                    } else {
                                                                        v1.checked = true;
                                                                    }
                                                                }
                                                            })
                                                            this.setState({
                                                                danhsachmonhoc: danhsachmonhoc,
                                                                isChangeSubject: true,
                                                            });
                                                        }}
                                                        disabled={this.state.isDisable}
                                                    />
                                                    {'(' + e.classNumber + ') ' + e['Tên Môn'] + ': ' + ghichu}
                                                    <Tien 
                                                        // label={'(' + e.classNumber + ') ' + e['Tên Môn'] + ': ' + ghichu}
                                                        value={e.price}
                                                        discount={discount}
                                                        spacechar={'.'}
                                                        getMe={me => this[e['Mã Môn Học'] + '_' + i] = me}
                                                        fn={this.tinhtongtien.bind(this)}
                                                        style={{
                                                            'padding': '0',
                                                            'background': color,
                                                        }}
                                                    />
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                                <div className="divformstyle">
                                    <div style={{
                                        'border-top': '1px solid #888',
                                        'border-bottom': '1px solid #888',
                                    }}>
                                        <Tien 
                                            label={'Tạm tính:'}
                                            value={this.state.tong}
                                            spacechar={'.'}
                                            style={{
                                                'padding': '0',
                                            }}
                                            ref='tongtien'
                                        />
                                        {'Số tháng đóng: '}
                                        <input 
                                            type="number" 
                                            min="1" 
                                            value={this.state.sothangdong} 
                                            onChange={this.onChangeSoThangDong.bind(this)} 
                                            ref='sothangdong'
                                            disabled={this.state.isDisable}
                                        />
                                    </div>
                                    <div style={{
                                        'height': '345px',
                                        'overflow-y': 'auto',
                                        'overflow-x': 'hidden',
                                    }}>
                                        {'Chương trình giảm giá: '}
                                        {
                                            this.state.discount.map((e, i) => {
                                                if (e['Loại'] != 'max') {
                                                    let subtract = -((this.state.tong*e['Mức Giảm'])/100);
                                                    let tiengiam = null;
                                                    let phuongthuc = '';
                                                    if (e['Phương Thức'] != null) {
                                                        phuongthuc = ' ' + e['Phương Thức'];
                                                    }
                                                    if (e.checked && e['Phương Thức'] != 'từng môn tiếp theo') {
                                                        tiengiam = <Tien 
                                                            value={subtract}
                                                            spacechar={'.'}
                                                            style={{
                                                                'padding': '0',
                                                            }}
                                                        />
                                                    }
                                                    return (
                                                        <div style={{
                                                            'padding': '0',
                                                        }}>
                                                            <input 
                                                                type="checkbox" 
                                                                value={e['Loại']} 
                                                                checked={e.checked} 
                                                                onChange={this.onDiscountChoose.bind(this, e['Loại'])}
                                                                style={{'width':'auto'}}
                                                                disabled={e.disabled || this.state.isDisable}
                                                            />
                                                            <span>{e['Loại'] + ' (-' + e['Mức Giảm'] + '%' + phuongthuc + ')'}</span>
                                                            {tiengiam}
                                                        </div>
                                                    )
                                                }
                                            })
                                        }
                                        <div style={{
                                            'border': '1px solid #ccc',
                                            'border-radius': '5px',
                                        }}>
                                            <input 
                                                type="checkbox" 
                                                style={{'width': 'auto'}} 
                                                checked={this.state.discountCustom} 
                                                onChange={() => {
                                                    this.setState({
                                                        discountCustom: !this.state.discountCustom,
                                                        discountIsChange: true,
                                                    });
                                                }}
                                                disabled={this.state.isDisable}
                                            />
                                            {'Tùy chọn:'}
                                            <input 
                                                type="number" 
                                                min="0" 
                                                placeholder="Tăng học phí" 
                                                onChange={this.tinhtongtien.bind(this)} 
                                                ref="tanghocphi"
                                                disabled={this.state.isDisable}
                                            />
                                            <input type="text" min="0" placeholder="Lý do tăng học phí" style={{
                                                'border': 'none',
                                                'background': 'none',
                                                'border-bottom': '1px dotted #000',
                                                'margin-top': '5px',
                                                'margin-bottom': '10px',
                                                'border-radius': '0',
                                            }} ref="lydotanghocphi" disabled={this.state.isDisable}/>
                                            <input 
                                                type="number" 
                                                min="0" 
                                                placeholder="Giảm học phí" 
                                                onChange={this.tinhtongtien.bind(this)} 
                                                ref="giamhocphi"
                                                disabled={this.state.isDisable}
                                            />
                                            <input type="text" min="0" placeholder="Lý do giảm học phí" style={{
                                                'border': 'none',
                                                'background': 'none',
                                                'border-bottom': '1px dotted #000',
                                                'margin-top': '5px',
                                                'margin-bottom': '10px',
                                                'border-radius': '0',
                                            }} ref="lydogiamhocphi" disabled={this.state.isDisable}/>
                                        </div>
                                    </div>
                                    <div style={{
                                        'border-top': '1px solid #888',
                                    }}>
                                        <Tien 
                                            label={'Tiền tăng giảm:'}
                                            fn={this.tinhtongtien.bind(this)}
                                            spacechar={'.'}
                                            style={{
                                                'padding': '0',
                                            }}
                                            canInput={true}
                                            getMe={me => this.tientanggiam = me}
                                            disabled={this.state.isDisable}
                                        />
                                        {tanggiambosung}
                                        {nocu}
                                        {dathanhtoan}
                                        <Tien 
                                            label={'Tổng tiền:'}
                                            value={this.state.tongphaithanhtoan}
                                            fn={this.onChangeTongPhaiThanhToan.bind(this)}
                                            spacechar={'.'}
                                            style={{
                                                'padding': '0',
                                            }}
                                            ref='tongtiensaugiam'
                                        />
                                    </div>
                                    <div style={{
                                        'border-top': '4px dotted #888',
                                        'background': '#70ff76',
                                    }}>
                                        <Tien
                                            label={'Số tiền đóng:'}
                                            spacechar={'.'}
                                            style={{
                                                'padding': '0',
                                            }}
                                            canInput={true}
                                            fn={this.onChangeNhapTienVao.bind(this)}
                                            getMe={me => this.sotiendadong = me}
                                            disabled={disabledWithoutPrint}
                                        />
                                        <Tien
                                            label={'Số tiền còn nợ:'}
                                            spacechar={'.'}
                                            style={{
                                                'padding': '0',
                                            }}
                                            getMe={me => this.sotienconno = me}
                                            ref='tienconno'
                                        />
                                        <div style={{'padding': '0'}}>
                                            <label for="" >Ghi Chú: </label>
                                            <textarea 
                                                ref="noidungghichu" 
                                                rows="4" 
                                                cols="50" 
                                                maxlength="5000" 
                                                style={{'height' : '75px'}}
                                                disabled={disabledWithoutPrint}
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="footer">
                            {listBtn}
                        </div>
                    </div>
                </div>
                <div style={{
                    'visibility': 'hidden',
                    'position': 'fixed',
                    width: '210mm',
                }}>
                    <div id="form_hoadon_phieuthu_phieuthuhocphi_printform" className={'phieuthu'}>
                        <div className={'background'}>
                            <div className={'row1'}>
                                <div>
                                    <img src="img/logofull.png" alt="logofull" width="90%" className={'logo'}/>
                                </div>
                                <div>
                                    <h3 className={'title'}>
                                        {'HỆ THỐNG GIÁO DỤC HOUSTON123'}
                                    </h3>
                                    <div className={'diachi'}>
                                        <span>
                                            {'CN1: Thái Hòa: Đường Liên Huyện, KP.Tân Mỹ, Thái Hòa, BD'}
                                        </span>
                                        <span>
                                            {'>>Hotline: 0917.119.434-0917.119.484'}
                                        </span>
                                        <span>
                                            {'CN2: Tân Vĩnh Hiệp: 73 Tân Hóa, Tân Vĩnh Hiệp, Tân Uyên, BD'}
                                        </span>
                                        <span>
                                            {'>>Hotline: 0962.611.141-0916.142.139'}
                                        </span>
                                        <span>
                                            {'CN3: Dĩ An: Đường Số 4, Trung tâm Hành chính Dĩ An, Tx Dĩ An, BD'}
                                        </span>
                                        <span>
                                            {'>>Hotline: 012.2828.0303-012.2828.3030'}
                                        </span>
                                        <span>
                                            {'CN4: An Phú: 47F, Đường 22/12, An Phú, Thuận An, BD'}
                                        </span>
                                        <span>
                                            {'>>Hotline: 0919.131.038-0931.777.596'}
                                        </span>
                                        <span>
                                            {'CN5: Tân Phước Khánh: KP.Bình Hòa, Tân Phước Khánh, Tân Uyên, BD'}
                                        </span>
                                        <span>
                                            {'>>Hotline: 0917.566.161'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className={'row2'}>
                                <div className={'kyhanhocphi'}>
                                    <b>Kỳ hạn đóng học phí:</b><br/>
                                    <b>Ngày: {this.state.ngaydonghangthang}</b>
                                </div>
                                <div>
                                    <h1 className={'title1'}>
                                        PHIẾU THU
                                    </h1><br/>
                                    Ngày {("0" + date.getDate()).slice(-2)} tháng {("0" + (date.getMonth() + 1)).slice(-2)} năm {date.getFullYear()}
                                </div>
                                <div className={'maphieu'}>
                                    Mã Phiếu: {this.state.maphieuthu}<br/>
                                    {maphieuno}
                                    Mã KT: {this.state.makiemtra}
                                </div>
                            </div>
                            <div className={'row3'}>
                                Họ và tên: {this.props.data['Họ Và Tên']} - Lớp: {this.props.data['Lớp']} - Mã học viên: {this.props.data['User ID']}<br/>
                                Số điện thoại: {sdt + sdt1 + sdt2}<br/>
                                Địa chỉ: {this.props.data['Địa Chỉ']}<br/>
                                Lý do nộp: {this.state.lydodongtien}<br/>
                                Giảm giá phí: {this.state.giamhocphi}<br/>
                                Tăng giá phí: {this.state.tanghocphi}<br/>
                                Tổng tiền: {this.state.tongtien}<br/>
                                Tổng sau khi giảm giá: {this.state.tongtiensaukhigiam}<br/>
                                Số tiền đã đóng: {this.state.sotienbangso} ({this.state.sotienbangchu})<br/>
                                Còn nợ: {this.state.conno}<br/>
                                Ghi chú: {this.state.ghichu}<br/>
                                <b>Chu kỳ học tương ứng với học phí: Từ ngày {this.state.dongtientungay} đến ngày {this.state.dongtiendenngay}</b>
                            </div>
                            <div className={'row4'}>
                                Ngày {("0" + date.getDate()).slice(-2)} tháng {("0" + (date.getMonth() + 1)).slice(-2)} năm {date.getFullYear()}
                            </div>
                            <div className={'row5'}>
                                <div>
                                    <b>Giám đốc</b><br/>
                                    (Ký, họ tên, đóng dấu)
                                </div>
                                <div>
                                    <b>Kế toán trưởng</b><br/>
                                    (Ký, họ tên)
                                </div>
                                <div>
                                    <b>Người nộp tiền</b><br/>
                                    (Ký, họ tên)
                                </div>
                                <div>
                                    <b>Người lập phiếu</b><br/>
                                    (Ký, họ tên)
                                </div>
                                <div>
                                    <b>Thủ quỹ</b><br/>
                                    (Ký, họ tên)
                                </div>
                            </div>
                        </div>                    
                    </div>                                            
                </div>
            </div>
        ); 
    }
}

module.exports = connect(function (state) {
    return {
      socket: state.socket,
    };
}) (DangKyMonHoc);
