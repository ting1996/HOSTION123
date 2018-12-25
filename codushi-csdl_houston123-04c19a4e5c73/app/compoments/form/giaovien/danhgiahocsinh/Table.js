import React from 'react';
import { connect } from 'react-redux';
import Rows from './Rows.js';

class Table extends React.Component{
    constructor (props) {
        super(props);
        this.state = {
            colummns: [],
            thang: '',
            nam: '',
            options_nam: [],
            color: {title: '#0080ff', body: '#ceedff'},
            scoreList: [],
            disabled: false,
        };
        this.callBackDataFormDatabase = this.callBackDataFormDatabase.bind(this);
    }

    callBackDataFormDatabase ( rows, hanhdong, dulieuguive ) {
        if (hanhdong === 'laydulieu_trave') {
            if (dulieuguive != null) {
                switch (dulieuguive.fn) {
                    case 'form_giaovien_danhgiahocsinh_getYear':
                        let newoption = this.state.options_nam;
                        for (let key of rows) {
                            if (newoption.indexOf(key['year']) == -1) {
                                newoption.push(key['year']);
                            }
                        }
                        this.setState({
                            options_nam: newoption,
                        });
                        break;
                    case 'form_giaovien_danhgiahocsinh_getScore': {
                        this.setState({
                            scoreList: rows,
                        })
                    } break;
                    case 'form_giaovien_danhgiahocsinh_updatebangdiem': {
                        try {
                            this.props.close();
                        } catch (error) {
                            
                        }
                    } break;
                    default:
                }
            }
        }  
    }

    componentDidMount () {
        try {
            this.props.getMe(this);
        } catch (error) {
            
        }

        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
        let newoption = this.state.options_nam;
        newoption.push((new Date()).getFullYear());
        this.setState({
            colummns: ['User ID', 'Họ Và Tên'],
            thang: (new Date()).getMonth() + 1,
            nam: (new Date()).getFullYear(),
            options_nam: newoption,
        });

        if (((new Date()).getMonth() + 1) == 12) {
            this.refs.next.hidden = true;    
        }
        if (((new Date()).getMonth() + 1) == 1) {
            this.refs.back.hidden = true;   
        }
                
        let query = 'SELECT * FROM SCORESHEETS WHERE `classID` = \'!\?!\' AND `month` = \'!\?!\' AND `year` = \'!\?!\'';
        query = query.replace('!\?!', this.props.malop);
        query = query.replace('!\?!', (new Date()).getMonth() + 1);
        query = query.replace('!\?!', (new Date()).getFullYear());
        this.props.socket.emit('gui-query-den-database', query, 'laydulieu_trave', {
            fn: 'form_giaovien_danhgiahocsinh_getScore'
        });
        query = 'SELECT DISTINCT year FROM SCORESHEETS WHERE `classID` = \'!\?!\'';
        query = query.replace(/!\?!/g, this.props.malop);
        this.props.socket.emit('gui-query-den-database', query, 'laydulieu_trave', {
            fn: 'form_giaovien_danhgiahocsinh_getYear'
        });
    }

