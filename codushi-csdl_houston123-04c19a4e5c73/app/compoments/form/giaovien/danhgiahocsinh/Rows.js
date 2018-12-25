import React from 'react';
import { connect } from 'react-redux';

class Rows extends React.Component{
  constructor (props) {
    super(props);
    this.state = {
        color: 'none',
        score: null,
        chitieu: null,
        thucte: null,
        nhanxet: null,
        giaiphap: null,
        busy: false,
    };
    this.callBackDataFormDatabase = this.callBackDataFormDatabase.bind(this);
  }

  callBackDataFormDatabase ( rows, hanhdong, dulieuguive ) {
  }

  componentDidMount () {    
    try {
        this.props.getMe(this);
    } catch (error) {
        
    }

    let thucte = null;
    switch (this.props.scoreType) {
        case 1:
            thucte = [{d:'', l:'Nghe'}, {d:'', l:'Nói'}, {d:'', l:'Đọc'}, {d:'', l:'Viết'}];
            break;
        default:
            thucte = [{d:''}];
            break;
    }
    this.setState({thucte});
        

    this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    let value = this.props.value;
    if (value['Mã Lớp Chuyển'] != null && value['Mã Lớp Chuyển'] != '' && value['Mã Lớp'] != this.props.malop) {
        let malopchuyen = value['Mã Lớp Chuyển'];
        let thoigianchuyen = value['Thời Gian Chuyển'];
        this.setState({color: 'lightgreen'});
    }
  }

  componentWillUnmount() {
    this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
  }

  componentDidUpdate() {
    if (this.props.score != this.state.score) {
        let chitieu = '';
        let thucte = null;
        switch (this.props.scoreType) {
            case 1:
                thucte = [{d:'', l:'Nghe'}, {d:'', l:'Nói'}, {d:'', l:'Đọc'}, {d:'', l:'Viết'}];
                break;
            default:
                thucte = [{d:''}];
                break;
        }
        let nhanxet = '';
        let giaiphap = '';
        if (this.props.score != null) {
            let score = JSON.parse(this.props.score.score);
            if (score.chitieu != null) {
                chitieu = score.chitieu;
            }
            if (score.thucte != null && score.thucte != '') {
                thucte = score.thucte;
                if (!Array.isArray(thucte)) {
                    thucte = [{d: thucte}];
                }
            }
            if (this.props.score.content != null) {
                try {
                    let content = JSON.parse(this.props.score.content);
                    nhanxet = content.nhanxet;
                    giaiphap = content.giaiphap;
                } catch (error) {
                    try {                        
                        let content = this.props.score.content;
                        content = content.replace(/\n/g, '\\n');
                        content = content.replace(/\r/g, '\\r');                        
                        content = JSON.parse(content);
                        nhanxet = content.nhanxet;
                        giaiphap = content.giaiphap;
                    } catch (error) {
                    }
                }               
            }
        }
        
        this.setState({
            score: this.props.score,
            chitieu,
            thucte,
            nhanxet,
            giaiphap,
        })
    }
  }

  keyPress (event) {
    if ((event.key >= 0
    && event.key <= 9
    && event.which != 32)
    || event.which == 46) {
    } else {
        event.preventDefault();
    }
  }

