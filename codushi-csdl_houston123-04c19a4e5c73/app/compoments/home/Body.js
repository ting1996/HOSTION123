import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';
import store from 'store';

import Table from '../form/elements/Table';
import FilterHouston from './filter/filterhouston';
import Navigation from './navigation/Navigation';
import Menu from './menu/Menu';
import HomePage from './homepage/HomePage';
import ContextMenu from '../form/elements/ContextMenu';
import AlertNotification from '../alertnotification/AlertNotification';
import StartupNotification from '../system/StartupNotification';
import Notification from '../notification/Notification';
import BranchSelector from '../form/elements/BranchSelector';

import mystyle from './bodystyle.css'

var time_countdown = 0;
function thongbaothanhcong() {
    $('.successed_function').show();
    if ( time_countdown <= 0 ) {
        time_countdown = 2;
        var timer2 = setInterval(function() {
            time_countdown--;
            if (time_countdown < 0) {
                clearInterval(timer2);
                $('.successed_function').hide();
            }
        }, 500);
    } else {
        time_countdown = 2;
    }
}

function Noofmonths(date1, date2) {
    var Nomonths;
    Nomonths= (date2.getFullYear() - date1.getFullYear()) * 12;
    Nomonths-= date1.getMonth() + 1;
    Nomonths+= date2.getMonth() +1; // we should add + 1 to get correct month number
    return Nomonths <= 0 ? 0 : Nomonths;
}

function lamtron (number) {
    let phanngan = Math.floor(number / 1000) * 1000;
    let phandu = number - phanngan;

    if (phandu >= 500) {
        phanngan = phanngan + 1000;
    }

    return phanngan;
}

