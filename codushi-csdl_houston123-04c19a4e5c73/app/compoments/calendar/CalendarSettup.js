import React from 'react';
import style from './style.css';
import { connect } from 'react-redux';

var ReactDOM = require('react-dom');

class CalendarSettup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: '',
            status: '',
        };
    }

    componentDidMount () {
        let that = this;
        let socket = this.props.socket;

        $.get('/googleapi/checktoken')
        .done(data => {
            switch (data.status) {
                case 'OK':
                    this.setState({data: '', status: 'Đang được cấp phép!'});
                    break;
                case 'kocotoken':
                case 'loirefresh_token':
                    this.setState({data: data.data, status: 'Vui lòng cấp phép cho Houston Calendar!'});
                    break;
                default:
                    
            }         
        });

        socket.on('calendarsettup-react-successed', () => {
            that.setState({data: '', status: 'Cấp phép thành công!'});
        });
    }

    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('calendarsettup-react'));
    }

    authorization () {
        if (this.state.data != '') {
            window.open(this.state.data, '_blank', 'menubar=no, titlebar=no, toolbar=no, scrollbars=yes, width=600, height=800');   
        }
    }

    revoketoken () {
        var that = this;
        $.get('/googleapi/revoketoken').done((data) => {
            $.get('/googleapi/checktoken')
            .done(data => {
                switch (data.status) {
                    case 'OK':
                    case 'kocotoken':
                    case 'loirefresh_token':
                        that.setState({data: data.data, status: 'Thu hồi giấy phép thành công!'});
                        break;
                    default:
                        
                }         
            });
        });
    }

    render () {
        var xhtml = (this.state.data == '') ? <input type="button" onClick={this.revoketoken.bind(this)} value="Thu Hồi Mã Ủy Quyền"/> : <input type="button" onClick={this.authorization.bind(this)} value="Ủy Quyền Cho Houston Calendar"/>;
        return (
            <div className={style.backgroundsettup}>
                <div className="settup_body">
                    <div className="header">
                        <img src="/img/calendar.png" alt="Google Calendar"/>
                        <h2>Cài đặt Google Calendar</h2>
                    </div>
                    <div className="body">
                    {this.state.status}
                    {xhtml}         
                    <input type="button" onClick={this.close.bind(this)} value="Thoát"/>
                    </div>
                    <div className="footer">
                        
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
  }) (CalendarSettup);;