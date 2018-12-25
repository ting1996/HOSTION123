import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';
// import store from 'store';
import style from '../style.css';
import mystyle from './style.css';
import Button from '../elements/Button';
import Table from '../elements/Table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch,
} from '@fortawesome/free-solid-svg-icons';

class DangKyMonHoc extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            header: null,
            data: null,
            btnAllDisable: false,
            btnCloseDisable: false,
            btnAgreeDisable: false,
        }
        this.callBackDataFormDatabase = this.callBackDataFormDatabase.bind(this);
        this.SocketEmit = this.SocketEmit.bind(this);
        this.changeSize = this.changeSize.bind(this);
        this.search = this.search.bind(this);
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
                    case 'form_hoadon_nohocphi_getInformation': {
                            console.log(rows);
                        
                            if (rows[0] != null) {
                                let header = [];
                                for (let key in rows[0]) {
                                    if (rows[0].hasOwnProperty(key)) {
                                        let type = 'string';
                                        if (key.split(' ')[0] == 'Ngày') {
                                            type = 'date'
                                        }
                                        header.push({
                                            label: key,
                                            columnName: key,
                                            type: type,
                                        });                                    
                                    }
                                }
                                this.setState({
                                    header: header,
                                    data: rows,
                                })
                            } else {
                                this.props.dispatch({
                                    type: 'ALERT_NOTIFICATION_ADD',
                                    content: 'Không tìm thấy nợ học phí!',
                                    notifyType: 'warning',
                                })
                            }
                        }
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
        let date = new Date();
        date.setDate(1);
        this.refs.ngaytoihan.value = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
        this.updateData(date);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.changeSize);
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentDidUpdate(prevProps, prevState) {
        this.changeSize();
    }

    dongy () {

    }

    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    }

    render () {
        return (
            <div className={style.formstyle} ref="background">
                <div className="form_body" ref="body" style={{'width':'1100px'}}>
                    <div className="header">
                        { /*<img src="" alt="Icon Image"/> */}
                        <h2>Nợ Học Phí</h2>
                    </div>
                    <div className="body">
                        <div>
                            <div>
                                <div 
                                    className="divformstyle"
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'auto 200px 50px',
                                    }}
                                >
                                    <div className="middleDiv">
                                        <input type='text' placeholder="Nhập tên khách hàng cần tìm..." ref='hovaten' onKeyPress={(e) => {
                                            if (e.which == 13) {
                                                this.search();
                                            }
                                        }}/>
                                    </div>
                                    <div className="middleDiv">
                                        <input type='date' ref='ngaytoihan' onKeyPress={(e) => {
                                            if (e.which == 13) {
                                                this.search();
                                            }
                                        }}/>
                                    </div>
                                    <div 
                                        className={mystyle.buttonFilter + ' middleDiv'}
                                        onClick={this.search}
                                    >
                                        <FontAwesomeIcon icon={faSearch}/>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="unsetdivformstyle">
                                    <Table
                                        header={this.state.header}
                                        data={this.state.data}
                                        information
                                        style={{
                                            height: '600px',
                                        }}
                                        styleHeader={{}}
                                        styleContent={{}}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="footer">
                        <Button 
                            onClick={this.close.bind(this)}
                            value="Thoát"
                            icon="close"
                            style={{'float': 'right', 'margin-right': '10px',}}
                            disabled={this.state.btnAllDisable | this.state.btnCloseDisable}
                        />
                    </div>
                </div>
            </div>
        )
    }

    updateData (date, hovaten) {
        if (date != null) {
            let limit = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
            let query = 'SELECT USERS.`User ID`, ' +
            'USERS.`Họ Và Tên`, ' +
            'USERS.`Lớp`, ' +
            'USERS.`Tên Trường`, ' +
            'USERS.`Số Điện Thoại`, ' +
            'tb.`Cuối Chu Kỳ` AS `Ngày Tới Hạn`, ' +
            'USERS.`Cơ Sở` ' +
            'FROM USERS ' +
            'LEFT JOIN (SELECT tb1.* ' +
            'FROM (SELECT * FROM BIENLAIHOCPHI WHERE `Ngày Hủy Phiếu` IS NULL AND `Nội Dung` NOT LIKE \'@@@%\') AS tb1 ' +
            'LEFT JOIN (SELECT * FROM BIENLAIHOCPHI WHERE `Ngày Hủy Phiếu` IS NULL AND `Nội Dung` NOT LIKE \'@@@%\') AS tb2 ' +
            'ON (tb1.`User ID` = tb2.`User ID` ' +
            'AND tb2.`ID` > tb1.`ID`) ' +
            'WHERE tb2.`ID` IS NULL) as tb ON ' +
            '(tb.`User ID` = USERS.`User ID`) ' +
            'WHERE USERS.`Chính Thức` = \'1\' ' +
            'AND USERS.`Ngày Nghỉ Học` IS NULL ';
            // 'WHERE !EXISTS (SELECT * FROM BIENLAIHOCPHI ' +
            // 'WHERE BIENLAIHOCPHI.`Cuối Chu Kỳ` >= \'!\?!\' ' +
            // 'AND BIENLAIHOCPHI.`Ngày Hủy Phiếu` IS NULL ' +
            // 'AND BIENLAIHOCPHI.`Nội Dung` !LIKE \'@@@%\' ' +
            // 'AND USERS.`User ID` = BIENLAIHOCPHI.`User ID`) ' +
        
            // 'AND USERS.`Cơ Sở` = \'!\?!\' ';
            // if (hovaten != null && hovaten != '') {
            //     query += 'AND USERS.`Họ Và Tên` LIKE \'%!\?!%\' '.replace('!\?!', hovaten);
            // }
            // query = query.replace('!\?!', limit);
            // query = query.replace('!\?!', $('.khuvuc').attr('value'));
            // query += 'ORDER BY tb.`Cuối Chu Kỳ` ASC '
            console.log(query);
            
            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                fn : 'form_hoadon_nohocphi_getInformation',
            });
        }
    }

    search () {
        let date = new Date();
        if (this.refs.ngaytoihan.value != '') {
            date = new Date(this.refs.ngaytoihan.value);
        }
        this.updateData(date, this.refs.hovaten.value.trim());
    }
}

module.exports = connect(function (state) {
    return {
      socket: state.socket,
    };
}) (DangKyMonHoc);
