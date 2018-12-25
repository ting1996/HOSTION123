import React from 'react';
import { connect } from 'react-redux';
import style from './style.css';
import classnames from 'classnames';
import Cell from './Cell.js';
import Error from './Error.js'
import InfoShadow from './InfoShadow.js'
var timeshadow;
class Calendar extends React.Component{
  constructor (props) {
    super(props);
    this.state = {
      column: [ '', 'Chủ Nhật', 'Thứ 2', 'Thứ 3' , 'Thứ 4' , 'Thứ 5' , 'Thứ 6' , 'Thứ 7'],
      rows: [],
      information: [],
      data: [],
      today: '',
      objadd: {},
      error: '',
      lop: '',
      email: '',
      malop: '',
      _rows:[],
      x:0,
      y:0,
      _x:0,
      _y:0,
      value:'', 
      _value:'',
      arrayEdit:[],
      //{mã lớp, ngày chuyển tới,giờ bắt đầu chuyển tới,ngày trước đó,giờ bắt đầu trước đó,thời lượng dạy}
      isSwitchwClass:Boolean,
      tenlop:'',
      ngaybatdau:'',
      ngayketthuc:'',
      showInfo:false,
      dragging:false,
      pageXY:{},    
    };

    this.resetLich = this.resetLich.bind(this);
    this.emailChange = this.emailChange.bind(this);
    this.callBackGoogleApi = this.callBackGoogleApi.bind(this);
    this.callBackDataFormDatabase = this.callBackDataFormDatabase.bind(this);
    this.dragStart =this.dragStart.bind(this);
    this.dragging = this.dragging.bind(this);
    this.dragEnd = this.dragEnd.bind(this);
    this.allowDrop =this.allowDrop.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.drop = this.drop.bind(this);
    this.dropclass = this.dropclass.bind(this);
  }

  resetLich() {
    this.setState({
      rows: [],
      information: [],
    });
    let x = 0;
    let rows = [];
    for (let index = 6; index < 24; index++) {
      let hours = ("0" + index).slice(-2) + ' : 00';
      let arr = [hours, ];
      for (let i = 1; i < 8; i++) {
        arr = arr.concat('');
      }
      rows.push({ [x]: arr });
      hours = ("0" + index).slice(-2) + ' : 30';
      arr = [hours, ];
      for (let i = 1; i < 8; i++) {
        arr = arr.concat('');
      }
      rows.push({ [x + 1]: arr });
      x = x + 2;
    }
    this.setState({ rows: rows});
  }

  callBackGoogleApi (key, data) {
    let socket = this.props.socket;
    this.setState({error: ''});
    switch (key) {
      case 'calendar_laylichgiaovien':
        this.setState({data: data});
        if (data.email.length > 0) {
          for (const i of data.email) {
            let start = new Date(Date.parse(i.start.dateTime));
            let end = new Date(Date.parse(i.end.dateTime));
            try {
              let thu = () => start.getUTCDay() + 1;
              var rowscallback = this.state.rows;
              var offset = -6;

              let startrow = (start.getHours() + offset) * 2;
              if (start.getMinutes() >= 30) {
                startrow++;
              }

              let endrow = (end.getHours() + offset) * 2;
              if (end.getMinutes() >= 30) {
                endrow++;
              }

              for (let index = startrow; index < endrow; index++) {
                if(rowscallback[index] != null)
                  rowscallback[index][index][thu()] = i.summary;
              }

              rowscallback[startrow][startrow][thu()] = i.summary + '!';
              this.setState({
                rows: rowscallback,
                information: this.state.information.concat({ [i.summary]: i.description }),
              });
            } catch (e) {
              this.props.dispatch({
                type: 'ALERT_NOTIFICATION_ADD',
                content: e.message,
                notifyType: 'error',
              });
            }
          }
        }
        break;
      case 'error':
        this.props.dispatch({
            type: 'ALERT_NOTIFICATION_ADD',
            content: 'Lỗi houston_calendar: \n' + data.error,
            notifyType: 'error',
        })
        socket.emit('huy-query');
        this.setState({error: 'Vui lòng liên hệ admin để kiểm tra lại Houston Calendar! \nLỗi xảy ra: \n---' + data.error + '---'});
        break;
      default:
    }
  }