  render () {
    let xhtml;
    let value = this.props.value;
    if (value['Mã Lớp Chuyển'] != null && value['Mã Lớp Chuyển'] != '' && value['Mã Lớp'] != this.props.malop) {
        xhtml = '(Lớp ?)'.replace('?', value['Mã Lớp']);
    }

    return (
        <div style={{
            "padding": "0",
            "width": "100%",
            "display": "inline-table",
            "background": this.state.color,
            borderRight: '1px solid #444',
            borderBottom: '3px dashed #444',
        }}>
            <tr>
                <td rowspan="2"> {this.props.userid} </td>
                <td rowspan="2"> {this.props.hovaten} <br/> {xhtml} </td>
                <td>
                    {(() => {
                        if (this.props.userInfo.permission.indexOf('giaovien') == -1) {
                            return (                            
                                <input
                                    className="read_only"
                                    type="text"
                                    ref="chitieu"
                                    onKeyPress={this.keyPress.bind(this)}
                                    onChange={(e) => {
                                        if (e.target.value > 10) {
                                            e.target.value = 10
                                        } else if (e.target.value < 0) {
                                            e.target.value = 1
                                        }
                                        if (isNaN(e.target.value) == false) {
                                            this.setState({chitieu: e.target.value});
                                        }                                        
                                    }}
                                    value={this.state.chitieu}
                                    disabled={this.props.disabled}
                                />
                            )
                        }
                    })()}
                </td>
                <td>
                    {(() => {
                        if (this.state.thucte != null
                        && this.state.thucte != ''
                        && Array.isArray(this.state.thucte)) {                            
                            return (
                                <div style={{
                                    padding: '4px',
                                }}>
                                    {this.state.thucte.map((v, i) => {
                                        let lable = null;
                                        if (v.l != null) {
                                            lable = <span style={{width: '55px'}}>{v.l + ': '}</span>;
                                        }
                                        return (
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '0',
                                            }}>
                                                {lable}
                                                <input
                                                    className="read_only"
                                                    type="text"
                                                    onKeyPress={this.keyPress.bind(this)}
                                                    onChange={(e) => {
                                                        if (e.target.value > 10) {
                                                            e.target.value = 10
                                                        } else if (e.target.value < 0) {
                                                            e.target.value = 1
                                                        }
                                                        let thucte = this.state.thucte;
                                                        thucte[i].d = e.target.value;
                                                        if (isNaN(e.target.value) == false) {
                                                            this.setState({thucte: thucte});
                                                        }
                                                    }}
                                                    value={v.d}
                                                    disabled={this.props.disabled}
                                                />
                                            </div>
                                        )
                                    })}
                                </div>
                            )                    
                        }
                    })()}
                </td>
            </tr>
            <tr style={{"text-align": "left"}}>
                {/* <td colspan="2">  */}
                <td>
                    Nhận xét:
                    <textarea
                        className="read_only"
                        style={{"text-align": "left", height: '75px'}}
                        type="text"
                        ref="nhanxet"
                        onChange={(e) => {
                            this.setState({nhanxet: e.target.value});
                        }}
                        value={this.state.nhanxet}
                        disabled={this.props.disabled}
                    >
                    </textarea>
                </td>
                <td>
                    Giải Pháp Cải Thiện:
                    <textarea
                        className="read_only"
                        style={{"text-align": "left", height: '75px'}}
                        type="text"
                        ref="giaiphap"
                        onChange={(e) => {
                            this.setState({giaiphap: e.target.value});
                        }}
                        value={this.state.giaiphap}
                        disabled={this.props.disabled}
                    >
                    </textarea>
                </td>
            </tr>
        </div>
    );
  }

  update () {
    let oldScore = {};
    if (this.props.score != null) {
        oldScore = JSON.parse(this.props.score.score);
    }
    let query = '';
    let score = {}
    score.chitieu = this.state.chitieu;
    score.thucte = this.state.thucte;
    score.quanly = oldScore.quanly;
    score.giaovien = oldScore.giaovien;
    if (this.props.userInfo.permission.indexOf('giaovien') == -1) {
        score.quanly = this.props.userInfo.account_id;
    } else {
        score.giaovien = this.props.userInfo.account_id;
    }
    
    score = JSON.stringify(score);
    let nhanxet = this.state.nhanxet;
    if (nhanxet != null) {
        nhanxet = nhanxet.replace(/\\/g, '\\\\');        
        nhanxet = nhanxet.replace(/'/g, '\\\\\'');
        nhanxet = nhanxet.replace(/"/g, '\\"');
        nhanxet = nhanxet.trim();        
    } else {
        nhanxet = '';
    }
    let giaiphap = this.state.giaiphap;
    if (giaiphap != null) {
        giaiphap = giaiphap.replace(/\\/g, '\\\\');
        giaiphap = giaiphap.replace(/'/g, '\\\\\'');
        giaiphap = giaiphap.replace(/"/g, '\\"');
        giaiphap = giaiphap.trim();
    } else {
        giaiphap = '';
    }
    let content = {nhanxet: nhanxet, giaiphap: giaiphap};
    content = JSON.stringify(content);
    if (this.state.score != null) {
        query = 'UPDATE `SCORESHEETS` SET `score` = \'!\?!\', `content` = \'!\?!\' WHERE (`id` = \'!\?!\'); ';
        query = query.replace('!\?!', score);
        query = query.replace('!\?!', content);
        query = query.replace('!\?!', this.state.score.id);
    } else {
        query = 'INSERT INTO `SCORESHEETS` (`userID`, `classID`, `score`, `content`, `month`, `year`) VALUES (\'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\'); ';
        query = query.replace('!\?!', this.props.value['User ID']);
        query = query.replace('!\?!', this.props.value['Mã Lớp']);
        query = query.replace('!\?!', score);
        query = query.replace('!\?!', content);
        query = query.replace('!\?!', this.props.thang);
        query = query.replace('!\?!', this.props.nam);
    }
    return query;
  }
};

module.exports = connect(function (state) {
    return {
      socket: state.socket,
      userInfo: state.userinformation,
    };
}) (Rows);
