import React from 'react';
import { connect } from 'react-redux';
import style from './style.css';
import Select from 'react-select';
var ReactDOM = require('react-dom');

class DiaChi extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            lv1: null,
            lv2: null,
            lv3: null,
            lv4: {value: null},
            listvl1: [],
            listvl2: [],
            listvl3: [],
            fullList: [],
            borderColor: 'rgb(204, 204, 204)',
            setdefault: false,
            default: null,          
        }
        this.callBackDataFormDatabase = this.callBackDataFormDatabase.bind(this);
        this.value = this.value.bind(this);
    }

    callBackDataFormDatabase ( rows, hanhdong, dulieuguive ) {
        if (hanhdong == 'laydulieu_trave') {
            if (dulieuguive != null) {
                switch (dulieuguive.fn) {
                    case '____diachi____element____load_____':
                        let listvl1 = [];
                        for (let value of rows) {
                            let lv1 = {value: value['LV1'], label: value['LV1']};
                            if (listvl1.findIndex(obj => obj.value == lv1.value) == -1) {
                                listvl1.push(lv1);
                            }
                        }
                        this.setState({
                            fullList: rows,
                            listvl1: listvl1,
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
        try {
            this.props.getMe(this);
        } catch (e) {
            
        }

        query = 'SELECT * FROM quanlyhocsinh.DIACHI';
        this.props.socket.emit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : '____diachi____element____load_____',
        });
    }

    componentWillUnmount() {
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.fullList.length > 0 && !this.state.setdefault && this.state.default != null) {
            let diachi = this.state.default.split(', ');
            let listvl2 = [];
            let listvl3 = [];
            let setLV1 = null;
            let setLV2 = null;
            let setLV3 = null;
            for (let value of this.state.fullList) {
                let lv1 = {value: value['LV1'], label: value['LV1']};
                if (lv1.value == diachi[0]) {
                    setLV1 = lv1;
                    let lv2 = {value: value['LV2'], label: value['LV2']};
                    if (listvl2.findIndex(obj => obj.value == lv2.value) == -1) {
                        listvl2.push(lv2);
                    }
                    if (lv2.value == diachi[1]) {
                        setLV2 = lv2;
                        let lv3 = {value: value['LV3'], label: value['LV3']};
                        if (listvl3.findIndex(obj => obj.value == lv3.value) == -1) {
                            listvl3.push(lv3);
                        }
                        if (lv3.value == diachi[2]) {
                            setLV3 = lv3;
                        }
                    }
                }
            }

            diachi.splice(0, 3);
            diachi = diachi.join(', ');

            this.setState({
                setdefault: true,
                lv1: setLV1,
                lv2: setLV2,
                lv3: setLV3,
                lv4: {value: diachi},
                listvl2: listvl2,
                listvl3: listvl3, 
            })
        }
    }

    value () {
        if (arguments[0] != null) {
            this.setState({
                default: arguments[0].toString(),
                setdefault: false,
            });
        } else {
            let diachi = null;
            if (
                this.state.lv1 != null && 
                this.state.lv2 != null && 
                this.state.lv3 != null
            ) {
                let lv4 = this.state.lv4.value;
                if (lv4 == null) {
                    lv4 = '';
                }
                diachi = this.state.lv1.value + ', ' +
                this.state.lv2.value + ', ' +
                this.state.lv3.value + ', ' + lv4;
            }
            return diachi;
        }
    }

    onKeyPress (event) {
        var inputValue = event.which;
        if (( inputValue >= 48 && inputValue <=57) 
        || ( inputValue == 8 ) 
        || ( inputValue == 0 ) 
        || ( inputValue == 43 )
        || ( inputValue == 45 )) {
            return;
        }
        event.preventDefault();
    }

    onChange1 (e) {
        let rows = this.state.fullList;
        let listvl2 = [];
        let listvl3 = [];
        for (let value of rows) {
            let lv1 = {value: value['LV1'], label: value['LV1']};
            if (e != null)
            {
                if (lv1.value == e.value) {
                    let lv2 = {value: value['LV2'], label: value['LV2']};
                    if (listvl2.findIndex(obj => obj.value == lv2.value) == -1) {
                        listvl2.push(lv2);
                    }
                }
            }
        }
        this.setState({
            lv1: e,
            lv2: null,
            lv3: null,
            listvl2: listvl2,
            listvl3: listvl3,
        });
    }

    onChange2 (e) {
        let rows = this.state.fullList;
        let listvl3 = [];
        for (let value of rows) {
            let lv2 = {value: value['LV2'], label: value['LV2']};
            if (e != null) 
            {
                if (lv2.value == e.value) {
                    listvl3.push({value: value['LV3'], label: value['LV3']});
                }
            }
        }
        this.setState({
            lv2: e,
            lv3: null,
            listvl3: listvl3,
        });
    }

    onChange3 (e) {
        this.setState({
            lv3: e,
        });
    }

    onChange4 (e) {
        this.setState({lv4: {value: e.target.value}})
    }

    dongy () {
    }

    close () {
    }

    render () {
        return (
            <div style={{'padding': '0'}}>
                <label for="">Địa Chỉ: </label>
                <Select
                    name="LV1"
                    placeholder="Tỉnh/Thành Phố"
                    value={this.state.lv1}
                    options={this.state.listvl1}
                    onChange={this.onChange1.bind(this)}
                    style={{'border-color': this.state.borderColor}}
                />
                <Select
                    name="LV2"
                    placeholder="Quận/Huyện"
                    value={this.state.lv2}
                    options={this.state.listvl2}
                    onChange={this.onChange2.bind(this)}
                    style={{'border-color': this.state.borderColor}}
                />
                <Select
                    name="LV3"
                    placeholder="Phường/Xã"
                    value={this.state.lv3}
                    options={this.state.listvl3}
                    onChange={this.onChange3.bind(this)}
                    style={{'border-color': this.state.borderColor}}
                />
                <div className="divformstyle">
                    <input 
                        type="text" 
                        name="LV4"
                        placeholder="Số Nhà/Đường"
                        onChange={this.onChange4.bind(this)} 
                        value={this.state.lv4.value}
                        style={{'border-color': this.state.borderColor}}
                    />
                </div>
            </div>
        )
    }
}

module.exports = connect(function (state) {
    return {
      socket: state.socket,
    };
  }) (DiaChi);