  callBackDataFormDatabase ( rows, hanhdong, dulieuguive ) {
  }

  componentDidMount () {
    let that = this;
    let socket = this.props.socket;
    
    try {
      this.props.getMe(this);
    } catch (e) {
      
    }

    let today = new Date();
    let y = today.getFullYear();
    let m = ("0" + (today.getMonth() + 1)).slice(-2);
    let d = ("0" + today.getDate()).slice(-2);
    this.setState({
      today: (y + "-" + m + "-" + d)
    });
    this.resetLich();

    socket.on('googleapicallback', this.callBackGoogleApi);
    socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    
    
    
  }
  
  componentWillUnmount() {
    this.props.socket.off('googleapicallback', this.callBackGoogleApi);
    this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
  }

  emailChange (e) {
    this.resetLich();
    //Giao vien duoc chon
    //Load thoi khoa bieu dua tren email giao vien
    var email = e;
    if (email != null && email != '') {
      email = email.toLocaleLowerCase();
      if (this.refs.datechoose != null) {
        this.refs.datechoose.reset();
      }
      this.props.socket.emit('googleapi', {
        function: 'laylichgiaovien',
        key: 'calendar_laylichgiaovien',
        calendarname: [
          'Dự Thính',
          'Mầm Non',
          '1',
          '2',
          '3',
          '4',
          '5',
          '6',
          '7',
          '8',
          '9',
          '10',
          '11',
          '12',
          'Sinh Viên',
          'Đi Làm',
        ],
        email: email,
        // getRaw: true,
      });
    } else {
      this.setState({error: '---Giáo viên không có email vui lòng cập nhật email---'});
      $('.loading2').hide();
    }
  }

