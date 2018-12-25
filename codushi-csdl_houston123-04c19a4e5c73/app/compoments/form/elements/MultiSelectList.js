import React from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons';

import mystyle from './stylemultiselectlist.css';

class MultiSelectList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            options: [],
            optionSelected: [],

            isLoading: false,
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
        if (!this.state.isLoading && this.props.options != this.state.options) {            
            this.setState({
                options: this.props.options,
                optionSelected: [],
                isLoading: true,
            })
        }
    }

    render () {
        if (this.state.options != null && this.state.optionSelected != null) {
            return (
                <div style={{
                    'display': 'grid',
                    'grid-template-columns': 'calc(50% - 20px) 40px calc(50% - 20px)',
                    'margin': '5px',
                    'text-align': 'left',
                }}>
                    <div style={{
                        'border': '1px solid #ccc',
                        'border-radius': '5px',
                        'overflow-y': 'auto',
                        'overflow-x': 'hidden',
                        'height': '200px',
                    }}>
                    {
                        this.state.options.map((v, i) => {
                            return (
                                <div 
                                    className={mystyle.options}
                                    onClick={() => {
                                        let options = this.state.options;
                                        let optionSelected = this.state.optionSelected;
                                        optionSelected.push(v);
                                        options.splice(i, 1);
                                        this.setState({
                                            options: options,
                                            optionSelected: optionSelected,
                                        })
                                    }}
                                >
                                    {v.label}
                                </div>
                            )
                        })
                    }
                    </div>
                    <div style={{
                        'display': 'table',
                        'height': '100%',
                        'text-align': 'center',
                    }}>
                        <div style={{
                            'display': 'table-cell',
                            'vertical-align': 'middle',
                        }}>
                            <FontAwesomeIcon icon={faExchangeAlt} />
                        </div>
                    </div>
                    <div style={{
                        'border': '1px solid #ccc',
                        'border-radius': '5px',
                        'overflow-y': 'auto',
                        'overflow-x': 'hidden',
                        'height': '200px',
                    }}>
                    {
                        this.state.optionSelected.map((v, i)=> {
                            return (
                                <div 
                                    className={mystyle.options}
                                    onClick={() => {
                                        let options = this.state.options;
                                        let optionSelected = this.state.optionSelected;
                                        options.push(v);
                                        optionSelected.splice(i, 1);
                                        this.setState({
                                            options: options,
                                            optionSelected: optionSelected,
                                        })
                                    }}
                                >
                                    {v.label}
                                </div>
                            )
                        })
                    }
                    </div>
                </div>
            )
        } else {
            return (
                <div></div>
            );
        }
    }
}

module.exports = MultiSelectList;
