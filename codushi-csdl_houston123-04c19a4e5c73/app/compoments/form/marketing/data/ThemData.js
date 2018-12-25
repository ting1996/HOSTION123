import React from 'react';
import { connect } from 'react-redux';
import style from '../../style.css';
import SoDienThoai from '../../elements/SoDienThoai';
import DiaChi from '../../DiaChi';
import Lop from '../../elements/Lop'
var ReactDOM = require('react-dom');

class ThemData extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
        this.callBackDataFormDatabase = this.callBackDataFormDatabase.bind(this);
        this.SocketEmit = this.SocketEmit.bind(this);
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
                    case 'marketting_data_themdata_kiemtracacsodienthoai':
                        let checkfail = false;
                        let noidung = '';
                        for (let i = 0; i < rows.length; i++) {
                            let row = rows[i];
                            if (row.length > 0) {
                                checkfail = true;
                                noidung += '"';
                                for (let r of row) {
                                    noidung += r['Họ Và Tên'] + ', '
                                }
                                noidung += '" đang sử dụng các số điện thoại đã nhập ở bảng !\?!.\n'.replace('!\?!', dulieuguive.table[i]);
                            }
                        }
                        
                        if (noidung != '') {
                            noidung +=  '\nOK nếu chắc chắn muốn thêm!';
                            if (confirm(noidung)) {
                                checkfail = false;
                            }
                        }

                        if (!checkfail) {
                            let hovaten = this.refs.hovaten.value;
                            let truong = this.refs.truong.value;
                            let lop = this.refs.lop.value();
                            let ngaysinh = this.refs.ngaysinh.value;
                            let sodienthoai = this.sodienthoai.state.value;
                            let diachi = this.diachi.value();
                            let hovatennt1 = this.refs.hovatennt1.value;
                            let sodienthoaint1 = this.sodienthoaint1.state.value;
                            let nghenghiepnt1 = this.refs.nghenghiepnt1.value;
                            let hovatennt2 = this.refs.hovatennt2.value;
                            let sodienthoaint2 = this.sodienthoaint2.state.value;
                            let nghenghiepnt2 = this.refs.nghenghiepnt2.value;

                            let query = 'INSERT INTO `quanlyhocsinh`.`DATA_TRUONGTIEMNANG` (`Họ Và Tên`, `Lớp`, `Số Điện Thoại`, `Ngày Sinh`, `Địa Chỉ`, `Họ Và Tên (NT1)`, `Số Điện Thoại (NT1)`, `Nghề Nghiệp (NT1)`, `Họ Và Tên (NT2)`, `Số Điện Thoại (NT2)`, `Nghề Nghiệp (NT2)`, `Tên Trường`, `Nguồn`, `Cơ Sở`, `Ngày Nhập`, `Mã Nhân Viên`, `isBusy`, `isOLD`, `isDeactivate`) VALUES (\'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'0\', \'0\', \'0\');'
                            query = query.replace('!\?!', hovaten);
                            query = query.replace('!\?!', lop);
                            query = query.replace('!\?!', sodienthoai);
                            query = query.replace('!\?!', ngaysinh);
                            query = query.replace('!\?!', diachi);
                            query = query.replace('!\?!', hovatennt1);
                            query = query.replace('!\?!', sodienthoaint1);
                            query = query.replace('!\?!', nghenghiepnt1);
                            query = query.replace('!\?!', hovatennt2);
                            query = query.replace('!\?!', sodienthoaint2);
                            query = query.replace('!\?!', nghenghiepnt2);
                            query = query.replace('!\?!', truong);
                            if (this.props.source != null) {
                                query = query.replace('!\?!', this.props.source);
                            } else {
                                query = query.replace('!\?!', 'data' + new Date().getFullYear());
                            }
                            query = query.replace('!\?!', $('.khuvuc').attr('value'));
                            let date = new Date();
                            query = query.replace('!\?!', date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2));
                            query = query.replace('!\?!', $('#lable_button_nexttoicon').attr('value'));
                            query = query.replace(/\''/g, 'null');
                            query = query.replace(/\'null'/g, 'null');
                            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                                fn: 'marketting_data_themdata_themthanhcong',
                                isSuccess: true,
                                isReload: true,
                            });
                        }
                        break;
                    case 'marketting_data_themdata_themthanhcong':
                        this.close();
                        break;
                    default:
                        
                }
                
            }
        }  
    }

    componentDidMount () {
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);

        switch (this.props.action) {
            case 'add':
                break;
            case 'edit':            
                let data = this.props.data;
                this.refs.hovaten.value = data['Họ Và Tên'];
                this.refs.truong.value = data['Tên Trường'];
                this.refs.lop.value(data['Lớp']);
                if (data['Ngày Sinh'] != null && data['Ngày Sinh'] != '') {
                    let date2 = (new Date(data['Ngày Sinh'])).toLocaleDateString('en-GB').split('/');
                    this.refs.ngaysinh.value = date2[2] + '-' + date2[1] + '-' + date2[0];
                }
                this.sodienthoai.setState({value: data['Số Điện Thoại']});
                this.diachi.setState({default: data['Địa Chỉ']});
                this.refs.hovatennt1.value = data['Họ Và Tên (NT1)'];
                this.sodienthoaint1.setState({value: data['Số Điện Thoại (NT1)']});
                this.refs.nghenghiepnt1.value = data['Nghề Nghiệp (NT1)'];
                this.refs.hovatennt2.value = data['Họ Và Tên (NT2)'];
                this.sodienthoaint2.setState({value: data['Số Điện Thoại (NT2)']});
                this.refs.nghenghiepnt2.value = data['Nghề Nghiệp (NT2)'];
                break;
            default:
                this.close();
        }   
    }

    componentWillUnmount() {
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentDidUpdate(prevProps, prevState) {
    }

    dongy () {
        let checkfail = false;
        let sodienthoai = '';
        let querycheck = '';
        this.sodienthoai.refs.input.style.borderColor = 'rgb(204, 204, 204)';
        if (this.sodienthoai.state.value != null && this.sodienthoai.state.value != '' && this.sodienthoai.state.value.length >= 10) {
            sodienthoai = this.sodienthoai.state.value
            querycheck += '`Số Điện Thoại` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT1)` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT2)` LIKE \'%!\?!%\' OR '.replace(/\!\?!/g, sodienthoai);
            if (sodienthoai[0] == '0') {
                querycheck += '`Số Điện Thoại` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT1)` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT2)` LIKE \'%!\?!%\' OR '.replace(/\!\?!/g, sodienthoai.substring(1, sodienthoai.length));;
            }
        } else if (this.sodienthoai.state.value != null && this.sodienthoai.state.value != '' && this.sodienthoai.state.value.length < 10) {
            this.sodienthoai.refs.input.style.borderColor = 'red';
        }

        let sodienthoaint1 = ''
        this.sodienthoaint1.refs.input.style.borderColor = 'rgb(204, 204, 204)';
        if (this.sodienthoaint1.state.value != null && this.sodienthoaint1.state.value != '' && this.sodienthoaint1.state.value.length >= 10) {
            sodienthoaint1 = this.sodienthoaint1.state.value
            querycheck += '`Số Điện Thoại` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT1)` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT2)` LIKE \'%!\?!%\' OR '.replace(/\!\?!/g, sodienthoaint1);
            if (sodienthoaint1[0] == '0') {
                querycheck += '`Số Điện Thoại` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT1)` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT2)` LIKE \'%!\?!%\' OR '.replace(/\!\?!/g, sodienthoaint1.substring(1, sodienthoaint1.length));;
            }
        } else if (this.sodienthoaint1.state.value != null && this.sodienthoaint1.state.value != '' && this.sodienthoaint1.state.value.length < 10) {
            this.sodienthoaint1.refs.input.style.borderColor = 'red';
        }

        let sodienthoaint2 = ''
        this.sodienthoaint2.refs.input.style.borderColor = 'rgb(204, 204, 204)';
        if (this.sodienthoaint2.state.value != null && this.sodienthoaint2.state.value != '' && this.sodienthoaint2.state.value.length >= 10) {
            sodienthoaint2 = this.sodienthoaint2.state.value
            querycheck += '`Số Điện Thoại` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT1)` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT2)` LIKE \'%!\?!%\' OR '.replace(/\!\?!/g, sodienthoaint2);
            if (sodienthoaint2[0] == '0') {
                querycheck += '`Số Điện Thoại` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT1)` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT2)` LIKE \'%!\?!%\' OR '.replace(/\!\?!/g, sodienthoaint2.substring(1, sodienthoaint2.length));;
            }
        } else if (this.sodienthoaint2.state.value != null && this.sodienthoaint2.state.value != '' && this.sodienthoaint2.state.value.length < 10) {
            this.sodienthoaint2.refs.input.style.borderColor = 'red';
        }
        
        if (querycheck != '') {
            querycheck = querycheck.substring(0, querycheck.length - ' OR '.length);
        }

        let hovaten = this.refs.hovaten.value;
        if (hovaten == '') {
            this.props.dispatch({
                type: 'ALERT_NOTIFICATION_ADD',
                content: 'Họ và tên đang trống!',
                notifyType: 'warning',
            })
            checkfail = true;
        }
        
        if (sodienthoai == '' && sodienthoaint1 == '' && sodienthoaint2 == '') {
            this.props.dispatch({
                type: 'ALERT_NOTIFICATION_ADD',
                content: 'Tất cả số điện thoại đang trống!',
                notifyType: 'warning',
            })
            checkfail = true;
        }

        if (checkfail) {
            return;
        } else {
            let query = '';
            switch (this.props.action) {
                case 'add':
                    query = 'SELECT * FROM quanlyhocsinh.DATA_TRUONGTIEMNANG WHERE ' + querycheck + '; ' +
                    'SELECT * FROM quanlyhocsinh.USERS WHERE ' + querycheck + ';';
                    this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                        fn: 'marketting_data_themdata_kiemtracacsodienthoai',
                        table: ['Data Tổng', 'Users'],
                    });
                    break;
                case 'edit':
                    let hovaten = this.refs.hovaten.value;
                    let truong = this.refs.truong.value;
                    let lop = this.refs.lop.value();
                    let ngaysinh = this.refs.ngaysinh.value;
                    let sodienthoai = this.sodienthoai.state.value;
                    let diachi = this.diachi.value();
                    let hovatennt1 = this.refs.hovatennt1.value;
                    let sodienthoaint1 = this.sodienthoaint1.state.value;
                    let nghenghiepnt1 = this.refs.nghenghiepnt1.value;
                    let hovatennt2 = this.refs.hovatennt2.value;
                    let sodienthoaint2 = this.sodienthoaint2.state.value;
                    let nghenghiepnt2 = this.refs.nghenghiepnt2.value;

                    query = 'UPDATE `quanlyhocsinh`.`DATA_TRUONGTIEMNANG` SET `Họ Và Tên`=\'!\?!\', `Lớp`=\'!\?!\', `Số Điện Thoại`=\'!\?!\', `Ngày Sinh`=\'!\?!\', `Địa Chỉ`=\'!\?!\', `Họ Và Tên (NT1)`=\'!\?!\', `Số Điện Thoại (NT1)`=\'!\?!\', `Nghề Nghiệp (NT1)`=\'!\?!\', `Họ Và Tên (NT2)`=\'!\?!\', `Số Điện Thoại (NT2)`=\'!\?!\', `Nghề Nghiệp (NT2)`=\'!\?!\', `Tên Trường`=\'!\?!\' WHERE `ID`=\'!\?!\';'
                    query = query.replace('!\?!', hovaten);
                    query = query.replace('!\?!', lop);
                    query = query.replace('!\?!', sodienthoai);
                    query = query.replace('!\?!', ngaysinh);
                    query = query.replace('!\?!', diachi);
                    query = query.replace('!\?!', hovatennt1);
                    query = query.replace('!\?!', sodienthoaint1);
                    query = query.replace('!\?!', nghenghiepnt1);
                    query = query.replace('!\?!', hovatennt2);
                    query = query.replace('!\?!', sodienthoaint2);
                    query = query.replace('!\?!', nghenghiepnt2);
                    query = query.replace('!\?!', truong);
                    query = query.replace('!\?!', this.props.data['ID']);
                    query = query.replace(/\''/g, 'null');
                    query = query.replace(/\'null'/g, 'null');
                    this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                        fn: 'marketting_data_themdata_themthanhcong',
                        isSuccess: true,
                        isReload: true,
                    });
                    break;
                default:
            }          
        }
    }

    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    }

    render () {
        let title = '';
        switch (this.props.action) {
            case 'add':
                title = 'Thêm ';
                break;
            case 'edit':
                title = 'Cập Nhật ';
                break;
            default:
        }
        if (this.props.title != null) {
            title += this.props.title;
        }

        return (
            <div className={style.formstyle}>
                <div className="form_body" style={{'width': '1100px'}}>
                    <div className="header">
                        <h2>{title}</h2>
                    </div>
                    <div className="body">
                        <div style={{
                            "display": "grid",
                            "grid-template-columns": "50% 50%",
                        }}>
                            <div>
                                <div className='divformstyle'>
                                    <div>
                                        <label for="" >Họ Và Tên: </label>
                                        <input type="text" name="" ref='hovaten'/>
                                    </div>
                                    <div>
                                        <label for="" >Trường Học: </label>
                                        <input type="text" name="" ref='truong'/>
                                    </div>
                                    <div>
                                        <Lop ref="lop"/>
                                    </div>
                                    <div>
                                        <label for="" >Ngày Sinh: </label>
                                        <input type="date" name="" ref='ngaysinh'/>
                                    </div>
                                    <div>
                                        <SoDienThoai
                                            getMe={me => this.sodienthoai = me}
                                            maxlength="11"
                                        />
                                    </div>
                                </div>
                                <div className="unsetdivformstyle">
                                        <DiaChi getMe={me => this.diachi = me}/>
                                </div>
                            </div>
                                <div>
                                    <div className='divformstyle'>
                                        <div>
                                            <label for="" >Người Thân (Bố/Anh/Chú): </label>
                                            <input type="text" name="" ref='hovatennt1'/>
                                        </div>
                                        <div>
                                            <SoDienThoai
                                                getMe={me => this.sodienthoaint1 = me}
                                                maxlength="11"
                                            />
                                        </div>
                                        <div>
                                            <label for="" >Nghề Nghiệp: </label>
                                            <input type="text" name="" ref='nghenghiepnt1'/>
                                        </div>
                                        <div>
                                            <label for="" >Người Thân (Mẹ/Chị/Dì): </label>
                                            <input type="text" name="" ref='hovatennt2'/>
                                        </div>
                                        <div>
                                            <SoDienThoai
                                                getMe={me => this.sodienthoaint2 = me}
                                                maxlength="11"
                                            />
                                        </div>
                                        <div>
                                            <label for="" >Nghề Nghiệp: </label>
                                            <input type="text" name="" ref='nghenghiepnt2'/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    <div className="footer">
                        <input type="button" onClick={this.close.bind(this)} value="Thoát"/>
                        <input type="button" onClick={this.dongy.bind(this)} value="Đồng Ý"/>
                    </div>
                </div>
                <div className="daithem">
                </div>
            </div>
        )
    }
}

module.exports = connect(function (state) {
    return {
      socket: state.socket,
    };
  }) (ThemData);