  localCalendar (batdau, ketthuc, data) {
    let x = 0;
    let array = [];
    for (let index = 6; index < 24; index++) {
      let hours = ("0" + index).slice(-2) + ' : 00';
      let arr = [hours, ];
      for (let i = 1; i < 8; i++) {
        arr = arr.concat('');
      }
      array.push({ [x]: arr });
      hours = ("0" + index).slice(-2) + ' : 30';
      arr = [hours, ];
      for (let i = 1; i < 8; i++) {
        arr = arr.concat('');
      }
      array.push({ [x + 1]: arr });
      x = x + 2;
    }
    let arrayLichChuyen = this.props.arrayChangedSchedule;
    console.log(arrayLichChuyen)
    let ngaybatdau = new Date(batdau);
    let ngayketthuc = new Date(ketthuc);
    let thuhientai = ngaybatdau.getDay() + 1;
    let rowscallback = array;
    let ngaybaygio = new Date();
    let ngaydautuan = new Date(batdau);
    ngaydautuan.setDate(ngaydautuan.getDate()-ngaydautuan.getDay())
    for (let val of data) {
      
      let check = new Date(batdau);
      check.setDate(ngaybatdau.getDate() + (val['Thứ'] - thuhientai));
      if (val['Thứ'] >= thuhientai && val['Thứ'] < 8 && check <= ngayketthuc) {
        if(new Date(val['Ngày Bắt Đầu'])>check||new Date(val['Ngày Kết Thúc'])<check)
          continue;
        let offset= -6;
        let startrow = (parseInt(val['Giờ Bắt Đầu'].split(':')[0]) + offset) * 2;
        if (val['Giờ Bắt Đầu'].split(':')[1] >= 30) {
          startrow++;
        }
        let endrow = (parseInt(val['Giờ Kết Thúc'].split(':')[0]) + offset) * 2;
        if (val['Giờ Kết Thúc'].split(':')[1] >= 30) {
          endrow++;
        }
        let ngaylichhoc = new Date(batdau);
        ngaylichhoc.setDate(ngaylichhoc.getDate()-ngaylichhoc.getDay()+val['Thứ']-1);
        let draggable;
        let drawable = true;

        for(let v of arrayLichChuyen)
        {
          if (v.malop == val['Mã Lớp'] &&
              v.thoiluongday == endrow-startrow&&
              new Date(v.ngaytruocdo)-ngaylichhoc.setHours(7)==0&&
              v.giobatdautruocdo == startrow)
              {
                drawable = false;
                break;
              }
        }
        if(drawable)
        {
          if(ngaybaygio>ngaylichhoc)
            draggable="false";
          else
            draggable="true"

          for (let index = startrow; index < endrow; index++) {
            if(rowscallback[index] != null)
              rowscallback[index][index][val['Thứ']] = val['Mã Lớp']+'!'+(endrow-startrow);
          }
          rowscallback[startrow][startrow][val['Thứ']] = val['Mã Lớp'] + '!'+(endrow-startrow)+'!'+draggable+'!';
        }
      }                            
    }

    for(let v of arrayLichChuyen)
    {
      let ngaychuyentoi = new Date(v.ngaychuyentoi)
      ngaychuyentoi.setHours(0)
      console.log("5")
      console.log(ngaychuyentoi)
      console.log(ngaydautuan)
      if(ngaychuyentoi-ngaydautuan<=518400000&&ngaychuyentoi-ngaydautuan>=0)
      {
        console.log(v.giobatdauchuyentoi)
        console.log(v.thoiluongday+v.giobatdauchuyentoi)
        for(let index = v.giobatdauchuyentoi;index<(parseInt(v.thoiluongday)+parseInt(v.giobatdauchuyentoi));index++){
          if(rowscallback[index] != null)
                rowscallback[index][index][ngaychuyentoi.getDay()+1] = v.malop+ '!'+v.thoiluongday;
        }
        rowscallback[v.giobatdauchuyentoi][v.giobatdauchuyentoi][ngaychuyentoi.getDay()+1] = v.malop + '!'+v.thoiluongday+'!true!';
      }
    }
    this.setState({
      rows: rowscallback,
    });
  }

  showFullLocalCalendar (data,malop) {
    console.log("on change click")
    let x = 0;
    let array = [];
    let arrayLichChuyen = this.props.arrayChangedSchedule;
    for (let index = 6; index < 24; index++) {
      let hours = ("0" + index).slice(-2) + ' : 00';
      let arr = [hours, ];
      for (let i = 1; i < 8; i++) {
        arr = arr.concat('');
      }
      array.push({ [x]: arr });
      hours = ("0" + index).slice(-2) + ' : 30';
      arr = [hours, ];
      for (let i = 1; i < 8; i++) {
        arr = arr.concat('');
      }
      array.push({ [x + 1]: arr });
      x = x + 2;
    }
    
    let rowscallback = array; 

    for(let v of arrayLichChuyen)
    {
      console.log(v,"v arrayLichChuyen")
      let ngaychuyentoi = new Date(v.ngaychuyentoi)
      ngaychuyentoi.setHours(0)
      let ngaytruocdo = new Date(v.ngaytruocdo)
      ngaytruocdo.setHours(0)
      let arrayEdit =[];
      if(v.malop == malop)
        arrayEdit = this.state.arrayEdit;
      for (let index = v.giobatdauchuyentoi; index <(parseInt(v.thoiluongday)+parseInt(v.giobatdauchuyentoi)); index++) 
      {
        let blockable = false;
        console.log(index,"index")
        for(let val of arrayEdit)
        {
          console.log(val,"val arrayEdit");
          console.log(v.giobatdautruocdo+index-v.giobatdauchuyentoi,"v.giobatdautruocdo+index-v.giobatdauchuyentoi");
          console.log(ngaytruocdo.getDay()+1,"ngaytruocdo.getDay()+1");
          
          
          if(val.x == (v.giobatdautruocdo+index-v.giobatdauchuyentoi)&&val.y == ngaytruocdo.getDay()+1)
          {
            blockable = true;
            break;
          }
        }
        console.log(blockable,"blockable")
        if(rowscallback[index] != null&&!blockable)
          rowscallback[index][index][ngaychuyentoi.getDay()+1] = "@";
      }
    }
    for (let val of data) {
      if (val['Giờ Bắt Đầu'] != null && val['Giờ Kết Thúc'] != null) {
        let offset= -6;
        let startrow = (parseInt(val['Giờ Bắt Đầu'].split(':')[0]) + offset) * 2;
        if (val['Giờ Bắt Đầu'].split(':')[1] >= 30) {
          startrow++;
        }
        let endrow = (parseInt(val['Giờ Kết Thúc'].split(':')[0]) + offset) * 2;
        if (val['Giờ Kết Thúc'].split(':')[1] >= 30) {
          endrow++;
        }
        for (let index = startrow; index < endrow; index++) {
          if(rowscallback[index] != null)
            rowscallback[index][index][val['Thứ']] = val['Mã Lớp'];
        }
        rowscallback[startrow][startrow][val['Thứ']] = val['Mã Lớp'] + '!'+(endrow-startrow)+'!';   
      }                      
    }

    this.setState({
      rows: rowscallback,
    });
  }

