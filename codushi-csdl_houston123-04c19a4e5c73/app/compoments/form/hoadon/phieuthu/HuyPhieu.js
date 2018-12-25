import React from 'react';
import { connect } from 'react-redux';
import style from '../../style.css';
var ReactDOM = require('react-dom');

class HuyPhieu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,

            thongtinphiethu: [],
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

    
    /**
     * form_hoadon_phieuthu_huyphieu_loadthongtin: thong tin phieu thu dc tra ve tu database
     */
    callBackDataFormDatabase ( rows, hanhdong, dulieuguive ) {
        if (hanhdong == 'laydulieu_trave') {
            if (dulieuguive != null) {
                switch (dulieuguive.fn) {
                    case 'form_hoadon_phieuthu_huyphieu_loadthongtin':
                        this.setState({
                            thongtinphiethu: rows[0],
                            isLoading: false,
                        });
                        break;
                    case 'form_hoadon_phieuthu_huyphieu_success':
                        this.SocketEmit('all-notification-update', {
                            to: 'users',
                            // IDs: [$('#lable_button_nexttoicon').attr('value')],
                            fn: 'dailynotification',
                            elements: ['approve']
                        });
                        this.close();
                        break;
                    case 'form_hoadon_phieuthu_gettime': {
                        let query = '';
                        let lydo = this.refs.lydo.value.trim();
                        let date = new Date(rows[0].now);
                        let ngayhuy = date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2) + ' ' + ("0" + date.getHours()).slice(-2) + ':' + ("0" + date.getMinutes()).slice(-2) + ':' + ("0" + date.getSeconds()).slice(-2) ;
                        if (this.props.phieuThuTruoc != null && this.props.phieuThuTruoc['Còn Nợ'] != 0) {
                            query = 'UPDATE `BIENLAIHOCPHI` SET `isOwe`=\'1\' WHERE `ID`=\'!\?!\'; ';
                            query = query.replace('!\?!', this.props.phieuThuTruoc['ID']);
                        }
            
                        query += 'UPDATE `BIENLAIHOCPHI` SET `Ngày Hủy Phiếu`=\'!\?!\', `Lý Do Hủy`=\'!\?!\', `Mã Nhân Viên Hủy`=\'!\?!\' WHERE `ID`=\'!\?!\'; ';
                        query = query.replace('!\?!', ngayhuy);
                        query = query.replace('!\?!', lydo);
                        query = query.replace('!\?!', this.props.accountID);
                        query = query.replace('!\?!', this.props.data['ID']);
                        query = query.replace(/'/g, '\\\'')

                        let queryApprove = 'INSERT INTO `quanlyhocsinh`.`APPROVE` (`requester`, `to`, `content`, `command`, `approvedTime`, `isApproved`, `branch`, `blockEvent`) VALUES (\'!\?!\', \'mod\', \'!\?!\', \'!\?!\', \'!\?!\', \'0\', \'!\?!\', \'taophieuthu:!\?!,huyphieuthu:!\?!\'); '
                        queryApprove = queryApprove.replace('!\?!', this.props.accountID);
                        queryApprove = queryApprove.replace('!\?!', lydo);
                        queryApprove = queryApprove.replace('!\?!', query);
                        queryApprove = queryApprove.replace('!\?!', ngayhuy);
                        queryApprove = queryApprove.replace('!\?!', this.props.branch);
                        if (this.props.data['User ID'] != null) {
                            queryApprove = queryApprove.replace('!\?!', this.props.data['User ID']);
                        } else {
                            queryApprove = queryApprove.replace('!\?!', this.props.data['Mã Nhân Viên Đóng Phí']);
                        }                        
                        queryApprove = queryApprove.replace('!\?!', this.props.data['ID']);
                        
                        this.SocketEmit('gui-query-den-database', queryApprove, 'laydulieu_trave', {
                            fn: 'form_hoadon_phieuthu_huyphieu_success',
                            isReload: true,
                            reloadPageName: 'hoadon',
                            isSuccess: true,
                        });
                    } break;
                    default:                        
                }                
            }
        }  
    }

    /**
     * Query load thong tin phieu thu
     */
    componentDidMount () {
        let query;
        window.addEventListener("resize", this.changeSize);
        this.changeSize();
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);

        query = 'SELECT BIENLAIHOCPHI.*, QUANLY.`Họ Và Tên` AS `creatorName` ' + 
        'FROM BIENLAIHOCPHI ' +
        'LEFT JOIN QUANLY ON QUANLY.`Mã Quản Lý` = BIENLAIHOCPHI.`Mã Nhân Viên` ' +
        'WHERE `ID` = \'!\?!\'; ';
        query = query.replace('!\?!', this.props.data['ID']);
        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn: 'form_hoadon_phieuthu_huyphieu_loadthongtin',
        });
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.changeSize);
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentDidUpdate(prevProps, prevState) {
        this.changeSize();
    }

    dongy () {
        this.refs.lydo.style.borderColor = 'rgb(204, 204, 204)';

        let query;
        let checkfail = false;
        let lydo = this.refs.lydo.value.trim();

        if (lydo == '') {
            this.refs.lydo.style.borderColor = 'red';
            checkfail = true;
        }

        if (!checkfail) {
            query = 'SELECT CONVERT_TZ(NOW(), @@session.time_zone,\'+07:00\') AS now ';
            this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
                fn: 'form_hoadon_phieuthu_gettime',
            });
        }
    }

    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    }

    render () {
        if (this.state.isLoading == false) {
            return (
                <div className={style.formstyle} ref="background">
                    <div className="form_body" ref="body">
                        <div className="header">
                            { /*<img src="" alt="Icon Image"/> */}
                            <h2>Hủy Phiếu</h2>
                        </div>
                        <div className="body">
                            <div className="divformstyle">
                                <div>
                                    <h2 style={{'margin': '0'}}>
                                        {this.state.thongtinphiethu['Mã Phiếu']}
                                    </h2>
                                    <span>
                                        Người lập phiếu: {this.state.thongtinphiethu['creatorName']}
                                    </span>
                                </div>
                                <div>
                                    <a>Lý do hủy phiếu: </a>
                                    <textarea ref="lydo" rows="4" cols="50" style={{'height' : '75px'}}></textarea>
                                </div>
                                <div style={{
                                    color: 'red',
                                }}>
                                    <b>Lệnh hủy phiếu của bạn sẽ được gửi lên cấp trên, bạn sẽ không tạo được phiếu thu trùng khách hàng đang yêu cầu hủy trước khi được cấp trên đồng ý hoặc hủy yêu cầu!</b>
                                </div>
                            </div>                            
                        </div>
                        <div className="footer">
                            <input type="button" onClick={this.close.bind(this)} value="Thoát"/>
                            <input type="button" onClick={this.dongy.bind(this)} value="Đồng Ý"/>
                        </div>
                    </div>
                </div>
            ) 
        } else {
            return (
                <div></div>
            )   
        }
    }
}

module.exports = connect(function (state) {
    return {
      socket: state.socket,
    };
}) (HuyPhieu);
