import React from 'react';
import { connect } from 'react-redux';

class Table extends React.Component{
  constructor (props) {
    super(props);
    this.state = {
      colummn: [ 'ID' , 'Họ Và Tên' , 'Quyền Hạn' , 'Cơ Sở' , 'Kích Hoạt' , 'Hình Ảnh', 'Loại Quản Lý' ],
      rows: [ ]
    };
  }

  componentDidMount () {
    var that = this;
    var socket = this.props.socket;

    var query = 'SELECT * FROM quanlyhocsinh.ACCOUNT';
    socket.emit('gui-query-den-database', query, 'accountmanager', 'loadtable');

    socket.on('tra-ve-du-lieu-reactjs', function (rows, hanhdong, dulieuguive) {
      if (hanhdong == 'accountmanager' && dulieuguive == 'loadtable') { 
        rows.forEach(function(row, index) {
          let arr = [];
          for (var key in row) {
            arr = arr.concat(row[key]);
          }
          that.setState({ rows: that.state.rows.concat({ [index]: arr }) });
        }); 
      };
    });
    
  }

  componentWillUnmount() {
    this.props.socket.off('tra-ve-du-lieu-reactjs');
  }

  render () {
    return (
      <table>
        <tr>
          {this.state.colummn.map((e, i) => (
            <th key={i}>{e}</th>
          ))}
        </tr>
        {this.state.rows.map((value, index) => (
          <tr key={index}>{value[index].map((v, i) => (
              <td key={i}>{v}</td>
          ))}</tr>
        ))}
      </table>
    );
  }
};

module.exports = connect(function (state) {
  return {
    socket: state.socket,
  };
}) (Table);
