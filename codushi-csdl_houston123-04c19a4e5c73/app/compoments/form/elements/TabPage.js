{/* 
<TabPage
    onChange={this.changeSize}
    pages={[
        {
            label: 'Học Sinh',
            content:
            <div></div>
        },
        {
            label: 'Nhân Viên',
            content:
            <div></div>
        },
    ]}
/>
*/}

import React from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSpinner,
    faCheck,
    faTimes,
    faPrint,
} from '@fortawesome/free-solid-svg-icons';

import mystyle from './styletabpage.css';

class TabPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: 0,
            content: null,
        }
    }

    componentDidMount () {
        this.update();
    }

    componentWillUnmount() {
    }

    componentDidUpdate(prevProps, prevState) {
        this.update(prevProps, prevState);
    }

    update (prevProps, prevState) {
        if (this.props.onChange != null) {
            this.props.onChange(prevProps, prevState);
        }
    }

    render () {
        if (this.props.pages == null) {
            return (
                <div></div>
            );
        }

        return (
            <div className={mystyle.body}>
                <div className={mystyle.tabContainer}>
                    {
                        this.props.pages.map((v, i) => {
                            let classtab = mystyle.tab;
                            if (this.state.selected == i) {
                                classtab += ' ' + mystyle.tabSelected;
                            }

                            return (
                                <div 
                                    className={classtab}
                                    onClick={() => {
                                        this.setState({
                                            selected: i,
                                        })
                                    }}
                                >
                                    {v.label}
                                </div>
                            );
                        })
                    }
                </div>
                <div className={mystyle.contentContainer}>
                    {
                        this.props.pages.map((v, i) => {
                            if (this.state.selected == i) {
                                return v.content;
                            }
                        })
                    }
                </div>
            </div>
        );
    }
}

module.exports = TabPage;
