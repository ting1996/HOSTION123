import React from 'react';

class SoDienThoai extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: '',
            newValue: null,
            fistChange: false,
        }
    }

    componentDidMount () {
        try {
            this.props.getMe(this);
        } catch (e) {
            
        }
        if (this.props.default != null) {
            this.setState({value: this.props.default})
        }
    }

    componentWillUnmount() {
    }

    componentDidUpdate() {
        if (this.state.value != ''
        && this.state.value != null
        && this.state.value[0] != '0') {
            this.setState({
                value: '0' + this.state.value,
            })
        }
    }

    onKeyPress (event) {
        var inputValue = event.which;

        if (this.props.maxlength != null && (this.refs.input.value.length >= this.props.maxlength)) {
            event.preventDefault();
        }

        if (( inputValue >= 48 && inputValue <=57) 
        || ( inputValue == 8 ) 
        || ( inputValue == 0 ) 
        || ( inputValue == 43 )
        || ( inputValue == 45 && (this.props.multi == null || this.props.multi == true))) {
            return;
        }
        event.preventDefault();
    }

    onChange (e) {
        if (e.target.value != null
        && e.target.value != ''
        && e.target.value[0] != '0') {
            e.target.value = '0' + e.target.value;
        }

        this.setState({value: e.target.value})

        try {
            this.props.onChange(e, this.props.name);
        } catch (error) {
            
        }
    }

    onBlur (e) {
        try {
            this.props.onBlur(e, this.props.name);
        } catch (error) {
            
        }
    }

    value () {
        if (arguments[0] != null) {
            this.setState({
                value: arguments[0],
                fistChange: false,
            })            
        } else {
            return this.state.value;
        }
    }
    
    style () {
        if (arguments[0] != null) {
            for (let variable in arguments[0]) {
                if (arguments[0].hasOwnProperty(variable)) {
                    this.refs.input.style[variable] = arguments[0][variable];
                }
            }
        } else {
            return this.refs.input.style
        }
    }

    render () {
        let styleDisable = '';
        let disableInput = false;
        let doisodaumang = null;
        let value = this.state.value;
        if (this.props.className != null) {
            styleDisable += this.props.className + ' ';
        }

        if (this.props.disabled) {
            styleDisable += 'read_only';
            disableInput = true;
            if (value != '') {
                let check = false;
                if (this.props.chuyendausonhamang != null) {
                    for (let so of this.props.chuyendausonhamang) {
                        if (value.startsWith('0' + so['Đầu Số'])) {
                            check = true;
                            if (!this.state.fistChange) {
                                let newValue = value.substring(('0' + so['Đầu Số']).length, value.length);
                                newValue = '0' + so['Đầu Số Mới'] + newValue;
                                if (this.state.newValue != newValue) {
                                    this.setState({
                                        newValue: newValue,
                                        fistChange: true,
                                    })
                                }
                            }
                            break;
                        }
                    }
                }
                if (check) {
                    if (this.state.newValue != null) {
                        value = this.state.newValue;
                        doisodaumang = 
                        <div style={{
                            'margin-left': '-70px',
                            'margin-top': '4px',
                            'margin-bottom': '4px',
                            'background': 'green',
                            'border-radius': '20px',
                            'text-align': 'center',
                            'width': 'fit-content',
                            'padding': '0px 10px',
                            'color': 'white',
                            'cursor': 'pointer',
                        }}
                            onClick={() => this.setState({newValue: null})}
                        >
                            Số Mới
                        </div>
                    } else {
                        doisodaumang = 
                        <div style={{
                            'margin-left': '-70px',
                            'margin-top': '4px',
                            'margin-bottom': '4px',
                            'background': '#8e001e',
                            'border-radius': '20px',
                            'text-align': 'center',
                            'width': 'fit-content',
                            'padding': '0px 10px',
                            'color': 'white',
                            'cursor': 'pointer',
                        }}
                            onClick={() => {
                                let value = this.state.value;
                                if (this.props.chuyendausonhamang != null) {
                                    for (let so of this.props.chuyendausonhamang) {
                                        if (value.startsWith('0' + so['Đầu Số'])) {
                                            let newValue = value.substring(('0' + so['Đầu Số']).length, value.length);
                                            newValue = '0' + so['Đầu Số Mới'] + newValue;
                                            if (this.state.newValue != newValue) {
                                                this.setState({
                                                    newValue: newValue,
                                                })
                                            }
                                            break;
                                        }
                                    }
                                }
                            }}
                        >
                            Số Cũ
                        </div>
                    }
                }
            }
        }

        return (
            <div style={{
                'padding': '0',
            }}>
                <label for="" ref='label'>Số Điện Thoại: </label>
                    <div style={{
                        'padding': '0',
                        'display': 'grid',
                        'grid-template-columns': '100% auto',
                    }}>
                        <input 
                            type="text" 
                            name="" 
                            onKeyPress={this.onKeyPress.bind(this)} 
                            value={value} 
                            onChange={this.onChange.bind(this)}
                            onBlur={this.onBlur.bind(this)}
                            ref='input'
                            disabled={disableInput}
                            className={styleDisable}
                        />
                        {doisodaumang}
                    </div>
            </div>
        )
    }
}

module.exports = SoDienThoai;
