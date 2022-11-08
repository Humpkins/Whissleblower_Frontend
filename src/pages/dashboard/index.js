import React, { useState, useEffect } from 'react';
import "./style.css";
import FeatherIcon from 'feather-icons-react';

import Toggle from 'react-toggle';
import "react-toggle/style.css"

import Inclination from '../../utils/inclination';
import Pitch from '../../utils/pitch';
import Gauge from '../../utils/gauge';
import Map from '../../utils/maps';
import mqtt from 'mqtt';

import BatteryGauge from 'react-battery-gauge';
import { useLocation } from 'react-router-dom';

const RPM_to_KMH = 10.38;
const RPM_to_MS = 0.02681367;

const Dash = () => {

    const { state: { clientID } } = useLocation();

    const [ shouldShow, setShouldShow ] = useState(false);

    const [ mediumFreq, setMediumFreq ] = useState({
        Latitude: 0,
        Longitude: 0,
        GPS_Speed: 0,
        Altitude: 0,
        Orientation: 0,
        SatelitesInViewGNSS: 0,
        SatelitesInUseGPS: 0,
        SatelitesInUseGLONASS: 0,
        GPRS_SingalQuality: 0,
        GPRS_Operational_Mode: 0,
        cellID: 0,
        MCC: 0,
        MNC: 0,
        LAC: ""
    });
    const [ mediumHistory, setMediumHistory ] = useState([]);

    const [ highFreq, setHighFreq ] = useState({
        Yaw: 0,
        Pitch: 0,
        Roll: 0,
        Acell_x: 0,
        Acell_y: 0,
        Acell_z: 0,
        BMS1_Current: 0,
        BMS1_Voltage: 0,
        BMS1_SoC: 0,
        BMS1_SoH: 0,
        BMS1_Temperature: 0,
        BMS2_Current: 0,
        BMS2_Voltage: 0,
        BMS2_SoC: 0,
        BMS2_SoH: 0,
        BMS2_Temperature: 0,
        Motor_Speed_RPM: 0,
        Motor_Torque_Nm: 0,
        Motor_Temperature_C: 0,
        Controller_Temperature_C: 0
    });
    const [ highHistory, setHighHistory ] = useState([]);

    const [ pendingResponse, setPendingReponse ] = useState(false);

    //  Vehicle and Cell ID coordinates managing
    const [ coordinates, setCoordinates ] = useState({ lat: 0, lng: 0 });
    const [ cellCoordinates, setCellCordinates ] = useState({ lat: 0, lng: 0, range: 0 });
    const [ coordinatesUpdate, setCoordinateUpdate ] = useState( new Date() );
    useEffect( () => {
        if ( new Date() - coordinatesUpdate > 1000 ) {
            setCoordinates({
                lat: parseFloat(mediumFreq.Latitude),
                lng: parseFloat(mediumFreq.Longitude)
            });

            shouldShow &&
            fetch(`http://opencellid.org/cell/get?key=${process.env.REACT_APP_OPENCELLID_API_KEY}&mcc=${mediumFreq.MCC}&mnc=${mediumFreq.MNC}&lac=${parseInt(mediumFreq.LAC)}&cellid=${mediumFreq.cellID}&format=json`)
                .then( response => response.json() )
                .then( response => {
                    if ( !response.error ){
                        setCellCordinates({ lat: parseFloat(response.lat), lng: parseFloat(response.lon), range: parseInt(response.range) });
                        console.log(response);
                    } else {
                        fetch(
                            `https://www.googleapis.com/geolocation/v1/geolocate?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`,
                            {
                                method: 'POST',
                                body: JSON.stringify({
                                    radioType: mediumFreq.GPRS_Operational_Mode,
                                    cellTowers:[{
                                        cellId: mediumFreq.cellID,
                                        locationAreaCode: parseInt(mediumFreq.LAC),
                                        mobileCountryCode: mediumFreq.MCC,
                                        mobileNetworkCode: mediumFreq.MNC
                                    }]
                                })
                            }
                        )
                        .then( response => response.json() )
                        .then( response => {
                            setCellCordinates({ lat: parseFloat(response.location.lat), lng: parseFloat(response.location.lng), range: parseInt(response.accuracy) });
                            console.log(response);
                        })
                        .catch( err => console.log(err) );
                    };
                })
                .catch( err => {
                    console.log("Deu erro!");
                    console.log(err);
                });


            setCoordinateUpdate( new Date() );
        }
    },[mediumFreq]);

    useEffect( () => {

        const client =  mqtt.connect( `ws://${process.env.REACT_APP_MQTT_HOST}/mqtt`, { port: 8000 } );
        if (client) {

            client.on( 'connect', () => {
                
                client.subscribe(`${clientID}/Are_u_talking_to_me?`, { qos: 0 }, (error) => (error) && console.log(error));
                client.subscribe(`${clientID}/MediumFrequency`, { qos: 0 }, (error) => (error) && console.log(error));
                client.subscribe(`${clientID}/HighFrequency`, { qos: 0 }, (error) => (error) && console.log(error));
            });

            client.on( 'message', (topic, payload) => {

                switch ( topic ){
                    case `${clientID}/MediumFrequency`:
                        setMediumFreq( JSON.parse( payload.toString() ) );
                        setMediumHistory( (prevData) => [ ...prevData, JSON.parse(payload.toString()) ] );
                        break;
                    
                    case `${clientID}/HighFrequency`:
                        setHighFreq( JSON.parse( payload.toString() ) );
                        setHighHistory( (prevData) => [ ...prevData, JSON.parse(payload.toString()) ] );
                        break;

                    case `${clientID}/Are_u_talking_to_me?`:
                        if ( payload.toString() == 'Yes master! Resuming the message system' ) setPendingReponse(false);
                        break;

                    default:
                        console.log(JSON.parse( payload.toString() ));
                }
            });

            client.on( 'error', (error) => console.log(error) );

            client.publish( `${clientID}/Are_u_talking_to_me?`, "getUp!" );
            setPendingReponse(true);
        }

        const handleTabClose = ( e ) => {
            e.preventDefault();
            client.publish( `${clientID}/Are_u_talking_to_me?`, "goSleep" );
            return (e.returnValue = 'Are you sure you want to exit?');
        }

        window.addEventListener('beforeunload', handleTabClose );

        return () => {
            window.removeEventListener('beforeunload', handleTabClose);  
            client.publish( `${clientID}/Are_u_talking_to_me?`, "goSleep" );
            client.end();
        }

    }, []);

    return(
        <div className='dash'>
            <div className="pitch" style={{gridArea: 'pitch'}}>
                <Pitch angle={parseInt(highFreq.Pitch)} acc={parseInt(highFreq.Acell_x)} />
            </div>
            <div className="gauge_data" style={{gridArea: 'gauge'}}>
                <Gauge Name='Speed' total={120} value={ Math.round(highFreq.Motor_Speed_RPM / RPM_to_KMH) } unit='km/h'/>
                <Gauge Name='DC current'  total={200} value={ highFreq.BMS1_Current + highFreq.BMS2_Current } unit='A'/>
                <Gauge Name='Mechanical Power' total={15} value={ Math.round(((highFreq.Motor_Speed_RPM * RPM_to_MS) * highFreq.Motor_Torque_Nm) / 1000) } unit='kW'/>
                <Gauge Name='Torque' total={200} value ={ highFreq.Motor_Torque_Nm } unit='N/m'/>
                <Gauge Name='Efficiency' value={ Math.round( 100 *  (((highFreq.Motor_Speed_RPM * RPM_to_MS) * highFreq.Motor_Torque_Nm) / 1000) / (((highFreq.BMS1_Current * highFreq.BMS1_Voltage) + (highFreq.BMS2_Current * highFreq.BMS2_Voltage)) / 1000)) || 0 } unit='%'/>
                <Gauge Name='Eletrical Power' total={15} value= { Math.round(((highFreq.BMS1_Current * highFreq.BMS1_Voltage) + (highFreq.BMS2_Current * highFreq.BMS2_Voltage)) / 1000) } unit='kW'/>
                <div className='TemperatureContainer'>
                    <FeatherIcon style={{gridArea: 'icon'}} size={50} icon="thermometer"/>
                    <strong style={{ fontSize: '1.5em', gridArea: 'temperature' }}> { highFreq.Controller_Temperature_C }°C </strong>
                    <label style={{ gridArea: 'label' }}> Controller temperature </label>
                </div>
                <div />
                <div className='TemperatureContainer'>
                    <FeatherIcon style={{gridArea: 'icon'}} size={50} icon="thermometer"/>
                    <strong style={{ fontSize: '1.5em', gridArea: 'temperature' }}> { highFreq.Motor_Temperature_C }°C </strong>
                    <label style={{ gridArea: 'label' }}> Motor temperature </label>
                </div>
            </div>
            <div className="gyro" style={{gridArea: 'gyro'}}>
                <Inclination angle={parseInt(highFreq.Roll)} acc={parseInt(highFreq.Acell_y)}/>
            </div>
            <div className="battery" style={{ gridArea: 'battery', display: 'flex', flexDirection: 'column', width: 100 + '%'}}>
                <div>
                    <BatteryGauge value={ highFreq.BMS1_SoC } size={70}/>
                    <strong style={{fontSize: '1.5em'}} > SoH: <br/> { highFreq.BMS1_SoH }% </strong>
                    <strong style={{fontSize: '1.5em'}}>{ highFreq.BMS1_Voltage }V</strong>
                    <strong style={{fontSize: '1.5em'}}>{ highFreq.BMS1_Temperature }°C</strong>
                    <strong style={{fontSize: '1.5em', justifySelf: 'center'}} > { highFreq.BMS1_Current }A </strong>
                    {/* <strong style={{ fontSize: '1.5em' }} > 28.9 Ah </strong> */}
                </div>
                <div>
                    <BatteryGauge value={highFreq.BMS2_SoC} size={70}/>
                    <strong style={{fontSize: '1.5em'}} > SoH: <br/> { highFreq.BMS2_SoH }% </strong>
                    <strong style={{fontSize: '1.5em'}}>{ highFreq.BMS2_Voltage }V</strong>
                    <strong style={{fontSize: '1.5em'}}>{ highFreq.BMS2_Temperature }°C</strong>
                    <strong style={{fontSize: '1.5em', justifySelf: 'center'}} > { highFreq.BMS2_Current }A </strong>
                    {/* <strong style={{ fontSize: '1.5em' }} > 28.9 Ah </strong> */}
                </div>
            </div>
            <div className="signalStrength" style={{ gridArea: 'signal', display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
                <strong style= {{ fontSize: '1.5em' }}> GPRS signal quality: { mediumFreq.GPRS_SingalQuality } </strong>
                <strong style= {{ fontSize: '1.5em' }}> GPRS operational mode: { mediumFreq.GPRS_Operational_Mode } </strong>
                <strong style= {{ fontSize: '1.5em' }}> In view GNSS satelites: { mediumFreq.SatelitesInViewGNSS } </strong>
                <strong style= {{ fontSize: '1.5em' }}> Used GPS satelites: { mediumFreq.SatelitesInUseGPS } </strong>
                <strong style= {{ fontSize: '1.5em' }}> Used GLONASS satelites: { mediumFreq.SatelitesInUseGLONASS } </strong>
                
            </div>
            <div className="mapping" style={{ gridArea: 'mapa' }}>
                <Toggle defaultChecked={false} onChange={ e => (e.target.checked)?setShouldShow(true):setShouldShow(false) } />
                
                {(shouldShow)
                    ?<Map coordinates={coordinates} cellCoordinates={cellCoordinates} />
                    :<div className="mapOff" > Mapa desativado </div>}
            </div>
        </div>
    );
}

export default Dash;