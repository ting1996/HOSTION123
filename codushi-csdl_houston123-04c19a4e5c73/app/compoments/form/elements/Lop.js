{/* <Lop
    ref="lop"
    onChange={this.onChangeMonVaLop.bind(this)}
/> */}

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 

} from '@fortawesome/free-solid-svg-icons';

import mystyle from './stylelop.css';

class Lop extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            listClass: [
                {value: 'DT', label: 'Dự Thính'},
                {value: 'MN', label: 'Mầm Non'},
                {value: '1', label: '1'},
                {value: '2', label: '2'},
                {value: '3', label: '3'},
                {value: '4', label: '4'},
                {value: '5', label: '5'},
                {value: '6', label: '6'},
                {value: '7', label: '7'},
                {value: '8', label: '8'},
                {value: '9', label: '9'},
                {value: '10', label: '10'},
                {value: '11', label: '11'},
                {value: '12', label: '12'},
                {value: 'SV', label: 'Sinh Viên'},
                {value: 'DL', label: 'Đi Làm'},
            ]
        }
    }

    componentDidMount () {
        this.update();
    }

    componentWillUnmount() {
    }

    componentDidUpdate(prevProps, prevState) {
        this.update();
    }

    update () {

    }

    value () {
        if (arguments[0] != null) {
            let value = arguments[0].toString().trim();
            let backup = value;
            if (value == '') {
                value = 'DT'
            } else {
                try {
                    let check = false;
                    this.state.listClass.map((v, i) => {
                        if (v.value == value) {
                            check = true;
                        }
                    })
                    if (check == false) {
                        value = Number(backup[0] + backup[1]);
                        if (isNaN(value)) {
                            value = Number(backup[0]);
                        }
                        if (value < 1 || value > 12 || isNaN(value)) {
                            value = 'DT';
                        }
                    }
                } catch (e) {
                    try {
                        value = Number(backup[0]);
                        if (isNaN(value)) {
                            value = 'DT';
                        }
                    } catch (e) {
                        value = 'DT';
                    }
                }
            }
            this.refs.lop.value = value;
        } else {
            return this.refs.lop.value;
        }
    }

    getLabel () {
        for (let _class of this.state.listClass) {
            if (this.refs.lop.value == _class.value) {
                return _class.label;
            }
        }
    }

    onChange (element) {
        try {
            this.props.onChange(element);
        } catch (e) {
            
        }
    }

    render () {
        let disabled = false;
        let myclass = mystyle.selectStyle;
        if (this.props.disabled == true) {
            disabled = true;
            myclass += ' ' + 'read_only';
        }
        return (
            <div style={{
                'padding': '0',
            }}>
                <label for="Lớp">Lớp: </label>
                <select 
                    name="Lớp"
                    ref="lop"
                    className={myclass}
                    onChange={this.onChange.bind(this)}
                    disabled={disabled}
                >
                    {this.state.listClass.map((v, i) => <option value={v.value} key={i}>{v.label}</option>)}
                </select>
            </div>
        );
    }
}

module.exports = Lop;
