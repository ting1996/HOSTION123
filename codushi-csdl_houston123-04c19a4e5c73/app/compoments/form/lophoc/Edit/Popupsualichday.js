import React from 'react';
import { connect } from 'react-redux';
import style from '../../style.css';
var ReactDOM = require('react-dom');
import Select from 'react-select';
import classnames from 'classnames';
import Button from '../../elements/Button';

class Popupsualichday extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            chucnang:{value: "mottuan",label:"Chuyển lịch dạy tới tuần khác"},
            listchucnang:[{value: "mottuan",label:"Chuyển lịch dạy tới tuần khác"},
                        {value: "nhieutuan",label:"Thay đổi nhiều tuẩn tương tự"}],
            ngaydautuan:this.props.ngaydautuan,
            min:this.props.ngaydautuan,
            max:this.props.ngayketthuc,
            cactuan:[],
            btnDisable:false,

        }
        this.sualichday = this.props.sualichday;
        this.calendar = this.props.calendar;
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
                    case 'dangkymonhoc_loaddanhsachmonhoc':
                        break;
                    default:
                        
                }
                
            }
        }  
    }

    componentDidMount () {
        let query;
        let that = this;
        window.addEventListener("resize", this.changeSize);
        this.changeSize();
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
        
        
        for (let element of document.getElementsByClassName('Select-input'))
            element.innerHTML = ""
        for (let element of document.getElementsByClassName('Select-clear'))
            element.innerHTML = ""
        this.changeDate(false);
        
        $(document).keypress(function(e){
            if(e.keyCode == 13)
                this.dongy(); 
        }.bind(this))
        
        if(this.calendar.state.isSwitchwClass)
            this.setState({max:this.state.min})
        // console.log(this.props.userid);
        // query = 'SELECT * FROM quanlyhocsinh.MONHOC';
        // this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
        //     fn : 'dangkymonhoc_loaddanhsachmonhoc',
        // });
    }

    componentWillUnmount() {
        $(document).off("keypress");
        window.removeEventListener("resize", this.changeSize);
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentDidUpdate(prevProps, prevState) {
        this.changeSize();
        if(this.state.chucnang.value =="mottuan")
            this.changeDate(true);
    }
    changeDate(update)
    {
        document.getElementById("tu").value = document.getElementById("tu").value;
        let ngaydautuan = new Date(document.getElementById("tu").value);
        ngaydautuan.setDate(ngaydautuan.getDate()+6);

        let ngaycuoituan = ngaydautuan.getFullYear()+"-";
        if((ngaydautuan.getMonth()+1)<10)
            ngaycuoituan+="0";
        ngaycuoituan+=(ngaydautuan.getMonth()+1)+"-";
        if(ngaydautuan.getDate()<10)
            ngaycuoituan+="0";
        ngaycuoituan+=ngaydautuan.getDate();

        document.getElementById("den").value =ngaycuoituan;
        
        let ngaydautuanchuyentoi = new Date(document.getElementById("tu").value);
        ngaydautuanchuyentoi.setDate(ngaydautuanchuyentoi.getDate()+this.calendar.state._y-1);

        let ngaytruocdo = new Date(this.props.ngay);
        ngaytruocdo.setDate(ngaytruocdo.getDate()+this.calendar.state.y-1);
        if(this.sualichday.checkDuplicate(this.state.chucnang.value,this.calendar.state.value.split('!')[0],ngaytruocdo,this.calendar.state.x,ngaydautuanchuyentoi,this.calendar.state._x,this.calendar.state.value.split('!')[1]))
        {
            $('#state').text("Có thể chuyển")
            $('#state').css({"color": "green"})
            if(!update)
                this.setState({btnDisable:false})
        }
        else
        {
            $('#state').css({"color": "red"})
            $('#state').text("Không thể chuyển")
            if(!update)
                this.setState({btnDisable:true})
        }
        if(!update){
            this.setState({ngaydautuan: document.getElementById("tu").value});
            
        }
    }
    dongy () {
        console.log("Dong y")
        if(this.state.btnDisable)
            return;
        if(this.state.chucnang.value=="mottuan")
        {   
            let ngaydautuanchuyentoi = new Date(this.state.ngaydautuan);
            ngaydautuanchuyentoi.setDate(ngaydautuanchuyentoi.getDate()+this.calendar.state._y-1);
            
            let ngaydautuantruocdo = new Date(this.props.ngay);
            ngaydautuantruocdo.setDate(ngaydautuantruocdo.getDate()+this.calendar.state.y-1);
            
            let lichthaydoi = {
                malop:this.calendar.state.value.split('!')[0],
                ngaychuyentoi:ngaydautuanchuyentoi.toISOString().slice(0,10),
                giobatdauchuyentoi:this.calendar.state._x,
                ngaytruocdo:ngaydautuantruocdo.toISOString().slice(0,10),
                giobatdautruocdo:this.calendar.state.x,
                thoiluongday:this.calendar.state.value.split('!')[1],
                }
            let array = this.sualichday.state.arrayChangedSchedule;
            console.log(array)
            for(let [i, v] of array.entries())
            {
                if (v.giobatdauchuyentoi == lichthaydoi.giobatdautruocdo&&
                    v.ngaychuyentoi      == lichthaydoi.ngaytruocdo&&
                    v.thoiluongday       == lichthaydoi.thoiluongday&&
                    v.malop              == lichthaydoi.malop)
                {
                    lichthaydoi.giobatdautruocdo = v.giobatdautruocdo;
                    lichthaydoi.ngaytruocdo      = v.ngaytruocdo;
                    array.splice(i,1);
                    break;
                }
            }
            if (lichthaydoi.giobatdautruocdo != lichthaydoi.giobatdauchuyentoi||
                lichthaydoi.ngaytruocdo      != lichthaydoi.ngaychuyentoi)
                array.push(lichthaydoi);
            if(this.calendar.state.isSwitchwClass)
            {
                let lichthaydoi2 = {
                    malop:this.calendar.state._value.split('!')[0],
                    ngaychuyentoi:ngaydautuantruocdo.toISOString().slice(0,10),
                    giobatdauchuyentoi:this.calendar.state.x,
                    ngaytruocdo:ngaydautuanchuyentoi.toISOString().slice(0,10),
                    giobatdautruocdo:this.calendar.state._x,
                    thoiluongday:this.calendar.state._value.split('!')[1],
                }
                for(let [i, v] of array.entries())
                {
                        
                    if (v.giobatdauchuyentoi == lichthaydoi2.giobatdautruocdo&&
                        v.ngaychuyentoi      == lichthaydoi2.ngaytruocdo&&
                        v.thoiluongday       == lichthaydoi2.thoiluongday&&
                        v.malop              == lichthaydoi2.malop)
                    {
                        lichthaydoi2.giobatdautruocdo = v.giobatdautruocdo;
                        lichthaydoi2.ngaytruocdo      = v.ngaytruocdo;
                        array.splice(i,1);
                        break;
                    }
                }
                if (lichthaydoi2.giobatdautruocdo != lichthaydoi2.giobatdauchuyentoi||
                    lichthaydoi2.ngaytruocdo      != lichthaydoi2.ngaychuyentoi)
                    array.push(lichthaydoi2);
            }
            this.sualichday.setState({arrayChangedSchedule:array});
            
            this.sualichday.resetCalendar()
        }
        else
        {
            let array = this.sualichday.state.arrayChangedSchedule;
            for (let v of this.state.cactuan)
            {
                let date = new Date(v.value)
                let string = date.toLocaleDateString('zh-Hans-CN')
                let ngaydautuanchuyentoi = new Date(string.split('/')[0],parseInt(string.split('/')[1])-1,string.split('/')[2]);
                ngaydautuanchuyentoi.setDate(ngaydautuanchuyentoi.getDate()+this.calendar.state._y-1);
                console.log("v.value",v.value)
                console.log("ngaydautuanchuyentoi",ngaydautuanchuyentoi.toISOString())
                let ngaydautuantruocdo = new Date(string.split('/')[0],parseInt(string.split('/')[1])-1,string.split('/')[2]);
                ngaydautuantruocdo.setDate(ngaydautuantruocdo.getDate()+this.calendar.state.y-1);
                
                let lichthaydoi = {
                    malop:this.calendar.state.value.split('!')[0],
                    ngaychuyentoi:ngaydautuanchuyentoi.toLocaleDateString('zh-Hans-CN').replace(/\//g,'-'),
                    giobatdauchuyentoi:this.calendar.state._x,
                    ngaytruocdo:ngaydautuantruocdo.toLocaleDateString('zh-Hans-CN').replace(/\//g,'-'),
                    giobatdautruocdo:this.calendar.state.x,
                    thoiluongday:this.calendar.state.value.split('!')[1],
                    }
                
                
                for(let [i, v] of array.entries())
                {
                    if (v.giobatdauchuyentoi == lichthaydoi.giobatdautruocdo&&
                        v.ngaychuyentoi      == lichthaydoi.ngaytruocdo&&
                        v.thoiluongday       == lichthaydoi.thoiluongday&&
                        v.malop              == lichthaydoi.malop)
                    {
                        lichthaydoi.giobatdautruocdo = v.giobatdautruocdo;
                        lichthaydoi.ngaytruocdo      = v.ngaytruocdo;
                        array.splice(i,1);
                        break;
                    }
                }
                if (lichthaydoi.giobatdautruocdo != lichthaydoi.giobatdauchuyentoi||
                    lichthaydoi.ngaytruocdo      != lichthaydoi.ngaychuyentoi)
                    array.push(lichthaydoi);

                    let lichthaydoi2 = {
                        malop:this.calendar.state._value.split('!')[0],
                        ngaychuyentoi:ngaydautuantruocdo.toLocaleDateString('zh-Hans-CN').replace(/\//g,'-'),
                        giobatdauchuyentoi:this.calendar.state.x,
                        ngaytruocdo:ngaydautuanchuyentoi.toLocaleDateString('zh-Hans-CN').replace(/\//g,'-'),
                        giobatdautruocdo:this.calendar.state._x,
                        thoiluongday:this.calendar.state._value.split('!')[1],
                    }
                    for(let [i, v] of array.entries())
                    {
                            
                        if (v.giobatdauchuyentoi == lichthaydoi2.giobatdautruocdo&&
                            v.ngaychuyentoi      == lichthaydoi2.ngaytruocdo&&
                            v.thoiluongday       == lichthaydoi2.thoiluongday&&
                            v.malop              == lichthaydoi2.malop)
                        {
                            lichthaydoi2.giobatdautruocdo = v.giobatdautruocdo;
                            lichthaydoi2.ngaytruocdo      = v.ngaytruocdo;
                            array.splice(i,1);
                            break;
                        }
                    }
                    if (lichthaydoi2.giobatdautruocdo != lichthaydoi2.giobatdauchuyentoi||
                        lichthaydoi2.ngaytruocdo      != lichthaydoi2.ngaychuyentoi)
                        array.push(lichthaydoi2);
            }
            this.sualichday.setState({arrayChangedSchedule:array});
            
            this.sualichday.resetCalendar()
        }
        this.props.popupoff();
    }

    close () {
        try {
            
            this.calendar.setState({rows:this.calendar.state._rows});
            
            this.props.popupoff();
            
        } catch (e) {
            console.log(e);
        }
    }

    render () {
        return (
            <div className={classnames(style.formstyle) } ref="background">
                <div className="form_body popup" style={{'padding': '0px'}} ref="body" >
                    <div className="header" style={{'margin-top':'0px'}}>
                        <h2 style={{'color':'black'}}>Chuyển lịch</h2>
                        <div onClick={this.close.bind(this)} type ="button" style={{
                            'position': 'absolute',
                            'top': '10px',
                            'right': '10px',
                            'color': '#444',
                            'text-shadow': '1px 1px 4px #ccc',
                        }}>
                            <i class="fa fa-times fa-lg" aria-hidden="true" ></i>
                        </div>
                    </div>
                    <div className="body" style ={{'width': '90%'}}>

                        <div className="unsetdivformstyle">
                            <label for="">Chức năng: </label>
                            <Select
                                placeholder="--- Chọn Chức Năng Chuyển Lịch ---"
                                searchable={false}
                                clearable={false}
                                value={this.state.chucnang}
                                options={this.state.listchucnang}
                                onChange={(v) => {
                                    this.setState({chucnang: v});
                                }}
                                
                            />
                        </div>
                        {
                            (function(){
                                if(this.state.chucnang.value =="mottuan")
                                    return(<div style={{'padding': '0px 30px 0px 30px'}}>
                                    Tuần chuyển tới: <br/>
                                    Từ:<input  id ="tu" type="date" step ="7" value ={this.state.ngaydautuan} min ={this.state.min} max ={this.state.max} onChange={this.changeDate.bind(this,false)} />
                                    đến:<input id="den" type="date"  readOnly/><br/>
                                    <p id="state"></p>
                                    </div>)
                                else if(this.state.chucnang.value == "nhieutuan")
                                {
                                    let firstday = new Date(this.state.min);
                                    firstday.setHours(0)
                                    let lastday = new Date(this.state.min);
                                    let stringfirstday;
                                    let stringlastday;
                                    let listweek=[];
                                    let maxday = new Date(this.props.ngayketthuc);
                                    for(let v of this.sualichday.state.lichhoc)
                                    {
                                        if((v['Mã Lớp']==this.calendar.state.value.split('!')[0]||v['Mã Lớp']==this.calendar.state._value.split('!')[0])&&maxday>new Date(v['Ngày Kết Thúc']))
                                        {
                                            maxday = new Date(v['Ngày Kết Thúc'])
                                        }
                                    }
                                    let string =maxday.toLocaleDateString('zh-Hans-CN');
                                    maxday = new Date(string.split('/')[0],parseInt(string.split('/')[1])-1,string.split('/')[2])
                                    console.log("max day",maxday)
                                    console.log("first day",firstday)        
                                    lastday.setDate(lastday.getDate()+6);
                                    while(firstday<=maxday)
                                    {
                                        stringfirstday = ("0" + firstday.getDate()).slice(-2) + '/' + ("0" + (firstday.getMonth() + 1)).slice(-2) + '/' + firstday.getFullYear();
                                        stringlastday = ("0" + lastday.getDate()).slice(-2) + '/' + ("0" + (lastday.getMonth() + 1)).slice(-2) + '/' + lastday.getFullYear();
                                        let rangedate = 'Từ ';
                                        rangedate += stringfirstday + ' đến ' + stringlastday;

                                        let ngaychuyentoi = new Date(firstday);
                                        ngaychuyentoi.setDate(ngaychuyentoi.getDate()+this.calendar.state._y-1);
                                        let ngaytruocdo = new Date(firstday);
                                        ngaytruocdo.setDate(ngaytruocdo.getDate()+this.calendar.state.y-1);
                                        console.log("cactuan check")
                                        console.log(ngaytruocdo)
                                        console.log(ngaychuyentoi)
                                        console.log(firstday)
                                        if(this.sualichday.checkDuplicate(this.state.chucnang.value,this.calendar.state.value.split('!')[0],ngaytruocdo,this.calendar.state.x,ngaychuyentoi,this.calendar.state._x,this.calendar.state.value.split('!')[1]))
                                        {
                                            console.log("true check")
                                            listweek.push({value:firstday.toISOString(),label:rangedate});
                                        }
                                        firstday.setDate(firstday.getDate()+7);
                                        lastday.setDate(lastday.getDate()+7);
                                    }
                                    return(
                                        <div className="unsetdivformstyle" style={{'padding': '0px 30px 0px 30px'}}>
                                        <label for="">Các tuần bị chuyển: </label>
                                        <Select
                                            placeholder="--- Chọn Tuần Bị Chuyển ---"
                                            value={this.state.cactuan}
                                            options={listweek}
                                            
                                            searchable={false}
                                            clearable={false}
                                            closeOnSelect={false}


                                            onChange={(v) => {
                                                let tuan = v;
                                                if (v != null) {
                                                    for (let _v of v) {
                                                        if (_v.value == 'ALL') {
                                                            tuan = [_v]
                                                        }
                                                    }
                                                }
                                                this.setState({cactuan: tuan});
                                            }}
                                            multi
                                        />
                                        </div>
                                    )
                                }
                            }.bind(this))()
                        }                   
                    </div>
                    <div className="footer" style={{'padding': '5px 0px','background-color':'white'}}>
                        <Button 
                            onClick={this.close.bind(this)}
                            value="Thoát"
                            icon="close"
                            style={{'float': 'right', 'margin-right': '10px',}}
                            disabled={this.state.btnCloseDisable}
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
      userInfo: state.userinformation,
    };
}) (Popupsualichday);
