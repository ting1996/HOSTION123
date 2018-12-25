import React from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import style from '../../style.css';

class RowCSKH extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tinhtrangcuocgoi: null,
            mucdohailong: null,
            loaithaido: null,
            loainhucau: null,
            tinhhinhsudungsanpham: null,
            kehoachhoche: null,
            soluongkehoachtrongngay: null,
            nhanvienph: null,

            now: 0,
            isLoad: false,
            shownext: 'none',
            showback: 'none',
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
                }                
            }
        }  
    }

    componentDidMount () {
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
        this.setState({
            now: this.props.data_old.length - 1,
            isLoad: true,
        })
        
        try {
            this.props.accept(this.dongy.bind(this));
        } catch (error) {
            
        }
    }

    componentWillUnmount() {
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.isLoad == true) {
            this.loadData_Old();
            this.setState({isLoad: false});
        }
    }

    dongy () {
        let data = this.props.data_old[this.state.now];
        if (data != null) {
            let check = false;
            this.refs.tinhtrangcuocgoi.wrapper.getElementsByClassName('Select-control')[0].style.borderColor = 'rgb(204, 204, 204)';
            this.refs.mucdohailong.wrapper.getElementsByClassName('Select-control')[0].style.borderColor = 'rgb(204, 204, 204)';
            this.refs.noidungcuocgoi.style.borderColor = 'rgb(204, 204, 204)';
            this.refs.ngaykehoach.style.borderColor = 'rgb(204, 204, 204)';
            this.refs.kehoach.style.borderColor = 'rgb(204, 204, 204)';

            if (this.state.tinhtrangcuocgoi == null) {
                this.refs.tinhtrangcuocgoi.wrapper.getElementsByClassName('Select-control')[0].style.borderColor = 'red';
                check = true;
            } else if (this.state.tinhtrangcuocgoi.value == 'Cuộc gọi thành công') {
                if (this.state.mucdohailong == null) {
                    this.refs.mucdohailong.wrapper.getElementsByClassName('Select-control')[0].style.borderColor = 'red';
                    check = true;
                }
                
                if (this.refs.noidungcuocgoi.value.trim() == '') {
                    this.refs.noidungcuocgoi.style.borderColor = 'red';
                    check = true;
                }

                if (this.refs.ngaykehoach.value.trim() == '') {
                    this.refs.ngaykehoach.style.borderColor = 'red';
                    check = true;
                }

                if (this.refs.kehoach.value.trim() == '') {
                    this.refs.kehoach.style.borderColor = 'red';
                    check = true;
                }
            }

            if (check) {
                return;
            }

            let id = data['ID'];
            let ngaykehoach = this.refs.ngaykehoach.value;
            let kehoach = this.refs.kehoach.value.trim();
            let tinhtrangcuocgoi = this.state.tinhtrangcuocgoi.value;
            let mucdohailong = this.state.mucdohailong;
            if (mucdohailong != null) {
                mucdohailong = this.state.mucdohailong.value;
            }
            let noidungcuocgoi = this.refs.noidungcuocgoi.value.trim();
            noidungcuocgoi = noidungcuocgoi.replace(/\\/g, '\\\\');
            noidungcuocgoi = noidungcuocgoi.replace(/'/g, '\\\'');
            let phanloaimucdo = this.refs.phanloaimucdo.value;

            let query = '';
            query = 'UPDATE `CHAMSOCKHACHHANG` SET `Tình Trạng Cuộc Gọi` = \'!\?!\', `Mức Độ Hài Lòng` = \'!\?!\', `Phân Loại Mức Độ` = \'!\?!\', `Nội Dung Cuộc Gọi` = \'!\?!\', `Ngày Kế Hoạch` = \'!\?!\', `Kế Hoạch` = \'!\?!\' WHERE (`ID` = \'!\?!\'); ';
            
            query = query.replace('!\?!', tinhtrangcuocgoi);
            query = query.replace('!\?!', mucdohailong);
            query = query.replace('!\?!', phanloaimucdo);
            query = query.replace('!\?!', noidungcuocgoi);
            query = query.replace('!\?!', ngaykehoach);
            query = query.replace('!\?!', kehoach);
            query = query.replace('!\?!', id);
            query = query.replace(/\'null\'/g, 'null');
            query = query.replace(/\'\'/g, 'null');            
            
            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                isReload: true,
                isSuccess: true,
            });
        } else {
            try {
                this.props.close();
            } catch (error) {
                
            }
        }
    }

    loadData_Old () {
        if (this.props.data_old != null && this.props.data_old.length > 0) {
            let __now = this.state.now;
            let data = this.props.data_old[__now];            
            this.refs.old_hovatennhanvien.value = data['Họ Tên Nhân Viên'];
            if (data['Ngày Gọi'] != '' && data['Ngày Gọi'] != null) {
                this.refs.old_ngaygoi.value = new Date(data['Ngày Gọi']).toLocaleDateString('en-GB') + ' ' + new Date(data['Ngày Gọi']).toLocaleTimeString();
            }
            this.refs.noidungcuocgoi.value = data['Nội Dung Cuộc Gọi'];
            if (data['Ngày Kế Hoạch'] != '' && data['Ngày Kế Hoạch'] != null) {
                let date = new Date(data['Ngày Kế Hoạch']);
                this.refs.ngaykehoach.value = date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2);
            }
            this.refs.kehoach.value = data['Kế Hoạch'];
            let old_tinhtrangcuocgoi = data['Tình Trạng Cuộc Gọi'];
            if (old_tinhtrangcuocgoi != null) {
                old_tinhtrangcuocgoi = {value: old_tinhtrangcuocgoi, label: old_tinhtrangcuocgoi};
            }
            let old_mucdohailong = data['Mức Độ Hài Lòng'];
            if (old_mucdohailong != null) {
                old_mucdohailong = {value: old_mucdohailong, label: old_mucdohailong};
            }
            this.refs.phanloaimucdo.value = data['Phân Loại Mức Độ'];
            let shownext = 'block';
            let showback = 'block';
            if (__now == 0) {
                showback = 'none';
            }
            if (__now == (this.props.data_old.length - 1)) {
                shownext = 'none';
            }

            this.setState({
                now: __now,
                shownext: shownext,
                showback: showback,
                tinhtrangcuocgoi: old_tinhtrangcuocgoi,
                mucdohailong: old_mucdohailong,           
            })
        }
    }

    back () {
        if (this.props.data_old != null && this.props.data_old.length > 0) {
            let __now = this.state.now - 1;
            this.setState({
                now: __now,
                isLoad: true,
            })
        }
    }

    next () {
        if (this.props.data_old != null && this.props.data_old.length > 0) {
            let __now = this.state.now + 1;
            this.setState({
                now: __now,
                isLoad: true,
            })
        }
    }

    render () {
        return (
            <div>
                <fieldset style={{
                    'margin': '5px 16px',
                    'padding': '0',
                }}>
                    <legend>
                        <div style={{
                            'float': 'left',
                            'padding': '0 10px',
                            'display': this.state.showback,
                        }} onClick={this.back.bind(this)} className="custombutton">
                            <i class="fa fa-chevron-circle-left" aria-hidden="true"></i>
                        </div>
                        {'Lịch Sử Cuộc Gọi'}
                        <div style={{
                            'float': 'right',
                            'padding': '0 10px',
                            'display': this.state.shownext,
                        }} onClick={this.next.bind(this)} className="custombutton">
                            <i class="fa fa-chevron-circle-right" aria-hidden="true"></i>
                        </div>
                    </legend>
                    <div style={{
                        "display": "grid",
                        "grid-template-columns": "33.33% 33.33% 33.33%",
                    }}>
                        <div className='divformstyle'>
                            <div>
                                <label for="" >Họ Và Tên Nhân Viên: </label>
                                <input type="text" name="" ref='old_hovatennhanvien' disabled={true} className='read_only'/>
                            </div>
                            <div>
                                <label for="" >Ngày Gọi: </label>
                                <input type="text" name="" ref='old_ngaygoi' disabled={true} className='read_only'/>
                            </div>
                            <div>
                                <label for="" >Nội Dung Cuộc Gọi: </label>
                                <textarea 
                                    ref="noidungcuocgoi"
                                    rows="4"
                                    cols="50"
                                    style={{'height' : '170px'}}>
                                </textarea>
                            </div>
                        </div>
                        <div>
                            <div className="unsetdivformstyle">
                                Tình Trạng Cuộc Gọi:
                                <Select
                                    placeholder="--- Tình Trạng Cuộc Gọi ---"
                                    value={this.state.tinhtrangcuocgoi}
                                    options={this.props.bangthongtin['Tình Trạng Cuộc Gọi']}
                                    onChange={(v) => {this.setState({tinhtrangcuocgoi: v})}}
                                    ref="tinhtrangcuocgoi"
                                />
                            </div>
                            <div className="unsetdivformstyle">
                                Mức Độ Hài Lòng:
                                <Select
                                    placeholder="--- Mức Độ Hài Lòng ---"
                                    value={this.state.mucdohailong}
                                    options={this.props.bangthongtin['Mức Độ Hài Lòng']}
                                    onChange={(v) => {this.setState({mucdohailong: v})}}
                                    ref="mucdohailong"
                                />
                            </div>
                            <div className='divformstyle'>
                                <div>
                                    Tình Trạng Chăm Sóc:
                                    <select ref="phanloaimucdo">
                                        <option value="0">Phản hồi theo chu kỳ</option>
                                        <option value="1">Phản hồi gấp</option>
                                    </select>
                                </div>
                            </div>                            
                            <div className='divformstyle'>
                                <div>
                                    <label for="" >Ngày Kế Hoạch: </label>
                                    <input type="date" name="" ref='ngaykehoach'/>
                                </div>
                                <div>
                                    <label for="" >Kế Hoạch: </label>
                                    <textarea 
                                        ref="kehoach"
                                        rows="4"
                                        cols="50"
                                        style={{'height' : '50px'}}>
                                    </textarea>
                                </div>
                            </div>
                        </div>
                        <div>
                        <div className="unsetdivformstyle">
                                <label for="">Nhân Viên Phản Hồi: </label>
                                <Select
                                    placeholder="--- Nhân Viên Phản Hồi ---"
                                    value={this.state.nhanvienph}
                                    options={this.props.listNhanvienph}
                                    onChange={(v) => {
                                        this.setState({nhanvienph: v})
                                        if (v != null
                                        && v['Nội Dung Phản Hồi'] != null) {
                                            this.refs.old_phanhoi.value = v['Nội Dung Phản Hồi'];
                                        } else {
                                            this.refs.old_phanhoi.value = '';
                                        }
                                    }}
                                />
                            </div>
                            <div className='divformstyle'>
                                <div>
                                    <label for="">Nội Dung Phản Hồi: </label>
                                    <textarea 
                                        ref="old_phanhoi"
                                        style={{'height' : '175px'}}
                                        disabled={true}
                                        className='read_only'>
                                    </textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </fieldset>
            </div>
        )
    }
}

module.exports = connect(function (state) {
    return {
      socket: state.socket,
    };
}) (RowCSKH);
