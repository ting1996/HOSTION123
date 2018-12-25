import React from 'react';
import { connect } from 'react-redux';
var ReactDOM = require('react-dom');
import mystyle from './style.css';
import Tien from '../Tien';

class DichVu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            listBieuPhiDichVu: [],
            yourPermission: null,
            _yourPermission: null,
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
                    case 'form_bieuphi_dichvu_loaddichvukhac':
                        let per = null;
                        if (rows[0] != null && rows[0][0] != null) {
                            per = rows[0][0].permission;
                        }
                        this.setState({
                            listBieuPhiDichVu: rows[1],
                            yourPermission: per,
                            _yourPermission: per,
                        });
                        break;
                    default:
                        
                }
                
            }
        }  
    }

    componentDidMount () {
        let query;
        let that = this;
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);

        query = 'SELECT ACCOUNT.permission FROM ACCOUNT WHERE ACCOUNT.`account_id` = \'!\?!\'; ';
        query += 'SELECT CHUONGTRINHKHAC.*, COSO.`Tên Cơ Sở` AS `locationName` FROM CHUONGTRINHKHAC ' +
        'LEFT JOIN COSO ON COSO.`Cơ Sở` = CHUONGTRINHKHAC.`location` ' +
        'WHERE CHUONGTRINHKHAC.`location` = \'!\?!\' OR CHUONGTRINHKHAC.`location` = \'ALL\'; ';
        query = query.replace('!\?!', $('#lable_button_nexttoicon').attr('value'));
        query = query.replace('!\?!', $('.khuvuc').attr('value'));
        this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', { 
            fn: 'form_bieuphi_dichvu_loaddichvukhac'
        });
    }

    componentWillUnmount() {
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.yourPermission != null && this.state.yourPermission != null) {
            if (this.state._yourPermission != this.state.yourPermission) {
                ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
            }
        }
    }

    dongy () {

    }

    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    }

    render () {
        return (
            <div className={mystyle.tabContent}>
                <div>
                    {
                        this.state.listBieuPhiDichVu.map((v, i) => {
                            let handung = 'Không giới hạn';
                            let coloredit = '#000';
                            let editBox = '';
                            if (v.isEdit == true) {
                                coloredit = '#007eff';
                                editBox = 
                                <div className={mystyle.editBox}>
                                    <input type="text" placeholder={v.name}/>
                                    <textarea rows="4" cols="50" placeholder={v.noidung}/>
                                    
                                    edit
                                </div>
                            }
                            return (
                                <div style={{
                                    'display': 'grid',
                                    'grid-template-columns': '20% 20% 35% 10% 10% 5%',
                                    'padding': '5px 0px',
                                    'border': '1px solid #ccc',
                                    'margin': '5px',
                                    'border-radius': '5px',
                                }}>
                                    <div>
                                        {v.name}
                                    </div>
                                    <div>
                                        <Tien
                                            // label={'Giá ' + (ind + 1) + ':'}
                                            value={v.price}
                                            spacechar={'.'}
                                            // canInput={true}
                                            // style={{}}
                                        />
                                    </div>
                                    <div>
                                        {v.noidung}
                                    </div>
                                    <div>
                                        {v.locationName}
                                    </div>
                                    <div>
                                        {handung}
                                    </div>
                                    <div 
                                        style={{
                                            'padding': '10px',
                                            'color': coloredit,
                                        }}
                                        onClick={() => {
                                            let lBieuPhi = this.state.listBieuPhiDichVu;
                                            lBieuPhi.map((v1, i1) => {
                                                if (i1 == i) {
                                                    let check = false;
                                                    if (v1.permissionAllowed != null) {
                                                        for (let per of v1.permissionAllowed.split(' ')){
                                                            if (per == this.state.yourPermission) {
                                                                check = true;
                                                                break;
                                                            }
                                                        }
                                                    }

                                                    if (check) {
                                                        if (v1.isEdit == true) {
                                                            v1.isEdit = false;
                                                        } else {
                                                            v1.isEdit = true;
                                                        }
                                                    } else {
                                                        this.props.dispatch({
                                                            type: 'ALERT_NOTIFICATION_ADD',
                                                            content: 'Bạn không thể chỉnh sửa mục này!',
                                                            notifyType: 'warning',
                                                        })
                                                    }
                                                }
                                            })
                                            this.setState({listBieuPhiDichVu: lBieuPhi});
                                        }}
                                    >
                                        <i class="fa fa-wrench fa-lg" aria-hidden="true"></i>
                                    </div>
                                    {editBox}
                                </div>
                            );
                        })
                    }
                </div>
            </div>
        )
    }
}

module.exports = connect(function (state) {
    return {
      socket: state.socket,
    };
}) (DichVu);
