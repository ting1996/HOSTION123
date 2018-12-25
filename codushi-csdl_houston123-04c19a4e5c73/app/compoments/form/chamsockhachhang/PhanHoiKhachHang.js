import React from 'react';
import { connect } from 'react-redux';
import style from '../style.css';
var ReactDOM = require('react-dom');
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPhone,
    faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import Button from '../elements/Button';
import Lop from '../elements/Lop';
import SoDienThoai from '../elements/SoDienThoai';
import Select from 'react-select';

class PhanHoiKhachHang extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            soluongkehoachtrongngay: null,
            tinhtrangchamsoc: [
                {label: 'Phản hồi theo chu kì', color: '#08aad8'},
                {label: 'Phản hồi gấp', color: '#d80808'}
            ],
            tinhtrang: 0,
            isCall: false,
            dataOld: [],
            customerInfor: null,
            loadingCustomerInfo: false,
            bangthongtin: [],
            tinhtrangcuocgoi: null,
            mucdohailong: null,
            listNhanvienph: [],
            nhanvienph: null,

            now: 0,
            isLoad: false,
            shownext: 'block',
            showback: 'block',

            disabled: false,
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
            if (arguments[3] != null) {
                arguments[3].overlayLayer = false;
            }
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
                    case 'form_chamsockhachhang_phanhoikhachhang_loadtongngaykehoach':
                        this.setState({soluongkehoachtrongngay: rows[0]['count']});
                        break;
                    case 'form_chamsockhachhang_phanhoikhachhang_caller_loadthongtinkhachhang':
                        this.setState({
                            customerInfor: rows[0],
                            loadingCustomerInfo: false,
                        })
                        break;
                    case 'form_chamsockhachhang_phanhoikhachhang_load':
                        let bangthongtin = {};
                        for (let value of rows[0]) {
                            if (bangthongtin[value['Type']] == null) {
                                bangthongtin[value['Type']] = [{value: value['Content'], label: value['Content']}];
                            } else {
                                bangthongtin[value['Type']].push({value: value['Content'], label: value['Content']});
                            }                            
                        }
                        this.setState({
                            bangthongtin: bangthongtin,
                            dataOld: rows[1],
                            now: rows[1].length - 1,
                            isLoad: true,
                        });
                        break;
                    case 'form_chamsockhachhang_phanhoikhachhang_successed':
                        this.SocketEmit('all-notification-update', {
                            to: 'users',
                            IDs: [$('#lable_button_nexttoicon').attr('value')],
                            fn: 'dailynotification',
                            elements: ['chamsockhachhang']
                        });
                        this.close();
                        break;
                    case 'form_chamsockhachhang_responseCSKH_loadphanhoikhachhang':
                        let listNhanvienph = [];
                        for (let row of rows) {
                            listNhanvienph.push({...row, label: row['Mã Nhân Viên Phản Hồi'] + ' - ' + row['Họ Và Tên Nhân Viên Phản Hồi']});
                        }
                        this.setState({
                            listNhanvienph: listNhanvienph,
                            nhanvienph: null,
                        });
                        break;
                    default:
                }
            }
        }  
    }

    componentDidMount () {
        let query;
        this.changeSize();
        window.addEventListener("resize", this.changeSize);
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
        query = 'SELECT * FROM BANGTHONGTIN; '
        query += 'SELECT CHAMSOCKHACHHANG.*, QUANLY.`Họ Và Tên` AS `Họ Tên Nhân Viên` FROM CHAMSOCKHACHHANG ' +
        'LEFT JOIN USERS ON USERS.`User ID` = CHAMSOCKHACHHANG.`User ID` ' +
        'LEFT JOIN QUANLY ON QUANLY.`Mã Quản Lý` = CHAMSOCKHACHHANG.`Mã Nhân Viên` ' +
        'WHERE CHAMSOCKHACHHANG.`User ID` = \'!\?!\'';
        query = query.replace('!?!', this.props.data['User ID']);
        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'form_chamsockhachhang_phanhoikhachhang_load',
        });
        this.updateData();
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.changeSize);
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentDidUpdate(prevProps, prevStat) {
        this.changeSize();

        if (this.state.isLoad == true) {
            this.loadData_Old();
            this.setState({isLoad: false});
        }
    }

    updateData () {
        this.setState({tinhtrang: this.props.data['Phân Loại Mức Độ']});
        this.refs.data_hovaten.value = this.props.data['User ID'] + ' - ' + this.props.data['Họ Và Tên'];
        this.refs.lop.value(this.props.data['Lớp']);
        this.refs.data_nguoichamsoc.value = this.props.data['Mã Nhân Viên'] + ' - ' + this.props.data['Họ Và Tên Nhân Viên'];
        if (this.props.data['Ngày Gọi'] != null) {
            let date = new Date(this.props.data['Ngày Gọi']);
            this.refs.data_thoigianchamsoc.value = date.toLocaleDateString('en-GB');
        }
        this.refs.data_noidungcuocgoi.value = this.props.data['Nội Dung Cuộc Gọi'];
        if (this.props.action == 'edit') {
            this.refs.phanhoi.value = this.props.data['Nội Dung Phản Hồi'];
        }
    }

    dongy () {
        let check = false;
        this.refs.phanhoi.style.borderColor = 'rgb(204, 204, 204)';

        if (this.state.isCall) {
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

                if (this.refs.noidungcuocgoi == null || this.refs.noidungcuocgoi.value.trim() == '') {
                    this.refs.noidungcuocgoi.style.borderColor = 'red';
                    check = true;
                }
    
                if (this.refs.ngaykehoach == null || this.refs.ngaykehoach.value == '') {
                    this.refs.ngaykehoach.style.borderColor = 'red';
                    check = true;
                }
    
                if (this.refs.kehoach == null || this.refs.kehoach.value.trim() == '') {
                    this.refs.kehoach.style.borderColor = 'red';
                    check = true;
                }
            }
        }

        if (this.refs.phanhoi == null || this.refs.phanhoi.value.trim() == '') {
            this.refs.phanhoi.style.borderColor = 'red';
            check = true;
        }

        if (check) {
            return;
        }
        let id = this.props.data['ID'];
        let content = this.refs.phanhoi.value.trim();
        content = content.replace(/\\/g, '\\\\');
        content = content.replace(/'/g, '\\\'');
        let query = '';
        if (this.state.isCall) {
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
            query += 'INSERT INTO `CHAMSOCKHACHHANG` (`User ID`, `Mã Nhân Viên`, `Ngày Kế Hoạch`, `Kế Hoạch`, `Ngày Gọi`, `Tình Trạng Cuộc Gọi`, `Mức Độ Hài Lòng`, `Phân Loại Mức Độ`,  `Nội Dung Cuộc Gọi`, `Hotline`) VALUES (\'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\'); '
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
            query = query.replace('!\?!', 'null');
        }
        query += 'UPDATE `REPORTCSKH` SET `content` = \'!\?!\'~ WHERE (`ID` = \'!\?!\'); ';
        if (this.props.highterStaff != null) {
            query = query.replace('~', ', `staffCode` = \'!\?!\''.replace('!\?!', this.props.highterStaff));
        } else {
            query = query.replace('~', '');
        }
        query = query.replace('!\?!', content);
        query = query.replace('!\?!', id);
        query = query.replace(/\'null\'/g, 'null');

        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn: 'form_chamsockhachhang_phanhoikhachhang_successed',
            isReload: true,
            isSuccess: true,
            reloadPageName: 'PHANHOICHAMSOCKHACHHANG',
        });
        this.setState({
            disabled: true,
        })
    }

    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
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
                fn : 'form_chamsockhachhang_phanhoikhachhang_loadtongngaykehoach',
            });
        } else {
            this.setState({soluongkehoachtrongngay: null});
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

        let styleshadow = 'rgb(41, 41, 41) 3px 3px 8px -2px';
        let stylebackground = '#c6552b';
        let calleelement = null;
        if (this.state.isCall == true
        && this.state.customerInfor != null
        && this.props.action != 'edit') {
            styleshadow = 'inset rgb(41, 41, 41) 3px 3px 8px -2px';
            stylebackground = '#007eff';
            calleelement = 
            <div style={{
                'border': '1px solid #ccc',
                'background': 'white',
                'border-radius': '5px',
                'display': 'grid',
                'grid-template-columns': '50% 50%',
            }}>
                <div>
                    <div className='divformstyle'>
                        <div>
                            <label for="" >Họ Và Tên: </label>
                            <input type="text" name="" value={this.state.customerInfor['Họ Và Tên']} disabled={true} className='read_only'/>
                        </div>
                        <div>
                            <SoDienThoai disabled={true} default={this.state.customerInfor['Số Điện Thoại']}/>
                        </div>
                        <div>
                            <label for="" >Người Thân (Bố/Anh/Chú): </label>
                            <input type="text" name="" value={this.state.customerInfor['Họ Và Tên (NT1)']} disabled={true} className='read_only'/>
                        </div>
                        <div>
                            <SoDienThoai disabled={true} default={this.state.customerInfor['Số Điện Thoại (NT1)']}/>
                        </div>
                        <div>
                            <label for="" >Người Thân (Mẹ/Chị/Dì): </label>
                            <input type="text" name="" value={this.state.customerInfor['Họ Và Tên (NT2)']} disabled={true} className='read_only'/>
                        </div>
                        <div>
                            <SoDienThoai disabled={true} default={this.state.customerInfor['Số Điện Thoại (NT2)']}/>
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
                            options={this.state.bangthongtin['Tình Trạng Cuộc Gọi']}
                            onChange={(v) => this.setState({tinhtrangcuocgoi: v})}
                            ref="tinhtrangcuocgoi"
                        />
                    </div>
                    <div className="unsetdivformstyle">
                        <label for="">Mức Độ Hài Lòng: </label>
                        <Select
                            placeholder="--- Mức Độ Hài Lòng ---"
                            value={this.state.mucdohailong}
                            options={this.state.bangthongtin['Mức Độ Hài Lòng']}
                            onChange={(v) => this.setState({mucdohailong: v})}
                            ref="mucdohailong"
                        />
                    </div>
                    <div className='divformstyle'>
                        <div>
                            Tình Trạng Chăm Sóc:
                            <select ref="phanloaimucdo">
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
                            ></textarea>
                        </div>
                    </div>
                    <div className='divformstyle'>
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
                                style={{'height' : '75px'}}
                            ></textarea>
                        </div>
                    </div>
                </div>
            </div>
        }

        let history = null;
        let bodydisplay = '100%';
        let bodywidth = '800px';
        if (this.state.dataOld.length > 0) {
            bodydisplay = '33.33% auto';
            bodywidth= '1100px';
            history = 
            <div>
                <fieldset style={{
                    'margin': '5px',
                    'padding': '0',
                    'height': 'calc(100% - 15px)',
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
        }

        return (
            <div className={style.formstyle} ref="background">
                <div className="form_body" ref="body" style={{'width': bodywidth, 'transition': '0.5s'}}>
                    <div className="header">
                        { /*<img src="" alt="Icon Image"/> */}
                        <h2>Phản Hồi Khách Hàng</h2>
                    </div>
                    <div className="body">
                        <div style={{
                            'display': 'grid',
                            'grid-template-columns': bodydisplay,
                        }}>
                            {history}
                            <div>
                                <div className='divformstyle'>
                                    <div>
                                        <div style={{
                                            'background': this.state.tinhtrangchamsoc[this.state.tinhtrang].color,
                                            'width': 'fit-content',
                                            'border-radius': '20px',
                                            'color': 'white',
                                            'box-shadow': '2px 2px 8px -2px #666',
                                        }}>
                                            <b>
                                                {this.state.tinhtrangchamsoc[this.state.tinhtrang].label}
                                            </b>
                                        </div>
                                    </div>
                                    <div>
                                        <label for="" >Họ Và Tên: </label>
                                        <input type="text" name="" ref='data_hovaten' disabled={true} className='read_only'/>
                                    </div>
                                    <div>
                                        <Lop ref="lop" disabled={true}/>
                                    </div>
                                    <div>
                                        list lop dang hoc
                                    </div>
                                    <div>
                                        <label for="" >Người Chăm Sóc: </label>
                                        <input type="text" name="" ref='data_nguoichamsoc' disabled={true} className='read_only'/>
                                    </div>
                                    <div>
                                        <label for="" >Thời Gian Chăm Sóc: </label>
                                        <input type="text" name="" ref='data_thoigianchamsoc' disabled={true} className='read_only'/>
                                    </div>
                                    <div style={{
                                        'border-bottom': '1px solid #ccc',
                                    }}>
                                        <label for="" >Nội Dung Khách Hàng Phản Hồi: </label>
                                        <textarea 
                                            ref="data_noidungcuocgoi" 
                                            rows="4" 
                                            cols="50"
                                            style={{'height' : '75px'}}
                                            disabled={true}
                                            className='read_only'
                                        ></textarea>
                                    </div>
                                </div>
                                <div style={{
                                    'display': 'grid',
                                    'grid-template-columns': 'min-content auto',
                                }} className="unsetdivformstyle">
                                    <div style={{'padding': '5px'}}>
                                        <div style={{
                                            'width': 'fit-content',
                                            'font-size': 'xx-large',
                                            'box-shadow': styleshadow,
                                            'padding': '5px',
                                            'color': 'white',
                                            'background': stylebackground,
                                            'border-radius': '10px',
                                        }}
                                            onClick={() => {
                                                if (!this.state.loadingCustomerInfo
                                                && $('.permission').attr('value') != 'giaovien'
                                                && this.props.action != 'edit') {
                                                    this.setState({isCall: !this.state.isCall})
                                                    if (!this.state.isCall) {
                                                        let query = 'SELECT * FROM quanlyhocsinh.USERS WHERE `User ID` = \'!\?!\' ';
                                                        query = query.replace('!\?!', this.props.data['User ID']);
                                                        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                                                            fn : 'form_chamsockhachhang_phanhoikhachhang_caller_loadthongtinkhachhang',
                                                        });
                                                        this.setState({
                                                            loadingCustomerInfo: true,
                                                        })
                                                    } else {
                                                        this.setState({
                                                            customerInfor: null,
                                                            loadingCustomerInfo: false,
                                                        })
                                                    }
                                                }
                                            }}
                                        >
                                            {
                                                (() => {
                                                    if (this.state.loadingCustomerInfo) {
                                                        return (
                                                            <span className="fa-layers">
                                                                <FontAwesomeIcon icon={faPhone}/>
                                                                <FontAwesomeIcon 
                                                                    icon={faSpinner} 
                                                                    inverse 
                                                                    spin 
                                                                    transform="shrink-4"
                                                                    style={{
                                                                        'color':'rgb(189, 1, 1)',
                                                                    }}
                                                                />
                                                            </span>
                                                        )
                                                    } else {
                                                        return (
                                                            <FontAwesomeIcon icon={faPhone}/>
                                                        )
                                                    }
                                                })()
                                            }
                                        </div>
                                    </div>
                                    <div>
                                        <div>
                                            Cuộc gọi phản hồi <i>(Chỉ dành cho Quản Lý)</i>:<br/>
                                        </div>
                                        {calleelement}
                                    </div>
                                </div>
                                <div className='divformstyle'>
                                    <div>
                                        <label for="" >Nội Dung Phản Hồi: </label>
                                        <textarea 
                                            placeholder="Nhập nội dung phản hồi lại cho khách hàng"
                                            ref="phanhoi" 
                                            rows="4" 
                                            cols="50"
                                            style={{'height' : '100px'}}
                                        ></textarea>
                                    </div>
                                </div>
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
                        <Button 
                            onClick={this.dongy.bind(this)}
                            value="Đồng Ý"
                            icon="agree"
                            style={{'float': 'right', 'margin-right': '10px',}}
                            disabled={this.state.disabled}
                        />
                    </div>
                </div>
            </div>
        )
    }

    loadData_Old () {
        if (this.state.dataOld != null
        && this.state.dataOld.length > 0) {
            let __now = this.state.now;
            let data = this.state.dataOld[__now];
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
                fn: 'form_chamsockhachhang_responseCSKH_loadphanhoikhachhang',
            });

            let shownext = 'block';
            let showback = 'block';

            if (__now == 0) {
                showback = 'none';
            }

            if (__now == (this.state.dataOld.length - 1)) {
                shownext = 'none';
            }

            this.setState({
                now: __now,
                shownext: shownext,
                showback: showback,
            })
        }
    }

    back () {
        if (this.state.dataOld != null && this.state.dataOld.length > 0) {
            let __now = this.state.now - 1;
            this.setState({
                now: __now,
                isLoad: true,
            })
        }
    }

    next () {
        if (this.state.dataOld != null && this.state.dataOld.length > 0) {
            let __now = this.state.now + 1;
            this.setState({
                now: __now,
                isLoad: true,
            })
        }
    }
}

module.exports = connect(function (state) {
    return {
      socket: state.socket,
    };
  }) (PhanHoiKhachHang);
