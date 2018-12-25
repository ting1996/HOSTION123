import React from 'react';
import { connect } from 'react-redux';
import style from './style.css';
var ReactDOM = require('react-dom');
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faAngleUp,
    faAngleDown,
    faHandHoldingHeart,
    faTasks,
    faClipboardCheck,
} from '@fortawesome/free-solid-svg-icons';

import CSKH from './notes/CSKH';
import Task from './notes/Task';
import Approve from './notes/Approve';

class Notification extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isShow: false,
            notificationList: [],
            isClickBackground: false,
            isClickContainer: false,
            fistload: false,
            _fistload: false,
        }
        this.callBackDataFormDatabase = this.callBackDataFormDatabase.bind(this);
        this.SocketEmit = this.SocketEmit.bind(this);
        this.callBackAllUpdate = this.callBackAllUpdate.bind(this);
        this.updateData = this.updateData.bind(this);
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

    callBackAllUpdate (data) {
        switch (data.fn) {
            case 'dailynotification':
                let dt = data.elements;
                if (this.props.permission == 'smod') {
                    for (let element of dt) {
                        if (element == 'chamsockhachhang') {
                            this.updateData(element);
                            element = '';
                        }
                    }
                }
                if (this.props.permission == 'mod') {
                    for (let element of dt) {
                        if (element == 'approve') {
                            this.updateData(element);
                            element = '';
                        }
                    }
                }
                if (data.IDs != null) {
                    let doit = false;                
                    for (let id of data.IDs) {
                        if (id == this.props.userInformation.account_id) {
                            doit = true;
                            break;
                        }
                    }
                    if (doit) {
                        for (let element of dt) {
                            if (element != '') {                            
                                this.updateData(element);
                            }
                        }
                    }
                }
                break;
            default:
        }
    }

    callBackDataFormDatabase ( rows, hanhdong, dulieuguive ) {
        if (hanhdong == 'laydulieu_trave') {
            if (dulieuguive != null) {
                switch (dulieuguive.fn) {
                    case 'notification_dailynotification_load':
                        let notificationList = this.state.notificationList;
                        let check = true;
                        for (let noti of notificationList) {
                            if (noti.label == dulieuguive.label) {
                                if (rows.length > 0) {
                                    noti.values = rows;
                                } else {
                                    notificationList.splice(notificationList.indexOf(noti), 1);
                                }
                                check = false;
                            }
                        }
                        if (check
                        && rows.length > 0) {
                            let obj = {...dulieuguive, values: rows}
                            notificationList.push(obj);
                        }
                        if (this.state.fistload == false 
                        && this.state._fistload == false
                        && notificationList.length > 0) {
                            this.setState({
                                isShow: true,
                                fistload: true,
                                _fistload: true,
                            })
                        }
                        this.setState({
                            notificationList: notificationList,
                        })
                        break;
                    default:
                        
                }
                
            }
        }  
    }

    componentDidMount () {
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
        this.props.socket.on('all-notification-update', this.callBackAllUpdate);
        this.updateData();
        try {
            this.props.getMe(this);
        } catch (error) {
            
        }
    }

    updateData (element = null) {
        let query;
        if (element == null
        || element == 'chamsockhachhang') {
            query = 'SELECT REPORTCSKH_VIEW.*, tb2.`Hình Ảnh` AS `senderImage` FROM REPORTCSKH_VIEW ' +
            'LEFT JOIN `QUANLY` AS tb2 ON tb2.`Mã Quản Lý` = `REPORTCSKH_VIEW`.`Mã Nhân Viên` ' +
            'WHERE REPORTCSKH_VIEW.`Mã Nhân Viên Phản Hồi` = \'!\?!\' AND REPORTCSKH_VIEW.`Nội Dung Phản Hồi` IS NULL; ';
            query = query.replace('!\?!', this.props.userInformation.account_id);            
            if (this.props.permission == 'smod') {
                query = 'SELECT REPORTCSKH_VIEW.*, tb2.`Hình Ảnh` AS `senderImage` FROM REPORTCSKH_VIEW ' +
                'LEFT JOIN `QUANLY` AS tb2 ON tb2.`Mã Quản Lý` = `REPORTCSKH_VIEW`.`Mã Nhân Viên` ' +
                'WHERE REPORTCSKH_VIEW.`Nội Dung Phản Hồi` IS NULL ' + 
                'AND (`Phân Loại Mức Độ` = \'1\' OR `Mức Độ Hài Lòng` = \'Nguy cơ nghỉ\' OR `Mức Độ Hài Lòng` = \'Không hài lòng nhưng chưa đến mức nghỉ\'); ';
            }
            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                fn: 'notification_dailynotification_load',
                element: 'chamsockhachhang',
                label: 'Chăm Sóc Khách Hàng',
                icon: faHandHoldingHeart,
            });
        }

        if (element == null
        || element == 'tasks') {
            query = 'SELECT TASKS.*, tb2.`Họ Và Tên` AS `senderName`, tb2.`Hình Ảnh` AS `senderImage`, tb1.`staffCode`, tb1.`staffName`, tb1.`isRead`, tb1.`ID` AS `tasksAssignID`  FROM TASKS ' +
            'LEFT JOIN (SELECT TASKSASSIGN.*, QUANLY.`Họ Và Tên` AS `staffName` FROM TASKSASSIGN ' +
            'LEFT JOIN QUANLY ON QUANLY.`Mã Quản Lý` = TASKSASSIGN.staffCode AND TASKSASSIGN.isDeactivate = \'0\') AS tb1 ON TASKS.`ID` = tb1.`taskID` ' +
            'LEFT JOIN `QUANLY` AS tb2 ON tb2.`Mã Quản Lý` = `TASKS`.`From` ' +
            'LEFT JOIN `LOAICONGVIEC` ON `TASKS`.`Level` = `LOAICONGVIEC`.`ma` ' +
            'WHERE tb1.`staffCode` = \'!\?!\' ' +
            'AND tb1.`isRead` != \'1\' ' +
            'AND TASKS.`StartTime` <= NOW() ' +
            'AND TASKS.`EndTime` >= NOW() ' +
            'AND TASKS.`isDeactivate` = \'0\'; ';
            query = query.replace('!\?!', this.props.userInformation.account_id);
            this.props.socket.emit('gui-query-den-database', query, 'laydulieu_trave', {
                fn: 'notification_dailynotification_load',
                element: 'tasks',
                label: 'Quản Lý Công Việc',
                icon: faTasks,
            });
        }

        if (element == null
        || element == 'approve') {
            query = 'SELECT APPROVE.*, tb2.`Họ Và Tên`, tb2.`Hình Ảnh` AS senderImage FROM APPROVE ' + 
            'LEFT JOIN `QUANLY` AS tb2 ON tb2.`Mã Quản Lý` = `APPROVE`.`requester` ' +
            'WHERE `isApproved` = \'0\' AND (`to` = \'!\?!\' OR `to` LIKE \'%,!\?!%\' OR `to` LIKE \'%!\?!,%\' ';
            query = query.replace(/!\?!/g, this.props.userInformation.account_id);
            let per = this.props.userInformation.permission.split(',');
            for (let p of per) {
                query += 'OR `to` = \'!\?!\' OR `to` LIKE \'%,!\?!%\' OR `to` LIKE \'%!\?!,%\' '.replace(/!\?!/g, p);
            }
            if (this.props.userInformation.khuvuc != 'ALL') {
                let br = this.props.userInformation.khuvuc.split(',');
                query += ') AND ('
                for (let b of br) {
                    query += '`branch` = \'!\?!\' OR `branch` LIKE \'%,!\?!%\' OR `branch` LIKE \'%!\?!,%\' OR '.replace(/!\?!/g, b);
                }
                query = query.substr(0, query.length - ' OR '.length);
            }            
            query += '); ';
            this.props.socket.emit('gui-query-den-database', query, 'laydulieu_trave', {
                fn: 'notification_dailynotification_load',
                element: 'approve',
                label: 'Xin Phép Xác Nhận',
                icon: faClipboardCheck,
            });
        }
    }

    componentWillUnmount() {
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
        this.props.socket.off('all-notification-update', this.callBackAllUpdate);
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.fistload != this.state._fistload) {
            this.setState({
                fistload: true,
                _fistload: true,
            })
        }

        if (this.state.isClickContainer) {
            if (!this.state.isClickBackground) {
                this.onClickShow();
            }
            this.setState({
                isClickBackground: false,
                isClickContainer: false,
            })
        }
    }

    render () {
        let btnShowhide = 
        <div className={style.btnshowhide} onClick={this.onClickShow.bind(this)}>
            <i class="fa fa-angle-double-left fa-2x" aria-hidden="true"/>
        </div>


        let styleContainer ={}
        let styleBackground = {}
        if (this.state.isShow == true) {
            btnShowhide = 
            <div className={style.btnshowhide} onClick={this.onClickShow.bind(this)}>
                <i class="fa fa-angle-double-right fa-2x" aria-hidden="true"/>
            </div>
            styleContainer.right = 0;
            styleBackground.right = 0;
            styleBackground.boxShadow = '#c782018f -1px 1px 8px';
        }

        let content = 
        <div style={{
            'padding': '10px',
            'font-size': 'large',
            'color': '#cc0202',
            'font-weight': 'bold',
        }}>
            Không có thông mới
        </div>
        if (this.state.notificationList.length > 0) {
            content = 
            <div>
                {
                    this.state.notificationList.map((v, i) => {
                        let fnClick = null;
                        let Note = null;
                        switch (v.element) {
                            case 'chamsockhachhang': {
                                fnClick = () => {
                                    $('#cskh').trigger('click');
                                    this.setState({isShow: false});
                                };
                                Note = (data, index) => {return(<CSKH data={data} index={index}></CSKH>)}
                            } break;
                            case 'tasks': {
                                fnClick = () => {
                                    $('#tasksmanager').trigger('click');
                                    this.setState({isShow: false});
                                };
                                Note = (data, index) => {return(<Task data={data} index={index}></Task>)}
                            } break;
                            case 'approve': {
                                fnClick = () => {
                                    // $('#tasksmanager').trigger('click');
                                    // this.setState({isShow: false});
                                };
                                Note = (data, index) => {                                    
                                    return(<Approve data={data} index={index} userInformation={this.props.userInformation}></Approve>)
                                }
                            } break;
                            default:                                
                        }
                        let showmore = null;
                        if (v.values.length > 3) {
                            let showmorecontent = <div>
                                <FontAwesomeIcon icon={faAngleDown}/>
                                {'  Xem nhiều hơn (' + (v.values.length - 3).toString() + ')'}
                            </div>
                            if (v.showmore == true) {
                                showmorecontent = <div>
                                    <FontAwesomeIcon icon={faAngleUp}/>
                                    {'  Xem ít hơn'}
                                </div>
                            }
                            showmore = 
                            <div style={{
                                'display': 'flex',
                                'align-items': 'center',
                                'justify-content': 'center',
                            }}>
                                <div 
                                    className={style.showmore}
                                    onClick={() => {
                                        let listno = this.state.notificationList;
                                        if (listno[i].showmore != true) {
                                            listno[i].showmore = true;
                                        } else {
                                            listno[i].showmore = false;
                                        }
                                        this.setState({
                                            notificationList: listno,
                                        })
                                    }}
                                >
                                    {showmorecontent}
                                </div>
                            </div>
                        }
                        if (fnClick != null
                        && Note != null) {
                            return (
                                <div className={style.dailynotification_notes}>
                                    <div className={style.header} onClick={fnClick}>
                                        <FontAwesomeIcon icon={v.icon}/>
                                        {'  ' + v.label}
                                    </div>
                                    <div>
                                        {
                                            v.values.map((v1, i1) => {
                                                let isrender = true;
                                                if (i1 > 2 && v.showmore != true) {
                                                    isrender = false;
                                                }
                                                if (isrender) {
                                                    return (
                                                        <div className={style.body}>
                                                            {Note(v1, i1)}
                                                        </div>
                                                    )
                                                }
                                            })
                                        }
                                    </div>
                                    {showmore}
                                </div>
                            )
                        } else {
                            return (<div></div>)
                        }
                    })
                }
            </div>
        }

        return (
            <div
                className={style.container}
                style={{...styleContainer}}
                onClick={() => {this.setState({isClickContainer: true});}}
            >
                <div 
                    className={style.dailynotification_background} 
                    style={{...styleBackground}}
                    onClick={() => {this.setState({isClickBackground: true});}}
                >
                    <div className={style.dailynotification_contents}>
                        {content}
                    </div>
                    <div className={style.dailynotification_button_outside}>
                        {btnShowhide}
                    </div>
                </div>
            </div>
        )
    }

    onClickShow () {        
        this.setState({
            isShow: !this.state.isShow,
        })
    }
}

module.exports = connect(function (state) {
    return {
      socket: state.socket,
    };
}) (Notification);