    componentWillUnmount() {
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    back () {
        let disabled = true;
        let thanghientai = this.state.thang - 1;
        let namhientai = this.state.nam;
        this.props.buttonaccept.disabled = true;
        let query = 'SELECT * FROM SCORESHEETS WHERE `classID` = \'!\?!\' AND `month` = \'!\?!\' AND `year` = \'!\?!\'';
        query = query.replace('!\?!', this.props.malop);
        query = query.replace('!\?!', thanghientai);
        query = query.replace('!\?!', namhientai);
        this.props.socket.emit('gui-query-den-database', query, 'laydulieu_trave', {
            fn: 'form_giaovien_danhgiahocsinh_getScore'
        });

        let color = this.state.color;
        color.title = '#7a7a7a';
        color.body = '#ddd';
        if (thanghientai >= ((new Date()).getMonth() + 1) - 1
        && thanghientai <= ((new Date()).getMonth() + 1)
        && namhientai == (new Date()).getFullYear()) {
            this.props.buttonaccept.disabled = false;
            disabled = false;
            color.title = '#0080ff';
            color.body = '#ceedff';
        }
                
        this.setState({
            disabled: disabled,
            thang: thanghientai,
            nam: namhientai,
            color: color,
        });

        if (thanghientai == 1) {
            this.refs.back.hidden = true;   
        }
        this.refs.next.hidden = false;   
    }

    next () {
        let disabled = true;
        let thanghientai = this.state.thang + 1;
        let namhientai = this.state.nam;
        this.props.buttonaccept.disabled = true;
        let query = 'SELECT * FROM SCORESHEETS WHERE `classID` = \'!\?!\' AND `month` = \'!\?!\' AND `year` = \'!\?!\'';
        query = query.replace('!\?!', this.props.malop);
        query = query.replace('!\?!', thanghientai);
        query = query.replace('!\?!', namhientai);
        this.props.socket.emit('gui-query-den-database', query, 'laydulieu_trave', {
            fn: 'form_giaovien_danhgiahocsinh_getScore'
        });

        let color = this.state.color;
        color.title = '#7a7a7a';
        color.body = '#ddd';
        if (thanghientai >= ((new Date()).getMonth() + 1) - 1
        && thanghientai <= ((new Date()).getMonth() + 1)
        && namhientai == (new Date()).getFullYear()) {
            this.props.buttonaccept.disabled = false;
            disabled = false;
            color.title = '#0080ff';
            color.body = '#ceedff';
        }
        
        this.setState({
            disabled: disabled,
            thang: thanghientai,
            nam: namhientai,
            color: color,
        });

        if (thanghientai == 12) {
            this.refs.next.hidden = true;    
        }
        this.refs.back.hidden = false; 
    }

    changeYear (e) {
        let disabled = true;
        let thanghientai = this.state.thang;
        let namhientai = e.target.value
        this.props.buttonaccept.disabled = true;
        let query = 'SELECT * FROM SCORESHEETS WHERE `classID` = \'!\?!\' AND `month` = \'!\?!\' AND `year` = \'!\?!\'';
        query = query.replace('!\?!', this.props.malop);
        query = query.replace('!\?!', thanghientai);
        query = query.replace('!\?!', namhientai);
        this.props.socket.emit('gui-query-den-database', query, 'laydulieu_trave', {
            fn: 'form_giaovien_danhgiahocsinh_getScore'
        });

        if (thanghientai >= ((new Date()).getMonth() + 1) - 1
        && thanghientai <= ((new Date()).getMonth() + 1)
        && namhientai == (new Date()).getFullYear()) {
            this.props.buttonaccept.disabled = false;
            disabled = false;
        }
        this.setState({
            disabled: disabled,
            nam: namhientai,
        });
    }

    render () {
        return (
            <div style={{"padding" : "0", "background-color": "transparent",}}>
                <select onChange={this.changeYear.bind(this)}>
                    {this.state.options_nam.map((e, i) => {
                        return <option value={e} key={i}>{e}</option>
                    })}
                </select>
                <div style={{"padding" : "0", "background-color": this.state.color.title,}}>
                    <table cellpadding="0" cellspacing="0">
                        <thead ref='thead' style={{
                            "text-align": "center",
                            "background-color": this.state.color.title,
                            "display": "inherit",
                            "width": "calc(100% - 1.3em)",
                        }}>
                            <tr>
                                {this.state.colummns.map((e, i) => (
                                    <th key={i} rowspan="2">{e}</th>
                                ))}
                                <th colspan="4">
                                    <div style={{"float": "left"}} onClick={this.back.bind(this)} className="button" ref="back">
                                        <i class="fa fa-chevron-circle-left fa-2x" aria-hidden="true"></i>
                                    </div> 
                                    Tháng {this.state.thang}
                                    <div style={{"float": "right"}} onClick={this.next.bind(this)} className="button" ref="next">
                                        <i class="fa fa-chevron-circle-right fa-2x" aria-hidden="true"></i>
                                    </div> 
                                </th>
                            </tr>
                            <tr>
                                <th>Điểm Chi Tiêu</th>
                                <th>Điểm Thực Tế</th>
                            </tr>
                        </thead>
                        <tbody ref='tbody' style={{
                            "background-color": this.state.color.body,
                            "height": "400px",
                            "display": "block",
                            "overflow-x": "hidden",
                            "overflow-y": "scroll",
                        }}>
                            <tr>
                                <td colspan="4" style={{
                                    "border": "none",
                                    "padding": "0",
                                    "margin": "0",

                                }}>
                                    {
                                        this.props.value.map((value, index) => {
                                            let userScore = null;
                                            let scoreList = this.state.scoreList;                                            
                                            if (scoreList != null) {
                                                for (let score of scoreList) {
                                                    if (score.userID == value['User ID']) {
                                                        userScore = score;
                                                        break;
                                                    }
                                                }
                                            }
                                            return (
                                                <Rows
                                                    getMe={(me) => this['bangdiem' + value['User ID']] = me}
                                                    userid={value['User ID']} 
                                                    hovaten={value['Họ Và Tên']}
                                                    disabled={this.props.buttonaccept.disabled}
                                                    value={value}
                                                    malop={this.props.malop}
                                                    score={userScore}
                                                    nam={this.state.nam}
                                                    thang={this.state.thang}
                                                    scoreType={this.props.scoreType}
                                                />
                                            )
                                        })
                                    }
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    accept () {
        if (!this.state.disabled) {
            let query = '';
            if (this.props.value != null) {
                this.props.value.map((v, i) => {
                    query += this['bangdiem' + v['User ID']].update();
                })
            }
            
            this.props.socket.emit('gui-query-den-database', query, 'laydulieu_trave', {
                fn: 'form_giaovien_danhgiahocsinh_updatebangdiem',
                isSuccess: true,
            });
        }  
    }
};

module.exports = connect(function (state) {
  return {
    socket: state.socket,
  };
}) (Table);
