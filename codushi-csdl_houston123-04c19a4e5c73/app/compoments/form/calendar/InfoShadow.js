import React from 'react';
import style from './style.css';
import { isNumber, log } from 'util';
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
               
                {
                   (function()
                    {
                        console.log(this.props.info1.split("@")[1] == null);
                        
                        if(this.props.info1.split("@")[1] == null)
                        {
                            return( [<p style = {{"margin":0}}>{this.props.ten}<br/></p>,
                            <p>{this.props.info1}<br/>
                                {this.props.info2}
                             </p>]  
                            )
                        }
                        else
                        {
                            
                            let callback=[];
                            for(let [ i , v ] of this.props.info1.split('@').entries())
                            {
                                if(v == '')
                                    break;
                                let head;
                                let info;
                                head = <p style = {{"margin":0}}>{v}<br/></p>
                                info = <ul style = {{"margin":0}}>
                                        <li key={i}>{this.props.info2.split('@')[i].split('!')[0]}</li>
                                        <li key={i+20}>{this.props.info2.split('@')[i].split('!')[1]}</li>
                                        </ul>
                                callback.push(head)
                                callback.push(info)
                            }
                            console.log(callback);
                                                    
                            // callback=this.props.info1.split("!").map(function(v)
                            //         {
                            //             if(v!="")
                            //                 return(<li key={v.toString()}>{v}</li>)                      
                            //         }
                            // )
                            return(<div style = {{"margin":0}}>
                            {callback}
                            <p style = {{"margin":0}}>Cảnh báo: Nếu bỏ sẽ mất hết các lịch thay đổi của ngày này.</p>
                            </div>)                                                         
                        }
                    }.bind(this))()
                }
                
            </div>                           
        )
    }
}

module.exports = InfoShadow;
