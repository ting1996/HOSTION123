import React from 'react';
import { connect } from 'react-redux';
import style from '../../style.css';
import Tien from '../../Tien';
import printJS from 'print-js';
var ReactDOM = require('react-dom');

import Button from '../../elements/Button';

class PhieuThu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            danhsachchuongtrinhkhac: [],
            changeChuongTrinh: false,

            tong: null,
            tongphaithanhtoan: null,
            discountCustom: false,

            nocu: 0,
            nocumoi: 0,
            dathanhtoan: 0,

            isPrint: false,
            lydodongtien: '',
            giamhocphi: '',
            tanghocphi: '',
            sotienbangso: '',
            sotienbangchu: '',
            maphieuthu: '',
            makiemtra: '',
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
        this.tinhtongtien = this.tinhtongtien.bind(this);
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
                    case 'form_hoadon_phieuthukhac_loadchuongtrinhkhac':
                        let oldData = [];
                        switch (this.props.action) {
                            case 'print':
                                let phieuthucu = this.props.phieuthucu['Nội Dung'].substr(3, this.props.phieuthucu['Nội Dung'].length);
                                phieuthucu = phieuthucu.split(',');
                                for (let _ptc of phieuthucu) {
                                    if (_ptc != null && _ptc != '') {
                                        oldData.push(_ptc.split(':'));
                                    }
                                }
                                break;
                            default:                                
                        }

                        let printData = [];
                        for (let row of rows) {
                            for (let data of oldData) {
                                if (row.id == data[0]) {
                                    row.checked = true;
                                    row.quantity = data[2];
                                    row.price = data[1];
                                    printData.push(row);
                                    break;
                                }
                            }
                            if (row.price == '0') {
                                row.isEdit = true;
                            } else {
                                row.isEdit = false;
                            }
                        }

                        if (printData.length > 0) {
                            rows = printData;
                        }
                        this.setState({
                            danhsachchuongtrinhkhac: rows,
                        });
                        break;
                    case 'form_hoadon_phieuthukhac_xuathoadon':
                        if (dulieuguive.isPrint == true) {
                            query = 'SELECT * FROM quanlyhocsinh.BIENLAIHOCPHI WHERE `ID` = \'!\?!\'; ';
                            query = query.replace('!\?!', rows.insertId);
                            this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
                                fn: 'form_hoadon_phieuthukhac_inphieuthu',
                            });
                        } else {
                            this.close();
                        }
                        break;
                    case 'form_hoadon_phieuthukhac_inphieuthu':
                        let ngaydonghangthang = '';
                        let maphieuthu = rows[0]['Mã Phiếu'];
                        let makiemtra = '';
                        let dongtientungay = new Date(rows[0]['Đầu Chu Kỳ']).toLocaleDateString('en-GB');
                        let dongtiendenngay = new Date(rows[0]['Cuối Chu Kỳ']).toLocaleDateString('en-GB');

                        this.setState({
                            ngaydonghangthang: ngaydonghangthang,
                            maphieuthu: maphieuthu,
                            makiemtra: makiemtra,
                            dongtientungay: dongtientungay,
                            dongtiendenngay: dongtiendenngay,
                            isPrint: true,
                        });
                        this.close();
                        break;
                    default:                        
                }
            }
        }

        if (hanhdong == 'loi-cu-phap') {
            if (dulieuguive != null) {
                switch (dulieuguive.fn) {
                    case 'form_hoadon_phieuthukhac_loadchuongtrinhkhac':
                    case 'form_hoadon_phieuthukhac_xuathoadon':
                    case 'form_hoadon_phieuthukhac_inphieuthu':
                        this.setState({
                            btnDongYDisable: false,
                        })
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

        query = 'SELECT *, price AS price2 FROM CHUONGTRINHKHAC WHERE `location` = \'!\?!\' OR `location` = \'ALL\'; ';
        query = query.replace('!\?!', $('.khuvuc').attr('value'));
        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'form_hoadon_phieuthukhac_loadchuongtrinhkhac',
        });

        switch (this.props.action) {
            case 'print':
                if (this.props.phieuthucu != null) {
                    this.setState({
                        isDisable: true,
                        _isDisable: true,
                    })

                    this.tientanggiam.value(this.props.phieuthucu['Tiền Tăng Giảm']);

                    let date = new Date(this.props.phieuthucu['Ngày Lập Hóa Đơn']);
                    this.refs.ngaybatdauchuky.value = date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2);
                    this.refs.noidungghichu.value = this.props.phieuthucu['Ghi Chú'];
                } else {
                    this.close();
                }
                break;
            default:                                
        }
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.changeSize);
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentDidUpdate(prevProps, prevState) {
        this.changeSize();

        if (this.state.changeChuongTrinh == true) {
            this.setState({
                changeChuongTrinh: false,
            })
            this.tinhtongtien();
        }

        if (this.state.isPrint == true) {
            this.setState({
                isPrint: false,
            })  
            printJS({
                printable: 'form_hocsinh_ghidanh_phieuthu', 
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

    tinhtongtien () {
        let tong = 0;
        let tongphaithanhtoan = 0;
        this.state.danhsachchuongtrinhkhac.map((v, i) => { 
            if (v.checked == true) {
                tong += Number(this['chuongtrinh' + v['id']].value());
            }
        });
        tongphaithanhtoan = tong;

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

        tongphaithanhtoan = Number(tongphaithanhtoan) + Number(this.tientanggiam.value());

        this.setState({
            tong: tong,
            tongphaithanhtoan: tongphaithanhtoan,
        })
    }

    dongydongtien (isPrint) {
        let check = false;
        let ghichu = '';
        let noidung = '@@@';

        let lydodongtien = '';
        let giamhocphi = '';
        let tanghocphi = '';
        let sotienbangso = '';
        let sotienbangchu = '';

        this.state.danhsachchuongtrinhkhac.map((v, i) => { 
            if (v.checked == true) {
                let quantity = 1;
                if (v.quantity != null && v.quantity != 0) {
                    quantity = Number(v.quantity);
                }
                noidung += v['id'] + ':' + Number(this['chuongtrinh' + v['id']].value()) + ':' + quantity + ',';
                lydodongtien += v['name'] + ' (Số Lượng: ' + quantity + '): ' + this['chuongtrinh' + v['id']].getMoneyValue() + ', '
                check = true;
            }
        });

        sotienbangso = this.sotiendadong.getMoneyValue();
        try {
            sotienbangchu = window.to_vietnamese(this.sotiendadong.value());
        } catch (e) {
        }
        let date = new Date();
        let mannhanvien = $('#lable_button_nexttoicon').attr('value');
        let ngaylaphoadon = date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2);
        let sothangdong = this.state.sothangdong;
        let tong = this.state.tong;
        let tongdagiam = this.state.tongphaithanhtoan;
        let dathanhtoan = this.sotiendadong.value();
        let conno = this.sotienconno.value();
        let coso = $('.khuvuc').attr('value');
        let ngaydauchuky = new Date();
        if (this.refs.ngaybatdauchuky.value != '') {
            ngaydauchuky = new Date(this.refs.ngaybatdauchuky.value);
        }
        let dongtientungay = ngaydauchuky.getFullYear() + '-' + ("0" + (ngaydauchuky.getMonth() + 1)).slice(-2) + '-' + ("0" + ngaydauchuky.getDate()).slice(-2);
        let dongtiendenngay = dongtientungay;
        
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

        let query = 'INSERT INTO `quanlyhocsinh`.`BIENLAIHOCPHI` (`Mã Nhân Viên`, `User ID`, `Mã Nhân Viên Đóng Phí`, `Ngày Lập Hóa Đơn`, `Nội Dung`, `Số Tháng Đóng`, `Tổng`, `Tổng Đã Giảm Giá`, `Đã Thanh Toán`, `Còn Nợ`, `Đầu Chu Kỳ`, `Cuối Chu Kỳ`, `Giảm Giá Khác`, `Ghi Chú`, `Tiền Tăng Giảm`, `isOwe`, `Cơ Sở`) VALUES (\'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'1\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'0\', \'!\?!\'); ';
        query = query.replace('!\?!', mannhanvien);
        switch (this.props.type) {
            case 'student':
                query = query.replace('!\?!', this.props.data['User ID']);
                query = query.replace('!\?!', 'null');
                break;
            case 'employee':
                query = query.replace('!\?!', 'null');
                query = query.replace('!\?!', this.props.data['Mã Quản Lý']);
                break;
            default:                
        }
        query = query.replace('!\?!', ngaylaphoadon);
        query = query.replace('!\?!', noidung);
        query = query.replace('!\?!', tong);
        query = query.replace('!\?!', tongdagiam);
        query = query.replace('!\?!', dathanhtoan);
        query = query.replace('!\?!', conno);
        query = query.replace('!\?!', dongtientungay);
        query = query.replace('!\?!', dongtiendenngay);
        query = query.replace('!\?!', giamgiakhac);
        query = query.replace('!\?!', ghichu);            
        query = query.replace('!\?!', Number(this.tientanggiam.value()));
        query = query.replace('!\?!', coso);
        query = query.replace(/''/g, 'null');
        query = query.replace(/'null'/g, 'null');
        
        if (check == true) {
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
                if (this.state.dathanhtoan != 0) {
                    if (this.refs.dathanhtoan.value() > 0) {
                        _dathanhtoan = ' + ' + this.refs.dathanhtoan.getMoneyValue();
                    } else {
                        _dathanhtoan = ' ' + this.refs.dathanhtoan.getMoneyValue();
                    }
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
                    // isPrint: true,
                });
            }

            if (this.props.action == 'print') {
                let ngaydonghangthang = '';
                let maphieuthu = this.props.phieuthucu['Mã Phiếu'];
                let makiemtra = '';

                this.setState({
                    ngaydonghangthang: ngaydonghangthang,
                    maphieuthu: maphieuthu,
                    makiemtra: makiemtra,
                    isPrint: true,
                });
            } else {
                this.setState({
                    btnDongYDisable: true,
                })

                this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
                    fn: 'form_hoadon_phieuthukhac_xuathoadon',
                    isReload: true,
                    reloadPageName: 'hoadon',
                    isSuccess: true,
                    isPrint: isPrint,
                });
            }
        } else {
            this.props.dispatch({
                type: 'ALERT_NOTIFICATION_ADD',
                content: 'Vui lòng chọn chương trình để xuất phiếu thu!',
                notifyType: 'warning',
            })
        }   
    }

    onChangeNhapTienVao () {
        this.sotienconno.value(Number(this.state.tongphaithanhtoan) - Number(this.sotiendadong.value()));
    }

    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    }

    render () {
        let title = 'Phiếu Thu Chương Trình';
        let listBtn = 
        <div>
            <Button 
                onClick={this.close.bind(this)}
                value="Thoát"
                icon="close"
                style={{'float': 'right', 'margin-right': '10px',}}
            />
            <Button 
                onClick={this.dongydongtien.bind(this, false)}
                value="Đồng Ý"
                icon="agree"
                style={{'float': 'right', 'margin-right': '10px',}}
                disabled={this.state.btnDongYDisable}
            />
            <Button 
                onClick={this.dongydongtien.bind(this, true)}
                value="Đồng Ý Và In Hóa Đơn"
                icon="print"
                style={{'float': 'right', 'margin-right': '10px',}}
                disabled={this.state.btnDongYDisable}
            />
        </div>
        let date = new Date();
        switch (this.props.action) {
            case 'print':
                title = 'Thông Tin Phiếu ' + this.props.phieuthucu['Mã Phiếu'];
                date = new Date(this.props.phieuthucu['Ngày Lập Hóa Đơn']);
                listBtn = 
                <div>
                    <Button 
                        onClick={this.close.bind(this)}
                        value="Thoát"
                        icon="close"
                        style={{'float': 'right', 'margin-right': '10px',}}
                    />
                    <Button 
                        onClick={this.dongydongtien.bind(this, true)}
                        value="In"
                        icon="print"
                        style={{'float': 'right', 'margin-right': '10px',}}
                    />
                </div>
                break;
            default:
                break;
        }

        let payer = '';
        let nguoinop = '';
        switch (this.props.type) {
            case 'student':
                payer = this.props.data['Họ Và Tên'] + ' - Lớp ' + this.props.data['Lớp'];
                nguoinop = 
                <div>
                    Họ và tên: {this.props.data['Họ Và Tên']} - Lớp: {this.props.data['Lớp']} - Mã học viên: {this.props.data['User ID']}<br/>
                </div>
                break;
            case 'employee':
                payer = this.props.data['Mã Quản Lý'] + ' - ' + this.props.data['Họ Và Tên'];
                nguoinop = 
                <div>
                    Họ và tên: {this.props.data['Họ Và Tên']} - Mã nhân viên: {this.props.data['Mã Quản Lý']}<br/>
                </div>
                break;
            default:                
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
                                {payer}
                            </h2>
                            <div  
                                style={{
                                    'text-align': 'center',
                                    'display': 'grid',
                                    'grid-template-columns': '50% 50%',
                                }}
                            >
                                <div className="divformstyle" style={{'border-right': '1px solid #888'}}>
                                    <div style={{'border-bottom': '1px solid #888', 'border-top': '1px solid #888'}}>
                                        Ngày thanh toán:
                                        <input type="date" ref="ngaybatdauchuky" disabled={this.state.isDisable}/>
                                    </div>
                                    <div style={{
                                        'padding': '0',
                                        'height': '600px',
                                        'overflow-y': 'auto',
                                        'overflow-x': 'hidden',
                                    }}>
                                        {
                                            this.state.danhsachchuongtrinhkhac.map((v, i) => {
                                                let checked = false;
                                                if (v.checked == true) {
                                                    checked = true;
                                                }

                                                if (v.quantity == null) {
                                                    v.quantity = 1;
                                                }

                                                return (
                                                    <div>
                                                        <input 
                                                            type="checkbox" 
                                                            style={{'width': 'auto'}} 
                                                            checked={checked} 
                                                            onChange={() => {
                                                                let danhsachchuongtrinhkhac = this.state.danhsachchuongtrinhkhac;
                                                                this.state.danhsachchuongtrinhkhac.map((v1, i1) => {
                                                                    if (v1['id'] == v['id']) {
                                                                        if (v1.checked == true) {
                                                                            v1.checked = false;
                                                                        } else {
                                                                            v1.checked = true;
                                                                        }
                                                                    }
                                                                })
                                                                this.setState({
                                                                    danhsachchuongtrinhkhac: danhsachchuongtrinhkhac,
                                                                    changeChuongTrinh: true,
                                                                });
                                                            }}
                                                            disabled={this.state.isDisable}
                                                        />
                                                        {v['name']}
                                                        <Tien 
                                                            label={''}
                                                            value={v.price}
                                                            canInput={v.isEdit}
                                                            spacechar={'.'}
                                                            getMe={me => this['chuongtrinh' + v['id']] = me}
                                                            fn={this.tinhtongtien.bind(this)}
                                                            style={{
                                                                'padding': '0',
                                                                'background': 'white',
                                                            }}
                                                            disabled={this.state.isDisable}
                                                        />
                                                        <input
                                                            type='number'
                                                            value={v.quantity}
                                                            style={{
                                                                'border': 'none',
                                                                'border-bottom': '1px dashed #888',
                                                                'border-radius': 'unset',
                                                                'background': 'transparent',
                                                                'padding': '5px 0px',
                                                            }}
                                                            onChange={(element) => {
                                                                let that = this;
                                                                let danhsachchuongtrinhkhac = this.state.danhsachchuongtrinhkhac;
                                                                this.state.danhsachchuongtrinhkhac.map((v1, i1) => {
                                                                    if (v1['id'] == v['id']) {
                                                                        let quantity = element.target.value;
                                                                        if (quantity < 1) {
                                                                            quantity = 1;
                                                                        }
                                                                        try {
                                                                            let _price = v1.price2.toString().split(',');
                                                                            if (_price.length > 1) {
                                                                                let temp = [];
                                                                                for (let _p of _price) {
                                                                                    let t = _p.split(':');
                                                                                    t[0] = t[0] * quantity;
                                                                                    t = t.join(':');
                                                                                    temp.push(t);
                                                                                }
                                                                                _price = temp.join(',');
                                                                            } else {
                                                                                _price = _price * quantity;
                                                                            }
                                                                            v1.price = _price;
                                                                        } catch (e) {
                                                                            v1.price = 0;
                                                                        }
                                                                        v1.quantity = quantity;
                                                                    }
                                                                })
                                                                this.setState({
                                                                    danhsachchuongtrinhkhac: danhsachchuongtrinhkhac,
                                                                    changeChuongTrinh: true,
                                                                });
                                                            }}
                                                            disabled={this.state.isDisable}
                                                        />
                                                    </div>
                                                );
                                            })
                                        }
                                    </div>
                                </div>
                                <div className="divformstyle">
                                    <div style={{
                                        'border-bottom': '1px solid #888',
                                        'border-top': '1px solid #888',
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
                                    </div>
                                    <div style={{
                                        'height': '345px',
                                        'overflow-y': 'auto',
                                        'overflow-x': 'hidden',
                                    }}>
                                        {'Chương trình giảm giá: '}                                
                                        <div style={{
                                            'border': '1px solid #ccc',
                                            'border-radius': '5px',
                                        }}>
                                            <input 
                                                type="checkbox" 
                                                style={{'width': 'auto'}} 
                                                checked={this.state.discountCustom} 
                                                onChange={() => {
                                                    this.setState({discountCustom: !this.state.discountCustom});
                                                }}
                                                disabled={this.state.isDisable}
                                            />
                                            {'Tùy chọn:'}
                                            <input 
                                                type="number" 
                                                min="0" 
                                                placeholder="Tăng giá" 
                                                onChange={this.tinhtongtien.bind(this)} 
                                                ref="tanghocphi"
                                                disabled={this.state.isDisable}
                                            />
                                            <input type="text" min="0" placeholder="Lý do tăng giá" style={{
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
                                                placeholder="Giảm giá" 
                                                onChange={this.tinhtongtien.bind(this)} 
                                                ref="giamhocphi"
                                                disabled={this.state.isDisable}
                                            />
                                            <input type="text" min="0" placeholder="Lý do giảm giá" style={{
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
                                        <Tien 
                                            label={'Tổng tiền:'}
                                            value={this.state.tongphaithanhtoan}
                                            fn={() => {
                                                if (this.props.action == 'print') {
                                                    this.sotiendadong.value(this.props.phieuthucu['Đã Thanh Toán']);
                                                    this.sotienconno.value(Number(this.state.tongphaithanhtoan) - Number(this.sotiendadong.value()));
                                                } else {
                                                    this.sotiendadong.value(this.state.tongphaithanhtoan);
                                                }
                                            }}
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
                                            disabled={this.state.isDisable}
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
                                                disabled={this.state.isDisable}
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
                    <div id="form_hocsinh_ghidanh_phieuthu" className={'phieuthu'}>
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
                                            {'>>Hotline: 0917.119.434 - 0917.119.484'}
                                        </span>
                                        <span>
                                            {'CN2: Tân Vĩnh Hiệp: 73 Tân Hóa, Tân Vĩnh Hiệp, Tân Uyên, BD'}
                                        </span>
                                        <span>
                                            {'>>Hotline: 0962.611.141 - 0916.142.139'}
                                        </span>
                                        <span>
                                            {'CN3: Dĩ An: Đường Số 4, Trung tâm Hành chính Dĩ An, Tx Dĩ An, BD'}
                                        </span>
                                        <span>
                                            {'>>Hotline: 012.2828.0303 - 012.2828.3030'}
                                        </span>
                                        <span>
                                            {'CN4: An Phú: 47F, Đường 22/12, An Phú, Thuận An, BD'}
                                        </span>
                                        <span>
                                            {'>>Hotline: 0919.131.038 - 0931.777.596'}
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
                                <div>
                                </div>
                                <div>
                                    <h1 className={'title1'}>
                                        PHIẾU THU
                                    </h1><br/>
                                    Ngày {("0" + date.getDate()).slice(-2)} tháng {("0" + (date.getMonth() + 1)).slice(-2)} năm {date.getFullYear()}
                                </div>
                                <div className={'maphieu'}>
                                    Mã Phiếu: {this.state.maphieuthu}<br/>
                                    Mã KT: {this.state.makiemtra}
                                </div>
                            </div>
                            <div className={'row3'}>
                                {nguoinop}
                                Số điện thoại: {sdt + sdt1 + sdt2}<br/>
                                Địa chỉ: {this.props.data['Địa Chỉ']}<br/>
                                Lý do nộp: {this.state.lydodongtien}<br/>
                                Giảm giá phí: {this.state.giamhocphi}<br/>
                                Tăng giá phí: {this.state.tanghocphi}<br/>
                                Tổng tiền: {this.state.tongtien}<br/>
                                Tổng sau khi giảm giá: {this.state.tongtiensaukhigiam}<br/>
                                Số tiền đã đóng: {this.state.sotienbangso} ({this.state.sotienbangchu})<br/>
                                Còn nợ: {this.state.conno}<br/>
                                Ghi chú: {this.state.ghichu}
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
}) (PhieuThu);
