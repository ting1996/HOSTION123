import React from 'react';
import { connect } from 'react-redux';
import style from '../../style.css';
import mystyle from './style.css';
var ReactDOM = require('react-dom');
import Calendar from '../../calendar/Calendar';
import Button from '../../elements/Button';

let colorchoose = 'lightblue';
let colorchoose_force = 'lightcoral';
let colordiscount = '#f006';

class DangKyMonHoc extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            listMonHoc: [],
            danhsachmonhoc: [],
            chuongtrinhhocbosung: [],
            
            monhocdadangky: [],            
            lopcothevao: [],
            registeredInfo: null,
            classInformation: null,

            btnAllDisable: false,
            btnCloseDisable: false,
            btnAgreeDisable: false,
            clickedValue: null,
            isClassChange: false,

            registrasionDate: null,
            lopdadangky: [],
        }
        this.callBackDataFormDatabase = this.callBackDataFormDatabase.bind(this);
        this.SocketEmit = this.SocketEmit.bind(this);
        this.changeSize = this.changeSize.bind(this);
        this.windowKeyDown = this.windowKeyDown.bind(this);
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

    callBackDataFormDatabase (rows, hanhdong, dulieuguive) {
        if (hanhdong == 'laydulieu_trave') {
            if (dulieuguive != null) {
                switch (dulieuguive.fn) {
                    case 'form_hocsinh_dangkymonhoc_loaddulieu': {
                        let monhocdadangky = [];
                        let danhsachmonhoc = [];
                        let registeredInfo = null;
                        
                        for (let row of rows[0]) {
                            row.classNumber = 1;
                            danhsachmonhoc.push({...row});
                        }
                        if (rows[1].length > 0) {
                            registeredInfo = rows[1][0];
                            let lMonHocDaDK = JSON.parse(rows[1][0].monhoc);                            
                            for (let i in lMonHocDaDK) {
                                if (lMonHocDaDK.hasOwnProperty(i)) {
                                    for (let row of rows[0]) {
                                        if (lMonHocDaDK[i].mamon == row['Mã Môn Học']) {
                                            let mon = {...row};
                                            mon.classNumber = lMonHocDaDK[i].soluong;                                            
                                            mon.classRegistrasion = lMonHocDaDK[i].classRegistrasion;
                                            if (lMonHocDaDK[i].idchuongtrinhhoc != null) {
                                                mon.idChuongtrinhhoc = lMonHocDaDK[i].idchuongtrinhhoc;
                                                mon.forceClassRegistrasion = lMonHocDaDK[i].forceClassRegistrasion;
                                                mon.forceSubject = true;
                                                for (let ct of rows[2]) {                                                    
                                                    if (ct['ID'] == lMonHocDaDK[i].idchuongtrinhhoc) {
                                                        mon.tenchuongtrinhhoc = ct['Tên Chương Trình'];
                                                        mon.forceClassCode = ct.forceClassCode;
                                                        let cth = JSON.parse(ct['Chương Trình Học']);
                                                        for (let i1 in cth) {
                                                            if (cth.hasOwnProperty(i1)
                                                            && cth[i1].mamon == lMonHocDaDK[i].mamon) {
                                                                mon.forceSubject = cth[i1].forceSubject;
                                                                break;
                                                            }
                                                        }                                                        
                                                        break;
                                                    }
                                                }
                                            }
                                            monhocdadangky.push(mon);                                            
                                        }
                                    }
                                }
                            }
                        }
                        let lopdadangky = [];
                        for (let row of monhocdadangky) {
                            for (let row2 of rows[3]) {
                                if (lopdadangky.indexOf(row2['Mã Lớp']) == -1) {
                                    lopdadangky.push(row2['Mã Lớp']);
                                }
                                if (row.forceClassCode == row2['Mã Môn Học']) {
                                    row.forceClass = row2['Mã Lớp'];
                                }
                                if (row['Mã Môn Học'] == row2['Mã Môn Học']) {
                                    row.class = row2['Mã Lớp'];
                                    break;
                                }
                            }
                        }                        
                        
                        this.setState({
                            listMonHoc: rows[0],
                            danhsachmonhoc: danhsachmonhoc,
                            chuongtrinhhocbosung: rows[2],
                            monhocdadangky: monhocdadangky,
                            registeredInfo: registeredInfo,
                            lopdadangky: lopdadangky,
                        });
                    } break;
                    case 'form_hocsinh_dangkymonhoc_successful': {
                        this.close();
                    } break;
                    case 'form_hocsinh_dangkymonhoc_loadClass': {
                        let mhddk = this.state.monhocdadangky;
                        let classInformation = {};
                        for (let row of rows) {
                            for (let mh of mhddk) {
                                if (mh.class == row['Mã Lớp']
                                || mh.forceClass == row['Mã Lớp']) {                                    
                                    row.isReady = true;
                                    if (mh['Mã Môn Học'] == row['Mã Môn Học']) {
                                        row.class = mh.class;
                                    }
                                    row.classRegistrasion = mh.classRegistrasion;                                    
                                    row.forceClassRegistrasion = mh.forceClassRegistrasion;
                                    row.forceClass = mh.forceClass;
                                    break;
                                }
                            }
                        }                        

                        if (rows[0] != null) {
                            classInformation.nextRef = rows[0]['Mã Lớp'];
                        }

                        if (rows[rows.length - 1] != null) {
                            classInformation.backRef = rows[rows.length - 1]['Mã Lớp'];
                        }
                        
                        this.setState({
                            lopcothevao: rows,
                            monhocdadangky: mhddk,
                            classInformation: classInformation,
                        });
                    } break;
                    case 'form_hocsinh_dangkymonhoc_loadClassInfor': {
                        this.calendar.showFullLocalCalendar(rows);
                    } break;
                    default:
                }
                
            }
        }  
    }

    windowKeyDown (e) {
        if (this.state.classInformation != null) {
            if (e.which == 40 && this.refs[this.state.classInformation.nextRef] != null) {
                this.refs[this.state.classInformation.nextRef].scrollIntoView();
                this.refs[this.state.classInformation.nextRef].click();
                e.preventDefault();
            }
            if (e.which == 38 && this.refs[this.state.classInformation.backRef] != null) {
                this.refs[this.state.classInformation.backRef].scrollIntoView();
                this.refs[this.state.classInformation.backRef].click();
                e.preventDefault();
            }
        }
    }

    componentDidMount () {
        let query;
        window.addEventListener("resize", this.changeSize);
        window.addEventListener("keydown", this.windowKeyDown, false);
        this.changeSize();
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);

        if (this.props.data != null) {
            query = 'SELECT * FROM MONHOC_!\?!; ';
            query = query.replace('!\?!', $('.khuvuc').attr('value'));
            query += 'SELECT * FROM DANGKIMONHOC WHERE `User ID` = \'!\?!\'; ';
            query = query.replace('!\?!', this.props.data['User ID']);
            query += 'SELECT * FROM CHUONGTRINHHOCBOSUNG WHERE (`Cơ Sở` = \'ALL\' OR `Cơ Sở` = \'!\?!\') AND (`Lớp Áp Dụng` = \'!\?!\' OR `Lớp Áp Dụng` IS NULL); ';
            query = query.replace('!\?!', $('.khuvuc').attr('value'));
            query = query.replace('!\?!', this.props.data['Lớp']);
            query += 'SELECT DANHSACHHOCSINHTRONGLOP.*, LOPHOC.`Mã Môn Học`, LOPHOC.`Lớp`, LOPHOC.`Ngày Bắt Đầu`, LOPHOC.`Ngày Kết Thúc` ' +
            'FROM DANHSACHHOCSINHTRONGLOP ' +
            'LEFT JOIN LOPHOC ON LOPHOC.`Mã Lớp` = DANHSACHHOCSINHTRONGLOP.`Mã Lớp` ' +
            'WHERE CONVERT_TZ(CURDATE(), @@session.time_zone,\'+07:00\') <= LOPHOC.`Ngày Kết Thúc` ' +
            'AND LOPHOC.`branch` = \'!\?!\' AND DANHSACHHOCSINHTRONGLOP.`User ID` = \'!\?!\'; ' ;
            query = query.replace('!\?!', $('.khuvuc').attr('value'));
            query = query.replace('!\?!', this.props.data['User ID']);
            this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
                fn : 'form_hocsinh_dangkymonhoc_loaddulieu',
            });
        } else {
            this.close();
        }
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.changeSize);
        window.removeEventListener("keydown", this.windowKeyDown, false);
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentDidUpdate(prevProps, prevState) {
        this.changeSize();
        if (this.state.isClassChange) {
            this.setState({isClassChange: false});
            if (this.state.clickedValue != null) {
                this.refs[this.state.clickedValue.ref].click();
                this.refs[this.state.clickedValue.ref].scrollIntoView();
            }
        }
    }

    dongy () {
        if (this.state.monhocdadangky.length <= 0) {
            this.props.dispatch({
                type: 'ALERT_NOTIFICATION_ADD',
                content: 'Vui lòng chọn môn học cần đăng ký!',
                notifyType: 'warning',
            })
            return;
        }

        let obj = {};
        let query;
        let count = {};
        let checkFail = false;
        this.state.monhocdadangky.map((v, i) => {
            if (v.idChuongtrinhhoc != null) {
                if (count[v.idChuongtrinhhoc] == null) {
                    count[v.idChuongtrinhhoc] = 1;
                } else {
                    count[v.idChuongtrinhhoc] = count[v.idChuongtrinhhoc] + 1;
                } 
            }
            
            obj[i] = {
                mamon: v['Mã Môn Học'],
                soluong: v.classNumber,
                idchuongtrinhhoc: v.idChuongtrinhhoc,
                trongoi: false,
                classRegistrasion: v.classRegistrasion,
                forceClassRegistrasion: v.forceClassRegistrasion,
            }
            
            if (v.class == null && v.forceClass == null) {
                // this.props.dispatch({
                //     type: 'ALERT_NOTIFICATION_ADD',
                //     content: 'Vui lòng xếp lớp cho ' + v['Tên Môn'] + '!',
                //     notifyType: 'warning',
                // })
                // checkFail = true;
            }
        })

        if (checkFail) {
            return;
        }        

        this.state.chuongtrinhhocbosung.map((v1, i1) => {
            if (count[v1['ID']] != null) {
                let listmontrongoi = JSON.parse(v1['Chương Trình Học']);
                let _count = 0;
                for (let i2 in listmontrongoi) {
                    _count = _count + 1;
                }
                if (_count == count[v1['ID']]) {
                    this.state.monhocdadangky.map((v, i) => {
                        if (v.idChuongtrinhhoc == v1['ID']) {
                            obj[i].trongoi = true;
                            if (obj[i].trongoi) {
                                obj[i].classRegistrasion = obj[i].forceClassRegistrasion;
                            }
                        }
                    })
                }
            }
        })
        

        if (this.state.registeredInfo != null) {
            query = 'UPDATE `DANGKIMONHOC` SET `monhoc` = \'!\?!\', `ngaydangky` = \'!\?!\' WHERE (`ID` = \'!\?!\'); ';
            query = query.replace('!\?!', '@@@');
            let date = new Date();
            query = query.replace('!\?!', date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2));
            query = query.replace('!\?!', this.state.registeredInfo['ID']);
        } else {
            query = 'INSERT INTO `DANGKIMONHOC` (`User ID`, `monhoc`, `ngaydangky`) VALUES (\'!\?!\', \'!\?!\', \'!\?!\'); ';
            query = query.replace('!\?!', this.props.data['User ID']);
            query = query.replace('!\?!', '@@@');
            let date = new Date();
            query = query.replace('!\?!', date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2));
        }

        let addClass = [];
        let isAdding = false;
        for (let _class of this.state.monhocdadangky) {
            if (_class.class != null
            && addClass.indexOf(_class.class) == -1) {
                addClass.push(_class.class);
            }
            if (_class.forceClass != null
            && addClass.indexOf(_class.forceClass) == -1) {
                addClass.push(_class.forceClass);
            }
            if (this.state.lopdadangky.indexOf(_class.class) == -1
            || this.state.lopdadangky.indexOf(_class.forceClass) == -1) {
                isAdding = true;
            }
        }

        let queryClass = '';
        if (isAdding) {
            queryClass = 'DELETE FROM DANHSACHHOCSINHTRONGLOP WHERE (`User ID` = \'!\?!\'); ';
            queryClass = queryClass.replace('!\?!', this.props.data['User ID']);
            for (let i of addClass) {
                queryClass += 'INSERT INTO DANHSACHHOCSINHTRONGLOP (`User ID`, `Mã Lớp`) VALUES (\'!\?!\', \'!\?!\'); ';
                queryClass = queryClass.replace('!\?!', this.props.data['User ID']);
                queryClass = queryClass.replace('!\?!', i);
            }
        }
        query += queryClass;

        try {
            let mhddk = this.state.monhocdadangky;
            for (let i of mhddk) {
                i.checked = true;
            }
            this.props.onAgree(query, obj, mhddk);
        } catch (e) {
            query = query.replace('@@@', JSON.stringify(obj));
            this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
                fn : 'form_hocsinh_dangkymonhoc_successful',
                isReload: true,
                reloadPageName: 'hocsinh',
                isSuccess: true,
            });
        }
    }

    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    }

    render () {
        let color = '';
        if (this.state.trongoi) {
            color = colorchoose;
        }
        let btnaccept_title = 'Đồng Ý';
        if (false) {
            btnaccept_title = 'Tiếp Tục';
        }

        let classInformation = null;
        if (this.state.classInformation != null
        && this.state.classInformation['Mã Lớp'] != null) {
            let datebatdau = new Date (this.state.classInformation['Ngày Bắt Đầu']);
            let dateketthuc = new Date (this.state.classInformation['Ngày Kết Thúc']);
            classInformation = 
            <div style={{
                overflowY: 'hidden',
                display: 'grid',
                gridTemplateColumns: 'auto 200px',
            }}>
                <div style={{
                    overflowY: 'auto',
                }}>
                    <h3 style={{margin: 0}}>{this.state.classInformation['Mã Lớp']}</h3>
                    Giáo viên: {this.state.classInformation['Họ Và Tên']}<br/>
                    Môn: {this.state.classInformation['Tên Môn']}<br/>
                    Lớp: {this.state.classInformation['Lớp']}<br/>
                    Ngày bắt đầu: {datebatdau.toLocaleDateString('en-GB')}<br/>
                    Ngày kết thúc: {dateketthuc.toLocaleDateString('en-GB')}<br/>
                    Sĩ số: {this.state.classInformation['Số Lượng Học Sinh']}
                </div>
                <div>
                    {(() => {
                        if (this.state.classInformation.isReady
                        || this.state.classInformation.forceClass == this.state.classInformation['Mã Lớp']) {
                            return (
                                <div style={{padding: 0}}>
                                    <div style={{padding: 0}}>
                                        Đã nhập học: {(() => {
                                            if (this.state.classInformation != null
                                            && this.state.classInformation.forceClassRegistrasion != null) {
                                                return this.state.classInformation.forceClassRegistrasion;
                                            } else if (this.state.classInformation != null) {
                                                return this.state.classInformation.classRegistrasion;
                                            }
                                        })()}
                                    </div>
                                    <Button 
                                        onClick={() => {
                                            let info = this.state.classInformation;
                                            let mhddk = this.state.monhocdadangky;
                                            for (let mh of mhddk) {
                                                if (mh.class == info['Mã Lớp']
                                                || mh.forceClass == info['Mã Lớp']) {
                                                    if (mh.class == info['Mã Lớp']) {
                                                        mh.class = null;
                                                        mh.classRegistrasion = null;
                                                    }                                                
                                                    if (mh.forceClass == info['Mã Lớp']) {
                                                        mh.forceClass = null;
                                                        mh.forceClassRegistrasion = null;
                                                    }
                                                }
                                            }
                                            this.setState({
                                                monhocdadangky: mhddk,
                                                isClassChange: true,
                                            })
                                        }}
                                        value="Hủy"
                                        icon="close"
                                        style={{
                                            width: 'inherit',
                                            marginTop: '10px',
                                            textAlign: 'center',
                                            backgroundColor: 'darkred',
                                        }}
                                    />
                                </div>
                            )
                        } else {
                            return (
                                <div style={{padding: 0}}>
                                    <div style={{padding: 0}}>
                                        Ngày nhập học:
                                        <input 
                                            type="date"
                                            value={this.state.registrasionDate}
                                            onChange={(e) => {
                                                if (this.state.clickedValue != null
                                                    && (this.state.clickedValue.forceClassRegistrasion == null
                                                    || this.state.classInformation['Mã Môn Học'] == this.state.clickedValue.forceClassCode)) {
                                                        if (e.target.value == '') {
                                                            this.setState({registrasionDate: null});
                                                        } else {
                                                            this.setState({registrasionDate: e.target.value});
                                                        }
                                                }
                                            }}
                                        />
                                    </div>
                                    <Button 
                                        onClick={() => {
                                            if (this.state.registrasionDate == null) {
                                                this.props.dispatch({
                                                    type: 'ALERT_NOTIFICATION_ADD',
                                                    content: 'Vui lòng chọn ngày nhập học để đăng ký lớp!',
                                                    notifyType: 'warning',
                                                })
                                                return;
                                            }
                                            let info = this.state.classInformation;
                                            let mhddk = this.state.monhocdadangky;                                          

                                            for (let mh of mhddk) {                                                
                                                if (mh['Mã Môn Học'] == info['Mã Môn Học']) {
                                                    mh.class = info['Mã Lớp'];
                                                    mh.classRegistrasion = this.state.registrasionDate;
                                                }

                                                if (mh.forceClassCode == info['Mã Môn Học']) {
                                                    mh.forceClass = info['Mã Lớp'];
                                                    mh.forceClassRegistrasion = this.state.registrasionDate;
                                                }
                                            }

                                            this.setState({
                                                monhocdadangky: mhddk,
                                                isClassChange: true,
                                            })
                                        }}
                                        value="Đăng Ký"
                                        icon="agree"
                                        style={{
                                            width: 'inherit',
                                            marginTop: '10px',
                                            textAlign: 'center',
                                            backgroundColor: 'darkgreen',
                                        }}
                                    />
                                </div>
                            )
                        }
                    })()}
                </div>
            </div>
        }

        let subjectSelection = 
        <div className="divformstyle" style={{
            'grid-column-start': '1',
            'grid-column-end': '3',
        }}>
            <div style={{
                'display': 'flex',
                'overflow-y': 'hidden',
                'margin': '5px 16px 0 16px',
                'border': '1px solid #888',
                'padding': '0',
            }}>
                { 
                    this.state.monhocdadangky.map((e, i) => {
                        let btnname = e['Tên Môn'];
                        let classname = mystyle.button;
                        if (e.class != null) {
                            btnname += ' (' + e.class + ')';
                            classname += ' ' + mystyle.buttonHasClass;
                        } else if (e.forceClass != null) {
                            btnname += ' (' + e.forceClass + ')';
                            classname += ' ' + mystyle.buttonHasClass;
                        }
                        e.ref = 'mhddk' + i;
                        return (
                            <div style={{
                                'display': 'grid',
                                'grid-template-columns': 'auto auto',
                                'padding': '5px',
                            }}>
                                <div
                                    ref={e.ref}
                                    className={classname} 
                                    style={{
                                        padding: '5px',
                                        margin: '0',
                                        borderBottomLeftRadius: '10px',
                                        borderBottomRightRadius: '0px',
                                        borderTopLeftRadius: '10px',
                                        borderTopRightRadius: '0px',
                                    }}
                                    onClick={this.onSubjectClick.bind(this, e)}
                                >
                                    <span style={{
                                        'font-weight': 'bold',
                                        'color': 'blue',
                                        'white-space': 'nowrap',
                                    }}>
                                        {btnname}
                                    </span><br/>
                                    <span style={{
                                        'font-style': 'italic',
                                        'color': '#007eff',
                                        'white-space': 'nowrap',
                                    }}>
                                    {e.tenchuongtrinhhoc}
                                    </span>
                                </div>
                                <div 
                                    className={mystyle.buttonDelete}
                                    style={{'padding': '5px'}}
                                    onClick={() => {
                                        let monhocdadangky = this.state.monhocdadangky;
                                        if (e.forceSubject == true) {
                                            let i1, length;
                                            do {
                                                length = monhocdadangky.length
                                                for (i1 = 0; i1 < length; i1++) {
                                                    if (monhocdadangky[i1].idChuongtrinhhoc == e.idChuongtrinhhoc
                                                    && monhocdadangky[i1].forceSubject == true) {
                                                        monhocdadangky.splice(i1, 1);
                                                        break;
                                                    }
                                                }
                                            } while (i1 < length);
                                        } else {
                                            monhocdadangky.splice(i, 1);
                                        }
                                        this.setState({
                                            monhocdadangky: monhocdadangky
                                        });
                                    }}
                                >
                                    <span style={{
                                        'font-weight': 'bold',
                                        'color': 'red',
                                        'display': 'table-cell',
                                        'vertical-align': 'middle',
                                    }}>
                                        Xóa
                                    </span>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
            <div style={{
                'display': 'grid',
                'grid-template-columns': '35% 65%',
                'margin': '0px 16px',
                'padding': '0',
                'height': '140px',
                'border': '1px solid #888',
            }}>
                <div 
                    style={{
                        display: 'grid',
                        overflowY: 'scroll',
                        marginRight: '25px',
                    }}
                    ref='containerLopCoTheVao'
                >
                    {
                        this.state.lopcothevao.map((v, i) => {
                            let classname = mystyle.button;
                            if (v.isReady) {
                                if (v.class != null) {
                                    classname += ' ' + mystyle.buttonHasClass;
                                } else if (v.forceClass != null) {
                                    classname += ' ' + mystyle.forceClass;
                                }
                            }
                            let nextRef;
                            if (i == (this.state.lopcothevao.length - 1)) {
                                nextRef = this.state.lopcothevao[0]['Mã Lớp'];
                            } else {
                                nextRef = this.state.lopcothevao[i + 1]['Mã Lớp'];
                            }
                            let backRef;
                            if (i == 0) {
                                backRef = this.state.lopcothevao[this.state.lopcothevao.length - 1]['Mã Lớp'];
                            } else {
                                backRef = this.state.lopcothevao[i - 1]['Mã Lớp'];
                            }
                            let selected = null;
                            if (this.state.classInformation != null
                            && this.state.classInformation['Mã Lớp'] == v['Mã Lớp']) {
                                selected = <b>></b>
                            }
                            return (
                                <div
                                    ref={v['Mã Lớp']}
                                    onClick={this.onClickLopHoc.bind(this, {...v, backRef: backRef, nextRef: nextRef})}
                                    className={classname}
                                >
                                    {selected}{' ' + v['Mã Lớp'] + ' - (' + v['Họ Và Tên'] +')'}
                                </div>
                            )
                        })
                    }
                </div>
                {classInformation}
            </div>
        </div>        
        if (this.state.monhocdadangky.length <= 0) {
            subjectSelection = null;
        }
        
        return (
            <div className={style.formstyle} ref="background">
                <div className="form_body" ref="body"style={{'width': '1100px'}}>
                    <div className="header">
                        <h2>Đăng Ký Môn Học</h2>
                    </div>
                    <div className="body" 
                        style={{
                            'text-align': 'center',
                            'display': 'grid',
                            'grid-template-columns': '35% 65%',
                        }}
                    >
                        {subjectSelection}
                        <div className="divformstyle">
                            <div>
                                <fieldset style={{"padding": "0", }}>
                                    <legend>Đăng ký môn học: </legend>
                                    <select onChange={this.onChangeChuongTrinhHoc.bind(this)} ref="chuongtrinhhoc">
                                        <option value=''>
                                            {'--- Chọn Chương Trình Học Theo Nhu Cầu ---'}
                                        </option>
                                        {
                                            this.state.chuongtrinhhocbosung.map((v, i) =>{
                                                return (
                                                    <option key={i} value={v['ID']}>
                                                        {v['Tên Chương Trình']}
                                                    </option>
                                                );
                                            })
                                        }
                                    </select>
                                    <div style={{
                                        "height": "483px",
                                        "overflow-y": "auto",
                                        padding: "0px",}}>
                                        {this.state.danhsachmonhoc.map((e, i) => {
                                            let monhocstyle = {};
                                            let soluongmonhoc = 'none';
                                            let isChecked = false;                                            
                                            if (e.checked == true
                                            || e.forceSubject == true) {
                                                monhocstyle = {
                                                    'background': colorchoose,
                                                };
                                                soluongmonhoc = 'block';
                                                isChecked = true;
                                                if (e.forceSubject == true) {                                                    
                                                    monhocstyle = {
                                                        'background': colorchoose_force,
                                                    };
                                                }
                                            }
                                            return (
                                                <div style={monhocstyle}>                
                                                    <input 
                                                        type="checkbox" 
                                                        value={e['Mã Môn Học']} 
                                                        checked={isChecked} 
                                                        onChange={this.monhocchange.bind(this, e['Mã Môn Học'])}
                                                        style={{'width':'auto'}}
                                                    />
                                                    <span>{e['Mã Môn Học'] + ' - ' + e['Tên Môn']}</span>
                                                    <input
                                                        type="number"
                                                        value={e.classNumber}
                                                        onChange={(element) => {
                                                            let danhsachmonhoc = this.state.danhsachmonhoc;
                                                            danhsachmonhoc.map((v1, i1) => {
                                                                if (e.forceSubject == true) {
                                                                    if (v1.forceSubject == true) {
                                                                        v1.classNumber = element.target.value;
                                                                        if (v1.classNumber < 1) {
                                                                            v1.classNumber = 1;
                                                                        }
                                                                    }
                                                                } else {
                                                                    if (i1 == i) {
                                                                        v1.classNumber = element.target.value;
                                                                        if (v1.classNumber < 1) {
                                                                            v1.classNumber = 1;
                                                                        }
                                                                    }
                                                                }
                                                            })
                                                            this.setState({
                                                                danhsachmonhoc: danhsachmonhoc,
                                                            })
                                                        }}
                                                        style={{
                                                            'border': 'transparent',
                                                            'background': 'transparent',
                                                            'border-bottom': '1px dashed #888',
                                                            'border-radius': 'unset',
                                                            'display': soluongmonhoc,
                                                        }}
                                                    />
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <div style={{
                                        'padding': '5px 0px',
                                        'display': 'grid',
                                        'grid-template-columns': '15% 30% 10% 30% 15%',
                                    }}>
                                        <div></div>
                                        <input 
                                            type="submit"
                                            name="Thêm"
                                            value="Thêm"
                                            onClick={this.onAddSubject.bind(this)}
                                            className={mystyle.button}
                                        />
                                        <div></div>
                                        <input 
                                            type="submit" 
                                            name="Hủy Tất Cả" 
                                            value="Hủy Tất Cả" 
                                            onClick={() => {
                                                this.setState({
                                                    monhocdadangky: [],
                                                });
                                            }}
                                            className={mystyle.button}
                                        />
                                        <div></div>
                                    </div>
                                </fieldset>
                            </div>
                        </div>
                        <div className="divformstyle">
                            <div> 
                                <Calendar 
                                    getMe={(me) => {this.calendar = me}}
                                    action='view'
                                    // calendarClick={this.calendarClick.bind(this)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="footer">
                        <Button 
                            onClick={this.close.bind(this)}
                            value="Thoát"
                            icon="close"
                            style={{'float': 'right', 'margin-right': '10px',}}
                            disabled={this.state.btnAllDisable | this.state.btnCloseDisable}
                        />
                        <Button 
                            onClick={this.dongy.bind(this)}
                            value={btnaccept_title}
                            icon="agree"
                            style={{'float': 'right', 'margin-right': '10px',}}
                            disabled={this.state.btnAllDisable | this.state.btnAgreeDisable}
                        />
                    </div>
                </div>
            </div>
        );
    }

    monhocchange (mamonhoc) {
        let danhsachmonhoc = this.state.danhsachmonhoc;
        danhsachmonhoc.map((v, i) => {
            if (v['Mã Môn Học'] == mamonhoc) {
                if (v.checked == true) {
                    v.checked = false;
                } else {
                    v.checked = true;
                }
            }
        });
        this.setState({
            danhsachmonhoc: danhsachmonhoc,
        });
    }

    onChangeChuongTrinhHoc (e) {
        let danhsachmonhoc = [];
        if (e.target.value != '') {
            this.state.chuongtrinhhocbosung.map((v, i) => {
                if (v['ID'] == e.target.value) {
                    let chuongtrinhhoc = JSON.parse(v['Chương Trình Học']);
                    for (let mon of this.state.listMonHoc) {
                        for (let i in chuongtrinhhoc) {
                            if (chuongtrinhhoc.hasOwnProperty(i)) {
                                if (chuongtrinhhoc[i].mamon == mon['Mã Môn Học']) {
                                    let addMon = {...mon};
                                    addMon['Bảng Giá'] = chuongtrinhhoc[i].gia;
                                    addMon.forceSubject = chuongtrinhhoc[i].forceSubject;
                                    addMon.forceClassCode = v.forceClassCode;
                                    addMon.idChuongtrinhhoc = v['ID'];
                                    addMon.tenchuongtrinhhoc = v['Tên Chương Trình'];
                                    danhsachmonhoc.push(addMon);
                                    break;
                                }
                            }
                        }
                    }
                }
            })
        } else {
            this.state.listMonHoc.map((v, i) => {
                danhsachmonhoc.push({...v});
            });
        }

        this.setState({
            danhsachmonhoc: danhsachmonhoc,
        });
    }

    onAddSubject () {
        let monhocdadangky = this.state.monhocdadangky;
        this.state.danhsachmonhoc.map((v, i) => {
            if (v.checked == true 
            || v.forceSubject == true) {
                let daduocdangky = null;
                monhocdadangky.map((v1, i1) => {
                    if (v1['Mã Môn Học'] == v['Mã Môn Học']
                    && v1.idChuongtrinhhoc == v.idChuongtrinhhoc) {
                        daduocdangky = v1;
                    }
                });
                if (daduocdangky == null) {
                    let monhoc = {...v};
                    monhocdadangky.push(monhoc);
                    
                } else {
                    let dadangky = daduocdangky['Mã Môn Học'] + ' - ' + daduocdangky['Tên Môn'];
                    if (daduocdangky.idChuongtrinhhoc != null) {
                        dadangky += ' (' + daduocdangky.tenchuongtrinhhoc + ')';
                    }
                    this.props.dispatch({
                        type: 'ALERT_NOTIFICATION_ADD',
                        content: dadangky + ' đã được đăng ký!',
                        notifyType: 'warning',
                    })
                }
            }
        })

        this.setState({
            monhocdadangky: monhocdadangky,
        })
    }

    onSubjectClick (value) {
        let query = '';
        query += 'SELECT * FROM LOPHOC_VIEW WHERE (LOPHOC_VIEW.`Mã Môn Học` = \'!\?!\') AND CONVERT_TZ(CURDATE(), @@session.time_zone,\'+07:00\') <= LOPHOC_VIEW.`Ngày Kết Thúc` AND `branch` = \'!\?!\' AND LOPHOC_VIEW.`Lớp` = \'!\?!\'; ';
        if (value.forceClassCode != null) {
            query = query.replace('\'!\?!\'', '\'' + value.forceClassCode + '\'' + ' OR LOPHOC_VIEW.`Mã Môn Học` = \'' + value['Mã Môn Học'] + '\'');
        } else {
            query = query.replace('!\?!', value['Mã Môn Học']);
        }
        query = query.replace('!\?!', $('.khuvuc').attr('value'));
        query = query.replace('!\?!', this.props.data['Lớp']);
        this.setState({
            clickedValue: value,
        })
        this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
            fn: 'form_hocsinh_dangkymonhoc_loadClass',
            clickedValue: value,
        });    
    }

    onClickLopHoc (v) {
        let query = 'SELECT LOPHOC.*, LICHHOC.`Thứ`, LICHHOC.`Giờ Bắt Đầu`, LICHHOC.`Giờ Kết Thúc` FROM LOPHOC ' +
        'LEFT JOIN LICHHOC ON LICHHOC.`Mã Lớp` = LOPHOC.`Mã Lớp` ' +
        'WHERE LOPHOC.`Mã Lớp` = \'!\?!\'; ';
        query = query.replace('!\?!', v['Mã Lớp']);
        this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
            fn : 'form_hocsinh_dangkymonhoc_loadClassInfor',
        });

        let registrasionDate = null;
        if (this.state.clickedValue != null
            && this.state.clickedValue.forceClassRegistrasion != null) {
            registrasionDate = this.state.clickedValue.forceClassRegistrasion
        }

        this.setState({
            classInformation: v,
            registrasionDate: registrasionDate,
        })
    }
}

module.exports = connect(function (state) {
    return {
      socket: state.socket,
    };
}) (DangKyMonHoc);
