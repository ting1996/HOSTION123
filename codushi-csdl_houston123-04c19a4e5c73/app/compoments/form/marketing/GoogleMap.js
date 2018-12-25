import React from 'react';
import {Map, InfoWindow, Marker, GoogleApiWrapper, Circle} from 'google-maps-react';
import mystyle from './style.css';

class GoogleMaps extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: '',
            lat: 10.772599,
            long: 106.698338,
            defaultLat: 10.772599,
            defaultLng: 106.698338,
            isClick: false,
        }
    }

    componentDidMount () {
        this.props.getMe(this);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.oldlocation == null && this.props.oldlocation != null) {
            let location = this.props.oldlocation.split(' ');
            let map = this.map;
            let lat = Number(location[0]);
            let lng = Number(location[1]);
            
            this.setPlace(lat, lng);
        }
    }

    onClick (mapProps, map, clickEvent) {
        let lat = clickEvent.latLng.lat();
        let long = clickEvent.latLng.lng();
        this.setState({
            lat: lat,
            long: long,
        });
    }

    setPlace (lat, lng) {
        if (this.map != null) {
            let map = this.map;
            this.setState({
                lat: lat,
                long: lng,
            });

            map.setCenter({lat: lat, lng: lng});
            map.setZoom(17);
        }
    }

    fetchPlaces (mapProps, map) {
        let that = this;
        this.map = map;
        const {google} = mapProps;
        const input = document.getElementById('googleapi-search-input');
        const searchBox = new google.maps.places.SearchBox(input);
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

        searchBox.addListener('places_changed', function() {
            var places = searchBox.getPlaces();
  
            if (places.length == 0) {
              return;
            }

            that.setState({
                title: places[0].name,
                lat: places[0].geometry.location.lat(),
                long: places[0].geometry.location.lng(),
            });

            map.setCenter({lat: places[0].geometry.location.lat(), lng: places[0].geometry.location.lng()});
            map.setZoom(17);
        });

        if (this.props.oldlocation != null) {
            let location = this.props.oldlocation.split(' ');
            let lat = Number(location[0]);
            let lng = Number(location[1]);
            this.setPlace(lat, lng);
        }
    }

    render () {
        return (
            <div className={mystyle.map}>
                <Map 
                    google={this.props.google} 
                    zoom={10} //14
                    initialCenter={{
                        lat: this.state.defaultLat,
                        lng: this.state.defaultLng,
                    }}
                    style = {{
                        'position': 'unset',
                        'width': '100%',
                        'height': '400px'
                    }}
                    onReady={this.fetchPlaces.bind(this)}
                    onClick={this.onClick.bind(this)}
                >                
                    <Marker 
                        name={this.state.title}
                        position={{lat: this.state.lat, lng: this.state.long}}
                    />
                </Map>
            </div>
        )
    }
}

module.exports = GoogleApiWrapper({
    apiKey: ('AIzaSyDNtaePSbuXWA44cEsWQrrheQD2UDO2FOY')
}) (GoogleMaps)