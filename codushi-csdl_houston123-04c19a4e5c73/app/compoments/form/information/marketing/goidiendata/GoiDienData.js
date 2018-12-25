import React from 'react';
import { connect } from 'react-redux';
import style from '../../../style.css';
var ReactDOM = require('react-dom');
<<<<<<< HEAD:app/compoments/form/information/marketing/goidiendata/GoiDienData.js
<<<<<<< HEAD:app/compoments/form/information/marketing/goidiendata/GoiDienData.js
<<<<<<< HEAD:app/compoments/form/information/call/CallInformation.js
import SoDienThoai from '../../elements/SoDienThoai';
=======
import SoDienThoai from '../../../SoDienThoai';
>>>>>>> bd725a275452ffb9d028ff2d218923f229db451f:app/compoments/form/information/marketing/goidiendata/GoiDienData.js
=======
import SoDienThoai from '../../SoDienThoai';
>>>>>>> parent of c2a5e1b1... Update (5/9 -> 7/9)::app/compoments/form/information/call/CallInformation.js
=======
import SoDienThoai from '../../SoDienThoai';
>>>>>>> parent of c2a5e1b1... Update (5/9 -> 7/9)::app/compoments/form/information/call/CallInformation.js
import Select from 'react-select';

class GoiDienData extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data_old: [],
            tinhtrangcuocgoi: null,
            chuongtrinhcuocgoi: null,
            loaithaido: null,
            loainhucau: null,
            tinhhinhsudungsanpham: null,
            kehoachhoche: null,
            soluongkehoachtrongngay: null,

            now: 0,
            isLoad: false,
            shownext: 'none',
            showback: 'none',
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
                    case 'imformation_marketing_goidiendata_loadinfor':
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
                    case 'imformation_marketing_goidiendata_loadhistory':
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

        query = 'SELECT CALLDATA.*, QUANLY.`Họ Và Tên` AS `Họ Tên Nhân Viên` FROM quanlyhocsinh.CALLDATA ' +
        'LEFT JOIN quanlyhocsinh.QUANLY ON QUANLY.`Mã Quản Lý` = CALLDATA.`Mã Nhân Viên` ' +
        'WHERE `ID-DATA` = \'!?!\';';
        query = query.replace('!\?!', this.props.id);
        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'imformation_marketing_goidiendata_loadhistory',
        });

        query = 'SELECT * FROM quanlyhocsinh.DATA_TRUONGTIEMNANG WHERE `ID` = \'!\?!\';';
        query = query.replace('!\?!', this.props.id);
        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'imformation_marketing_goidiendata_loadinfor',
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
            if (this.state.tinhtrangcuocgoi == null) {
                this.props.dispatch({
                    type: 'ALERT_NOTIFICATION_ADD',
                    content: 'Tình trạng cuộc goi đang trống!',
                    notifyType: 'warning',
                })
                check = true;
            }

            if (this.state.chuongtrinhcuocgoi == null) {
                this.props.dispatch({
                    type: 'ALERT_NOTIFICATION_ADD',
                    content: 'Chương trình gọi đang trống!',
                    notifyType: 'warning',
                })
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
            let loainhucau = null;
            if (this.state.loainhucau != null) {
                loainhucau = this.state.loainhucau.value;
            }
            let loaithaido = null;
            if (this.state.loaithaido != null) {
                loaithaido = this.state.loaithaido.value;
            }
            let tinhhinhsudungsanpham = null;
            if (this.state.tinhhinhsudungsanpham != null) {
                tinhhinhsudungsanpham = this.state.tinhhinhsudungsanpham.value;
            }
            let kehoachhoche = null;
            if (this.state.kehoachhoche != null) {
                kehoachhoche = this.state.kehoachhoche.value;
            }
            let thoigianphnoiquaylai = this.refs.old_thoigianphnoiquaylai.value;
            let noidungcuocgoi = this.refs.old_noidungcuocgoi.value;
    
            let query = '';
            query = 'UPDATE `quanlyhocsinh`.`CALLDATA` SET `Ngày Kế Hoạch`=\'!\?!\', `Kế Hoạch`=\'!\?!\', `Tình Trạng Cuộc Gọi`=\'!\?!\', `Chương Trình Gọi`=\'!\?!\', `Loại Thái Độ`=\'!\?!\', `Loại Nhu Cầu`=\'!\?!\', `Tình Hình Sử Dụng Sản Phẩm`=\'!\?!\', `Kế Hoạch Học Hè`=\'!\?!\', `Thời Gian PH Hẹn Lên`=\'!\?!\', `Nội Dung Cuộc Gọi`=\'!\?!\' WHERE `ID`=\'!\?!\'; ';
    
            if (ngaykehoach == '') {
                query = query.replace('!\?!', 'null');
            } else {
                query = query.replace('!\?!', ngaykehoach);
            }
            query = query.replace('!\?!', kehoach);
            query = query.replace('!\?!', tinhtrangcuocgoi);
            query = query.replace('!\?!', chuongtrinhcuocgoi);
            query = query.replace('!\?!', loaithaido);
            query = query.replace('!\?!', loainhucau);
            query = query.replace('!\?!', tinhhinhsudungsanpham);
            query = query.replace('!\?!', kehoachhoche);
            query = query.replace('!\?!', thoigianphnoiquaylai);
            query = query.replace('!\?!', noidungcuocgoi);
            query = query.replace('!\?!', id);
            query = query.replace(/\'null\'/g, 'null');
            
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
            let old_loainhucau = data['Loại Nhu Cầu'];
            if (old_loainhucau != null) {
                old_loainhucau = {value: old_loainhucau, label: old_loainhucau};
            }
            let old_tinhhinhsudungsanpham = data['Tình Hình Sử Dụng Sản Phẩm'];
            if (old_tinhhinhsudungsanpham != null) {
                old_tinhhinhsudungsanpham = {value: old_tinhhinhsudungsanpham, label: old_tinhhinhsudungsanpham};
            }
            let old_kehoachhoche = data['Kế Hoạch Học Hè'];
            if (old_kehoachhoche != null) {
                old_kehoachhoche = {value: old_kehoachhoche, label: old_kehoachhoche};
            }
            this.refs.old_thoigianphnoiquaylai.value = data['Thời Gian PH Hẹn Lên'];

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
                loainhucau: old_loainhucau,
                tinhhinhsudungsanpham: old_tinhhinhsudungsanpham,
                kehoachhoche: old_kehoachhoche,                
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
                                />
                            </div>
                        </div>
                        <div>
                            <div className="unsetdivformstyle">
                                <label for="Loại Thái Độ">Loại Thái Độ: </label>
                                <Select
                                    name="Loại Thái Độ"
                                    placeholder="--- Loại Thái Độ ---"
                                    value={this.state.loaithaido}
                                    options={this.props.bangthongtin['Loại Thái Độ']}
                                    onChange={this.onChangeLoaiThaiDo.bind(this)}
                                />
                            </div>
                            <div className="unsetdivformstyle">
                                <label for="Loại Nhu Cầu">Loại Nhu Cầu: </label>
                                <Select
                                    name="Loại Nhu Cầu"
                                    placeholder="--- Loại Nhu Cầu ---"
                                    value={this.state.loainhucau}
                                    options={this.props.bangthongtin['Loại Nhu Cầu']}
                                    onChange={this.onChangeLoaiNhuCau.bind(this)}
                                />
                            </div>
                            <div className="unsetdivformstyle">
                                <label for="Tình Hình Sử Dụng Sản Phẩm">Tình Hình Sử Dụng Sản Phẩm: </label>
                                <Select
                                    name="Tình Hình Sử Dụng Sản Phẩm"
                                    placeholder="--- Tình Hình Sử Dụng Sản Phẩm ---"
                                    value={this.state.tinhhinhsudungsanpham}
                                    options={this.props.bangthongtin['Tình hình sử dụng sản phẩm']}
                                    onChange={this.onChangeTinhHinhSuDungSanPham.bind(this)}
                                />
                            </div>
                            <div className="unsetdivformstyle">
                                <label for="Kế Hoạch Học Hè">Kế Hoạch Học Hè: </label>
                                <Select
                                    name="Kế Hoạch Học Hè"
                                    placeholder="--- Kế Hoạch Học Hè ---"
                                    value={this.state.kehoachhoche}
                                    options={this.props.bangthongtin['Kế hoạch học hè']}
                                    onChange={this.onChangeKeHoachHocHe.bind(this)}
                                />
                            </div>
                            <div className='divformstyle'>
                                <div>
                                    <label for="" >Thời Gian PH Nói Quay Lại: </label>
                                    <input type="text" name="" ref='old_thoigianphnoiquaylai'/>
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

    onChangeLoaiNhuCau (e) {
        this.setState({loainhucau: e});
    }

    onChangeNgayKeHoach () {
        let ngaykehoach = this.refs.ngaykehoach.value;
        if (ngaykehoach != null && ngaykehoach != '') {
            let query = 'SELECT COUNT(`ID`) AS count FROM quanlyhocsinh.GOIDIENDATA_VIEW WHERE `Ngày Kế Hoạch` = \'!\?!\' AND `Cơ Sở` = \'!\?!\'';
            query = query.replace('!\?!', ngaykehoach);
            query = query.replace('!\?!', $('.khuvuc').attr('value'));
            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                fn : 'goidiendata_rowcall_loadtongngaykehoach',
            });
        } else {
            this.setState({soluongkehoachtrongngay: null});
        }
    }

    onChangeTinhHinhSuDungSanPham (e) {
        this.setState({tinhhinhsudungsanpham: e});
    }

    onChangeKeHoachHocHe (e) {
        this.setState({kehoachhoche: e});
    }
}

module.exports = connect(function (state) {
    return {
      socket: state.socket,
    };
}) (GoiDienData);
