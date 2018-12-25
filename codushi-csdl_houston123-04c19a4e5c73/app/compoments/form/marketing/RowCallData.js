import React from 'react';
import { connect } from 'react-redux';
import style from '../style.css';
var ReactDOM = require('react-dom');
import SoDienThoai from '../SoDienThoai';
import Select from 'react-select';

class RowCallData extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tinhtrangcuocgoi: null,
        }
        this.callBackDataFormDatabase = this.callBackDataFormDatabase.bind(this);
    }

    callBackDataFormDatabase ( rows, hanhdong, dulieuguive ) {
        if (hanhdong == 'laydulieu_trave') {
            if (dulieuguive != null) {
                switch (dulieuguive.fn) {
                    case 'dangkymonhoc_loaddanhsachmonhoc':
                        // console.log(rows);
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
        this.props.getMe(this);

        if (this.props.data != null) {
            let rows = this.props.data;
            this.refs.hovaten.value = rows['Họ Và Tên'];
            this.sodienthoai.setState({value: rows['Số Điện Thoại']});
            this.sodienthoai.refs.input.disabled = true;
            this.sodienthoai.refs.input.className += ' read_only';
            this.sodienthoai1.setState({value: rows['Số Điện Thoại (NT1)']});
            this.sodienthoai1.refs.label.innerText = 'Số Điện Thoại (NT1)';
            this.sodienthoai1.refs.input.disabled = true;
            this.sodienthoai1.refs.input.className += ' read_only';
            this.sodienthoai2.setState({value: rows['Số Điện Thoại (NT2)']});
            this.sodienthoai2.refs.label.innerText = 'Số Điện Thoại (NT2)';
            this.sodienthoai2.refs.input.disabled = true;
            this.sodienthoai2.refs.input.className += ' read_only';
        }
    }

    componentWillUnmount() {
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentDidUpdate(prevProps, prevState) {
    }

    onChangeTinhTrangCuocGoi (e) {
        this.setState({tinhtrangcuocgoi: e});
    }

    dongy () {
        if (this.state.tinhtrangcuocgoi != null) {
            let id = this.props.data['ID'];
            let manhanvien = $('#lable_button_nexttoicon').attr('value');
            
            let ngaykehoach = this.refs.ngaykehoach.value;
            let date = new Date().toLocaleDateString('en-GB').split('/');
            let time = new Date().toLocaleTimeString('en-GB').split('/');
            let ngaygoi = date[2] + '-' + date[1] + '-' + date[0] + ' ' + time;
            let tinhtrangcuocgoi = this.state.tinhtrangcuocgoi.value;
            let phanhoi = this.refs.phanhoi.value;
            let coso = $('.khuvuc').attr('value');
    
            let query = '';
            query = 'ALTER TABLE `quanlyhocsinh`.`MARKETING` AUTO_INCREMENT = 1; ' +
            'INSERT INTO `quanlyhocsinh`.`CALLDATA` (`ID-DATA`, `Mã Nhân Viên Gọi Điện`, `Ngày Kế Hoạch`, `Ngày Gọi`, `Tình Trạng Cuộc Gọi`, `Phản Hồi`) VALUES (\'?\', \'?\', \'?\', \'?\', \'?\', \'?\')';
            query = query.replace('?', id);
            query = query.replace('?', manhanvien);
            if (ngaykehoach == '') {
                query = query.replace('?', 'null');
            } else {
                query = query.replace('?', ngaykehoach);
            }
            query = query.replace('?', ngaygoi);
            query = query.replace('?', tinhtrangcuocgoi);
            query = query.replace('?', phanhoi);
            query = query.replace(/\'null\'/g, 'null');
            
            this.props.socket.emit('gui-query-den-database', query , 'laydulieu_trave', {
                isReload: true,
                isSuccess: true,
            });
        }
    }

    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    }

    render () {
        return (
            <div style={{
                'padding': '0',
                'display': 'grid',
                'grid-template-columns': '50% 50%',
                'border': '1px solid #888',
            }}>
                <div className='divformstyle'>
                    <div>
                        <label for="" >Họ Và Tên: </label>
                        <input type="text" name="" ref='hovaten' disabled={true} className='read_only'/>
                    </div>
                    <div>
                        <SoDienThoai getMe={me => this.sodienthoai = me}/>
                    </div>
                    <div>
                        <SoDienThoai getMe={me => this.sodienthoai1 = me}/>
                    </div>
                    <div>
                        <SoDienThoai getMe={me => this.sodienthoai2 = me}/>
                    </div>
                </div>
                <div>
                    <div className="unsetdivformstyle">
                        <label for="Tình Trạng Cuộc Gọi">Tình Trạng Cuộc Gọi: </label>
                        <Select
                            name="Tình Trạng Cuộc Gọi"
                            placeholder="--- Tình Trạng Cuộc Gọi ---"
                            value={this.state.tinhtrangcuocgoi}
                            options={this.props.tinhtrangcuocgoi}
                            onChange={this.onChangeTinhTrangCuocGoi.bind(this)}
                        />
                    </div>
                    <div className='divformstyle'>
                        <div>
                            <label for="" >Ngày Kế Hoạch: </label>
                            <input type="date" name="" ref='ngaykehoach'/>
                        </div>
                        <div>
                            <label for="" >Phản Hồi: </label>
                            <textarea 
                                ref="phanhoi" 
                                rows="4" 
                                cols="50" 
                                maxLength="1000" 
                                style={{'height' : '75px'}}
                            ></textarea>
                        </div>
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
  }) (RowCallData);
