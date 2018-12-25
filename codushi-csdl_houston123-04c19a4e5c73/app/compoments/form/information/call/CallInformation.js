import React from 'react';
import { connect } from 'react-redux';
import style from '../../style.css';
var ReactDOM = require('react-dom');
import SoDienThoai from '../../elements/SoDienThoai';

import RowData from './RowData';
import RowCSKH from './RowCSKH';

class CallInformation extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data_old: [],
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
                    case 'imformation_call_callinformation_loadinfor':
                        if (rows.length > 0) {
                            rows = rows[0];
                            this.refs.hovaten.value = rows['Họ Và Tên'];
                            this.refs.truong.value = rows['Tên Trường'];
                            this.refs.lop.value = rows['Lớp'];
                            this.refs.sodienthoai.value = rows['Số Điện Thoại'];
                            this.refs.diachi.value = rows['Địa Chỉ'];
                            this.refs.hovatennt1.value = rows['Họ Và Tên (NT1)'];
                            this.refs.sodienthoaint1.value = rows['Số Điện Thoại (NT1)'];
                            this.refs.nghenghiepnt1.value = rows['Nghề Nghiệp (NT1)'];
                            this.refs.hovatennt2.value = rows['Họ Và Tên (NT2)'];
                            this.refs.sodienthoaint2.value = rows['Số Điện Thoại (NT2)'];
                            this.refs.nghenghiepnt2.value = rows['Nghề Nghiệp (NT2)'];
                        } else {
                            this.close();
                        }
                        break;
                    case 'imformation_call_callinformation_loadhistory':
                        this.setState({
                            data_old: rows,
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

        switch (this.props.row) {
            case 'data': {
                query = 'SELECT CALLDATA.*, QUANLY.`Họ Và Tên` AS `Họ Tên Nhân Viên` FROM CALLDATA ' +
                'LEFT JOIN QUANLY ON QUANLY.`Mã Quản Lý` = CALLDATA.`Mã Nhân Viên` ' +
                'WHERE `ID-DATA` = \'!?!\';';
                query = query.replace('!\?!', this.props.id);
                this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                    fn : 'imformation_call_callinformation_loadhistory',
                });

                query = 'SELECT * FROM DATA_TRUONGTIEMNANG WHERE `ID` = \'!\?!\';';
                query = query.replace('!\?!', this.props.id);
                this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                    fn : 'imformation_call_callinformation_loadinfor',
                });
            } break;
            case 'cskh': {
                query = 'SELECT CHAMSOCKHACHHANG.*, QUANLY.`Họ Và Tên` AS `Họ Tên Nhân Viên` FROM CHAMSOCKHACHHANG ' +
                'LEFT JOIN QUANLY ON QUANLY.`Mã Quản Lý` = CHAMSOCKHACHHANG.`Mã Nhân Viên` ' +
                'WHERE `User ID` = \'!?!\';';
                query = query.replace('!\?!', this.props.id);
                this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                    fn : 'imformation_call_callinformation_loadhistory',
                });

                query = 'SELECT * FROM USERS WHERE `User ID` = \'!\?!\';';
                query = query.replace('!\?!', this.props.id);
                this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                    fn : 'imformation_call_callinformation_loadinfor',
                });
            } break;
            default:
                break;
        }
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.changeSize);
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentDidUpdate(prevProps, prevState) {
        this.changeSize();
    }

    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    }

    render () {
        let isEdit = false;
        if (this.state.data_old != null && this.state.data_old.length > 0) {
            isEdit = true;
        }

        let btnLuu = '';
        let listHistory = null;
        if (isEdit) {
            switch (this.props.row) {
                case 'data': {
                    listHistory = 
                    <RowData 
                        data_old={this.state.data_old} 
                        bangthongtin={this.props.bangthongtin}
                        accept={(fn) => this.accept = fn}
                        close={this.close}
                    />
                } break;
                case 'cskh': {
                    listHistory = 
                    <RowCSKH 
                        data_old={this.state.data_old} 
                        bangthongtin={this.props.bangthongtin}
                        accept={(fn) => this.accept = fn}
                        close={this.close}
                    />
                } break;
                default:
                    break;
            }

            if (listHistory != null) {
                btnLuu = 
                <input 
                    type="button"
                    onClick={() => {
                        if (this.accept != null) {
                            this.accept();
                        }
                    }}
                    value="Lưu"
                />;
            }
        }

        return (
            <div className={style.formstyle} ref="background">
                <div className="form_body" ref="body" style={{'width': '1100px'}}>
                    <div className="header">
                        { /*<img src="" alt="Icon Image"/> */}
                        <h2>Thông Tin Cuộc Gọi</h2>
                    </div>
                    <div className="body">
                        <div>
                            <div className='divformstyle' style={{
                                "display": "grid",
                                "grid-template-columns": "50% 50%",
                            }}>
                                <div>
                                    <div>
                                        <label for="" >Họ Và Tên: </label>
                                        <input type="text" name="" ref='hovaten' disabled={true} className='read_only'/>
                                    </div>
                                    <div>
                                        <label for="" >Trường: </label>
                                        <input type="text" name="" ref='truong' disabled={true} className='read_only'/>
                                    </div>
                                    <div>
                                        <label for="" >Lớp: </label>
                                        <input type="text" name="" ref='lop' disabled={true} className='read_only'/>
                                    </div>
                                    <div>
                                        <label for="" >Số Điện Thoại: </label>
                                        <input type="text" name="" ref='sodienthoai' disabled={true} className='read_only'/>
                                    </div>
                                    <div>
                                        <label for="" >Địa Chỉ: </label>
                                        <textarea 
                                            ref="diachi" 
                                            rows="4" 
                                            cols="50" 
                                            maxLength="1000" 
                                            style={{'height' : '75px'}}
                                            disabled={true}
                                            className='read_only'
                                        ></textarea>
                                    </div>
                                </div>
                                <div>
                                    <div>
                                        <label for="" >Người Thân (Bố/Anh/Chú): </label>
                                        <input type="text" name="" ref='hovatennt1' disabled={true} className='read_only'/>
                                    </div>
                                    <div>
                                        <label for="" >Số Điện Thoại: </label>
                                        <input type="text" name="" ref='sodienthoaint1' disabled={true} className='read_only'/>
                                    </div>
                                    <div>
                                        <label for="" >Nghề Nghiệp: </label>
                                        <input type="text" name="" ref='nghenghiepnt1' disabled={true} className='read_only'/>
                                    </div>
                                    <div>
                                        <label for="" >Người Thân (Mẹ/Chị/Dì): </label>
                                        <input type="text" name="" ref='hovatennt2' disabled={true} className='read_only'/>
                                    </div>
                                    <div>
                                        <label for="" >Số Điện Thoại: </label>
                                        <input type="text" name="" ref='sodienthoaint2' disabled={true} className='read_only'/>
                                    </div>
                                    <div>
                                        <label for="" >Nghề Nghiệp: </label>
                                        <input type="text" name="" ref='nghenghiepnt2' disabled={true} className='read_only'/>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {listHistory}
                    </div>
                    <div className="footer">
                        <input type="button" onClick={this.close.bind(this)} value="Thoát"/>
                        {btnLuu}
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
}) (CallInformation);
