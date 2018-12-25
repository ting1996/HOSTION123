import React from 'react';
import { connect } from 'react-redux';
import style from '../style.css';
var ReactDOM = require('react-dom');
import Select from 'react-select';

class Create extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            today: null,
            nhanVien: [],
            listNhanVien: [],
            nhomcongviec: null,
            listNhomCongViec: [],

            checkList: false,
            listMethod: [],
            chuky: null,
            listchuky: [{label: 'Hàng Ngày', value: 'd'}, {label: 'Hàng Tuần', value: 'w'}, {label: 'Hàng Tháng', value: 'm'}],
            ngaychuky: null,
            listngaychuky: [],
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
        let tasksassign = '';
        let methodquery = '';
        let d = this.props.editValue;
        if (hanhdong == 'laydulieu_trave') {
            if (dulieuguive != null) {
                switch (dulieuguive.fn) {
                    case 'form_task_create_loadnhomcongviec':
                        let listNhomCongViec = [];
                        let _nhomcongviec = null;
                        for (let row of rows) {
                            let nhomcongviec = {label: row['Content'], data: row, value: row['Content']};
                            listNhomCongViec.push(nhomcongviec);
                            if (d != null && d['nhomcongviec'] == row['Content']) {
                                _nhomcongviec = nhomcongviec;
                            }
                        }
                        this.setState({
                            listNhomCongViec: listNhomCongViec,
                            nhomcongviec: _nhomcongviec,
                        })
                        break;
                    case 'form_task_create_successfull':
                        tasksassign = '';
                        for (let _t of dulieuguive.listIDsReloadNotification) {
                            tasksassign += 'INSERT INTO TASKSASSIGN (`taskID`, `staffCode`, `isRead`, `isDeactivate`) VALUES (\'!\?!\', \'!\?!\', \'0\', \'0\'); ';
                            tasksassign = tasksassign.replace('!\?!', rows.insertId);
                            tasksassign = tasksassign.replace('!\?!', _t);
                        }
                        methodquery = '';
                        if (this.state.checkList && this.state.listMethod != null && this.state.listMethod.length > 0) {
                            for (let _m of this.state.listMethod) {
                                methodquery += 'INSERT INTO METHODOFTASKS (`todo`, `taskID`, `cycle`, `isDeactivate`) VALUES (\'!\?!\', \'!\?!\', \'!\?!\', \'0\'); ';
                                methodquery = methodquery.replace('!\?!', _m.name);
                                methodquery = methodquery.replace('!\?!', rows.insertId);
                                methodquery = methodquery.replace('!\?!', _m.chuky);
                            }
                        }
                        query = tasksassign + methodquery;
                        query = query.replace(/\'null'/g, 'null');
                        query = query.replace(/\''/g, 'null');
                        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                            fn : 'form_task_create_close',
                            transaction: true,
                            transactioncommit: true,
                            isSuccess: true,
                            IDs: dulieuguive.listIDsReloadNotification,
                        });
                        break;
                    case 'form_task_create_close':
                        this.SocketEmit('all-notification-update', {
                            to: 'users',
                            IDs: dulieuguive.IDs,
                            fn: 'dailynotification',
                            elements: ['tasks']
                        });
                        this.close(true);
                        break;
                    case 'form_task_edit_loadquytrinh':
                        if (rows.length > 0) {
                            let todolist = [];
                            let _disable = false;
                            for (let row of rows) {
                                if (row.isDeactivate == 1) {
                                    _disable = true;
                                } else {
                                    _disable = false;
                                }
                                let obj = {
                                    name: row['todo'],
                                    chuky: row['cycle'],
                                    isDisable: _disable,
                                    editData: row,                                    
                                }
                                todolist.push(obj);
                            }

                            this.setState({
                                checkList: true,
                                listMethod: todolist,
                            });
                        }
                        break;
                    case 'form_task_edit_successfull':
                        tasksassign = '';
                        let _listIDs = dulieuguive.listIDsReloadNotification;
                        if (d != null) {
                            for (let _s of d['listStaff']) {
                                if (_listIDs.indexOf(_s['staffCode']) == -1) {
                                    tasksassign += 'UPDATE `quanlyhocsinh`.`TASKSASSIGN` SET `isRead`=\'1\', `isDeactivate`=\'1\' WHERE `ID`=\'!\?!\'; ';
                                } else {
                                    tasksassign += 'UPDATE `quanlyhocsinh`.`TASKSASSIGN` SET `isRead`=\'-1\', `isDeactivate`=\'0\' WHERE `ID`=\'!\?!\'; ';
                                }
                                tasksassign = tasksassign.replace('!\?!', _s['staffID']);
                            }
                        }
                        for (let _t of dulieuguive.listIDsReloadNotification) {
                            let isDisable = false;
                            if (d != null) {
                                for (let _s of d['listStaff']) {
                                    if (_s['staffCode'] == _t) {
                                        isDisable = true;
                                        break;
                                    }
                                }
                            }

                            if (!isDisable) {
                                tasksassign += 'INSERT INTO TASKSASSIGN (`taskID`, `staffCode`, `isRead`, `isDeactivate`) VALUES (\'!\?!\', \'!\?!\', \'0\', \'0\'); ';
                                tasksassign = tasksassign.replace('!\?!', d['ID']);
                                tasksassign = tasksassign.replace('!\?!', _t);
                            }
                        }
                        methodquery = '';
                        if (this.state.checkList && this.state.listMethod != null && this.state.listMethod.length > 0) {
                            for (let _m of this.state.listMethod) {
                                if (_m.editData == null) {
                                    methodquery += 'INSERT INTO METHODOFTASKS (`todo`, `taskID`, `cycle`, `isDeactivate`) VALUES (\'!\?!\', \'!\?!\', \'!\?!\', \'0\'); ';
                                    methodquery = methodquery.replace('!\?!', _m.name);
                                    methodquery = methodquery.replace('!\?!', d['ID']);
                                    methodquery = methodquery.replace('!\?!', _m.chuky);
                                } else {
                                    let oldID = _m.editData['ID'];
                                    methodquery += 'UPDATE `quanlyhocsinh`.`METHODOFTASKS` SET `todo`=\'!\?!\', `cycle`=\'!\?!\', `isDeactivate`=\'!\?!\' WHERE `ID`=\'!\?!\'; ';
                                    methodquery = methodquery.replace('!\?!', _m.name);
                                    methodquery = methodquery.replace('!\?!', _m.chuky);
                                    if (_m.isDisable == true) {
                                        methodquery = methodquery.replace('!\?!', '1');
                                    } else {
                                        methodquery = methodquery.replace('!\?!', '0');
                                    }
                                    methodquery = methodquery.replace('!\?!', oldID);
                                }
                            }
                        }
                        query = tasksassign + methodquery;
                        query = query.replace(/\'null'/g, 'null');
                        query = query.replace(/\''/g, 'null');
                        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                            fn : 'form_task_create_close',
                            transaction: true,
                            transactioncommit: true,
                            isSuccess: true,
                            IDs: dulieuguive.listIDsReloadNotification,
                        });
                        break;
                    default:
                }                
            }
        }
    }

    componentDidMount () {
        if (this.props.userInformation == null) {
            this.close();
            return;
        }
        let query;
        window.addEventListener("resize", this.changeSize);
        this.changeSize();
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
        let _nhanVien = [];        
        if (this.props.editValue != null) {
            for (let nhanVien of this.props.listNhanVien) {
                for (let _s of this.props.editValue['listStaff']) {
                    if (_s['staffCode'] == nhanVien.value
                    && _s.isDeactivate != 1) {
                        _nhanVien.push(nhanVien);
                        break;
                    }
                }
            }
        }
        this.setState({
            listNhanVien: this.props.listNhanVien,
            nhanVien: _nhanVien,
        })

        query = 'SELECT * FROM BANGTHONGTIN WHERE Type = \'Nhóm Công Việc\'';
        query = query.replace('!\?!', this.props.userInformation.account_id);
        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'form_task_create_loadnhomcongviec',
        });

        let date = new Date();
        let today = date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2);
        this.setState({today: today});

        if (this.props.editValue != null) {
            let d = this.props.editValue;
            this.refs.title.value = d['Title'];
            this.refs.loaicongviec.value = d['Level'];

            let startdate = new Date(d['StartTime'])
            this.refs.starttime.value = startdate.toLocaleTimeString('en-GB');
            this.refs.startdate.value = startdate.getFullYear() + '-' + ("0" + (startdate.getMonth() + 1)).slice(-2) + '-' + ("0" + startdate.getDate()).slice(-2);

            let enddate = new Date(d['EndTime'])
            this.refs.endtime.value = enddate.toLocaleTimeString('en-GB');
            this.refs.enddate.value = enddate.getFullYear() + '-' + ("0" + (enddate.getMonth() + 1)).slice(-2) + '-' + ("0" + enddate.getDate()).slice(-2);

            this.refs.content.value = d['Content'];
            this.refs.yeucaubaocao.value = d['yeucaubaocao'];
            this.refs.files.value = d['Files'];

            query = 'SELECT * FROM METHODOFTASKS WHERE taskID = \'!\?!\'; ';
            query = query.replace('!\?!', d['ID']);
            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                fn : 'form_task_edit_loadquytrinh',
            });
        }
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.changeSize);
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentDidUpdate(prevProps, prevState) {
        this.changeSize();
    }

    dongy () {
        let fail = false;
        this.refs.title.style.borderColor = 'rgb(204, 204, 204)';
        this.refs.startdate.style.borderColor = 'rgb(204, 204, 204)';
        this.refs.enddate.style.borderColor = 'rgb(204, 204, 204)';
        this.refs.content.style.borderColor = 'rgb(204, 204, 204)';
        this.refs.yeucaubaocao.style.borderColor = 'rgb(204, 204, 204)';
        this.refs.files.style.borderColor = 'rgb(204, 204, 204)';
        this.refs.nhomcongviec.wrapper.getElementsByClassName('Select-control')[0].style.borderColor = 'rgb(204, 204, 204)';
        this.refs.nguoithuchien.wrapper.getElementsByClassName('Select-control')[0].style.borderColor = 'rgb(204, 204, 204)';

        let ten = this.refs.title.value.trim();
        let nhomcongviec = this.state.nhomcongviec;
        let loaicongviec = this.refs.loaicongviec.value;
        let nguoithuchien = this.state.nhanVien;
        let thoigianbatdau = this.refs.startdate.value.trim();
        let thoigianketthuc = this.refs.enddate.value.trim();
        let noidung = this.refs.content.value.trim();
        let yeucaubaocao = this.refs.yeucaubaocao.value.trim();
        let teptindinhkem = this.refs.files.value.trim();

        if (ten == '') {
            this.refs.title.style.borderColor = 'red';
            fail = true;
        }

        if (nhomcongviec == null) {
            this.refs.nhomcongviec.wrapper.getElementsByClassName('Select-control')[0].style.borderColor = 'red';
            fail = true;
        } else {
            nhomcongviec = nhomcongviec['value'];
        }

        let IDs = [];
        if (nguoithuchien == null || (nguoithuchien != null && nguoithuchien.length == 0)) {
            this.refs.nguoithuchien.wrapper.getElementsByClassName('Select-control')[0].style.borderColor = 'red';
            fail = true;
        } else {
            let a = '';
            for (let ng of nguoithuchien) {
                a += ng['label'] + ':';
                IDs.push(ng['value']);
            }
            nguoithuchien = a;
        }
        
        if (thoigianbatdau == '') {
            this.refs.startdate.style.borderColor = 'red';
            fail = true;
        } else {
            if (this.refs.starttime.value.trim() == '') {
                thoigianbatdau = thoigianbatdau + ' 00:00:00';
            } else {
                thoigianbatdau = thoigianbatdau + ' ' + this.refs.starttime.value;
            }
            thoigianbatdau = thoigianbatdau.trim();
        }

        if (thoigianketthuc == '') {
            this.refs.enddate.style.borderColor = 'red';
            fail = true;
        } else {
            if (this.refs.endtime.value.trim() == '') {
                thoigianketthuc = thoigianketthuc + ' 23:59:59';
            } else {
                thoigianketthuc = thoigianketthuc + ' ' + this.refs.endtime.value;
            }
            thoigianketthuc = thoigianketthuc.trim();
        }

        if (noidung == '') {
            this.refs.content.style.borderColor = 'red';
            fail = true;
        }

        if (new Date(thoigianbatdau) >= new Date(thoigianketthuc)) {
            this.refs.startdate.style.borderColor = 'red';
            this.refs.enddate.style.borderColor = 'red';
            this.props.dispatch({
                type: 'ALERT_NOTIFICATION_ADD',
                content: 'Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc!',
                notifyType: 'warning',
            })
            fail = true;
        }

        if (this.state.checkList) {
            let _m = this.state.listMethod;
            let _checkQuyTrinh = false;
            _m.map((v, i) => {
                if (v.isEdit == true && v.name.trim() == '') {
                    v.isWrong = true;
                    fail = true;
                    _checkQuyTrinh = true;
                }
            })
            if (!_checkQuyTrinh) {
                _m.map((v, i) => {
                    v.isEdit = null;
                    v.isWrong = false;
                })
            }
            this.setState({
                listMethod: _m,
            })
        }

        if (!fail) {
            let query = 'INSERT INTO `quanlyhocsinh`.`TASKS` (`From`, `Title`, `Content`, `StartTime`, `EndTime`, `Files`, `Level`, `yeucaubaocao`, `parentTask`, `nhomcongviec`) VALUES (\'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\'); ';
            query = query.replace('!\?!', this.props.userInformation.account_id);
            query = query.replace('!\?!', ten);
            query = query.replace('!\?!', noidung);
            query = query.replace('!\?!', thoigianbatdau);
            query = query.replace('!\?!', thoigianketthuc);
            query = query.replace('!\?!', teptindinhkem);
            query = query.replace('!\?!', loaicongviec);
            query = query.replace('!\?!', yeucaubaocao);
            if (this.props.parentTask == null) {
                query = query.replace('!\?!', '');
            } else {
                query = query.replace('!\?!', this.props.parentTask);
            }
            query = query.replace('!\?!', nhomcongviec);
            query = query.replace(/\'null'/g, 'null');
            query = query.replace(/\''/g, 'null');

            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                fn : 'form_task_create_successfull',
                transaction: true,
                isSuccess: true,
                listIDsReloadNotification: IDs,
            });
        }
    }

    dongysua() {
        let fail = false;
        this.refs.title.style.borderColor = 'rgb(204, 204, 204)';
        this.refs.startdate.style.borderColor = 'rgb(204, 204, 204)';
        this.refs.enddate.style.borderColor = 'rgb(204, 204, 204)';
        this.refs.content.style.borderColor = 'rgb(204, 204, 204)';
        this.refs.yeucaubaocao.style.borderColor = 'rgb(204, 204, 204)';
        this.refs.files.style.borderColor = 'rgb(204, 204, 204)';
        this.refs.nhomcongviec.wrapper.getElementsByClassName('Select-control')[0].style.borderColor = 'rgb(204, 204, 204)';
        this.refs.nguoithuchien.wrapper.getElementsByClassName('Select-control')[0].style.borderColor = 'rgb(204, 204, 204)';

        let ten = this.refs.title.value.trim();
        let nhomcongviec = this.state.nhomcongviec;
        let loaicongviec = this.refs.loaicongviec.value;
        let nguoithuchien = this.state.nhanVien;
        let thoigianbatdau = this.refs.startdate.value.trim();
        let thoigianketthuc = this.refs.enddate.value.trim();
        let noidung = this.refs.content.value.trim();
        let yeucaubaocao = this.refs.yeucaubaocao.value.trim();
        let teptindinhkem = this.refs.files.value.trim();

        if (ten == '') {
            this.refs.title.style.borderColor = 'red';
            fail = true;
        }

        if (nhomcongviec == null) {
            this.refs.nhomcongviec.wrapper.getElementsByClassName('Select-control')[0].style.borderColor = 'red';
            fail = true;
        } else {
            nhomcongviec = nhomcongviec['value'];
        }

        let IDs = [];
        if (nguoithuchien == null || (nguoithuchien != null && nguoithuchien.length == 0)) {
            this.refs.nguoithuchien.wrapper.getElementsByClassName('Select-control')[0].style.borderColor = 'red';
            fail = true;
        } else {
            let a = '';
            for (let ng of nguoithuchien) {
                a += ng['label'] + ':';
                IDs.push(ng['value']);
            }
            nguoithuchien = a;
        }
        
        if (thoigianbatdau == '') {
            this.refs.startdate.style.borderColor = 'red';
            fail = true;
        } else {
            if (this.refs.starttime.value.trim() == '') {
                thoigianbatdau = thoigianbatdau + ' 00:00:00';
            } else {
                thoigianbatdau = thoigianbatdau + ' ' + this.refs.starttime.value;
            }
            thoigianbatdau = thoigianbatdau.trim();
        }

        if (thoigianketthuc == '') {
            this.refs.enddate.style.borderColor = 'red';
            fail = true;
        } else {
            if (this.refs.endtime.value.trim() == '') {
                thoigianketthuc = thoigianketthuc + ' 23:59:59';
            } else {
                thoigianketthuc = thoigianketthuc + ' ' + this.refs.endtime.value;
            }
            thoigianketthuc = thoigianketthuc.trim();
        }

        if (noidung == '') {
            this.refs.content.style.borderColor = 'red';
            fail = true;
        }

        if (new Date(thoigianbatdau) >= new Date(thoigianketthuc)) {
            this.refs.startdate.style.borderColor = 'red';
            this.refs.enddate.style.borderColor = 'red';
            this.props.dispatch({
                type: 'ALERT_NOTIFICATION_ADD',
                content: 'Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc!',
                notifyType: 'warning',
            })
            fail = true;
        }

        if (this.state.checkList) {
            let _m = this.state.listMethod;
            let _checkQuyTrinh = false;
            _m.map((v, i) => {
                if (v.isEdit == true && v.name.trim() == '') {
                    v.isWrong = true;
                    fail = true;
                    _checkQuyTrinh = true;
                }
            })
            if (!_checkQuyTrinh) {
                _m.map((v, i) => {
                    v.isEdit = null;
                    v.isWrong = false;
                })
            }
            this.setState({
                listMethod: _m,
            })
        }

        let d = this.props.editValue;
        let oldID = d['ID'];

        if (!fail) {
            let query = 'UPDATE `quanlyhocsinh`.`TASKS` SET `Title`=\'!\?!\', `Content`=\'!\?!\', `StartTime`=\'!\?!\', `EndTime`=\'!\?!\', `yeucaubaocao`=\'!\?!\', `Files`=\'!\?!\', `nhomcongviec`=\'!\?!\', `Level`=\'!\?!\' WHERE `ID`=\'!\?!\'; ';
            query = query.replace('!\?!', ten);
            query = query.replace('!\?!', noidung);
            query = query.replace('!\?!', thoigianbatdau);
            query = query.replace('!\?!', thoigianketthuc);
            query = query.replace('!\?!', yeucaubaocao);
            query = query.replace('!\?!', teptindinhkem);
            query = query.replace('!\?!', nhomcongviec);
            query = query.replace('!\?!', loaicongviec);
            query = query.replace('!\?!', oldID);
            query = query.replace(/\'null'/g, 'null');
            query = query.replace(/\''/g, 'null');

            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                fn : 'form_task_edit_successfull',
                transaction: true,
                isSuccess: true,
                listIDsReloadNotification: IDs,
            });
        }
    }

    close (success) {
        try {
            this.props.close(success);
        } catch (e) {
            
        }
    }

    render () {
        let thoigian = <datalist id="tast_create_thoigian">
            <option value="07:00:00"/>
            <option value="08:00:00"/>
            <option value="09:00:00"/>
            <option value="10:00:00"/>
            <option value="11:00:00"/>
            <option value="12:00:00"/>
            <option value="13:00:00"/>
            <option value="14:00:00"/>
            <option value="15:00:00"/>
            <option value="16:00:00"/>
            <option value="17:00:00"/>
            <option value="18:00:00"/>
            <option value="19:00:00"/>
            <option value="20:00:00"/>
            <option value="21:00:00"/>
            <option value="22:00:00"/>
            <option value="23:00:00"/>
        </datalist>
        let quytrinh = null;
        let bodywidth = {'width': '700px'};
        let bodystyle = null;

        if (this.state.checkList) {
            bodywidth = {
                'width': '1100px',
            }
            bodystyle = {
                'display': 'grid',
                'grid-template-columns': 'auto auto',
            }
            quytrinh = <div style={{
                'width': '380px',
                'margin': '10px',
                'border': '1px solid #888',
            }}>
                <div className="divformstyle">
                    <div style={{
                        'display': 'grid',
                        'grid-template-columns': 'auto 60px',
                    }}>
                            <input 
                                type="text" 
                                ref='addquytrinh' 
                                placeholder='--- Thêm quy trình ---' 
                                onKeyPress={this.onKeyPressQuyTrinh.bind(this)}
                            />
                            <input 
                                type="button" 
                                value="Thêm" 
                                onClick={this.onClickAddMethod.bind(this)} 
                                style={{'margin': '0 4px'}}
                            />
                    </div>
                </div>
                <div>                
                    <div style={{
                        'display': 'grid',
                        'grid-template-columns': '40% 60%',
                        'padding': '0',
                        'border-bottom': '1px solid #888',
                    }}>
                        <div className="unsetdivformstyle">
                            <Select
                                placeholder="null"
                                value={this.state.ngaychuky}
                                options={this.state.listngaychuky}
                                onChange={this.onChangeNgayChuKy.bind(this)}
                            />
                        </div>
                        <div className="unsetdivformstyle">
                            <Select
                                placeholder="Không có chu kỳ"
                                value={this.state.chuky}
                                options={this.state.listchuky}
                                onChange={this.onChangeChuKy.bind(this)}
                            />
                        </div>
                    </div>
                </div>
                <div className="divformstyle">
                    <div style={{
                        'padding': '0',
                        'overflow': 'auto',
                        'max-height': '669px',
                        'overflow-x': 'hidden',
                    }}>
                    {
                        this.state.listMethod.map((v, i) => {
                            let chuky = '';
                            if (v.chuky != null) {
                                chuky = ' (' + v.chuky + ')';
                            }
                            let editBody = {
                                'border': '1px solid #ccc',
                            }
                            if (v.isWrong) {
                                editBody = {
                                    'border': '1px solid red',
                                }
                            }

                            let disableStyle = {
                                'color': 'black',
                            }

                            if (v.isDisable == true) {
                                disableStyle = {
                                    'color': 'red',
                                    'text-decoration': 'line-through',
                                }
                            }

                            if (v.isEdit) {
                                return (
                                    <div  style={{
                                        'display': 'grid',
                                        'grid-template-columns': 'auto 60px',
                                    }}>
                                        <textarea 
                                            rows="4"
                                            cols="50"
                                            style={{...editBody, 'height' : '75px'}}
                                            value={v.name}
                                            onChange={this.onChangeEditQuyTrinh.bind(this, i)}
                                        ></textarea>
                                        <input 
                                            type="button" 
                                            value="Xong" 
                                            onClick={this.onClickDisableEditQuyTrinh.bind(this)}
                                            style={{'margin': '0 4px'}}
                                        />
                                    </div>
                                )
                            } else {
                                let btnDeleteQuyTrinh = <input 
                                    type="button" 
                                    value="Xóa" 
                                    onClick={this.onClickRemoveMethod.bind(this, i)}
                                    style={{'margin': '0 4px'}}
                                />
                                if (v.editData != null) {
                                    if (v.isDisable == true) {
                                        btnDeleteQuyTrinh = <input
                                            type="button" 
                                            value="Bỏ Hủy"
                                            onClick={this.onClickEnableMethod.bind(this, i)}
                                            style={{'margin': '0 4px'}}
                                        />
                                    } else {
                                        btnDeleteQuyTrinh = <input
                                            type="button" 
                                            value="Hủy"
                                            onClick={this.onClickDisableMethod.bind(this, i)}
                                            style={{'margin': '0 4px'}}
                                        />
                                    }
                                }
                                return(
                                    <div 
                                        style={{
                                            'display': 'grid',
                                            'grid-template-columns': 'auto 60px',
                                        }}
                                    >
                                        <input 
                                            type="text" 
                                            // disabled={true} 
                                            style={{...disableStyle, 'background': 'while'}}
                                            value={v.name + chuky}
                                            onClick={this.onClickEnableEditQuyTrinh.bind(this, i)}
                                        />
                                        {btnDeleteQuyTrinh}
                                    </div>
                                )
                            }
                        })
                    }
                    </div>
                </div>
            </div>
        }

        let title = 'Giao Việc';
        let btnOK = <input type="button" onClick={this.dongy.bind(this)} value="Đồng Ý"/>
        if (this.props.editValue != null) {
            btnOK = <input type="button" onClick={this.dongysua.bind(this)} value="Đồng Ý"/>
            title = 'Sửa Công Việc';
        }

        return (
            <div className={style.formstyle} ref="background" onClick={this.onFormClick.bind(this)}>
                <div className="form_body" ref="body" style={bodywidth}>
                    <div className="header">
                        { /*<img src="" alt="Icon Image"/> */}
                        <h2>{title}</h2>
                    </div>
                    <div className="body" style={bodystyle}>
                        <div>
                            <div className="divformstyle">
                                <div>
                                    <label for="">Tên Công Việc: </label>
                                    <input type="text" maxlength="300" ref='title'/>
                                </div>
                            </div>
                            <div className="unsetdivformstyle">
                                <Select
                                    name="Nhóm Công Việc"
                                    placeholder="--- Nhóm Công Việc ---"
                                    value={this.state.nhomcongviec}
                                    options={this.state.listNhomCongViec}
                                    onChange={this.onChangeNhomCongViec.bind(this)}
                                    ref="nhomcongviec"
                                />
                            </div>
                            <div className="divformstyle">
                                <div>
                                    <label for="">Loại công việc: </label>
                                    <select ref="loaicongviec">
                                        <option value="0">{'Bình Thường'}</option>
                                        <option value="1">{'Khẩn'}</option>
                                    </select>
                                </div>
                            </div>
                            <div className="unsetdivformstyle">
                                <Select
                                    name="Người Thực Hiện"
                                    placeholder="--- Người Thực Hiện Công Việc ---"
                                    value={this.state.nhanVien}
                                    options={this.state.listNhanVien}
                                    onChange={this.onChangeNguoiThucHien.bind(this)}
                                    multi
                                    ref="nguoithuchien"
                                />
                            </div>
                            <div style={{
                                'display': 'grid',
                                'grid-template-columns': '50% 50%',
                            }}>
                                <div>
                                    <div className="divformstyle">
                                        <div>                                
                                            <label for="">Thời Gian Bắt Đầu: </label>
                                            <input type="text" ref='starttime' list="tast_create_thoigian"/>
                                        </div>
                                        <div>                                
                                            <label for="">Ngày Bắt Đầu: </label>
                                            <input type="date" min={this.state.today} ref='startdate'/>
                                        </div>
                                    </div>
                                </div>

                                <div className="divformstyle">
                                    <div>                                
                                        <label for="">Thời Gian Kết Thúc: </label>
                                        <input type="text" ref='endtime' list="tast_create_thoigian"/>
                                    </div>
                                    <div>
                                        <label for="">Ngày Kết Thúc: </label>
                                        <input type="date" min={this.state.today} ref='enddate'/>
                                    </div>
                                </div>
                            </div>
                            <div className="divformstyle">
                                <div>
                                    <label for="">Nội dung công việc: </label>
                                    <textarea ref="content" rows="4" cols="50" style={{'height' : '200px'}}></textarea>
                                </div>
                                <div>
                                    <label for="">Yêu cầu báo cáo: </label>
                                    <textarea ref="yeucaubaocao" rows="4" cols="50" style={{'height' : '50px'}}></textarea>
                                </div>
                                <div>
                                    <label for="">Tệp tin đính kèm: </label>
                                    <textarea ref="files" rows="4" cols="50" style={{'height' : '50px'}}></textarea>
                                </div>
                            </div>
                            <div className="divformstyle">
                                <div>
                                    <label for="">Quy Trình: </label>
                                    <input 
                                        type="checkbox" 
                                        style={{'width': 'auto'}} 
                                        checked={this.state.checkList} 
                                        onChange={this.onChangeQuyTrinh.bind(this)}
                                    />
                                </div>
                            </div>
                        </div>
                        {quytrinh}
                        {thoigian}
                    </div>
                    <div className="footer">
                        <input type="button" onClick={this.close.bind(this)} value="Thoát"/>
                        {btnOK}
                    </div>
                </div>
            </div>
        )
    }
    
    onFormClick () {
        // let _m = this.state.listMethod;
        // _m.map((v, i) => {
        //     if (v.isEdit == true) {
        //         v.isEdit = null;
        //     }
        // })
        // this.setState({
        //     listMethod: _m,
        // })
    }

    onChangeNguoiThucHien (v) {
        this.setState({
            nhanVien: v,
        })
    }

    onChangeNhomCongViec (v) {
        this.setState({
            nhomcongviec: v,
        })
    }

    onChangeQuyTrinh () {
        this.setState({
            checkList: !this.state.checkList,
        })
    }

    onClickAddMethod () {
        this.refs.addquytrinh.style.borderColor = 'rgb(204, 204, 204)';
        let chuky = this.state.chuky;
        if (chuky != null) {
            chuky = chuky.value;
            if (this.state.ngaychuky != null) {
                chuky += ':' + this.state.ngaychuky.value;
            }
        }

        if (this.refs.addquytrinh.value != '') {
            let obj = {
                name: this.refs.addquytrinh.value,
                chuky: chuky,
            }
            this.setState({
                listMethod: this.state.listMethod.concat(obj),
                chuky: null,
                ngaychuky: null,
                listngaychuky: [],
            })
            this.refs.addquytrinh.value = '';
        } else {
            this.refs.addquytrinh.style.borderColor = 'red';
        }
    }

    onClickRemoveMethod (index) {
        let listMethod = this.state.listMethod;
        listMethod.splice(index, 1);
        this.setState({
            listMethod: listMethod,
        })
    }

    onClickDisableMethod (index) {
        let _m = this.state.listMethod;
        _m.map((v, i) => {
            if (i == index) {
                v.isDisable = true;
            }
        })
        this.setState({
            listMethod: _m,
        })
    }

    onClickEnableMethod (index) {
        let _m = this.state.listMethod;
        _m.map((v, i) => {
            if (i == index) {
                v.isDisable = false;
            }
        })
        this.setState({
            listMethod: _m,
        })
    }

    onKeyPressQuyTrinh (e) {
        if (e.which == 13) {
            this.onClickAddMethod();
        }
    }

    onChangeChuKy (v) {
        let listngaychuky = [];
        let ngaychuky = null;
        if (v != null) {
            if (v.value == 'w') {
                listngaychuky = [
                    {label: 'Thứ 2', value: '2'},
                    {label: 'Thứ 3', value: '3'},
                    {label: 'Thứ 4', value: '4'},
                    {label: 'Thứ 5', value: '5'},
                    {label: 'Thứ 6', value: '6'},
                    {label: 'Thứ 7', value: '7'},
                    {label: 'Chủ Nhật', value: '8'},
                ]
                ngaychuky = {label: 'Thứ 2', value: '2'};
            }
    
            if (v.value == 'm') {
                for (var i = 1; i <= 31; i++) {
                    listngaychuky.push({label: i, value: i});
                }
                ngaychuky = {label: 1, value: 1};
            }
        }

        this.setState({
            chuky: v,
            ngaychuky: ngaychuky,
            listngaychuky: listngaychuky,
        })
    }

    onChangeNgayChuKy (v) {
        if (this.state.chuky != null && (this.state.chuky.value == 'w' || this.state.chuky.value == 'm') && v == null) {
            return;
        }
        this.setState({
            ngaychuky: v,
        })
    }

    onClickEnableEditQuyTrinh (index) {
        let _m = this.state.listMethod;
        let fail = false;
        _m.map((v, i) => {
            if (v.isEdit == true && v.name.trim() == '') {
                v.isWrong = true;
                fail = true;
            }
        })
        if (!fail) {
            _m.map((v, i) => {
                if (i == index && v.isDisable != true) {
                    v.isEdit = true;
                } else {
                    v.isEdit = null;
                }
                v.isWrong = false;
            })
        }
        this.setState({
            listMethod: _m,
        })
    }

    onClickDisableEditQuyTrinh () {
        let _m = this.state.listMethod;
        let fail = false;
        _m.map((v, i) => {
            if (v.isEdit == true && v.name.trim() == '') {
                v.isWrong = true;
                fail = true;
            }
        })
        if (!fail) {
            _m.map((v, i) => {
                v.isEdit = null;
                v.isWrong = false;
            })
        }
        this.setState({
            listMethod: _m,
        })
    }

    onChangeEditQuyTrinh (index, element) {
        let _m = this.state.listMethod;
        _m.map((v, i) => {
            if (i == index) {
                v.name = element.target.value;
            }
        })
        this.setState({
            listMethod: _m,
        })
    }
}

module.exports = connect(function (state) {
    return {
      socket: state.socket,
    };
}) (Create);
