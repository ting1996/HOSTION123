import React from 'react';
import { connect } from 'react-redux';
import style from './style.css';
import classnames from 'classnames';
import Cell from './Cell.js';
import Error from './Error.js'
import InfoShadow from './InfoShadow.js'
import DragShadow from './DragShadow.js'
var timeshadow;
var skip =0;
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
      isShowInfo:false,
      dragging:false,
      arrayDeleteLichChuyen:[],
      pageXY:{},
      showDrag:false,
      callback_dragshadow:[],    
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
    let self = this
    $("#check_box_infoshadow").on("change",function(){
      if($(this).prop('checked'))
        self.setState({isShowInfo:true})
      else
        self.setState({isShowInfo:false})
    })
    
  }
  
  componentWillUnmount() {
    this.props.socket.off('googleapicallback', this.callBackGoogleApi);
    this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    $("#check_box_infoshadow").off("change")
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
              new Date(v.ngaytruocdo).getDate()==ngaylichhoc.getDate()&&
              new Date(v.ngaytruocdo).getMonth()==ngaylichhoc.getMonth()&&
              new Date(v.ngaytruocdo).getFullYear()==ngaylichhoc.getFullYear()&&
              v.giobatdautruocdo == startrow)
              {
                console.log(" drawable",v.ngaytruocdo);
                console.log(" drawable",ngaylichhoc);
                
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
              rowscallback[index][index][val['Thứ']] = val['Mã Lớp']+ '!'+(endrow-startrow)+"!"+(index-startrow);
          }
          rowscallback[startrow][startrow][val['Thứ']] = val['Mã Lớp'] + '!'+(endrow-startrow)+'!'+draggable+'!';
        }
      }                            
    }

    for(let v of arrayLichChuyen)
    {
      let ngaychuyentoi = new Date(v.ngaychuyentoi)
      ngaychuyentoi.setHours(0)
      
      if(ngaychuyentoi-ngaydautuan<=518400000&&ngaychuyentoi-ngaydautuan>=0)
      {
       
        for(let index = v.giobatdauchuyentoi;index<(parseInt(v.thoiluongday)+parseInt(v.giobatdauchuyentoi));index++){
          if(rowscallback[index] != null)
                rowscallback[index][index][ngaychuyentoi.getDay()+1] = v.malop+ '!'+v.thoiluongday+ '!'+(index-parseInt(v.giobatdauchuyentoi));
        }
        rowscallback[v.giobatdauchuyentoi][v.giobatdauchuyentoi][ngaychuyentoi.getDay()+1] = v.malop + '!'+v.thoiluongday+'!true!';
      }
    }
    this.setState({
      rows: rowscallback,
    });
  }

  showFullLocalCalendar (data,malop) {
    
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
    if(malop!=null)
      for(let v of arrayLichChuyen)
      {
        
        let ngaychuyentoi = new Date(v.ngaychuyentoi)
        ngaychuyentoi.setHours(0)
        let ngaytruocdo = new Date(v.ngaytruocdo)
        ngaytruocdo.setHours(0)
        let arrayEdit =[];
        if(v.malop == malop)
          arrayEdit = this.state.arrayEdit;
        let blockable = false;
        if( new Date($(this.refs.ngaybatdau).val())>ngaychuyentoi||
            new Date($(this.refs.ngayketthuc).val())<ngaychuyentoi)
            {
              blockable =true;
              break;
            }
        for (let index = v.giobatdauchuyentoi; index <(parseInt(v.thoiluongday)+parseInt(v.giobatdauchuyentoi)); index++) 
        {
          
          
          for(let val of arrayEdit)
          {
            if(val.x == (v.giobatdautruocdo+index-v.giobatdauchuyentoi)&&val.y == ngaytruocdo.getDay()+1)
            {
              blockable = true;
              break;
            }
          }
          if(blockable) break;
          
        }
        for(let val of this.state.arrayDeleteLichChuyen)
        { 
          if (val.y == ngaychuyentoi.getDay()+1&&
              val.x>=v.giobatdauchuyentoi &&
              val.x<=(parseInt(v.thoiluongday)+parseInt(v.giobatdauchuyentoi)-1))
            {
              blockable =true;
              break;
            }
        }
        if(!blockable)
          for (let index = v.giobatdauchuyentoi; index <(parseInt(v.thoiluongday)+parseInt(v.giobatdauchuyentoi)); index++) 
          {
            if(rowscallback[index] != null&&!blockable)
            rowscallback[index][index][ngaychuyentoi.getDay()+1] 
            = v.malop+"!"+v.giobatdautruocdo+"!"+(ngaytruocdo.getDay()+1)+"!"+"@";
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
        if( (new Date($(this.refs.ngaybatdau).val())<new Date(val['Ngày Bắt Đầu'])&&
            new Date($(this.refs.ngayketthuc).val())<new Date(val['Ngày Bắt Đầu']))||
            (new Date($(this.refs.ngaybatdau).val())>new Date(val['Ngày Kết Thúc'])&&
            new Date($(this.refs.ngayketthuc).val())>new Date(val['Ngày Kết Thúc'])))
            {
              continue;
            }
        console.log((new Date($(this.refs.ngayketthuc).val())-new Date($(this.refs.ngaybatdau).val())));
            
        if((new Date($(this.refs.ngayketthuc).val())-new Date($(this.refs.ngaybatdau).val()))<=518400000)
        {
          let ref_ngaybatdau = new Date($(this.refs.ngaybatdau).val())
          let ref_ngayketthuc = new Date($(this.refs.ngayketthuc).val())
          if(val["Thứ"]>=ref_ngaybatdau.getDay()+1)
          {
            ref_ngaybatdau.setDate(ref_ngaybatdau.getDate()+val["Thứ"]-ref_ngaybatdau.getDay()-1)
          }
          else
          {
            ref_ngaybatdau.setDate(ref_ngaybatdau.getDate()+7+val["Thứ"]-ref_ngaybatdau.getDay()-1)
          }
          if(ref_ngaybatdau>ref_ngayketthuc)
            continue;
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

        let ngaybatdau = new Date(v['Ngày Bắt Đầu'])
        let stringngaybatdau =("0"+ngaybatdau.getDate()).slice(-2)+"/"+("0"+(ngaybatdau.getMonth()+1)).slice(-2)+"/"+ngaybatdau.getFullYear();
        let ngayketthuc = new Date(v['Ngày Kết Thúc'])
        let stringngayketthuc =("0"+ngayketthuc.getDate()).slice(-2)+"/"+("0"+(ngayketthuc.getMonth()+1)).slice(-2)+"/"+ngayketthuc.getFullYear();
        infoLich.ngaybatdau = "Ngày Bắt Đầu: "+stringngaybatdau;
        infoLich.ngayketthuc="Ngày Kết Thúc: "+stringngayketthuc;
        //infoLich
        break;
      }
    }
    if(e.target.dataset.v.endsWith("@"))
    {
      infoLich.lop += " - " +e.target.dataset.v.split('!')[0]
      infoLich.ngaybatdau="";
      infoLich.ngayketthuc="";
      for(let v of this.props.arrayChangedSchedule)
      {
        
       
        if(v.malop == e.target.dataset.v.split('!')[0]&&
          v.giobatdautruocdo == e.target.dataset.v.split('!')[1]&&
          ((new Date (v.ngaytruocdo)).getDay()+1)==e.target.dataset.v.split('!')[2])
        {
          let gio = parseInt(parseInt(v.giobatdautruocdo)/2) +6;
          let phut= parseInt(v.giobatdautruocdo)%2?"30":"00"
          let giotruocdo = ("0"+gio).slice(-2)+":"+phut

          let gio2 = parseInt(parseInt(v.giobatdauchuyentoi)/2) +6;
          let phut2= parseInt(v.giobatdauchuyentoi)%2?"30":"00"
          let giochuyentoi = ("0"+gio2).slice(-2)+":"+phut2

          let ngaybatdau = new Date(v.ngaychuyentoi)
          let stringngaybatdau =("0"+ngaybatdau.getDate()).slice(-2)+"/"+("0"+(ngaybatdau.getMonth()+1)).slice(-2)+"/"+ngaybatdau.getFullYear();
          let ngayketthuc = new Date(v.ngaytruocdo)
          let stringngayketthuc =("0"+ngayketthuc.getDate()).slice(-2)+"/"+("0"+(ngayketthuc.getMonth()+1)).slice(-2)+"/"+ngayketthuc.getFullYear();

          infoLich.ngaybatdau +="Mới: "+ stringngaybatdau +"-"+giochuyentoi+"!";
          infoLich.ngaybatdau +="Cũ: "+stringngayketthuc+"-"+giotruocdo+"!";
          
        }
      }
      infoLich.ngayketthuc="Cảnh báo: Nếu bỏ sẽ mất hết các lịch thay đổi của ngày này.";
      
    }
    this.setState({tenlop:infoLich.ten+" - "+infoLich.lop,ngaybatdau:infoLich.ngaybatdau,ngayketthuc:infoLich.ngayketthuc,showInfo:true})

  }
  dropclass(e)
  {
    let value =  this.state.value
    
    console.log("dropclass");
    if((e.target.dataset.v+'@') != value)
    {
      
      
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
            dragging:true,
            showDrag:false,
          };
        });
      }.bind(this),0.2)
      
      setTimeout(function(){
        this.props.popupon();
      }.bind(this),3)
      
    }
  }
  drop(e)
  {     
    console.log("drop");
    
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
            isSwitchwClass:false,
            dragging:true,
            showDrag:false,
          };
        });
      }.bind(this),0.2)
      setTimeout(function(){
       
        this.props.popupon();
      }.bind(this),3)
    
   
  }
  dragStart(e)
  {
    console.log("dragStart");
    
    
    //  for(let i = 0;i<e.target.dataset.v.split('!')[1];i++)
    //  {
    //      let temp = document.createElement("TR");
    //      let att = document.createAttribute("class");       // Create a "class" attribute
    //      att.value = style.trshadow;                           // Set the value of the class attribute
    //      temp.setAttributeNode(att);  
    //      document.getElementById("dragShadow").appendChild(temp);
    //      for(let j=0;j<1;j++)
    //      {
    //       let yourclass = classnames({
    //       [style.rowshadow]: 'rowshadow',
    //       [style.rowisbusy]: 'rowisbusy',
    //       });
    //       let temp1 = document.createElement("TD");
        
    //       let att = document.createAttribute("class");       // Create a "class" attribute
    //       att.value = yourclass;                           // Set the value of the class attribute
    //       temp1.setAttributeNode(att);
          
    //       temp.appendChild(temp1);
    //       if (i==0)
    //       temp1.appendChild(document.createTextNode(e.target.dataset.v.split('!')[0]));
    //      }
    //  }
    //  
    console.log(e.target.dataset.v.split('!')[1]);
    console.log(e.target.dataset.v.split('!')[0]);
    
    let callback =[];
    let yourclass = classnames({
        [style.rowshadow]: 'rowshadow',
        [style.rowisbusy]: 'rowisbusy',
        });
    for(let i = 0;i<e.target.dataset.v.split('!')[1];i++)
    {
        let label=""
        let temp;
        if (i==0)
        {
          let height = 20*parseInt(e.target.dataset.v.split('!')[1])-15
          label = e.target.dataset.v.split('!')[0];
          temp = <tr key = {i} class ={yourclass} style={{"height":height+"px"}}>
                  <th key ={i+10}>{label}</th>            
              </tr>
        }
        
        callback.push(temp)
    }
    console.log(callback);
    
      e.dataTransfer.setDragImage(document.getElementById("dragShadow"), 0, 0);
     console.log("shadow");
     let lenght = e.target.dataset.v.split('!')[1];
     let locatex = parseInt(e.target.dataset.locatex);
     let locatey = parseInt(e.target.dataset.locatey);
     
     let rowscallback = [...this.state.rows];
     let _rowsbackup = JSON.parse(JSON.stringify(this.state.rows));
    
     
     
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
        showDrag:true,
        callback_dragshadow:callback,
      };
    });
    console.log("setstate");
   
    
    
  }
  dragging(e)
  {
    
    // let temp = "width: 100%;position:fixed;top:"+(e.nativeEvent.clientY+5)+"px;left:"+(e.nativeEvent.clientX+5-20)+"px";
    // document.getElementById("dragShadow").setAttribute("style",temp)
    console.log(e.nativeEvent.pageX,e.nativeEvent.pageY);
    if (skip == 5)
    {
      this.setState({pageXY:{X:e.nativeEvent.pageX,Y:e.nativeEvent.pageY}});
      skip = 0;
    }
    skip++
    
    
  }
  dragEnd(e)
  {
    console.log("dragEnd");
    
    document.getElementById("dragShadow").innerHTML="";
    let _rowsbackup = JSON.parse(JSON.stringify(this.state._rows));
    this.setState(function(state, props) {
      return {
        rows: _rowsbackup,
        showDrag:false,
        dragging:false,
      };
    });
  }
   
    
    /* this.setState(function(state, props) {
      return {
        rows:state._rows.slice()
      };
    }); */ 
  
  allowDrop(e)
  {
    
      e.preventDefault();
    
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
        <table   style={{'width': '100%','-webkit-user-select': 'none'}} >
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
                          gio={i} 
                          tieude={index}
                          locatex ={index}
                          locatey = {i}
                          cellisclick={false}
                          disablechoose={disable_choose} 
                          allowdrop = {allowdrop}
                          ondrop = {this.drop}
                          onChangeDelete = {this.props.onChangeEdit!=null?this.props.onChangeEdit.bind(this):null}
                          calendar={this}
                          >
                          {v}
                        </Cell>
                      );
                    } else {//Cell chua phong day
                      let yourclass;
                      let value;
                      let draggable;
                      let locatex;
                      if (!v.endsWith('!')) {
                        yourclass = classnames({
                          [style.row]: 'row',
                          [style.rowisbusy]: 'rowisbusy',
                        });
                        value = null;
                        locatex = index - parseInt(v.split('!')[2])
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
                        locatex =index
                        draggable ="true";
                      }
                      if (this.props.action == 'edit' && v.split('!')[0] == this.props.data['Mã Lớp']&&!v.endsWith("@")) {
                        return (
                          <Cell key={i} gio={i} tieude={index} cellisclick={true}  onChangeEdit = {this.props.onChangeEdit.bind(this)} calendar ={this}></Cell>
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
                          data-locatex={locatex}
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
        
                          
                        <Cell key={i} 
                              gio={i} 
                              tieude={index} 
                              cellisclick={true} 
                              data-v ={v} value={v}
                              onMouseEnter = {this.onMouseEnter.bind(this)}
                              onChangeDelete = {this.props.onChangeEdit.bind(this)}
                              onMouseMove = {this.onMouseMove.bind(this)}
                              calendar={this}
                              ></Cell>
                        )
                         
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
        <div style ={{"float":"right"}}>
        <label  style ={{"width":"25%"}} for="check_box_infoshadow">Hiện thị thông tin:</label><input style ={{"position":"relative","float":"right","top":"0px"}} type="checkbox" id="check_box_infoshadow" />
        </div>
        {
          (function(){
            if(this.state.showInfo&&!this.state.dragging&&this.state.isShowInfo)
            {
              return(<InfoShadow 
                      ten ={this.state.tenlop} 
                      ngaybatdau = {this.state.ngaybatdau}
                      ngayketthuc= {this.state.ngayketthuc}
                      pageXY = {this.state.pageXY}
                      suicide ={this.setState.bind(this,{showInfo:false})}/>
                    );
            }
            if(this.state.showDrag)
            {
              
              return(<DragShadow
                      pageXY = {this.state.pageXY}
                      v={this.state.value}
                      callback ={this.state.callback_dragshadow}
                      />)
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