class Body extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            btnAllDisable: false,
            btnCloseDisable: false,
            btnAgreeDisable: false,
            isShowMenu: false,
            isShowBranchSelecter: false,
            isShowStartupNotification: true,
            loadNotification: false,
            locationContextMenu: null,
            functionContextMenu: null,
            isShowContext: false,
            view: 'homepage',
            title: 'Trang Chủ',
            userInformation: null,
            _userInformation: null,
            menuSelected: null,
            actionAllow: [],
            _actionAllow: [],
            data: null,
            header: null,
            tableHeight: 'calc(100%)',
            pageStatus: null,
            branch: null,
            _branch: null,
            branchName: null,
            filterData: null,
            setFilter: false,
            filterHeight: 0,
            visible: false,
            visiblenext: false,
            visibleback: false,
            pageControlHeight: 0,
            LimitStart: 0,
            LimitRows: 50,
            options: null,
            moreTablesInfo: {},
        }
        this.callBackDataFormDatabase = this.callBackDataFormDatabase.bind(this);
        this.callBackWebDav = this.callBackWebDav.bind(this);
        this.callBackRenameSocketSuccessfull = this.callBackRenameSocketSuccessfull.bind(this);
        this.SocketEmit = this.SocketEmit.bind(this);
        this.value = this.value.bind(this);
        this.windowClick = this.windowClick.bind(this);
        this.windowContextMenu = this.windowContextMenu.bind(this);
    }

    SocketEmit () {
        if (arguments[0] == 'gui-query-den-database') {
            $('.loading').show();
        }

        if (arguments[2] == 'laydulieu_trave') {
            if (arguments[3] != null
            && arguments[3].fn == 'home_body_showTable') {
                if (arguments[3].isLimit) {
                    arguments[1] += ' LIMIT ' + arguments[3].LimitStart + ', ' + arguments[3].LimitRows;
                }                
                if (arguments[3].subQuery != null) {
                    arguments[1] += '; ' + arguments[3].subQuery;
                }
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

    callBackDataFormDatabase (rows, hanhdong, dulieuguive, loi) {
        $('.loading').hide();
        let query;
        switch (hanhdong) {
            case 'laydulieu_trave': {
                if (dulieuguive != null){
                    switch (dulieuguive.fn) {
                        case 'home_body_loadsualichday':{

                        }break;
                        case 'home_body_showTable': {
                            let data = rows;
                            if (rows[0] != null && Array.isArray(rows[0])) {
                                data = rows[0];
                            }
                            if (data == null || data.length == 0) {
                                if (dulieuguive.isFilter) {
                                    this.setState({
                                        visible: false,
                                    });
                                    store.dispatch({
                                        type: 'ALERT_NOTIFICATION_ADD',
                                        content: 'Không có dữ liệu được lọc!',
                                        notifyType: 'warning',
                                    })
                                } else {
                                    this.value([]);
                                    store.dispatch({
                                        type: 'ALERT_NOTIFICATION_ADD',
                                        content: 'Không tìm thấy dữ liệu trong Database!',
                                        notifyType: 'warning',
                                    })
                                }
                            } else {
                                let visible = dulieuguive.isLimit;
                                let visiblenext = true;
                                if (visible && data.length < dulieuguive.LimitRows) {
                                    visiblenext = false;
                                }                
                                let visibleback = true;
                                if (visible && dulieuguive.LimitStart == 0) {
                                    visibleback = false;
                                }
    
                                if (dulieuguive.numberOfRows != null) {
                                    let endPage = dulieuguive.LimitStart + dulieuguive.LimitRows;
                                    if (endPage >= dulieuguive.numberOfRows) {
                                        endPage = dulieuguive.numberOfRows;
                                        visiblenext = false;
                                    }
                                    this.setState({pageStatus: {
                                        total: dulieuguive.numberOfRows,
                                        start: dulieuguive.LimitStart + 1,
                                        end: endPage,
                                    }})
                                } else {
                                    this.setState({pageStatus: null})
                                }
                
                                this.setState({
                                    visible,
                                    visiblenext,
                                    visibleback,
                                });
                                this.value(rows, dulieuguive);
                            }
                        } break;
                        case 'home_body_executeQuery': {
                            if (rows[0] != null) {
                                let dataLength = rows[0].COUNT
                                dulieuguive.data.numberOfRows = dataLength;
                                if (dataLength > this.state.LimitRows) {
                                    dulieuguive.data.isLimit = true;
                                } else {
                                    dulieuguive.data.isLimit = false;
                                }
                                let isFilter = false;
                                if (dulieuguive.data.isFilter) {
                                    isFilter = true;
                                }
    
                                let LimitStart = 0;
                                let pagelength = dataLength;
                                let startAtEndPage = (Math.floor(pagelength/Number(this.state.LimitRows)) * Number(this.state.LimitRows));
                                if (dulieuguive.data.LimitStart != null) {
                                    LimitStart = dulieuguive.data.LimitStart;
                                }                                
                                
                                this.SocketEmit('gui-query-den-database', dulieuguive.data.showQuery, 'laydulieu_trave', {
                                    fn: 'home_body_showTable',
                                    numberOfRows: dataLength,
                                    isLimit: dulieuguive.data.isLimit,
                                    LimitStart: LimitStart,
                                    LimitRows: this.state.LimitRows,
                                    isFilter: isFilter,
                                    showQuery: dulieuguive.data.showQuery,
                                    subQuery: dulieuguive.data.subQuery,
                                    additionalConditional: dulieuguive.data.additionalConditional,
                                });
    
                                this.setState({
                                    LimitStart: LimitStart,
                                    options: dulieuguive.data,
                                })
                            } else {
                                this.setState({
                                    data: null,
                                })
                            }
                        } break;
                        case 'home_body_countQuery': {
                            if (rows[0] != null) {                    
                                this.props.socket.emit('gui-query-den-database', rows[0]['query'], 'laydulieu_trave', {
                                    fn: 'home_body_executeQuery',
                                    data: dulieuguive.data,
                                });
                            }
                        } break;
                        case 'home_body_getUserInformation': {
                            let branch = null;
                            if (rows.length > 0
                            && rows[0][0] != null
                            && rows[0][0].available == 1) {
                                let khuvuc = rows[0][0].khuvuc.split(',');                                
                                if ($.cookie('khuvuc') != null) {
                                    let val = $.cookie('khuvuc').split('|');
                                    if (val[0] != 'ALL'
                                    && val[0] != 'undefined'
                                    && val[1] == $.cookie('userid') 
                                    ) {
                                        if (khuvuc.indexOf(val[0]) != -1 || khuvuc[0] == 'ALL') {
                                            branch = val[0];
                                        } else {
                                            $.cookie('khuvuc', khuvuc[0] + '|' + $.cookie('userid'));
                                            branch = khuvuc[0];
                                        }
                                    } else {
                                        if (khuvuc[0] == 'ALL' || khuvuc.length > 1) {
                                            this.setState({isShowBranchSelecter: true,});
                                        } else {
                                            $.cookie('khuvuc', khuvuc[0] + '|' + $.cookie('userid'));
                                            branch = khuvuc[0];
                                        }
                                    }
                                } else {
                                    if (khuvuc[0] == 'ALL' || khuvuc.length > 1) {
                                        this.setState({isShowBranchSelecter: true,});
                                    } else {
                                        $.cookie('khuvuc', khuvuc[0] + '|' + $.cookie('userid'));
                                        branch = khuvuc[0];
                                    }
                                }
                                
                                this.setState({
                                    userInformation: {...rows[0][0]},
                                    _userInformation: {...rows[0][0]},
                                    branch: branch,
                                    _branch: branch,
                                    loadNotification: true,
                                    moreTablesInfo: {
                                        ...this.state.moreTablesInfo, 
                                        danhsachmonhoc: rows[1],
                                        chuongtrinhkhac: rows[2],
                                        chuongtrinhhocbosung: rows[3],
                                    },
                                })

                                this.props.dispatch({
                                    type: 'USER_INFORMATION_SET',
                                    data: {...rows[0][0], branch: branch},
                                })
                            } else {
                                window.location.replace('/dangxuat');
                            }
                        } break;
                        case 'home_body_getUserInformationWithbranch': {
                            this.setState({
                                moreTablesInfo: {
                                    ...this.state.moreTablesInfo,
                                    bieuphimonhoc: rows,
                                }
                            })
                        } break;
                        case 'home_body_getBranchName': {
                            if (rows[0] != null) {
                                this.setState({branchName: rows[0].name});
                                this.props.dispatch({
                                    type: 'USER_INFORMATION_BRANCH',
                                    branch: this.state.branch,
                                })
                            }                            
                            query = 'SELECT * FROM MONHOC_!\?!; ';
                            query = query.replace('!\?!', this.state.branch);
                            this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
                                fn: 'home_body_getUserInformationWithbranch',
                            });
                        } break;

                        //Edit
                        case 'home_body_loadsuauser': {
                            let SuaUser = require('../form/hocsinh/ghidanh/GhiDanh');
                            ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                            ReactDOM.render(
                                <Provider store={store}>
                                    <SuaUser action="edit" data={rows}/>
                                </Provider>,
                                document.getElementById('form-react')            
                            );
                        } break;
                        case 'home_body_loadsuaquanly': {
                            if (rows[0] != null) {
                                let accept = false;
                                if (rows[0]['Permission Allow'] != null) {
                                    let listPer = rows[0]['Permission Allow'].split(' ');
                                    for (let per of listPer) {
                                        if (per == $('.permission').attr('value')) {
                                            accept = true;
                                            break;
                                        }
                                    }
                                }
                                if (accept) {
                                    if (this.state.userInformation != null && this.state.userInformation.khuvuc != null) {
                                        let QLEdit = require('../form/staff/Staff');
                                        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                                        ReactDOM.render(
                                            <Provider store={store}>
                                                <QLEdit
                                                    listBranch={this.state.userInformation.khuvuc.split(',')}
                                                    data={rows[0]}
                                                />
                                            </Provider>,
                                            document.getElementById('form-react')            
                                        );
                                    }
                                } else {
                                    store.dispatch({
                                        type: 'ALERT_NOTIFICATION_ADD',
                                        content: 'Bạn không có quyền chỉnh sửa nội dung này!',
                                        notifyType: 'warning',
                                    });
                                }
                            } else {
                                store.dispatch({
                                    type: 'ALERT_NOTIFICATION_ADD',
                                    content: 'Lỗi lấy dữ liệu của quản lý!',
                                    notifyType: 'error',
                                });
                            }
                        } break;
                        case 'home_body_loadsuagiaovien': {
                            if (rows[0] != null) {
                                if (this.state.userInformation != null && this.state.userInformation.khuvuc != null) {
                                    let GVEdit = require('../form/staff/Staff');
                                    ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                                    ReactDOM.render(
                                        <Provider store={store}>
                                            <GVEdit
                                                listBranch={this.state.userInformation.khuvuc.split(',')}
                                                data={rows[0]}
                                                add={'giaovien'}
                                            />
                                        </Provider>,
                                        document.getElementById('form-react')            
                                    );
                                }
                            } else {
                                store.dispatch({
                                    type: 'ALERT_NOTIFICATION_ADD',
                                    content: 'Lỗi lấy dữ liệu của giáo viên!',
                                    notifyType: 'error',
                                });
                            }
                        } break;
                        case 'home_body_loadsuatoroi': {
                            rows = rows[0];
                            if (rows != null) {
                                let SuaPhatToRoi = require('../form/marketing/BangRonToRoi');
                                ReactDOM.render(
                                    <Provider store={store}>
                                        <SuaPhatToRoi title='Sửa Phát Tờ Rơi' type='toroi' action='edit' data={rows}/>
                                    </Provider>,
                                    document.getElementById('form-react')            
                                );
                            }
                        } break;
                        case 'home_body_loadsuabangron': {
                            rows = rows[0];
                            if (rows != null) {
                                let SuaBangRon = require('../form/marketing/BangRonToRoi');
                                ReactDOM.render(
                                    <Provider store={store}>
                                        <SuaBangRon title='Sửa Treo Băng Rôn' type='bangron' action='edit' data={rows}/>
                                    </Provider>,
                                    document.getElementById('form-react')            
                                );
                            }
                        } break;
                        case 'home_body_loadsuadituvan': {
                            let EditDataTuvan = require('../form/marketing/data/ThemData');
                            ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                            ReactDOM.render(
                                <Provider store={store}>
                                    <EditDataTuvan
                                        action="edit"
                                        data={rows[0]}
                                        title="Data Đi Tư Vấn"
                                    />
                                </Provider>,
                                document.getElementById('form-react')            
                            );
                        } break;
                        case 'home_body_loadsuadulieutruongtiemnang': {
                            let EditData = require('../form/marketing/data/ThemData');
                            ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                            ReactDOM.render(
                                <Provider store={store}>
                                    <EditData
                                        action="edit"
                                        data={rows[0]}
                                        title="Data Tổng"
                                    />
                                </Provider>,
                                document.getElementById('form-react')            
                            );
                        } break;
                        case 'home_body_loadsuadatadangkyhangngay': {
                            let EditDKHN = require('../form/chamsockhachhang/dangkyhangngay/ThemDangKyHangNgay');
                            ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                            ReactDOM.render(
                                <Provider store={store}>
                                    <EditDKHN action="edit" data={rows[0]}/>
                                </Provider>,
                                document.getElementById('form-react')            
                            );
                        } break;
                        case 'home_body_loadsualophoc': {
                            let LopHoc = require('../form/lophoc/LopHoc');
                            ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                            ReactDOM.render(
                                <Provider store={store}>
                                    <LopHoc
                                        action="edit"
                                        data={rows[0]}
                                    />
                                </Provider>,
                                document.getElementById('form-react')            
                            );
                        } break;

                        //Deactivate
                        case 'home_body_loadnghiquanly': {
                            if (rows[0] != null) {
                                let QLNghi = require('../form/nghi/Nghi');
                                ReactDOM.render(
                                    <Provider store={store}>
                                        <QLNghi 
                                            name={rows[0]['Họ Và Tên']}
                                            id={rows[0]['Mã Quản Lý']}
                                            menuSelected={this.state.menuSelected}
                                        />
                                    </Provider>
                                    , document.getElementById('form-react')
                                );
                            } else {
                                store.dispatch({
                                    type: 'ALERT_NOTIFICATION_ADD',
                                    content: 'Bạn không có quyền chỉnh sửa nội dung này!',
                                    notifyType: 'warning',
                                });
                            }
                        } break;

                        //Dang Ky Mon Hoc
                        case 'home_body_loaddangkymonhoc': {
                            let DangKyMonHoc = require('../form/hocsinh/dangkymonhoc/DangKyMonHoc');
                            ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                            ReactDOM.render(
                                <Provider store={store}>
                                    <DangKyMonHoc 
                                        data={rows[0]}
                                    />
                                </Provider>,
                                document.getElementById('form-react')            
                            );
                        } break;

                        //Hoc phi
                        case 'home_body_loadthuphikhac': {
                            if (rows[1].length > 0) {
                                store.dispatch({
                                    type: 'ALERT_NOTIFICATION_ADD',
                                    content: 'Khách hàng đang được xin phép hủy phiếu thu nên không thể tạo phiếu thu!',
                                    notifyType: 'warning',
                                })
                            } else {
                                rows = rows[0];
                                let PhieuThu = require('../form/hoadon/phieuthu/PhieuThu');
                                ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                                ReactDOM.render(
                                    <Provider store={store}>
                                        <PhieuThu 
                                            data={rows[0]}
                                            action='pay'
                                            type='student'
                                        />
                                    </Provider>,
                                    document.getElementById('form-react')
                                );
                            }
                        } break;
                        case 'home_body_loaddonghocphi': {
                            if (rows[1].length > 0) {
                                store.dispatch({
                                    type: 'ALERT_NOTIFICATION_ADD',
                                    content: 'Khách hàng đang được xin phép hủy phiếu thu nên không thể tạo phiếu thu!',
                                    notifyType: 'warning',
                                })
                            } else {
                                rows = rows[0];
                                let PhieuThuHocPhi = require('../form/hoadon/phieuthu/PhieuThuHocPhi');
                                ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                                ReactDOM.render(
                                    <Provider store={store}>
                                        <PhieuThuHocPhi 
                                            action="pay" 
                                            data={rows[0]}
                                        />
                                    </Provider>,
                                    document.getElementById('form-react')            
                                );
                            }
                        } break;

                        //Call
                        case 'home_body_checkgoidataisBusy': {
                            if (rows[0] == null) {
                                store.dispatch({
                                    type: 'ALERT_NOTIFICATION_ADD',
                                    content: 'Không tìm thấy dữ liệu từ hệ thống!',
                                    notifyType: 'error',
                                })
                            } else if (rows[0]['isDeactivate'] == 0) {
                                if (rows[0]['isBusy'] == 1
                                && rows[0]['callerID'] != this.state.userInformation.account_id
                                && rows[0]['expires_on'] != null
                                && rows[0]['now'] != null
                                && new Date(rows[0]['expires_on']) >= new Date(rows[0]['now'])) {
                                    store.dispatch({
                                        type: 'ALERT_NOTIFICATION_ADD',
                                        content: 'Dữ liệu này đang được gọi bởi !\?!, vui lòng chọn lại sau!'.replace('!\?!', rows[0]['callerID'] + ' - ' + rows[0]['callerName']),
                                        notifyType: 'warning',
                                    })
                                } else {
                                    let id = dulieuguive.id;
                                    let fnCallwasCalled = dulieuguive.fnCallwasCalled;
                                    switch (fnCallwasCalled) {
                                        case 'home_body_loadgoicskh':
                                            query = 'SELECT CHAMSOCKHACHHANG.*, QUANLY.`Họ Và Tên` AS `Họ Tên Nhân Viên` FROM CHAMSOCKHACHHANG ' +
                                            'LEFT JOIN USERS ON USERS.`User ID` = CHAMSOCKHACHHANG.`User ID` ' +
                                            'LEFT JOIN QUANLY ON QUANLY.`Mã Quản Lý` = CHAMSOCKHACHHANG.`Mã Nhân Viên` ' +
                                            'WHERE USERS.`ID` = \'!\?!\'; ';
                                            query = query.replace('!\?!', id);
                                            query += 'UPDATE `USERS` SET `isBusy` = \'0\', `expires_on` = NULL, `callerID` = NULL WHERE (`ID` = \'!\?!\'); ';
                                            query = query.replace('!\?!', id);
                                            break;
                                        case 'home_body_loadgoidata':
                                        case 'home_body_loadgoidituvan':
                                            query = 'SELECT CALLDATA.*, QUANLY.`Họ Và Tên` AS `Họ Tên Nhân Viên` FROM CALLDATA ' +
                                            'LEFT JOIN QUANLY ON QUANLY.`Mã Quản Lý` = CALLDATA.`Mã Nhân Viên` ' +
                                            'WHERE `ID-DATA` = \'!\?!\'; ';
                                            query = query.replace('!\?!', id);
                                            query += 'UPDATE `DATA_TRUONGTIEMNANG` SET `isBusy` = \'0\', `expires_on` = NULL, `callerID` = NULL WHERE (`ID` = \'!\?!\'); ';
                                            query = query.replace('!\?!', id);
                                            break;
                                        default:
                                    }
                                    this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                                        fn: fnCallwasCalled,
                                        id: id,
                                    });
                                }
                            } else {
                                store.dispatch({
                                    type: 'ALERT_NOTIFICATION_ADD',
                                    content: 'Học sinh đang học tại Houston123 vui lòng không gọi trong dữ liệu data!',
                                    notifyType: 'warning',
                                })
                            }
                        } break;
                        case 'home_body_checkgoidangkyhangngayisBusy': {
                            if (rows[0] == null) {
                                store.dispatch({
                                    type: 'ALERT_NOTIFICATION_ADD',
                                    content: 'Không tìm thấy dữ liệu từ hệ thống!',
                                    notifyType: 'error',
                                })
                            } else if (rows[0]['isDeactivate'] == 0) {
                                if (rows[0]['isBusy'] == 1) {
                                    store.dispatch({
                                        type: 'ALERT_NOTIFICATION_ADD',
                                        content: 'Dữ liệu này đang được gọi bởi một ai đó, vui lòng chọn lại sau!',
                                        notifyType: 'warning',
                                    })
                                } else {
                                    let id = dulieuguive.id;
                                    query = 'SELECT CALLDANGKYHANGNGAY.*, QUANLY.`Họ Và Tên` AS `Họ Tên Nhân Viên` FROM quanlyhocsinh.CALLDANGKYHANGNGAY ' +
                                    'LEFT JOIN quanlyhocsinh.QUANLY ON QUANLY.`Mã Quản Lý` = CALLDANGKYHANGNGAY.`Mã Nhân Viên` ' +
                                    'WHERE `ID-DATA` = \'?\''
                                    query = query.replace('?', id);
                                    this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                                        fn: 'home_body_checkgoidangkyhangngay',
                                        id: id,
                                    });
                                }
                            } else {
                                store.dispatch({
                                    type: 'ALERT_NOTIFICATION_ADD',
                                    content: 'Học sinh đang học tại Houston123 vui lòng không gọi trong dữ liệu data!',
                                    notifyType: 'warning',
                                })
                            }
                        } break;
                        case 'home_body_checkgoichamsockhachhangcuisBusy': {
                            if (rows[0] == null) {
                                store.dispatch({
                                    type: 'ALERT_NOTIFICATION_ADD',
                                    content: 'Không tìm thấy dữ liệu từ hệ thống!',
                                    notifyType: 'error',
                                })
                            } else if (rows[0]['isDeactivate'] == 0) {
                                if (rows[0]['Ngày Nghỉ Học'] != null) {
                                    if (rows[0]['isBusy'] == 1) {
                                        store.dispatch({
                                            type: 'ALERT_NOTIFICATION_ADD',
                                            content: 'Dữ liệu này đang được gọi bởi một ai đó, vui lòng chọn lại sau!',
                                            notifyType: 'warning',
                                        })
                                    } else {
                                        let id = dulieuguive.id;
                                        query = 'SELECT CALLCHAMSOCKHACHHANGCU.*, QUANLY.`Họ Và Tên` AS `Họ Tên Nhân Viên` FROM quanlyhocsinh.CALLCHAMSOCKHACHHANGCU ' +
                                        'LEFT JOIN quanlyhocsinh.QUANLY ON QUANLY.`Mã Quản Lý` = CALLCHAMSOCKHACHHANGCU.`Mã Nhân Viên` ' +
                                        'WHERE `User ID` = \'?\''
                                        query = query.replace('?', id);
                                        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                                            fn: 'home_body_checkgoichamsockhachhangcu',
                                            id: id,
                                        });
                                    }
                                } else {
                                    store.dispatch({
                                        type: 'ALERT_NOTIFICATION_ADD',
                                        content: 'Học sinh đã đi học lại, vui lòng không gọi trong cskh cũ!',
                                        notifyType: 'warning',
                                    })
                                }
                            } else {
                                store.dispatch({
                                    type: 'ALERT_NOTIFICATION_ADD',
                                    content: 'Học sinh đã được chuyển qua bộ phận ghi danh vui lòng không gọi trong cskh cũ!',
                                    notifyType: 'warning',
                                })
                            }
                        } break;
                        case 'home_body_loadgoicskh': {
                            this.loadthemGoiChamSocKhachHang(dulieuguive.id, rows[0]);
                        } break;
                        case 'home_body_loadgoidata': {
                            this.loadthemGoiDienData(dulieuguive.id, rows[0]);
                        } break;
                        case 'home_body_loadgoidituvan': {
                            this.loadthemGoiDienTuVan(dulieuguive.id, rows[0])
                        } break;
                        case 'home_body_checkgoidangkyhangngay': {
                            this.loadthemGoiDangKyHangNgay(dulieuguive.id, rows);
                        } break;
                        case 'home_body_checkgoichamsockhachhangcu': {
                            this.loadthemGoiChamSocKhachHangCu(dulieuguive.id, rows)
                        } break;

                        //Information
                        case 'home_body_information_loadbangthongtin': {
                            let bangthongtin = {};
                            for (let value of rows) {
                                if (bangthongtin[value['Type']] == null) {
                                    bangthongtin[value['Type']] = [{value: value['Content'], label: value['Content']}];
                                } else {
                                    bangthongtin[value['Type']].push({value: value['Content'], label: value['Content']});
                                }                            
                            }
                            let InfoCall = require('../form/information/call/CallInformation');
                            ReactDOM.render(
                                <Provider store={store}>
                                    <InfoCall
                                        id={dulieuguive.id}
                                        bangthongtin={bangthongtin}
                                        row={dulieuguive.row}
                                    />
                                </Provider>,
                                document.getElementById('form-react')            
                            );
                        } break;
                        case 'home_body_information_cskh_loadbangthongtin': {
                            let bangthongtin = {};
                            for (let value of rows) {
                                if (bangthongtin[value['Type']] == null) {
                                    bangthongtin[value['Type']] = [{value: value['Content'], label: value['Content']}];
                                } else {
                                    bangthongtin[value['Type']].push({value: value['Content'], label: value['Content']});
                                }                            
                            }
                            let GoiChamSocKhachHangCu = require('../form/information/chamsockhachhang/goidienchamsockhachhangcu/GoiDienChamSocKhachHangCu');
                            ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                            ReactDOM.render(
                                <Provider store={store}>
                                    <GoiChamSocKhachHangCu 
                                        id={dulieuguive.id} 
                                        bangthongtin={bangthongtin}
                                    />
                                </Provider>,
                                document.getElementById('form-react')            
                            );
                        } break;
                        case 'home_body_loadthongtinhoadon': {
                            if (dulieuguive.isOpen == true) {
                                if (dulieuguive.hoadoncu != null) {
                                    dulieuguive.hoadoncu.hoadontruoc = rows[1][0];
                                    this.loadThanhToanNo(rows[0][0], dulieuguive.hoadoncu, true);
                                    //(thong tin hoc sinh, du lieu hoa don cu, print = true)
                                }
                            } else {
                                if (rows[0]['User ID'] != null) {
                                    query = 'SELECT * FROM USERS WHERE `User ID` = \'!\?!\'; ';
                                    query = query.replace('!\?!', rows[0]['User ID']);  
                                } else {
                                    query = 'SELECT * FROM QUANLY WHERE `Mã Quản Lý` = \'!\?!\'; ';
                                    query = query.replace('!\?!', rows[0]['Mã Nhân Viên Đóng Phí']);
                                }

                                if (rows[0]['Mã Phiếu Nợ'] != null) {
                                    query += 'SELECT * FROM quanlyhocsinh.BIENLAIHOCPHI WHERE `Mã Phiếu` = \'!\?!\'; ';
                                    query = query.replace('!\?!', rows[0]['Mã Phiếu Nợ']);
                                } else {
                                    // Load phieu thu truoc do
                                    query += 'SELECT * FROM BIENLAIHOCPHI ' +
                                    'WHERE BIENLAIHOCPHI.`User ID` = \'!\?!\' ' +
                                    'AND BIENLAIHOCPHI.`ID` < \'!\?!\' ' +
                                    'AND BIENLAIHOCPHI.`Ngày Hủy Phiếu` IS NULL ' +
                                    'AND BIENLAIHOCPHI.`Nội Dung` NOT LIKE \'@@@%\' ' +
                                    'GROUP BY `ID` DESC LIMIT 1; ';
                                    query = query.replace('!\?!', rows[0]['User ID']);
                                    query = query.replace('!\?!', rows[0]['ID']);
                                }
                                this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                                    fn: 'home_body_loadthongtinhoadon',
                                    isOpen: true,
                                    hoadoncu: rows[0],
                                });
                            }
                        } break;
                        
                        //Hoa Don
                        case 'home_body_btnpayowe_menuright_kiemtratruockhidongno': {
                            if (dulieuguive.isOpen == true) {
                                if (rows[1].length > 0) {
                                    store.dispatch({
                                        type: 'ALERT_NOTIFICATION_ADD',
                                        content: 'Phiếu thu này đang được xin phép hủy!',
                                        notifyType: 'warning',
                                    })
                                } else if (rows[2][0] != null) {
                                    store.dispatch({
                                        type: 'ALERT_NOTIFICATION_ADD',
                                        content: 'Nợ đã được thanh toán tại phiếu thu ' + rows[2][0]['Mã Phiếu'] + '.',
                                        notifyType: 'information',
                                    })
                                } else {
                                    this.loadThanhToanNo(rows[0][0], dulieuguive.hoadoncu);
                                }
                            } else {
                                if (rows[0].isOwe == 0
                                && rows[0][`Còn Nợ`] == 0) {
                                    store.dispatch({
                                        type: 'ALERT_NOTIFICATION_ADD',
                                        content: 'Phiếu thu không có nợ!',
                                        notifyType: 'warning',
                                    })
                                } else {
                                    query = 'SELECT * FROM USERS WHERE `User ID` = \'!\?!\'; ';
                                    let kiemtrano = '';
                                    if (rows[0].isOwe == 0 && rows[0][`Còn Nợ`] != 0) {
                                        kiemtrano = 'SELECT * FROM BIENLAIHOCPHI ' +
                                        'WHERE BIENLAIHOCPHI.`User ID` = \'!\?!\' ' +
                                        'AND BIENLAIHOCPHI.`ID` > \'!\?!\' ' +
                                        'AND BIENLAIHOCPHI.`Ngày Hủy Phiếu` IS NULL ' +
                                        'AND BIENLAIHOCPHI.`Nội Dung` NOT LIKE \'@@@%\' ' +
                                        'GROUP BY `ID` ASC LIMIT 1; ';
                                        kiemtrano = kiemtrano.replace('!\?!', rows[0]['User ID']);
                                        kiemtrano = kiemtrano.replace('!\?!', rows[0]['ID']);
                                    } else {
                                        kiemtrano = 'SELECT * FROM BIENLAIHOCPHI ' +
                                        'WHERE BIENLAIHOCPHI.`Mã Phiếu Nợ` = \'!\?!\' ' +
                                        'AND BIENLAIHOCPHI.`Ngày Hủy Phiếu` IS NULL; ';
                                        kiemtrano = kiemtrano.replace('!\?!', rows[0]['Mã Phiếu']);
                                    }
                                    query = query.replace('!\?!', rows[0]['User ID']);
                                    query += 'SELECT * FROM APPROVE WHERE `isApproved` = \'0\' AND `blockEvent` LIKE \'%taophieuthu:!\?!%\'; ';
                                    query = query.replace('!\?!', rows[0]['User ID']);                                    
                                    query += kiemtrano;
                                    this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                                        fn: 'home_body_btnpayowe_menuright_kiemtratruockhidongno',
                                        isOpen: true,
                                        hoadoncu: rows[0],
                                    });
                                }
                            }
                        } break;
                        case 'home_body_loadxoahoadon_kiemtratruockhixoa': {
                            if (dulieuguive.isOpen == true) {                            
                                if (rows[0] != null && rows[0]['ID'] == dulieuguive.idPhieuThu) {                                
                                    let HuyPhieu = require('../form/hoadon/phieuthu/HuyPhieu');
                                    ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                                    ReactDOM.render(
                                        <Provider store={store}>
                                            <HuyPhieu
                                                data={rows[0]}
                                                phieuThuTruoc={rows[1]}
                                                accountID={this.state.userInformation.account_id}
                                                branch={this.state.branch}
                                            />
                                        </Provider>,
                                        document.getElementById('form-react')
                                    );
                                } else {
                                    store.dispatch({
                                        type: 'ALERT_NOTIFICATION_ADD',
                                        content: 'Bạn không thể hủy phiếu thu cũ, chỉ có thể hủy phiếu thu được tạo gần nhất!',
                                        notifyType: 'warning',
                                    })
                                }
                            } else {
                                if (rows[1].length > 0) {
                                    store.dispatch({
                                        type: 'ALERT_NOTIFICATION_ADD',
                                        content: 'Phiếu thu này đang được xin phép hủy!',
                                        notifyType: 'warning',
                                    })
                                } else {
                                    rows = rows[0];
                                    let strType = 'AND BIENLAIHOCPHI.`Nội Dung` NOT LIKE \'@@@%\' ';
                                    let idnguoidongtien = 'WHERE BIENLAIHOCPHI.`User ID` = \'!\?!\' ';
                                    if (rows[0]!= null && rows[0]['Nội Dung'] != null) {
                                        if (rows[0]['Nội Dung'].startsWith('@@@') == true) {
                                            strType = 'AND BIENLAIHOCPHI.`Nội Dung` LIKE \'@@@%\' ';
                                        }
                                        if (rows[0]['Nội Dung'].startsWith('@@@') == true
                                        && rows[0]['Mã Nhân Viên Đóng Phí'] != null) {
                                            idnguoidongtien = 'WHERE BIENLAIHOCPHI.`Mã Nhân Viên Đóng Phí` = \'!\?!\' ';
                                            idnguoidongtien = idnguoidongtien.replace('!\?!', rows[0]['Mã Nhân Viên Đóng Phí']);
                                        }
                                    }
                                    query = 'SELECT * FROM BIENLAIHOCPHI ' +
                                    idnguoidongtien +
                                    'AND BIENLAIHOCPHI.`Ngày Hủy Phiếu` IS NULL ' +
                                    strType +
                                    'GROUP BY `ID` DESC; ';
                                    query = query.replace('!\?!', rows[0]['User ID']);

                                    this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                                        fn: 'home_body_loadxoahoadon_kiemtratruockhixoa',
                                        idPhieuThu: rows[0]['ID'],
                                        isOpen: true,
                                    });
                                }
                            }
                        } break;

                        //Lop Hoc
                        case 'home_body_loadtraibuoi': {
                            if (rows[0] != null
                            && rows[0]['Ngày Kết Thúc'] != null) {
                                let ngaykethuc = new Date(rows[0]['Ngày Kết Thúc']);
                                if (ngaykethuc > new Date()) {
                                    let XepLichTraiBuoi = require('../form/lophoc/XepLichTraiBuoi/XepLichTraiBuoi');
                                    ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                                    ReactDOM.render(
                                        <Provider store={store}>
                                            <XepLichTraiBuoi
                                                data={rows[0]}
                                            />
                                        </Provider>,
                                        document.getElementById('form-react')            
                                    );
                                } else {
                                    store.dispatch({
                                        type: 'ALERT_NOTIFICATION_ADD',
                                        content: 'Không chỉnh sửa lớp học đã kết thúc!',
                                        notifyType: 'warning',
                                    });
                                }
                            }
                        } break;

                        //So Lien Lac
                        case 'home_body_response_cskh_kiemtranguoiphanhoi': {
                            if (rows[0] != null
                            && (rows[0]['Mã Nhân Viên Phản Hồi'] == this.state.userInformation.account_id
                            || this.state.userInformation.permission == 'smod'
                            || this.state.userInformation.permission == 'mod')) {
                                let highterStaff = null;
                                if (rows[0]['Mã Nhân Viên Phản Hồi'] != this.state.userInformation.account_id) {
                                    highterStaff = this.state.userInformation.account_id;
                                }
                                if (rows[0]['Nội Dung Phản Hồi'] == null) {
                                    if (dulieuguive.action == 'edit') {
                                        store.dispatch({
                                            type: 'ALERT_NOTIFICATION_ADD',
                                            content: 'Vui lòng không chỉnh sửa mục chưa phản hồi!',
                                            notifyType: 'warning',
                                        })
                                    } else {
                                        let CSKH = require('../form/chamsockhachhang/PhanHoiKhachHang');
                                        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                                        ReactDOM.render(
                                            <Provider store={store}>
                                                <CSKH 
                                                    data={rows[0]}
                                                    highterStaff={highterStaff}
                                                />
                                            </Provider>,
                                            document.getElementById('form-react')            
                                        );
                                    }
                                } else {
                                    if (dulieuguive.action == 'edit') {
                                        let CSKH = require('../form/chamsockhachhang/PhanHoiKhachHang');
                                        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                                        ReactDOM.render(
                                            <Provider store={store}>
                                                <CSKH 
                                                    data={rows[0]}
                                                    action={dulieuguive.action}
                                                    highterStaff={highterStaff}
                                                />
                                            </Provider>,
                                            document.getElementById('form-react')            
                                        );
                                    } else {
                                        store.dispatch({
                                            type: 'ALERT_NOTIFICATION_ADD',
                                            content: 'Mục này đã được phản hồi!',
                                            notifyType: 'information',
                                        })
                                    }
                                }
                            } else if (rows[0] == null) {
                                store.dispatch({
                                    type: 'ALERT_NOTIFICATION_ADD',
                                    content: 'Không tìm thấy dữ liệu từ hệ thống!',
                                    notifyType: 'error',
                                })
                            } else {
                                store.dispatch({
                                    type: 'ALERT_NOTIFICATION_ADD',
                                    content: 'Vui lòng không phản hồi vào mục của người khác!',
                                    notifyType: 'warning',
                                })
                            }
                        } break;

                        //Excel
                        case 'home_body_sheetjs_xuatexcels_getcolumn': {
                            let column = [];
                            let cols = rows;
                            if (Array.isArray(rows[0])) {
                                cols = rows[0];
                            }
                            
                            for (let val of cols) {
                                column.push({label: val['COLUMN_NAME'], value: val['COLUMN_NAME']});
                            }
                            
                            let Export = require('../form/sheetjs/Export');
                            ReactDOM.render(
                                <Provider store={store}>
                                    <Export
                                        column={column}
                                        from={dulieuguive.tableexport}
                                        tablename={dulieuguive.tablename}
                                        menuSelected={this.state.menuSelected}
                                        options={this.state.options}
                                        data={rows}
                                        moreTablesInfo={this.state.moreTablesInfo}
                                    />
                                </Provider>,
                                document.getElementById('form-react')            
                            );
                        } break;

                        //Reload Avatar
                        case 'peronalnformation_suathanhcong': {
                            if (dulieuguive.isImageChange) {
                                let _userInfor = this.state.userInformation;
                                _userInfor.hinhanh = dulieuguive.imageLink;
                                this.setState({
                                    userInformation: _userInfor,
                                    _userInformation: _userInfor,
                                })
                            }
                        }
                        default:
                    }
                    if (dulieuguive.isSuccess) {
                        thongbaothanhcong();
                    }                    
                    if (dulieuguive.isReload) {
                        if (dulieuguive.reloadPageName == null) {
                            this.selectPage(this.state.LimitStart);
                        } else if (dulieuguive.reloadPageName == this.state.menuSelected) {
                            this.selectPage(this.state.LimitStart);
                        } else {
                            switch (dulieuguive.reloadPageName) {
                                case 'cskhdangkyhangngay': {
                                    $('#cskhdangkyhangngay').trigger('click');
                                } break;
                                case 'hocsinh': {
                                    $('#hocsinh').trigger('click');
                                } break;
                                case 'hocsinhhocthu': {
                                    $('#hocsinhhocthu').trigger('click');
                                } break;
                                case 'hoadon': {
                                    $('#hoadon').trigger('click');
                                } break;
                                default:
                            }
                        }
                    }
                    if (dulieuguive.isReloadNotification) {
                        this.props.socket.emit('all-notification-update', dulieuguive);
                    }
                }
            } break;
            case 'loi-cu-phap': {
                this.props.socket.emit('log_error_of_query', loi.sql + '|' + loi.sqlMessage);
                if (dulieuguive != null) {
                    if (dulieuguive.ignoringError == null || dulieuguive.ignoringError == false) {
                        console.log(loi);
                        store.dispatch({
                            type: 'ALERT_NOTIFICATION_ADD',
                            content: 'Lỗi không thể thực hiện hành động này! \nVui lòng kiểm tra lại quy trình nhập dữ liệu! \n!\?!'.replace('!\?!', loi.sqlMessage + ' (' + loi.errno + ')'),
                            notifyType: 'error',
                        });
                        this.props.socket.emit('huy-query');
                    }
                } else {
                    store.dispatch({
                        type: 'ALERT_NOTIFICATION_ADD',
                        content: 'Lỗi không thể thực hiện hành động này! \nVui lòng kiểm tra lại quy trình nhập dữ liệu.',
                        notifyType: 'error',
                    });
                }
            } break;
            default:
                break;
        }
    }

    callBackWebDav (data, err) {
    }

    callBackRenameSocketSuccessfull () {
    }

    windowClick () {
        this.setState({
            locationContextMenu: null,
            functionContextMenu: null,
        })
    }

    windowContextMenu () {
        if (this.state.isShowContext != true) {
            this.setState({
                locationContextMenu: null,
                functionContextMenu: null,
            })
        } else {
            this.setState({
                isShowContext: false,
            })
        }
    }

    componentDidMount () {
        window.addEventListener('click', this.windowClick);
        window.addEventListener('contextmenu', this.windowContextMenu);
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
        this.props.socket.on('webdav', this.callBackWebDav);
        this.props.socket.on('gan-ten-cho-socket-thanh-cong', this.callBackRenameSocketSuccessfull);
        this.props.socket.emit('kiem-tra-ket-noi');
        if ($.cookie('userid') != null) {
            let query = 'SELECT ' + 
            'account_id, ' +
            'fullname, ' + 
            'permission, ' + 
            'khuvuc, ' + 
            'available, ' + 
            'hinhanh ' + 
            'FROM ACCOUNT ' + 
            'WHERE `account_id` = \'!\?!\'; ';
            query = query.replace('!\?!', $.cookie('userid'));
            query += 'SELECT * FROM DANHSACHMONHOC; ';
            query += 'SELECT * FROM CHUONGTRINHKHAC; ';
            query += 'SELECT * FROM CHUONGTRINHHOCBOSUNG; ';
            this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
                fn: 'home_body_getUserInformation',
            });
        } else {
            window.location.replace('/dangxuat');
        }        
    }

    componentWillUnmount() {
        window.addEventListener('click', this.windowClick);
        window.addEventListener('contextmenu', this.windowContextMenu);
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
        this.props.socket.off('webdav', this.callBackWebDav);
        this.props.socket.off('gan-ten-cho-socket-thanh-cong', this.callBackRenameSocketSuccessfull);
    }

    componentDidUpdate(prevProps, prevState) {
        let query;
        let pageControlHeight = 0;
        if (this.refs.pageControl != null) {
            pageControlHeight = this.refs.pageControl.clientHeight;
        }

        if (pageControlHeight != this.state.pageControlHeight) {
            let tableHeight = 'calc(100% - ' + this.state.filterHeight + 'px - ' + pageControlHeight + 'px)';
            this.setState({
                tableHeight: tableHeight,
                pageControlHeight: pageControlHeight,
            })
        }

        if (
            this.state.branch != this.state._branch
            || (this.state.userInformation != null
            && this.state._userInformation != null
            && (this.state.userInformation.available != this.state._userInformation.available
            || this.state.userInformation.fullname != this.state._userInformation.fullname
            || this.state.userInformation.hinhanh != this.state._userInformation.hinhanh
            || this.state.userInformation.khuvuc != this.state._userInformation.khuvuc
            || this.state.userInformation.permission != this.state._userInformation.permission
            || this.state.userInformation.account_id != this.state._userInformation.account_id))
        ) {
            window.location.replace('/dangxuat');
        }

        for (let i = 0; i < this.state.actionAllow.length; i++) {
            if (this.state.actionAllow[i] != this.state._actionAllow[i]) {
                window.location.replace('/dangxuat');
                this.setState({
                    actionAllow: [],
                    _actionAllow: [],
                })
                break;
            }
        }

        if (prevState.branch != this.state.branch) {
            query = 'SELECT `Tên Cơ Sở` AS name FROM COSO WHERE `Cơ Sở` = \'!\?!\'; ';
            query = query.replace('!\?!', this.state.branch);
            this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
                fn: 'home_body_getBranchName',
            });
        }

        if (prevState.setFilter != this.state.setFilter
            && this.state.setFilter
            && this.state.filterData != null
        ) {
            this.filter.set(this.state.filterData);
            this.setState({setFilter: false, })
        }

        if (prevState.menuSelected != this.state.menuSelected) {
            store.dispatch({
                type: 'USER_INFORMATION_TABLESELECTED',
                menuSelected: this.state.menuSelected,
            })
        }

        this.updateValue();
    }

    selectPage (startPage) {
        if (this.state.options != null) {
            this.SocketEmit('gui-query-den-database', this.state.options.showQuery, 'laydulieu_trave', {
                fn: 'home_body_showTable',
                numberOfRows: this.state.options.numberOfRows,
                isLimit: this.state.options.isLimit,
                LimitStart: startPage,
                LimitRows: this.state.LimitRows,
                isFilter: true, //Not reload Filter
                showQuery: this.state.options.showQuery,
                subQuery: this.state.options.subQuery,
                additionalConditional: this.state.options.additionalConditional,
            });
            this.setState({LimitStart: startPage,});
        }
    }

    updateValue () {
    }

    value () {
        if (arguments[0] != null) {
            let tableData = null;           
            if (arguments[0][0] != null && Array.isArray(arguments[0][0])) {
                tableData = arguments[0][0];
            } else {
                tableData = arguments[0];
            }
            if (tableData.length < 1) {
                this.setState({
                    data: null,
                    view: 'table',
                });
            } else {
                let header = [];
                let filterHeader = [];
                let setFilter = false;
                let hadImage = false;
                for (let key in tableData[0]) {
                    let type = 'string';
                    let hidden = false;
                    if (key.split(' ')[0] == 'Ngày') {
                        type = 'date';
                    }
                    if ((key.indexOf('ID') != -1 && key != 'User ID')
                    || key == 'Hình Ảnh') {
                        hidden = true;
                    }                    
                    let minWidth = null;
                    switch (this.state.menuSelected) {
                        case 'hoadon':
                        case 'hoadonhuy': {
                            if (key == 'Nội Dung') {
                                minWidth = 200;
                            }
                        } break;
                        case 'hoadonnohocphi': {
                            if (key == 'Ngày Tới Hạn') {
                                type = 'string';
                            }
                        } break;
                        case 'hocsinh': {
                        } break;
                        default: {
                        } break;
                    }
                    if (key == 'Họ Và Tên' && hadImage) {
                        minWidth = 220;
                    }
                    let obj = {
                        label: key,
                        columnName: key,
                        type: type,
                        hidden: hidden,
                        minWidth: minWidth,
                    }
                    header.push(obj);
                    if (key != 'Hình Ảnh'
                    && key != 'Cơ Sở' 
                    && key != 'ID'
                    && key != 'STT'
                    && key != 'Môn Học Đã Đăng Ký'){
                        let pass = true;
                        let value = {label: key, value: key, searchColumn: key, type: 'string'};
                        if (key.toLowerCase().indexOf('ngày') != -1) {
                            value.type = 'date';
                        }
                        switch (this.state.menuSelected) {
                            case 'hoadon':
                            case 'hoadonhuy': {
                            } break;
                            case 'hoadonnohocphi': {
                                if (key == 'Tổng Thu Tạm Tính') {
                                    pass = false;
                                }
                                if (key == 'Ngày Tới Hạn') {
                                    value.value = 'tb.`Cuối Chu Kỳ` AS `Ngày Tới Hạn`';
                                    value.type = 'default';
                                    value.searchColumn = 'tb.`Cuối Chu Kỳ`';
                                }
                            } break;
                            case 'hocsinh':
                            case 'hocsinhnghi': {
                            } break;
                            default:
                        }
                        if (pass) {
                            filterHeader.push(value);
                        }
                    }

                    if (key == 'Hình Ảnh') {
                        hadImage = true;
                    }
                }              
                    
                if (arguments[1] != null && arguments[1].isFilter == false
                ) {
                    arguments[1].filterHeader = filterHeader;
                    setFilter = true;
                }
                
                for (let row of tableData) {
                    switch (this.state.menuSelected) {
                        case 'hoadon':
                        case 'hoadonhuy': {
                            let _hdcontent = row['Nội Dung'];
                            let monhoc = [];
                            if (row['Nội Dung'].startsWith('@@@')) {
                                _hdcontent = _hdcontent.substr(3, _hdcontent.length);
                                _hdcontent = _hdcontent.split(',');
                                for (let content of _hdcontent) {
                                    if (content != '') {
                                        content = content.split(':');
                                        this.state.moreTablesInfo.chuongtrinhkhac.map(v => {
                                            if (v.id == content[0]) {
                                                monhoc.push(v.name);
                                            }
                                        })
                                    }
                                }
                            } else {
                                _hdcontent = _hdcontent.split(',');
                                for (let content of _hdcontent) {
                                    if (content != '') {
                                        content = content.split(':');
                                        if (content[3] != null) {
                                            this.state.moreTablesInfo.chuongtrinhhocbosung.map(v => {
                                                if (v.ID == content[3] && monhoc.indexOf(v['Tên Chương Trình']) == -1) {
                                                    monhoc.push(v['Tên Chương Trình']);
                                                }
                                            })                                                
                                        } else {
                                            this.state.moreTablesInfo.danhsachmonhoc.map(v => {
                                                if (v.mamon == content[0]) {
                                                    monhoc.push(v.name);
                                                }
                                            })
                                        }
                                    }
                                }
                            }
                            row['Nội Dung'] = monhoc.join(', ');
                        } break;
                        case 'hoadonnohocphi': {
                            let hoadon = [];
                            arguments[0][1].map(v => {
                                if (v['User ID'] == row['User ID']) {
                                    hoadon.push(v);
                                }
                            });
                            hoadon.sort((a, b) => {
                                a = new Date(a['Cuối Chu Kỳ']);
                                b = new Date(b['Cuối Chu Kỳ']);
                                if (a > b) {
                                    return -1;
                                }
                                if (a < b) {
                                    return 1;
                                }
                                return 0;                                
                            });                           
                            
                            let monhoc = [];
                            let list = JSON.parse(row['Môn Học Đã Đăng Ký']);
                            let monhocdadangky = [];
                            if (list != null) {
                                for (let key in list) {
                                    if (list.hasOwnProperty(key)) {
                                        let mh = list[key];
                                        if (mh.idchuongtrinhhoc != null) {
                                            this.state.moreTablesInfo.chuongtrinhhocbosung.map(v => {
                                                if (v.ID == mh.idchuongtrinhhoc) {
                                                    mh.name = v['Tên Chương Trình'];
                                                }
                                            })
                                        }

                                        if (mh.idchuongtrinhhoc != null && mh.trongoi == true) {
                                            if (monhoc.indexOf(mh.name) == -1) {
                                                monhoc.push(mh.name);
                                                monhocdadangky.push(mh.idchuongtrinhhoc.toString());
                                            }
                                        } else {
                                            this.state.moreTablesInfo.danhsachmonhoc.map(v => {
                                                if (mh.idchuongtrinhhoc != null) {
                                                    if (v.mamon == mh.mamon && monhoc.indexOf(v.name + ' (' + mh.name + ')') == -1) {
                                                        monhoc.push(v.name + ' (' + mh.name + ')');
                                                        monhocdadangky.push(mh.mamon);
                                                    }
                                                } else {
                                                    if (v.mamon == mh.mamon && monhoc.indexOf(v.name) == -1) {
                                                        monhoc.push(v.name);                                                        
                                                        monhocdadangky.push(mh.mamon);
                                                    }
                                                }
                                            })
                                        }
                                    }
                                }
                            }
                            
                            let monhocdadongtien = [];
                            let monhocvachukycuoi = [];
                            for (let hd of hoadon) {
                                try {
                                    let noidung = hd['Nội Dung'].split(',');                                    
                                    let isTotal = [];
                                    for (let i of noidung) {
                                        i = i.split(':');
                                        if (i.length > 1) {
                                            if (i[3] == null) {
                                                if (monhocdadangky.indexOf(i[0]) != -1
                                                && monhocdadongtien.indexOf(i[0]) == -1) {
                                                    monhocdadongtien.push(i[0]);
                                                    monhocvachukycuoi.push({id: i[0], ngayketthuc: new Date(hd['Cuối Chu Kỳ']), price: i[1]});
                                                }
                                            } else {
                                                if (isTotal.indexOf(i[3]) == -1) {
                                                    isTotal.push(i[3]);
                                                    if (monhocdadangky.indexOf(i[3]) != -1
                                                    && monhocdadongtien.indexOf(i[3]) == -1) {
                                                        monhocdadongtien.push(i[3]);
                                                        monhocvachukycuoi.push({id: i[3], ngayketthuc: new Date(hd['Cuối Chu Kỳ']), price: i[4]});
                                                    }
                                                }
                                            }
                                        }
                                    }
                                } catch (error) {                                    
                                }
                            }

                            let ngaytoihan = [];                            
                            let tongthutamtinh = 0;
                            let checkMH = true;
                            for (let i of monhocvachukycuoi) {
                                checkMH = false;
                                let date = ("0" + i.ngayketthuc.getDate()).slice(-2) + '/' + ("0" + (i.ngayketthuc.getMonth() + 1)).slice(-2) + '/' + i.ngayketthuc.getFullYear();
                                if (ngaytoihan.indexOf(date) == -1) {
                                    ngaytoihan.push(date);
                                }

                                let thanhtien = 0;
                                if (isNaN(i.id)) {
                                    for (let j of this.state.moreTablesInfo.bieuphimonhoc) {
                                        if (j['Mã Môn Học'] == i.id) {
                                            if (isNaN(j['Bảng Giá'])) {
                                                let bg = j['Bảng Giá'].split(',');
                                                let bg_check = false;
                                                for (let b of bg) {
                                                    b = b.split(':');
                                                    if (Number(b[0]) == Number(j.price)) {
                                                        thanhtien = Number(b[0]);
                                                        bg_check = true;
                                                    }
                                                }
                                                if (!bg_check) {
                                                    let _b = bg[0].split(':');
                                                    thanhtien = Number(_b[0]);
                                                }
                                            } else {
                                                thanhtien = Number(j['Bảng Giá']);
                                            }
                                        }
                                    }
                                } else {
                                    for (let j of this.state.moreTablesInfo.chuongtrinhhocbosung) {
                                        if (j.ID.toString() == i.id) {
                                            thanhtien = Number(j['Trọn Gói']);
                                        }
                                    }
                                }

                                if (arguments[1].additionalConditional != null
                                && arguments[1].additionalConditional.chotdenngay != null) {
                                    let ngbd = new Date(i.ngayketthuc);
                                    let ngkt = new Date(i.ngayketthuc);
                                    ngkt.setMonth(ngkt.getMonth() + 1);
                                    let songay = (ngkt - ngbd) / 86400000;

                                    let ngaychot = new Date(arguments[1].additionalConditional.chotdenngay);
                                    let a = ngaychot - i.ngayketthuc;
                                    let th = Noofmonths(i.ngayketthuc, ngaychot);
                                    let check = new Date(i.ngayketthuc);
                                    
                                    if (a > 0) {
                                        let t = 0;
                                        for (let i = 0; i < th; i++) {
                                            let ng = (ngaychot - check) / 86400000;
                                            check.setMonth(check.getMonth() + 1);
                                            if (check < ngaychot) {
                                                t += thanhtien;
                                            } else {
                                                t += lamtron(Number((thanhtien / songay) * ng));
                                            }
                                        }
                                        tongthutamtinh += t;
                                    }
                                } else {
                                    tongthutamtinh += thanhtien;
                                }
                            }
                            if (checkMH) {
                                tongthutamtinh = null;
                            }

                            row['Ngày Tới Hạn'] = ngaytoihan.join(', ');
                            row['Môn Học Đã Đăng Ký'] = monhoc.join(', ');
                            row['Tổng Thu Tạm Tính'] = tongthutamtinh;
                        } break;
                        case 'hocsinh':
                        case 'hocsinhnghi': {
                            let monhoc = [];
                            let list = JSON.parse(row['Môn Học Đã Đăng Ký']);
                            if (list != null) {
                                for (let key in list) {
                                    if (list.hasOwnProperty(key)) {
                                        let mh = list[key];
                                        if (mh.idchuongtrinhhoc != null) {
                                            this.state.moreTablesInfo.chuongtrinhhocbosung.map(v => {
                                                if (v.ID == mh.idchuongtrinhhoc) {
                                                    mh.name = v['Tên Chương Trình'];
                                                }
                                            })
                                        }

                                        if (mh.idchuongtrinhhoc != null && mh.trongoi == true) {
                                            if (monhoc.indexOf(mh.name) == -1) {
                                                monhoc.push(mh.name);
                                            }
                                        } else {
                                            this.state.moreTablesInfo.danhsachmonhoc.map(v => {
                                                if (mh.idchuongtrinhhoc != null) {
                                                    if (v.mamon == mh.mamon && monhoc.indexOf(v.name + ' (' + mh.name + ')') == -1) {
                                                        monhoc.push(v.name + ' (' + mh.name + ')');
                                                    }
                                                } else {
                                                    if (v.mamon == mh.mamon && monhoc.indexOf(v.name) == -1) {
                                                        monhoc.push(v.name);
                                                    }
                                                }                                                
                                            })
                                        }
                                    }
                                }                                
                            }
                            row['Môn Học Đã Đăng Ký'] = monhoc.join(', ');
                        } break;
                        default:
                    }
                    if (hadImage) {
                        row['Họ Và Tên'] = {
                            value: row['Họ Và Tên'],
                            innerElements: {
                                image: row['Hình Ảnh']
                            },
                        }
                    }
                }                

                this.setState({
                    header: header,
                    data: tableData,
                    setFilter: setFilter,
                    filterData: arguments[1],
                    view: 'table',
                });
            }
        } else {
            return this.state.data;
        }
    }

    render () {
        let userid = null;
        let permission = null;
        let fullname = null;
        if (this.state.userInformation != null) {
            userid = this.state.userInformation.account_id;
            permission = this.state.userInformation.permission;
            fullname = this.state.userInformation.fullname;
        }        

        let backbtn = <div></div>
        if (this.state.visibleback && this.state.visible) {
            backbtn = 
                <div className={mystyle.button}>
                    <div onClick={() => {this.selectPage(0)}}>
                        <i class="fa fa-angle-double-left" aria-hidden="true"></i>
                    </div>
                    <div onClick={() => {this.selectPage(this.state.LimitStart - this.state.LimitRows)}}>
                        <i class="fa fa-angle-left" aria-hidden="true"></i>
                    </div>
                </div>
        }
        let nextbtn = <div></div>
        if (this.state.visiblenext && this.state.visible) {
            nextbtn = 
                <div className={mystyle.button}>
                    <div onClick={() => {this.selectPage(this.state.LimitStart + this.state.LimitRows)}}>
                        <i class="fa fa-angle-right" aria-hidden="true"></i>
                    </div>
                    <div onClick={() => {
                        let pagelength = this.state.options.numberOfRows;
                        let startAtEndPage = (Math.floor(pagelength/Number(this.state.LimitRows)) * Number(this.state.LimitRows));
                        if (pagelength == startAtEndPage) {
                            startAtEndPage -= Number(this.state.LimitRows);
                        }
                        this.selectPage(startAtEndPage);
                    }}>
                        <i class="fa fa-angle-double-right" aria-hidden="true"></i>
                    </div>
                </div>
        }
        let pageStatus = <div></div>
        if (this.state.pageStatus != null) {
            pageStatus = 
            <div>
                <span>Hàng {this.state.pageStatus.start} -> {this.state.pageStatus.end} (Tổng hàng: {this.state.pageStatus.total})</span>
            </div>
        }
        let pageControl = 
        <div 
            className={mystyle.pageControl}
            ref="pageControl"
        >
            {backbtn}
            {pageStatus}
            {nextbtn}
        </div>

        let contextMenu = null;
        if (this.state.functionContextMenu != null
        && this.state.locationContextMenu != null) {
            contextMenu = 
            <ContextMenu
                location={this.state.locationContextMenu}
                menu={this.state.functionContextMenu}
            />
        }

        let branchSelector = null;
        if (this.state.isShowBranchSelecter
        && this.state.userInformation != null
        && this.state.userInformation.khuvuc != null
        && (this.state.userInformation.khuvuc.split(',')[0] == 'ALL'
        || this.state.userInformation.khuvuc.split(',').length > 1)) {
            branchSelector =
            <BranchSelector
                limitBranch={this.state.userInformation.khuvuc.split(',')}
                onAgree={(branch) => {
                    $.cookie('khuvuc', branch + '|' + $.cookie('userid'));
                    this.setState({
                        isShowBranchSelecter: false,
                        branch: branch,
                        _branch: branch,
                        options: null,
                        menuSelected: null,
                        view: 'homepage',
                        title: 'Trang Chủ',
                    })
                }}
                onCancel={() => {
                    if (this.state.branch != null) {
                        this.setState({isShowBranchSelecter: false,})
                    }
                }}
            />
        }

        let startupNotiofication = null;
        if (this.state.isShowStartupNotification) {
            startupNotiofication = 
            <StartupNotification onClose={() => {this.setState({isShowStartupNotification: false})}}/>
        }

        let notification = null;
        if (this.state.loadNotification) {
            if (this.state.userInformation != null) {
                notification = 
                <Notification
                    getMe={(me) => this.notification = me}
                    permission={this.state.userInformation.permission}
                    userInformation={this.state.userInformation}
                />
            }
        }

        let body = <div></div>
        switch (this.state.view) {
            case 'homepage': {
                body =
                <HomePage branch={this.state.branch}/>
            } break;
            case 'table':{
                body =
                <div
                    style={{width: '100%', height: '100%'}}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        let pageX = e.pageX;
                        let pageY = e.pageY;
                        try {
                            this.onTableRightClick.bind(this, null, {x: pageX, y: pageY})();
                        } catch (error) {
                        }
                    }}
                ></div>
                if (this.state.data != null) {
                    body =
                    <div
                        style={{
                            position: 'relative',
                            overflow: 'hidden',
                            height: '100%',
                        }}
                    >
                        <FilterHouston
                            getMe={(me) => this.filter = me}
                            menuSelected={this.state.menuSelected}
                            filterHeight={(e) => {
                                let pageControlHeight = 0;
                                if (this.refs.pageControl != null) {
                                    pageControlHeight = this.refs.pageControl.clientHeight;
                                }                                                                    
                                let tableHeight = 'calc(100% - ' + e + 'px - ' + pageControlHeight + 'px)';
                                this.setState({
                                    tableHeight: tableHeight,
                                    filterHeight: e,
                                })
                            }}
                        />
                        <Table
                            header={this.state.header}
                            data={this.state.data}
                            indexStart={this.state.LimitStart + 1}
                            isShowNumber
                            isShowImageAvatar
                            onRowsRightClick={this.onTableRightClick.bind(this)}
                            style={{
                                transition: '0.3s ease-out',
                                marginTop: this.state.filterHeight + 'px',
                                height: this.state.tableHeight,
                            }}
                            styleHeader={{}}
                            styleContent={{}}
                        />
                        {pageControl}
                    </div>
                }
            } break;
            default:
                break;
        }
        return (
            <div>
                <div className={mystyle.body}>
                    <Menu
                        isShow={this.state.isShowMenu}
                        onClickBranch={() => {
                            if (this.state.userInformation != null
                            && this.state.userInformation.khuvuc != null
                            && (this.state.userInformation.khuvuc.split(',')[0] == 'ALL'
                            || this.state.userInformation.khuvuc.split(',').length > 1)) {
                                this.setState({isShowBranchSelecter: true,});
                            } else {
                                this.setState({
                                    options: null,
                                    menuSelected: null,
                                    view: 'homepage',
                                    title: 'Trang Chủ'
                                });
                            }
                        }}
                        onClickContainer={() => {this.setState({isShowMenu: false})}}
                        onClick={this.onMenuClick.bind(this)}
                        userInformation={this.state.userInformation}
                        branchName={this.state.branchName}
                    />
                    <div style={{height: '100%'}}>
                        <Navigation
                            userIcon={(() => {
                                if (this.state.userInformation != null) {
                                    return this.state.userInformation.hinhanh;
                                }
                            })()}
                            userName={(() => {
                                if (this.state.userInformation != null) {
                                    return this.state.userInformation.fullname;
                                }
                            })()}
                            id={(() => {
                                if (this.state.userInformation != null) {
                                    return this.state.userInformation.account_id;
                                }
                            })()}
                            title={this.state.title}
                            onMenuClick={() => {this.setState({isShowMenu: !this.state.isShowMenu})}}
                            onNotificationClick={
                                () => {
                                    try {
                                        if (this.notification != null) {
                                            this.notification.onClickShow();
                                        }
                                    } catch (error) {
                                    }
                                }
                            }
                        />
                        <div style={{height: 'calc(100% - 40px)'}}>
                            {body}
                        </div>
                    </div>
                </div>
                {contextMenu}
                {branchSelector}
                {startupNotiofication}
                {notification}
                <AlertNotification />
                <div class="khuvuc" display="none" value={this.state.branch}></div>
                <div id="lable_button_nexttoicon" display="none" value={userid}>{fullname}</div>
                <div class="permission" display="none" value={permission}></div>
            </div>
        )
    }

    onMenuClick (value) {
        if (this.state.branch == null) {
            return;
        }
        let actionAllow = [];
        let query = null;
        let subQuery = null;
        switch (value.name) {
            case 'hocsinh': {
                query = 'SELECT USERS.`ID`, ' +
                'USERS.`User ID`, ' +
                'USERS.`Hình Ảnh`, ' +
                'USERS.`Họ Và Tên`, ' +
                'USERS.`Lớp`, ' +
                'USERS.`Số Điện Thoại`, ' +
                'USERS.`Địa Chỉ`, ' +
                'USERS.`Học Lực Đầu Vào`, ' +
                'USERS.`Ngày Nhập Học`, ' +
                'tb1.`monhoc` AS `Môn Học Đã Đăng Ký`, ' +
                'USERS.`Tên Trường`, ' +
                'USERS.`Họ Hàng`, ' +
                'USERS.`Biết Houston123 Như Thế Nào`, ' +
                'USERS.`Ghi Chú` ' +
                'FROM USERS ' +
                'LEFT JOIN (SELECT `User ID` as userid, monhoc FROM DANGKIMONHOC) as tb1 ON tb1.`userid` = USERS.`User ID` ' +
                'WHERE `Cơ Sở` = \'?\' ' +
                'AND `Chính Thức` = \'1\' ' +
                'AND (`Ngày Nghỉ Học` IS NULL OR `Ngày Nghỉ Học` > CONVERT_TZ(NOW(), @@session.time_zone,\'+07:00\')) ' +
                'ORDER BY `Họ Và Tên` ASC ';
                query = query.replace( '?' , this.state.branch);
            } break;
            case 'hocsinhnghi': {
                query = 'SELECT USERS.`ID`, ' +
                'USERS.`User ID`, ' +
                'USERS.`Hình Ảnh`, ' +
                'USERS.`Họ Và Tên`, ' +
                'USERS.`Lớp`, ' +
                'USERS.`Số Điện Thoại`, ' +
                'USERS.`Địa Chỉ`, ' +
                'USERS.`Học Lực Đầu Vào`, ' +
                'USERS.`Ngày Nhập Học`, ' +
                'tb1.`monhoc` AS `Môn Học Đã Đăng Ký`, ' +
                'USERS.`Tên Trường`, ' +
                'USERS.`Họ Hàng`, ' +
                'USERS.`Ngày Nghỉ Học`, ' +
                'USERS.`Lý Do Nghỉ` ' +
                'FROM USERS ' +
                'LEFT JOIN (SELECT `User ID` as userid, monhoc FROM DANGKIMONHOC) as tb1 ON tb1.`userid` = USERS.`User ID` ' +
                'WHERE `Cơ Sở` = \'?\' ' +
                'AND `Ngày Nghỉ Học` <= CONVERT_TZ(NOW(), @@session.time_zone,\'+07:00\')';
                query = query.replace( '?' , this.state.branch);
            } break;
            case 'hocsinhhocthu': {
                query = 'SELECT USERS.`ID`, ' +
                'USERS.`User ID`, ' +
                'USERS.`Hình Ảnh`, ' +
                'USERS.`Họ Và Tên`, ' +
                'USERS.`Lớp`, ' +
                'USERS.`Số Điện Thoại`, ' +
                'USERS.`Địa Chỉ`, ' +
                'USERS.`Học Lực Đầu Vào`, ' +
                'USERS.`Ngày Nhập Học`, ' +
                'USERS.`Tên Trường`, ' +
                'USERS.`Họ Hàng`, ' +
                'USERS.`Ghi Chú` ' +
                'FROM USERS ' +
                'WHERE `Cơ Sở` = \'?\' ' +
                'AND `Chính Thức` = \'0\' ' +
                'AND (`Ngày Nghỉ Học` IS NULL ' + 
                'OR `Ngày Nghỉ Học` > CONVERT_TZ(NOW(), @@session.time_zone,\'+07:00\')) ';
                query = query.replace( '?' , this.state.branch);
            } break;
            case 'quanly': {
                query = 'SELECT ' +
                'QUANLY.`Mã Quản Lý`, ' +
                'QUANLY.`Hình Ảnh`, ' +
                'QUANLY.`Họ Và Tên`, ' +
                'QUANLY.`Số Điện Thoại`, ' +
                'QUANLY.`Ngày Sinh`, ' +
                'QUANLY.`Email`, ' +
                'QUANLY.`Chức Vụ`, ' +
                'QUANLY.`Ngày Nghỉ` ' +
                'FROM QUANLY ' + 
                'WHERE (`Cơ Sở` = \'!\?!\' ' +
                'OR `Cơ Sở` LIKE \'%!\?!,%\' ' +
                'OR `Cơ Sở` LIKE \'%,!\?!%\' ' +
                'OR `Cơ Sở` = \'ALL\') ';
                query = query.replace(/!\?!/g, this.state.branch);
            } break;
            case 'giaovien': {
                query = 'SELECT ' +
                'GIAOVIEN.`Mã Giáo Viên`, ' +
                'GIAOVIEN.`Hình Ảnh`, ' +
                'GIAOVIEN.`Họ Và Tên`, ' +
                'GIAOVIEN.`Số Điện Thoại`, ' +
                'GIAOVIEN.`Ngày Sinh`, ' +
                'GIAOVIEN.`Email`, ' +
                'GIAOVIEN.`Ngày Nghỉ` ' +
                'FROM GIAOVIEN ' +
                'WHERE (`Cơ Sở` = \'!\?!\' ' +
                'OR `Cơ Sở` LIKE \'%!\?!,%\' ' +
                'OR `Cơ Sở` LIKE \'%,!\?!%\' ' +
                'OR `Cơ Sở` = \'ALL\') ';
                query = query.replace(/!\?!/g, this.state.branch);
            } break;
            case 'marketing': {
                
            } break;
            case 'mardituvan': {
                query = 'SELECT `ID`, `Mã Nhân Viên`, `Họ Và Tên Nhân Viên`, `Họ Và Tên`, `Lớp`, `Số Điện Thoại`, `Ngày Sinh`, `Địa Chỉ`, ' +
                '`Họ Và Tên (NT1)`, `Số Điện Thoại (NT1)`,  `Nghề Nghiệp (NT1)`, ' +
                '`Họ Và Tên (NT2)`, `Số Điện Thoại (NT2)`, `Nghề Nghiệp (NT2)`, `Tên Trường` ' +
                'FROM DATADITUVAN ' +
                'WHERE DATADITUVAN.`Cơ Sở`=\'?\' ';
                query = query.replace(/\?/g, this.state.branch);
            } break;
            case 'margoituvan': {
                query = 'SELECT GOIDIENTUVAN_VIEW.`ID`, ' +
                'GOIDIENTUVAN_VIEW.`ID-DATA`, ' +
                'GOIDIENTUVAN_VIEW.`Mã Nhân Viên`, ' +
                'GOIDIENTUVAN_VIEW.`Họ Tên Nhân Viên`, ' +
                'GOIDIENTUVAN_VIEW.`Họ Và Tên`, ' +
                'GOIDIENTUVAN_VIEW.`Lớp`, ' +
                'GOIDIENTUVAN_VIEW.`Tên Trường`, ' +
                'GOIDIENTUVAN_VIEW.`Số Điện Thoại`, ' +
                'GOIDIENTUVAN_VIEW.`Ngày Kế Hoạch`, ' +
                'GOIDIENTUVAN_VIEW.`Kế Hoạch`, ' +
                'GOIDIENTUVAN_VIEW.`Ngày Gọi`, ' +
                'GOIDIENTUVAN_VIEW.`Tình Trạng Cuộc Gọi`, ' +
                'GOIDIENTUVAN_VIEW.`Chương Trình Gọi`, ' +
                'GOIDIENTUVAN_VIEW.`Loại Thái Độ`, ' +
                'GOIDIENTUVAN_VIEW.`Loại Nhu Cầu`, ' +
                'GOIDIENTUVAN_VIEW.`Tình Hình Sử Dụng Sản Phẩm`, ' +
                'GOIDIENTUVAN_VIEW.`Kế Hoạch Học Hè`, ' +
                'GOIDIENTUVAN_VIEW.`Thời Gian PH Hẹn Lên`, ' +
                'GOIDIENTUVAN_VIEW.`Nội Dung Cuộc Gọi` ' +
                'FROM GOIDIENTUVAN_VIEW ' +
                'WHERE GOIDIENTUVAN_VIEW.`Cơ Sở` = \'!\?!\'';
                query = query.replace('!\?!', this.state.branch);
            } break;
            case 'mardatatong': {
                query = 'SELECT `ID`, `Họ Và Tên`, `Lớp`, `Số Điện Thoại`, `Ngày Sinh`, `Địa Chỉ`, ' +
                '`Họ Và Tên (NT1)`, `Số Điện Thoại (NT1)`,  `Nghề Nghiệp (NT1)`, ' +
                '`Họ Và Tên (NT2)`, `Số Điện Thoại (NT2)`, `Nghề Nghiệp (NT2)`, `Tên Trường` ' +
                'FROM DATA_TRUONGTIEMNANG ' +
                'WHERE DATA_TRUONGTIEMNANG.`Cơ Sở`=\'!\?!\' ' +
                'AND DATA_TRUONGTIEMNANG.`Nguồn` LIKE \'data%\'';
                query = query.replace('!\?!', this.state.branch);
            } break;
            case 'margoidata': {
                query = 'SELECT GOIDIENDATA_VIEW.`ID`, ' +
                'GOIDIENDATA_VIEW.`ID-DATA`, ' +
                'GOIDIENDATA_VIEW.`Mã Nhân Viên`, ' +
                'GOIDIENDATA_VIEW.`Họ Tên Nhân Viên`, ' +
                'GOIDIENDATA_VIEW.`Họ Và Tên`, ' +
                'GOIDIENDATA_VIEW.`Lớp`, ' +
                'GOIDIENDATA_VIEW.`Tên Trường`, ' +
                'GOIDIENDATA_VIEW.`Số Điện Thoại`, ' +
                'GOIDIENDATA_VIEW.`Ngày Kế Hoạch`, ' +
                'GOIDIENDATA_VIEW.`Kế Hoạch`, ' +
                'GOIDIENDATA_VIEW.`Ngày Gọi`, ' +
                'GOIDIENDATA_VIEW.`Tình Trạng Cuộc Gọi`, ' +
                'GOIDIENDATA_VIEW.`Chương Trình Gọi`, ' +
                'GOIDIENDATA_VIEW.`Loại Thái Độ`, ' +
                'GOIDIENDATA_VIEW.`Loại Nhu Cầu`, ' +
                'GOIDIENDATA_VIEW.`Tình Hình Sử Dụng Sản Phẩm`, ' +
                'GOIDIENDATA_VIEW.`Kế Hoạch Học Hè`, ' +
                'GOIDIENDATA_VIEW.`Thời Gian PH Hẹn Lên`, ' +
                'GOIDIENDATA_VIEW.`Nội Dung Cuộc Gọi` ' +
                'FROM GOIDIENDATA_VIEW ' +
                'WHERE `Cơ Sở`=\'?\' AND (isOLD = \'0\' OR isOLD IS NULL)';
                query = query.replace('?', this.state.branch);
            } break;
            case 'marphattoroi': {
                query = 'SELECT BANGRONTOROI_VIEW.`ID`, ' +
                'BANGRONTOROI_VIEW.`Mã Nhân Viên`, ' +
                'BANGRONTOROI_VIEW.`Họ Và Tên`, ' +
                'BANGRONTOROI_VIEW.`Ngày Thực Hiện`, ' +
                'BANGRONTOROI_VIEW.`Số Lượng`, ' +
                'BANGRONTOROI_VIEW.`Trường`, ' +
                'BANGRONTOROI_VIEW.`Địa Điểm` ' +
                'FROM quanlyhocsinh.BANGRONTOROI_VIEW ' +
                'WHERE BANGRONTOROI_VIEW.`Loại` = \'toroi\' AND BANGRONTOROI_VIEW.`Cơ Sở` = \'?\'';
                query = query.replace('?', this.state.branch);
            } break;
            case 'martreobangron': {
                query = 'SELECT BANGRONTOROI_VIEW.`ID`, ' +
                'BANGRONTOROI_VIEW.`Mã Nhân Viên`, ' +
                'BANGRONTOROI_VIEW.`Họ Và Tên`, ' +
                'BANGRONTOROI_VIEW.`Ngày Thực Hiện`, ' +
                'BANGRONTOROI_VIEW.`Số Lượng`, ' +
                'BANGRONTOROI_VIEW.`Trường`, ' +
                'BANGRONTOROI_VIEW.`Địa Điểm` ' +
                'FROM quanlyhocsinh.BANGRONTOROI_VIEW ' +
                'WHERE BANGRONTOROI_VIEW.`Loại` = \'bangron\' AND BANGRONTOROI_VIEW.`Cơ Sở` = \'?\'';
                query = query.replace('?', this.state.branch);
            } break;
            case 'marchuongtrinhphatdong': {
                
            } break;
            case 'cskh': {
                query = 'SELECT * FROM CHAMSOCKHACHHANG_VIEW WHERE `Cơ Sở` = \'!\?!\' ' +
                'AND EXISTS(SELECT * FROM USERS WHERE USERS.`User ID` = CHAMSOCKHACHHANG_VIEW.`User ID` AND USERS.`Ngày Nghỉ Học` IS NULL) ';
                query = query.replace('!\?!', this.state.branch);
                switch (this.state.userInformation.permission) {
                    case 'tbmanhvan':
                    case 'tbmvanhoa':
                    case 'giaovien':
                        query = null;
                        break;
                    default:
                }
            } break;
            case 'cskhsolienlac': {
                query = 'SELECT * FROM REPORTCSKH_VIEW ' +
                'WHERE REPORTCSKH_VIEW.`branch` = \'!\?!\' ';
                query = query.replace('!\?!', this.state.branch);
                if (this.state.userInformation.permission == 'tbmanhvan'
                || this.state.userInformation.permission == 'tbmvanhoa'
                || this.state.userInformation.permission == 'giaovien') {
                    query += 'AND `Mã Nhân Viên Phản Hồi` = \'!\?!\' ';
                    query = query.replace('!\?!', this.state.userInformation.account_id);
                }
            } break;
            case 'cskhdangkyhangngay': {
                query = 'SELECT * FROM DATADANGKYHANGNGAY_VIEW ' +
                'WHERE `Cơ Sở`=\'?\'';
                query = query.replace('?', this.state.branch);
            } break;
            case 'cskhgoidangkyhangngay': {
                query = 'SELECT * FROM GOIDIENDANGKYHANGNGAY_VIEW ' +
                'WHERE `Cơ Sở`=\'?\' AND (isOLD = \'0\' OR isOLD IS NULL)';
                query = query.replace('?', this.state.branch);
            } break;
            case 'cskhchamsockhcu': {
                query = 'SELECT * FROM quanlyhocsinh.CALLCHAMSOCKHACHHANGCU_VIEW ' +
                'WHERE `Cơ Sở`=\'?\' ';
                query = query.replace('?', this.state.branch);
            } break;
            case 'lophoc': {
                query = 'SELECT LOPHOC_VIEW.`Mã Lớp`, ' + 
                'LOPHOC_VIEW.`Mã Lớp`, ' + 
                'LOPHOC_VIEW.`Mã Môn Học`, ' + 
                'LOPHOC_VIEW.`Tên Môn`, ' + 
                'LOPHOC_VIEW.`Lớp`, ' + 
                'LOPHOC_VIEW.`Mã Giáo Viên`, ' + 
                'LOPHOC_VIEW.`Họ Và Tên`, ' + 
                'LOPHOC_VIEW.`Số Lượng Học Sinh`, ' + 
                'LOPHOC_VIEW.`Ngày Bắt Đầu`, ' + 
                'LOPHOC_VIEW.`Ngày Kết Thúc` ' + 
                'FROM LOPHOC_VIEW WHERE `branch` = \'!\?!\' AND CONVERT_TZ(CURDATE(), @@session.time_zone,\'+07:00\') <= LOPHOC_VIEW.`Ngày Kết Thúc` ';
                query = query.replace('!\?!', this.state.branch);
                if (this.state.userInformation.permission == 'giaovien') {
                    query += 'AND `Mã Giáo Viên` = \'?\'';
                    query = query.replace('?' , this.state.userInformation.account_id);
                }
                if (this.state.userInformation.permission == 'quanly') {
                    query += 'AND EXISTS (SELECT * FROM DANHSACHMONHOC WHERE DANHSACHMONHOC.`mamon` = LOPHOC.`Mã Môn Học` ' +
                    'AND EXISTS (SELECT * FROM QUANLY WHERE DANHSACHMONHOC.`managerAllow` LIKE CONCAT(\'%\',`Chức Vụ`,\'%\') AND `Mã Quản Lý` = \'?\'))';
                    query = query.replace('?' , this.state.userInformation.account_id);
                }
            } break;
            case 'lophocketthuc': {
                query = 'SELECT LOPHOC_VIEW.`Mã Lớp`, ' + 
                'LOPHOC_VIEW.`Mã Lớp`, ' + 
                'LOPHOC_VIEW.`Mã Môn Học`, ' + 
                'LOPHOC_VIEW.`Tên Môn`, ' + 
                'LOPHOC_VIEW.`Lớp`, ' + 
                'LOPHOC_VIEW.`Mã Giáo Viên`, ' + 
                'LOPHOC_VIEW.`Họ Và Tên`, ' + 
                'LOPHOC_VIEW.`Số Lượng Học Sinh`, ' + 
                'LOPHOC_VIEW.`Ngày Bắt Đầu`, ' + 
                'LOPHOC_VIEW.`Ngày Kết Thúc`, ' + 
                'LOPHOC_VIEW.`Lý Do Kết Thúc`, ' + 
                'LOPHOC_VIEW.`Mã Nhân Viên KT Lớp`, ' + 
                'LOPHOC_VIEW.`Họ Và Tên Nhân Viên` ' + 
                'FROM LOPHOC_VIEW WHERE `branch` = \'!\?!\' AND CONVERT_TZ(CURDATE(), @@session.time_zone,\'+07:00\') > LOPHOC_VIEW.`Ngày Kết Thúc` ';
                query = query.replace('!\?!', this.state.branch);
            } break;
            case 'hoadon': {
                query = 'SELECT ' +
                'BIENLAIHOCPHI_VIEW.`ID`, ' + 
                'BIENLAIHOCPHI_VIEW.`Mã Phiếu`, ' + 
                'BIENLAIHOCPHI_VIEW.`Mã Nhân Viên`, ' + 
                'BIENLAIHOCPHI_VIEW.`Họ Và Tên Nhân Viên`, ' +
                'BIENLAIHOCPHI_VIEW.`Mã Người Đóng Phí`, ' + 
                'BIENLAIHOCPHI_VIEW.`Họ Và Tên Người Đóng Phí`, ' + 
                'BIENLAIHOCPHI_VIEW.`Lớp`, ' + 
                'BIENLAIHOCPHI_VIEW.`Nội Dung`, ' +
                'BIENLAIHOCPHI_VIEW.`Ngày Lập Hóa Đơn`, ' + 
                'BIENLAIHOCPHI_VIEW.`Số Tháng Đóng`, ' + 
                'BIENLAIHOCPHI_VIEW.`Ngày Đầu Chu Kỳ`, ' + 
                'BIENLAIHOCPHI_VIEW.`Ngày Cuối Chu Kỳ`, ' + 
                'BIENLAIHOCPHI_VIEW.`Tổng`, ' + 
                'BIENLAIHOCPHI_VIEW.`Tổng Đã Giảm Giá`, ' + 
                'BIENLAIHOCPHI_VIEW.`Đã Thanh Toán`, ' + 
                'BIENLAIHOCPHI_VIEW.`Còn Nợ` ' +
                'FROM BIENLAIHOCPHI_VIEW ' +
                'WHERE BIENLAIHOCPHI_VIEW.`Cơ Sở` = \'?\' AND ' +
                'BIENLAIHOCPHI_VIEW.`Ngày Hủy Phiếu` IS NULL';
                query = query.replace('?', this.state.branch);
            } break;
            case 'hoadonhuy': {
                query = 'SELECT ' +
                'BIENLAIHOCPHI_VIEW.`ID`, ' + 
                'BIENLAIHOCPHI_VIEW.`Mã Phiếu`, ' + 
                'BIENLAIHOCPHI_VIEW.`Mã Nhân Viên`, ' + 
                'BIENLAIHOCPHI_VIEW.`Họ Và Tên Nhân Viên`, ' +
                'BIENLAIHOCPHI_VIEW.`Mã Người Đóng Phí`, ' + 
                'BIENLAIHOCPHI_VIEW.`Họ Và Tên Người Đóng Phí`, ' + 
                'BIENLAIHOCPHI_VIEW.`Lớp`, ' + 
                'BIENLAIHOCPHI_VIEW.`Nội Dung`, ' +
                'BIENLAIHOCPHI_VIEW.`Ngày Lập Hóa Đơn`, ' + 
                'BIENLAIHOCPHI_VIEW.`Số Tháng Đóng`, ' + 
                'BIENLAIHOCPHI_VIEW.`Ngày Đầu Chu Kỳ`, ' + 
                'BIENLAIHOCPHI_VIEW.`Ngày Cuối Chu Kỳ`, ' + 
                'BIENLAIHOCPHI_VIEW.`Tổng`, ' + 
                'BIENLAIHOCPHI_VIEW.`Tổng Đã Giảm Giá`, ' + 
                'BIENLAIHOCPHI_VIEW.`Đã Thanh Toán`, ' + 
                'BIENLAIHOCPHI_VIEW.`Còn Nợ`, ' +
                'BIENLAIHOCPHI_VIEW.`Mã Nhân Viên Hủy`, ' +
                'BIENLAIHOCPHI_VIEW.`Họ Và Tên Nhân Viên Hủy`, ' +
                'BIENLAIHOCPHI_VIEW.`Ngày Hủy Phiếu`, ' +
                'BIENLAIHOCPHI_VIEW.`Lý Do Hủy` ' +
                'FROM BIENLAIHOCPHI_VIEW ' +
                'WHERE BIENLAIHOCPHI_VIEW.`Cơ Sở` = \'?\' AND ' +
                'BIENLAIHOCPHI_VIEW.`Ngày Hủy Phiếu` IS NOT NULL';
                query = query.replace('?', this.state.branch);
            } break;            
            case 'hoadonnohocphi': {
                query = 'SELECT USERS.`ID`, ' +
                'USERS.`User ID`, ' +
                // 'USERS.`Hình Ảnh`, ' +
                'USERS.`Họ Và Tên`, ' +
                'USERS.`Lớp`, ' +
                'USERS.`Tên Trường`, ' +                
                'USERS.`Số Điện Thoại`, ' +
                'dkmh.`monhoc` AS `Môn Học Đã Đăng Ký`, ' +
                'tb.`Cuối Chu Kỳ` AS `Ngày Tới Hạn`, ' +
                'tb.`Nội Dung` AS `Tổng Thu Tạm Tính`, ' +
                'USERS.`Cơ Sở` ' +
                'FROM USERS ' +
                'LEFT JOIN (SELECT `User ID` as userid, monhoc FROM DANGKIMONHOC) as dkmh ON dkmh.`userid` = USERS.`User ID` ' +
                'LEFT JOIN (SELECT tb1.`User ID` as userid, tb1.`Cuối Chu Kỳ`, tb1.`Nội Dung` ' +
                    'FROM (SELECT * FROM BIENLAIHOCPHI WHERE `Ngày Hủy Phiếu` IS NULL AND `Nội Dung` NOT LIKE \'@@@%\') AS tb1 ' +
                    'LEFT JOIN (SELECT * FROM BIENLAIHOCPHI WHERE `Ngày Hủy Phiếu` IS NULL AND `Nội Dung` NOT LIKE \'@@@%\') AS tb2 ' +
                    'ON (tb1.`User ID` = tb2.`User ID` ' +
                    'AND tb2.`Cuối Chu Kỳ` > tb1.`Cuối Chu Kỳ`) ' +
                    'WHERE tb2.`Cuối Chu Kỳ` IS NULL) as tb ' +
                'ON (tb.`userid` = USERS.`User ID`) ' +
                'WHERE USERS.`Cơ Sở` = \'!\?!\' ' +
                'AND USERS.`Chính Thức` = \'1\' ' +
                'AND (USERS.`Ngày Nghỉ Học` IS NULL OR USERS.`Ngày Nghỉ Học` > CONVERT_TZ(NOW(), @@session.time_zone,\'+07:00\')) ' +
                'ORDER BY USERS.`ID` ASC ';
                query = query.replace('!\?!', this.state.branch);
                subQuery = 'SELECT * FROM BIENLAIHOCPHI WHERE ' +
                'EXISTS (SELECT * FROM USERS ' +
                'WHERE USERS.`Chính Thức` = \'1\' ' +
                'AND (USERS.`Ngày Nghỉ Học` IS NULL OR USERS.`Ngày Nghỉ Học` > CONVERT_TZ(NOW(), @@session.time_zone,\'+07:00\')) ' +
                'AND USERS.`User ID` = BIENLAIHOCPHI.`User ID`) ' +
                'AND BIENLAIHOCPHI.`Nội Dung` NOT LIKE \'@@@%\' ' +
                'AND BIENLAIHOCPHI.`Ngày Hủy Phiếu` IS NULL ' +
                'AND BIENLAIHOCPHI.`Cơ Sở` = \'!\?!\'; ';                
                subQuery = subQuery.replace('!\?!', this.state.branch);
            } break;
            case 'tasksmanager': {
                let TaskManager = require('../form/tasks/taskmanager');
                ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                ReactDOM.render(
                    <Provider store={store}>
                        <TaskManager userInformation={this.state.userInformation}/>
                    </Provider>,
                    document.getElementById('form-react')            
                );
            } break;
            case 'register': {
                let GhiDanh = require('../form/hocsinh/ghidanh/SelectGhiDanh');
                ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                ReactDOM.render(
                    <Provider store={store}>
                        <GhiDanh />
                    </Provider>,
                    document.getElementById('form-react')            
                );
            } break;
            case 'taiff': {
                let BieuPhi = require('../form/bieuphi/BieuPhi');
                ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                ReactDOM.render(
                    <Provider store={store}>
                        <BieuPhi/>
                    </Provider>,
                    document.getElementById('form-react')            
                );
            } break;
            case 'tuitionDebt': {
                let NoHocPhi = require('../form/hoadon/NoHocPhi');
                ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                ReactDOM.render(
                    <Provider store={store}>
                        <NoHocPhi />
                    </Provider>,
                    document.getElementById('form-react')
                );
            } break;
            case 'hotline': {
                let Hotline = require('../form/hotline/Hotline');
                ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                ReactDOM.render(
                    <Provider store={store}>
                        <Hotline/>
                    </Provider>,
                    document.getElementById('form-react')            
                );                
            } break;
            case 'exportexcel': {
                if (this.state.options != null
                    && this.state.options.showQuery != null) {
                    if (this.state.options.numberOfRows != null
                        && this.state.options.numberOfRows <= 0) {
                        store.dispatch({
                            type: 'ALERT_NOTIFICATION_ADD',
                            content: 'Không tìm thấy dữ liệu để xuất tệp excel!',
                            notifyType: 'warning',
                        })
                        return;
                    } else {
                        let showQuery = this.state.options.showQuery;
                        let query = 'SELECT `COLUMN_NAME` ' +
                        'FROM `INFORMATION_SCHEMA`.`COLUMNS` ' +
                        'WHERE `TABLE_SCHEMA`=\'quanlyhocsinh\' ' +
                        'AND `TABLE_NAME`=\'?\'; '
                        let start = showQuery.indexOf(' FROM ') + ' FROM '.length;
                        let end = showQuery.indexOf(' ', start);
                        let tname= showQuery.substring(start, end).split('.');
                        if (tname.length > 1) {
                            tname = tname[1];
                        } else {
                            tname = tname[0];
                        }
                        query = query.replace('?', tname);
            
                        let indexwhere = showQuery.indexOf(' FROM ')
                        let tableexport = '';
                        if (indexwhere != -1) {
                            tableexport = showQuery.substr(indexwhere, showQuery.length);
                        }
                        if (this.state.options.subQuery != null) {
                            query += this.state.options.subQuery;
                        }
                        
                        this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
                            fn: 'home_body_sheetjs_xuatexcels_getcolumn',
                            tableexport: tableexport,
                            tablename: tname,
                        })
                    }
                } else {
                    store.dispatch({
                        type: 'ALERT_NOTIFICATION_ADD',
                        content: 'Vui lòng chọn bảng để có thể xuất tệp excel!',
                        notifyType: 'warning',
                    })
                }
            } break;
            case 'importexcel': {
                if (this.state.menuSelected != null) {
                    let ImportExcel = require('../form/sheetjs/Import');
                    ReactDOM.render(
                        <Provider store={store}>
                            <ImportExcel 
                                menuSelected={this.state.menuSelected}
                                label={this.state.title}
                            />
                        </Provider>,
                        document.getElementById('form-react')
                    );
                } else {
                    store.dispatch({
                        type: 'ALERT_NOTIFICATION_ADD',
                        content: 'Vui lòng chọn danh sách để có thể nhập tệp excel!',
                        notifyType: 'warning',
                    })
                }
            } break;
            case 'adminaccess': {
                let Access = require('../form/admin/access/Access');
                ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                ReactDOM.render(
                    <Provider store={store}>
                        <Access
                            userInformation={this.state.userInformation}
                        />
                    </Provider>,
                    document.getElementById('form-react')            
                );   
            } break;
            case 'timekeeper': {
                let TimeKeeper = require('../form/timekeeper/TimeKeeper');
                ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                ReactDOM.render(
                    <Provider store={store}>
                        <TimeKeeper/>
                    </Provider>,
                    document.getElementById('form-react')            
                );
            } break;
            default:
                break;
        }
        
        if (query != null) {
            let checkPermission = JSON.parse(value.permissionAllow);
            for (let i of checkPermission) {
                if (i.permission == this.state.userInformation.permission) {
                    if (i.actionAllow != 'all') {                        
                        let check = i.actionAllow.split(',');
                        for (let ac of value.action.split(',')) {     
                            if (check.indexOf(ac) != -1) {
                                actionAllow.push(ac);
                            }
                        }
                    } else {
                        actionAllow = value.action.split(',');
                    }
                    break;
                }
            }
            this.setState({
                menuSelected: value.name,
                actionAllow: actionAllow,
                _actionAllow: actionAllow,
                title: value.label,
            })
            let queryGetCount = 'SELECT ' +
            'CONCAT(\'SELECT COUNT(\', \'`!~!`.\', SUBSTRING_INDEX(GROUP_CONCAT(CONCAT(\'`\', column_name, \'`\')), \',\', 1), \') AS COUNT FROM !\?!\') AS query ' +
            'FROM information_schema.columns ' +
            'WHERE table_schema=DATABASE() ' +
            'AND table_name=\'!\?!\';';
            let temp = query;
            let i;
            if (temp.indexOf(' FROM ') != -1) {
                i = temp.indexOf(' FROM ');
            } else if (temp.indexOf(' from ') != -1) {
                i = temp.indexOf(' from ');
            }
            i += ' FROM '.length;
            temp = temp.substr(i, temp.length);
            queryGetCount = queryGetCount.replace('!\?!', temp.replace(/\'/g, '\\\''));
            i = temp.indexOf(' ');
            if (i != -1) {
                temp = temp.substr(0, i);
            }
            let tname= temp.split('.');
            if (tname.length > 1) {
                tname = tname[1];
            } else {
                tname = tname[0];
            }
            queryGetCount = queryGetCount.replace('!\?!', tname);
            queryGetCount = queryGetCount.replace('!~!', tname);
            
            this.SocketEmit('gui-query-den-database', queryGetCount, 'laydulieu_trave', {
                fn: 'home_body_countQuery',
                data: {
                    showQuery: query,
                    subQuery: subQuery,
                },
            });
        }
        this.setState({isShowMenu: false});
    }

    onTableRightClick () {
        let data = arguments[0];
        let location = arguments[1];
        let functionContextMenu = [];

        functionContextMenu.push({
            label: 'Làm Mới', 
            onClick: (() => {this.selectPage(this.state.LimitStart)}), 
            style:{
                borderBottom: '1px solid #fff',
            }
        });

        if (this.state.actionAllow != null) {            
            for (let action of this.state.actionAllow) {
                switch (action) {
                    case 'add': {
                        functionContextMenu.push({
                            label: 'Thêm',
                            onClick: this.onAddClick.bind(this),
                        });
                    } break;
                    case 'edit': {
                        if (data != null) {
                            functionContextMenu.push({
                                label: 'Sửa', 
                                onClick: this.onEditClick.bind(this, data),
                            });
                            
                        }
                    } break;
                    case 'infor': {
                        if (data != null) {
                            functionContextMenu.push({
                                label: 'Thông Tin', 
                                onClick: this.onInforClick.bind(this, data),
                            });
                        }
                    } break;
                    case 'remove': {
                        if (data != null) {
                            functionContextMenu.push({
                                label: 'Xóa', 
                                onClick: this.onRemoveClick.bind(this, data),
                            });
                        }
                    } break;
                    case 'dkmh': {
                        if (data != null) {
                            functionContextMenu.push({
                                label: 'Đăng Ký Môn Học', 
                                onClick: this.onDKMHClick.bind(this, data),
                            });
                        }
                    } break;
                    case 'deactivate': {
                        if (data != null) {
                            functionContextMenu.push({
                                label: 'Nghỉ', 
                                onClick: this.onDeactivateClick.bind(this, data),
                            });
                        }
                    } break;
                    case 'call': {
                        if (data != null) {
                            functionContextMenu.push({
                                label: 'Gọi Điện', 
                                onClick: this.onCallClick.bind(this, data),
                            });
                        }
                    } break;
                    case 'recall': {
                        if (data != null) {
                            functionContextMenu.push({
                                label: 'Gọi Lại', 
                                onClick: this.onRecallClick.bind(this, data),
                            });
                        }
                    } break;
                    case 'newcall': {
                        functionContextMenu.push({
                            label: 'Gọi Mới', 
                            onClick: this.onNewcallClick.bind(this),
                        });
                    } break;
                    case 'plancall': {
                        functionContextMenu.push({
                            label: 'Gọi Kế Hoạch', 
                            onClick: this.onPlancallClick.bind(this),
                        });
                    } break;
                    case 'traibuoi': {
                        if (data != null) {
                            functionContextMenu.push({
                                label: 'Xếp Lịch Trái Buổi', 
                                onClick: this.onTraiBuoiClick.bind(this, data),
                            });
                            functionContextMenu.push({
                                label: 'Sửa lịch dạy', 
                                onClick: this.onEditTeachClick.bind(this, data),
                            });
                        }
                    } break;
                    case 'score': {
                        if (data != null) {
                            functionContextMenu.push({
                                label: 'Bảng Điểm', 
                                onClick: this.onScoreClick.bind(this, data),
                            });
                        }
                    } break;
                    case 'pay': {
                        if (data != null) {
                            functionContextMenu.push({
                                label: 'Đóng Tiền Học', 
                                onClick: this.onPayClick.bind(this, data),
                            });
                        }
                    } break;
                    case 'payanother': {
                        if (data != null) {
                            functionContextMenu.push({
                                label: 'Thu Phí Khác', 
                                onClick: this.onPayanotherClick.bind(this, data),
                            });
                        }
                    } break;
                    case 'payowe': {
                        if (data != null) {
                            functionContextMenu.push({
                                label: 'Đóng Tiền Nợ', 
                                onClick: this.onPayoweClick.bind(this, data),
                            });
                        }
                    } break;
                    case 'cskh': {
                        if (data != null) {
                            functionContextMenu.push({
                                label: 'Chăm Sóc Khách Hàng', 
                                onClick: this.onCSKHClick.bind(this, data),
                            });
                        }
                    } break;
                    case 'responses': {
                        if (data != null) {
                            functionContextMenu.push({
                                label: 'Phản Hồi', 
                                onClick: this.onResponsesClick.bind(this, data),
                            });
                        }
                    } break;
                    case 'happinessscore': {
                        if (data != null) {
                            functionContextMenu.push({
                                label: 'Điểm Hạnh Phúc', 
                                onClick: this.onHappinessScoreClick.bind(this, data),
                            });
                        }
                    } break;
                    default:
                        break;                        
                }
            }
        }

        if (location != null) {
            this.setState({
                locationContextMenu: location,
                functionContextMenu,
                isShowContext: true,
            });
        }
    }

    onAddClick () {
        switch (this.state.menuSelected) {
            case 'quanly': {
                if (this.state.userInformation != null && this.state.userInformation.khuvuc != null) {
                    let QLAdd = require('../form/staff/Staff');
                    ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                    ReactDOM.render(
                        <Provider store={store}>
                            <QLAdd
                                listBranch={this.state.userInformation.khuvuc.split(',')}
                            />
                        </Provider>,
                        document.getElementById('form-react')            
                    );
                }
            } break;
            case 'giaovien': {
                if (this.state.userInformation != null && this.state.userInformation.khuvuc != null) {
                    let GVAdd = require('../form/staff/Staff');
                    ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                    ReactDOM.render(
                        <Provider store={store}>
                            <GVAdd
                                listBranch={this.state.userInformation.khuvuc.split(',')}
                                add={'giaovien'}
                            />
                        </Provider>,
                        document.getElementById('form-react')            
                    );
                }
            } break;
            case 'marketing': {
            
            } break;
            case 'mardituvan': {
                let ThemDataTuvan = require('../form/marketing/data/ThemData');
                ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                ReactDOM.render(
                    <Provider store={store}>
                        <ThemDataTuvan 
                            action="add"
                            source="dituvan"
                            title="Data Đi Tư Vấn"
                        />
                    </Provider>,
                    document.getElementById('form-react')            
                );
            } break;
            case 'margoituvan': {
            } break;
            case 'mardatatong': {
                let ThemData = require('../form/marketing/data/ThemData');
                ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                ReactDOM.render(
                    <Provider store={store}>
                        <ThemData
                            action="add"
                            title="Data Tổng"
                        />
                    </Provider>,
                    document.getElementById('form-react')            
                );
            } break;
            case 'margoidata': {
            } break;
            case 'marphattoroi': {
                let PhatToRoi = require('../form/marketing/BangRonToRoi');
                ReactDOM.render(
                    <Provider store={store}>
                        <PhatToRoi title='Thêm Phát Tờ Rơi' type='toroi' action='add'/>
                    </Provider>,
                    document.getElementById('form-react')            
                );
            } break;
            case 'martreobangron': {
                let TreoBangRon = require('../form/marketing/BangRonToRoi');
                ReactDOM.render(
                    <Provider store={store}>
                        <TreoBangRon title='Thêm Treo Băng Rôn' type='bangron' action='add'/>
                    </Provider>,
                    document.getElementById('form-react')            
                );
            } break;
            case 'marchuongtrinhphatdong': {
                
            } break;
            case 'cskhdangkyhangngay': {
                let AddDKHN = require('../form/chamsockhachhang/dangkyhangngay/ThemDangKyHangNgay');
                ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                ReactDOM.render(
                    <Provider store={store}>
                        <AddDKHN action="add"/>
                    </Provider>,
                    document.getElementById('form-react')            
                );
            } break;
            case 'lophoc': {
                let LopHoc = require('../form/lophoc/LopHoc');
                ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                ReactDOM.render(
                    <Provider store={store}>
                        <LopHoc
                            action="add"
                        />
                    </Provider>,
                    document.getElementById('form-react')            
                );
            } break;
            case 'hoadon': {
                let SelectPhieuThu = require('../form/hoadon/phieuthu/SelectPhieuThu');
                ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                ReactDOM.render(
                    <Provider store={store}>
                        <SelectPhieuThu />
                    </Provider>,
                    document.getElementById('form-react')
                );
            } break;
        }
    }

    onEditClick () {
        let query;
        if (arguments[0] != null) {
            let cell = arguments[0];
            switch (this.state.menuSelected) {
                case 'hocsinh': {
                    query = 'SELECT * FROM quanlyhocsinh.USERS WHERE `User ID` = \'?\'';
                    query = query.replace('?', cell['User ID']);
                    this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                        fn: 'home_body_loadsuauser',
                    });
                } break;
                case 'hocsinhnghi': {
                    let HSNghi = require('../form/nghi/Nghi');
                    ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                    ReactDOM.render(
                        <Provider store={store}>
                            <HSNghi
                                name={cell['Họ Và Tên']}
                                id={cell['User ID']}
                                menuSelected={'hocsinh'}
                                data={cell}
                                edit
                                staffCode={this.state.userInformation.account_id}
                            />
                        </Provider>
                        , document.getElementById('form-react')
                    );
                } break;
                case 'hocsinhhocthu': {
                } break;
                case 'quanly': {
                    query = 'SELECT QUANLY.*, LOAIQUANLY.`Permission Allow` FROM QUANLY ' +
                    'LEFT JOIN LOAIQUANLY ON QUANLY.`permission` = LOAIQUANLY.`Permission` ' +
                    'WHERE QUANLY.`Mã Quản Lý` = \'!\?!\'';
                    query = query.replace('!\?!', cell['Mã Quản Lý']);
                    this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                        fn: 'home_body_loadsuaquanly',
                    });
                } break;
                case 'giaovien': {
                    query = 'SELECT GIAOVIEN.*, GIAOVIEN.`Mã Giáo Viên` AS `Mã Quản Lý` FROM GIAOVIEN ' +
                    'WHERE GIAOVIEN.`Mã Giáo Viên` = \'!\?!\'';
                    query = query.replace('!\?!', cell['Mã Giáo Viên']);
                    this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                        fn: 'home_body_loadsuagiaovien',
                    });
                } break;
                case 'marketing': {
                } break;
                case 'mardituvan': {
                    query = 'SELECT * FROM quanlyhocsinh.DATA_TRUONGTIEMNANG WHERE `ID` = \'?\'';
                    query = query.replace('?', cell['ID']);
                    this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                        fn : 'home_body_loadsuadituvan',
                    });
                } break;
                case 'margoituvan': {
                } break;
                case 'mardatatong': {
                    query = 'SELECT * FROM quanlyhocsinh.DATA_TRUONGTIEMNANG WHERE `ID` = \'?\'';
                    query = query.replace('?', cell['ID']);
                    this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                        fn : 'home_body_loadsuadulieutruongtiemnang',
                    });
                } break;
                case 'margoidata': {
                } break;
                case 'marphattoroi': {
                    query = 'SELECT * FROM `quanlyhocsinh`.`BANGRONTOROI` WHERE `ID` = \'?\'';
                    query = query.replace('?', cell['ID']);
                    this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                        fn : 'home_body_loadsuatoroi',
                    });
                } break;
                case 'martreobangron': {
                    query = 'SELECT * FROM `quanlyhocsinh`.`BANGRONTOROI` WHERE `ID` = \'?\'';
                    query = query.replace('?', cell['ID']);
                    this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                        fn : 'home_body_loadsuabangron',
                    });
                } break;
                case 'marchuongtrinhphatdong': {
                } break;
                case 'cskh': {
                } break;
                case 'cskhsolienlac': {
                    query = 'SELECT * FROM REPORTCSKH_VIEW WHERE REPORTCSKH_VIEW.`ID` = \'!\?!\' ';
                    query = query.replace('!\?!', cell['ID']);
                    this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                        fn: 'home_body_response_cskh_kiemtranguoiphanhoi',
                        action: 'edit',
                    });
                } break;
                case 'cskhdangkyhangngay': {
                    query = 'SELECT * FROM quanlyhocsinh.DATADANGKYHANGNGAY WHERE `ID` = \'?\'';
                    query = query.replace('?', cell['ID']);
                    this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                        fn : 'home_body_loadsuadatadangkyhangngay',
                    });
                } break;
                case 'cskhgoidangkyhangngay': {
                } break;
                case 'cskhchamsockhcu': {
                } break;
                case 'lophoc': {
                    query = 'SELECT LOPHOC.*, DANHSACHMONHOC.`name` FROM quanlyhocsinh.LOPHOC ' +
                    'LEFT JOIN DANHSACHMONHOC on DANHSACHMONHOC.`mamon` = LOPHOC.`Mã Môn Học`'+
                    'WHERE `Mã Lớp` = \'~\'';
                    query = query.replace('~', cell['Mã Lớp']);
                    this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', { 
                        fn : 'home_body_loadsualophoc'
                    });
                } break;
                case 'hoadon': {
                } break;
                case 'hoadonhuy': {
                } break;
            }
        }
    }
    onEditTeachClick () {
        let query;
        if (arguments[0] != null) {
            let cell = arguments[0];
            switch (this.state.menuSelected){
                case 'lophoc': {
                    let SuaLichDay = require('../form/lophoc/Edit/SuaLichDay');
                    ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                    ReactDOM.render(
                        <Provider store={store}>
                            <SuaLichDay classid={cell['Mã Lớp']} teacherid={cell['Mã Giáo Viên']}/>
                        </Provider>,
                        document.getElementById('form-react')
                    );
                } break;

            }
        }
    }

    onInforClick () {
        let query;
        if (arguments[0] != null) {
            let cell = arguments[0];
            switch (this.state.menuSelected) {
                case 'hocsinh': {
                } break;
                case 'hocsinhnghi': {
                } break;
                case 'hocsinhhocthu': {
                } break;
                case 'quanly': {
                } break;
                case 'giaovien': {
                } break;
                case 'marketing': {
                
                } break;
                case 'mardituvan': {
                    query = 'SELECT * FROM quanlyhocsinh.BANGTHONGTIN'
                    this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                        fn: 'home_body_information_loadbangthongtin',
                        id: cell['ID'],
                        row: 'data',
                    });
                } break;
                case 'margoituvan': {
                    query = 'SELECT * FROM quanlyhocsinh.BANGTHONGTIN'
                    this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                        fn: 'home_body_information_loadbangthongtin',
                        id: cell['ID-DATA'],
                        row: 'data',
                    });
                } break;
                case 'mardatatong': {
                    query = 'SELECT * FROM quanlyhocsinh.BANGTHONGTIN'
                    this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                        fn: 'home_body_information_loadbangthongtin',
                        id: cell['ID'],
                        row: 'data',
                    });
                } break;
                case 'margoidata': {
                    query = 'SELECT * FROM quanlyhocsinh.BANGTHONGTIN'
                    this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                        fn: 'home_body_information_loadbangthongtin',
                        id: cell['ID-DATA'],
                        row: 'data',
                    });
                } break;
                case 'marphattoroi': {
                } break;
                case 'martreobangron': {
                } break;
                case 'marchuongtrinhphatdong': {
                    
                } break;
                case 'cskh': {
                    query = 'SELECT * FROM quanlyhocsinh.BANGTHONGTIN'
                    this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                        fn: 'home_body_information_loadbangthongtin',
                        id: cell['User ID'],
                        row: 'cskh',
                    });
                } break;
                case 'cskhsolienlac': {
                } break;
                case 'cskhdangkyhangngay': {
                } break;
                case 'cskhgoidangkyhangngay': {
                } break;
                case 'cskhchamsockhcu': {
                    query = 'SELECT * FROM quanlyhocsinh.BANGTHONGTIN'
                    this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                        fn: 'home_body_information_cskh_loadbangthongtin',
                        id: cell['User ID'],
                    });
                } break;
                case 'lophoc': {
                    let ThongTinLopHoc = require('../form/information/lophoc/LopHoc');
                    ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                    ReactDOM.render(
                        <Provider store={store}>
                            <ThongTinLopHoc classid={cell['Mã Lớp']}/>
                        </Provider>,
                        document.getElementById('form-react')
                    );
                } break;
                case 'hoadon': {
                    query = 'SELECT * FROM quanlyhocsinh.BIENLAIHOCPHI WHERE `ID` = \'?\'; ';
                    query = query.replace('?', cell['ID']);
                    this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                        fn: 'home_body_loadthongtinhoadon',
                    });
                } break;
                case 'hoadonhuy': {
                } break;
            }
        }
    }

    onRemoveClick () {
        let query;
        if (arguments[0] != null) {
            let cell = arguments[0];
            switch (this.state.menuSelected) {
                case 'hocsinh': {
                } break;
                case 'hocsinhnghi': {
                } break;
                case 'hocsinhhocthu': {
                } break;
                case 'quanly': {
                } break;
                case 'giaovien': {
                } break;
                case 'marketing': {
                
                } break;
                case 'mardituvan': {
                } break;
                case 'margoituvan': {
                } break;
                case 'mardatatong': {
                } break;
                case 'margoidata': {
                } break;
                case 'marphattoroi': {
                } break;
                case 'martreobangron': {
                } break;
                case 'marchuongtrinhphatdong': {
                    
                } break;
                case 'cskh': {
                } break;
                case 'cskhsolienlac': {
                } break;
                case 'cskhdangkyhangngay': {
                } break;
                case 'cskhgoidangkyhangngay': {
                } break;
                case 'cskhchamsockhcu': {
                } break;
                case 'lophoc': {
                } break;
                case 'hoadon': {
                    query = 'SELECT * FROM BIENLAIHOCPHI WHERE `ID` = \'!\?!\'; ';
                    query = query.replace('!\?!', cell['ID']);
                    query += 'SELECT * FROM APPROVE WHERE `isApproved` = \'0\' AND `blockEvent` LIKE \'%huyphieuthu:!\?!%\'; ';
                    query = query.replace('!\?!', cell['ID']);
                    this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                        fn: 'home_body_loadxoahoadon_kiemtratruockhixoa',
                    });
                } break;
                case 'hoadonhuy': {
                } break;
            }
        }
    }
    
    onDKMHClick () {
        if (arguments[0] != null) {
            let cell = arguments[0];
            let query = 'SELECT * FROM quanlyhocsinh.USERS WHERE `User ID` = \'!\?!\'; ';
            query = query.replace(/!\?!/g, cell['User ID']);
            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                fn: 'home_body_loaddangkymonhoc',
            });
        }
    }
    
    onDeactivateClick () {
        let query;
        let Nghi = require('../form/nghi/Nghi');
        if (arguments[0] != null) {
            let cell = arguments[0];
            switch (this.state.menuSelected) {
                case 'hocsinh': {
                    ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                    ReactDOM.render(
                        <Provider store={store}>
                            <Nghi
                                name={cell['Họ Và Tên']}
                                id={cell['User ID']}
                                menuSelected={this.state.menuSelected}
                                staffCode={this.state.userInformation.account_id}
                            />
                        </Provider>
                        , document.getElementById('form-react')
                    );
                } break;
                case 'giaovien': {
                    ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                    ReactDOM.render(
                        <Provider store={store}>
                            <Nghi
                                name={cell['Họ Và Tên']}
                                id={cell['Mã Giáo Viên']}
                                menuSelected={this.state.menuSelected}
                            />
                        </Provider>
                        , document.getElementById('form-react')
                    );
                } break;
                case 'quanly': {
                    query = 'SELECT QUANLY.*, LOAIQUANLY.`Permission Allow` FROM quanlyhocsinh.QUANLY ' +
                    'LEFT JOIN quanlyhocsinh.LOAIQUANLY ON QUANLY.`Chức Vụ` = LOAIQUANLY.`Loại Quản Lý` ' +
                    'WHERE LOAIQUANLY.`Permission Allow` LIKE \'%?%\' AND QUANLY.`Mã Quản Lý` = \'?\'';
                    query = query.replace('?', this.state.userInformation.permission);
                    query = query.replace('?', cell['Mã Quản Lý']);
                    this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                        fn: 'home_body_loadnghiquanly',
                    });
                } break;
                case 'lophoc': {
                    ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                    ReactDOM.render(
                        <Provider store={store}>
                            <Nghi
                                name={cell['Tên Môn'] + ' - Lớp ' + cell['Lớp'] + ' (GV: ' + cell['Họ Và Tên'] + ')'}
                                id={cell['Mã Lớp']}
                                menuSelected={this.state.menuSelected}
                                staffCode={this.state.userInformation.account_id}
                            />
                        </Provider>
                        , document.getElementById('form-react')
                    );
                } break;
            }
        }
    }
    
    onCallClick () {
        let query;
        if (arguments[0] != null) {
            let cell = arguments[0];
            switch (this.state.menuSelected) {
                case 'mardituvan': {
                    query = 'SELECT DATA_TRUONGTIEMNANG.*, QUANLY.`Họ Và Tên` AS callerName, CONVERT_TZ(NOW(), @@session.time_zone,\'+07:00\') AS now FROM DATA_TRUONGTIEMNANG LEFT JOIN QUANLY ON DATA_TRUONGTIEMNANG.`callerID` = QUANLY.`Mã Quản Lý` WHERE `ID` = \'?\'';
                    query = query.replace('?', cell['ID']);
                    this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                        fn: 'home_body_checkgoidataisBusy',
                        fnCallwasCalled: 'home_body_loadgoidituvan',
                        id: cell['ID'],
                    });
                } break;
                case 'mardatatong': {
                    query = 'SELECT DATA_TRUONGTIEMNANG.*, QUANLY.`Họ Và Tên` AS callerName, CONVERT_TZ(NOW(), @@session.time_zone,\'+07:00\') AS now FROM DATA_TRUONGTIEMNANG LEFT JOIN QUANLY ON DATA_TRUONGTIEMNANG.`callerID` = QUANLY.`Mã Quản Lý` WHERE `ID` = \'?\'';
                    query = query.replace('?', cell['ID']);
                    this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                        fn: 'home_body_checkgoidataisBusy',
                        fnCallwasCalled: 'home_body_loadgoidata',
                        id: cell['ID'],
                    });
                } break;
                case 'cskhdangkyhangngay': {
                    query = 'SELECT * FROM DATADANGKYHANGNGAY WHERE `ID` = \'?\'';
                    query = query.replace('?', cell['ID']);
                    this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                        fn: 'home_body_checkgoidangkyhangngayisBusy',
                        id: cell['ID'],
                    });
                } break;
                case 'hocsinhnghi': {
                    query = 'SELECT * FROM USERS WHERE `User ID` = \'!\?!\'';
                    query = query.replace('!\?!', cell['User ID']);
                    this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                        fn: 'home_body_checkgoichamsockhachhangcuisBusy',
                        id: cell['User ID'],
                    });                
                } break;
            }
        }
    }
    
    onRecallClick () {
        let query;
        if (arguments[0] != null) {
            let cell = arguments[0];
            let id;
            switch (this.state.menuSelected) {
                case 'margoituvan': {
                    id = cell['ID-DATA'];
                    query = 'SELECT DATA_TRUONGTIEMNANG.*, QUANLY.`Họ Và Tên` AS callerName, CONVERT_TZ(NOW(), @@session.time_zone,\'+07:00\') AS now FROM DATA_TRUONGTIEMNANG LEFT JOIN QUANLY ON DATA_TRUONGTIEMNANG.`callerID` = QUANLY.`Mã Quản Lý` WHERE `ID` = \'?\'';
                    query = query.replace('?', id);
                    this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                        fn: 'home_body_checkgoidataisBusy',
                        fnCallwasCalled: 'home_body_loadgoidituvan',
                        id: id,
                    });
                } break;
                case 'margoidata': {
                    id = cell['ID-DATA'];
                    query = 'SELECT DATA_TRUONGTIEMNANG.*, QUANLY.`Họ Và Tên` AS callerName, CONVERT_TZ(NOW(), @@session.time_zone,\'+07:00\') AS now FROM DATA_TRUONGTIEMNANG LEFT JOIN QUANLY ON DATA_TRUONGTIEMNANG.`callerID` = QUANLY.`Mã Quản Lý` WHERE `ID` = \'?\'';
                    query = query.replace('?', id);
                    this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                        fn: 'home_body_checkgoidataisBusy',
                        fnCallwasCalled: 'home_body_loadgoidata',
                        id: id,
                    });
                } break;
                case 'cskh': {
                    id = cell['ID-DATA'];
                    query = 'SELECT USERS.*, QUANLY.`Họ Và Tên` AS callerName, CONVERT_TZ(NOW(), @@session.time_zone,\'+07:00\') AS now FROM USERS LEFT JOIN QUANLY ON USERS.`callerID` = QUANLY.`Mã Quản Lý` WHERE `ID` = \'!\?!\'';
                    query = query.replace('!\?!', id);
                    this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                        fn: 'home_body_checkgoidataisBusy',
                        fnCallwasCalled: 'home_body_loadgoicskh',
                        id: id,
                    });
                } break;
                case 'cskhgoidangkyhangngay': {
                    id = cell['ID-DATA'];
                    query = 'SELECT * FROM DATADANGKYHANGNGAY WHERE `ID` = \'?\'';
                    query = query.replace('?', id);
                    this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                        fn: 'home_body_checkgoidangkyhangngayisBusy',
                        id: id,
                    });
                } break;
                case 'cskhchamsockhcu': {
                    id = cell['User ID'];
                    query = 'SELECT * FROM USERS WHERE `User ID` = \'?\'';
                    query = query.replace('?', id);
                    this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                        fn: 'home_body_checkgoichamsockhachhangcuisBusy',
                        id: id,
                    });
                } break;
            }
        }
    }
    
    onNewcallClick () {
        switch (this.state.menuSelected) {
            case 'margoituvan': {
                this.loadthemGoiDienTuVan();
            } break;
            case 'margoidata': {
                this.loadthemGoiDienData();
            } break;
            case 'cskh': {
                this.loadthemGoiChamSocKhachHang();
            } break;
            case 'cskhgoidangkyhangngay': {
                this.loadthemGoiDangKyHangNgay();
            } break;
            case 'cskhchamsockhcu': {
                this.loadthemGoiChamSocKhachHangCu();
            } break;
        }
    }
    
    onPlancallClick () {
        let Call = require('../form/call/Call');
        switch (this.state.menuSelected) {
            case 'margoituvan': {
                ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                ReactDOM.render(
                    <Provider store={store}>
                        <Call 
                            action = "plancall"
                            sourceData = "DATA_TRUONGTIEMNANG"
                            sourceView = "GOIDIENTUVAN_VIEW"
                            source = "dituvan"
                            destination = "CALLDATA"
                        />
                    </Provider>,
                    document.getElementById('form-react')            
                );
            } break;
            case 'margoidata': {
                ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                ReactDOM.render(
                    <Provider store={store}>
                        <Call 
                            action = "plancall"
                            sourceData = "DATA_TRUONGTIEMNANG"
                            sourceView = "GOIDIENDATA_VIEW"
                            source = "data"
                            destination = "CALLDATA"
                        />
                    </Provider>,
                    document.getElementById('form-react')            
                );
            } break;
            case 'cskh': {
                let sourceFilter = 'AND USERS.`Chính Thức` = \'1\' AND USERS.`Ngày Nghỉ Học` IS NULL';
                ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                ReactDOM.render(
                    <Provider store={store}>
                        <Call 
                            action = "plancall"
                            sourceData = "USERS"
                            sourceView = "CHAMSOCKHACHHANG_VIEW"
                            destination = "CHAMSOCKHACHHANG"
                            sourceFilter = {sourceFilter}
                        />
                    </Provider>,
                    document.getElementById('form-react')            
                );
            } break;
            case 'cskhgoidangkyhangngay': {
                let GoiDienDangKyHangNgay = require('../form/chamsockhachhang/dangkyhangngay/GoiDienDangKyHangNgay');
                ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                ReactDOM.render(
                    <Provider store={store}>
                        <GoiDienDangKyHangNgay
                            action="plancall"
                        />
                    </Provider>,
                    document.getElementById('form-react')            
                );
            } break;
            case 'cskhchamsockhcu': {
                let CallChamSocKhachHangCu = require('../form/chamsockhachhang/chamsockhachhangcu/GoiChamSocKhachHangCu');
                ReactDOM.render(
                    <Provider store={store}>
                        <CallChamSocKhachHangCu
                            action="plancall"
                        />
                    </Provider>,
                    document.getElementById('form-react')            
                );
            } break;
        }
    }
    
    onTraiBuoiClick () {
        if (arguments[0] != null) {
            let cell = arguments[0];
            let query = 'SELECT LOPHOC.*, DANHSACHMONHOC.`name` AS `Tên Môn` FROM quanlyhocsinh.LOPHOC ' +
            'LEFT JOIN DANHSACHMONHOC on DANHSACHMONHOC.`mamon` = LOPHOC.`Mã Môn Học` '+
            'WHERE `Mã Lớp` = \'!\?!\'';
            query = query.replace('!\?!', cell['Mã Lớp']);
            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                fn : 'home_body_loadtraibuoi',
            });  
        }
    }
    
    onScoreClick () {
        if (arguments[0] != null) {
            let cell = arguments[0];
            let DanhGiaHocSinh = require('../form/giaovien/danhgiahocsinh/DanhGiaHocSinh');
            ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
            ReactDOM.render(
                <Provider store={store}>
                    <DanhGiaHocSinh id={cell['Mã Lớp']}/>
                </Provider>
                , document.getElementById('form-react')
            );
        }
    }
    
    onPayClick () {
        if (arguments[0] != null) {
            let cell = arguments[0];
            let query = 'SELECT * FROM USERS WHERE `User ID` = \'!\?!\'; ';
            query = query.replace('!\?!', cell['User ID']);
            query += 'SELECT * FROM APPROVE WHERE `isApproved` = \'0\' AND `blockEvent` LIKE \'%taophieuthu:!\?!%\'; ';
            query = query.replace('!\?!', cell['User ID']);
            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                fn: 'home_body_loaddonghocphi',
            });
        }
    }
    
    onPayanotherClick () {
        if (arguments[0] != null) {
            let cell = arguments[0];
            let query = 'SELECT * FROM USERS WHERE `User ID` = \'!\?!\'; ';
            query = query.replace('!\?!', cell['User ID']);
            query += 'SELECT * FROM APPROVE WHERE `isApproved` = \'0\' AND `blockEvent` LIKE \'%taophieuthu:!\?!%\'; ';
            query = query.replace('!\?!', cell['User ID']);
            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                fn: 'home_body_loadthuphikhac',
            });
        }
    }
    
    onPayoweClick () {
        if (arguments[0] != null) {
            let cell = arguments[0];
            let query = 'SELECT * FROM BIENLAIHOCPHI WHERE `ID` = \'?\'; ';
            query = query.replace('?', cell['ID']);
            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                fn: 'home_body_btnpayowe_menuright_kiemtratruockhidongno',
            });
        }
    }
    
    onCSKHClick () {
        if (arguments[0] != null) {
            let cell = arguments[0];
            let query = 'SELECT USERS.*, QUANLY.`Họ Và Tên` AS callerName, CONVERT_TZ(NOW(), @@session.time_zone,\'+07:00\') AS now FROM USERS LEFT JOIN QUANLY ON USERS.`callerID` = QUANLY.`Mã Quản Lý` WHERE `ID` = \'!\?!\'';
            query = query.replace('!\?!', cell['ID']);            
            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                fn: 'home_body_checkgoidataisBusy',
                fnCallwasCalled: 'home_body_loadgoicskh',
                id: cell['ID'],
            });
        }
    }
    
    onResponsesClick () {
        if (arguments[0] != null) {
            let cell = arguments[0];
            let id = cell['ID'];
            let query = 'SELECT * FROM REPORTCSKH_VIEW WHERE REPORTCSKH_VIEW.`ID` = \'!\?!\' ';
            query = query.replace('!\?!', id);
            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                fn: 'home_body_response_cskh_kiemtranguoiphanhoi',
            });
        }
    }

    onHappinessScoreClick () {
        let HappinessScore = require('../form/happinessscore/HappinessScore');
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
        ReactDOM.render(
            <Provider store={store}>
                <HappinessScore
                    userID={this.state.userInformation.account_id}
                    permission={this.state.userInformation.permission}
                    data={arguments[0]}
                />
            </Provider>,
            document.getElementById('form-react')            
        );
    }

    loadthemGoiDienTuVan (id_goi_moi, data_old) {
        let Call = require('../form/call/Call');
        if (id_goi_moi != null) {
            ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
            ReactDOM.render(
                <Provider store={store}>
                    <Call 
                        action = "call"
                        sourceData = "DATA_TRUONGTIEMNANG"
                        sourceView = "GOIDIENTUVAN_VIEW"
                        source = "dituvan"
                        destination = "CALLDATA"
                        id={id_goi_moi}
                        dataOld={data_old}
                    />
                </Provider>,
                document.getElementById('form-react')            
            );
        } else {
            ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
            ReactDOM.render(
                <Provider store={store}>
                    <Call 
                        action = "call"
                        sourceData = "DATA_TRUONGTIEMNANG"
                        sourceView = "GOIDIENTUVAN_VIEW"
                        source = "dituvan"
                        destination = "CALLDATA"
                    />
                </Provider>,
                document.getElementById('form-react')            
            );
        }
    }

    loadthemGoiDienData (id_goi_moi, data_old) {
        let Call = require('../form/call/Call');
        if (id_goi_moi != null) {
            ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
            ReactDOM.render(
                <Provider store={store}>
                    <Call 
                        action = "call"
                        sourceData = "DATA_TRUONGTIEMNANG"
                        sourceView = "GOIDIENDATA_VIEW"
                        source = "data"
                        destination = "CALLDATA"
                        id={id_goi_moi}
                        dataOld={data_old}
                    />
                </Provider>,
                document.getElementById('form-react')            
            );
        } else {
            ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
            ReactDOM.render(
                <Provider store={store}>
                    <Call 
                        action = "call"
                        sourceData = "DATA_TRUONGTIEMNANG"
                        sourceView = "GOIDIENDATA_VIEW"
                        source = "data"
                        destination = "CALLDATA"
                    />
                </Provider>,
                document.getElementById('form-react')            
            );
        }
    }

    loadthemGoiChamSocKhachHang(id_goi_moi, data_old) {
        let Call = require('../form/call/Call');
        let sourceFilter = 'AND USERS.`Chính Thức` = \'1\' AND USERS.`Ngày Nghỉ Học` IS NULL';
        if (id_goi_moi != null) {
            ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
            ReactDOM.render(
                <Provider store={store}>
                    <Call 
                        action = "call"
                        sourceData = "USERS"
                        sourceView = "CHAMSOCKHACHHANG_VIEW"
                        destination = "CHAMSOCKHACHHANG"
                        sourceFilter = {sourceFilter}
                        id={id_goi_moi}
                        dataOld={data_old}
                    />
                </Provider>,
                document.getElementById('form-react')            
            );
        } else {
            ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
            ReactDOM.render(
                <Provider store={store}>
                    <Call 
                        action = "call"
                        sourceData = "USERS"
                        sourceView = "CHAMSOCKHACHHANG_VIEW"
                        destination = "CHAMSOCKHACHHANG"
                        sourceFilter = {sourceFilter}
                    />
                </Provider>,
                document.getElementById('form-react')            
            );
        }
    }

    loadthemGoiDangKyHangNgay (id_goi_moi, data_old) {
        let GoiDienDangKyHangNgay = require('../form/chamsockhachhang/dangkyhangngay/GoiDienDangKyHangNgay');
        if (id_goi_moi != null) {
            ReactDOM.render(
                <Provider store={store}>
                    <GoiDienDangKyHangNgay 
                        action="call" 
                        id={id_goi_moi} 
                        data_old={data_old}
                    />
                </Provider>,
                document.getElementById('form-react')            
            );
        } else {
            ReactDOM.render(
                <Provider store={store}>
                    <GoiDienDangKyHangNgay
                        action="call"
                    />
                </Provider>,
                document.getElementById('form-react')            
            );
        }
    }

    loadthemGoiChamSocKhachHangCu (id_goi_moi, data_old) {
        let CallChamSocKhachHangCu = require('../form/chamsockhachhang/chamsockhachhangcu/GoiChamSocKhachHangCu');
        if (id_goi_moi != null) {
            ReactDOM.render(
                <Provider store={store}>
                    <CallChamSocKhachHangCu
                        action="call"
                        id={id_goi_moi}
                        data_old={data_old}
                    />
                </Provider>,
                document.getElementById('form-react')            
            );
        } else {
            ReactDOM.render(
                <Provider store={store}>
                    <CallChamSocKhachHangCu
                        action="call"
                    />
                </Provider>,
                document.getElementById('form-react')            
            );
        }
    }

    loadThanhToanNo (data, phieuthucu, isRead = false) {
        let type = phieuthucu['Nội Dung'].slice(0, 3);
        let PhieuThu = require('../form/hoadon/phieuthu/PhieuThuHocPhi');
        if (type == '@@@') {
            PhieuThu = require('../form/hoadon/phieuthu/PhieuThu');
            type = 'student';
            if (phieuthucu['Mã Nhân Viên Đóng Phí'] != null) {
                type = 'employee';
            }
        }
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));

        if (isRead == true) {
            ReactDOM.render(
                <Provider store={store}>
                    <PhieuThu 
                        data={data}
                        action='print'
                        phieuthucu={phieuthucu}
                        type={type}
                    />
                </Provider>,
                document.getElementById('form-react')
            );
        } else {
            ReactDOM.render(
                <Provider store={store}>
                    <PhieuThu 
                        data={data}
                        action='payDebt'
                        phieuthucu={phieuthucu}
                        type={type}
                    />
                </Provider>,
                document.getElementById('form-react')
            );
        }
    }
}

module.exports = connect(function (state) {
    return {
      socket: state.socket,
    };
}) (Body);
