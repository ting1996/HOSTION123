import React from 'react';
import { connect } from 'react-redux';
import style from '../style.css';
var ReactDOM = require('react-dom');
import RowCall from './RowCall';

import BranchSelector from '../BranchSelector';

class GoiDienData extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sohotline: null,
            danhsachhotline: [],
            softNetwork: '',
            softNetwork_plane: '',

            thongtinkhachhang: [],
            goiylop: [],
            goiytruong: [],
            goiychuongtrinhgoi: [],
            data_old_kehoach: null,
            filter: '',
            bangthongtin: {},
            SetBusy: null,
            disbutton: false,
            skipData: [],
            isSkip: false,
            brachselecting: false,
            source: '',

            _fistLoad: false,
            fistLoad: false,
        }
        this.callBackDataFormDatabase = this.callBackDataFormDatabase.bind(this);
        this.loadNextData = this.loadNextData.bind(this);
        this.wrong_update = this.wrong_update.bind(this);
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
        let query = '';
        let querySkip = '';
        if (hanhdong == 'laydulieu_trave') {
            if (dulieuguive != null) {
                switch (dulieuguive.fn) {
                    case 'goidiendata_loadbangthongtin':
                        let bangthongtin = {};
                        for (let value of rows) {
                            if (bangthongtin[value['Type']] == null) {
                                bangthongtin[value['Type']] = [{value: value['Content'], label: value['Content']}];
                            } else {
                                bangthongtin[value['Type']].push({value: value['Content'], label: value['Content']});
                            }                            
                        }
                        this.setState({
                            bangthongtin: bangthongtin,
                        });
                        break;
                    case 'goidiendata_loadgoiyboloc':
                        let goiylop = [];
                        let goiytruong = [];
                        let goiychuongtrinhgoi = [];
                        for (let row of rows) {
                            for (let r of row) {
                                if (r['Lớp'] != null) {
                                    goiylop.push(r['Lớp']);
                                } else if (r['Tên Trường'] != null) {
                                    goiytruong.push(r['Tên Trường']);
                                } else if (r['Chương Trình Gọi'] != null) {
                                    goiychuongtrinhgoi.push(r['Chương Trình Gọi']);
                                }
                            }
                        }

                        this.setState({
                            goiylop: goiylop,
                            goiytruong: goiytruong,
                            goiychuongtrinhgoi: goiychuongtrinhgoi,
                        })
                        break;
                    case 'goidiendata_loaddanhsachsochuagoi' + $('#lable_button_nexttoicon').attr('value'):
                        if (rows[0] != null) {
                            query = 'UPDATE `quanlyhocsinh`.`' + this.props.sourceData + '` SET `isBusy`=\'1\' WHERE `ID`=\'!?!\'; '.replace('!?!', rows[0]['ID']);
                        } else {
                            query = '';
                        }

                        if (query != '') {
                            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                                fn: 'goidiendata_trackisBusy',
                                id: rows[0]['ID'],
                            });
                            this.setState({
                                danhsachsochuagoi: rows,
                                SetBusy: query,
                            });
                        } else {
                            if (this.state.skipData != null && this.state.skipData.length > 0) {
                                this.setState({
                                    skipData: [],
                                    isSkip: true,
                                })
                            } else {
                                switch (this.props.action) {
                                    case 'plancall':
                                        this.props.dispatch({
                                            type: 'ALERT_NOTIFICATION_ADD',
                                            content: 'Không có dữ liệu kế hoạch cho ngày hôm nay (Vui lòng kiểm tra lại bộ lọc nếu có sử dụng)!',
                                            notifyType: 'warning',
                                        })
                                        break;
                                    case 'call':
                                        this.props.dispatch({
                                            type: 'ALERT_NOTIFICATION_ADD',
                                            content: 'Không có dữ liệu để gọi hoặc đã gọi hết dữ liệu (Vui lòng kiểm tra lại bộ lọc nếu có sử dụng)!',
                                            notifyType: 'warning',
                                        })
                                        break;
                                    default:
                                }
                                this.close();
                            }
                        }
                        break;
                    case 'goidiendata_loaddata_old':
                        this.setState({
                            disbutton: false,
                            data_old_kehoach: rows,
                        });
                        break;
                    case 'goidiendata_trackisBusy':
                        if (rows.changedRows == 1) {
                            query = this.state.SetBusy;
                            let date = new Date().toLocaleDateString('en-GB').split('/');
                            let get2h = new Date();
                            get2h.setHours(get2h.getHours() + 2);
                            let time = get2h.toLocaleTimeString('en-GB').split('/');
                            let ngaygoi = date[2] + '-' + date[1] + '-' + date[0] + ' ' + time;
                            query = query.replace(/`isBusy`=\'1\'/g, '`expires_on`=\'' + ngaygoi + '\'');
                            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                            });

                            switch (this.props.action) {
                                case 'plancall':
                                    query = 'SELECT CALLDATA.*, QUANLY.`Họ Và Tên` AS `Họ Tên Nhân Viên` FROM quanlyhocsinh.CALLDATA ' +
                                    'LEFT JOIN quanlyhocsinh.QUANLY ON QUANLY.`Mã Quản Lý` = CALLDATA.`Mã Nhân Viên` ' +
                                    'WHERE `ID-DATA` = \'!?!\'';
                                    query = query.replace('!?!', dulieuguive.id);
                                    this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                                        fn: 'goidiendata_loaddata_old',
                                    });
                                    break;
                                case 'call':
                                    // let datachuagoi = this.state.danhsachsochuagoi;
                                    // if (datachuagoi != null) {
                                    //     for (let _data of datachuagoi) {
                                    //         query = 'SELECT CALLDATA.*, QUANLY.`Họ Và Tên` AS `Họ Tên Nhân Viên` FROM quanlyhocsinh.CALLDATA ' +
                                    //         'LEFT JOIN quanlyhocsinh.QUANLY ON QUANLY.`Mã Quản Lý` = CALLDATA.`Mã Nhân Viên` ' +
                                    //         'WHERE `ID-DATA` = \'!?!\'';
                                    //         query = query.replace('!?!', dulieuguive.id);
                                    //         this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                                    //             fn: 'goidiendata_loaddata_checktrung',
                                    //         });
                                    //     }
                                    // }
                                    this.setState({disbutton: false});
                                    break;
                                default:
                                    this.close();
                            }
                        } else {
                            let that = this;
                            let filter = this.state.filter;
                            query = '';
                            querySkip = '';
                            for (let _skip of this.state.skipData) {
                                querySkip += 'AND ' + this.props.sourceData + '.`ID` != \'!\?!\' '.replace('!\?!', _skip);
                            }
                            switch (this.props.action) {
                                case 'plancall':
                                    query = 'SELECT ' + this.props.sourceData + '.*, DANHSACHDAUSONHAMANG.`Nhà Mạng` ' +
                                    'FROM ' + this.props.sourceData + ', ' + this.props.sourceView + ', DANHSACHDAUSONHAMANG ' +
                                    'WHERE ' + this.props.sourceView + '.`ID-DATA` = ' + this.props.sourceData + '.`ID` ' +
                                    'AND (DATA_TRUONGTIEMNANG.`Số Điện Thoại` LIKE CONCAT(DANHSACHDAUSONHAMANG.`Đầu Số`, \'%\') ' +
                                    'OR DATA_TRUONGTIEMNANG.`Số Điện Thoại` LIKE CONCAT(\'0\', DANHSACHDAUSONHAMANG.`Đầu Số`, \'%\')) ' +
                                    'AND `Ngày Kế Hoạch` IS NOT NULL ' +
                                    'AND `Ngày Kế Hoạch` <= NOW() ' +
                                    'AND (' + this.props.sourceData + '.`isBusy` = \'0\' OR ' + this.props.sourceData + '.`isBusy` IS NULL) ' +
                                    'AND ' + this.props.sourceData + '.`Cơ Sở` = \'!?!\' ' + querySkip + 
                                    'AND `isDeactivate` = \'0\' ' + this.state.source +
                                    filter + 'ORDER BY `Ngày Kế Hoạch` DESC' +
                                    this.state.softNetwork_plane + ' LIMIT 1';
                                    query = query.replace(/\!\?!/g, $('.khuvuc').attr('value'));
                                    break;
                                case 'call':
                                    query = 'SELECT * FROM quanlyhocsinh.' + this.props.sourceData + ' ' +
                                    'LEFT JOIN DANHSACHDAUSONHAMANG ON ' +
                                    '' + this.props.sourceData + '.`Số Điện Thoại` LIKE CONCAT(DANHSACHDAUSONHAMANG.`Đầu Số`, \'%\') ' +
                                    'OR ' + this.props.sourceData + '.`Số Điện Thoại` LIKE CONCAT(\'0\', DANHSACHDAUSONHAMANG.`Đầu Số`, \'%\') ' +
                                    'WHERE !EXISTS(SELECT * FROM quanlyhocsinh.' + this.props.sourceView + ' ' +
                                    'WHERE ' + this.props.sourceView + '.`ID-DATA` = ' + this.props.sourceData + '.`ID`) ' +
                                    'AND (' + this.props.sourceData + '.`isBusy` = \'0\' OR ' + this.props.sourceData + '.`isBusy` IS NULL) ' +
                                    'AND `Cơ Sở` = \'!?!\' ' + querySkip + 
                                    'AND `isDeactivate` = \'0\' ' + filter + this.state.source +
                                    this.state.softNetwork + 'LIMIT 1';
                                    query = query.replace(/\!\?!/g, $('.khuvuc').attr('value'));
                                    break;
                                default:
                                    this.close();
                            }
                            let timer = setInterval(function() {
                                that.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                                    fn : 'goidiendata_loaddanhsachsochuagoi' + $('#lable_button_nexttoicon').attr('value'),
                                });
                                clearInterval(timer);
                            }, 1000);
                        }
                        break;
                    case 'goidiendata_trackisBusynone':
                        break;
                    case 'goidiendata_trackisBusyISNULLandLoadNext':
                        let filter = this.state.filter;            
                        query = '';
                        querySkip = '';
                        for (let _skip of this.state.skipData) {
                            querySkip += 'AND ' + this.props.sourceData + '.`ID` != \'!\?!\' '.replace('!\?!', _skip);
                        }
                        switch (this.props.action) {
                            case 'plancall':
                                query = 'SELECT ' + this.props.sourceData + '.*, DANHSACHDAUSONHAMANG.`Nhà Mạng` ' +
                                'FROM ' + this.props.sourceData + ', ' + this.props.sourceView + ', DANHSACHDAUSONHAMANG ' +
                                'WHERE ' + this.props.sourceView + '.`ID-DATA` = ' + this.props.sourceData + '.`ID` ' +
                                'AND (DATA_TRUONGTIEMNANG.`Số Điện Thoại` LIKE CONCAT(DANHSACHDAUSONHAMANG.`Đầu Số`, \'%\') ' +
                                'OR DATA_TRUONGTIEMNANG.`Số Điện Thoại` LIKE CONCAT(\'0\', DANHSACHDAUSONHAMANG.`Đầu Số`, \'%\')) ' +
                                'AND `Ngày Kế Hoạch` IS NOT NULL ' +
                                'AND `Ngày Kế Hoạch` <= NOW() ' +
                                'AND (' + this.props.sourceData + '.`isBusy` = \'0\' OR ' + this.props.sourceData + '.`isBusy` IS NULL) ' +
                                'AND ' + this.props.sourceData + '.`Cơ Sở` = \'!?!\' ' + querySkip + 
                                'AND `isDeactivate` = \'0\' ' + this.state.source +
                                filter + 'ORDER BY `Ngày Kế Hoạch` DESC' +
                                this.state.softNetwork_plane + ' LIMIT 1';
                                query = query.replace(/\!\?!/g, $('.khuvuc').attr('value'));
                                break;
                            case 'call':
                                query = 'SELECT * FROM quanlyhocsinh.' + this.props.sourceData + ' ' +
                                'LEFT JOIN DANHSACHDAUSONHAMANG ON ' +
                                '' + this.props.sourceData + '.`Số Điện Thoại` LIKE CONCAT(DANHSACHDAUSONHAMANG.`Đầu Số`, \'%\') ' +
                                'OR ' + this.props.sourceData + '.`Số Điện Thoại` LIKE CONCAT(\'0\', DANHSACHDAUSONHAMANG.`Đầu Số`, \'%\') ' +
                                'WHERE !EXISTS(SELECT * FROM quanlyhocsinh.' + this.props.sourceView + ' ' +
                                'WHERE ' + this.props.sourceView + '.`ID-DATA` = ' + this.props.sourceData + '.`ID`) ' +
                                'AND (' + this.props.sourceData + '.`isBusy` = \'0\' OR ' + this.props.sourceData + '.`isBusy` IS NULL) ' +
                                'AND `Cơ Sở` = \'!?!\' ' + querySkip + 
                                'AND `isDeactivate` = \'0\' ' + filter + this.state.source +
                                this.state.softNetwork + 'LIMIT 1';
                                query = query.replace(/\!\?!/g, $('.khuvuc').attr('value'));
                                break;
                            default:
                                this.close();
                        }
                        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                            fn : 'goidiendata_loaddanhsachsochuagoi' + $('#lable_button_nexttoicon').attr('value'),
                        }); 
                        break;
                    case 'goidiendata_close':
                        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                        break;
                    case 'form_call_loadhotline':
                        this.setState({
                            danhsachhotline: rows,
                        });
                        break;
                    case 'goidiendata_dahoctaih123':
                        if (this.props.id != null) {
                            this.close();
                        } else {
                            this.loadNextData();
                        }
                        break;
                    default:                        
                }                
            }
        }

        if (hanhdong == 'loi-cu-phap') {
            this.setState({
                disbutton: false,
            })
            this.close();
        }
    }

    componentDidMount () {
        window.addEventListener("resize", this.changeSize);
        this.changeSize();
        let sourceFilter = '';
        if (this.props.sourceData == null
        && this.props.sourceView == null) {
            ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
        }

        if (this.props.source != null) {
            this.setState({
                source: 'AND ' + this.props.sourceData + '.`Nguồn` LIKE \'' + this.props.source + '%\' ',
            });
            sourceFilter = 'AND ' + this.props.sourceData + '.`Nguồn` LIKE \'' + this.props.source + '%\' ';
        }

        let query;
        let that = this;
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
      
        query = 'SELECT * FROM quanlyhocsinh.BANGTHONGTIN'
        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'goidiendata_loadbangthongtin',
        });

        query = 'SELECT `Lớp` FROM quanlyhocsinh.DATA_TRUONGTIEMNANG WHERE `Cơ Sở` = \'!?!\' AND `Lớp` IS NOT NULL GROUP BY `Lớp`; ' +
        'SELECT `Tên Trường` FROM quanlyhocsinh.DATA_TRUONGTIEMNANG WHERE `Cơ Sở` = \'!?!\' AND `Tên Trường` IS NOT NULL GROUP BY `Tên Trường`; ';
        if (this.props.action == 'plancall') {
            query += 'SELECT `Chương Trình Gọi` FROM !~! WHERE `Cơ Sở` = \'!\?!\' GROUP BY `Chương Trình Gọi`; ';
        }
        query = query.replace(/\!\?!/g, $('.khuvuc').attr('value'));
        query = query.replace('!~!', this.props.sourceData);
        query = query.replace('!~!', this.props.sourceData);
        query = query.replace('!~!', this.props.sourceView);
        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'goidiendata_loadgoiyboloc',
        });

        query = 'SELECT HOTLINE.*, DANHSACHDAUSONHAMANG.`Nhà Mạng` FROM HOTLINE ' +
        'LEFT JOIN DANHSACHDAUSONHAMANG ON ' +
        'HOTLINE.`Số Điện Thoại` LIKE CONCAT(DANHSACHDAUSONHAMANG.`Đầu Số`, \'%\') ' +
        'OR HOTLINE.`Số Điện Thoại` LIKE CONCAT(\'0\', DANHSACHDAUSONHAMANG.`Đầu Số`, \'%\') ' +
        'WHERE HOTLINE.`Cơ Sở` = \'!?!\' AND HOTLINE.`isActivated` = \'1\'; ';
        query = query.replace('!?!', $('.khuvuc').attr('value'));
        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'form_call_loadhotline',
        });
    }

    componentWillUnmount() {
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);

        let query = this.state.SetBusy;
        if (query != null) {
            query = query.replace(/`isBusy`=\'1\'/g, '`isBusy`=\'0\', expires_on=null');
            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                fn : 'goidiendata_trackisBusynone',
            });
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.isSkip) {
            this.loadNextData();
            this.setState({
                isSkip: false,
            });
            this.loadNextData();
        }

        if (this.state.fistLoad != this.state._fistLoad) {
            this.close();
        }

        if (prevState.fistLoad != this.state.fistLoad
        && this.state.fistLoad == true) {
            this.loadData();
        }
    }

    next () {
        if (this.state.sohotline == null) {
            var sohotline = $('input[name=goidientuvan_sohotline]:checked').val();
            if (sohotline != null) {
                let softNetwork = '';
                let softNetwork_plane = '';
                this.state.danhsachhotline.map((v, i) => {
                    if (v['Số Điện Thoại'] == sohotline) {
                        softNetwork = 'ORDER BY FIELD(`Nhà Mạng`, \'!\?!\') DESC ';
                        softNetwork_plane = ', FIELD(`Nhà Mạng`, \'!\?!\') DESC';
                        softNetwork = softNetwork.replace('!\?!', v['Nhà Mạng']);
                        softNetwork_plane = softNetwork_plane.replace('!\?!', v['Nhà Mạng']);
                    }
                })
                this.setState({
                    disbutton: true,
                    sohotline: sohotline,
                    softNetwork: softNetwork,
                    softNetwork_plane: softNetwork_plane,
                    fistLoad: true,
                    _fistLoad: true,
                })
            } else {
                this.props.dispatch({
                    type: 'ALERT_NOTIFICATION_ADD',
                    content: 'Vui lòng chọn hotline trước khi thực hiện cuộc gọi!',
                    notifyType: 'warning',
                })
            }
        } else {
            this.setState({disbutton: true,})
            this.rowcall.dongy(this.loadNextData, this.wrong_update);
        }
    }

    wrong_update () {
        this.setState({disbutton: false,})
    }

    boqua () {
        let skipData = this.state.skipData;
        this.state.danhsachsochuagoi.map((v, i) => {
            skipData.push(v['ID']);
        });

        this.setState({
            skipData: skipData,
            isSkip: true,
        });
    }

    loadData () {
        let query = '';
        let filter = '';
        if (this.refs.filterclass != null && this.refs.filterclass.value != '') {
            filter += this.props.sourceData + '.`Lớp` LIKE \'!?!%\' AND '.replace('!?!', this.refs.filterclass.value);
        }

        if (this.refs.filterschools != null && this.refs.filterschools.value != '') {
            filter += this.props.sourceData + '.`Tên Trường` LIKE \'%!?!%\' AND '.replace('!?!', this.refs.filterschools.value);
        }

        if (this.refs.filterchuongtrinhgoi != null && this.refs.filterchuongtrinhgoi.value != '') {
            filter += this.props.sourceView + '.`Chương Trình Gọi` LIKE \'%!?!%\' AND '.replace('!?!', this.refs.filterchuongtrinhgoi.value);
        }
        
        if (filter != '') {
            filter = 'AND (' + filter.substr(0, filter.length - ' AND '.length) + ') ';
        }

        this.setState({
            filter: filter,
        })

        switch (this.props.action) {
            case 'plancall':
                query = 'SELECT ' + this.props.sourceData + '.*, DANHSACHDAUSONHAMANG.`Nhà Mạng` ' +
                'FROM ' + this.props.sourceData + ', ' + this.props.sourceView + ', DANHSACHDAUSONHAMANG ' +
                'WHERE ' + this.props.sourceView + '.`ID-DATA` = ' + this.props.sourceData + '.`ID` ' +
                'AND (DATA_TRUONGTIEMNANG.`Số Điện Thoại` LIKE CONCAT(DANHSACHDAUSONHAMANG.`Đầu Số`, \'%\') ' +
                'OR DATA_TRUONGTIEMNANG.`Số Điện Thoại` LIKE CONCAT(\'0\', DANHSACHDAUSONHAMANG.`Đầu Số`, \'%\')) ' +
                'AND `Ngày Kế Hoạch` IS NOT NULL ' +
                'AND `Ngày Kế Hoạch` <= NOW() ' +
                'AND (' + this.props.sourceData + '.`isBusy` = \'0\' OR ' + this.props.sourceData + '.`isBusy` IS NULL) ' +
                'AND ' + this.props.sourceData + '.`Cơ Sở` = \'!?!\' ' +
                'AND `isDeactivate` = \'0\' ' + this.state.source +
                filter + 'ORDER BY `Ngày Kế Hoạch` DESC' +
                this.state.softNetwork_plane + ' LIMIT 1';
                query = query.replace(/\!\?!/g, $('.khuvuc').attr('value'));
                break;
            case 'call':
                if (this.props.id != null) {
                    query = 'SELECT * FROM quanlyhocsinh.' + this.props.sourceData + ' ' +
                    'WHERE `ID` = \'!?!\'';
                    query = query.replace('!?!', this.props.id);
                } else {
                    query = 'SELECT * FROM quanlyhocsinh.' + this.props.sourceData + ' ' +
                    'LEFT JOIN DANHSACHDAUSONHAMANG ON ' +
                    '' + this.props.sourceData + '.`Số Điện Thoại` LIKE CONCAT(DANHSACHDAUSONHAMANG.`Đầu Số`, \'%\') ' +
                    'OR ' + this.props.sourceData + '.`Số Điện Thoại` LIKE CONCAT(\'0\', DANHSACHDAUSONHAMANG.`Đầu Số`, \'%\') ' +
                    'WHERE !EXISTS(SELECT * FROM quanlyhocsinh.' + this.props.sourceView + ' ' +
                    'WHERE ' + this.props.sourceView + '.`ID-DATA` = ' + this.props.sourceData + '.`ID`) ' +
                    'AND (' + this.props.sourceData + '.`isBusy` = \'0\' OR ' + this.props.sourceData + '.`isBusy` IS NULL) ' +
                    'AND `Cơ Sở` = \'!?!\' ' +
                    'AND `isDeactivate` = \'0\' ' + filter + this.state.source +
                    this.state.softNetwork + 'LIMIT 1';
                    query = query.replace(/\!\?!/g, $('.khuvuc').attr('value'));
                }
                break;
            default:
                this.close();
        }

        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'goidiendata_loaddanhsachsochuagoi' + $('#lable_button_nexttoicon').attr('value'),
        });
    }

    loadNextData () {
        let query = this.state.SetBusy;
        this.setState({disbutton: true});
        if (query != null) {
            query = query.replace(/`isBusy`=\'1\'/g, '`isBusy`=\'0\', expires_on=null');
            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                fn : 'goidiendata_trackisBusyISNULLandLoadNext',
            });
        } else {
            let filter = this.state.filter;
            query = '';
            let querySkip = '';
            for (let _skip of this.state.skipData) {
                querySkip += 'AND ' + this.props.sourceData + '.`ID` != \'!\?!\' '.replace('!\?!', _skip);
            }
            switch (this.props.action) {
                case 'plancall':
                    query = 'SELECT ' + this.props.sourceData + '.*, DANHSACHDAUSONHAMANG.`Nhà Mạng` ' +
                    'FROM ' + this.props.sourceData + ', ' + this.props.sourceView + ', DANHSACHDAUSONHAMANG ' +
                    'WHERE ' + this.props.sourceView + '.`ID-DATA` = ' + this.props.sourceData + '.`ID` ' +
                    'AND (DATA_TRUONGTIEMNANG.`Số Điện Thoại` LIKE CONCAT(DANHSACHDAUSONHAMANG.`Đầu Số`, \'%\') ' +
                    'OR DATA_TRUONGTIEMNANG.`Số Điện Thoại` LIKE CONCAT(\'0\', DANHSACHDAUSONHAMANG.`Đầu Số`, \'%\')) ' +
                    'AND `Ngày Kế Hoạch` IS NOT NULL ' +
                    'AND `Ngày Kế Hoạch` <= NOW() ' +
                    'AND (' + this.props.sourceData + '.`isBusy` = \'0\' OR ' + this.props.sourceData + '.`isBusy` IS NULL) ' +
                    'AND ' + this.props.sourceData + '.`Cơ Sở` = \'!?!\' ' + querySkip +
                    'AND `isDeactivate` = \'0\' ' + this.state.source +
                    filter + 'ORDER BY `Ngày Kế Hoạch` DESC' +
                    this.state.softNetwork_plane + ' LIMIT 1';
                    query = query.replace(/\!\?!/g, $('.khuvuc').attr('value'));
                    break;
                case 'call':
                    query = 'SELECT * FROM quanlyhocsinh.' + this.props.sourceData + ' ' +
                    'LEFT JOIN DANHSACHDAUSONHAMANG ON ' +
                    '' + this.props.sourceData + '.`Số Điện Thoại` LIKE CONCAT(DANHSACHDAUSONHAMANG.`Đầu Số`, \'%\') ' +
                    'OR ' + this.props.sourceData + '.`Số Điện Thoại` LIKE CONCAT(\'0\', DANHSACHDAUSONHAMANG.`Đầu Số`, \'%\') ' +
                    'WHERE !EXISTS(SELECT * FROM quanlyhocsinh.' + this.props.sourceView + ' ' +
                    'WHERE ' + this.props.sourceView + '.`ID-DATA` = ' + this.props.sourceData + '.`ID`) ' +
                    'AND (' + this.props.sourceData + '.`isBusy` = \'0\' OR ' + this.props.sourceData + '.`isBusy` IS NULL) ' +
                    'AND `Cơ Sở` = \'!?!\' ' +  querySkip +
                    'AND `isDeactivate` = \'0\' ' + filter + this.state.source +
                    this.state.softNetwork + 'LIMIT 1';
                    query = query.replace(/\!\?!/g, $('.khuvuc').attr('value'));
                    break;
                default:
                    this.close();
            }
            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                fn : 'goidiendata_loaddanhsachsochuagoi' + $('#lable_button_nexttoicon').attr('value'),
            }); 
        }
    }

    dahoctaiH123 () {
        let query;
        query = 'UPDATE `quanlyhocsinh`.`' + this.props.sourceData + '` SET `isDeactivate`=\'1\' WHERE `ID`=\'!?!\'';
        query = query.replace('!?!', this.state.thongtinkhachhang['ID']);
        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'goidiendata_dahoctaih123',
            isSuccess: true,
        });
    }

    dongy () {
        this.setState({disbutton: true,})
        this.state.danhsachsochuagoi.map((v, i) => {
            this['rowcall' + i].dongy(this.close, this.wrong_update);
        });
    }

    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    }

    render () {
        let title = '';
        title = $('#lable_button_nexttoicon').attr('value') + ' - ' + $('#lable_button_nexttoicon')[0].innerText;

        let nextbutton = 
        <div>
            <input type="button" onClick={this.next.bind(this)} value="Tiếp Tục" disabled={this.state.disbutton}/>
            <input type="button" onClick={this.boqua.bind(this)} value="Bỏ Qua" disabled={this.state.disbutton}/>
        </div>

        let filter = '';
        let dataOld = this.props.dataOld;
        if (this.props.id != null) {
            nextbutton = '';
        } else {
            filter = 
            <div>
                <span>{"Bộ Lọc:"}</span><br/>
                <input
                    type="text"
                    placeholder="--- Trường Học ---"
                    ref="filterschools"
                    list="goidienthoai_truonghoc"
                />
                <datalist id="goidienthoai_truonghoc">
                {
                    this.state.goiytruong.map((v, i) => <option ket={i} value={v}/>)
                }
                </datalist>
                <input 
                    type="text"
                    placeholder="--- Lớp Học ---"
                    ref="filterclass"
                    list="goidienthoai_goiylophoc"
                />
                <datalist id="goidienthoai_goiylophoc">
                {
                    this.state.goiylop.map((v, i) => <option ket={i} value={v}/>)
                }
                </datalist>
            </div>
        }

        if (this.props.action == 'plancall') {
            dataOld = this.state.data_old_kehoach;
            filter = 
            <div>
                <span>{"Bộ Lọc:"}</span><br/>
                <input
                    type="text"
                    placeholder="--- Trường Học ---"
                    ref="filterschools"
                    list="goidienthoai_truonghoc"
                />
                <datalist id="goidienthoai_truonghoc">
                {
                    this.state.goiytruong.map((v, i) => <option key={i} value={v}/>)
                }
                </datalist>
                <input 
                    type="text"
                    placeholder="--- Lớp Học ---"
                    ref="filterclass"
                    list="goidienthoai_goiylophoc"
                />
                <datalist id="goidienthoai_goiylophoc">
                {
                    this.state.goiylop.map((v, i) => <option key={i} value={v}/>)
                }
                </datalist>
                <input 
                    type="text"
                    placeholder="--- Chương Trình Gọi ---"
                    ref="filterchuongtrinhgoi"
                    list="goidienthoai_chuongtrinhgoi"
                />
                <datalist id="goidienthoai_chuongtrinhgoi">
                {
                    this.state.goiychuongtrinhgoi.map((v, i) => <option key={i} value={v}/>)
                }
                </datalist>
            </div>
        }

        let branchselector = '';
        if (this.state.brachselecting) {
            branchselector = <BranchSelector onAgree={this.BranchSelectorOnAgree.bind(this)} onCancel={this.BranchSelectorOnCancel.bind(this)}/>
        }

        if (this.state.sohotline == null) {
            return (
                <div className={style.formstyle} ref="background">
                    <div className="form_body" ref="body">
                        <div className="header">
                            <h2>Chọn Hotline</h2>
                        </div>
                        <div className="body">
                            <div className="divformstyle">
                                <div>
                                    <fieldset style={{
                                        "padding-right": "0",
                                        "padding-bottom": "0",
                                    }}>
                                        <legend>Số Điện Thoại: </legend>
                                        <div style={{
                                            "padding": "0px",
                                            "height": "400px",
                                            "overflow-y": "scroll",
                                            "overflow-x": "hidden",
                                        }}>
                                        {
                                            this.state.danhsachhotline.map((v, i) => {
                                                return (
                                                    <div>
                                                        <input 
                                                            type="radio"
                                                            name="goidientuvan_sohotline"
                                                            value={v['Số Điện Thoại']}
                                                            style={{
                                                                "width": "auto",
                                                            }}
                                                        />
                                                        {' 0' + v['Số Điện Thoại'] + ' (Nhà mạng: ' + v['Nhà Mạng'] + ')'}
                                                        <br/>
                                                    </div>
                                                )
                                            })
                                        }
                                        </div>
                                    </fieldset>
                                </div>
                                {filter}
                            </div>
                        </div>
                        <div className="footer">
                            <Button 
                                onClick={this.close.bind(this)}
                                value="Thoát"
                                icon="close"
                                style={{'float': 'right', 'margin-right': '10px',}}
                                disabled={this.state.disbutton}
                            />
                            <Button 
                                onClick={this.next.bind(this)}
                                value="Đồng Ý"
                                icon="agree"
                                style={{'float': 'right', 'margin-right': '10px',}}
                                disabled={this.state.disbutton}
                            />
                        </div>
                    </div>
                    <div className="daithem">
                    </div>
                </div> 
            )
        } else {
            return (
                <div className={style.formstyle}>
                    <div className="form_body" style={{'width': '1100px'}}>
                        <div className="header">
                            { /*<img src="" alt="Icon Image"/> */}
                            <h2>Cuộc Gọi Data</h2>
                        </div>
                        <div className="body">
                            <div className="divformstyle">
                                <div>
                                    <h2 style={{'margin': '0', 'text-align': 'center'}}>
                                        {title}
                                    </h2>
                                </div>
                            </div>
                            <RowCall
                                dataOld={dataOld}
                                data={this.state.thongtinkhachhang}
                                sohotline={this.state.sohotline}
                                bangthongtin={this.state.bangthongtin}
                                getMe={me => this.rowcall = me}
                            />
                        </div>
                        <div className="footer">
                            <input type="button" onClick={this.close.bind(this)} value="Thoát" disabled={this.state.disbutton}/>
                            <input type="button" onClick={this.dongy.bind(this)} value="Lưu" disabled={this.state.disbutton}/>
                            {nextbutton}
                            <input type="button" onClick={this.dahoctaiH123.bind(this)} value="Đã Hoặc Đang Học Tại Houston123" disabled={this.state.disbutton}/>
                            <input type="button" onClick={this.chuyenSangChiNhanhKhac.bind(this)} value="Chuyển Sang Chi Nhánh Khác" disabled={this.state.disbutton}/>
                        </div>
                    </div>
                        <div className="daithem">
                    </div>
                    {branchselector}
                </div>
            )
        }
    }

    chuyenSangChiNhanhKhac () {
        this.setState({brachselecting: true});
    }

    BranchSelectorOnAgree (value) {
        let that = this;
        this.setState({
            disbutton: true,
            brachselecting: false,
        })
        
        if (this.props.id != null) {
            this['rowcall' + i].dongy(() => {
                let query = 'UPDATE `quanlyhocsinh`.`' + this.props.sourceData + '` SET `Cơ Sở`=\'!\?!\' WHERE `ID`=\'!\?!\';'
                query = query.replace('!\?!', value);
                query = query.replace('!\?!', this.state.thongtinkhachhang['ID']);
                that.SocketEmit('gui-query-den-database', query , 'laydulieu_trave'); 
                that.close();
            }, this.wrong_update);
        } else {
            this['rowcall' + i].dongy(() => {
                let query = 'UPDATE `quanlyhocsinh`.`' + this.props.sourceData + '` SET `Cơ Sở`=\'!\?!\' WHERE `ID`=\'!\?!\';'
                query = query.replace('!\?!', value);
                query = query.replace('!\?!', this.state.thongtinkhachhang['ID']);
                that.SocketEmit('gui-query-den-database', query , 'laydulieu_trave'); 
                that.loadNextData();
            }, this.wrong_update);
        }
    }

    BranchSelectorOnCancel () {
        this.setState({brachselecting: false});
    }
}

module.exports = connect(function (state) {
    return {
      socket: state.socket,
    };
  }) (GoiDienData);
