import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';
// import store from 'store';
import style from '../../style.css';
import TabPage from '../../elements/TabPage';
import Button from '../../elements/Button';
import mystyle from './style.css'

class Access extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            btnAllDisable: false,
            btnCloseDisable: false,
            btnAgreeDisable: false,
            listTables: [],
            listTypePermission: [],
        }
        this.callBackDataFormDatabase = this.callBackDataFormDatabase.bind(this);
        this.SocketEmit = this.SocketEmit.bind(this);
        this.changeSize = this.changeSize.bind(this);
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
                    case 'form_admin_access_load':                  
                        // for (let row of rows[1]) {
                        //     row.content =
                        //     
                        // }
                    
                        this.setState({
                            listTypePermission: rows[0],
                            listTables: rows[1],
                        })
                        break;
                    default:                        
                }
                
            }
        }  
    }

    componentDidMount () {
        let query;
        window.addEventListener("resize", this.changeSize);
        this.changeSize();
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);

        if (this.props.userInformation == null
            || this.props.userInformation.permission != 'admin') {
            this.close();
        } else {
            query = 'SELECT * FROM LOAIQUANLY; ' + 
            'SELECT * FROM menu; ';
            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                fn : 'form_admin_access_load',
            });
        }
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.changeSize);
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentDidUpdate(prevProps, prevState) {
        this.changeSize();
    }

    dongy () {
        let query = '';
        for (let table of this.state.listTables) {
            if (table.change) {
                query += 'UPDATE `menu` SET `permissionAllow` = \'!\?!\' WHERE (`id` = \'!\?!\'); '
                query = query.replace('!\?!', table.permissionAllow);
                query = query.replace('!\?!', table.id);
            }
        }
        if (query != '') {
            this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
                fn: 'form_admin_access_updatePer',
                isSuccess: true,
            });
            this.close();
        }
    }

    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    }

    render () {
        return (
            <div className={style.formstyle} ref="background">
                <div className="form_body" ref="body">
                    <div className="header">
                        { /*<img src="" alt="Icon Image"/> */}
                        <h2>Quyền Truy Cập</h2>
                    </div>
                    <div className="body">
                        <TabPage
                            onChange={this.changeSize}
                            pages={(() => {
                                let ele = this.state.listTables;
                                ele.map(row => {
                                    row.content = 
                                    <div>
                                        <div style={{
                                            height: '500px',
                                            overflowX: 'auto',
                                        }}>
                                            {
                                                this.state.listTypePermission.map(v => {
                                                    let check = false;
                                                    let actCheck;
                                                    JSON.parse(row.permissionAllow).map(v1 => {
                                                        if (v1.permission == v.Permission
                                                        || v1.permission == 'all') {
                                                            actCheck = v1.actionAllow
                                                            check = true;
                                                        }
                                                    })
                                                    let action = [];
                                                    if (row.action != null) {
                                                        for (let atc of row.action.split(',')) {
                                                            if (atc != null && atc.trim() != '') {
                                                                let c = false;
                                                                if (actCheck == 'all'
                                                                || (actCheck != null && actCheck.split(',').indexOf(atc) != -1)) {
                                                                    c = true;
                                                                }
                                                                action.push({
                                                                    label: atc,
                                                                    check: c,
                                                                })
                                                            }
                                                        }
                                                    }
                                                    return (
                                                        <div style={{
                                                            display: 'grid',
                                                            gridTemplateColumns: '30% 70%',
                                                            borderBottom: '1px dashed',
                                                        }}>
                                                            <div style={{
                                                                display: 'grid',
                                                                gridTemplateColumns: '80% auto',
                                                            }}>
                                                                <div>
                                                                    {v['Loại Quản Lý']}
                                                                </div>
                                                                <div>
                                                                    <input
                                                                        type='checkbox'
                                                                        checked={check}
                                                                        onClick={() => {
                                                                            let a = JSON.parse(row.permissionAllow);
                                                                            if (check) {
                                                                                let i = 0;
                                                                                for (;i < a.length; i++) {
                                                                                    let element = a[i];
                                                                                    if (element.permission == v['Permission']) {
                                                                                        break;
                                                                                    }
                                                                                }
                                                                                a.splice(i, 1);
                                                                            } else {
                                                                                a.push({
                                                                                    permission: v['Permission'],
                                                                                    actionAllow: '',
                                                                                })
                                                                            }                                                                            
                                                                            row.permissionAllow = JSON.stringify(a);
                                                                            row.change = true;
                                                                            this.setState({
                                                                                listTables: ele,
                                                                            })
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div style={{
                                                                display: 'flex',
                                                                flexFlow: 'wrap',
                                                            }}>
                                                                {
                                                                    action.map(v1 => {
                                                                        return (
                                                                            <div style={{
                                                                                border: '1px solid #000',
                                                                                margin: '5px',
                                                                                padding: '3px',
                                                                                borderRadius: '3px',
                                                                            }}>                                                                                
                                                                                <div>
                                                                                    {v1.label}
                                                                                </div>
                                                                                <input
                                                                                    type='checkbox'
                                                                                    checked={v1.check}
                                                                                    onClick={() => {
                                                                                        let a = JSON.parse(row.permissionAllow);
                                                                                        let i = 0;
                                                                                        for (;i < a.length; i++) {
                                                                                            if (a[i].permission == v['Permission']) {
                                                                                                if (v1.check) {
                                                                                                    if (a[i].actionAllow != 'all') {
                                                                                                        let _a = a[i].actionAllow.split(',');
                                                                                                        _a.splice(_a.indexOf(v1.label), 1);
                                                                                                        a[i].actionAllow = _a.join(',');
                                                                                                    } else {
                                                                                                        a[i].actionAllow = [v1.label].join(',');
                                                                                                    }
                                                                                                } else {
                                                                                                    if (a[i].actionAllow == null
                                                                                                    || a[i].actionAllow.trim() == '') {
                                                                                                        a[i].actionAllow = [v1.label].join(',');
                                                                                                    } else {
                                                                                                        let _a = a[i].actionAllow.split(',');
                                                                                                        _a.push(v1.label);
                                                                                                        a[i].actionAllow = _a.join(',');
                                                                                                    }
                                                                                                }
                                                                                                break;
                                                                                            }
                                                                                        }                                                                   
                                                                                        row.permissionAllow = JSON.stringify(a);
                                                                                        row.change = true;
                                                                                        this.setState({
                                                                                            listTables: ele,
                                                                                        })
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        )
                                                                    })
                                                                }
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>
                                    </div>
                                })                                
                                return ele;
                            })()}
                        />
                    </div>
                    <div className="footer">
                        <Button 
                            onClick={this.close.bind(this)}
                            value="Thoát"
                            icon="close"
                            style={{'float': 'right', 'margin-right': '10px',}}
                            disabled={this.state.btnAllDisable | this.state.btnCloseDisable}
                        />
                        <Button 
                            onClick={this.dongy.bind(this)}
                            value="Đồng Ý"
                            icon="agree"
                            style={{'float': 'right', 'margin-right': '10px',}}
                            disabled={this.state.btnAllDisable | this.state.btnAgreeDisable}
                        />
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
}) (Access);
