import React from 'react';
import { connect } from 'react-redux';
import style from '../../../style.css';
var ReactDOM = require('react-dom');
import SoDienThoai from '../../../elements/SoDienThoai';
import Select from 'react-select';

class GoiDienChamSocKhachHangCu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data_old: [],
            tinhtrangcuocgoi: null,
            chuongtrinhcuocgoi: null,
            loaithaido: null,
            phhailongvechatluong: null,
            lydophnghi: null,
            phcothequaylai: null,
            soluongkehoachtrongngay: null,

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
                    case 'imformation_cskh_goidienchamsockhachhangcu_loadinfor':
                        if (rows.length > 0) {
                            rows = rows[0];
                            this.refs.hovaten.value = rows['Họ Và Tên'];
                            this.refs.truong.value = rows['Tên Trường'];
                            this.refs.lop.value = rows['Lớp'];
                            this.refs.sodienthoai.value = rows['Số Điện Thoại'];
                            this.refs.diachi.value = rows['Địa Chỉ'];
                            this.refs.hovatennt1.value = rows['Họ Và Tên (NT1)'];
                            this.refs.sodienthoaint1.value = rows['Số Điện Thoại (NT1)'];
                            this.refs.nghenghiepnt1.value = rows['Nghề Nghiệp (NT1)'];
                            this.refs.hovatennt2.value = rows['Họ Và Tên (NT2)'];
                            this.refs.sodienthoaint2.value = rows['Số Điện Thoại (NT2)'];
                            this.refs.nghenghiepnt2.value = rows['Nghề Nghiệp (NT2)'];
                        } else {
                            this.close();
                        }
                        break;
                    case 'imformation_cskh_goidienchamsockhachhangcu_loadhistory':
                        this.setState({
                            data_old: rows,
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
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);

        query = 'SELECT CALLCHAMSOCKHACHHANGCU.*, QUANLY.`Họ Và Tên` AS `Họ Tên Nhân Viên` FROM quanlyhocsinh.CALLCHAMSOCKHACHHANGCU ' +
        'LEFT JOIN quanlyhocsinh.QUANLY ON QUANLY.`Mã Quản Lý` = CALLCHAMSOCKHACHHANGCU.`Mã Nhân Viên` ' +
        'WHERE `User ID` = \'!?!\';';
        query = query.replace('!\?!', this.props.id);
        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'imformation_cskh_goidienchamsockhachhangcu_loadhistory',
        });

        query = 'SELECT * FROM quanlyhocsinh.USERS WHERE `User ID` = \'!\?!\';';
        query = query.replace('!\?!', this.props.id);
        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'imformation_cskh_goidienchamsockhachhangcu_loadinfor',
        });
    }

    componentWillUnmount() {
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.data_old != this.state.data_old) {
            this.setState({
                now: this.state.data_old.length - 1,
                isLoad: true,
            })
        }

        if (this.state.isLoad == true) {
            this.loadData_Old();
            this.setState({isLoad: false});
        }
    }

    dongy () {
        let data = this.state.data_old[this.state.now];
        if (data != null) {
            let check = false;
            this.refs.tinhtrangcuocgoi.wrapper.getElementsByClassName('Select-control')[0].style.borderColor = 'rgb(204, 204, 204)';
            this.refs.chuongtrinhcuocgoi.wrapper.getElementsByClassName('Select-control')[0].style.borderColor = 'rgb(204, 204, 204)';
            this.refs.loaithaido.wrapper.getElementsByClassName('Select-control')[0].style.borderColor = 'rgb(204, 204, 204)';
            this.refs.phhailongvechatluong.wrapper.getElementsByClassName('Select-control')[0].style.borderColor = 'rgb(204, 204, 204)';
            this.refs.phcothequaylai.wrapper.getElementsByClassName('Select-control')[0].style.borderColor = 'rgb(204, 204, 204)';
            this.refs.lydophnghi.wrapper.getElementsByClassName('Select-control')[0].style.borderColor = 'rgb(204, 204, 204)';
            this.refs.old_thoigianphnoiquaylai.style.borderColor = 'rgb(204, 204, 204)';
            this.refs.old_noidungcuocgoi.style.borderColor = 'rgb(204, 204, 204)';
            this.refs.old_ngaykehoach.style.borderColor = 'rgb(204, 204, 204)';
            this.refs.old_kehoach.style.borderColor = 'rgb(204, 204, 204)';

            if (this.state.tinhtrangcuocgoi == null) {
                this.refs.tinhtrangcuocgoi.wrapper.getElementsByClassName('Select-control')[0].style.borderColor = 'red';
                check = true;
            } else if (this.state.tinhtrangcuocgoi.value == 'Cuộc gọi thành công') {
                if (this.state.loaithaido == null) {
                    this.refs.loaithaido.wrapper.getElementsByClassName('Select-control')[0].style.borderColor = 'red';
                    check = true;
                } else if (this.state.loaithaido.value != 'Phụ Huynh Từ Chối H123') {
                    if (this.refs.old_noidungcuocgoi == null || this.refs.old_noidungcuocgoi.value == '') {
                        this.refs.old_noidungcuocgoi.style.borderColor = 'red';
                        check = true;
                    }

                    if (this.refs.old_ngaykehoach == null || this.refs.old_ngaykehoach.value == '') {
                        this.refs.old_ngaykehoach.style.borderColor = 'red';
                        check = true;
                    }

                    if (this.refs.old_kehoach == null || this.refs.old_kehoach.value == '') {
                        this.refs.old_kehoach.style.borderColor = 'red';
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
                } else if (this.state.phcothequaylai.value == 'PH nói sẽ quay lại' && (this.refs.old_thoigianphnoiquaylai.value == null || this.refs.old_thoigianphnoiquaylai.value == '')) {
                    this.refs.old_thoigianphnoiquaylai.style.borderColor = 'red';
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

            if (check) {
                return;
            }

            let id = data['ID'];        
            let ngaykehoach = this.refs.old_ngaykehoach.value;
            let kehoach = this.refs.old_kehoach.value;
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
            let thoigianphnoiquaylai = this.refs.old_thoigianphnoiquaylai.value;
            let noidungcuocgoi = this.refs.old_noidungcuocgoi.value;

            let query = 'UPDATE `quanlyhocsinh`.`CALLCHAMSOCKHACHHANGCU` SET `Ngày Kế Hoạch`=\'!\?!\', `Kế Hoạch`=\'!\?!\', `Tình Trạng Cuộc Gọi`=\'!\?!\', `Chương Trình Gọi`=\'!\?!\', `Loại Thái Độ`=\'!\?!\', `PH Hài Lòng Về Chất Lượng H123`=\'!\?!\', `Lý Do Nghỉ`=\'!\?!\', `PH Có Thể Quay Lại Học`=\'!\?!\', `Thời Gian PH Nói Quay Lại`=\'!\?!\', `Nội Dung Cuộc Gọi`=\'!\?!\' WHERE `ID`=\'!\?!\';';

            if (ngaykehoach == '') {
                query = query.replace('!\?!', 'null');
            } else {
                query = query.replace('!\?!', ngaykehoach);
            }
            query = query.replace('!\?!', kehoach);
            query = query.replace('!\?!', tinhtrangcuocgoi);
            query = query.replace('!\?!', chuongtrinhcuocgoi);
            query = query.replace('!\?!', loaithaido);
            query = query.replace('!\?!', phhailongvechatluong);
            query = query.replace('!\?!', lydophnghi);
            query = query.replace('!\?!', phcothequaylai);
            query = query.replace('!\?!', thoigianphnoiquaylai);
            query = query.replace('!\?!', noidungcuocgoi);
            query = query.replace('!\?!', id);
            query = query.replace(/\'null'/g, 'null');
            query = query.replace(/\''/g, 'null');
            
            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                isReload: true,
                isSuccess: true,
            });
        } else {
            this.close();
        }
    }

    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    }

    loadData_Old () {
        if (this.state.data_old != null && this.state.data_old.length > 0) {
            let __now = this.state.now;
            let data = this.state.data_old[__now];
            this.refs.old_hovatennhanvien.value = data['Họ Tên Nhân Viên'];
            if (data['Ngày Gọi'] != '' && data['Ngày Gọi'] != null) {
                this.refs.old_ngaygoi.value = new Date(data['Ngày Gọi']).toLocaleDateString('en-GB') + ' ' + new Date(data['Ngày Gọi']).toLocaleTimeString();
            }
            this.refs.old_noidungcuocgoi.value = data['Nội Dung Cuộc Gọi'];
            if (data['Ngày Kế Hoạch'] != '' && data['Ngày Kế Hoạch'] != null) {
                let day = new Date(data['Ngày Kế Hoạch']).toLocaleDateString('en-GB').split('/');
                this.refs.old_ngaykehoach.value = day[2] + '-' + day[1] + '-' + day[0];
            }
            this.refs.old_kehoach.value = data['Kế Hoạch'];
            let old_tinhtrangcuocgoi = data['Tình Trạng Cuộc Gọi'];
            if (old_tinhtrangcuocgoi != null) {
                old_tinhtrangcuocgoi = {value: old_tinhtrangcuocgoi, label: old_tinhtrangcuocgoi};
            }
            let old_chuongtrinhgoi = data['Chương Trình Gọi'];
            if (old_chuongtrinhgoi != null) {
                old_chuongtrinhgoi = {value: old_chuongtrinhgoi, label: old_chuongtrinhgoi};
            }
            let old_loaithaido = data['Loại Thái Độ'];
            if (old_loaithaido != null) {
                old_loaithaido = {value: old_loaithaido, label: old_loaithaido};
            }
            let old_phhailongvechatluong = data['PH Hài Lòng Về Chất Lượng H123'];
            if (old_phhailongvechatluong != null) {
                old_phhailongvechatluong = {value: old_phhailongvechatluong, label: old_phhailongvechatluong};
            }
            let old_lydophnghi = data['Lý Do Nghỉ'];
            if (old_lydophnghi != null) {
                old_lydophnghi = {value: old_lydophnghi, label: old_lydophnghi};
            }
            let old_phcothequaylai = data['PH Có Thể Quay Lại Học'];
            if (old_phcothequaylai != null) {
                old_phcothequaylai = {value: old_phcothequaylai, label: old_phcothequaylai};
            }
            this.refs.old_thoigianphnoiquaylai.value = data['Thời Gian PH Nói Quay Lại'];

            let shownext = 'block';
            let showback = 'block';
            if (__now == 0) {
                showback = 'none';
            }
            if (__now == (this.state.data_old.length - 1)) {
                shownext = 'none';
            }

            this.setState({
                now: __now,
                shownext: shownext,
                showback: showback,
                tinhtrangcuocgoi: old_tinhtrangcuocgoi,
                chuongtrinhcuocgoi: old_chuongtrinhgoi,
                loaithaido: old_loaithaido,
                phhailongvechatluong: old_phhailongvechatluong,
                lydophnghi: old_lydophnghi,
                phcothequaylai: old_phcothequaylai,
            })
        }
    }

    back () {
        if (this.state.data_old != null && this.state.data_old.length > 0) {
            let __now = this.state.now - 1;
            this.setState({
                now: __now,
                isLoad: true,
            })
        }
    }

    next () {
        if (this.state.data_old != null && this.state.data_old.length > 0) {
            let __now = this.state.now + 1;
            this.setState({
                now: __now,
                isLoad: true,
            })
        }
    }

    render () {
        let isEdit = false;
        if (this.state.data_old != null && this.state.data_old.length > 0) {
            isEdit = true;
        }

        let btnLuu = '';
        let listHistory = '';
        if (isEdit) {
            listHistory = 
            <div>
                <fieldset style={{
                    'margin': '5px 16px',
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
                    <div style={{
                        "display": "grid",
                        "grid-template-columns": "33.33% 33.33% 33.33%",
                    }}>
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
                                <label for="" >Nội Dung Cuộc Gọi: </label>
                                <textarea 
                                    ref="old_noidungcuocgoi"
                                    rows="4"
                                    cols="50"
                                    maxLength="5000"
                                    style={{'height' : '170px'}}>
                                </textarea>
                            </div>
                        </div>
                        <div>
                            <div className='divformstyle'>
                                <div>
                                    <label for="" >Ngày Kế Hoạch: </label>
                                    <input type="date" name="" ref='old_ngaykehoach'/>
                                </div>
                                <div>
                                    <label for="" >Kế Hoạch: </label>
                                    <input type="text" name="" ref='old_kehoach'/>
                                </div>
                            </div>
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
                        </div>
                        <div>
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
                                    <input type="text" name="" ref='old_thoigianphnoiquaylai' maxlength="200"/>
                                </div>
                            </div>
                        </div>
                    </div>
                </fieldset>
            </div>

            btnLuu = <input type="button" onClick={this.dongy.bind(this)} value="Lưu"/>;
        }

        return (
            <div className={style.formstyle}>
                <div className="form_body" style={{'width': '1100px'}}>
                    <div className="header">
                        { /*<img src="" alt="Icon Image"/> */}
                        <h2>Thông Tin Cuộc Gọi</h2>
                    </div>
                    <div className="body">
                        <div>
                            <div className='divformstyle' style={{
                                "display": "grid",
                                "grid-template-columns": "50% 50%",
                            }}>
                                <div>
                                    <div>
                                        <label for="" >Họ Và Tên: </label>
                                        <input type="text" name="" ref='hovaten' disabled={true} className='read_only'/>
                                    </div>
                                    <div>
                                        <label for="" >Trường: </label>
                                        <input type="text" name="" ref='truong' disabled={true} className='read_only'/>
                                    </div>
                                    <div>
                                        <label for="" >Lớp: </label>
                                        <input type="text" name="" ref='lop' disabled={true} className='read_only'/>
                                    </div>
                                    <div>
                                        <label for="" >Số Điện Thoại: </label>
                                        <input type="text" name="" ref='sodienthoai' disabled={true} className='read_only'/>
                                    </div>
                                    <div>
                                        <label for="" >Địa Chỉ: </label>
                                        <textarea 
                                            ref="diachi" 
                                            rows="4" 
                                            cols="50" 
                                            maxLength="1000" 
                                            style={{'height' : '75px'}}
                                            disabled={true}
                                            className='read_only'
                                        ></textarea>
                                    </div>
                                </div>
                                <div>
                                    <div>
                                        <label for="" >Người Thân (Bố/Anh/Chú): </label>
                                        <input type="text" name="" ref='hovatennt1' disabled={true} className='read_only'/>
                                    </div>
                                    <div>
                                        <label for="" >Số Điện Thoại: </label>
                                        <input type="text" name="" ref='sodienthoaint1' disabled={true} className='read_only'/>
                                    </div>
                                    <div>
                                        <label for="" >Nghề Nghiệp: </label>
                                        <input type="text" name="" ref='nghenghiepnt1' disabled={true} className='read_only'/>
                                    </div>
                                    <div>
                                        <label for="" >Người Thân (Mẹ/Chị/Dì): </label>
                                        <input type="text" name="" ref='hovatennt2' disabled={true} className='read_only'/>
                                    </div>
                                    <div>
                                        <label for="" >Số Điện Thoại: </label>
                                        <input type="text" name="" ref='sodienthoaint2' disabled={true} className='read_only'/>
                                    </div>
                                    <div>
                                        <label for="" >Nghề Nghiệp: </label>
                                        <input type="text" name="" ref='nghenghiepnt2' disabled={true} className='read_only'/>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {listHistory}
                    </div>
                    <div className="footer">
                        <input type="button" onClick={this.close.bind(this)} value="Thoát"/>
                        {btnLuu}
                    </div>
                </div>
                <div className="daithem">
                </div>
            </div>
        )
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
}

module.exports = connect(function (state) {
    return {
      socket: state.socket,
    };
}) (GoiDienChamSocKhachHangCu);
