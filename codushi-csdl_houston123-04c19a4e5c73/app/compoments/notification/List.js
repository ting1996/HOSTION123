import React from 'react';
import Note from './Note.js';
import { connect } from 'react-redux';
import style from './style.css';

class List extends React.Component{
  constructor (props) {
    super(props);
    this.state = { 
      content: [],
      reloadContent: [],
    };
    this.callBackDataFormDatabase = this.callBackDataFormDatabase.bind(this);
    this.callBackAllUpdate = this.callBackAllUpdate.bind(this);
  }

  callBackDataFormDatabase ( rows, hanhdong, dulieuguive ) {
    if (hanhdong == 'laydulieu_trave') {
        if (dulieuguive != null) {
            switch (dulieuguive.fn) {
              case 'notification_update':
                switch (dulieuguive.data) {
                  case 'chamsockhachhang':
                    for (let value of rows) {
                      let obj = { 
                        data : dulieuguive.data,
                        value : value,
                        permission : $('.permission').attr('value'),
                      };
                      this.setState({content : this.state.content.concat(obj)});
                    }
                    break;
                  case 'monhocduocquanly':
                    // let query = '';
                    // for (let value of rows) {
                    //   query += 'SELECT COUNT(*) AS `Số Học Sinh` , USERS.`Lớp`, MONHOC.* ' +
                    //   'FROM ((quanlyhocsinh.DANGKIMONHOC ' +
                    //   'LEFT JOIN quanlyhocsinh.USERS ON quanlyhocsinh.USERS.`User ID` = quanlyhocsinh.DANGKIMONHOC.`User ID`) ' +
                    //   'LEFT JOIN quanlyhocsinh.MONHOC ON MONHOC.`Mã Môn Học` = \'?\') ' +
                    //   'WHERE quanlyhocsinh.DANGKIMONHOC.`?` = \'1\' AND quanlyhocsinh.USERS.`Cơ Sở` = \'?\' ' +
                    //   'GROUP BY quanlyhocsinh.USERS.`Lớp`; ';
                    //   query = query.replace( '?' , value['Mã Môn Học'] );
                    //   query = query.replace( '?' , value['Mã Môn Học'] );
                    //   query = query.replace( '?' , $('.khuvuc').attr('value') );
                    // }

                    // if (query != '') {
                    //   this.props.socket.emit('gui-query-den-database', query, 'laydulieu_trave', {
                    //     fn : 'notification_update',
                    //     data: 'hocsinhchuacolop',
                    //   });
                    // }
                    break;
                  case 'hocsinhchuacolop':
                    for (let val of rows) {
                      for (let value of val) {                 
                        let obj = { 
                          data: 'hocsinhchuacolop',
                          value: value,
                          permission: $('.permission').attr('value'),
                        };
                        this.setState({content : this.state.content.concat(obj)});
                      }
                    }
                    break;
                  case 'thongbaocongviec':
                    let khan = 0;
                    for (let val of rows) {
                      if (val.isRead == 0) {
                        let obj = { 
                          data: 'congviecmoi',
                          value: val,
                          permission: $('.permission').attr('value'),
                        };
                        this.setState({content : this.state.content.concat(obj)});
                        if (val.Level == 1) {
                          khan = khan + 1;
                        }
                      } else if (val.isRead == -1) {
                        let obj = { 
                          data: 'congviecduoccapnhat',
                          value: val,
                          permission: $('.permission').attr('value'),
                        };
                        this.setState({content : this.state.content.concat(obj)});
                      }
                    }
                    if (khan > 0) {
                      this.props.dispatch({
                          type: 'ALERT_NOTIFICATION_ADD',
                          content: 'Có !\?! công việc khẩn từ cấp trên!'.replace('!\?!', khan),
                          notifyType: 'information',
                      })
                    }
                    break;
                  default:
                }
                break;
              default:
            }
        }
    }
  }

  callBackAllUpdate (data) {
    if (data.isReloadNotification) {
      if (data.listIDsReloadNotification != null) {
        let IDs = data.listIDsReloadNotification;
        if (IDs.indexOf($('#lable_button_nexttoicon').attr('value')) != -1) {
          this.loadNotification();
        }
      }
    } else {
      this.loadNotification();
    }
  }

