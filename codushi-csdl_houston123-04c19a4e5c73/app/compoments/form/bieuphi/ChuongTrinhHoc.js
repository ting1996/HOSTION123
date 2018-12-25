import React from 'react';
import { connect } from 'react-redux';
var ReactDOM = require('react-dom');
import mystyle from './style.css';
import Tien from '../Tien';

import MultiSelectList from '../elements/MultiSelectList';

class ChuongTrinhHoc extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            listBieuPhiDichVu: [],
            listMonHoc: [],
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
                    case 'form_bieuphi_chuongtrinhhoc_loadchuongtrinhhocbosung':
                        let per = null;
                        if (rows[0] != null && rows[0][0] != null) {
                            per = rows[0][0].permission;
                        }

                        for (let _mon of rows[2]) {
                            _mon.label = _mon['Mã Môn Học'] + ' - ' + _mon['Tên Môn'];
                        }

                        this.setState({
                            listBieuPhiDichVu: rows[1],
                            listMonHoc: rows[2],
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
        query += 'SELECT CHUONGTRINHHOCBOSUNG.*, COSO.`Tên Cơ Sở` AS `locationName` FROM CHUONGTRINHHOCBOSUNG ' +
        'LEFT JOIN COSO ON COSO.`Cơ Sở` = CHUONGTRINHHOCBOSUNG.`Cơ Sở` ' +
        'WHERE CHUONGTRINHHOCBOSUNG.`Cơ Sở` = \'!\?!\' OR CHUONGTRINHHOCBOSUNG.`Cơ Sở` = \'ALL\'; ';
        query = query.replace('!\?!', $('#lable_button_nexttoicon').attr('value'));
        query = query.replace('!\?!', $('.khuvuc').attr('value'));
        query += 'SELECT * FROM quanlyhocsinh.MONHOC_!\?!; '
        query = query.replace('!\?!', $('.khuvuc').attr('value'));
        this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', { 
            fn: 'form_bieuphi_chuongtrinhhoc_loadchuongtrinhhocbosung'
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
                            let ct = JSON.parse(v['Chương Trình Học']);
                            let arraySelected = [];
                            let arraySelection = [];
                            for (let i in ct) {
                                if (ct.hasOwnProperty(i)) {
                                    this.state.listMonHoc.map(v => {
                                        if (ct[i].mamon == v['Mã Môn Học']) {
                                            ct[i].tenmon = v['Tên Môn'];
                                            ct[i].label = v.label;
                                        }
                                    })
                                    arraySelected.push(ct[i])
                                }
                            }

                            this.state.listMonHoc.map(v => {
                                let addmon = true;
                                for (let i in ct) {
                                    if (ct[i].mamon == v['Mã Môn Học']) {
                                        addmon = false;
                                        break;
                                    }
                                }
                                if (addmon == true) {
                                    arraySelection.push({...v})
                                }
                            })

                            let handung = 'Không giới hạn';
                            let coloredit = '#000';
                            let editBox = '';
                            if (v.isEdit == true) {
                                // console.log(this.state.listMonHoc);
                                coloredit = '#007eff';
                                editBox = 
                                <div 
                                    className={mystyle.editBox}
                                    style={{
                                        'display': 'grid',
                                        'grid-template-columns': '50% 50%',
                                    }}
                                >
                                    <MultiSelectList 
                                        options={arraySelection}
                                        optionsSelected={arraySelected}
                                        ref='danhsachmonhoc'
                                    />
                                    <MultiSelectList 
                                        options={arraySelected}
                                        ref='danhsachmonhoc'
                                    />
                                </div>
                            }

                            let chuongtrinhhoc = '';
                            if (v['Chương Trình Học'] != null) {
                                let ct = JSON.parse(v['Chương Trình Học']);
                                chuongtrinhhoc = 
                                <div style={{'display': 'flex','flex-wrap': 'wrap',}}>
                                {arraySelected.map((v, i) => {
                                    return (
                                        <div style={{
                                            'border-radius': '20px',
                                            'background': '#007eff',
                                            'padding': '5px',
                                            'margin': '5px',
                                            'color': 'white',
                                            'width': 'fit-content',
                                        }}>
                                            {v.mamon + ' - ' + v.tenmon}
                                        </div>
                                    )
                                })}
                                </div>
                            }

                            return (
                                <div style={{
                                    'display': 'grid',
                                    'grid-template-columns': '20% 55% 10% 10% 5%',
                                    'padding': '5px 0px',
                                    'border': '1px solid #ccc',
                                    'margin': '5px',
                                    'border-radius': '5px',
                                }}>
                                    <div>
                                        {v['Tên Chương Trình']}
                                    </div>
                                    <div>
                                        {chuongtrinhhoc}
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
}) (ChuongTrinhHoc);
