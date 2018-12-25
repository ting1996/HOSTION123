import React from 'react';
import { connect } from 'react-redux';
import style from '../style.css';
import mystyle from './mystyle.css';
var ReactDOM = require('react-dom');

import Select from 'react-select';
import Create from './Create';
import Report from './Report';
import ContextMenu from '../elements/ContextMenu';

class TaskManager extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            nhanVien: null,
            listNhanVien: [],
            justView: false,

            congviecgiao: [],
            baocao: [],
            isCreate: false,
            showValue: null,
            idReport: null,
            locationContextMenu: null,
            valueContextMenu: null,
            loadOldedTasks: false,

            toggleTasks: false,
            congviecnhan: [],
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
        if (hanhdong == 'laydulieu_trave') {
            if (dulieuguive != null) {
                switch (dulieuguive.fn) {
                    case 'task_taskmanager_loadtask':
                        let jobs = {};
                        let congviecgiao = [];
                        for (let row of rows) {
                            if (jobs[row['ID']] == null) {
                                congviecgiao.push(row);
                                jobs[row['ID']] = row;
                            }
                            if (jobs[row['ID']]['listStaff'] == null) {
                                jobs[row['ID']]['listStaff'] = [];
                            }
                            let isDeactivate = row['staffIsDeactivate'];
                            if (row['staffIsRetired'] != null) {
                                isDeactivate = 1;
                            }
                            // console.log(isDeactivate);
                            let obj = {
                                staffID: row['staffID'],
                                staffCode: row['staffCode'],
                                staffName: row['staffName'],
                                isDeactivate: isDeactivate,
                                isRead: row['isRead'],
                            }
                            jobs[row['ID']]['listStaff'].push(obj);
                        }
                        this.setState({congviecgiao: congviecgiao})
                        break;
                    case 'task_taskmanager_baocao':
                        this.setState({baocao: rows})
                        break;
                    case 'task_taskmanager_reload':
                        this.loadTasks();
                        break;
                    case 'form_taskmanager_loadnhanviencapduoi':
                        let listNhanVien = [];
                        for (let row of rows) {
                            let nhanVien = {label: row['Mã Quản Lý'] + ' - ' + row['Họ Và Tên'], data: row, value: row['Mã Quản Lý']};
                            listNhanVien.push(nhanVien);
                        }   
                        this.setState({
                            listNhanVien: listNhanVien,
                        })
                        break;
                    case 'task_taskmanager_loadtaskNhan': {
                        this.setState({congviecnhan: rows});
                    } break;
                    case 'task_taskmanager_makeIsRead': {
                        this.loadTasks();
                    }
                    default:
                }
            }
        }  
    }

    componentDidMount () {
        window.addEventListener("resize", this.changeSize);
        this.changeSize();
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
        this.loadTasks();
        let query = 'SELECT QUANLY.*, LOAIQUANLY.Permission, LOAIQUANLY.`Permission Allow` ' +
        'FROM QUANLY  ' +
        'LEFT JOIN LOAIQUANLY ON LOAIQUANLY.`Loại Quản Lý` = QUANLY.`Chức Vụ`  ' +
        'WHERE QUANLY.`Ngày Nghỉ` IS NULL  ' +
        'AND QUANLY.`Mã Quản Lý` != \'!\?!\' ' +
        'AND ((SELECT QUANLY.permission FROM QUANLY WHERE QUANLY.`Mã Quản Lý` = \'!\?!\') = LOAIQUANLY.`Permission Allow` ' +
        'OR LOAIQUANLY.`Permission Allow` LIKE CONCAT(\'% \', (SELECT QUANLY.permission FROM QUANLY WHERE QUANLY.`Mã Quản Lý` = \'!\?!\'), \'%\') ' +
        'OR LOAIQUANLY.`Permission Allow` LIKE CONCAT(\'%\', (SELECT QUANLY.permission FROM QUANLY WHERE QUANLY.`Mã Quản Lý` = \'!\?!\'), \' %\')) ' ;
        query = query.replace(/\!\?!/g, this.props.userInformation.account_id);
        if (this.props.userInformation.khuvuc != 'ALL') {
            let subq = 'AND (';
            for (let branch of this.props.userInformation.khuvuc.split(',')) {
                subq += 'QUANLY.`Cơ Sở` = \'!\?!\' OR QUANLY.`Cơ Sở` LIKE \'%,!\?!%\' OR QUANLY.`Cơ Sở` LIKE \'%!\?!,%\' OR ';
                subq = subq.replace(/\!\?!/g, branch);
            }
            subq = subq.substr(0, subq.length - ' OR '.length) + ') ';
            query += subq;
        }
        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'form_taskmanager_loadnhanviencapduoi',
        });
    }

    loadTasks () {
        let query;
        if (this.state.toggleTasks) {
            query = 'SELECT TASKS.*, TASKSASSIGN.`isRead`, QUANLY.`Họ Và Tên`, TASKSASSIGN.`ID` AS `assignID` FROM TASKSASSIGN ' +
            'LEFT JOIN TASKS ON TASKSASSIGN.`taskID` = TASKS.`ID` ' +
            'LEFT JOIN QUANLY ON TASKS.`From` = QUANLY.`Mã Quản Lý` ' +
            'WHERE TASKSASSIGN.`isDeactivate` = \'0\' ' +
            'AND TASKS.`isDeactivate` = \'0\' ' +
            'AND TASKSASSIGN.staffCode = \'!\?!\' ' +
            'AND TASKS.StartTime < CONVERT_TZ(NOW(), @@session.time_zone,\'+07:00\') ';
            if (!this.state.loadOldedTasks) {
                query += 'AND TASKS.EndTime > CONVERT_TZ(NOW(), @@session.time_zone,\'+07:00\') ';
            }
            if (this.state.nhanVien != null) {
                query = query.replace('!\?!', this.state.nhanVien.value);
                this.setState({justView: true});
            } else {
                query = query.replace('!\?!', this.props.userInformation.account_id);
                this.setState({justView: false});
            }
            query += 'ORDER BY TASKS.`StartTime` DESC ';
            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                fn : 'task_taskmanager_loadtaskNhan',
            });
        } else {
            query = 'SELECT TASKS.*, tb1.`staffCode`, tb1.`staffName`, tb1.`isRead`, tb1.`ID` AS `staffID`, tb1.`isDeactivate` AS `staffIsDeactivate`, tb1.`staffIsRetired` FROM TASKS ' +
            'LEFT JOIN (SELECT TASKSASSIGN.*, QUANLY.`Họ Và Tên` AS `staffName`, QUANLY.`Ngày Nghỉ` AS `staffIsRetired` FROM TASKSASSIGN ' +
            'LEFT JOIN QUANLY ON QUANLY.`Mã Quản Lý` = TASKSASSIGN.staffCode) AS tb1 ON TASKS.`ID` = tb1.`taskID` ' +
            // 'LEFT JOIN QUANLY ON QUANLY.`Mã Quản Lý` = `TASKS`.`From` ' +
            'LEFT JOIN `LOAICONGVIEC` ON `TASKS`.`Level` = `LOAICONGVIEC`.`ma` ' +
            'WHERE TASKS.`From` = \'!\?!\' AND TASKS.`isDeactivate` = \'0\' ';
            if (this.state.nhanVien != null) {
                query = query.replace('!\?!', this.state.nhanVien.value);
                this.setState({justView: true});
            } else {
                query = query.replace('!\?!', this.props.userInformation.account_id);
                this.setState({justView: false});
            }
            if (!this.state.loadOldedTasks) {
                query += 'AND TASKS.EndTime > CONVERT_TZ(NOW(), @@session.time_zone,\'+07:00\') ';
            }
            query += 'ORDER BY TASKS.`StartTime` DESC ';
            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                fn : 'task_taskmanager_loadtask',
            });
        }
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.changeSize);
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentDidUpdate(prevProps, prevState) {
        this.changeSize();

        if (prevState.nhanVien != this.state.nhanVien
        || prevState.loadOldedTasks != this.state.loadOldedTasks
        || prevState.toggleTasks != this.state.toggleTasks) {
            this.loadTasks();
        }
    }

    dongy () {
    }

    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    }

    render () {
        let stylecell = {
            'padding': '0',
            'text-align': 'center', 
        }

        let createFrom = '';
        let _contextMenu = ''
        if (this.state.justView != true && this.state.toggleTasks == false) {
            if (this.state.isCreate) {
                createFrom = 
                <Create
                    editValue={this.state.valueContextMenu}
                    close={this.onClickCloseCreate.bind(this)}
                    userInformation={this.props.userInformation}
                    listNhanVien={this.state.listNhanVien}
                />
            }
            
            if (this.state.locationContextMenu != null) {
                _contextMenu = 
                <ContextMenu
                    location={this.state.locationContextMenu}
                    menu={[
                        {label: 'Xóa', onClick: this.onRemoveTask.bind(this, this.state.valueContextMenu)},
                        {label: 'Sửa', onClick: this.onEditTask.bind(this, this.state.valueContextMenu)}
                    ]}
                />
            }
        }

        let reportFrom = '';
        let showValue = '';
        let data = this.state.showValue;
        if (data != null && this.state.toggleTasks == false) {
            if (this.state.idReport != null) {
                reportFrom = <Report 
                    close={this.onCloseReportView.bind(this)} 
                    viewID={this.state.idReport}
                    TaskID={data['ID']}
                />
            }
            let _nguoithuchien = data['listStaff'];
            showValue = <div>
                {/* thong tin task */}
                <div className="divformstyle">
                    <h2 style={{'margin': '0', 'margin-bottom': '5px'}}>
                        {data['Title']}
                    </h2>
                    <div style={{'font-weight': 'bold'}}>
                        {
                            _nguoithuchien.map((v) => {
                                let _c = ''
                                if (v['isRead'] == 1) {
                                    _c = 'green'
                                }
                                if (v.isDeactivate == 1) {
                                    return(
                                        <span>
                                            <span style={{'color': 'red', 'text-decoration': 'line-through'}}>{v['staffName'].trim()}</span>
                                            {', '}
                                        </span>
                                    )
                                } else {
                                    return(
                                        <span>
                                            <span style={{'color': _c}}>{v['staffName'].trim()}</span>
                                            {', '}
                                        </span>
                                    )
                                }
                            })
                        }
                    </div>
                    <div>
                        <label for="">Nội dung công việc: </label>
                        <textarea 
                            rows="4" 
                            cols="50" 
                            style={{'height' : '200px'}} 
                            value={data['Content']}
                            disabled={true}
                            className="read_only"
                        ></textarea>
                    </div>
                    <div>
                        <label for="">Yêu cầu báo cáo: </label>
                        <textarea 
                            rows="4" 
                            cols="50" 
                            style={{'height' : '60px'}} 
                            value={data['yeucaubaocao']}
                            disabled={true}
                            className="read_only"
                        ></textarea>
                    </div>
                    <div>
                        <label for="">Văn bản chỉ đạo: </label>
                        <a></a>
                    </div>
                    <div>
                        <fieldset style={{"padding": "0", }}>
                            <legend>Báo cáo: </legend>
                            {
                                this.state.baocao.map((v, i) => {
                                    let ngaybaocao = new Date(v['ngaybaocao']).toLocaleDateString('en-GB') + ' ' + new Date(v['ngaybaocao']).toLocaleTimeString();
                                    return (
                                        <div className={mystyle.baocaorows}
                                            style={{'padding': '0'}} 
                                            onClick={this.onRowsReportClick.bind(this, v['ID'])}
                                        >
                                            <div style={{
                                                'padding': '0',
                                            }}>
                                                {ngaybaocao}
                                            </div>
                                            <div style={{
                                                'padding': '0',
                                                'border-left': '1px solid #888',
                                            }}>
                                                {v['Họ Và Tên']}
                                            </div>
                                            <div style={{
                                                'padding': '0',
                                                'border-left': '1px solid #888',
                                            }}>
                                                {v['mucdohoanthanh']}
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </fieldset>
                    </div>
                </div>
            </div>
        } else if (data != null && this.state.toggleTasks) {
            showValue =
            <div>
                <div className="divformstyle">
                    <h2 style={{'margin': '0', 'margin-bottom': '5px'}}>
                        {data['Title']}
                    </h2>
                    <div style={{'font-weight': 'bold'}}>
                        {data['Họ Và Tên']}
                    </div>
                    <div>
                        <label for="">Nội dung công việc: </label>
                        <textarea 
                            rows="4" 
                            cols="50" 
                            style={{'height' : '200px'}} 
                            value={data['Content']}
                            disabled={true}
                            className="read_only"
                        ></textarea>
                    </div>
                    <div>
                        <label for="">Yêu cầu báo cáo: </label>
                        <textarea 
                            rows="4" 
                            cols="50" 
                            style={{'height' : '60px'}} 
                            value={data['yeucaubaocao']}
                            disabled={true}
                            className="read_only"
                        ></textarea>
                    </div>
                    <div>
                        <label for="">Văn bản chỉ đạo: </label>
                        <a></a>
                    </div>
                    <div>
                        <fieldset style={{"padding": "0", }}>
                            <legend>Báo cáo: </legend>
                            {
                                this.state.baocao.map((v, i) => {
                                    let ngaybaocao = new Date(v['ngaybaocao']).toLocaleDateString('en-GB') + ' ' + new Date(v['ngaybaocao']).toLocaleTimeString();
                                    return (
                                        <div className={mystyle.baocaorows}
                                            style={{'padding': '0'}} 
                                            onClick={this.onRowsReportClick.bind(this, v['ID'])}
                                        >
                                            <div style={{
                                                'padding': '0',
                                            }}>
                                                {ngaybaocao}
                                            </div>
                                            <div style={{
                                                'padding': '0',
                                                'border-left': '1px solid #888',
                                            }}>
                                                {v['Họ Và Tên']}
                                            </div>
                                            <div style={{
                                                'padding': '0',
                                                'border-left': '1px solid #888',
                                            }}>
                                                {v['mucdohoanthanh']}
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </fieldset>
                    </div>
                </div>
            </div>
        }

        let toggleTasks;
        let titleBtnToggle;
        if (this.state.toggleTasks == false) {
            titleBtnToggle = 'Công Việc Của Tôi';
            toggleTasks = 
            <div style={{
                'display': 'grid',
                'grid-template-columns': '60% 40%',
            }}>
                <div>
                    <div className={mystyle.header}>
                        <div>
                            {'STT'}
                        </div>
                        <div>
                            {'Tên công việc'}
                        </div>
                        <div>
                            {'Người thực hiện'}
                        </div>
                        <div>
                            {'Ngày bắt đầu'}
                        </div>
                        <div>
                            {'Ngày kết thúc'}
                        </div>
                        <div>
                            {'Tình trạng'}
                        </div>
                    </div>
                    <div 
                        style={{
                            'height': '600px',
                            'overflow-y': 'scroll',
                            'overflow-x': 'hidden',
                            'padding': '0',
                        }}
                    >
                    {
                        this.state.congviecgiao.map((v, i) => {
                            let nguoithuchien = v['listStaff'];
                            let countRead = 0;
                            for (let _n of nguoithuchien) {
                                if (_n['isRead'] == 1) {
                                    countRead += 1;
                                }
                            }
                            let start = new Date(v['StartTime']).toLocaleDateString('en-GB') + ' ' + new Date(v['StartTime']).toLocaleTimeString();
                            let end = new Date(v['EndTime']).toLocaleDateString('en-GB') + ' ' + new Date(v['EndTime']).toLocaleTimeString();
                            let fistcellcolor = 'blue';
                            if (v['Level'].toString() == '1') {
                                fistcellcolor = 'red';
                            }

                            let isread = <span>{countRead + '/' + nguoithuchien.length + ' đã xem'}</span>;
                            let statusColor = '';
                            if (countRead == nguoithuchien.length) {
                                statusColor = 'lightgreen'
                            }

                            return(
                                <div 
                                    className={mystyle.rows} 
                                    onClick={this.onRowsClick.bind(this, v)}
                                    onContextMenu={this.onRowsRightClick.bind(this, v)}
                                    style={{
                                        'background': statusColor,
                                    }}
                                >
                                    <div style={{
                                        ...stylecell,
                                        'border-left': '10px solid ' + fistcellcolor,
                                    }}>
                                        {i + 1}
                                    </div>
                                    <div style={stylecell}>
                                        {v['Title']}
                                    </div>
                                    <div style={{
                                        ...stylecell,
                                        'font-weight': 'bold',
                                    }}>
                                    {
                                        nguoithuchien.map((v) => {
                                            let _c = ''
                                            if (v['isRead'] == 1) {
                                                _c = 'green'
                                            }
                                            if (v.isDeactivate == 1) {
                                                return(
                                                    <span>
                                                        <span style={{'color': 'red', 'text-decoration': 'line-through'}}>{v['staffName'].trim()}</span>
                                                        {', '}
                                                    </span>
                                                )
                                            } else {
                                                return(
                                                    <span>
                                                        <span style={{'color': _c}}>{v['staffName'].trim()}</span>
                                                        {', '}
                                                    </span>
                                                )
                                            }
                                        })
                                    }
                                    </div>
                                    <div style={stylecell}>
                                        {start}
                                    </div>
                                    <div style={stylecell}>
                                        {end}
                                    </div>
                                    <div style={stylecell}>
                                        {isread}
                                    </div>
                                </div>
                            )
                        })
                    }
                    </div>
                </div>
                {showValue}
            </div>
        } else {
            titleBtnToggle = 'Công Việc Tôi Giao';
            toggleTasks = 
            <div style={{
                'display': 'grid',
                'grid-template-columns': '60% 40%',
            }}>
                <div>
                    <div className={mystyle.header}>
                        <div>
                            {'STT'}
                        </div>
                        <div>
                            {'Tên công việc'}
                        </div>
                        <div>
                            {'Người giao việc'}
                        </div>
                        <div>
                            {'Ngày bắt đầu'}
                        </div>
                        <div>
                            {'Ngày kết thúc'}
                        </div>
                        <div>
                            {'Tình trạng'}
                        </div>
                    </div>
                    <div 
                        style={{
                            'height': '600px',
                            'overflow-y': 'scroll',
                            'overflow-x': 'hidden',
                            'padding': '0',
                        }}
                    >
                    {
                        this.state.congviecnhan.map((v, i) => {
                            let nguoigiaoviec = v['Họ Và Tên'];
                            let start = new Date(v['StartTime']).toLocaleDateString('en-GB') + ' ' + new Date(v['StartTime']).toLocaleTimeString();
                            let end = new Date(v['EndTime']).toLocaleDateString('en-GB') + ' ' + new Date(v['EndTime']).toLocaleTimeString();
                            let fistcellcolor = 'blue';
                            if (v['Level'].toString() == '1') {
                                fistcellcolor = 'red';
                            }

                            let isread = <span></span>;
                            switch (v.isRead) {
                                case 1:
                                    isread = <span>Đã xem</span>
                                    break;
                                case -1:
                                    isread = <span>Mới cập nhật</span>
                                    break;
                                case 0:
                                    isread = <span>Chưa xem</span>
                                    break;
                            }

                            return(
                                <div 
                                    className={mystyle.rows} 
                                    onClick={this.onRowsClick.bind(this, v)}
                                    onContextMenu={this.onRowsRightClick.bind(this, v)}
                                    // style={{
                                    //     'background': statusColor,
                                    // }}
                                >
                                    <div style={{
                                        ...stylecell,
                                        'border-left': '10px solid ' + fistcellcolor,
                                    }}>
                                        {i + 1}
                                    </div>
                                    <div style={stylecell}>
                                        {v['Title']}
                                    </div>
                                    <div style={{
                                        ...stylecell,
                                        'font-weight': 'bold',
                                    }}>
                                        {nguoigiaoviec}
                                    </div>
                                    <div style={stylecell}>
                                        {start}
                                    </div>
                                    <div style={stylecell}>
                                        {end}
                                    </div>
                                    <div style={stylecell}>
                                        {isread}
                                    </div>
                                </div>
                            )
                        })
                    }
                    </div>
                </div>
                {showValue}
            </div>
        }
        return (
            <div className={style.formstyle} ref="background" onClick={this.onFormClick.bind(this)} onContextMenu={this.onFormContexMenu.bind(this)}>
                <div className="form_body" ref="body" style={{'width': '1100px'}}>
                    <div className="header">
                        { /*<img src="" alt="Icon Image"/> */}
                        <h2>Quản Lý Công Việc</h2>
                    </div>
                    <div className="body">
                        <div>
                            <div className="unsetdivformstyle">
                                <Select
                                    name=""
                                    placeholder="Xem như..."
                                    value={this.state.nhanVien}
                                    options={this.state.listNhanVien}
                                    onChange={this.onChangeViewPerson.bind(this)}
                                />
                            </div>
                            <div 
                                className="divformstyle"
                                style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                }}
                            >
                                <div>
                                    <input type='button' value='Thêm' onClick={this.onClickCreate.bind(this)}/>
                                </div>
                                <div>
                                    <input type='button' value={titleBtnToggle} onClick={() => {
                                        this.setState({
                                            toggleTasks: !this.state.toggleTasks,
                                            showValue: null,
                                        })
                                    }}/>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: 'blue',
                                    fontWeight: 'bold',
                                }}>
                                    Hiển thị những công việc đã kết thúc: 
                                    <input 
                                        type='checkbox'
                                        style={{width: '20px', height: '20px'}}
                                        onChange={() => {this.setState({loadOldedTasks: !this.state.loadOldedTasks})}}
                                    />
                                </div>
                            </div>
                            {toggleTasks}
                        </div>
                    </div>
                    <div className="footer">
                        <input type="button" onClick={this.close.bind(this)} value="Thoát"/>
                        <input type="button" onClick={this.dongy.bind(this)} value="Đồng Ý"/>
                    </div>
                </div>
                {createFrom}
                {reportFrom}
                {_contextMenu}
            </div>
        )
    }

    onFormClick () {
        this.setState({
            locationContextMenu: null,
        })
    }

    onFormContexMenu (e) {
        // e.preventDefault();
    }

    onChangeViewPerson (value) {
        this.setState({
            nhanVien: value,
        })
    }

    onClickCreate () {
        if (!this.state.justView && !this.state.toggleTasks) {
            this.setState({
                isCreate: true,
                valueContextMenu: null,
            })
        }
    }

    onClickCloseCreate (success) {
        this.setState({
            isCreate: false,
        })
        if (success == true) {
            this.loadTasks();
        }
    }

    onRowsClick (value) {
        this.setState({
            showValue: value,
        })
        let query = 'SELECT REPORTTASKS.*, `QUANLY`.`Họ Và Tên` FROM REPORTTASKS ' +
        'LEFT JOIN `QUANLY` ON `QUANLY`.`Mã Quản Lý` = `REPORTTASKS`.`maNhanVien` ' +
        'WHERE `taskID` = \'!\?!\'';
        query = query.replace('!\?!', value['ID']);
        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'task_taskmanager_baocao',
        });
        if (this.state.nhanVien == null && this.state.toggleTasks && value['isRead'] != 1) {
            query = 'UPDATE `TASKSASSIGN` SET `isRead` = \'1\' WHERE (`ID` = \'!\?!\') ';
            query = query.replace('!\?!', value['assignID']);
            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                fn : 'task_taskmanager_makeIsRead',
            });
        }
    }

    onRowsRightClick (value, e) {
        e.preventDefault();
        let pageX = e.pageX;
        let pageY = e.pageY;
        this.setState({
            locationContextMenu: {x: pageX, y: pageY},
            valueContextMenu: value,
        })
    }

    onRowsReportClick (value) {
        this.setState({
            idReport: value,
        })
    }

    onCloseReportView () {
        this.setState({
            idReport: null,
        })
    }

    onRemoveTask (value) {
        if (confirm("Bạn có chắc chắn muốn xóa công việc này ?")) {
            let query = 'UPDATE TASKS SET `isDeactivate`=\'1\' ' +
            'WHERE `ID` = \'!\?!\'';
            query = query.replace('!\?!', value['ID']);
            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                fn: 'task_taskmanager_reload',
                isSuccess: true,
            });
        }        
    }

    onEditTask (value) {
        this.setState({
            isCreate: true,
        })
    }
}

module.exports = connect(function (state) {
    return {
      socket: state.socket,
    };
}) (TaskManager);
