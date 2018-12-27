import React from 'react';
import { connect } from 'react-redux';
import style from '../../style.css';
var ReactDOM = require('react-dom');
import Calendar from '../../calendar/Calendar';
import Button from '../../elements/Button';
import Popup from './Popupsualichday';
class SuaLichDay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: '',
            giaovien: '',
            magiaovien: '',
            ngaybatdau: null,
            ngayketthuc: null,
            count: 0,
            lichhoc: [],
            hocsinh: [],
            hocsinhtrongngay: [],
            showpopup:false,
            fnresetRow:null,
            arrayChangedSchedule:[],
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
                    case 'information_monhoc_lop':
                        let title = null;
                        let ngayketthuc = new Date(rows[0]['Ngày Kết Thúc']);
                        let ngaybatdau = new Date(rows[0]['Ngày Bắt Đầu']);
                        for(let i = 0;i<rows.length;i++)
                        {
                            if(ngaybatdau> new Date(rows[i]['Ngày Bắt Đầu']))
                                ngaybatdau = rows[i]['Ngày Bắt Đầu'];
                            if(ngayketthuc <  new Date(rows[i]['Ngày Kết Thúc']))
                                ngayketthuc = rows[i]['Ngày Kết Thúc']
                        }
                        let now = new Date();
                        let ngayhientai = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1);
                        
                        
                        this.calendar.localCalendar(ngayhientai, ngayketthuc, rows);
                        let count = (new Date(ngayketthuc) - new Date(ngayhientai))/86400000;
                        this.refs.back.hidden = true;
                        this.setState({
                            title: title,
                            giaovien: rows[0]['Họ Và Tên'],
                            magiaovien: rows[0]['Mã Giáo Viên'],
                            lichhoc: rows,
                            ngaybatdau: ngayhientai,
                            ngayketthuc: ngayketthuc,
                            count: count,
                        })
                        
                    case 'sualichday_updatelichday':
                        break;
                    case 'information_lichthaydoi':
                        
                        
                        let array =[];
                        for(let v of rows)
                        {
                            let offset= -6;
                            let giobatdauchuyentoi = (parseInt(v['Giờ Bắt Đầu Chuyển Tới'].split(':')[0]) + offset) * 2;
                            if (v['Giờ Bắt Đầu Chuyển Tới'].split(':')[1] >= 30) {
                            giobatdauchuyentoi++;
                            }
                            let giobatdautruocdo = (parseInt(v['Giờ Bắt Đầu Trước Đó'].split(':')[0]) + offset) * 2;
                            if (v['Giờ Bắt Đầu Trước Đó'].split(':')[1] >= 30) {
                            giobatdautruocdo++;
                            }
                            console.log(new Date(v['Ngày Chuyển Tới']).toLocaleDateString('zh-Hans-CN').replace(/\//g,'-'))
                            let lichthaydoi = {
                                malop:v['Mã Lớp'],
                                ngaychuyentoi:new Date(v['Ngày Chuyển Tới']).toLocaleDateString('zh-Hans-CN').replace(/\//g,'-'),
                                giobatdauchuyentoi:giobatdauchuyentoi,
                                ngaytruocdo:new Date(v['Ngày Trước Đó']).toLocaleDateString('zh-Hans-CN').replace(/\//g,'-'),
                                giobatdautruocdo:giobatdautruocdo,
                                thoiluongday:v['Thời Lượng Dạy'],
                                }
                            array.push(lichthaydoi)
                        }
                        
                        this.setState({arrayChangedSchedule:array})
                        this.resetCalendar();
                        break;
                    case 'information_monhoc_hocsinh':
                        this.setState({hocsinh: rows, hocsinhtrongngay: rows});
                        break;
                    default:
                        
                }
                
            }
        }  
    }

    componentDidMount () {
        let query;
        window.addEventListener("resize", this.changeSize);
        this.changeSize();
    
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);

        query = 'SELECT LOPHOC.`Mã Lớp`, ' +
        'LICHHOC.`Mã Phòng Học`, ' +
        'LICHHOC.`Thời Gian Sử Dụng Phòng`, ' +
        'LICHHOC.`Thứ`, ' +
        'LICHHOC.`Giờ Bắt Đầu`, ' +
        'LICHHOC.`Giờ Kết Thúc`, ' +
        'LOPHOC.`Mã Môn Học`, ' +
        'DANHSACHMONHOC.`name`, ' +
        'LOPHOC.`Mã Giáo Viên`, ' +
        'GIAOVIEN.`Họ Và Tên`, ' +
        'LOPHOC.`Ngày Bắt Đầu`, ' +
        'LOPHOC.`Ngày Kết Thúc`, ' +
        'LOPHOC.`Lớp` ' +
        'FROM (((quanlyhocsinh.LOPHOC ' +
        'LEFT JOIN quanlyhocsinh.DANHSACHMONHOC ON DANHSACHMONHOC.`mamon` = LOPHOC.`Mã Môn Học`) ' + 
        'LEFT JOIN quanlyhocsinh.GIAOVIEN ON GIAOVIEN.`Mã Giáo Viên` = LOPHOC.`Mã Giáo Viên`) ' +
        'LEFT JOIN quanlyhocsinh.LICHHOC ON LICHHOC.`Mã Lớp` = LOPHOC.`Mã Lớp`) ' +
        'WHERE LOPHOC.`Mã Giáo Viên` = \'!\?!\'' +
        'AND CONVERT_TZ(CURDATE(), @@session.time_zone,\'+07:00\') <= LOPHOC.`Ngày Kết Thúc`';

        query = query.replace('!\?!', this.props.teacherid);
        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'information_monhoc_lop',
        });

        query = 'SELECT DANHSACHHOCSINHTRONGLOP.*, USERS.`Họ Và Tên` ' +
        'FROM DANHSACHHOCSINHTRONGLOP ' +
        'LEFT JOIN USERS ON DANHSACHHOCSINHTRONGLOP.`User ID` = USERS.`User ID` ' +
        'WHERE DANHSACHHOCSINHTRONGLOP.`Mã Lớp` = \'~\' ' +
        'OR DANHSACHHOCSINHTRONGLOP.`Thời Gian Chuyển` LIKE \'%"malopchuyen":"~"%\'';        
        query = query.replace(/~/g, this.props.classid);
        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'information_monhoc_hocsinh',
        });

        query ='SELECT * FROM LICHHOCTHAYDOI '+
                'WHERE `Mã Giáo Viên` = \'~\''
        query = query.replace('~', this.props.teacherid);
        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'information_lichthaydoi',
        });
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.changeSize);
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentDidUpdate(prevProps, prevState) {
        this.changeSize();
    }
    checkDuplicate(mode,malop,ngaytruocdo,giobatdautruocdo,ngaychuyentoi,giobatdauchuyentoi,thoiluongday)
    {
        if(mode =="nhieutuan")
        {
            let thulichhoc = ngaychuyentoi.getDay()
            for (let v of this.state.arrayChangedSchedule)
            {
                //Xem ngày được chuyển ở các tuần khác đã bị chuyển chưa
                console.log("a");
                
                if  (new Date(v.ngaytruocdo.slice(0,10)).getDate() == ngaytruocdo.getDate()&&
                    new Date(v.ngaytruocdo.slice(0,10)).getMonth() == ngaytruocdo.getMonth()&&
                    new Date(v.ngaytruocdo.slice(0,10)).getFullYear() == ngaytruocdo.getFullYear()&&
                    v.giobatdautruocdo == giobatdautruocdo&&
                    v.malop == malop)
                    return false;
                //
                console.log("b");
                if  (new Date(v.ngaytruocdo.slice(0,10)).getDate() == ngaychuyentoi.getDate()&&
                    new Date(v.ngaytruocdo.slice(0,10)).getMonth() == ngaychuyentoi.getMonth()&&
                    new Date(v.ngaytruocdo.slice(0,10)).getFullYear() == ngaychuyentoi.getFullYear()&&
                    v.giobatdautruocdo == giobatdauchuyentoi
                    )
                    return false;
                    
                //Nếu ngày chuyển tới trùng với các ngày lịch thay đổi
                if  (new Date(v.ngaychuyentoi.slice(0,10)).getDate() == ngaychuyentoi.getDate()&&
                    new Date(v.ngaychuyentoi.slice(0,10)).getMonth() == ngaychuyentoi.getMonth()&&
                    new Date(v.ngaychuyentoi.slice(0,10)).getFullYear() == ngaychuyentoi.getFullYear())
                {
                    let gioketthucchuyentoi = parseInt(giobatdauchuyentoi)+parseInt(thoiluongday);
                    let vgioketthucchuyentoi = parseInt(v.giobatdauchuyentoi)+ parseInt(v.thoiluongday)
                    console.log("c");
                    if (v.malop == malop&&giobatdauchuyentoi<=v.giobatdauchuyentoi&&gioketthucchuyentoi-1>=v.giobatdauchuyentoi)
                        continue;
                    console.log("1")
                    //Xem có bị trùng giờ không
                    if(v.giobatdauchuyentoi<=giobatdauchuyentoi&&vgioketthucchuyentoi-1>=giobatdauchuyentoi) 
                    {
                        console.log("1")
                        
                        return false;
                    }
                    console.log("2")
                    if(giobatdauchuyentoi<=v.giobatdauchuyentoi&&gioketthucchuyentoi-1>=v.giobatdauchuyentoi)
                    {
                        console.log("2")
                        return false;
                    } 
                }
            }
            thulichhoc = thulichhoc+1
            for(let val of this.state.lichhoc)
            {   
                ngaychuyentoi.setHours(0);
                //Nếu quá ngày bắt đầu hoặc kết thúc 
                if((new Date(val['Ngày Bắt Đầu'])>ngaychuyentoi||new Date(val['Ngày Kết Thúc'])<ngaychuyentoi)&&val['Mã Lớp']==malop)
                {
                    return false;
                }
                //Trùng thứ
                if (val['Thứ'] == thulichhoc)
                {
                    
                    //Nếu quá ngày bắt đầu hoặc kết thúc khác mã lớp
                    if(new Date(val['Ngày Bắt Đầu'])>ngaychuyentoi||new Date(val['Ngày Kết Thúc'])<ngaychuyentoi)
                        continue;
                    
                    var offset = -6;
                    let startrow = (parseInt(val['Giờ Bắt Đầu'].split(':')[0]) + offset) * 2;
                    if (val['Giờ Bắt Đầu'].split(':')[1] >= 30) {
                    startrow++;
                    }
                    let endrow = (parseInt(val['Giờ Kết Thúc'].split(':')[0]) + offset) * 2;
                    if (val['Giờ Kết Thúc'].split(':')[1] >= 30) {
                    endrow++;
                    }
                    let isSkip = false;
                    ngaychuyentoi.setHours(7);
                    for(let v of this.state.arrayChangedSchedule)
                    {
                        console.log(new Date(v.ngaytruocdo.slice(0,10)) == ngaychuyentoi);
                        console.log(new Date(v.ngaytruocdo.slice(0,10)));
                        console.log(ngaychuyentoi);
                        
                        
                        
                        if(v.malop == val['Mã Lớp']&&
                            startrow == v.giobatdautruocdo&&
                            new Date(v.ngaytruocdo.slice(0,10)).getDate() == ngaychuyentoi.getDate()&&
                            new Date(v.ngaytruocdo.slice(0,10)).getMonth() == ngaychuyentoi.getMonth()&&
                            new Date(v.ngaytruocdo.slice(0,10)).getFullYear() == ngaychuyentoi.getFullYear())
                            {
                                console.log("aaaaaaaaaaaaa");
                                
                                isSkip = true;
                                break;
                            }
                    }
                    if(isSkip)
                        continue;

                    if(this.calendar.state.isSwitchwClass)
                    {
                        if(val['Mã Lớp']==this.calendar.state._value.split('!')[0]&&
                            startrow==giobatdauchuyentoi&&
                            endrow-startrow==this.calendar.state._value.split('!')[1])
                            continue;
                        
                    }
                    //Nếu chỉnh lịch trên lịch trước đó
                    if (ngaytruocdo.getDay()+1 == val['Thứ']&&
                        giobatdautruocdo == startrow &&
                        thoiluongday == endrow-startrow&&
                        malop == val['Mã Lớp'])
                    {
                        return true;
                    }
                    
                    let gioketthucchuyentoi = parseInt(giobatdauchuyentoi)+parseInt(thoiluongday);
                    //Xem 
                    if(this.calendar.state.isSwitchwClass) 
                    {
                        let isSwitched = false;
                        for(let v of this.state.arrayChangedSchedule)
                        {
                            if (val['Thứ'] == new Date(v.ngaytruocdo).getDay()+1&&
                                startrow==v.giobatdautruocdo)
                            {
                                isSwitched = true;
                                break;
                            }
                        }
                        if(isSwitched)
                            continue;
                    }
                     //Xem các lịch có trùng nhau không   
                    console.log("3")
                    if(startrow<=giobatdauchuyentoi&&(endrow-1)>=giobatdauchuyentoi)
                    {
                        console.log("3")
                        return false;
                    }
                    console.log("4")
                    if(giobatdauchuyentoi<=startrow&&gioketthucchuyentoi-1>=startrow)
                    {
                        console.log("4")
                        return false;
                    }       
                }   
            }
            return true;
        }
        else
        {    
            if(this.calendar.state.isSwitchwClass&&mode == "mottuan")
            {
                for(let val of this.state.lichhoc)
                {   
                    ngaychuyentoi.setHours(0);
                    ngaytruocdo.setHours(0);
                    if(((new Date(val['Ngày Bắt Đầu'])>ngaychuyentoi||new Date(val['Ngày Kết Thúc'])<ngaychuyentoi)&&
                        val['Mã Lớp']==malop)||(val['Mã Lớp']==this.calendar.state._value.split("!")[0]&&
                        (new Date(val['Ngày Bắt Đầu'])>ngaytruocdo||new Date(val['Ngày Kết Thúc'])<ngaytruocdo)))
                    {
                        console.log(val,"val ngay");
                        return false;
                    }               
                }
                return true;
            }     
            
            let thulichhoc = ngaychuyentoi.getDay()
            for (let v of this.state.arrayChangedSchedule)
            {
                
                // if  (new Date(v.ngaytruocdo.slice(0,10)).getDate() == ngaytruocdo.getDate()&&
                //     new Date(v.ngaytruocdo.slice(0,10)).getMonth() == ngaytruocdo.getMonth()&&
                //     new Date(v.ngaytruocdo.slice(0,10)).getFullYear() == ngaytruocdo.getFullYear()&&
                //     v.giobatdautruocdo == giobatdautruocdo&&
                //     v.malop == malop)
                //     return false;
                
                // if  (new Date(v.ngaytruocdo.slice(0,10)).getDate() == ngaychuyentoi.getDate()&&
                //     new Date(v.ngaytruocdo.slice(0,10)).getMonth() == ngaychuyentoi.getMonth()&&
                //     new Date(v.ngaytruocdo.slice(0,10)).getFullYear() == ngaychuyentoi.getFullYear()&&
                //     v.giobatdautruocdo == giobatdauchuyentoi
                //     )
                //     return false;

                if  (new Date(v.ngaychuyentoi.slice(0,10)).getDate() == ngaychuyentoi.getDate()&&
                    new Date(v.ngaychuyentoi.slice(0,10)).getMonth() == ngaychuyentoi.getMonth()&&
                    new Date(v.ngaychuyentoi.slice(0,10)).getFullYear() == ngaychuyentoi.getFullYear())
                {
                    let gioketthucchuyentoi = parseInt(giobatdauchuyentoi)+parseInt(thoiluongday);
                    let vgioketthucchuyentoi = parseInt(v.giobatdauchuyentoi)+ parseInt(v.thoiluongday)
                    if (v.malop == malop&&giobatdauchuyentoi<=v.giobatdauchuyentoi&&gioketthucchuyentoi-1>=v.giobatdauchuyentoi)
                        continue;
                    if(v.giobatdauchuyentoi<=giobatdauchuyentoi&&vgioketthucchuyentoi-1>=giobatdauchuyentoi) 
                    {
                        return false;
                    }
                    if(giobatdauchuyentoi<=v.giobatdauchuyentoi&&gioketthucchuyentoi-1>=v.giobatdauchuyentoi)
                    {
                        return false;
                    } 
                }
            }
            
            thulichhoc = thulichhoc+1
            for(let val of this.state.lichhoc)
            {   
                ngaychuyentoi.setHours(0);
                if((new Date(val['Ngày Bắt Đầu'])>ngaychuyentoi||new Date(val['Ngày Kết Thúc'])<ngaychuyentoi)&&val['Mã Lớp']==malop)
                {
                    console.log(val);
                    return false;
                }
                    
                if (val['Thứ'] == thulichhoc)
                {
                    
                    
                    if(new Date(val['Ngày Bắt Đầu'])>ngaychuyentoi||new Date(val['Ngày Kết Thúc'])<ngaychuyentoi)
                        continue;
                    
                    var offset = -6;
                    let startrow = (parseInt(val['Giờ Bắt Đầu'].split(':')[0]) + offset) * 2;
                    if (val['Giờ Bắt Đầu'].split(':')[1] >= 30) {
                    startrow++;
                    }
                    let endrow = (parseInt(val['Giờ Kết Thúc'].split(':')[0]) + offset) * 2;
                    if (val['Giờ Kết Thúc'].split(':')[1] >= 30) {
                    endrow++;
                    }
                    if(mode == "nhieutuan"&&this.calendar.state.isSwitchwClass)
                    {
                        console.log("cactuan skip")
                        console.log(val['Mã Lớp'])
                        console.log(this.calendar.state._value.split('!')[0])
                        if(val['Mã Lớp']==this.calendar.state._value.split('!')[0]&&
                            startrow==giobatdauchuyentoi&&
                            endrow-startrow==this.calendar.state._value.split('!')[1])
                            continue;
                        
                    }
                    if (ngaytruocdo.getDay()+1 == val['Thứ']&&
                        giobatdautruocdo == startrow &&
                        thoiluongday == endrow-startrow&&
                        malop == val['Mã Lớp'])
                    {
                        return true;
                    }
                    let isSwitched = false;
                    console.log(giobatdauchuyentoi)
                    let gioketthucchuyentoi = parseInt(giobatdauchuyentoi)+parseInt(thoiluongday);
                    for(let v of this.state.arrayChangedSchedule)
                    {
                        if (val['Thứ'] == new Date(v.ngaytruocdo).getDay()+1&&
                            startrow==v.giobatdautruocdo)
                        {
                            isSwitched = true;
                            break;
                        }
                    }
                    if(isSwitched)
                        continue;
                    
                    console.log("3")
                    console.log(startrow<=giobatdauchuyentoi)
                    console.log(endrow-1>=giobatdauchuyentoi)
                    console.log(startrow)
                    console.log(giobatdauchuyentoi)
                    console.log(endrow)
                    if(startrow<=giobatdauchuyentoi&&(endrow-1)>=giobatdauchuyentoi)
                    {
                        console.log("3")
                        console.log(startrow<=giobatdauchuyentoi)
                        console.log(endrow>=giobatdauchuyentoi)
                        console.log(startrow)
                        console.log(giobatdauchuyentoi)
                        console.log(endrow)
                        return false;
                    }
                    console.log(giobatdauchuyentoi)
                    console.log("4")
                    console.log(giobatdauchuyentoi<=startrow)
                    console.log(gioketthucchuyentoi-1>=startrow)
                    console.log(giobatdauchuyentoi)
                    console.log(startrow)
                    console.log(gioketthucchuyentoi)
                    if(giobatdauchuyentoi<=startrow&&gioketthucchuyentoi-1>=startrow)
                    {
                        console.log("4")
                        console.log(giobatdauchuyentoi<=startrow)
                        console.log(gioketthucchuyentoi>=startrow)
                        console.log(giobatdauchuyentoi)
                        console.log(startrow)
                        console.log(gioketthucchuyentoi)
                        return false;
                    }       
                }   
            }
            return true;
        }
    }
    resetCalendar()
    {
        let ngaybatdau = new Date(this.state.ngaybatdau);
        let ngayketthuc = new Date(this.state.ngayketthuc);
        this.calendar.localCalendar(ngaybatdau.toISOString(), ngayketthuc.toISOString(), this.state.lichhoc)
    }
    
    nextCalendar () {
        let ngaybatdau = new Date(this.state.ngaybatdau);
        let ngayketthuc = new Date(this.state.ngayketthuc);
        let nextSunday = 7 - ngaybatdau.getDay();
        this.refs.back.hidden = false;
        ngaybatdau.setDate(ngaybatdau.getDate() + nextSunday);
        
        if ((ngayketthuc - ngaybatdau)/86400000 <= 7) {
            this.refs.next.hidden = true;
        }
        
        this.calendar.localCalendar(ngaybatdau.toISOString(), ngayketthuc.toISOString(), this.state.lichhoc)

        this.setState({
            ngaybatdau: ngaybatdau.toISOString(),
        })
    }

    backCalendar () {
        let ngaybatdau = new Date(this.state.ngaybatdau);
        let ngayketthuc = new Date(this.state.ngayketthuc);
        let count = this.state.count;
        this.refs.next.hidden = false;

        let sub = count - ((ngayketthuc - ngaybatdau)/86400000);
        if (sub > 7) {
            ngaybatdau.setDate(ngaybatdau.getDate() - 7);
        } else {
            ngaybatdau.setDate(ngaybatdau.getDate() - sub);
            this.refs.back.hidden = true;
        }

        this.calendar.localCalendar(ngaybatdau.toISOString(), ngayketthuc.toISOString(), this.state.lichhoc);
        this.setState({
            ngaybatdau: ngaybatdau.toISOString(),
        })
    }
    
    calendarClick (thutrongtuan, giobatdau) {
        let curr = new Date(this.state.ngaybatdau); // get current date
        let first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
        let last = first + 6; // last day is the first day + 6
        let firstday = new Date(curr.setDate(first));
        firstday.setDate(firstday.getDate() + (thutrongtuan - 1));

        let hocsinh = this.state.hocsinh;
        let newlisthocsinh = [];
        for (let val of hocsinh) {
            let malop = val['Mã Lớp'];
            if (malop == this.props.classid) {
                if (newlisthocsinh.indexOf(val) == -1) {
                    newlisthocsinh.push(val);
                }
            } else {
                try {
                    let thoigianchuyen = JSON.parse(val['Thời Gian Chuyển']);
                    for (let _chuyenlop of thoigianchuyen) {
                        if (_chuyenlop.malopchuyen == this.props.classid) {
                            if (_chuyenlop.repeat) {
                                if (_chuyenlop.thuchuyentoi == thutrongtuan) {
                                    for (let val2 of this.state.lichhoc) {
                                        if (val2['Thứ'] == _chuyenlop.thuchuyentoi) {
                                            if (giobatdau >= val2['Giờ Bắt Đầu']
                                            && giobatdau <= val2['Giờ Kết Thúc']
                                            && _chuyenlop.giochuyentoi == val2['Giờ Bắt Đầu']) {        
                                                if (newlisthocsinh.indexOf(val) == -1) {
                                                    newlisthocsinh.push(val);
                                                }
                                            }
                                        }
                                    }
                                }
                            } else {
                                
                            }
                        }
                    }
                } catch (e) {
                    
                }
            }
        }
        this.setState({hocsinhtrongngay: newlisthocsinh});
    }

    removeLichChuyen(i)
    {
        let array = this.state.arrayChangedSchedule;
        let something = false;
        for(let j = 0; j<array.length;j++)
        {
            if(i==j) continue;
            
            
            
            if (array[i].ngaytruocdo==array[j].ngaychuyentoi&&
                array[i].ngaychuyentoi == array[j].ngaytruocdo&&
                array[i].giobatdauchuyentoi == array[j].giobatdautruocdo&&
                array[i].giobatdautruocdo == array[j].giobatdauchuyentoi)
            {
                array.splice(j,1);
                if(j<i)
                    array.splice(i-1,1);
                else
                array.splice(i,1);
                something = true
                break;
            }
            
            if ((array[i].ngaytruocdo==array[j].ngaychuyentoi||
                array[i].ngaychuyentoi == array[j].ngaytruocdo)&&
                (array[i].giobatdauchuyentoi == array[j].giobatdautruocdo||
                array[i].giobatdautruocdo == array[j].giobatdauchuyentoi))
            {
                /* if (array[i].ngaychuyentoi == array[j].ngaytruocdo&&
                    array[i].giobatdauchuyentoi == array[j].giobatdautruocdo)
                {
                    array[i].ngaychuyentoi = array[j].ngaychuyentoi
                    array[i].giobatdauchuyentoi=array[j].giobatdauchuyentoi
                    array.splice(j,1);
                }
                else
                {
                    array[j].ngaychuyentoi = array[i].ngaychuyentoi
                    array[j].giobatdauchuyentoi=array[i].giobatdauchuyentoi                   
                    array.splice(i,1);
                } */
                let temp = array[j].ngaychuyentoi;
                array[j].ngaychuyentoi = array[i].ngaychuyentoi;
                array[i].ngaychuyentoi = temp;

                temp = array[j].giobatdauchuyentoi;
                array[j].giobatdauchuyentoi=array[i].giobatdauchuyentoi;
                array[i].giobatdauchuyentoi = temp;
                if (array[i].giobatdautruocdo == array[i].giobatdauchuyentoi&&
                    array[i].ngaytruocdo      == array[i].ngaychuyentoi)
                    array.splice(i,1);

                if (array[j].giobatdautruocdo == array[j].giobatdauchuyentoi&&
                    array[j].ngaytruocdo      == array[j].ngaychuyentoi)
                    array.splice(j,1);
                something = true;
                break;
            }
        }
        if(!something)
            array.splice(i,1);


        this.setState({arrayChangedSchedule:array});
        this.resetCalendar()
    }
    deleteShadow(e)
    { 
        if(e.nativeEvent.target.dataset.v==null||
            e.nativeEvent.target.dataset.v=="")
            this.calendar.onMouseOff()
    }
    popupon()
    {
        this.setState({showpopup: true});
    }
    popupoff()
    {      
        this.setState({showpopup: false});
    }
    dongy () {
        
        let query = "DELETE FROM `LICHHOCTHAYDOI` "+
                    "WHERE `Mã Giáo Viên` = \'?\'"
        query = query.replace('?', this.props.teacherid);
        this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {           
        });
        if(this.state.arrayChangedSchedule.length==0)
            return;
        query ="INSERT INTO `LICHHOCTHAYDOI` (`Mã Giáo Viên`,`Mã Lớp`,`Mã Phòng Học`,`Ngày Trước Đó`,`Giờ Bắt Đầu Trước Đó`,`Ngày Chuyển Tới`,`Giờ Bắt Đầu Chuyển Tới`,`Thời Lượng Dạy`)"+
        "VALUES ~";
        for(let v of this.state.arrayChangedSchedule)
        {
            if(query[query.length-2] ==")")
                query = query.replace('~',',~');
            query = query.replace('~','(~');

            query = query.replace('~', '(SELECT `Mã Giáo Viên` FROM `GIAOVIEN` WHERE `Mã Giáo Viên` =\'?\'), ~');
            query = query.replace('?', this.props.teacherid);
                        
            query = query.replace('~', '(SELECT `Mã Lớp` FROM `LOPHOC` WHERE `Mã Lớp` =\'?\'), ~');
            query = query.replace('?', v.malop);
            query = query.replace('~', '(SELECT `Mã Phòng Học` FROM `PHONGHOC` WHERE `Mã Phòng Học` =\'?\'), ~');
            query = query.replace('?', v.malop.slice(0,3)+"P001");
            
            query = query.replace('~','\'?\', ~');
            query = query.replace('?', v.ngaytruocdo.slice(0,10));
            
            query = query.replace('~','\'?\', ~');
            let gio = parseInt(parseInt(v.giobatdautruocdo)/2) +6;
            let phut= parseInt(v.giobatdautruocdo)%2?"30":"00"
            let giotruocdo = ("0"+gio).slice(-2)+":"+phut
            query = query.replace('?', giotruocdo);

            query = query.replace('~','\'?\', ~');
            query = query.replace('?', v.ngaychuyentoi.slice(0,10));
            
            query = query.replace('~','\'?\', ~');
            let gio2 = parseInt(parseInt(v.giobatdauchuyentoi)/2) +6;
            let phut2= parseInt(v.giobatdauchuyentoi)%2?"30":"00"
            let giochuyentoi = ("0"+gio2).slice(-2)+":"+phut2
            query = query.replace('?', giochuyentoi);
            
            query = query.replace('~','\'?\')~');
            query = query.replace('?', v.thoiluongday);
            
        }
        query = query.replace('~','');

        console.log(query)
        this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', { 
            fn: 'sualichday_updatelichday',
            
        });
      /*   let query ="UPDATE `LICHHOCTHAYDOI`"+
                    "SET `Ngày Chuyển Tới` =\'?\',"+
                    "`Giờ Bắt Đầu Chuyển Tới` =\'?\'"+
                    "WHERE (`Mã Lớp` = \'?\' and"+
                    "`Ngày Trước Đó` = \'?\' and"+
                    "`Giờ Bắt Đầu Trước Đó =\'?\')"
        for(let v of this.state.arrayChangedSchedule)
        {

        } */
        
    }
    
    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    }

    render () {
        let curr = new Date(this.state.ngaybatdau); // get current date
        let first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
        let last = first + 6; // last day is the first day + 6
        let firstday = new Date(curr.setDate(first));
        firstday = ("0" + firstday.getDate()).slice(-2) + '/' + ("0" + (firstday.getMonth() + 1)).slice(-2) + '/' + firstday.getFullYear();
        let lastday = new Date(curr.setDate(last));
        lastday = ("0" + lastday.getDate()).slice(-2) + '/' + ("0" + (lastday.getMonth() + 1)).slice(-2) + '/' + lastday.getFullYear();
        let rangedate = 'Từ ';
        rangedate += firstday + ' đến ' + lastday;
        let arrayLichChuyen = this.state.arrayChangedSchedule;
        return (
            <div  onMouseMove={this.deleteShadow.bind(this)} className={style.formstyle} ref="background">
                <div className="form_body" ref="body" style={{'width': '1100px'}}>
                    <div className="header">
                        <h2>Thông Tin Lớp Học</h2>
                    </div>
                    <div className="body">
                        <div className="divformstyle">
                        <div>
                            <h2 style={{'margin': '0', 'text-align': 'center',}}>
                                {this.state.title}
                            </h2>
                        </div>
                        <div>
                            <label for="Giáo Viên">Giáo Viên Phụ Trách: </label>
                            <input className="read_only" type="text" name="Giáo Viên" value={this.state.magiaovien + ' - ' + this.state.giaovien} style={{"text-align": "center"}} disabled/>
                        </div>
                        <div style={{
                            'display': 'grid',
                            'grid-template-columns': '10% 80% 10%',
                        }}>
                            <div style={{"padding": "0"}}>
                                <div  onClick={this.backCalendar.bind(this)} className="button" ref="back" style={{"padding": "0", "float": "left", 'padding-left': '20px'}}>
                                    <i class="fa fa-chevron-circle-left fa-2x" aria-hidden="true"></i>
                                </div> 
                            </div>
                            <h3 style={{'margin': '0', 'text-align': 'center',}}>{rangedate}</h3>
                            <div style={{"padding": "0"}}>
                                <div onClick={this.nextCalendar.bind(this)} className="button" ref="next" style={{"padding": "0", "float": "right", 'padding-right': '20px'}}>
                                    <i class="fa fa-chevron-circle-right fa-2x" aria-hidden="true"></i>
                                </div>
                            </div>
                        </div>
                        <div style={{
                            'display': 'grid',
                            'grid-template-columns': '35% 65%'
                        }} >
                            <div style={{"padding": "0", }}>
                                <fieldset style={{"padding": "0", }}>
                                    <legend>Danh Sách Các Lịch Học Đã Chuyển: </legend>
                                    <div style={{
                                        "padding": "0",
                                        'overflow-y': 'scroll',
                                        'overflow-x': 'scroll',
                                        'height': '565px',
                                    }}>
                                    {
                                        this.state.arrayChangedSchedule.map((val, index) => {
                                            let color = 'lightblue';
                                            let tenlop;
                                            let gio = parseInt(parseInt(val.giobatdautruocdo)/2) +6;
                                            let phut= parseInt(val.giobatdautruocdo)%2?"30":"00"
                                            let giotruocdo = ("0"+gio).slice(-2)+":"+phut

                                            let gio2 = parseInt(parseInt(val.giobatdauchuyentoi)/2) +6;
                                            let phut2= parseInt(val.giobatdauchuyentoi)%2?"30":"00"
                                            let giochuyentoi = ("0"+gio2).slice(-2)+":"+phut2
                                            for(let v of this.state.lichhoc)
                                            {
                                                if(v['Mã Lớp']==val['malop'])
                                                {
                                                    tenlop = v['name']+' - '+ v['Lớp'];
                                                    break;
                                                }
                                            }                             
                                            return (
                                                <div style={{
                                                    'background': color, 
                                                    'margin': '10px 5px',
                                                    'padding': '10px 10px 10px 16px',
                                                }} key={index}>
                                                <div onClick={this.removeLichChuyen.bind(this,index)} type ="button" style={{
                                                        'position': 'relative',
                                                        "float":'right',                           
                                                        'color': '#444',
                                                        'text-shadow': '1px 1px 4px #ccc',
                                                    }}>
                                                        <i class="fa fa-times fa-lg" aria-hidden="true" ></i>
                                                    </div>
                                                    <p style={{"padding-top": "0px","margin":"0" }}>
                                                    {   val['malop'] +' - '+tenlop} <br/>
                                                       { "Mới: "+val['ngaychuyentoi']+ ' - '
                                                        + giochuyentoi}<br/>
                                                        {"Cũ: "+val['ngaytruocdo']+ ' - '
                                                        + giotruocdo}
                                                    </p>                                    
                                                </div>
                                            )
                                        })
                                    }
                                        
                                    
                                    
                                    </div>
                                </fieldset>                       
                            </div>
                            <Calendar
                                getMe={me => (this.calendar = me)}
                                calendarClick={this.calendarClick.bind(this)}
                                action='d-edit'
                                arrayChangedSchedule={arrayLichChuyen}
                                popupon ={this.popupon.bind(this)}
                                infoLichHoc = {this.state.lichhoc}
                            />
                            {
                                (function()
                                {      
                                    
                                    if (this.state.showpopup) {
                                        let ngaybatdau = new Date(this.state.ngaybatdau);
                                        if(ngaybatdau.getDay()!=0)                        
                                            ngaybatdau.setDate(ngaybatdau.getDate()-ngaybatdau.getDay());
                                        let stringngaybatdau = ngaybatdau.getFullYear()+"-";
                                        if((ngaybatdau.getMonth()+1)<10)
                                            stringngaybatdau+="0";
                                        stringngaybatdau+=(ngaybatdau.getMonth()+1)+"-";
                                        if(ngaybatdau.getDate()<10)
                                            stringngaybatdau+="0";
                                        stringngaybatdau+=ngaybatdau.getDate();
                                        let ngayketthuc; 
                                        for (let v of this.state.lichhoc)
                                        {
                                            if(v['Mã Lớp']==this.calendar.state.value.split('!')[0])
                                            {
                                                ngayketthuc = new Date(v['Ngày Kết Thúc']);
                                                break;
                                            }
                                        }
                                        console.log(ngayketthuc.toISOString())
                                        if(ngayketthuc.getDay()!=0)                        
                                            ngayketthuc.setDate(ngayketthuc.getDate()-ngayketthuc.getDay());
                                        let stringngayketthuc = ngayketthuc.getFullYear()+"-";
                                        if((ngayketthuc.getMonth()+1)<10)
                                            stringngayketthuc+="0";
                                        stringngayketthuc+=(ngayketthuc.getMonth()+1)+"-";
                                        if(ngayketthuc.getDate()<10)
                                            stringngayketthuc+="0";
                                        stringngayketthuc+=ngayketthuc.getDate(); 
                                        
                                        let stringngaydautuan = stringngaybatdau;
                                        ngaybatdau.setDate(ngaybatdau.getDate()+this.calendar.state._y-1);
                                        if(ngaybatdau<new Date())
                                        {
                                            let date = new Date(this.state.ngaybatdau)
                                            date.setDate(date.getDate()-date.getDay()+8);
                                            stringngaybatdau = date.toISOString().slice(0,10);
                                        }

                                        return(
                                            <Popup
                                                popupoff = {this.popupoff.bind(this)}
                                                ngaydautuan ={stringngaybatdau}
                                                ngayketthuc ={stringngayketthuc}
                                                ngay ={stringngaydautuan}
                                                calendar={this.calendar}
                                                sualichday = {this}
                                            />
                                        )
                                        
                                    }
                                }.bind(this))()
                            }
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
                            disabled={this.state.btnDisable}
                        />
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
  }) (SuaLichDay);
