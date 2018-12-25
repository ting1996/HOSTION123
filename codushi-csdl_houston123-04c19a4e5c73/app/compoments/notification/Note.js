import React from 'react';
import style from './style.css';
import { connect, Provider } from 'react-redux';

var ReactDOM = require('react-dom');
var store = require('store');

class Note extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
        obj: [],
        xhtml_color: '',
    }
  }

  componentDidMount () {
    let obj = this.props.value;
    this.setState({obj});

    switch (this.props.data) {
      case 'chamsockhachhang':
        if (obj['Mức Độ Ưu Tiên'] != undefined) {
          switch (obj['Mức Độ Ưu Tiên'] ) {
            case 'Khẩn Cấp':
              this.setState({xhtml_color: 'notification-note-khancap'});
              break;
            case 'Cần':
              this.setState({xhtml_color: 'notification-note-can'});
              break;
            case 'Không Cần':
              this.setState({xhtml_color: 'notification-note-khongcan'});
              break;        
            default:        
          }
        }
        break;
      case 'hocsinhchuacolop':
        break;
      case 'congviecduoccapnhat':
      case 'congviecmoi':
        if (obj['Level'] != undefined) {
          switch (obj['Level'].toString()) {
            case '1':
              this.setState({xhtml_color: 'notification-note-khancap'});
              break;
            case '0':
              this.setState({xhtml_color: 'notification-note-khongcan'});
              break;        
            default:        
          }
        }
        break;
      default:
    }
  }

  themnhanh () {
    let obj = this.state.obj;
    // console.log(obj);

    let LopHoc = require('../form/lophoc/LopHoc');
    ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    ReactDOM.render(
        <Provider store={store}>
            <LopHoc action="add" data={{mamonhoc: obj['Mã Môn Học'], lop: obj['Lớp']}}/>
        </Provider>,
        document.getElementById('form-react')            
    );
  }

  phanhoichamsockhachhang () {
    switch (this.props.permission) {
      case 'giaovien':
        let PhanHoiQuanLyKhachHang = require('../form/giaovien/phanhoiquanlykhachhang/PhanHoiQuanLyKhachHang');        
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
        ReactDOM.render(
          <Provider store={store}>
              <PhanHoiQuanLyKhachHang value={this.props.value}/>
          </Provider>
          , document.getElementById('form-react')
        );
        break;
      case 'quanly':
      let PhanHoiQuanLyKhachHang_QuanLy = require('../form/quanly/phanhoiquanlykhachhang_quanly/PhanHoiQuanLyKhachHang_quanly');
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
        ReactDOM.render(
          <Provider store={store}>
              <PhanHoiQuanLyKhachHang_QuanLy value={this.props.value}/>
          </Provider>
          , document.getElementById('form-react')
        );
        break;
      default:        
    }
  }

  doccongviec () {
    // let LopHoc = require('../form/lophoc/LopHoc');
    // ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    // ReactDOM.render(
    //     <Provider store={store}>
    //         <LopHoc action="add" data={{mamonhoc: obj['Mã Môn Học'], lop: obj['Lớp']}}/>
    //     </Provider>,
    //     document.getElementById('form-react')            
    // );
    let obj = this.props.value;
    let query = 'UPDATE `quanlyhocsinh`.`TASKSASSIGN` SET `isRead`=\'1\' WHERE `ID`=\'!\?!\';'
    query = query.replace('!\?!', obj['tasksAssignID']);
    this.props.socket.emit('gui-query-den-database', query , 'laydulieu_trave', {
      isReloadNotification: true,
      listIDsReloadNotification: [$('#lable_button_nexttoicon').attr('value')],
    });
  }

  content_html () {
    let obj = this.props.value;
    switch (this.props.data) {
      case 'chamsockhachhang':
        let ykienph = 'Phụ Huynh: ' + obj['Ý Kiến Của Phụ Huynh'].substr(0, 50);

        if (obj['Ý Kiến Của Phụ Huynh'].length > 50) {
          ykienph = ykienph + '...';
        }

        let ykienql = 'CSKH: ' + obj['Ý Kiến Của Nhân Viên Chăm Sóc'].split(' : ')[1].substr(0, 50);
        if (obj['Ý Kiến Của Nhân Viên Chăm Sóc'].length > 50) {
          ykienql = ykienql + '...';
        }

        return (
          <div>
            <a> {obj['Họ Và Tên']  + ' - ' + obj['User ID']} </a><br/>
            <a> {ykienph} </a><br/>
            <a> {ykienql} </a><br/>
            <a> {obj['Mức Độ Ưu Tiên']} </a><br/>
            <input type="button" onClick={this.phanhoichamsockhachhang.bind(this)} value="Phản Hồi"/>
          </div>
        );
        break;
      case 'hocsinhchuacolop':        
        return (
          <div>
            <a> {obj['Tên Môn']  + ' lớp ' + obj['Lớp']} </a><br/>
            <a> {obj['Số Học Sinh'] + ' học sinh cần được xếp lớp!'} </a><br/>
            <input type="button" onClick={this.themnhanh.bind(this)} value="Thêm Nhanh"/>
          </div>
        );
        break;
      case 'congviecmoi':
        let noidungcongvienmoi = 'Nội dung: ' + obj['Content'].substr(0, 100);
        if (obj['Content'].length > 100) {
          noidungcongvienmoi = noidungcongvienmoi + '...';
        }
        
        return (
          <div>
            <a><b><u>{obj['Title']}</u></b></a><br/>
            <a>{obj['Người giao việc']}</a><br/>
            <a>{noidungcongvienmoi}</a><br/>
            <a>{obj['Loại công việc']}</a><br/>
            <input type="button" onClick={this.doccongviec.bind(this)} value="Xem"/>
          </div>
        );
        break;
      case 'congviecduoccapnhat':
        let noidungcongviecduoccapnhat = 'Nội dung: ' + obj['Content'].substr(0, 100);
        if (obj['Content'].length > 100) {
          noidungcongviecduoccapnhat = noidungcongviecduoccapnhat + '...';
        }
        
        return (
          <div>
            <a><b><u>{'(Cập nhật) ' + obj['Title']}</u></b></a><br/>
            <a>{obj['Người giao việc']}</a><br/>
            <a>{noidungcongviecduoccapnhat}</a><br/>
            <a>{obj['Loại công việc']}</a><br/>
            <input type="button" onClick={this.doccongviec.bind(this)} value="Xem"/>
          </div>
        );
        break;
      default:        
    }
  }

  render () {
      return (
        <div className={[style['notification-note'], style[this.state.xhtml_color]].join(' ')} >
          { this.content_html() }
        </div>
    )
  }
};

module.exports = connect(function (state) {
  return {
    socket: state.socket,
  };
}) (Note);
