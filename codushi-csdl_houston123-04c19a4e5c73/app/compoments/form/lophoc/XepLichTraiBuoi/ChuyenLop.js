import React from 'react';
import { connect } from 'react-redux';
import style from '../../style.css';
var ReactDOM = require('react-dom');

class ChuyenLop extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            thu: [],
            gio: [],
            thuchuyentoi: [],
            giochuyentoi: [],
            lichlopchuyentoi: [],
            fist: false,
            repeat: true,
            fist_load: false,
            fist_loadgio: false,
        }
        this.callBackDataFormDatabase = this.callBackDataFormDatabase.bind(this);
    }

    callBackDataFormDatabase ( rows, hanhdong, dulieuguive ) {
        if (hanhdong == 'laydulieu_trave') {
            if (dulieuguive != null) {
                switch (dulieuguive.fn) {
                    case 'xeplichhoctraibuoi_chuyenlop_laygiohoc' + this.props.mahocsinh + '' + this.props.id:        
                        let arry = [];
                        for (let val of rows) {
                            if (arry.indexOf(val['Thứ']) == -1) {
                                arry.push(val['Thứ']);
                            }
                        }
            
                        let arry2 = [];
                        for (let val of rows) {
                            if (val['Thứ'] == arry[0]) {
                                arry2.push(val['Giờ Bắt Đầu']);
                            }
                        }
            
                        this.setState({
                            thuchuyentoi: arry,
                            giochuyentoi: arry2,
                            lichlopchuyentoi: rows,
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
        let socket = this.props.socket;
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
        this.refs.repeat.checked = true;
        this.props.getMe(this);
    }

    componentWillUnmount() {
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentDidUpdate(prevProps, prevState) {
        if (!this.state.fist_load && this.state.thuchuyentoi.length > 0 && this.props.thoigianchuyen != null) {
            let timechuyen = this.props.thoigianchuyen.split('>');
            if (timechuyen.length > 0) {
                let repeat;
                if (timechuyen[2] ==  'r') {
                    repeat = true;
                } else {
                    repeat = false;
                    this.refs.once.checked = true;
                }
                let di = timechuyen[0].split('-');
                let den = timechuyen[1].split('-');
                this.refs.thuchuyendi.value = di[0];
                this.refs.thuchuyentoi.value = den[0];
                this.refs.lopchuyentoi.value = this.props.malopchuyen;

                let arry = [];
                for (let val of this.props.giohoc) {
                    if (val['Thứ'] == this.refs.thuchuyendi.value) {
                        arry.push(val['Giờ Bắt Đầu'])
                    }
                }

                let arry2 = [];
                for (let val of this.state.lichlopchuyentoi) {
                    if (val['Thứ'] == this.refs.thuchuyentoi.value) {
                        arry2.push(val['Giờ Bắt Đầu'])
                    }
                }

                this.setState({
                    fist_load: true,
                    gio: arry,
                    giochuyentoi: arry2,
                    repeat: repeat,
                });
            }
        }

        if (!this.state.fist_loadgio && this.state.fist_load && this.state.gio.length > 0 && this.state.giochuyentoi.length > 0) {
            let timechuyen = this.props.thoigianchuyen.split('>');
            if (timechuyen.length > 0) {
                if (timechuyen[2] == 'o') {
                    this.refs.ngaycuthe.value = timechuyen[3];
                }

                let di = timechuyen[0].split('-');
                let den = timechuyen[1].split('-');
                this.refs.giochuyendi.value = di[1];
                this.refs.giochuyentoi.value = den[1];
                this.setState({fist_loadgio: true});
            }
        }
    }

    thuchuyendiChange () {
        let arry = [];
        for (let val of this.props.giohoc) {
            if (val['Thứ'] == this.refs.thuchuyendi.value) {
                arry.push(val['Giờ Bắt Đầu'])
            }
        }
        this.setState({gio: arry})
    }

    lopchuyentoiChange () {
        let malop = this.refs.lopchuyentoi.value;
        let query = 'SELECT * FROM LICHHOC WHERE `Mã Lớp` = \'?\' ORDER BY `Thứ` ASC'
        query = query.replace('?', malop);
        this.props.socket.emit('gui-query-den-database', query, 'laydulieu_trave', {
            fn : 'xeplichhoctraibuoi_chuyenlop_laygiohoc' + this.props.mahocsinh + '' + this.props.id,
        });
    }

    thuchuyentoiChange () {
        let arry = [];
        for (let val of this.state.lichlopchuyentoi) {
            if (val['Thứ'] == this.refs.thuchuyentoi.value) {
                arry.push(val['Giờ Bắt Đầu'])
            }
        }
        this.setState({giochuyentoi: arry})
    }

    huy () {
        this.props.onClickXoa(this.props.id);
    }

    repeatChange () {
        this.setState({repeat: this.refs.repeat.checked});
    }

    dongy () {

    }

    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    }

    render () {
        let hide = 'grid';
        if (this.props.hide == true) {
            hide = 'none';
        }

        if (this.props.giohoc.length > 0 && this.state.thu.length <= 0) {
            let arry = [];
            for (let val of this.props.giohoc) {
                if (arry.indexOf(val['Thứ']) == -1) {
                    arry.push(val['Thứ']);
                }
            }

            let arry2 = [];
            for (let val of this.props.giohoc) {
                if (val['Thứ'] == arry[0]) {
                    arry2.push(val['Giờ Bắt Đầu']);
                }
            }

            this.setState({
                thu: arry,
                gio:arry2,
            });
        }

        if (this.props.lopchuyentoi.length > 0 && !this.state.fist) {
            let malop = this.props.lopchuyentoi[0]['Mã Lớp'];
            if (this.props.malopchuyen != null && this.props.malopchuyen != '') {
                malop = this.props.malopchuyen;
            }
            let query = 'SELECT * FROM LICHHOC WHERE `Mã Lớp` = \'?\' ORDER BY `Thứ` ASC';
            query = query.replace('?', malop);
            this.props.socket.emit('gui-query-den-database', query, 'laydulieu_trave', {
                fn : 'xeplichhoctraibuoi_chuyenlop_laygiohoc' + this.props.mahocsinh + '' + this.props.id,
            });
            this.setState({fist: true});
        }

        let xhtml;
        if (this.state.repeat != true) {
            xhtml = <input type="date" name="date" ref='ngaycuthe' style={{'width': 'auto'}}/>
        }

        return (
            <div style={{
                'padding': '2px',
                'grid-column-start': '1',
                'grid-column-end': '3',
                'display': hide,
                'grid-template-columns': '93% 7%',
                'background': 'lightgray',
                'border': '1px solid #888',
            }}>
                <div style={{'padding': '0'}}>
                    <div>
                        <form>
                            Lặp Lại:
                            <input 
                                type="radio" 
                                name="loai"
                                style={{'width': 'auto'}}
                                value="repeat"
                                ref="repeat"
                                onClick={this.repeatChange.bind(this)}
                            />
                            Một Lần:
                            <input 
                                type="radio" 
                                name="loai" 
                                style={{'width': 'auto'}}
                                value="once"
                                ref="once"
                                onClick={this.repeatChange.bind(this)}
                            />
                            {xhtml}
                        </form>
                    </div>
                    <div style={{
                        'padding': '0',
                        'display': 'grid',
                        'grid-template-columns': '50% 50%',
                    }}>
                        <div style={{'padding': '0',}}>
                            <label for="">Thứ Chuyển Đi: </label>
                            <select ref="thuchuyendi" onChange={this.thuchuyendiChange.bind(this)}>
                                {
                                    this.state.thu.map((v, i) => {
                                        let content = v;
                                        if (v == 1) {
                                            content = 'CN';
                                        }
                                        return (
                                            <option key={i} value={v}>{content}</option>
                                        )
                                    })
                                }
                            </select>
                        </div>
                        <div style={{'padding': '0',}}>
                            <label for="">Giờ Chuyển Đi: </label>
                            <select ref="giochuyendi">
                                {
                                    this.state.gio.map((v, i) => {
                                        return (
                                            <option key={i} value={v}>{v}</option>
                                        )
                                    })
                                }
                            </select>
                        </div>
                    </div>
                    <div style={{
                        'padding': '0',
                        'display': 'grid',
                        'grid-template-columns': '40% 20% 40%',
                    }}>
                        <div style={{'padding': '0',}}>
                            <label for="">Lớp Chuyển Tới: </label>
                            <select ref="lopchuyentoi" onChange={this.lopchuyentoiChange.bind(this)}>
                                {
                                    this.props.lopchuyentoi.map((v, i) => {
                                        return (
                                            <option key={i} value={v['Mã Lớp']}>{v['Mã Lớp']}</option>
                                        )
                                    })
                                }
                            </select>
                        </div>
                        <div style={{'padding': '0',}}>
                            <label for="">Thứ C.Tới: </label>
                            <select ref="thuchuyentoi" onChange={this.thuchuyentoiChange.bind(this)}>
                                {
                                    this.state.thuchuyentoi.map((v, i) => {
                                        let content = v;
                                        if (v == 1) {
                                            content = 'CN';
                                        }
                                        return (
                                            <option key={i} value={v}>{content}</option>
                                        )
                                    })
                                }
                            </select>
                        </div>
                        <div style={{'padding': '0',}}>
                            <label for="">Giờ Chuyến Tới: </label>
                            <select ref="giochuyentoi">
                                {
                                    this.state.giochuyentoi.map((v, i) => {
                                        return (
                                            <option key={i} value={v}>{v}</option>
                                        )
                                    })
                                }
                            </select>
                        </div>
                    </div>
                </div>
                <div style={{'padding': '0', 'text-align': 'center'}}>
                    <a 
                        href="javascript:void(0)" 
                        style={{
                            'line-height': '135px',
                            'color': 'red',
                        }}
                        onClick={this.huy.bind(this)}
                    >
                        <i className="fa fa-minus fa-lg" aria-hidden="true"></i>
                    </a>
                </div>
            </div>
        )   
    }
}

module.exports = connect(function (state) {
    return {
      socket: state.socket,
    };
  }) (ChuyenLop);
