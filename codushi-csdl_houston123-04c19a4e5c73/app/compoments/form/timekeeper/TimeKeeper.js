import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';
// import store from 'store';
import style from '../style.css';
import Button from '../elements/Button';
import Table from '../elements/Table';

class TimeKeeper extends React.Component {
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
        this.changeDate = this.changeDate.bind(this);
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
                    case 'form_timekeeper_loadData': {
                        let header = [];
                        for (let key in rows[0]) {
                            let type = 'string';
                            let hidden = false;
                            if (key == 'time') {
                                type = 'datetime';
                            }     
                            if (key == 'image') {
                                type = 'image';
                            }
                            let minWidth = null;
                            
                            let obj = {
                                label: key,
                                columnName: key,
                                type: type,
                                hidden: hidden,
                                minWidth: minWidth,
                            }
                            header.push(obj);
                        }

                        this.setState({
                            header: header,
                            data: rows,
                        });
                    } break;
                    default:                        
                }                
            }
        }  
    }

    componentDidMount () {
        window.addEventListener("resize", this.changeSize);
        this.changeSize();
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
        let date = new Date();
        this.refs.timefilter.value = date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2);
        this.changeDate();
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.changeSize);
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentDidUpdate(prevProps, prevState) {
        this.changeSize();
    }

    changeDate () {
        let query = 'SELECT TIMEKEEPER.*, QUANLY.`Họ Và Tên` AS name FROM TIMEKEEPER ' +
        'LEFT JOIN QUANLY ON QUANLY.`Mã Quản Lý` = TIMEKEEPER.code ' +
        'WHERE (QUANLY.`Cơ Sở` = \'!\?!\' ' +
        'OR QUANLY.`Cơ Sở` LIKE \'%,!\?!%\' ' +
        'OR QUANLY.`Cơ Sở` LIKE \'%!\?!,%\' '
        query = query.replace(/!\?!/g, this.props.userInfo.branch);
        if (this.props.userInfo.khuvuc == 'ALL') {
            query += 'OR QUANLY.`Cơ Sở` = \'ALL\' ';
        }
        query += ') AND `time` LIKE \'%!\?!%\' ';
        query = query.replace('!\?!', this.refs.timefilter.value)
        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'form_timekeeper_loadData',
        });
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
                        <h2>Điểm Danh Hệ Thống</h2>
                    </div>
                    <div className="body">
                        <div>
                            <div>
                                <input 
                                    type="date"
                                    ref="timefilter" 
                                    onChange={(e) => {
                                        if (e.target.value == ''
                                        || e.target.value == null) {
                                            e.defaultPrevented();
                                            return;
                                        }
                                        this.changeDate();
                                    }}
                                />
                            </div>
                            <Table
                                header={this.state.header}
                                data={this.state.data}
                                isShowNumber
                                // onRowsRightClick={this.onTableRightClick.bind(this)}
                                style={{
                                    height: '600px',
                                }}
                                styleHeader={{}}
                                styleContent={{}}
                            />
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
                        {/* <Button 
                            onClick={this.dongy.bind(this)}
                            value="Đồng Ý"
                            icon="agree"
                            style={{'float': 'right', 'margin-right': '10px',}}
                            disabled={this.state.btnAllDisable | this.state.btnAgreeDisable}
                        /> */}
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
}) (TimeKeeper);