  loadNotification () {
    this.setState({
      content : [],
    });
    let query = '';
    switch ($('.permission').attr('value')) {
      case 'giaovien':
        // query = 'SELECT quanlyhocsinh.USERS.`User ID`, '+
        // 'quanlyhocsinh.USERS.`Họ Và Tên`, '+
        // 'quanlyhocsinh.CHAMSOCKHACHHANG_?.`Ý Kiến Của Phụ Huynh`, '+
        // 'quanlyhocsinh.CHAMSOCKHACHHANG_?.`Ý Kiến Của Nhân Viên Chăm Sóc`, '+
        // 'quanlyhocsinh.CHAMSOCKHACHHANG_?.`Mức Độ Ưu Tiên`, '+
        // 'quanlyhocsinh.CHAMSOCKHACHHANG_?.`ID` '+
        // 'FROM (quanlyhocsinh.CHAMSOCKHACHHANG_? '+
        // 'LEFT JOIN quanlyhocsinh.USERS ON quanlyhocsinh.USERS.`User ID` = quanlyhocsinh.CHAMSOCKHACHHANG_?.`User ID`) '+
        // 'WHERE quanlyhocsinh.CHAMSOCKHACHHANG_?.`Mã Giáo Viên` = \'~\' '+
        // 'AND quanlyhocsinh.CHAMSOCKHACHHANG_?.`Ý Kiến Phản Hồi Của Giáo Viên` IS NULL';
        // query = query.replace(/\?/g, $('.khuvuc').attr('value'));
        // query = query.replace('~', $('#lable_button_nexttoicon').attr('value'));

        // this.props.socket.emit('gui-query-den-database', query, 'laydulieu_trave', {
        //   fn : 'notification_update',
        //   data: 'chamsockhachhang',
        // });
        break;
      case 'quanly':
        query = '';
        // if ($('.permission').attr('content') != 'Chăm Sóc Khách Hàng' && $('.permission').attr('content') != 'Marketing') {
        //   query = 'SELECT quanlyhocsinh.USERS.`User ID`, '+
        //   'quanlyhocsinh.USERS.`Họ Và Tên`, '+
        //   'quanlyhocsinh.CHAMSOCKHACHHANG_?.`Ý Kiến Của Phụ Huynh`, '+
        //   'quanlyhocsinh.CHAMSOCKHACHHANG_?.`Ý Kiến Của Nhân Viên Chăm Sóc`, '+
        //   'quanlyhocsinh.CHAMSOCKHACHHANG_?.`Mức Độ Ưu Tiên`, '+
        //   'quanlyhocsinh.CHAMSOCKHACHHANG_?.`ID` '+
        //   'FROM (quanlyhocsinh.CHAMSOCKHACHHANG_? '+
        //   'LEFT JOIN quanlyhocsinh.USERS ON quanlyhocsinh.USERS.`User ID` = quanlyhocsinh.CHAMSOCKHACHHANG_?.`User ID`) '+
        //   'WHERE quanlyhocsinh.CHAMSOCKHACHHANG_?.`Mã Quản Lý` = \'~\' '+
        //   'AND quanlyhocsinh.CHAMSOCKHACHHANG_?.`Ý Kiến Phản Hồi Của Quản Lý` IS NULL';
        //   query = query.replace(/\?/g, $('.khuvuc').attr('value'));
        //   query = query.replace('~', $('#lable_button_nexttoicon').attr('value'));
  
        //   this.props.socket.emit('gui-query-den-database', query, 'laydulieu_trave', {
        //     fn : 'notification_update',
        //     data: 'chamsockhachhang',
        //   });

        //   query = 'SELECT * FROM quanlyhocsinh.MONHOC WHERE EXISTS (SELECT * FROM quanlyhocsinh.QUANLY WHERE `Chức Vụ` = quanlyhocsinh.MONHOC.`Quản Lý` AND `Mã Quản Lý` = \'?\')';
        //   query = query.replace( '?' , $('#lable_button_nexttoicon').attr('value') );
        //   this.props.socket.emit('gui-query-den-database', query, 'laydulieu_trave', {
        //     fn : 'notification_update',
        //     data: 'monhocduocquanly',
        //   });
        // }
        break;
      default:
        // query = 'SELECT TASKS.*, tb1.`staffCode`, tb1.`staffName`, tb1.`isRead`, tb1.`ID` AS `tasksAssignID`  FROM quanlyhocsinh.TASKS ' +
        // 'LEFT JOIN (SELECT TASKSASSIGN.*, QUANLY.`Họ Và Tên` AS `staffName` FROM quanlyhocsinh.TASKSASSIGN ' +
        // 'LEFT JOIN QUANLY ON QUANLY.`Mã Quản Lý` = TASKSASSIGN.staffCode AND TASKSASSIGN.isDeactivate = \'0\') AS tb1 ON TASKS.`ID` = tb1.`taskID` ' +
        // 'LEFT JOIN `QUANLY` ON `QUANLY`.`Mã Quản Lý` = `TASKS`.`From` ' +
        // 'LEFT JOIN `LOAICONGVIEC` ON `TASKS`.`Level` = `LOAICONGVIEC`.`ma` ' +
        // 'WHERE tb1.`staffCode` = \'!\?!\' ';
        // 'AND TASKS.`StartTime` <= NOW() ' +
        // 'AND TASKS.`EndTime` >= NOW() ' +
        // 'AND TASKS.`isDeactivate` = \'0\'; ';
        // query = query.replace('!\?!', $('#lable_button_nexttoicon').attr('value'));
        // this.props.socket.emit('gui-query-den-database', query, 'laydulieu_trave', {
        //   fn : 'notification_update',
        //   data: 'thongbaocongviec',
        // });
    }
  }

  componentDidMount () {
    var that = this;
    var socket = this.props.socket;
    this.setState({permission: $('.permission').attr('value')});

    // this.props.socket.on('all-notification-update', this.callBackAllUpdate);
    this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);

    this.loadNotification();
  }

  componentWillUnmount() {
    this.props.socket.off('all-notification-update', this.callBackAllUpdate);
    // this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
  }

  render () {
    if( this.state.content.length > 0 ) {
      return (
        <div className={style['notification-list']}>
          <div className={style['notification-header']}>
            <h1> Thông Báo </h1>
            <img src="img/notification.png" alt="notification-icon" />
            <a>{ this.state.content.length }</a>
          </div>
          <div className={style['notification-body']}>
            {
              this.state.content.map((e, i) => (
                <Note key={i} data={e.data} value={e.value} permission={e.permission}></Note>
              ))
            }
          </div>
        </div>
      );
    } else {
      return (
        <div hidden></div>
      );
    }
  }
};

module.exports = connect(function (state) {
  return {
    socket: state.socket,
  };
}) (List);
