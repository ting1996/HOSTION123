import React from 'react';
import { connect } from 'react-redux';
import style from '../style.css';
var ReactDOM = require('react-dom');
import SoDienThoai from '../elements/SoDienThoai';
import Select from 'react-select';

class RowCallCSKH extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tinhtrangcuocgoi: null,

            danhsachgiaovien: [],
            danhsachquanly: [],
            dsgvphanhoi: [],
            dsqlphanhoi: [],
            qlph: false,
            gvph: false,
            
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
                    case 'goidiendata_rowcall_loadtongngaykehoach':
                        this.setState({soluongkehoachtrongngay: rows[0]['count']});
                        break;
                    case 'form_call_rowcallcskh_loadthongtinhs':
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

                        this.setState({
                            danhsachgiaovien: danhsachgiaovien,
                            danhsachquanly: danhsachquanly,
                        })
                        break;
                    case 'form_call_rowcallcskh_addreportcskh':
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
                        break;
                    case 'form_call_rowcallcskh_Successed':
                        try {
                            this.fn();
                        } catch (e) {
                            this.close();
                        }
                        break;
                    case 'form_call_rowcallcskh_loadphanhoikhachhang':
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
            this.refs.mucdouutien.value = 0;

            let query = 'SELECT QUANLY.`Họ Và Tên`, QUANLY.`Mã Quản Lý` FROM QUANLY WHERE ' +
            '(permission = \'tbmvanhoa\' OR ' +
            'permission = \'tbmanhvan\' OR ' +
            'permission = \'modtpcl\' OR ' +
            'permission = \'modcl\' OR ' +
            'permission = \'mod\') AND ' +
            'QUANLY.`Cơ Sở` = \'!\?!\' AND '.replace('!\?!', $('.khuvuc').attr('value')) +
            'QUANLY.`Ngày Nghỉ` IS NULL; ' +
            'SELECT LOPHOC.`Mã Lớp`, GIAOVIEN.`Mã Giáo Viên`, GIAOVIEN.`Họ Và Tên` AS `gvname`, ' +
            'LOPHOC.`Mã Môn Học`, DANHSACHMONHOC.name ' +
            'FROM DANHSACHHOCSINHTRONGLOP ' +
            'LEFT JOIN LOPHOC ON LOPHOC.`Mã Lớp` = DANHSACHHOCSINHTRONGLOP.`Mã Lớp` ' +
            'LEFT JOIN GIAOVIEN ON LOPHOC.`Mã Giáo Viên` = GIAOVIEN.`Mã Giáo Viên` ' +
            'LEFT JOIN DANHSACHMONHOC ON LOPHOC.`Mã Môn Học` = DANHSACHMONHOC.mamon ' +
            'WHERE `User ID` = \'!\?!\'; ';
            query = query.replace(/!\?!/g, rows['User ID']);
            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                fn : 'form_call_rowcallcskh_loadthongtinhs',
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
        this.refs.noidungcuocgoi.style.borderColor = 'rgb(204, 204, 204)';
        this.refs.ngaykehoach.style.borderColor = 'rgb(204, 204, 204)';
        this.refs.kehoach.style.borderColor = 'rgb(204, 204, 204)';

        if (this.state.tinhtrangcuocgoi == null) {
            this.refs.tinhtrangcuocgoi.wrapper.getElementsByClassName('Select-control')[0].style.borderColor = 'red';
            check = true;
        } else if (this.state.tinhtrangcuocgoi.value == 'Cuộc gọi thành công') {
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
        let noidungcuocgoi = this.refs.noidungcuocgoi.value;
        let mucdouutien = this.refs.mucdouutien.value;
        let hotline = this.props.sohotline;

        let query = '';
        query = 'INSERT INTO `CHAMSOCKHACHHANG` (`User ID`, `Mã Nhân Viên`, `Ngày Kế Hoạch`, `Kế Hoạch`, `Ngày Gọi`, `Tình Trạng Cuộc Gọi`, `Nội Dung Cuộc Gọi`, `Mức Độ Ưu Tiên`, `Hotline`) VALUES (\'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\'); ' +
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
        query = query.replace('!\?!', noidungcuocgoi);
        query = query.replace('!\?!', mucdouutien);
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
        let columns_grid = '50% 50%';
        if (this.props.dataOld != null && this.props.dataOld.length > 0) {
            display_old = 'block';
            columns_grid = '33.33% 33.33% 33.33%';
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
                            {nhamang}
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
                            onChange={(v) => this.setState({tinhtrangcuocgoi: v})}
                            ref="tinhtrangcuocgoi"
                        />
                    </div>                
                    <div className='divformstyle'>                    
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
                    <div className="unsetdivformstyle">
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
                    <div className="unsetdivformstyle">
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
                        <div>
                            Tình Trạng Chăm Sóc:
                            <select ref="mucdouutien">
                                <option value="0">Bình Thường</option>
                                <option value="1">Quan Trọng</option>
                                <option value="2">Khẩn Cấp</option>
                            </select>
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
  }) (RowCallCSKH);
