import React from 'react';
import { connect } from 'react-redux';
import style from '../style.css';
var ReactDOM = require('react-dom');

import Hotline from './Hotline';
import RowCall from './RowCall';
import RowCallCSKH from './RowCallCSKH';
import BranchSelector from '../elements/BranchSelector';
import Button from '../elements/Button';

class Call extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sohotline: null,
            chuyendausonhamang: [],
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
        }
        this.callBackDataFormDatabase = this.callBackDataFormDatabase.bind(this);
        this.loadNextData = this.loadNextData.bind(this);
        this.wrong_update = this.wrong_update.bind(this);
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
                    case 'form_call_loadgoiyboloc':
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
                            query = 'UPDATE `' + this.props.sourceData + '` SET `isBusy`=\'1\' WHERE `ID`=\'!?!\'; '.replace('!?!', rows[0]['ID']);
                        } else {
                            query = '';
                        }

                        if (query != '') {
                            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                                fn: 'goidiendata_trackisBusy',
                                id: rows[0]['ID'],
                            });
                            this.setState({
                                thongtinkhachhang: rows[0],
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
                            let date = new Date();
                            let get2h = new Date();
                            get2h.setHours(get2h.getHours() + 2);
                            let time = get2h.toLocaleTimeString('en-GB');
                            let ngaygoi = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2) + ' ' + time;
                            query = query.replace('`isBusy`=\'1\'', '`expires_on`=\'' + ngaygoi + '\', `callerID`=\'' + $('#lable_button_nexttoicon').attr('value') + '\'');
                            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                            });

                            switch (this.props.action) {
                                case 'plancall':
                                    switch (this.props.sourceData) {
                                        case 'DATA_TRUONGTIEMNANG':
                                            query = 'SELECT ' + this.props.destination + '.*, QUANLY.`Họ Và Tên` AS `Họ Tên Nhân Viên` FROM ' + this.props.destination + ' ' +
                                            'LEFT JOIN QUANLY ON QUANLY.`Mã Quản Lý` = ' + this.props.destination + '.`Mã Nhân Viên` ' +
                                            'WHERE `ID-DATA` = \'!?!\'';
                                            query = query.replace('!?!', dulieuguive.id);
                                            break;
                                        case 'USERS':
                                            query = 'SELECT ' + this.props.destination + '.*, QUANLY.`Họ Và Tên` AS `Họ Tên Nhân Viên` FROM ' + this.props.destination + ' ' +
                                            'LEFT JOIN USERS ON USERS.`User ID` = ' + this.props.destination + '.`User ID` ' +
                                            'LEFT JOIN QUANLY ON QUANLY.`Mã Quản Lý` = ' + this.props.destination + '.`Mã Nhân Viên` ' +
                                            'WHERE USERS.`ID` = \'!\?!\'';
                                            query = query.replace('!?!', dulieuguive.id);
                                            break;
                                        default:
                                    }
                                    this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                                        fn: 'goidiendata_loaddata_old',
                                    });
                                    break;
                                case 'call':
                                    this.setState({disbutton: false});
                                    break;
                                default:
                                    this.close();
                            }
                        } else {
                            let that = this;
                            query = this.getQuery();
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
                        query = this.getQuery();
                        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                            fn : 'goidiendata_loaddanhsachsochuagoi' + $('#lable_button_nexttoicon').attr('value'),
                        }); 
                        break;
                    case 'goidiendata_close':
                        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                        break;
                    case 'goidiendata_dahoctaih123':
                        if (this.props.id != null) {
                            this.close();
                        } else {
                            this.loadNextData();
                        }
                        break;
                    case 'form_call_loaddoidausonhamang': {
                        this.setState({chuyendausonhamang: rows})
                    }
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
        && this.props.destination == null
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
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
      
        query = 'SELECT * FROM BANGTHONGTIN'
        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'goidiendata_loadbangthongtin',
        });

        query = 'SELECT `Lớp` FROM !~! WHERE `Cơ Sở` = \'!\?!\' AND `Lớp` IS NOT NULL ' + sourceFilter + 'GROUP BY `Lớp`; ' +
        'SELECT `Tên Trường` FROM !~! WHERE `Cơ Sở` = \'!\?!\' AND `Tên Trường` IS NOT NULL ' + sourceFilter + 'GROUP BY `Tên Trường`; ';
        if (this.props.action == 'plancall') {
            switch (this.props.sourceData) {
                case 'DATA_TRUONGTIEMNANG':
                    query += 'SELECT `Chương Trình Gọi` FROM !~! WHERE `Cơ Sở` = \'!\?!\' GROUP BY `Chương Trình Gọi`; '.replace('!~!', this.props.sourceView);
                    break;
                case 'USERS':
                    
                    break;
                default:
            }
        }
        query = query.replace(/\!\?!/g, $('.khuvuc').attr('value'));
        query = query.replace('!~!', this.props.sourceData);
        query = query.replace('!~!', this.props.sourceData);
        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'form_call_loadgoiyboloc',
        });

        query = 'SELECT * FROM DANHSACHDAUSONHAMANG WHERE `activeDate` < NOW() OR `activeDate` IS NULL AND `Đầu Số Mới` IS NOT NULL; ';
        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'form_call_loaddoidausonhamang',
        });
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.changeSize);
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);

        let query = this.state.SetBusy;
        if (query != null) {
            query = query.replace('`isBusy`=\'1\'', '`isBusy`=\'0\', `expires_on`=null, `callerID`=null');
            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                fn : 'goidiendata_trackisBusynone',
            });
        }
    }

    componentDidUpdate(prevProps, prevState) {
        this.changeSize();

        if (this.state.isSkip) {
            this.setState({
                isSkip: false,
            });
            this.loadNextData();
        }
    }

    next () {
        this.setState({disbutton: true,})
        this.rowcall.dongy(this.loadNextData, this.wrong_update);
    }

    wrong_update () {
        this.setState({disbutton: false,})
    }

    boqua () {
        let skipData = this.state.skipData;
        skipData.push(this.state.thongtinkhachhang['ID']);

        this.setState({
            skipData: skipData,
            isSkip: true,
        });
    }

    getQuery (
        filter = this.state.filter,
        softNetwork = this.state.softNetwork,
        softNetwork_plane = this.state.softNetwork_plane,
    ) {
        let query = '';
        let querySkip = '';
        let sourceFilter = '';
        if (this.props.sourceFilter != null) {
            sourceFilter = ' ' + this.props.sourceFilter + ' ';
        }
        for (let _skip of this.state.skipData) {
            querySkip += 'AND ' + this.props.sourceData + '.`ID` != \'!\?!\' '.replace('!\?!', _skip);
        }
        switch (this.props.action) {
            case 'plancall':
                query = 'SELECT ' + this.props.sourceData + '.*, DANHSACHDAUSONHAMANG.`Nhà Mạng` ' +
                'FROM ' + this.props.sourceData + ', ' + this.props.sourceView + ', DANHSACHDAUSONHAMANG ' +
                'WHERE ' + this.props.sourceView + '.`ID-DATA` = ' + this.props.sourceData + '.`ID` ' +
                'AND (' + this.props.sourceData + '.`Số Điện Thoại` LIKE CONCAT(DANHSACHDAUSONHAMANG.`Đầu Số`, \'%\') ' +
                'OR ' + this.props.sourceData + '.`Số Điện Thoại` LIKE CONCAT(\'0\', DANHSACHDAUSONHAMANG.`Đầu Số`, \'%\')) ' +
                'AND `Ngày Kế Hoạch` IS NOT NULL ' +
                'AND `Ngày Kế Hoạch` <= NOW() ' +
                'AND (' + this.props.sourceData + '.`isBusy` = \'0\' OR ' + this.props.sourceData + '.`isBusy` IS NULL) ' +
                'AND ' + this.props.sourceData + '.`Cơ Sở` = \'!?!\' ' + querySkip +
                sourceFilter +
                'AND `isDeactivate` = \'0\' ' + this.state.source +
                filter + 'ORDER BY `Ngày Kế Hoạch` DESC' +
                softNetwork_plane + ' LIMIT 1';
                query = query.replace(/\!\?!/g, $('.khuvuc').attr('value'));
                break;
            case 'call':
                if (this.props.id != null) {
                    query = 'SELECT * FROM ' + this.props.sourceData + ' ' +
                    'WHERE `ID` = \'!?!\'';
                    query = query.replace('!?!', this.props.id);
                } else {
                    query = 'SELECT * FROM ' + this.props.sourceData + ' ' +
                    'LEFT JOIN DANHSACHDAUSONHAMANG ON ' +
                    '' + this.props.sourceData + '.`Số Điện Thoại` LIKE CONCAT(DANHSACHDAUSONHAMANG.`Đầu Số`, \'%\') ' +
                    'OR ' + this.props.sourceData + '.`Số Điện Thoại` LIKE CONCAT(\'0\', DANHSACHDAUSONHAMANG.`Đầu Số`, \'%\') ' +
                    'WHERE !EXISTS(SELECT * FROM ' + this.props.sourceView + ' ' +
                    'WHERE ' + this.props.sourceView + '.`ID-DATA` = ' + this.props.sourceData + '.`ID`) ' +
                    'AND (' + this.props.sourceData + '.`isBusy` = \'0\' OR ' + this.props.sourceData + '.`isBusy` IS NULL) ' +
                    'AND ' + this.props.sourceData + '.`Cơ Sở` = \'!?!\' ' + querySkip +
                    sourceFilter +
                    'AND `isDeactivate` = \'0\' ' + filter + this.state.source +
                    softNetwork + 'LIMIT 1';
                    query = query.replace(/\!\?!/g, $('.khuvuc').attr('value'));
                }
                break;
            default:
                this.close();
        }
        return query;
    }

    loadData (softNetwork, softNetwork_plane) {
        let filter = '';
        if (this.refs.filterclass != null && this.refs.filterclass.value != '') {
            filter += this.props.sourceData + '.`Lớp` LIKE \'!?!%\' AND '.replace('!?!', this.refs.filterclass.value);
        }

        if (this.refs.filterschools != null && this.refs.filterschools.value != '') {
            filter += this.props.sourceData + '.`Tên Trường` LIKE \'%!?!%\' AND '.replace('!?!', this.refs.filterschools.value);
        }

        switch (this.props.sourceData) {
            case 'DATA_TRUONGTIEMNANG':
                if (this.refs.filterchuongtrinhgoi != null && this.refs.filterchuongtrinhgoi.value != '') {
                    filter += this.props.sourceView + '.`Chương Trình Gọi` LIKE \'%!?!%\' AND '.replace('!?!', this.refs.filterchuongtrinhgoi.value);           
                }
                break;
            case 'USERS':
                
                break;
            default:
        }
        
        if (filter != '') {
            filter = 'AND (' + filter.substr(0, filter.length - ' AND '.length) + ') ';
        }

        this.setState({
            filter: filter,
        })

        let query = this.getQuery(filter, softNetwork, softNetwork_plane);
        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'goidiendata_loaddanhsachsochuagoi' + $('#lable_button_nexttoicon').attr('value'),
        });
    }

    loadNextData () {
        let query = this.state.SetBusy;
        this.setState({disbutton: true});
        if (query != null) {
            query = query.replace('`isBusy`=\'1\'', '`isBusy`=\'0\', `expires_on`=null, `callerID`=null');
            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                fn : 'goidiendata_trackisBusyISNULLandLoadNext',
            });
        } else {
            query = this.getQuery();
            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                fn : 'goidiendata_loaddanhsachsochuagoi' + $('#lable_button_nexttoicon').attr('value'),
            }); 
        }
    }

    dahoctaiH123 () {
        let query;
        query = 'UPDATE `' + this.props.sourceData + '` SET `isDeactivate`=\'1\' WHERE `ID`=\'!?!\'';
        query = query.replace('!?!', this.state.thongtinkhachhang['ID']);
        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'goidiendata_dahoctaih123',
            isSuccess: true,
        });
    }

    dongy () {
        this.setState({disbutton: true,})
        this.rowcall.dongy(this.close, this.wrong_update);
    }

    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    }

    render () {
        let title = '';
        title = $('#lable_button_nexttoicon').attr('value') + ' - ' + $('#lable_button_nexttoicon')[0].innerText;

        let nextbutton = 
        <div>
            <Button 
                onClick={this.next.bind(this)}
                value="Tiếp Tục"
                icon="next"
                style={{'float': 'right', 'margin-right': '10px',}}
                disabled={this.state.disbutton}
            />
            <Button 
                onClick={this.boqua.bind(this)}
                value="Bỏ Qua"
                icon="skip"
                style={{'float': 'right', 'margin-right': '10px',}}
                disabled={this.state.disbutton}
            />
        </div>

        let filter = null;
        let dataOld = this.props.dataOld;
        let branchselector = null;
        if (this.state.brachselecting) {
            branchselector = 
            <BranchSelector 
                onAgree={this.BranchSelectorOnAgree.bind(this)} 
                onCancel={this.BranchSelectorOnCancel.bind(this)}
            />
        }

        let rowcall = null;
        let dahoctaih123 = null;
        switch (this.props.sourceData) {
            case 'DATA_TRUONGTIEMNANG': {
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
                    rowcall = 
                    <RowCall
                        dataOld={dataOld}
                        data={this.state.thongtinkhachhang}
                        sohotline={this.state.sohotline}
                        bangthongtin={this.state.bangthongtin}
                        getMe={me => this.rowcall = me}
                        chuyendausonhamang={this.state.chuyendausonhamang}
                    />
                    dahoctaih123 = 
                    <Button 
                        onClick={this.dahoctaiH123.bind(this)}
                        value="Đã Hoặc Đang Học Tại H123"
                        icon="smile"
                        style={{'float': 'right', 'margin-right': '10px',}}
                        disabled={this.state.disbutton}
                    />
                }
                break;
            case 'USERS': {
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
                    }
                    rowcall = 
                    <RowCallCSKH
                        dataOld={dataOld}
                        data={this.state.thongtinkhachhang}
                        sohotline={this.state.sohotline}
                        bangthongtin={this.state.bangthongtin}
                        getMe={me => this.rowcall = me}
                        chuyendausonhamang={this.state.chuyendausonhamang}
                    />
                }
                break;
            default:
                
        }

        if (this.state.sohotline == null) {
            return (
                <Hotline
                    filter={filter}
                    onAgree={(sohotline, softNetwork, softNetwork_plane) => {
                        this.setState({
                            sohotline: sohotline,
                            softNetwork: softNetwork,
                            softNetwork_plane: softNetwork_plane,
                        })
                        this.loadData(softNetwork, softNetwork_plane);
                    }}
                />
            )
        } else {
            return (
                <div className={style.formstyle} ref="background">
                    <div className="form_body" ref="body" style={{'width': '1100px'}}>
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
                            {rowcall}
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
                                onClick={this.dongy.bind(this)}
                                value="Đồng Ý"
                                icon="agree"
                                style={{'float': 'right', 'margin-right': '10px',}}
                                disabled={this.state.disbutton}
                            />
                            {nextbutton}
                            {dahoctaih123}
                            <Button 
                                onClick={this.chuyenSangChiNhanhKhac.bind(this)}
                                value="Chuyển Sang Chi Nhánh Khác"
                                icon="paste"
                                style={{'float': 'right', 'margin-right': '10px',}}
                                disabled={this.state.disbutton}
                            />
                        </div>
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
            this.rowcall.dongy(() => {
                let query = 'UPDATE `' + this.props.sourceData + '` SET `Cơ Sở`=\'!\?!\' WHERE `ID`=\'!\?!\';'
                query = query.replace('!\?!', value);
                query = query.replace('!\?!', this.state.thongtinkhachhang['ID']);
                that.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                    isSuccess: true,
                }); 
                that.close();
            }, this.wrong_update);
        } else {
            this.rowcall.dongy(() => {
                let query = 'UPDATE `' + this.props.sourceData + '` SET `Cơ Sở`=\'!\?!\' WHERE `ID`=\'!\?!\';'
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
}) (Call);