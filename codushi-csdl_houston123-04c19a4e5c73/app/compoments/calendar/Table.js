import React from 'react';
import { connect } from 'react-redux';
import style from './style.css';
import classnames from 'classnames';
import Cell from './Cell.js';
import Error from './Error.js'

let time_countdown2 = 0;
function thongbaothanhcong() {
    $('.successed_function').show();
    if ( time_countdown2 <= 0 ) {
        time_countdown2 = 2;
        var timer2 = setInterval(function() {
            time_countdown2--;
            if (time_countdown2 < 0) {
                clearInterval(timer2);
                $('.successed_function').hide();
                // ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
            }
        }, 500);
    } else {
        time_countdown2 = 2;
    }
}


class Table extends React.Component{
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
    };
  }

  componentDidMount () {
    let that = this;
    let socket = this.props.socket;

    let today = new Date();
    y = today.getFullYear();
    m = ("0" + (today.getMonth() + 1)).slice(-2);
    d = ("0" + today.getDate()).slice(-2);
    this.setState({
      today: (y + "-" + m + "-" + d)
    });

    //let fist = today.getDate() - today.getDay();
    //let cn = new Date(today.setDate(fist));
    //let temp = this.state.column;
    // for (let i = 1; i < 8; i++) {
    //   temp[i] += (new Date(today.setDate(fist + i - 1))).getDate() + '-' + ((new Date(today.setDate(fist + i - 1))).getMonth() + 1);
    //   this.setState({
    //     column: temp
    //   });
    // }

    $('.select_danhsachgiaovien').on('change', function () {
      //Reset lich
      that.setState({
        rows: [],
        information: [],
      });
      let x = 0;
      for (let index = 6; index < 24; index++) {
        let hours = ("0" + index).slice(-2) + ' : 00';
        let arr = [hours, ];
        for (let i = 1; i < 8; i++) {
          arr = arr.concat('');
        }
        that.setState({ rows: that.state.rows.concat({ [x]: arr }) });
        hours = ("0" + index).slice(-2) + ' : 30';
        arr = [hours, ];
        for (let i = 1; i < 8; i++) {
          arr = arr.concat('');
        }
        that.setState({ rows: that.state.rows.concat({ [x + 1]: arr }) });
        x = x + 2;
      }

      //Giao vien duoc chon
      //Load thoi khoa bieu dua tren email giao vien
      var email = $(this).find('option:selected')[0].getAttribute('content');
      email = email.toLocaleLowerCase();
      if (email != '') {
        $('.select_danhsachgiaovien').prop('disabled', true);
        if (that.refs.datechoose != null) {
          that.refs.datechoose.reset();
          $('.modal-themlophoc input[name="ngaybatdau"]').prop('disabled', true);
          $('.modal-themlophoc input[name="ngayketthuc"]').prop('disabled', true); 
        }
        socket.emit('googleapi', {
          function: 'laylichgiaovien',
          calendarname: [
            'Mầm Non',
            'Lớp 01',
            'Lớp 02',
            'Lớp 03',
            'Lớp 04',
            'Lớp 05',
            'Lớp 06',
            'Lớp 07',
            'Lớp 08',
            'Lớp 09',
            'Lớp 10',
            'Lớp 11',
            'Lớp 12',
            'Đi Làm',
          ],
          email: email,
          key: 'calendar_laylichgiaovien',
        });
      } else {
        that.setState({error: 'Vui lòng liên hệ admin để kiểm tra lại Houston Calendar! \nLỗi xảy ra: \n---Giáo viên không có email vui lòng cập nhật email---'});
      }
    });

    socket.on('googleapicallback', function (key, data) {
      $('.select_danhsachgiaovien').prop('disabled', false);
      $('.modal-themlophoc input[name="ngaybatdau"]').prop('disabled', false);
      $('.modal-themlophoc input[name="ngayketthuc"]').prop('disabled', false);
      that.setState({error: ''});
      switch (key) {
        case 'calendar_laylichgiaovien':
          that.setState({data: data});
          if (data.email.length > 0) {
            let today = new Date();
            let fist = today.getDate() - today.getDay();
            let lastday = new Date(today.setDate(fist + 6));
            lastday.setHours(23);
            lastday.setMinutes(59);
            for (const i of data.email) {
              let start = new Date(Date.parse(i.start.dateTime));
              if (start <= lastday) {
                // console.log(i);
                let end = new Date(Date.parse(i.end.dateTime));
                let thu = () => start.getUTCDay() + 1;
                var rowscallback = that.state.rows;
                var offset= -6;
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
                    rowscallback[index][index][thu()] = ' ';
                }
                rowscallback[startrow][startrow][thu()] = i.summary;
                that.setState({
                  rows: rowscallback,
                  information: that.state.information.concat({ [i.summary]: i.description }),
                });
              }
            }
          }
          break;
        case 'calendar_themlophoc':
          if (data == 'done') {
            let ma_lop = that.state.malop;
            if (ma_lop != '') {
              let query = 'DROP TABLE IF EXISTS `quanlyhocsinh`.`?`; '+
              'CREATE TABLE ? ( '+
                  '`STT` INT NOT NULL AUTO_INCREMENT, '+
                  '`User ID` VARCHAR(10) NOT NULL, '+
                  '`Năm` INT NOT NULL, '+
                  '`Tháng` INT NOT NULL, '+
                  '`Tuần 1` INT NULL, '+
                  '`Tuần 2` INT NULL, '+
                  '`Tuần 3` INT NULL, '+
                  '`Tuần 4` INT NULL, '+
                  '`Nhận Xét` VARCHAR(500) NULL, '+
                  'PRIMARY KEY (`STT`), '+
                  'CONSTRAINT `user_id_?` '+
                      'FOREIGN KEY (`User ID`) '+
                      'REFERENCES `quanlyhocsinh`.`USERS` (`User ID`) '+
                      'ON DELETE NO ACTION '+
                      'ON UPDATE CASCADE '+
              ') '+
              'ENGINE = InnoDB '+
              'DEFAULT CHARACTER SET = utf32 '+
              'COLLATE = utf32_unicode_ci;';
              query = query.replace(/\?/g, ma_lop);
              socket.emit('gui-query-den-database' , query , 'them' , {
                isReload : false, 
                transaction: true,
                transactioncommit: true,
              });

              var x = $('.modal-themlophoc .danhsachduocchon').children();
              for (var i = 0; i < x.length; i++) {
                  query = 'INSERT INTO `quanlyhocsinh`.`DANHSACHHOCSINHTRONGLOP_?` (`User ID`, `Mã Lớp`) VALUES (\'' + x[i].getAttributeNode('value').value + '\', \'' + ma_lop + '\')';
                  query = query.replace('?', $('.khuvuc').attr('value'));
                  if ($('#texttenbang').attr('value').split('_')[0] == 'LOPHOC') {
                    socket.emit('gui-query-den-database' , query , 'them');
                  } else {
                    socket.emit('gui-query-den-database' , query , 'them' , { isReload : false, });
                  }
              }

              alert('Đã thêm lịch học lên google calendar!');
              $('.modal-themlophoc input[type="button"]').prop('disabled', false);
              document.getElementById('myform_them_lop_hoc').reset();
              $('.modal-themlophoc').hide();
              $('.loading').hide();
              thongbaothanhcong();
            }            
          }
          break;
        default:
          alert('Lỗi houston_calendar: \n' + data.error);
          $('.modal-themlophoc input[type="button"]').prop('disabled', false);
          socket.emit('huy-query');
          that.setState({error: 'Vui lòng liên hệ admin để kiểm tra lại Houston Calendar! \nLỗi xảy ra: \n---' + data.error + '---'});
          break;
      }
    });

    socket.on('tra-ve-du-lieu-tu-database', function (rows, hanhdong, dulieuguive) {
      if (hanhdong == 'laydulieu_trave' && dulieuguive != null) {
        switch (dulieuguive.fn) {
          case 'themlophoc_laymalop':
            var ma_lop = '';
            for (var variable in rows[0]) {
              if (rows[0].hasOwnProperty(variable)) {
                ma_lop = rows[0][variable];
              }
            }
    
            if (ma_lop != '') {
              that.setState({ malop: ma_lop });
              let calendarname = that.state.lop;
              let email = that.state.email;
              let coso = $('.khuvuc').attr('value');
              let ngaybatdau = $('.modal-themlophoc input[name="ngaybatdau"]').val();
              let ngaykethuc = $('.modal-themlophoc input[name="ngayketthuc"]').val();
              let startTime = new Date(ngaybatdau);
              startTime.setHours(0, 0, 0, 0);
              let endTime = new Date(ngaykethuc);
              endTime.setHours(23, 59, 59, 0);
              $('.loading').show();
              socket.emit('googleapi', {
                function: 'themlophoc',
                calendarname: [calendarname, ],
                mamon: ma_lop,
                coso: coso,
                email: email,
                objadd: that.state.objadd,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                key: 'calendar_themlophoc',
              });
            }
            break;
          default:            
        }
      }
    });

    $('.modal-themlophoc #btncompletedregister').click(function () {      
      if (that.state.error == '') {
        $('.modal-themlophoc input[type="button"]').prop('disabled', true);
        let ma_giao_vien = $('.select_danhsachgiaovien').val();
        if (ma_giao_vien != '') {
          let ngaybatdau = $('.modal-themlophoc input[name="ngaybatdau"]').val();
          let ngaykethuc = $('.modal-themlophoc input[name="ngayketthuc"]').val();
    
          let checkcalendar = false;
          if (ngaybatdau != '' && ngaykethuc != '') {
            let startTime = new Date(ngaybatdau);
            let endTime = new Date(ngaykethuc);
            endTime.setHours(23);
            endTime.setMinutes(59);
            if (startTime < endTime) {
              let a = {};
              let objadd = {};
              let endwhile = true;
              let offset = 0;
              while (true) {
                for (let i of $('.cellisclick')) {
                  endwhile = false;
                  let gio;
                  let phut;
                  let rowindex = i.parentElement.rowIndex - 1;
                  if ((rowindex % 2) == 0) {
                    gio = Math.floor(rowindex / 2) + 6;
                    phut = 0;
                  } else {
                    gio = Math.floor(rowindex / 2) + 6;
                    phut = 30;
                  }
                  let thu = i.cellIndex;
                  let th = new Date();
                  th.setDate((new Date().getDate()) - (new Date().getDay() - (thu - 1)) + offset);
                  
                  if (th > endTime) {
                    endwhile = true;
                    break;
                  }
    
                  if (th > startTime) {
                    if (a[thu + '' + offset + '0'] == null) {
                      th.setHours(gio, phut, 0, 0);
                      a[thu + '' + offset + '0'] = th.toISOString();
                      th.setHours(gio, phut + 30, 0, 0);
                      a[thu + '' + offset + '1'] = th.toISOString();
                    } else {
                      th.setHours(gio, phut + 30, 0, 0);
                      a[thu + '' + offset + '1'] = th.toISOString();
                    }
                  }
    
                  /**
                   * get time at to google calendar
                  */
                  
                  if (offset == 0) {
                    if (objadd[thu + '0'] == null) {
                      th.setHours(gio, phut, 0, 0);
                      objadd[thu + '0'] = th.toLocaleTimeString('en-GB');
                      th.setHours(gio, phut + 30, 0, 0);
                      objadd[thu + '1'] = th.toLocaleTimeString('en-GB');
                    } else {
                      th.setHours(gio, phut + 30, 0, 0);
                      objadd[thu + '1'] = th.toLocaleTimeString('en-GB');
                    }
                  }
                }
    
                offset = offset + 7;
                if (endwhile) {
                  break;
                }
              }

              let objcheck = {};
              for (let i of that.state.data.email) {
                let start = new Date(i.start.dateTime);
                start.setMinutes(1, 0, 0);
                let end = new Date(i.end.dateTime);
                end.setMinutes(-1, 0, 0);
                for (let key in a) {
                  if (key.endsWith('0')) {                
                    let value = key;
                    let vstart = new Date(a[key]);
                    vstart.setMinutes(0, 0, 0);
                    value = key.slice(0, key.length - 1) + '1';
                    let vend = new Date(a[value]);
                    vend.setMinutes(0, 0, 0);
    
                    if (
                      (vstart < start && start < vend)
                      || (vstart < end && end < vend)
                      || (start < vstart && vstart < end)
                    ) {
                      start.setMinutes(0, 0, 0);
                      end.setHours(end.getHours() + 1);
                      end.setMinutes(0, 0, 0);
                      objcheck.start = start;
                      objcheck.end = end;
                      objcheck.data = i;
                      objcheck.value = new Date(a[key]);
                      checkcalendar = true;
                      break;
                    }
                  }
                }
    
                if (checkcalendar)
                  break;
              }
              
              let lophoc = 'Lớp ' + ("0" + $('.modal-themlophoc select[name=\'Lớp\']').val()).slice(-2);
              if ($('.modal-themlophoc select[name=\'Lớp\']').val() == 0) {
                lophoc = 'Mầm Non';
              } else if ($('.modal-themlophoc select[name=\'Lớp\']').val() == 13) {
                lophoc = 'Đi Làm';
              }

              if (checkcalendar) {
                alert('Trung buoi ' + objcheck.value.toLocaleTimeString() + ' voi mon ' + objcheck.data.summary + '\nbat dau luc ' + objcheck.start.toLocaleString() + ' ket thuc luc ' + objcheck.end.toLocaleString());
                $('.modal-themlophoc input[type="button"]').prop('disabled', false);
              } else {
                that.setState({
                  objadd: objadd,
                  lop: lophoc,
                  email: $('.select_danhsachgiaovien').find('option:selected')[0].getAttribute('content'),
                });
                let ma_mon_hoc = $('.select_danhsachmonhoc').val();
                    ma_mon_hoc += ("0" + $('.modal-themlophoc select[name=\'Lớp\']').val()).slice(-2);                
                let query = 'INSERT INTO `quanlyhocsinh`.`LOPHOC_' + $('.khuvuc').attr('value') + '` (`Mã Môn Học`, `Mã Giáo Viên`) VALUES (\'' + ma_mon_hoc + '\', \'' + ma_giao_vien + '\')';
                let data_send = 'SELECT `Mã Lớp` FROM quanlyhocsinh.LOPHOC_' + $('.khuvuc').attr('value').split(' ') + ' WHERE `Mã Môn Học` = \'' + ma_mon_hoc + '\' AND `Mã Giáo Viên` = \'' + ma_giao_vien + '\' ORDER BY `Mã Lớp` DESC LIMIT 1';
                socket.emit('gui-query-den-database', query, 'them', { 
                  function : ['lay_ma_lop'] , 
                  data : data_send,
                  transaction: true,
                });
              }
            } else {
              alert('Ngay bat dau phai lon hon ngay ket thuc');
              $('.modal-themlophoc input[type="button"]').prop('disabled', false);
            }
          } else {
            if (ngaybatdau == '') {
              $('.modal-themlophoc input[name="ngaybatdau"]').css('border-color', 'red');
            } else {
              $('.modal-themlophoc input[name="ngaybatdau"]').css('border-color', '#ccc');
            }
            if (ngaykethuc == '') {
              $('.modal-themlophoc input[name="ngayketthuc"]').css('border-color', 'red');
            } else {
              $('.modal-themlophoc input[name="ngayketthuc"]').css('border-color', '#ccc');
            }
            $('.modal-themlophoc input[type="button"]').prop('disabled', false);
          }
        } else {
          alert("Vui lòng chọn giáo viên!");
          $('.modal-themlophoc input[type="button"]').prop('disabled', false);
        }
      } else {
        $('.modal-themlophoc').hide();
      }
    });
  }

  render () {
    var xhtml = this.state.error != '' ? <Error error={this.state.error}/> : 
      <div>
        <div>
          <form ref='datechoose'>
            Ngày bắt đầu: <input name='ngaybatdau' style={{width: '32%'}} type="date" min={this.state.today}/>
            <div style={{float: 'right', width: '50%',}}>
              Ngày kết thúc: <input name='ngayketthuc' style={{width: '66%'}} type="date" min={this.state.today}/>
            </div>
          </form>
        </div>
        <table>
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
                    } else if (v == '') {
                      return (
                        <Cell key={i} tieude={index}>{v}</Cell>
                      );
                    } else {
                      let yourclass;
                      if (v == ' ') {
                        yourclass = classnames({
                          [style.row]: 'row',
                          [style.rowisbusy]: 'rowisbusy',
                        });
                      } else {
                        yourclass = classnames({
                          [style.row]: 'row',
                          [style.rowisbusy]: 'rowisbusy',
                          [style.covertext]: 'covertext',
                        });
                      }
                      return (
                        <td key={i} className={yourclass}>{v}</td>
                      );
                    }
                  })
                }
                </tr>
              );
            })
          }
        </table>
      </div>;
    return (
      <div>
        {xhtml}
      </div>
    );
  }
};

module.exports = connect(function (state) {
  return {
    socket: state.socket,
  };
}) (Table);