  calendarClick (e) {
    if (this.props.action == 'view') {
      let rowindex = e.target.parentElement.rowIndex - 1;
      let gio = '';
      if ((rowindex % 2) == 0) {
          gio = ("0" + (Math.floor(rowindex / 2) + 6)).slice(-2) + ':00:00';
      } else {
        gio = ("0" + (Math.floor(rowindex / 2) + 6)).slice(-2) + ':30:00';
      }
      try {        
        this.props.calendarClick(e.target.cellIndex, gio);
      } catch (e) {
        
      }
    }
  }

  onMouseDown()
  {
    
    
  }

  onMouseOff(e)
  {

    this.setState({showInfo:false});
  }

  onMouseMove(e)
  {
    
    
    this.setState({pageXY:{X:e.nativeEvent.pageX,Y:e.nativeEvent.pageY},showInfo:true});
  }
  onMouseEnter(e)
  {
    let infoLich={};
    
    for(let v of this.props.infoLichHoc)
    {
      if(v['Mã Lớp']==e.target.dataset.v.split('!')[0])
      {
        infoLich.ten =v['name'];
        infoLich.lop = v['Lớp'];
        infoLich.ngaybatdau = v['Ngày Bắt Đầu'];
        infoLich.ngayketthuc=v['Ngày Kết Thúc'];
        //infoLich
        break;
      }
    } 
    this.setState({tenlop:infoLich.ten+" - "+infoLich.lop,ngaybatdau:infoLich.ngaybatdau,ngayketthuc:infoLich.ngayketthuc,showInfo:true})

  }
  dropclass(e)
  {
    let value =  this.state.value
    console.log(e.target.dataset.v);
    console.log(value);
    
    if(e.target.dataset.v.endsWith("!") && (e.target.dataset.v+'@') != value)
    {
      console.log(e.target.dataset.v);
      
      e.preventDefault();
      let lenght = this.state.value.split('!')[1];
      let _lenght = e.target.dataset.v.split('!')[1];
      let locatex = parseInt(e.target.dataset.locatex);
      let locatey = parseInt(e.target.dataset.locatey);
      let _locatex = this.state.x;
      let _locatey = this.state.y;
      let classname = this.state.value.split('!')[0];
      let _classname = e.target.dataset.v.split('!')[0];
      let rowscallback = [...this.state.rows];
      let lenghtest= (lenght<_lenght)?_lenght:lenght;
      let _value = e.target.dataset.v;
      for(let i = 0;i<lenghtest;i++){
        if(i<lenght)
        {
          if(rowscallback[locatex+i][locatex+i][locatey].split('!')[0]!=_classname&&
          rowscallback[locatex+i][locatex+i][locatey]!="")
          {
            return 0;
          }
          rowscallback[locatex+i][locatex+i][locatey]=classname;
          if(i==0)
            rowscallback[locatex+i][locatex+i][locatey]+="!"+lenght+"!"+"true!";
        }
        else
          rowscallback[locatex+i][locatex+i][locatey]="";
      }
      for(let i = 0;i<lenghtest;i++){
        if(i<_lenght)
        {
          if(rowscallback[_locatex+i][_locatex+i][_locatey].split('!')[0]!=(classname+"@")&&
            rowscallback[_locatex+i][_locatex+i][_locatey]!=""&&rowscallback[_locatex+i][_locatex+i][_locatey].split('!')[0]!=classname )
          { 
            return 0;
          }
          rowscallback[_locatex+i][_locatex+i][_locatey]=_classname;
          if(i==0)
            rowscallback[_locatex+i][_locatex+i][_locatey]+="!"+_lenght+"!"+"true!";
        }
        else
          rowscallback[_locatex+i][_locatex+i][_locatey]="";
      }
      setTimeout(function(){
        this.setState(function(state, props) {
          return {
            _x:locatex,
            _y:locatey,
            rows: rowscallback,
            isSwitchwClass:true,
            _value:_value,
          };
        });
      }.bind(this),0.2)
      console.log("finish");
      setTimeout(function(){
        this.props.popupon();
      }.bind(this),3)
      
    }
  }
  drop(e)
  {     
      e.preventDefault();
      document.getElementById("dragShadow").innerHTML="";
      let lenght = this.state.value.split('!')[1];
      let locatex = parseInt(e.target.dataset.locatex);
      let locatey = parseInt(e.target.dataset.locatey);
      let _locatex = this.state.x;
      let _locatey = this.state.y;
      let classname = this.state.value.split('!')[0];
      
      let rowscallback = [...this.state.rows];
      for(let i = 0;i<lenght;i++){
        if(rowscallback[locatex+i][locatex+i][locatey]!=""&&
          !rowscallback[locatex+i][locatex+i][locatey].endsWith("@"))
          {
            console.log("abc");
            return 0;
          }
          
      }
      for(let i = 0;i<lenght;i++){
        rowscallback[_locatex+i][_locatex+i][_locatey]="";
        rowscallback[locatex+i][locatex+i][locatey]+=classname;
        if(i==0)
          rowscallback[locatex+i][locatex+i][locatey]+="!"+lenght+"!"+this.state.value.split('!')[2]+"!";
      }
      setTimeout(function(){
        this.setState(function(state, props) {
          return {
            _x:locatex,
            _y:locatey,
            rows: rowscallback,
            isSwitchwClass:false
          };
        });
      }.bind(this),0.2)
      setTimeout(function(){
        console.log("cba");
        this.props.popupon();
      }.bind(this),3)
    
   
  }
  dragStart(e)
  {
    console.log(e.target.dataset.v.split('!'));
    console.log(e.target.dataset.v.split('!')[1],"e.target.dataset.v.split('!')[1]");
     for(let i = 0;i<e.target.dataset.v.split('!')[1];i++)
     {
         let temp = document.createElement("TR");
         let att = document.createAttribute("class");       // Create a "class" attribute
         att.value = style.trshadow;                           // Set the value of the class attribute
         temp.setAttributeNode(att);  
         document.getElementById("dragShadow").appendChild(temp);
         for(let j=0;j<1;j++)
         {
          let yourclass = classnames({
          [style.rowshadow]: 'rowshadow',
          [style.rowisbusy]: 'rowisbusy',
          });
          let temp1 = document.createElement("TD");
        
          let att = document.createAttribute("class");       // Create a "class" attribute
          att.value = yourclass;                           // Set the value of the class attribute
          temp1.setAttributeNode(att);
          
          temp.appendChild(temp1);
          if (i==0)
          temp1.appendChild(document.createTextNode(e.target.dataset.v.split('!')[0]));
         }
     }
     let temp = document.createElement("DIV");
     e.dataTransfer.setDragImage(temp, 0, 0);
     let lenght = e.target.dataset.v.split('!')[1];
     let rows = this.state.rows;
     let locatex = parseInt(e.target.dataset.locatex);
     let locatey = parseInt(e.target.dataset.locatey);
     
     if(!rows[locatex][locatex][locatey].endsWith("!"))
      {
        console.log("true");
        
          while(rows[locatex-1][locatex-1][locatey].split("!")[0]==e.target.dataset.v.split('!')[0])
        {
          locatex--;
          if(rows[locatex][locatex][locatey].endsWith("!"))
            break;
        }
      }
     console.log(locatex,"locatex");
     
     setTimeout(function(){ 
     let rowscallback = [...this.state.rows];
     let _rowsbackup = JSON.parse(JSON.stringify(rowscallback));
     console.log(rowscallback===_rowsbackup);
     
     
    for(let i = 0;i<lenght;i++){
      rowscallback[locatex+i][locatex+i][locatey]+="@";
    }
    
    this.setState(function(state, props) {
      return {
        _rows:_rowsbackup,
        rows: rowscallback,
        x:locatex,
        y:locatey,
        value:rowscallback[locatex][locatex][locatey],
        dragging:true,
      };
    });
    }.bind(this), 20);
   
    
    
  }
  dragging(e)
  {
    
    let temp = "width: 100%;position:fixed;top:"+(e.nativeEvent.clientY+5)+"px;left:"+(e.nativeEvent.clientX+5-20)+"px";
    document.getElementById("dragShadow").setAttribute("style",temp)
    
  }
  dragEnd(e)
  {
    document.getElementById("dragShadow").innerHTML="";
    let _rowsbackup = JSON.parse(JSON.stringify(this.state._rows));
    this.setState(function(state, props) {
      return {
        rows: _rowsbackup,
        dragging:false,
      };
    });
    
    
    
    /* this.setState(function(state, props) {
      return {
        rows:state._rows.slice()
      };
    }); */
  }
  allowDrop(e)
  {
    if(e.target.dataset.v.endsWith("!"))
    {
      e.preventDefault();
    }
  }
  render () {
    let hide = 'grid';
    if (this.props.action == 'view'||this.props.action=='d-edit') {
      hide = 'none';
    }

    var xhtml = this.state.error != '' ? <Error error={this.state.error}/> : 
      
      <div style={{'padding': '0'}}>
        
        <form ref='datechoose'>
          <div style={{
            'padding': '0', 
            'display': hide,
            'grid-template-columns': '50% 50%',
          }}>
            <div style={{'padding': '0px 5px 0px 0px'}}>
            Ngày bắt đầu: <input ref='ngaybatdau' type="date" min={this.state.today}/>
            </div>
            <div style={{'padding': '0px 0px 0px 5px'}}>
            Ngày kết thúc: <input ref='ngayketthuc' type="date" min={this.state.today}/>
            </div>
          </div>
        </form>
        <div id ="infoShadow" style={{'width': '100%','position':'fixed','top':'0px','left':'0px'}}></div>
        <table id ="dragShadow" style={{'width': '100%','position':'fixed','top':'-100px','left':'-100px'}}>
        </table>
        <table style={{'width': '100%','-webkit-user-select': 'none'}}>
          <tr className={style.tr}>
            {this.state.column.map((e, i) => (
              <th key={i} className={style.column}>{e}</th>
            ))}
          </tr>
          {
            this.state.rows.map((value, index) => {
              return (
                <tr key={index} className={style.tr}>
                {
                  value[index].map((v, i) => {
                    if (i == 0) {
                      return (
                        <td key={i} className={style.fistrow}>{v}</td>
                      );
                    } else if (v == '') {//Cell trong
                      let disable_choose = false;
                      let allowdrop = false;
                      if (this.props.action == 'view') {
                        disable_choose = true;
                      }
                      if (this.props.action == 'd-edit') {
                        disable_choose = true;
                        allowdrop = true;
                      }
                      return (
                        <Cell 
                          key={i} 
                          tieude={index}
                          locatex ={index}
                          locatey = {i}
                          disablechoose={disable_choose} 
                          allowdrop = {allowdrop}
                          ondrop = {this.drop}
                          onMouseOff = {this.onMouseOff.bind(this)}>
                          {v}
                        </Cell>
                      );
                    } else {//Cell chua phong day
                      let yourclass;
                      let value;
                      let draggable;
                      
                      if (!v.endsWith('!')) {
                        yourclass = classnames({
                          [style.row]: 'row',
                          [style.rowisbusy]: 'rowisbusy',
                        });
                        value = null;
                        draggable = "true";
                        if(v.endsWith('@'))
                        {
                          yourclass = classnames({
                            [style.row]: 'row',
                            [style.rowisbusy]: 'rowisbusy',
                            [style.rowisselected]:'rowisselected',
                          });
                        }
                        
                      }
                      else {
                        yourclass = classnames({
                          [style.row]: 'row',
                          [style.rowisbusy]: 'rowisbusy',
                          [style.covertext]: 'covertext',
                        });
                        value = v.split('!')[0];
                        
                        draggable =v.split('!')[2];
                      }
                      if (this.props.action == 'edit' && v.split('!')[0] == this.props.data['Mã Lớp']) {
                        return (
                          <Cell key={i} gio={i} tieude={index} cellisclick={true} onMouseOff = {this.onMouseOff.bind(this)}  onChangeEdit = {this.props.onChangeEdit.bind(this)} calendar ={this}></Cell>
                        );
                      }
                      else if(this.props.action == 'd-edit')
                      {
                        
                        return (
                        <td 
                          key={i} 
                          style = {{'-webkit-user-select': 'none'}}
                          className={yourclass} 
                          draggable = {draggable}
                          onDragStart = {this.dragStart} 
                          onDrag = {this.dragging}
                          onDragEnd = {this.dragEnd}
                          onDragOver = {this.allowDrop}
                          data-locatex={index}
                          data-locatey={i}
                          data-v={v}
                          onDrop={this.dropclass}
                          value={v}              
                          onMouseMove = {this.onMouseMove.bind(this)}
                          onMouseEnter = {this.onMouseEnter.bind(this)}
                          >{value}
                          </td>
                          );
                      }
                      else if(this.props.action == 'edit' && v.endsWith('@'))
                      {
                        return (
                          <td key={i} className={yourclass} value={v}>{value}</td>
                        ); 
                      }
                       else {
                        return (
                          <td key={i} className={yourclass} onMouseMove = {this.onMouseMove.bind(this)}
                          onMouseEnter = {this.onMouseEnter.bind(this)} onClick={this.calendarClick.bind(this)} data-v ={v}value={v}>{value}</td>
                        );  
                      }                                            
                    }                    
                  })
                }
                </tr>
              );
            })
          }
        </table>
        {
          (function(){
            if(this.state.showInfo&&!this.state.dragging)
            {
              return(<InfoShadow 
                      ten ={this.state.tenlop} 
                      ngaybatdau = {this.state.ngaybatdau}
                      ngayketthuc= {this.state.ngayketthuc}
                      pageXY = {this.state.pageXY}/>
                    );
            }
          }.bind(this))()
        }
      </div>;
    return (
      <div style={{'padding': '0'}}>
        {xhtml}
      </div>
    );
  }
};

module.exports = connect(function (state) {
  return {
    socket: state.socket,
  };
}) (Calendar);
