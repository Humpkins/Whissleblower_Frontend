import React, { useState, useEffect } from "react";
import mqtt from 'mqtt';
import { useLocation } from 'react-router-dom';


const Redirecting = () => {
    const divEstiloso = {
        margin: '0 auto',
        width: '100%',
        fontSize: '50px'
    };

    const { state: { clientID } } = useLocation();

    const [ client, setClient ] = useState(null);
    useEffect( () => setClient( mqtt.connect(
        {
            protocol: 'ws',
            hostname: process.env.REACT_APP_MQTT_HOST,
            port: process.env.REACT_APP_MQTT_PORT,
            clientId: "WebClient_" + Math.random().toString(16).substr(2, 8),
            username: process.env.REACT_APP_MQTT_USER,
            password: process.env.REACT_APP_MQTT_PWD
        }
    ) ), [] );

    useEffect( () => {
        if ( client ) {
            client.publish( `Whistleblower/${clientID}/Are_u_talking_to_me?`, "bringServerUp" );
            const interval = setInterval( () => {
                fetch("http://whistleblower.local/isServerUp", { method: 'GET'})
                .then(
                    (response) => {
                        console.log(response);
                        if ( response.status === 200 ) { window.location.replace("http://whistleblower.local/"); }
                    }
                )
                .catch( e => {
                    window.location.replace("http://whistleblower.local/");
                });
            }, 5000);

            return () => clearInterval( interval );
        }

    }, [client] );

    return (
        <div style={divEstiloso}>
            Aguarde que você será redirecionado para o ESPServer
        </div>
    );
}

export default Redirecting;