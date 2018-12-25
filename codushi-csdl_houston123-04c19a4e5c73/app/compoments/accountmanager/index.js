import React from 'react';
import Table from './Table.js';
var ReactDOM = require('react-dom');

class AccountManager extends React.Component{
  cancelregister() {
    ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
  }

  render () {
    return (
      <div className="modal-quanlymod" style={{"display": "block"}}>
        <div className="modal-content" style={{"width": "700px"}}>
          <div className="modal-header">
            <h2>Quản Lý Account</h2>
          </div>
          <div className="modal-body">
            <Table />
          </div>
          <div className="modal-footer">
            <input type="button" name="cancel_register" value="Thoát" className="btncancelregister" onClick={this.cancelregister.bind(this)}/>
          </div>
        </div>
        <div className="daithem">
        </div>
      </div>
    )
  }
};

module.exports = AccountManager;
