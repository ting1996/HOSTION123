import React from 'react';
import { connect } from 'react-redux';
import style from '../../style.css';
var ReactDOM = require('react-dom');
import RowCall from './RowCall';

class GoiDienDangKyHangNgay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sohotline: null,
            danhsachhotline: [],
            danhsachsochuagoi: [],
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
        if (hanhdong == 'laydulieu_trave') {
            if (dulieuguive != null) {
                switch (dulieuguive.fn) {
                    case 'goidiendangkyhangngay_loadbangthongtin':
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
                    case 'goidiendangkyhangngay_loadgoiyboloc':
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
                    case 'goidiendangkyhangngay_loaddanhsachsochuagoi' + $('#lable_button_nexttoicon').attr('value'):
                        if (rows[0] != null) {
                            query = 'UPDATE `quanlyhocsinh`.`DATADANGKYHANGNGAY` SET `isBusy`=\'1\' WHERE `ID`=\'!?!\'; '.replace('!?!', rows[0]['ID']);
                        } else {
                            query = '';
                        }

                        if (query != '') {
                            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                                fn: 'goidiendangkyhangngay_trackisBusy',
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
                    case 'goidiendangkyhangngay_loaddata_old':
                        this.setState({
                            disbutton: false,
                            data_old_kehoach: rows,
                        });
                        break;
                    case 'goidiendangkyhangngay_trackisBusy':
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

                            if (this.props.action == 'plancall') {
                                let query = 'SELECT CALLDANGKYHANGNGAY.*, QUANLY.`Họ Và Tên` AS `Họ Tên Nhân Viên` FROM quanlyhocsinh.CALLDANGKYHANGNGAY ' +
                                'LEFT JOIN quanlyhocsinh.QUANLY ON QUANLY.`Mã Quản Lý` = CALLDANGKYHANGNGAY.`Mã Nhân Viên` ' +
                                'WHERE `ID-DATA` = \'!?!\'';
                                query = query.replace('!?!', dulieuguive.id);
                                this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                                    fn: 'goidiendangkyhangngay_loaddata_old',
                                });
                            } else {
                                this.setState({disbutton: false});
                            }
                        } else {
                            let that = this;
                            let filter = this.state.filter;
                            query = '';
                            switch (this.props.action) {
                                case 'plancall':
                                    query = 'SELECT DATADANGKYHANGNGAY.* ' +
                                    'FROM quanlyhocsinh.DATADANGKYHANGNGAY, quanlyhocsinh.GOIDIENDANGKYHANGNGAY_VIEW ' +
                                    'WHERE GOIDIENDANGKYHANGNGAY_VIEW.`ID-DATA` = DATADANGKYHANGNGAY.`ID` ' +
                                    'AND `Ngày Kế Hoạch` IS NOT NULL ' +
                                    'AND `Ngày Kế Hoạch` <= NOW() ' +
                                    'AND (DATADANGKYHANGNGAY.`isBusy` = \'0\' OR DATADANGKYHANGNGAY.`isBusy` IS NULL) ' +
                                    'AND DATADANGKYHANGNGAY.`Cơ Sở` = \'!?!\' ' +
                                    'AND `isDeactivate` = \'0\' ' +
                                    filter + 'ORDER BY `Ngày Kế Hoạch` DESC ' +
                                    'LIMIT 1';            
                                    query = query.replace(/\!\?!/g, $('.khuvuc').attr('value'));
                                    break;
                                case 'call':
                                    query = 'SELECT * FROM quanlyhocsinh.DATADANGKYHANGNGAY ' +
                                    'WHERE !EXISTS(SELECT * FROM quanlyhocsinh.GOIDIENDANGKYHANGNGAY_VIEW ' +
                                    'WHERE GOIDIENDANGKYHANGNGAY_VIEW.`ID-DATA` = DATADANGKYHANGNGAY.`ID`) ' +
                                    'AND (DATADANGKYHANGNGAY.`isBusy` = \'0\' OR DATADANGKYHANGNGAY.`isBusy` IS NULL) ' +
                                    'AND `Cơ Sở` = \'!?!\' ' +
                                    'AND `isDeactivate` = \'0\' ' + filter +
                                    'LIMIT 1';
                                    query = query.replace(/\!\?!/g, $('.khuvuc').attr('value'));
                                    break;
                                default:
                                    this.close();
                            }
                            let timer = setInterval(function() {
                                that.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                                    fn : 'goidiendangkyhangngay_loaddanhsachsochuagoi' + $('#lable_button_nexttoicon').attr('value'),
                                });
                                clearInterval(timer);
                            }, 1000);
                        }
                        break;
                    case 'goidiendangkyhangngay_trackisBusynone':
                        break;
                    case 'goidiendangkyhangngay_trackisBusyISNULLandLoadNext':
                        let filter = this.state.filter;            
                        query = '';
                        let querySkip = '';
                        for (let _skip of this.state.skipData) {
                            querySkip += 'AND DATADANGKYHANGNGAY.`ID` != \'!\?!\' '.replace('!\?!', _skip);
                        }
                        switch (this.props.action) {
                            case 'plancall':
                                query = 'SELECT DATADANGKYHANGNGAY.* ' +
                                'FROM quanlyhocsinh.DATADANGKYHANGNGAY, quanlyhocsinh.GOIDIENDANGKYHANGNGAY_VIEW ' +
                                'WHERE GOIDIENDANGKYHANGNGAY_VIEW.`ID-DATA` = DATADANGKYHANGNGAY.`ID` ' +
                                'AND `Ngày Kế Hoạch` IS NOT NULL ' +
                                'AND `Ngày Kế Hoạch` <= NOW() ' +
                                'AND (DATADANGKYHANGNGAY.`isBusy` = \'0\' OR DATADANGKYHANGNGAY.`isBusy` IS NULL) ' +
                                'AND DATADANGKYHANGNGAY.`Cơ Sở` = \'!?!\' ' + querySkip + 
                                'AND `isDeactivate` = \'0\' ' +
                                filter + 'ORDER BY `Ngày Kế Hoạch` DESC ' +
                                'LIMIT 1';            
                                query = query.replace(/\!\?!/g, $('.khuvuc').attr('value'));
                                break;
                            case 'call':
                                query = 'SELECT * FROM quanlyhocsinh.DATADANGKYHANGNGAY ' +
                                'WHERE !EXISTS(SELECT * FROM quanlyhocsinh.GOIDIENDANGKYHANGNGAY_VIEW ' +
                                'WHERE GOIDIENDANGKYHANGNGAY_VIEW.`ID-DATA` = DATADANGKYHANGNGAY.`ID`) ' +
                                'AND (DATADANGKYHANGNGAY.`isBusy` = \'0\' OR DATADANGKYHANGNGAY.`isBusy` IS NULL) ' +
                                'AND `Cơ Sở` = \'!?!\' ' + querySkip + 
                                'AND `isDeactivate` = \'0\' ' + filter +
                                'LIMIT 1';
                                query = query.replace(/\!\?!/g, $('.khuvuc').attr('value'));
                                break;
                            default:
                                this.close();
                        }
                        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                            fn : 'goidiendangkyhangngay_loaddanhsachsochuagoi' + $('#lable_button_nexttoicon').attr('value'),
                        }); 
                        break;
                    case 'goidiendangkyhangngay_close':
                        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                        break;
                    case 'goidiendangkyhangngay_loadhotline':
                        this.setState({
                            danhsachhotline: rows,
                        });
                        break;
                    case 'goidiendangkyhangngay_isDeactivate':
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
        let query;
        let that = this;
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
      
        query = 'SELECT * FROM quanlyhocsinh.BANGTHONGTIN'
        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'goidiendangkyhangngay_loadbangthongtin',
        });

        query = 'SELECT `Lớp` FROM quanlyhocsinh.DATADANGKYHANGNGAY WHERE `Cơ Sở` = \'!?!\' AND `Lớp` IS NOT NULL GROUP BY `Lớp`; ' +
        'SELECT `Tên Trường` FROM quanlyhocsinh.DATADANGKYHANGNGAY WHERE `Cơ Sở` = \'!?!\' AND `Tên Trường` IS NOT NULL GROUP BY `Tên Trường`; ';
        if (this.props.action == 'plancall') {
            query += 'SELECT `Chương Trình Gọi` FROM quanlyhocsinh.GOIDIENDANGKYHANGNGAY_VIEW WHERE `Cơ Sở` = \'!?!\' GROUP BY `Chương Trình Gọi`; ';
        }
        query = query.replace(/\!\?!/g, $('.khuvuc').attr('value'));
        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'goidiendangkyhangngay_loadgoiyboloc',
        });

        query = 'SELECT * FROM quanlyhocsinh.HOTLINE WHERE `Cơ Sở` = \'!?!\' AND `isActivated` = \'1\';';
        query = query.replace('!?!', $('.khuvuc').attr('value'));
        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'goidiendangkyhangngay_loadhotline',
        });
    }

    componentWillUnmount() {
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);

        let query = this.state.SetBusy;
        if (query != null) {
            query = query.replace(/`isBusy`=\'1\'/g, '`isBusy`=\'0\', expires_on=null');
            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                fn : 'goidiendangkyhangngay_trackisBusynone',
            });
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.isSkip) {
            this.loadNextData();
            this.setState({
                isSkip: false,
            })
        }
    }

    next () {
        if (this.state.sohotline == null) {
            var sohotline = $('input[name=goidientuvan_sohotline]:checked').val();
            if (sohotline != null) {
                this.setState({
                    disbutton: true,
                    sohotline: sohotline,
                })
                this.loadData();
            } else {
                this.props.dispatch({
                    type: 'ALERT_NOTIFICATION_ADD',
                    content: 'Vui lòng chọn hotline trước khi thực hiện cuộc gọi!',
                    notifyType: 'warning',
                })
            }
        } else {
            this.setState({disbutton: true,})
            this.state.danhsachsochuagoi.map((v, i) => {
                this['rowcall' + i].dongy(this.loadNextData, this.wrong_update);
            });
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
            filter += '`DATADANGKYHANGNGAY`.`Lớp` LIKE \'!?!%\' AND '.replace('!?!', this.refs.filterclass.value);
        }

        if (this.refs.filterschools != null && this.refs.filterschools.value != '') {
            filter += '`DATADANGKYHANGNGAY`.`Tên Trường` LIKE \'%!?!%\' AND '.replace('!?!', this.refs.filterschools.value);
        }

        if (this.refs.filterchuongtrinhgoi != null && this.refs.filterchuongtrinhgoi.value != '') {
            filter += '`CALLDANGKYHANGNGAY`.`Chương Trình Gọi` LIKE \'%!?!%\' AND '.replace('!?!', this.refs.filterchuongtrinhgoi.value);
        }
        
        if (filter != '') {
            filter = 'AND (' + filter.substr(0, filter.length - ' AND '.length) + ') ';
        }

        this.setState({
            filter: filter,
        })

        switch (this.props.action) {
            case 'plancall':
                query = 'SELECT DATADANGKYHANGNGAY.* ' +
                'FROM quanlyhocsinh.DATADANGKYHANGNGAY, quanlyhocsinh.GOIDIENDANGKYHANGNGAY_VIEW ' +
                'WHERE GOIDIENDANGKYHANGNGAY_VIEW.`ID-DATA` = DATADANGKYHANGNGAY.`ID` ' +
                'AND `Ngày Kế Hoạch` IS NOT NULL ' +
                'AND `Ngày Kế Hoạch` <= NOW() ' +
                'AND (DATADANGKYHANGNGAY.`isBusy` = \'0\' OR DATADANGKYHANGNGAY.`isBusy` IS NULL) ' +
                'AND DATADANGKYHANGNGAY.`Cơ Sở` = \'!?!\' ' +
                'AND `isDeactivate` = \'0\' ' +
                filter + 'ORDER BY `Ngày Kế Hoạch` DESC ' +
                'LIMIT 1';            
                query = query.replace(/\!\?!/g, $('.khuvuc').attr('value'));
                break;
            case 'call':
                if (this.props.id != null) {
                    query = 'SELECT * FROM quanlyhocsinh.DATADANGKYHANGNGAY ' +
                    'WHERE `ID` = \'!?!\'';
                    query = query.replace('!?!', this.props.id);
                } else {       
                    query = 'SELECT * FROM quanlyhocsinh.DATADANGKYHANGNGAY ' +
                    'WHERE !EXISTS(SELECT * FROM quanlyhocsinh.GOIDIENDANGKYHANGNGAY_VIEW ' +
                    'WHERE GOIDIENDANGKYHANGNGAY_VIEW.`ID-DATA` = DATADANGKYHANGNGAY.`ID`) ' +
                    'AND (DATADANGKYHANGNGAY.`isBusy` = \'0\' OR DATADANGKYHANGNGAY.`isBusy` IS NULL) ' +
                    'AND `Cơ Sở` = \'!?!\' ' +
                    'AND `isDeactivate` = \'0\' ' + filter +
                    'LIMIT 1';            
                    query = query.replace(/\!\?!/g, $('.khuvuc').attr('value'));
                }
                break;
            default:
                this.close();
        }

        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'goidiendangkyhangngay_loaddanhsachsochuagoi' + $('#lable_button_nexttoicon').attr('value'),
        });
    }

    loadNextData () {
        let query = this.state.SetBusy;
        this.setState({disbutton: true});
        if (query != null) {
            query = query.replace(/`isBusy`=\'1\'/g, '`isBusy`=\'0\', expires_on=null');
            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                fn : 'goidiendangkyhangngay_trackisBusyISNULLandLoadNext',
            });
        } else {
            let filter = this.state.filter;
            query = '';
            let querySkip = '';
            for (let _skip of this.state.skipData) {
                querySkip += 'AND DATADANGKYHANGNGAY.`ID` != \'!\?!\' '.replace('!\?!', _skip);
            }
            switch (this.props.action) {
                case 'plancall':
                    query = 'SELECT DATADANGKYHANGNGAY.* ' +
                    'FROM quanlyhocsinh.DATADANGKYHANGNGAY, quanlyhocsinh.GOIDIENDANGKYHANGNGAY_VIEW ' +
                    'WHERE GOIDIENDANGKYHANGNGAY_VIEW.`ID-DATA` = DATADANGKYHANGNGAY.`ID` ' +
                    'AND `Ngày Kế Hoạch` IS NOT NULL ' +
                    'AND `Ngày Kế Hoạch` <= NOW() ' +
                    'AND (DATADANGKYHANGNGAY.`isBusy` = \'0\' OR DATADANGKYHANGNGAY.`isBusy` IS NULL) ' +
                    'AND DATADANGKYHANGNGAY.`Cơ Sở` = \'!?!\' ' + querySkip +
                    'AND `isDeactivate` = \'0\' ' +
                    filter + 'ORDER BY `Ngày Kế Hoạch` DESC ' +
                    'LIMIT 1';            
                    query = query.replace(/\!\?!/g, $('.khuvuc').attr('value'));
                    break;
                case 'call':
                    query = 'SELECT * FROM quanlyhocsinh.DATADANGKYHANGNGAY ' +
                    'WHERE !EXISTS(SELECT * FROM quanlyhocsinh.GOIDIENDANGKYHANGNGAY_VIEW ' +
                    'WHERE GOIDIENDANGKYHANGNGAY_VIEW.`ID-DATA` = DATADANGKYHANGNGAY.`ID`) ' +
                    'AND (DATADANGKYHANGNGAY.`isBusy` = \'0\' OR DATADANGKYHANGNGAY.`isBusy` IS NULL) ' +
                    'AND `Cơ Sở` = \'!?!\' ' + querySkip +
                    'AND `isDeactivate` = \'0\' ' + filter +
                    'LIMIT 1';
                    query = query.replace(/\!\?!/g, $('.khuvuc').attr('value'));
                    break;
                default:
                    this.close();
            }
            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                fn : 'goidiendangkyhangngay_loaddanhsachsochuagoi' + $('#lable_button_nexttoicon').attr('value'),
            }); 
        }
    }

    dahoctaiH123 () {
        let query;
        this.state.danhsachsochuagoi.map((v, i) => {
            query = 'UPDATE `quanlyhocsinh`.`DATADANGKYHANGNGAY` SET `isDeactivate`=\'1\' WHERE `ID`=\'!?!\'';
            query = query.replace('!?!', v['ID']);
            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                fn : 'goidiendangkyhangngay_isDeactivate',
                isSuccess: true,
            }); 
        })
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
        let data_old = this.props.data_old;
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
            data_old = this.state.data_old_kehoach;
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

        if (this.state.sohotline == null) {
            return (
                <div className={style.formstyle}>
                <div className="form_body">
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
                                                    {' 0' + v['Số Điện Thoại']}
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
                        <input type="button" onClick={this.close.bind(this)} value="Thoát" disabled={this.state.disbutton}/>
                        <input type="button" onClick={this.next.bind(this)} value="Tiếp Tục" disabled={this.state.disbutton}/>
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
                            <h2>Gọi Đăng Ký Hàng Ngày</h2>
                        </div>
                        <div className="body">
                            <div className="divformstyle">
                                <div>
                                    <h2 style={{'margin': '0', 'text-align': 'center'}}>
                                        {title}
                                    </h2>
                                </div>
                            </div>
                            {
                                this.state.danhsachsochuagoi.map((v, i) => {
                                    return (
                                        <RowCall
                                            data_old={data_old}
                                            data={v}
                                            sohotline={this.state.sohotline}
                                            key={i}
                                            bangthongtin={this.state.bangthongtin}
                                            getMe={me => this['rowcall' + i] = me}
                                        />
                                    )
                                })
                            }
                        </div>
                        <div className="footer">
                            <input type="button" onClick={this.close.bind(this)} value="Thoát" disabled={this.state.disbutton}/>
                            <input type="button" onClick={this.dongy.bind(this)} value="Lưu" disabled={this.state.disbutton}/>
                            {nextbutton}
                            <input type="button" onClick={this.dahoctaiH123.bind(this)} value="Đã Hoặc Đang Học Tại Houston123" disabled={this.state.disbutton}/>
                        </div>
                    </div>
                    <div className="daithem">
                    </div>
                </div>
            )
        }
    }
}

module.exports = connect(function (state) {
    return {
      socket: state.socket,
    };
  }) (GoiDienDangKyHangNgay);
