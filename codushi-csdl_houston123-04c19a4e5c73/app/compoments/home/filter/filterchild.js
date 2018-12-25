import React from 'react';
import style from './style.css';
import Select from 'react-select';

class FilterChild extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    componentDidMount () {
    }

    componentWillUnmount() {
    }

    componentDidUpdate(prevProps, prevState) {
    }
    
    getValue () {
        var backString = "";
        let keyword = this.refs.input.value;
        if (keyword != null && keyword.trim() != '') {
            keyword = keyword.split("&");            
            for (let val of keyword) {
                let key = val.trim();
                let operator = 'LIKE'
                if (key[0] == '<'
                || key[0] == '>') {
                    operator = key[0];
                    key = key.substr(1, key.length).trim();
                }
                if (key.toString().toLowerCase() == 'blank') {
                    switch (this.props.header.type) {
                        case 'default': {
                            backString += ' OR ' + this.props.header.searchColumn + ' IS NULL OR ';
                            backString += ' ' + this.props.header.searchColumn + ' = \'\' ';
                        } break;                
                        default: {
                            backString += ' OR `' + this.props.header.value + '` IS NULL OR ';
                            backString += ' `' + this.props.header.value + '` = \'\' ';
                        } break;
                    }
                } else {
                    if (this.props.children.toLowerCase().indexOf('ngày') != -1) {
                        let ngay = key.split('/');
                        if (ngay.length == 3) {
                            key = ngay[2] + '-' + ngay[1] + '-' + ngay[0];
                        }
                    }

                    let connectstring = ' OR ';
                    if (operator == 'LIKE') {
                        key = '\'%' + key + '%\'';
                    } else {
                        key = '\'' + key + '\'';
                        connectstring = ' AND '
                    }

                    switch (this.props.header.type) {
                        case 'default': {
                            backString += connectstring + '' + this.props.header.searchColumn + ' ' + operator + ' ' + key;
                        } break;                
                        default: {
                            backString += connectstring + '`' + this.props.header.value + '` ' + operator + ' ' + key;
                        } break;
                    }
                }
            }            
        }

        if (backString != "") {
            if (backString.indexOf(' OR ') == 0) {
                backString = backString.substr(4, backString.length);
            } else {
                backString = backString.substr(5, backString.length);
            }
        }   

        return backString;
    }

    revokeAllValue() {
        this.refs.input.value = "";
    }

    onKeyPress (e) {
        if (e.which == 13) {
            this.props.onEnterKeyPress();
        }
    }

    render () {
        let listdata = '';
        if (this.props.keywords != undefined) {
            listdata = 
            <datalist id={'filterid' + this.props.children}>
            {
                this.props.keywords.map((e, i) => {
                    let value = e[this.props.children];
                    if (value != null && value != '') {
                        if (this.props.children.toLowerCase().indexOf('ngày') != -1) {
                            value = new Date(value).toLocaleDateString('en-GB');
                        }
                        return (
                            <option key={i} value={value}/>
                        )
                    }
                })
            }
            </datalist>
        }

        var xhtml;
        if (!this.props.hidden) {
            xhtml = 
            <div className={style.child}>
                <span>{this.props.children}</span>
                <input 
                    type="text"
                    placeholder="Nhập nội dung tìm kiếm..."
                    style={{
                        "padding": "5px",
                        "border-radius": "3px",
                        "border": "1px solid #888",
                    }}
                    list={'filterid' + this.props.children}
                    ref="input"
                    onKeyPress={this.onKeyPress.bind(this)}
                    onChange={(e) => {
                        try {
                            this.props.onChange(this.props.children, e.target.value);
                        } catch (error) {
                        }
                    }}
                />
                {listdata}
            </div> 
        }

        return (
            <div>
                {xhtml}
            </div>
        )
    }
}

module.exports = FilterChild;
