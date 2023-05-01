import React, { useState, useEffect, useRef } from 'react';
import "./style.css";
import FeatherIcon from 'feather-icons-react';

import Toggle from 'react-toggle';
import "react-toggle/style.css"

import Inclination from '../../utils/inclination';
import Pitch from '../../utils/pitch';
import Gauge from '../../utils/gauge';
import Map from '../../utils/maps';
import ErrorList from '../../utils/errorList';
import mqtt from 'mqtt';

import BatteryGauge from 'react-battery-gauge';
import { useLocation } from 'react-router-dom';

const RPM_to_KMH = 10.36140583554377;//10.38;
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
        Controller_Temperature_C: 0,
        recording: false
    });
    const [ highHistory, setHighHistory ] = useState([]);

    const pendingResponseRef = useRef(true);
    const [ pendingResponse, setPendingReponse ] = useState(true);

    //  Last received message states
    const [ lastHighFreqTime, setLastHighTime ] = useState(null);
    const [ lastMedFreqTime, setLastMedTime ] = useState(null);
    const [ timer, setTimer ] = useState({ high: 0, medium: 0 });

    //  Vehicle and Cell ID coordinates managing
    const [ coordinates, setCoordinates ] = useState({ lat: 0, lng: 0 });
    const [ cellCoordinates, setCellCordinates ] = useState({ lat: 0, lng: 0, range: 0 });
    const [ coordinatesUpdate, setCoordinateUpdate ] = useState( new Date() );

    // Reported error list
    const [ errorList, setErrorList ] = useState({
        BMS1: {
            "BMS1_W_cell_chg": 0,
            "BMS1_E_cell_chg": 0,
            "BMS1_W_pkg_overheat": 0,
            "BMS1_E_pkg_chg_overheat": 0,
            "BMS1_W_pkg_chg_undertemp": 0,
            "BMS1_E_pkg_chg_undertemp": 0,
            "BMS1_W_pkg_chg_overcurrent": 0,
            "BMS1_E_pkg_chg_overcurrent": 0,
            "BMS1_W_pkg_overvoltage": 0,
            "BMS1_E_pkg_overvoltage": 0,
            "BMS1_E_charger_COM": 0,
            "BMS1_E_pkg_chg_softstart": 0,
            "BMS1_E_chg_relay_stuck": 0,
            "BMS1_W_cell_dchg_undervoltage": 0,
            "BMS1_E_cell_dchg_undervoltage": 0,
            "BMS1_E_cell_deep_undervoltage": 0,
            "BMS1_W_pkg_dchg_overheat": 0,
            "BMS1_E_pkg_dchg_overheat": 0,
            "BMS1_W_pkg_dchg_undertemp": 0,
            "BMS1_E_pkg_dchg_undertemp": 0,
            "BMS1_W_pkg_dchg_overcurrent": 0,
            "BMS1_E_pkg_dchg_overcurrent": 0,
            "BMS1_W_pkg_undervoltage": 0,
            "BMS1_E_pkg_undervoltage": 0,
            "BMS1_E_VCU_COM": 0,
            "BMS1_E_pkg_dchg_softstart": 0,
            "BMS1_E_dchg_relay_stuck": 0,
            "BMS1_E_pkg_dchg_short": 0,
            "BMS1_E_pkg_temp_diff": 0,
            "BMS1_E_cell_voltage_diff": 0,
            "BMS1_E_AFE": 0,
            "BMS1_E_MOS_overtemp": 0,
            "BMS1_E_external_EEPROM": 0,
            "BMS1_E_RTC": 0,
            "BMS1_E_ID_conflict": 0,
            "BMS1_E_CAN_msg_miss": 0,
            "BMS1_E_pkg_voltage_diff": 0,
            "BMS1_E_chg_dchg_current_conflict": 0,
            "BMS1_E_cable_abnormal": 0
        },
        BMS2: {
            "BMS2_W_cell_chg": 0,
            "BMS2_E_cell_chg": 0,
            "BMS2_W_pkg_overheat": 0,
            "BMS2_E_pkg_chg_overheat": 0,
            "BMS2_W_pkg_chg_undertemp": 0,
            "BMS2_E_pkg_chg_undertemp": 0,
            "BMS2_W_pkg_chg_overcurrent": 0,
            "BMS2_E_pkg_chg_overcurrent": 0,
            "BMS2_W_pkg_overvoltage": 0,
            "BMS2_E_pkg_overvoltage": 0,
            "BMS2_E_charger_COM": 0,
            "BMS2_E_pkg_chg_softstart": 0,
            "BMS2_E_chg_relay_stuck": 0,
            "BMS2_W_cell_dchg_undervoltage": 0,
            "BMS2_E_cell_dchg_undervoltage": 0,
            "BMS2_E_cell_deep_undervoltage": 0,
            "BMS2_W_pkg_dchg_overheat": 0,
            "BMS2_E_pkg_dchg_overheat": 0,
            "BMS2_W_pkg_dchg_undertemp": 0,
            "BMS2_E_pkg_dchg_undertemp": 0,
            "BMS2_W_pkg_dchg_overcurrent": 0,
            "BMS2_E_pkg_dchg_overcurrent": 0,
            "BMS2_W_pkg_undervoltage": 0,
            "BMS2_E_pkg_undervoltage": 0,
            "BMS2_E_VCU_COM": 0,
            "BMS2_E_pkg_dchg_softstart": 0,
            "BMS2_E_dchg_relay_stuck": 0,
            "BMS2_E_pkg_dchg_short": 0,
            "BMS2_E_pkg_temp_diff": 0,
            "BMS2_E_cell_voltage_diff": 0,
            "BMS2_E_AFE": 0,
            "BMS2_E_MOS_overtemp": 0,
            "BMS2_E_external_EEPROM": 0,
            "BMS2_E_RTC": 0,
            "BMS2_E_ID_conflict": 0,
            "BMS2_E_CAN_msg_miss": 0,
            "BMS2_E_pkg_voltage_diff": 0,
            "BMS2_E_chg_dchg_current_conflict": 0,
            "BMS2_E_cable_abnormal": 0
        },
        MCU: {
            "hardwareFault1": 0,
            "motorSensor": 0,
            "overVoltage": 0,
            "underVoltage": 0,
            "overTemperature": 0,
            "overCurrent": 0,
            "overLoad": 0,
            "motorLock": 0,
            "hardwareFault2": 0,
            "hardwareFault3": 0,
            "motorSensorNotConnected": 0,
            "hardwareFault4": 0,
            "hardwareFault5": 0,
            "motorTempSensShort": 0,
            "motorTempSensOpen": 0
        }
    });

    //  Get coordinates for the cell tower
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


    //  Subscribe to topics
    const [ client, setClient ] = useState(null);
    //  EventListener for disable Whissleblowing service beforeUnload
    const handleTabClose = ( e ) => {
        e.preventDefault();
        client.publish( `Whistleblower/${clientID}/Are_u_talking_to_me?`, "goSleep" );
        return (e.returnValue = 'Are you sure you want to exit?');
    }
    useEffect( () => setClient(
        mqtt.connect(
            {
                protocol: 'ws',
                hostname: process.env.REACT_APP_MQTT_HOST,
                port: process.env.REACT_APP_MQTT_PORT,
                clientId: "WebClient_" + Math.random().toString(16).substr(2, 8),
                username: process.env.REACT_APP_MQTT_USER,
                password: process.env.REACT_APP_MQTT_PWD
            }
        )
    ), [] );
    useEffect( () => {
        // const client = mqtt.connect( `ws://${process.env.REACT_APP_MQTT_HOST}/mqtt`, { port: 8000 } );

        var Period;

        if (client) {

            client.on( 'connect', () => {
                
                client.subscribe(`Whistleblower/${clientID}/Are_u_talking_to_me?`, { qos: 0 }, (error) => (error) && console.log(error));
                client.subscribe(`Whistleblower/${clientID}/MediumFrequency`, { qos: 0 }, (error) => (error) && console.log(error));
                client.subscribe(`Whistleblower/${clientID}/HighFrequency`, { qos: 0 }, (error) => (error) && console.log(error));
                client.subscribe(`Whistleblower/${clientID}/MCU_ERR`, { qos: 0 }, (error) => (error) && console.log(error));
                client.subscribe(`Whistleblower/${clientID}/BMS1_ERR`, { qos: 0 }, (error) => (error) && console.log(error));
                client.subscribe(`Whistleblower/${clientID}/BMS2_ERR`, { qos: 0 }, (error) => (error) && console.log(error));
            });

            client.on( 'message', (topic, payload) => {

                switch ( topic ){
                    case `Whistleblower/${clientID}/MediumFrequency`:
                        const incommingMedium = payload.toString();

                        if ( incommingMedium.includes("{") ) {
                            console.log("success");
                            setMediumFreq( JSON.parse( incommingMedium ) );
                            setMediumHistory( (prevData) => [ ...prevData, JSON.parse(incommingMedium) ] );
                        } else {
                            //  xxxxxxxxxxxxxx      xxxxxxxxxxxxxx      xxx         xxxxxxxxxxxxxx      xxx
                            //  Lat                 Lng                 GPSSpd      Alt                 Orient
                
                            //  xxx                 xxx             xxx
                            //  SatInViewGNSS       SatInUseGPS     SatInUseGLONASS
                
                            //  xx      xxxxxxxxxx        xxxxxxxxx     xxx     x       xxxxx
                            //  Qlty    OPMode            CellID        MCC     MNC     LAC
                
                            //  xxxxxx      xxxxxxxxxxxxxxxxxxxx
                            //  Firm        ICCID

                            let mediumFreqPayload = {};

                            mediumFreqPayload["Latitude"] =                  parseFloat(incommingMedium.substring(0,14));
                            mediumFreqPayload["Longitude"] =                 parseFloat(incommingMedium.substring(14,28));
                            mediumFreqPayload["GPS_Speed"] =                 parseFloat(incommingMedium.substring(28,33));
                            mediumFreqPayload["Altitude"] =                  parseFloat(incommingMedium.substring(33,47));
                            mediumFreqPayload["Orientation"] =               parseFloat(incommingMedium.substring(47,52));
                            mediumFreqPayload["SatelitesInViewGNSS"] =       parseInt(incommingMedium.substring(52,55));
                            mediumFreqPayload["SatelitesInUseGPS"] =         parseInt(incommingMedium.substring(55,58));
                            mediumFreqPayload["SatelitesInUseGLONASS"] =     parseInt(incommingMedium.substring(58,63));
                
                            // Pack GPRS data in JSON
                            mediumFreqPayload["GPRS_SingalQuality"] =        parseInt(incommingMedium.substring(63,65));
                            mediumFreqPayload["GPRS_Operational_Mode"] =     incommingMedium.substring(65,77).trim();
                            mediumFreqPayload["cellID"] =                    (incommingMedium.substring(77,86));
                            mediumFreqPayload["MCC"] =                       (incommingMedium.substring(86,89));
                            mediumFreqPayload["MNC"] =                       (incommingMedium.substring(89,90));
                            mediumFreqPayload["LAC"] =                       (incommingMedium.substring(90,95));
                            mediumFreqPayload["Firmware_Ver"] =              (incommingMedium.substring(95,102));
                            mediumFreqPayload["ICCID"] =                     (incommingMedium.substring(102,122));

                            setMediumFreq( JSON.parse( mediumFreqPayload ) );
                            setMediumHistory( (prevData) => [ ...prevData, JSON.parse(mediumFreqPayload) ] );
                        }
                        
                        setLastMedTime( Date.now() );
                        break;
                    
                    case `Whistleblower/${clientID}/HighFrequency`:
                        const incommingHigh = payload.toString();

                        if ( incommingHigh.includes("{") ) {
                            setHighFreq( JSON.parse( incommingHigh ) );
                            setHighHistory( (prevData) => [ ...prevData, JSON.parse(incommingHigh) ] );
                        } else {
                            //gyro
                            //0,14  14,28   28,42
                            //acc
                            //42,45 45,48   48,51
                            //bat
                            //51,54 54,57   57,60   60,63   63,66
                            //bat2
                            //66,69 69,72   72,75   75,78   78,81
                            //pwt
                            //81,85 85,88   88,91,  91,94   94,95

                            let highFreqPayload = {};

                            //  IMU data
                            highFreqPayload["Yaw"] = parseFloat(incommingHigh.substring(0,14));
                            highFreqPayload["Pitch"] = parseFloat(incommingHigh.substring(14,28));
                            highFreqPayload["Roll"] = parseFloat(incommingHigh.substring(28,42));
                            highFreqPayload["Acell_x"] = parseInt(incommingHigh.substring(42,45));
                            highFreqPayload["Acell_y"] = parseInt(incommingHigh.substring(45,48));
                            highFreqPayload["Acell_z"] = parseInt(incommingHigh.substring(48,51));

                            // Pack Battery data in JSON
                            highFreqPayload["BMS1_Current"] = parseInt(incommingHigh.substring(51,54));
                            highFreqPayload["BMS1_Voltage"] = parseInt(incommingHigh.substring(54,57));
                            highFreqPayload["BMS1_SoC"] = parseInt(incommingHigh.substring(57,60));
                            highFreqPayload["BMS1_SoH"] =  parseInt(incommingHigh.substring(60,63));
                            highFreqPayload["BMS1_Temperature"] = parseInt(incommingHigh.substring(63,66));

                            highFreqPayload["BMS2_Current"] = parseInt(incommingHigh.substring(66,69));
                            highFreqPayload["BMS2_Voltage"] = parseInt(incommingHigh.substring(69,72));
                            highFreqPayload["BMS2_SoC"] = parseInt(incommingHigh.substring(72,75));
                            highFreqPayload["BMS2_SoH"] = parseInt(incommingHigh.substring(75,78));
                            highFreqPayload["BMS2_Temperature"] = parseInt(incommingHigh.substring(78,81));

                            // Pack powertrain data in JSON
                            highFreqPayload["Motor_Speed_RPM"] =    parseInt(incommingHigh.substring(81,85));
                            highFreqPayload["Motor_Torque_Nm"] =    parseInt(incommingHigh.substring(85,88));
                            highFreqPayload["Motor_Temperature_C"] =    parseInt(incommingHigh.substring(88,91));
                            highFreqPayload["Controller_Temperature_C"] =    parseInt(incommingHigh.substring(91,94));

                            highFreqPayload["recording"] = ( parseInt(incommingHigh.substring(91,94) === 1)?true:false);

                            setHighFreq( highFreqPayload );
                            setHighHistory( (prevData) => [ ...prevData, highFreqPayload ] );
                            
                        }
                        setLastHighTime( Date.now() );
                        break;

                    case `Whistleblower/${clientID}/MCU_ERR`:
                        const incommingMCUERR = payload.toString();
                        setErrorList( prevErr => ({ ...prevErr, MCU: JSON.parse(incommingMCUERR) }) );
                        break;

                    case `Whistleblower/${clientID}/BMS1_ERR`:
                        const incommingBMS1ERR = payload.toString();
                        setErrorList( prevErr => ({ ...prevErr, BMS1: JSON.parse(incommingBMS1ERR) }) );
                        break;

                    case `Whistleblower/${clientID}/BMS2_ERR`:
                        const incommingBMS2ERR = payload.toString();
                        setErrorList( prevErr => ({ ...prevErr, BMS2: JSON.parse(incommingBMS2ERR) }) );
                        break;

                    //  Get notified that module started the Wisseblowing service
                    case `Whistleblower/${clientID}/Are_u_talking_to_me?`:
                        if ( payload.toString() == 'Yes master! Resuming the message system' ) {
                            console.log( "PendingResponse is now equal to false" );
                            setPendingReponse(false);
                        }
                        break;

                    default:
                        console.log(JSON.parse( payload.toString() ));
                }
            });

            client.on( 'error', (error) => console.log(error) );

            client.publish( `Whistleblower/${clientID}/Are_u_talking_to_me?`, "getUp!" );

            //  Periodically sends heatbeat signal to microcontroller, so it knows that there is someone still watching the incomming mqtt packets
            Period = setInterval( () =>  client.publish( `Whistleblower/${clientID}/Heartbeat`, "1" ), 5000);
        }

        window.addEventListener('beforeunload', handleTabClose );

        return () => {
            window.removeEventListener('beforeunload', handleTabClose);
            Period && clearInterval( Period );
            client && client.publish( `Whistleblower/${clientID}/Are_u_talking_to_me?`, "goSleep" );
            client && client.end();
        }

    }, [client]);

    //  Check if the ESP successfully turned on the Whissleblowing service.
    useEffect( () => { pendingResponseRef.current = pendingResponse; }, [ pendingResponse ]);
    useEffect( () => {
        const timeout = setTimeout( () => {
            if ( pendingResponseRef.current ) {
                alert("The ESP client probablly didn't listened to the wake command. Restarting the system");
                window.removeEventListener('beforeunload', handleTabClose);
                window.history.back();
            }
        }, 15000 );

        return () => clearTimeout(timeout);
    }, []);

    //  Recording Toggle refs
    const ToggleRecordRef = useRef();
    const ParentDivToggle = useRef();

    const RecordingRef = useRef( highFreq.recording );
    useEffect( ()=> { RecordingRef.current = highFreq.recording }, [ highFreq.recording ]);
    

    const handdleToggleRecording = (e) => {

        if ( client ) {
            //  start or stop recording data
            (e.target.checked)
                ?client.publish(`Whistleblower/${clientID}/Are_u_talking_to_me?`, "startRecording")
                :client.publish(`Whistleblower/${clientID}/Are_u_talking_to_me?`, "stopRecording");

            //  Fix the toggle value for the desired state for 5 seconds
            ToggleRecordRef.current.state.checked = e.target.checked;
            const timeout = setTimeout( () => {
                //  Return to the real state value as well for the input element
                ToggleRecordRef.current.state.checked = ParentDivToggle.current.children[1].children[2].checked = RecordingRef.current;

                //  Sets the propper toggle style
                (RecordingRef.current)
                    ?( ParentDivToggle.current.children[1].className = "react-toggle react-toggle--checked" )
                    :( ParentDivToggle.current.children[1].className = "react-toggle" );
            }, 10000 );

            return timeout;
        }
    };

    //  Periodically update the timers
    useEffect( () => {
        const Period = setInterval( ()=>  {
            setTimer({
                high: Math.ceil((Date.now() - lastHighFreqTime) / 1000),
                medium: Math.ceil((Date.now() - lastMedFreqTime) / 1000)
            });
        }, 1000);

        return () => clearInterval( Period );
    }, [timer]);

    //  Sends the mqtt restart message to broker
    const handdleRefreshESP = (e) => client  && client.publish(`Whistleblower/${clientID}/Are_u_talking_to_me?`, "resetUrSelf");

    //  Change state of the Recording toggle every time highFreq.recording changes
    useEffect(() => {
        const timeout = handdleToggleRecording({ target: { checked: highFreq.recording }});
        return () => clearTimeout(timeout);
    }, [highFreq.recording]);

    return(
        <div className='dash' >
            <div className='TopInfo' style={{gridArea: 'topInfo'}}>
                <FeatherIcon size={20} icon="refresh-ccw"  style={{ cursor: 'pointer' }} onClick={ handdleRefreshESP } />
                <div className="last-update" >
                        <p> Last High frequency packet <br/> { ( timer.high > 50 )?'+50':timer.high }s </p>
                        <p> Last Medium frequency packet <br/> { ( timer.medium > 50 )?'+50':timer.medium }s </p>
                </div>
                <div ref={ParentDivToggle} style={{ display: 'flex', alignItems: 'center', width: '150px', justifyContent: 'space-around' }}>
                    <label> Record data </label>
                    <Toggle defaultChecked={highFreq.recording} ref={ToggleRecordRef} onClick={ (e) => handdleToggleRecording(e) } />
                </div>
            </div>
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
            <div className="errorListDiv" style={{ gridArea: 'errorList', padding: '0 5px' }}> <ErrorList list={errorList}/> </div>
        </div>
    );
}

export default Dash;