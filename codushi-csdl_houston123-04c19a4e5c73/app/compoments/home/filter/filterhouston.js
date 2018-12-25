import React from 'react';
import { connect } from 'react-redux';
import style from './style.css';
import FilterChild from './filterchild';
import Select from 'react-select';
import AdditionalConditional from './additionalconditional/AdditionalConditional';
var ReactDOM = require('react-dom');

class FilterHouston extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hide: true,
            headers: [],
            keywords: {},
            isStart: 0,
            isLimit: 10,
            listSpecialSelected: [],
            listSpecial: [],
            filterData: null,
            _filterData: null,
            filterHeight: 0,
            inforFilter: {},
        };

        this.callBackDataFormDatabase = this.callBackDataFormDatabase.bind(this);
        this.changeLocation = this.changeLocation.bind(this);
        this.SocketEmit = this.SocketEmit.bind(this);
    }

    SocketEmit() {
        if (arguments[0] == 'gui-query-den-database') {
            $('.loading').show();
        }

        if (arguments[2] == 'xem') {
            if (arguments[3] != null) {
                arguments[3].showQuery = arguments[1];
                let query = 'SELECT ' +
                'CONCAT(\'SELECT COUNT(\', \'`!~!`.\', SUBSTRING_INDEX(GROUP_CONCAT(CONCAT(\'`\', column_name, \'`\')), \',\', 1), \') AS COUNT FROM !\?!\') AS query ' +
                'FROM information_schema.columns ' +
                'WHERE table_schema=DATABASE() ' +
                'AND table_name=\'!\?!\';';

                let temp = arguments[1];
                let i;
                if (temp.indexOf(' FROM ') != -1) {
                    i = temp.indexOf(' FROM ');
                } else if (temp.indexOf(' from ') != -1) {
                    i = temp.indexOf(' from ');
                }
                i += ' FROM '.length;
                temp = temp.substr(i, temp.length);
                query = query.replace('!\?!', temp.replace(/\'/g, '\\\''));
                i = temp.indexOf(' ');
                if (i != -1) {
                    temp = temp.substr(0, i);
                }
                let tname= temp.split('.');
                if (tname.length > 1) {
                    tname = tname[1];
                } else {
                    tname = tname[0];
                }
                query = query.replace('!\?!', tname);
                query = query.replace('!~!', tname);
                this.props.socket.emit('gui-query-den-database', query, 'laydulieu_trave', {
                    fn: 'home_body_countQuery',
                    data: arguments[3],
                });
                return;
            }
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

    callBackDataFormDatabase (rows, hanhdong, dulieuguive) {
        if (hanhdong == 'laydulieu_trave') {
            if (dulieuguive != null) {
                switch (dulieuguive.fn) {
                    case 'filter_getvalue':
                        let keywords = this.state.keywords;
                        if (rows.length > 0) {
                            keywords[dulieuguive.header] = rows
                        }
                        this.setState({
                            keywords: keywords,
                        })
                        break;
                    default:
                        
                }
                
            }
        }  
    }

    componentDidMount () {
        window.addEventListener("resize", this.changeLocation);
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
        try {
            this.props.getMe(this);
        } catch (error) {
            
        }
    }

    componentWillUnmount() {
        $(this.refs.background).css({'transition': ''});
        window.removeEventListener("resize", this.changeLocation);
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.refs.background.style.transition == '')
        {
            $(this.refs.background).css({'transition': '0.3s ease-out'});
        }        
        this.changeLocation();
    }

    changeLocation() {
        let style_top = 0;
        let filterHeight = this.refs.background.clientHeight;
        if (this.state.hide) {
            style_top = - this.refs.background.clientHeight + this.refs.footer.clientHeight;
            filterHeight = this.refs.footer.clientHeight;
        }        
        if (this.refs.background.style.top != style_top + 'px') {
            this.refs.background.style.top = style_top + 'px';
        }

        if (this.state.filterHeight != filterHeight) {
            try {
                this.props.filterHeight(filterHeight)
            } catch (error) {
            }
            this.setState({filterHeight: filterHeight});
        }
    }

    onClickFilter() {
        if (this.state.filterData != null) {
            let query = this.state.filterData.showQuery;
            let filterSpecial = this.state.listSpecialSelected;
            if (query == '' || query == null) {
                this.props.dispatch({
                    type: 'ALERT_NOTIFICATION_ADD',
                    content: 'Lỗi truy vấn bộ lọc!',
                    notifyType: 'error',
                })
            } else {
                let additionalConditional = this.additionalConditional.get();
                let newquery = false;
                let filterSpecial_query = '';
                if (filterSpecial != null && filterSpecial.length > 0) {
                    for (let filter of filterSpecial) {
                        if (filter.value != null && filter.isReplace != true) {
                            filterSpecial_query += ' ' + filter.value + ' AND';
                        } else if (filter.value != null && filter.isReplace == true) {
                            query = filter.value;
                            newquery = true;
                        }
                    }
                }

                let filter_query = '';
                if (query.indexOf(' WHERE ') != -1 || query.indexOf(' where ') != -1) {
                    filter_query += ' AND';
                } else {
                    filter_query += ' WHERE';
                }

                this.state.headers.map((e, i) => {
                    var filter = this.refs[e.value].getValue();
                    if (filter != '') {
                        filter_query += ' (' + filter + ') AND';
                    }
                });

                filter_query = filter_query + filterSpecial_query;
                if (filter_query.substr(filter_query.length - 4, 4) == ' AND') {
                    filter_query = filter_query.substr(0, filter_query.length - ' AND'.length);
                } else {
                    filter_query = filter_query.substr(0, filter_query.length - ' WHERE'.length);
                }

                let indexorderby = query.indexOf(' ORDER BY ');
                if (indexorderby == -1) {
                    indexorderby = query.indexOf(' order by ');
                }

                let indexgroupby = query.indexOf(' GROUP BY ');
                if (indexgroupby == -1) {
                    indexgroupby = query.indexOf(' group by ');
                }

                if (indexorderby != -1 && indexgroupby != -1) {
                    query = query.substring(0, indexorderby) + query.substring(indexgroupby, query.length);
                } else if (indexorderby != -1) {
                    query = query.substring(0, indexorderby);
                }

                if (query.indexOf(' GROUP BY ') != -1 
                    || query.indexOf(' group by ') != -1
                ) {
                    let i;
                    if (query.indexOf(' GROUP BY ') != -1) {
                        i = query.indexOf(' GROUP BY ');
                    } else if (query.indexOf(' group by ') != -1) {
                        i = query.indexOf(' group by ');
                    }
                    query = query.substr(0, i) + filter_query + query.substr(i, query.length);
                } else {
                    query += filter_query;
                }            

                if ((filter_query == '' || filter_query == null) && newquery == false) {
                    query = this.state.filterData.showQuery;                 
                    this.SocketEmit('gui-query-den-database', this.state.filterData.showQuery, 'xem', {
                        ...this.state.filterData,
                        additionalConditional: additionalConditional,
                        isFilter: false,
                    });
                } else {
                    this.SocketEmit('gui-query-den-database', query, 'xem', {
                        ...this.state.filterData,
                        additionalConditional: additionalConditional,
                        isFilter: true,
                    });
                }
            }
        }
    }

    onClickFilterRevokeAll() {
        this.state.headers.map((e, i) => {
            this.refs[e.value].revokeAllValue();
        });
        this.setState({
            listSpecialSelected: [],
            inforFilter: {},
        })
    }

    updateSpecical (v) {
        this.setState({listSpecialSelected: v});
    }

    render () {
        var icon;
        if (!this.state.hide) {
            icon = 'fa fa-angle-double-up'
        } else {
            icon = 'fa fa-angle-double-down'
        }

        let filterSpecial = '';
        if (this.state.listSpecial.length > 0) {
            filterSpecial = <div style={{
                "padding": "5px 16px",
                "border-bottom": "1px solid #888",
            }}>
                <label for="">Lọc Bổ Sung: </label><br/>
                <Select
                    multi
                    value={this.state.listSpecialSelected}
                    options={this.state.listSpecial}
                    onChange={this.updateSpecical.bind(this)}
                />
            </div>
        }
        return (
            <div 
                className={style.background}
                ref="background"
            >
                {filterSpecial}
                <div className={style.filters}>
                    {this.state.headers.map((e, i) => {
                        return (
                            <FilterChild 
                                keywords={this.state.keywords[e.value]} 
                                onChangeLocation={this.changeLocation} 
                                ref={e.value}
                                onEnterKeyPress={this.onClickFilter.bind(this)}
                                onChange={this.onChange.bind(this)}
                                header={e}
                            >
                                {e.label}
                            </FilterChild>
                        )
                    })}
                </div>                
                <AdditionalConditional getMe={me => this.additionalConditional = me}/>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '50% 50%',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                    }}>
                        {(() => {
                            let str = '';
                            for (let i in this.state.inforFilter) {
                                if (this.state.inforFilter[i] != null
                                    && this.state.inforFilter[i].trim() != '') {
                                    str += i + ': ' + this.state.inforFilter[i] + ', '
                                }
                            }
                            return (
                                <span>
                                    {str}
                                </span>
                            )
                        })()}
                    </div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                    }}>
                        <button className={style.button} style={{"vertical-align":"middle"}} onClick={this.onClickFilterRevokeAll.bind(this)}>
                            <span> Bỏ Tất Cả </span>
                            <a><i className="fa fa fa-times" aria-hidden="true"></i></a>
                        </button>
                        <button className={style.button} style={{"vertical-align":"middle"}} onClick={this.onClickFilter.bind(this)}>
                            <span> Lọc </span>
                            <a><i className="fa fa fa-filter" aria-hidden="true"></i></a>
                        </button>
                    </div>
                </div>
                <div ref="footer">
                    <div className={style.close} onClick={() => {this.setState({hide: !this.state.hide})}} ref="buttonshowhide">
                        <i class={icon} aria-hidden="true"></i>  
                    </div>
                </div>
            </div>
        )
    }

    set (filterData) {
        if (filterData != null
            && filterData.showQuery != null
            && filterData.filterHeader != null
        ) {
            let headers = filterData.filterHeader;
            for (let header of headers) {
                let query = filterData.showQuery;
                let indexFrom = query.indexOf(' FROM ');
                if (indexFrom == -1) {
                    indexFrom = query.indexOf(' from ');
                }

                let indexLimit = query.indexOf(' LIMIT ');
                if (indexLimit == -1) {
                    indexLimit = query.indexOf(' limit ');
                    if (indexLimit == -1) {
                        indexLimit = query.length;
                    }
                }
                
                let _column = '`' + header.value + '`';
                let _groupcolumn = '`' + header.searchColumn + '`';                
                switch (header.type) {
                    case 'date': {
                        _column = 'DATE(`' + header.value + '`) AS `' + header.value + '`';
                        _groupcolumn = 'DATE(`' + header.searchColumn + '`)';
                    } break;
                    case 'default': {
                        _column = header.value;
                        _groupcolumn = header.searchColumn;
                    } break;
                }

                query = 'SELECT ' + _column + 
                query.substring(indexFrom, indexLimit) +
                ' GROUP BY ' + _groupcolumn + ' DESC ' +
                ' LIMIT ' + this.state.isStart + ', ' + this.state.isLimit;   
                
                let indexorderby = query.indexOf(' ORDER BY ');
                if (indexorderby == -1) {
                    indexorderby = query.indexOf(' order by ');
                }

                let indexgroupby = query.indexOf(' GROUP BY ');
                if (indexgroupby == -1) {
                    indexgroupby = query.indexOf(' group by ');
                }

                if (indexorderby != -1) {
                    query = query.substring(0, indexorderby) + query.substring(indexgroupby, query.length);
                }

                this.props.socket.emit('gui-query-den-database', query, 'laydulieu_trave', {
                    fn: 'filter_getvalue',
                    header: header.value,
                });
            }            

            let listSpecial = [];
            switch (this.props.menuSelected) {
                case 'mardatatong':
                    listSpecial.push({
                        label: 'Học Sinh Chưa Được Gọi', 
                        value:'!EXISTS(SELECT * FROM CALLDATA WHERE CALLDATA.`ID-DATA` = DATA_TRUONGTIEMNANG.`ID`)'
                    })
                    break;
                case 'margoidata':
                    listSpecial.push({
                        label: 'Không Lọc Học Sinh Đã Học Tại H123',
                        value: '!EXISTS(SELECT * FROM DATA_TRUONGTIEMNANG WHERE GOIDIENDATA_VIEW.`ID-DATA` = DATA_TRUONGTIEMNANG.`ID` AND DATA_TRUONGTIEMNANG.`isDeactivate` = \'1\')'
                    });
                    listSpecial.push({
                        label: 'Lọc Trên Toàn Bộ Cuộc Gọi',
                        value: 'SELECT * FROM GOIDIENDATA_VIEW_ALLDATA WHERE `Cơ Sở` = \'!\?!\' '.replace('!\?!', $('.khuvuc').attr('value')),
                        isReplace: true
                    });
                    break;
                case 'hocsinh':
                    let date = new Date();
                    let month = ("0" + (date.getMonth() + 1)).slice(-2);
                    let year = date.getFullYear();
                    let daysInMonth = ("0" + (new Date(year, month, 0).getDate())).slice(-2);                    
                    let fistDateInMonth = year + '-' + month + '-01 00:00:00';
                    let lastDateInMonth = year + '-' + month + '-' + daysInMonth + ' 23:59:00';
                    listSpecial.push({
                        label: 'Lọc Trên Toàn Bộ Học Sinh',
                        value: 'SELECT * FROM USERS WHERE `Cơ Sở` = \'!\?!\' '.replace('!\?!', $('.khuvuc').attr('value')),
                        isReplace: true
                    });
                    listSpecial.push({
                        label: 'Học Sinh Chưa Được Chăm Sóc Tháng Hiện Tại',
                        value: '!EXISTS(SELECT * FROM CHAMSOCKHACHHANG WHERE `Ngày Gọi` <= \'!\?!\' AND `Ngày Gọi` >= \'!\?!\' AND USERS.`User ID` = CHAMSOCKHACHHANG.`User ID`)'.replace('!\?!', lastDateInMonth).replace('!\?!', fistDateInMonth),
                    });
                    month = month - 1;
                    daysInMonth = ("0" + (new Date(year, month, 0).getDate())).slice(-2); 
                    fistDateInMonth = year + '-' + month + '-01 00:00:00';
                    lastDateInMonth = year + '-' + month + '-' + daysInMonth + ' 23:59:00';
                    listSpecial.push({
                        label: 'Học Sinh Chưa Được Chăm Sóc Tháng Trước',
                        value: '!EXISTS(SELECT * FROM CHAMSOCKHACHHANG WHERE `Ngày Gọi` <= \'!\?!\' AND `Ngày Gọi` >= \'!\?!\' AND USERS.`User ID` = CHAMSOCKHACHHANG.`User ID`) AND USERS.`Ngày Nhập Học` <= \'!\?!\''.replace('!\?!', lastDateInMonth).replace('!\?!', fistDateInMonth).replace('!\?!', lastDateInMonth),
                    });
                    break;
                case 'cskh':
                    listSpecial.push({
                        label: 'Lọc Các Chăm Sóc Của Học Sinh Đã Nghĩ',
                        value: 'SELECT * FROM CHAMSOCKHACHHANG_VIEW WHERE `Cơ Sở` = \'!\?!\' '.replace('!\?!', $('.khuvuc').attr('value')),
                        isReplace: true
                    });
                    break;
                case 'lophoc': {
                    listSpecial.push({
                        label: 'Lọc Lớp Chưa Có Điểm Tráng Này',
                        value: '!EXISTS(SELECT * FROM SCORESHEETS ' +
                        'WHERE `month` = MONTH(CONVERT_TZ(CURRENT_DATE(), @@session.time_zone,\'+07:00\')) ' +
                        'AND `year` = YEAR(CONVERT_TZ(CURRENT_DATE(), @@session.time_zone,\'+07:00\')) ' +
                        'AND `classID` = LOPHOC_VIEW.`Mã Lớp`)',
                        isReplace: false
                    });
                } break;
                default:
            }
            
            this.state.headers.map((e, i) => {
                this.refs[e.value].revokeAllValue();
            });
            
            this.setState({
                headers: headers,
                filterData: filterData,
                _filterData: filterData,
                inforFilter: {},
                listSpecial: listSpecial,
                listSpecialSelected: [],
            })
        } else {
            this.setState({
                headers: [],
                filterData: null,
                _filterData: null,
                inforFilter: {},
                listSpecial: [],
                listSpecialSelected: [],
            })
        }
    }

    onChange (header, data) {
        if (header != null && data != null) {
            let inforFilter = this.state.inforFilter;
            inforFilter[header] = data;
            this.setState({inforFilter: inforFilter, });            
        }
    }
}

module.exports = connect(function (state) {
    return {
        socket: state.socket,
        userInfo: state.userinformation,
    };
}) (FilterHouston);
