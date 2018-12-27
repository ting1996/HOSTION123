import React from 'react';
import style from './style.css';
import { isNumber } from 'util';
{/* <InfoShadow 
                      ten ={this.state.tenlop} 
                      ngaybatdau = {this.state.ngaybatdau}
                      ngayketthuc= {this.state.ngayketthuc}
                      clientY = {this.state.clientY}
                      clientX = {this.state.clientX}
                      pageXY = {this.state.pageXY}/> */}

class InfoShadow extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            x:-100,
            y:-100,
            
        }
        
    }

   

    componentDidMount () {
        
        
    }

    componentWillUnmount() {
        
    }

    componentDidUpdate(prevProps, prevState) {
        
        let x;
        let y;

        if(isNumber(this.props.pageXY.X))
        {
            x = this.props.pageXY.X+10;
            if (this.refs.shadow != null && this.refs.shadow.clientWidth) {
                if ((Number(this.refs.shadow.clientWidth) + Number(x)) > window.innerWidth) {
                    x = Number(this.props.pageXY.X) - Number(this.refs.shadow.clientWidth)-10;
                }
            }
        }
        if (isNumber(this.props.pageXY.Y)) {
            y = this.props.pageXY.Y+10;
            if (this.refs.shadow != null && this.refs.shadow.clientHeight) {
                if ((Number(this.refs.shadow.clientHeight) + Number(y)) > window.innerHeight) {
                    y = Number(this.props.pageXY.Y) - Number(this.refs.shadow.clientHeight)-10;
                }
            }
        }
        if(this.state.x !=x||this.state.y!=y)
            this.setState({x:x,y:y})
    }
    onMouseMove(e)
    {
        
        
        this.props.suicide()
    }
    
    render () {
        
        
        return (
            <div ref='shadow' style = {{"background-color":"white","position":"fixed","top":(this.state.y)+"px","left":(this.state.x)+"px"}} onMouseMove ={this.onMouseMove.bind(this)}>
                <p style = {{"margin":0}}>{this.props.ten}<br/></p>
                {
                   (function()
                    {
                        
                        
                        if(this.props.ngaybatdau.split("!").length==1)
                        {
                            return(<p>{this.props.ngaybatdau}<br/>
                                {this.props.ngayketthuc}
                                </p>   
                            )
                        }
                        else
                        {
                            let callback;
                          
                            callback=this.props.ngaybatdau.split("!").map(function(v)
                                    {
                                        if(v!="")
                                            return(<li key={v.toString()}>{v}</li>)                      
                                    }
                            )
                            return(<div style = {{"margin":0}}><ul style = {{"margin":0}}>{callback}</ul>
                            <p style = {{"margin":0}}>{this.props.ngayketthuc}</p>
                            </div>)                                                         
                        }
                    }.bind(this))()
                }
                
            </div>                           
        )
    }
}

module.exports = InfoShadow;
