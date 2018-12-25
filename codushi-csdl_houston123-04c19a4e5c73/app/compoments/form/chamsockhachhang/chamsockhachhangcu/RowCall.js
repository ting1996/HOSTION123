import React from 'react';
import { connect } from 'react-redux';
import style from '../../style.css';
var ReactDOM = require('react-dom');
import SoDienThoai from '../../elements/SoDienThoai';
import Select from 'react-select';

class RowCall extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tinhtrangcuocgoi: null,
            chuongtrinhcuocgoi: null,
            loaithaido: null,
            phhailongvechatluong: null,
            lydophnghi: null,
            phcothequaylai: null,
            soluongkehoachtrongngay: null,

            now: 0,
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
                    case 'goidiendata_rowcall_loadtongngaykehoach':
                        this.setState({soluongkehoachtrongngay: rows[0]['count']});
                        break;
                    default:                        
                }
            }
        }  
    }

    componentDidMount () {
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
        this.props.getMe(this);
        this.loadData();
        this.loadData_Old();
    }

    componentWillUnmount() {
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.data != this.props.data) {
            this.loadData();
        }

        if (prevProps.data_old != this.props.data_old) {
            this.loadData_Old();
        }
    }

    loadData () {
        if (this.props.data != null) {
            let rows = this.props.data;
            this.refs.hovaten.value = rows['Họ Và Tên'];
            this.refs.truong.value = rows['Tên Trường'];
            this.refs.lop.value = rows['Lớp'];
            if (rows['Số Điện Thoại'] != null) {
                this.sodienthoai.setState({value: rows['Số Điện Thoại']});
            } else {
                this.sodienthoai.setState({value: ''});
            }
            this.refs.hovatennt1.value = rows['Họ Và Tên (NT1)'];
            if (rows['Số Điện Thoại (NT1)'] != null) {
                this.sodienthoaint1.setState({value: rows['Số Điện Thoại (NT1)']});
            } else {
                this.sodienthoaint1.setState({value: ''});
            }
            this.refs.nghenghiepnt1.value = rows['Nghề Nghiệp (NT1)'];
            this.refs.hovatennt2.value = rows['Họ Và Tên (NT2)'];
            if (rows['Số Điện Thoại (NT2)'] != null) {
                this.sodienthoaint2.setState({value: rows['Số Điện Thoại (NT2)']});
            } else {
                this.sodienthoaint2.setState({value: ''});
            }
            this.refs.nghenghiepnt2.value = rows['Nghề Nghiệp (NT2)'];


            this.setState({
                tinhtrangcuocgoi: null,
                chuongtrinhcuocgoi: null,
                loaithaido: null,
                phhailongvechatluong: null,
                lydophnghi: null,
                phcothequaylai: null,
                soluongkehoachtrongngay: null,
            })
            this.refs.ngaykehoach.value = '';
            this.refs.kehoach.value = '';
            this.refs.thoigianphnoiquaylai.value = '';
            this.refs.noidungcuocgoi.value = '';
        }
    }

    loadData_Old () {
        if (this.props.data_old != null && this.props.data_old.length > 0) {
            let __now = this.props.data_old.length - 1;
            let data = this.props.data_old[__now];
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
            this.refs.old_chuongtrinhgoi.value = data['Chương Trình Gọi'];
            this.refs.old_loaithaido.value = data['Loại Thái Độ'];
            this.refs.old_phhailongvechatluong.value = data['PH Hài Lòng Về Chất Lượng H123'];
            this.refs.old_lydophnghi.value = data['Lý Do Nghỉ'];
            this.refs.old_phcothequaylai.value = data['PH Có Thể Quay Lại Học'];
            this.refs.old_thoigianphnoiquaylai.value = data['Thời Gian PH Nói Quay Lại'];

            let shownext = 'none';
            let showback = 'block';
            if (__now == 0) {
                showback = 'none';
            }

            this.setState({
                now: __now,
                shownext: shownext,
                showback: showback,
            })
        }
    }

    onChangeTinhTrangCuocGoi (e) {
        this.setState({tinhtrangcuocgoi: e});
    }

    onChangeChuongTrinhCuocGoi (e) {
        this.setState({chuongtrinhcuocgoi: e});
    }

    onChangeLoaiThaiDo (e) {
        this.setState({loaithaido: e});
    }

    onChangePHHaiLongVeChatLuong (e) {
        this.setState({phhailongvechatluong: e});
    }

    onChangeLyDoPhuHuynhNghi (e) {
        this.setState({lydophnghi: e});
    }

    onChangePHCoTheQuayLaiHoc (e) {
        this.setState({phcothequaylai: e});
    }

    onChangeNgayKeHoach () {
        let ngaykehoach = this.refs.ngaykehoach.value;
        if (ngaykehoach != null && ngaykehoach != '') {
            let query = 'SELECT COUNT(`ID`) AS count FROM quanlyhocsinh.CALLCHAMSOCKHACHHANGCU_VIEW WHERE `Ngày Kế Hoạch` = \'!\?!\' AND `Cơ Sở` = \'!\?!\'';
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
        let check = false;
        this.refs.tinhtrangcuocgoi.wrapper.getElementsByClassName('Select-control')[0].style.borderColor = 'rgb(204, 204, 204)';
        this.refs.chuongtrinhcuocgoi.wrapper.getElementsByClassName('Select-control')[0].style.borderColor = 'rgb(204, 204, 204)';
        this.refs.loaithaido.wrapper.getElementsByClassName('Select-control')[0].style.borderColor = 'rgb(204, 204, 204)';
        this.refs.phhailongvechatluong.wrapper.getElementsByClassName('Select-control')[0].style.borderColor = 'rgb(204, 204, 204)';
        this.refs.phcothequaylai.wrapper.getElementsByClassName('Select-control')[0].style.borderColor = 'rgb(204, 204, 204)';
        this.refs.lydophnghi.wrapper.getElementsByClassName('Select-control')[0].style.borderColor = 'rgb(204, 204, 204)';
        this.refs.thoigianphnoiquaylai.style.borderColor = 'rgb(204, 204, 204)';
        this.refs.noidungcuocgoi.style.borderColor = 'rgb(204, 204, 204)';
        this.refs.ngaykehoach.style.borderColor = 'rgb(204, 204, 204)';
        this.refs.kehoach.style.borderColor = 'rgb(204, 204, 204)';
        this.refs.hovaten.style.borderColor = 'rgb(204, 204, 204)';
        this.sodienthoai.refs.input.style.borderColor = 'rgb(204, 204, 204)';
        this.sodienthoaint1.refs.input.style.borderColor = 'rgb(204, 204, 204)';
        this.sodienthoaint2.refs.input.style.borderColor = 'rgb(204, 204, 204)';

        if (this.state.tinhtrangcuocgoi == null) {
            this.refs.tinhtrangcuocgoi.wrapper.getElementsByClassName('Select-control')[0].style.borderColor = 'red';
            check = true;
        } else if (this.state.tinhtrangcuocgoi.value == 'Cuộc gọi thành công') {
            if (this.state.loaithaido == null) {
                this.refs.loaithaido.wrapper.getElementsByClassName('Select-control')[0].style.borderColor = 'red';
                check = true;
            } else if (this.state.loaithaido.value != 'Phụ Huynh Từ Chối H123') {
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

            if (this.state.phhailongvechatluong == null) {
                this.refs.phhailongvechatluong.wrapper.getElementsByClassName('Select-control')[0].style.borderColor = 'red';
                check = true;
            }

            if (this.state.phcothequaylai == null) {
                this.refs.phcothequaylai.wrapper.getElementsByClassName('Select-control')[0].style.borderColor = 'red';
                check = true;
            } else if (this.state.phcothequaylai.value == 'PH nói sẽ quay lại' && (this.refs.thoigianphnoiquaylai.value == null || this.refs.thoigianphnoiquaylai.value == '')) {
                this.refs.thoigianphnoiquaylai.style.borderColor = 'red';
                check = true;
            }

            if (this.state.lydophnghi == null) {
                this.refs.lydophnghi.wrapper.getElementsByClassName('Select-control')[0].style.borderColor = 'red';
                check = true;
            }
        }

        if (this.state.chuongtrinhcuocgoi == null) {
            this.refs.chuongtrinhcuocgoi.wrapper.getElementsByClassName('Select-control')[0].style.borderColor = 'red';
            check = true;
        }

        if (this.refs.hovaten.value == '') {
            this.refs.hovaten.style.borderColor = 'red';
            check = true;
        }

        if ((this.sodienthoai.state.value == '' || this.sodienthoai.state.value == null)
        && (this.sodienthoaint1.state.value == '' || this.sodienthoaint1.state.value == null)
        && (this.sodienthoaint2.state.value == '' || this.sodienthoaint2.state.value == null)
        ) {
            this.sodienthoai.refs.input.style.borderColor = 'red';
            this.sodienthoaint1.refs.input.style.borderColor = 'red';
            this.sodienthoaint2.refs.input.style.borderColor = 'red';
            check = true;
        }

        if (check) {
            try {
                fn2();
            } catch (e) {
                
            }
            return;
        }

        let id = this.props.data['User ID'];
        let manhanvien = $('#lable_button_nexttoicon').attr('value');            
        let ngaykehoach = this.refs.ngaykehoach.value;
        let kehoach = this.refs.kehoach.value;
        let date = new Date().toLocaleDateString('en-GB').split('/');
        let time = new Date().toLocaleTimeString('en-GB').split('/');
        let ngaygoi = date[2] + '-' + date[1] + '-' + date[0] + ' ' + time;
        let tinhtrangcuocgoi = this.state.tinhtrangcuocgoi.value;
        let chuongtrinhcuocgoi = this.state.chuongtrinhcuocgoi.value;
        let loaithaido = null;
        if (this.state.loaithaido != null) {
            loaithaido = this.state.loaithaido.value;
        }
        let phhailongvechatluong = null;
        if (this.state.phhailongvechatluong != null) {
            phhailongvechatluong = this.state.phhailongvechatluong.value;
        }
        let lydophnghi = null;
        if (this.state.lydophnghi != null) {
            lydophnghi = this.state.lydophnghi.value;
        }
        let phcothequaylai = null;
        if (this.state.phcothequaylai != null) {
            phcothequaylai = this.state.phcothequaylai.value;
        }
        let thoigianphnoiquaylai = this.refs.thoigianphnoiquaylai.value;
        let noidungcuocgoi = this.refs.noidungcuocgoi.value;
        let hotline = this.props.sohotline;

        let query = '';
        query = 'INSERT INTO `quanlyhocsinh`.`CALLCHAMSOCKHACHHANGCU` (`User ID`, `Mã Nhân Viên`, `Ngày Kế Hoạch`, `Kế Hoạch`, `Ngày Gọi`, `Tình Trạng Cuộc Gọi`, `Chương Trình Gọi`, `Loại Thái Độ`, `PH Hài Lòng Về Chất Lượng H123`, `Lý Do Nghỉ`, `PH Có Thể Quay Lại Học`, `Thời Gian PH Nói Quay Lại`, `Nội Dung Cuộc Gọi`, `Hotline`) VALUES (\'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\'); ' +
        'UPDATE `quanlyhocsinh`.`USERS` SET `Họ Và Tên`=\'!\?!\', `Lớp`=\'!\?!\', `Số Điện Thoại`=\'!\?!\', `Họ Và Tên (NT1)`=\'!\?!\', `Số Điện Thoại (NT1)`=\'!\?!\', `Nghề Nghiệp (NT1)`=\'!\?!\', `Họ Và Tên (NT2)`=\'!\?!\', `Số Điện Thoại (NT2)`=\'!\?!\', `Nghề Nghiệp (NT2)`=\'!\?!\', `Tên Trường`=\'!\?!\' WHERE `User ID`=\'!\?!\';';

        query = query.replace('!\?!', id);
        query = query.replace('!\?!', manhanvien);
        if (ngaykehoach == '') {
            query = query.replace('!\?!', 'null');
        } else {
            query = query.replace('!\?!', ngaykehoach);
        }
        query = query.replace('!\?!', kehoach);
        query = query.replace('!\?!', ngaygoi);
        query = query.replace('!\?!', tinhtrangcuocgoi);
        query = query.replace('!\?!', chuongtrinhcuocgoi);
        query = query.replace('!\?!', loaithaido);
        query = query.replace('!\?!', phhailongvechatluong);
        query = query.replace('!\?!', lydophnghi);
        query = query.replace('!\?!', phcothequaylai);
        query = query.replace('!\?!', thoigianphnoiquaylai);
        query = query.replace('!\?!', noidungcuocgoi);
        query = query.replace('!\?!', hotline);
        query = query.replace(/\'null'/g, 'null');

        query = query.replace('!\?!', this.refs.hovaten.value);
        query = query.replace('!\?!', this.refs.lop.value);
        if (this.sodienthoai.state.value != null) {
            query = query.replace('!\?!', this.sodienthoai.state.value);
        } else {
            query = query.replace('!\?!', '');
        }
        query = query.replace('!\?!', this.refs.hovatennt1.value);
        if (this.sodienthoaint1.state.value != null) {
            query = query.replace('!\?!', this.sodienthoaint1.state.value);
        } else {
            query = query.replace('!\?!', '');
        }
        query = query.replace('!\?!', this.refs.nghenghiepnt1.value);
        query = query.replace('!\?!', this.refs.hovatennt2.value);
        if (this.sodienthoaint2.state.value != null) {
            query = query.replace('!\?!', this.sodienthoaint2.state.value);
        } else {
            query = query.replace('!\?!', '');
        }
        query = query.replace('!\?!', this.refs.nghenghiepnt2.value);
        query = query.replace('!\?!', this.refs.truong.value);
        query = query.replace('!\?!', id);

        query = query.replace(/\''/g, 'null');
        
        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            isReload: true,
            isSuccess: true,
        });

        fn();
    }

    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    }

    back () {
        if (this.props.data_old != null && this.props.data_old.length > 0) {
            let __now = this.state.now - 1;
            let data = this.props.data_old[__now];
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
            this.refs.old_chuongtrinhgoi.value = data['Chương Trình Gọi'];
            this.refs.old_loaithaido.value = data['Loại Thái Độ'];
            this.refs.old_phhailongvechatluong.value = data['PH Hài Lòng Về Chất Lượng H123'];
            this.refs.old_lydophnghi.value = data['Lý Do Nghỉ'];
            this.refs.old_phcothequaylai.value = data['PH Có Thể Quay Lại Học'];
            this.refs.old_thoigianphnoiquaylai.value = data['Thời Gian PH Nói Quay Lại'];

            let shownext = 'block';
            let showback = 'block';
            if (__now == 0) {
                showback = 'none';
            }

            this.setState({
                now: __now,
                shownext: shownext,
                showback: showback,
            })
        }
    }

    next () {
        if (this.props.data_old != null && this.props.data_old.length > 0) {
            let __now = this.state.now + 1;
            let data = this.props.data_old[__now];
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
            this.refs.old_chuongtrinhgoi.value = data['Chương Trình Gọi'];
            this.refs.old_loaithaido.value = data['Loại Thái Độ'];
            this.refs.old_phhailongvechatluong.value = data['PH Hài Lòng Về Chất Lượng H123'];
            this.refs.old_lydophnghi.value = data['Lý Do Nghỉ'];
            this.refs.old_phcothequaylai.value = data['PH Có Thể Quay Lại Học'];
            this.refs.old_thoigianphnoiquaylai.value = data['Thời Gian PH Nói Quay Lại'];

            let shownext = 'block';
            let showback = 'block';
            if (__now == (this.props.data_old.length - 1)) {
                shownext = 'none';
            }

            this.setState({
                now: __now,
                shownext: shownext,
                showback: showback,
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
        let columns_grid = '50% 50%';
        if (this.props.data_old != null && this.props.data_old.length > 0) {
            display_old = 'block';
            columns_grid = '33.33% 33.33% 33.33%';
        }

        return (
            <div style={{
                "display": "grid",
                "grid-template-columns": columns_grid,
            }}>
                <div style={{'display': display_old}}>
                    <div className='divformstyle'>
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
                            <div>
                                <label for="" >Họ Và Tên Nhân Viên: </label>
                                <input type="text" name="" ref='old_hovatennhanvien' disabled={true} className='read_only'/>
                            </div>
                            <div>
                                <label for="" >Ngày Gọi: </label>
                                <input type="text" name="" ref='old_ngaygoi' disabled={true} className='read_only'/>
                            </div>
                            <div>
                                <label for="" >Nội Dung Cuộc Gọi: </label>
                                <textarea 
                                    ref="old_noidungcuocgoi"
                                    rows="4"
                                    cols="50"
                                    maxLength="1000"
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
                            <div>
                                <label for="" >Tình Trạng Cuộc Gọi: </label>
                                <input type="text" name="" ref='old_trinhtrangcuocgoi' disabled={true} className='read_only'/>
                            </div>
                            <div>
                                <label for="" >Chương Trình Gọi: </label>
                                <input type="text" name="" ref='old_chuongtrinhgoi' disabled={true} className='read_only'/>
                            </div>
                            <div>
                                <label for="" >Loại Thái Độ: </label>
                                <input type="text" name="" ref='old_loaithaido' disabled={true} className='read_only'/>
                            </div>
                            <div>
                                <label for="" >PH Hài Lòng Về Chất Lượng H123: </label>
                                <input type="text" name="" ref='old_phhailongvechatluong' disabled={true} className='read_only'/>
                            </div>
                            <div>
                                <label for="" >Lý Do Phụ Huynh Nghỉ: </label>
                                <input type="text" name="" ref='old_lydophnghi' disabled={true} className='read_only'/>
                            </div>
                            <div>
                                <label for="" >PH Có Thể Quay Lại Học: </label>
                                <input type="text" name="" ref='old_phcothequaylai' disabled={true} className='read_only'/>
                            </div>
                            <div>
                                <label for="" >Thời Gian PH Nói Quay Lại: </label>
                                <input type="text" name="" ref='old_thoigianphnoiquaylai' disabled={true} className='read_only'/>
                            </div>
                        </fieldset>
                    </div>
                </div>
                <div>
                    <div className='divformstyle'>
                        <div>
                            <label for="" >Họ Và Tên: </label>
                            <input type="text" name="" ref='hovaten' disabled={true} className='read_only'/>
                        </div>
                        <div>
                            <label for="" >Trường: </label>
                            <input type="text" name="" ref='truong'/>
                        </div>
                        <div>
                            <label for="" >Lớp: </label>
                            <input type="text" name="" ref='lop'/>
                        </div>
                        <div>
                            <SoDienThoai getMe={me => this.sodienthoai = me} disabled={true}/>
                        </div>
                        <div>
                            <label for="" >Người Thân (Bố/Anh/Chú): </label>
                            <input type="text" name="" ref='hovatennt1'/>
                        </div>
                        <div>
                            <SoDienThoai getMe={me => this.sodienthoaint1 = me} disabled={true}/>
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
                            <SoDienThoai getMe={me => this.sodienthoaint2 = me} disabled={true}/>
                        </div>
                        <div>
                            <label for="" >Nghề Nghiệp: </label>
                            <input type="text" name="" ref='nghenghiepnt2'/>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="unsetdivformstyle">
                        <label for="Tình Trạng Cuộc Gọi">Tình Trạng Cuộc Gọi: </label>
                        <Select
                            name="Tình Trạng Cuộc Gọi"
                            placeholder="--- Tình Trạng Cuộc Gọi ---"
                            value={this.state.tinhtrangcuocgoi}
                            options={this.props.bangthongtin['Tình Trạng Cuộc Gọi']}
                            onChange={this.onChangeTinhTrangCuocGoi.bind(this)}
                            ref="tinhtrangcuocgoi"
                        />
                    </div>
                    <div className="unsetdivformstyle">
                        <label for="Chương Trình Cuộc Gọi">Chương Trình Cuộc Gọi: </label>
                        <Select
                            name="Chương Trình Cuộc Gọi"
                            placeholder="--- Chương Trình Cuộc Gọi ---"
                            value={this.state.chuongtrinhcuocgoi}
                            options={this.props.bangthongtin['Chương Trình Cuộc Gọi']}
                            onChange={this.onChangeChuongTrinhCuocGoi.bind(this)}
                            ref="chuongtrinhcuocgoi"
                        />
                    </div>
                    <div className="unsetdivformstyle">
                        <label for="Loại Thái Độ">Loại Thái Độ: </label>
                        <Select
                            name="Loại Thái Độ"
                            placeholder="--- Loại Thái Độ ---"
                            value={this.state.loaithaido}
                            options={this.props.bangthongtin['Loại Thái Độ']}
                            onChange={this.onChangeLoaiThaiDo.bind(this)}
                            ref="loaithaido"
                        />
                    </div>
                    <div className="unsetdivformstyle">
                        <label for="">PH Hài Lòng Về Chất Lượng H123: </label>
                        <Select
                            name="PH Hài Lòng Về Chất Lượng H123"
                            placeholder="--- PH Hài Lòng Về Chất Lượng H123 ---"
                            value={this.state.phhailongvechatluong}
                            options={this.props.bangthongtin['PH Hài Lòng Về Chất Lượng H123']}
                            onChange={this.onChangePHHaiLongVeChatLuong.bind(this)}
                            ref="phhailongvechatluong"
                        />
                    </div>
                    <div className="unsetdivformstyle">
                        <label for="">Lý Do Phụ Huynh Nghỉ: </label>
                        <Select
                            name="Lý Do Phụ Huynh Nghỉ"
                            placeholder="--- Lý Do Phụ Huynh Nghỉ ---"
                            value={this.state.lydophnghi}
                            options={this.props.bangthongtin['Lý Do Phụ Huynh Nghỉ']}
                            onChange={this.onChangeLyDoPhuHuynhNghi.bind(this)}
                            ref="lydophnghi"
                        />
                    </div>
                    <div className="unsetdivformstyle">
                        <label for="">PH Có Thể Quay Lại Học: </label>
                        <Select
                            name="PH Có Thể Quay Lại Học"
                            placeholder="--- PH Có Thể Quay Lại Học ---"
                            value={this.state.phcothequaylai}
                            options={this.props.bangthongtin['PH Có Thể Quay Lại Học']}
                            onChange={this.onChangePHCoTheQuayLaiHoc.bind(this)}
                            ref="phcothequaylai"
                        />
                    </div>
                    <div className='divformstyle'>
                        <div>
                            <label for="" >Thời Gian PH Nói Quay Lại: </label>
                            <input type="text" name="" ref='thoigianphnoiquaylai' maxlength="200"/>
                        </div>
                        <div>
                            <label for="" >Nội Dung Cuộc Gọi: </label>
                            <textarea 
                                ref="noidungcuocgoi" 
                                rows="4" 
                                cols="50" 
                                maxLength="5000" 
                                style={{'height' : '75px'}}
                            ></textarea>
                        </div>
                        <div>
                            <label for="" >Ngày Kế Hoạch: </label>
                            <input type="date" name="" ref='ngaykehoach' min={mindate} onChange={this.onChangeNgayKeHoach.bind(this)}/>
                            {soluongkehoachtrongngay}
                        </div>
                        <div>
                            <label for="" >Kế Hoạch: </label>
                            <textarea 
                                ref="kehoach" 
                                rows="4" 
                                cols="50" 
                                maxLength="1000" 
                                style={{'height' : '75px'}}
                            ></textarea>
                        </div>
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
  }) (RowCall);
