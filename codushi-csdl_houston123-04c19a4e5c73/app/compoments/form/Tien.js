import React from 'react';
import style from './style.css';
var ReactDOM = require('react-dom');

class Tien extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: null,
            isSet: false,
            isSelect: false,
            isSubtract: false,
        }
        this.value = this.value.bind(this);
    }

    value () {
        if (arguments[0] != null) {
            this.setState({
                value: arguments[0].toString(),
                isSet: true,
            });
        } else {
            if (this.state.isSelect) {
                if (this.refs.select != null) {
                    return Number(this.refs.select.value);
                }
            } else {
                return this.state.value;
            }
        }
    }

    getMoneyValue () {
        try {
            return this.refs.input.value;
        } catch (e) {
            let selectv = this.refs.select;
            let strUser = selectv.options[selectv.selectedIndex].text;            
            return strUser;
        }
    }

    componentDidMount () {
        try {
            this.props.getMe(this);
        } catch (e) {
            
        }

        let data_val = this.props.value;
        if (data_val != null) {
            data_val = data_val.toString();
            if (data_val.split(',').length > 1) {
                this.setState({
                    value: this.props.value,
                    isSelect: true,
                })
            } else {
                if (isNaN(Number(data_val))) {
                    this.setState({
                        value: 0,
                        isSet: true,
                    })
                } else {
                    this.setState({
                        value: Number(data_val),
                        isSet: true,
                    })
                }
            }
        } else {
            this.setState({
                value: 0,
                isSet: true,
            })
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.value != this.state.value) {
            try {
                this.props.fn();
            } catch (e) {
            }
        }

        if (prevState.isSet != this.state.isSet) {
            if (this.state.isSet) {
                this.setState({
                    isSet: false,
                });
            }
        } else {
            let data_val = this.props.value;
            if (data_val != null) {
                data_val = data_val.toString();
                if (this.props.value != this.state.value) {
                    if (this.props.canInput) {
    
                    } else {
                        this.setState({
                            value: this.props.value,
                        })
                    }
                }
            }
        }
    }

    onChange () {
        try {
            this.props.fn();
        } catch (e) {
        }
    }

    onKeyUp (e) {
        if (this.props.canInput) {
            let inputValue = e.keyCode;
            if ((inputValue >= 48 && inputValue <=57)
            || (inputValue >= 96 && inputValue <=105)
            || (inputValue == 8)
            || inputValue == 109
            || inputValue == 189
            ) {
                let str = this.state.value;
                let isSubtract = this.state.isSubtract;
                
                try {
                    if (inputValue != 8) {
                        if ((inputValue >= 48 && inputValue <=57)
                        || (inputValue >= 96 && inputValue <=105)) {
                            let val = 0;
                            if (inputValue <= 57) {
                                val = inputValue - 48;
                            } else {
                                val = inputValue - 96;
                            }
                            str = str + val.toString();
                        }
                    } else {
                        str = this.state.value.substr(0, this.state.value.length - 1);
                    }

                    if (inputValue == 109 || inputValue == 189) {
                        isSubtract = !isSubtract;
                    }

                    if (isSubtract == true) {
                        if (str[0] != '-') {
                            str = '-' + str;
                        }
                    } else {
                        if (str[0] == '-') {
                            str = this.state.value.substr(1, this.state.value.length);
                        }
                    }

                    if (str == '-') {
                        str = 0;
                    }
                } catch (e) {
                    str = 0;
                }
    
                this.setState({
                    value: str,
                    isSubtract: isSubtract,
                })
            }
        }
    }

    render () {
        let isNegative = false;
        let spacechar = '.';
        if (this.props.spacechar != null) {
            spacechar = this.props.spacechar;
        }
        let data_val = this.state.value;
        let input = null;
        let disabled = true;
        if (this.props.canInput) {
            disabled = false;
            if (this.props.disabled == true) {
                disabled = true;
            }
        }
        if (data_val == null || data_val == '') {
            input = <input 
                type="text" 
                name="" 
                value={"0 VNĐ"}
                ref='input'
                disabled ={disabled}
                className="read_only"
                onKeyUp={this.onKeyUp.bind(this)}
            />
        } else {
            data_val = data_val.toString();
            if (data_val.split(',').length > 1) {
                input = <select ref='select' onChange={this.onChange.bind(this)} style={{'margin': '0'}}>
                    {
                        data_val.split(',').map((v, i) => {
                            if (v.split(':').length > 1) {
                                let so = v.split(':')[0];
                                if (so < 0) {
                                    so = -so;
                                    isNegative = true;
                                }
                                let val = ''
                                do {
                                    let v = so%1000;
                                    so = Math.floor(so/1000);
                                    if (so > 0) {
                                        if (v == 0) {
                                            val = '000' + spacechar + val;
                                        } else {
                                            val = ('000' + v).slice(-3) + spacechar + val;
                                        }   
                                    } else {
                                        val = v + spacechar + val;
                                    }                                 
                                } while (so > 0);
                                val = val.substr(0, val.length - 1);
                                
                                if (this.props.discount != null) {
                                    let discount = this.props.discount.toString();
                                    let temp = val;
                                    val = '';
                                    so = v.split(':')[0] - ((v.split(':')[0]*discount)/100);
                                    do {
                                        let v = so%1000;
                                        so = Math.floor(so/1000);
                                        if (so > 0) {
                                            if (v == 0) {
                                                val = '000' + spacechar + val;
                                            } else {
                                                val = ('000' + v).slice(-3) + spacechar + val;
                                            }
                                        } else {
                                            val = v + spacechar + val;
                                        }       
                                    } while (so > 0);
                                    val = val.substr(0, val.length - 1);
                                    val = temp + ' VNĐ -> ' + val;
                                }

                                if (isNegative) {
                                    return (
                                        <option value={-v.split(':')[0]}>
                                            {'- ' + val + ' VNĐ (' + v.split(':')[1] + ')'}
                                        </option>
                                    )
                                } else {
                                    return (
                                        <option value={v.split(':')[0]}>
                                            {val + ' VNĐ (' + v.split(':')[1] + ')'}
                                        </option>
                                    )
                                }
                            }
                        })
                    }
                </select>      
            } else {
                let so = data_val;
                if (so < 0) {
                    so = -so;
                    isNegative = true;
                }
                let val = '';
                do {
                    let v = so%1000;
                    so = Math.floor(so/1000);
                    if (so > 0) {
                        if (v == 0) {
                            val = '000' + spacechar + val;
                        } else {
                            val = ('000' + v).slice(-3) + spacechar + val;
                        }
                    } else {
                        val = v + spacechar + val;
                    }       
                } while (so > 0);
                val = val.substr(0, val.length - 1);
                if (isNegative) {
                    val = '- ' + val;
                }
                if (this.props.discount != null) {
                    let discount = this.props.discount.toString();
                    let temp = val;
                    val = '';
                    so = data_val - ((data_val*discount)/100);
                    do {
                        let v = so%1000;
                        so = Math.floor(so/1000);
                        if (so > 0) {
                            if (v == 0) {
                                val = '000' + spacechar + val;
                            } else {
                                val = ('000' + v).slice(-3) + spacechar + val;
                            }
                        } else {
                            val = v + spacechar + val;
                        }       
                    } while (so > 0);
                    val = val.substr(0, val.length - 1);
                    val = temp + ' VNĐ -> ' + val;
                }

                input = <input 
                    type="text" 
                    name="" 
                    value={val + ' VNĐ'} 
                    ref='input'
                    disabled ={disabled}
                    className="read_only"
                    onKeyUp={this.onKeyUp.bind(this)}
                />
            }
        }

        let htmllable;
        if (this.props.label != null) {
            htmllable = <label for="" ref='label'>{this.props.label}</label>
        }

        return (
            <div style={this.props.style}>
                {htmllable}
                {input}
            </div>
        )
    }
}

module.exports = Tien;
