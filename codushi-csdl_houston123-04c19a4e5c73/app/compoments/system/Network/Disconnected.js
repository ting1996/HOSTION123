import React from 'react';
import style from './style.css';

class Disconnected extends React.Component {
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

    dongy () {

    }

    close () {
    }

    render () {
        return (
            <div className={style.background}>
                <div className={style.body}>
                    <div>
                        <i className={"fa fa-cog fa-spin fa-3x fa-fw " + style.iconcog}></i>
                        <img className={style.image} src={this.props.image.src}/>
                    </div>
                    <div className={style.text}>
                        <span>Mất kết nối với máy chủ...</span>
                    </div>
                </div>
            </div>
        )
    }
}

module.exports = Disconnected;
