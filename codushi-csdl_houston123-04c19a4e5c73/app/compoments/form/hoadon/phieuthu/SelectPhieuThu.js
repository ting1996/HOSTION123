import React from 'react';
import { connect } from 'react-redux';
import style from '../../style.css';
import Select from 'react-select';
import mystyle from './style.css';
var ReactDOM = require('react-dom');

import TabPage from '../../elements/TabPage';
import Button from '../../elements/Button';

import PhieuThuHocPhi from './PhieuThuHocPhi';
import PhieuThuKhac from './PhieuThu';

class SelectPhieuThu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hocsinh: null,
            danhsachhonhsinh: [],

            nhanviendongphi: null,
            danhsachnhanvien: [],

            branch: null,
            listBranch: [],

            isPhieuThu: false,
            isPhieuThuKhac: false,
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

    callBackDataFormDatabase (rows, hanhdong, dulieuguive) {
        if (hanhdong == 'laydulieu_trave') {
            if (dulieuguive != null) {
                switch (dulieuguive.fn) {
                    case 'form_hoadon_phieuthu_selectphieuthu_loaddulieu':
                        let danhsachhocsinh = rows[0];
                        let danhsachcoso = rows[1];
                        let danhsachnhanvien = rows[2];
                        let cososelected = null;

                        danhsachcoso.map((v, i) => {
                            if (v['Cơ Sở'] == $('.khuvuc').attr('value')) {
                                cososelected = v;
                            }
                        });

                        this.setState({
                            danhsachhonhsinh: danhsachhocsinh,
                            danhsachnhanvien: danhsachnhanvien,
                            branch: cososelected,
                            listBranch: danhsachcoso,
                        });
                        break;
                    case 'form_hoadon_phieuthu_selectphieuthu_loadnhanvien':
                        this.setState({
                            nhanviendongphi: null,
                            danhsachnhanvien: rows,
                        })
                        break;
                    case 'form_hoadon_phieuthu_selectphieuthu_checkkhachhang': {
                        if (rows.length > 0) {
                            this.props.dispatch({
                                type: 'ALERT_NOTIFICATION_ADD',
                                content: 'Khách hàng đang được xin phép hủy phiếu thu nên không thể tạo phiếu thu!',
                                notifyType: 'warning',
                            })
                        } else {
                            this.setState({
                                isPhieuThu: dulieuguive.isPhieuThu,
                                isPhieuThuKhac: dulieuguive.isPhieuThuKhac,
                            })
                        }
                    } break;
                    default:
                }
            }
        }  
    }

    componentDidMount () {
        let query;
        window.addEventListener("resize", this.changeSize);
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
        this.changeSize();

        query = 'SELECT *, CONCAT(USERS.`User ID` , \' - \', USERS.`Họ Và Tên`) AS `label` FROM USERS WHERE USERS.`Cơ Sở` = \'!\?!\' AND USERS.`Ngày Nghỉ Học` IS NULL AND USERS.`Chính Thức` = \'1\'; ';
        query = query.replace('!\?!', $('.khuvuc').attr('value'));
        query += 'SELECT *, CONCAT(COSO.`Cơ Sở` , \' - \', COSO.`Tên Cơ Sở`) AS `label` FROM COSO; ';
        query += 'SELECT *, CONCAT(QUANLY.`Mã Quản Lý` , \' - \', QUANLY.`Họ Và Tên`) AS `label` FROM QUANLY WHERE (`Cơ Sở` = \'!\?!\' ' +
        'OR `Cơ Sở` LIKE \'%!\?!,%\' ' +
        'OR `Cơ Sở` LIKE \'%,!\?!%\' ' +
        'OR `Cơ Sở` = \'ALL\') AND QUANLY.`Ngày Nghỉ` IS NULL; ';
        query = query.replace(/!\?!/g, $('.khuvuc').attr('value'));
        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn: 'form_hoadon_phieuthu_selectphieuthu_loaddulieu',
        });
    }

    componentWillUnmount () {
        window.removeEventListener("resize", this.changeSize);
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentDidUpdate () {
        this.changeSize();
    }

    render () {
        if (this.state.isPhieuThu == true) {
            return (
                <PhieuThuHocPhi 
                    data={this.state.hocsinh}
                    action='pay'
                />
            )
        }

        if (this.state.isPhieuThuKhac == true
        && this.state.hocsinh != null) {
            return(
                <PhieuThuKhac 
                    data={this.state.hocsinh}
                    action='pay'
                    type='student'
                />
            )      
        }

        if (this.state.isPhieuThuKhac == true
        && this.state.nhanviendongphi != null) {
            return(
                <PhieuThuKhac 
                    data={this.state.nhanviendongphi}
                    action='pay'
                    type='employee'
                />
            )      
        }

        return (
            <div className={style.formstyle} ref="background">
                <div className="form_body" ref="body">
                    <div className="header">
                        { /*<img src="" alt="Icon Image"/> */}
                        <h2>Chọn Học Sinh Và Loại Phiếu Thu</h2>
                    </div>
                    <div className="body">
                        <div>
                            <TabPage
                                onChange={this.changeSize}
                                pages={[
                                    {
                                        label: 'Học Sinh',
                                        content:
                                        <div>
                                            <div className="unsetdivformstyle">
                                                Học Sinh:
                                                <Select
                                                    placeholder="--- Chọn Học Sinh ---"
                                                    value={this.state.hocsinh}
                                                    options={this.state.danhsachhonhsinh}
                                                    onChange={this.onChangHocSinh.bind(this)}
                                                    ref="chonhocsinh"
                                                />
                                            </div>
                                            <div className="divformstyle">
                                                <div style={{
                                                    'display': 'grid',
                                                    'grid-template-columns': '50% 50%',
                                                }}>
                                                    <div 
                                                        onClick={() => {
                                                            let isFail = false;
                                                            if (this.state.hocsinh == null) {
                                                                isFail = true;
                                                            }
            
                                                            if (!isFail == true) {
                                                                let query = 'SELECT * FROM APPROVE WHERE `isApproved` = \'0\' AND `blockEvent` LIKE \'%taophieuthu:!\?!%\'; ';
                                                                query = query.replace('!\?!', this.state.hocsinh['User ID']);
                                                                this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                                                                    fn: 'form_hoadon_phieuthu_selectphieuthu_checkkhachhang',
                                                                    isPhieuThu: true,
                                                                });
                                                            }
                                                        }} 
                                                        className={mystyle.button}>
                                                        <i class="fa fa-money fa-lg" aria-hidden="true"/> Lập Phiếu Thu Học Phí
                                                    </div>
                                                    <div 
                                                        onClick={() => {
                                                            let isFail = false;
                                                            if (this.state.hocsinh == null) {
                                                                isFail = true;
                                                            }
            
                                                            if (!isFail == true) {
                                                                let query = 'SELECT * FROM APPROVE WHERE `isApproved` = \'0\' AND `blockEvent` LIKE \'%taophieuthu:!\?!%\'; ';
                                                                query = query.replace('!\?!', this.state.hocsinh['User ID']);
                                                                this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                                                                    fn: 'form_hoadon_phieuthu_selectphieuthu_checkkhachhang',
                                                                    isPhieuThuKhac: true,
                                                                });
                                                            }
                                                        }}
                                                        className={mystyle.button}
                                                    >
                                                        <i class="fa fa-money fa-lg" aria-hidden="true"/> Lập Phiếu Thu Khác
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    },
                                    {
                                        label: 'Nhân Viên',
                                        content:
                                        <div>
                                            <div className="unsetdivformstyle">
                                                Cơ Sở:
                                                <Select
                                                    placeholder="--- Chọn Cơ Sở ---"
                                                    value={this.state.branch}
                                                    options={this.state.listBranch}
                                                    onChange={this.onChangBranch.bind(this)}
                                                    ref="choncoso"
                                                /><br/>
                                                Nhân Viên:
                                                <Select
                                                    placeholder="--- Chọn Nhân Viên ---"
                                                    value={this.state.nhanviendongphi}
                                                    options={this.state.danhsachnhanvien}
                                                    onChange={this.onChangNhanVien.bind(this)}
                                                    ref="chonnhanvien"
                                                /><br/>
                                            </div>
                                            <div className="divformstyle">
                                                <div>
                                                    <div 
                                                        onClick={() => {
                                                            let isFail = false;
                                                            if (this.state.nhanviendongphi == null) {
                                                                isFail = true;
                                                            }
            
                                                            if (!isFail == true) {
                                                                this.setState({
                                                                    isPhieuThuKhac: true
                                                                }) 
                                                            }
                                                        }}
                                                        className={mystyle.button}
                                                    >
                                                        <i class="fa fa-money fa-lg" aria-hidden="true"/> Lập Phiếu Thu
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    },
                                ]}
                            />
                        </div>
                    </div>
                    <div className="footer">
                        <Button 
                            onClick={this.close.bind(this)}
                            value="Thoát"
                            icon="close"
                            style={{'float': 'right', 'margin-right': '10px',}}
                        />
                    </div>
                </div>
            </div>
        )
    }
    
    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    }
    
    onChangHocSinh (value) {
        this.setState({
            hocsinh: value,
            nhanviendongphi: null,
        })
    }

    onChangBranch (value) {
        if (value == null) {
            this.state.listBranch.map((v, i) => {
                if (v['Cơ Sở'] == $('.khuvuc').attr('value')) {
                    value = v;
                }
            });
        }
        let query = 'SELECT *, CONCAT(QUANLY.`Mã Quản Lý` , \' - \', QUANLY.`Họ Và Tên`) AS `label` FROM QUANLY WHERE (`Cơ Sở` = \'!\?!\' ' +
        'OR `Cơ Sở` LIKE \'%!\?!,%\' ' +
        'OR `Cơ Sở` LIKE \'%,!\?!%\' ' +
        'OR `Cơ Sở` = \'ALL\') AND QUANLY.`Ngày Nghỉ` IS NULL; ';
        query = query.replace(/!\?!/g, value['Cơ Sở']);
        if (value['Cơ Sở'] == 'ALL') {
            query = 'SELECT *, CONCAT(QUANLY.`Mã Quản Lý` , \' - \', QUANLY.`Họ Và Tên`) AS `label` FROM QUANLY WHERE QUANLY.`Ngày Nghỉ` IS NULL; ';
        }
        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn: 'form_hoadon_phieuthu_selectphieuthu_loadnhanvien',
        });

        this.setState({
            branch: value,
        })
    }

    onChangNhanVien (value) {
        this.setState({
            nhanviendongphi: value,
            hocsinh: null,
        })
    }
}

module.exports = connect(function (state) {
    return {
      socket: state.socket,
    };
}) (SelectPhieuThu);
