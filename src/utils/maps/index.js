import React, { useState, useRef } from "react";
import RadioTower from '../../assets/radio-tower.png';
import NavigationArrow from "../../assets/navigationArrow.png";
import "./style.css";

import { useJsApiLoader, GoogleMap, MarkerF, CircleF, /*Autocomplete,*/ DirectionsRenderer } from "@react-google-maps/api";

const Map = ({ shouldShow, coordinates, cellCoordinates }) => {
    
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        libraries: ['places']
    });

    const [ map, setMap ] = useState( /** @type google.maps.Map */ (null));

    const [ directionsResponse, setDirectionsResponse ] = useState(null);

    const originRef = useRef();
    const destinationRef = useRef();

    const calculateRoute = async () => {
        if ( originRef.current.value === '' || destinationRef.current.value === '' ){ return; } 
        
        // eslint-disable-next-line no-undef
        const directionService = new google.maps.directionService();

        const results = await directionService.route({
            origin: originRef.current.value,
            destination: destinationRef.current.value,
            // eslint-disable-next-line no-undef
            travelMode: google.maps.TravelMode.DRIVING
        });
        setDirectionsResponse(results);
    }

    const clearRoute = () => {
        setDirectionsResponse(null);
        originRef.current.vaule = '';
        destinationRef.current.value ='';
    }

    const options = {
        strokeColor: '#00b7ff',
        strokeOpacity: 0.8,
        strokeWeight: 1,

        fillColor: '#00b7ff',
        fillOpacity: 0.15,

        clickable: false,
        draggable: false,
        editable: false,
        visible: true,
        zIndex: 1
    }

    return (
        <div className="MapContainer">

            { (isLoaded) &&
                <GoogleMap
                    // center={coordinates}
                    zoom={15}
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    options={{
                        zoomControl: false,
                        mapTypeControl: false,
                        streetViewControl: false
                    }}
                    onLoad={ (MyMap) => setMap(MyMap) }
                >
                    <MarkerF
                        position={coordinates}
                        // icon={NavigationArrow}
                        // height={"5px"}
                    />

                    {(cellCoordinates.lat !== 0) && 
                        <MarkerF
                            position={cellCoordinates}
                            options={{ fillColor: 'blue' }}
                            icon={RadioTower}
                            width={"20%"}
                        />
                    }
                    {(cellCoordinates.lat !== 0) && <CircleF  center={cellCoordinates} radius={cellCoordinates.range} options={options} />}

                    { directionsResponse && <DirectionsRenderer directions={directionsResponse}/> }
                </GoogleMap>
            }

            <div className="control">
                
                <div className="inputGroup">
                    {/* <Autocomplete> */}
                        <input placeholder="from" type="text"  ref={originRef} />
                    {/* </Autocomplete> */}
                    {/* <Autocomplete> */}
                        <input placeholder="to"   type="text" ref={destinationRef}/>
                    {/* </Autocomplete> */}
                </div>
                
                <div className="buttonGroup">
                    <button onClick={calculateRoute}> Search </button>
                    <button onClick={clearRoute}> Clear </button>
                    <button onClick={ () => map.panTo( coordinates ) }> Center </button>
                </div>
            </div>
        </div>
    )
}

export default Map;