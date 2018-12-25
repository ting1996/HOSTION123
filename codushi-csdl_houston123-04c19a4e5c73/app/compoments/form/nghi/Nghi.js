import React from 'react';
import style from '../style.css';
import { connect } from 'react-redux';

var ReactDOM = require('react-dom');

class Nghi extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            today: '',
            status: null,
        };
        this.callBackDataFormDatabase = this.callBackDataFormDatabase.bind(this);
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

    callBackDataFormDatabase ( rows, hanhdong, dulieuguive ) {
        if (hanhdong == 'laydulieu_trave') {
            if (dulieuguive != null) {
                switch (dulieuguive.fn) {
                    case 'form_nghi_thanhcong':
                        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                        break;
                    default:
                }
            }
        }  
    }

    componentDidMount () {
        window.addEventListener("resize", this.changeSize);
        this.changeSize();
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);

        let today = new Date();
        let y = today.getFullYear();
        let m = ("0" + (today.getMonth() + 1)).slice(-2);
        let d = ("0" + today.getDate()).slice(-2);
        this.setState({
          today: (y + "-" + m + "-" + d)
        });

        if (this.props.edit
        && this.props.data != null) {
            let date = new Date(this.props.data['Ngày Nghỉ Học']);
            this.refs.ngaynghi.value = date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2);
            this.refs.ngaynghi.disabled = true;
            this.refs.lydo.value = this.props.data['Lý Do Nghỉ'];
        }

        if (this.props.name.value != null) {
            this.setState({
                status: this.props.id + ' - ' + this.props.name.value,
            })
        } else {
            this.setState({
                status: this.props.id + ' - ' + this.props.name,
            })
        }

        if (this.props.menuSelected == 'lophoc') {
            let date2 = new Date();
            date2.setDate(date2.getDate() - 1);
            this.refs.ngaynghi.value = date2.getFullYear() + '-' + ("0" + (date2.getMonth() + 1)).slice(-2) + '-' + ("0" + date2.getDate()).slice(-2);
            this.refs.ngaynghi.disabled = true;
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
        let checkfail = false;
        let ngaynghi = this.refs.ngaynghi.value;
        this.refs.ngaynghi.style.borderColor = 'rgb(204, 204, 204)';
        if (ngaynghi == '') {
            this.refs.ngaynghi.style.borderColor = 'red';
            checkfail = true;
        }

        let lydo = this.refs.lydo.value.trim();
        this.refs.lydo.style.borderColor = 'rgb(204, 204, 204)';
        if (lydo == '') {
            this.refs.lydo.style.borderColor = 'red';
            checkfail = true;
        }

        if (checkfail) {
            return;
        } else {
            let query;
            switch (this.props.menuSelected) {
                case 'hocsinh':
                    if (this.props.edit
                    && this.props.data != null
                    && lydo == this.props.data['Lý Do Nghỉ']) {
                        break;
                    }                    
                    query = 'UPDATE `USERS` SET `Ngày Nghỉ Học`=\'!\?!\', `Lý Do Nghỉ`=\'!\?!\' WHERE `User ID`=\'!\?!\'; ' +
                    'INSERT INTO `LYDONHAPHOCVANGHI` (`User ID`, `date`, `content`, `type`, `staffCode`) VALUES (\'!\?!\', \'!\?!\', \'!\?!\', \'0\', \'!\?!\'); ';
                    query = query.replace('!\?!', ngaynghi);
                    query = query.replace('!\?!', lydo);
                    query = query.replace('!\?!', this.props.id);
                    query = query.replace('!\?!', this.props.id);
                    query = query.replace('!\?!', ngaynghi);
                    query = query.replace('!\?!', lydo);
                    query = query.replace('!\?!', this.props.staffCode);
                    break;
                case 'quanly':
                    query = 'UPDATE `QUANLY` SET `Ngày Nghỉ`=\'!\?!\', `Lý Do Nghỉ`=\'!\?!\' WHERE `Mã Quản Lý`=\'!\?!\'; ' +
                    'UPDATE `ACCOUNT` SET `available`=\'0\' WHERE `account_id`=\'!\?!\';';
                    query = query.replace('!\?!', ngaynghi);
                    query = query.replace('!\?!', lydo);
                    query = query.replace('!\?!', this.props.id);
                    query = query.replace('!\?!', this.props.id);
                    break;
                case 'giaovien':
                    query = 'UPDATE `GIAOVIEN` SET `Ngày Nghỉ`=\'!\?!\', `Lý Do Nghỉ`=\'!\?!\' WHERE `Mã Giáo Viên`=\'!\?!\'; ' +
                    'UPDATE `ACCOUNT` SET `available`=\'0\' WHERE `account_id`=\'!\?!\';';
                    query = query.replace('!\?!', ngaynghi);
                    query = query.replace('!\?!', lydo);
                    query = query.replace('!\?!', this.props.id);
                    query = query.replace('!\?!', this.props.id);
                    break;
                case 'lophoc': {
                    query = 'UPDATE `LOPHOC` SET `Ngày Kết Thúc` = CONVERT_TZ(SUBDATE(NOW(), 1), @@session.time_zone,\'+07:00\'), `Lý Do Kết Thúc` = \'!\?!\', `Mã Nhân Viên KT Lớp` = \'!\?!\' WHERE (`Mã Lớp` = \'!\?!\'); '
                    query = query.replace('!\?!', lydo);                    
                    query = query.replace('!\?!', this.props.staffCode);
                    query = query.replace('!\?!', this.props.id);
                } break;
                default:                    
            }
            if (query != null) {
                this.props.socket.emit( 'gui-query-den-database', query, 'laydulieu_trave', {
                    fn: 'form_nghi_thanhcong',
                    isReload: true,
                    isSuccess: true,
                });
            } else {
                this.close();
            }
        }
    }

    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    }

    render () {
        let tablename = 'Nghỉ';
        let ngaynghi = 'Ngày nghỉ: ';
        let lydonghi = 'Lý do nghỉ: ';
        if (this.props.menuSelected == 'lophoc') {
            tablename = 'Kết Thúc Lớp Học';
            ngaynghi = 'Ngày kết thúc: ';
            lydonghi = 'Lý do kết thúc: ';
        }

        return (
            <div className={style.formstyle} ref="background">
                <div className="form_body" ref="body">
                    <div className="header">
                        { /*<img src="" alt="Icon Image"/> */}
                        <h2>{tablename}</h2>
                    </div>
                    <div className="body">
                        <div className="divformstyle">
                            <div style={{'text-align': 'center', }}>
                                <h2 style={{'margin': '0'}}>{this.state.status}</h2>
                            </div>
                            <div>
                                <a>{ngaynghi}</a>
                                <input type="date" ref="ngaynghi" min={this.state.today}/>
                            </div>
                            <div>
                                <a>{lydonghi}</a>
                                <textarea ref="lydo" rows="4" cols="50" maxLength="1000" style={{'height' : '75px'}}></textarea>
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
    }
}

module.exports = connect(function (state) {
    return {
      socket: state.socket,
    };
  }) (Nghi);;
