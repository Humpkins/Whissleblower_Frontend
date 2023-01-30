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
    useEffect( () => setClient( mqtt.connect( `ws://${process.env.REACT_APP_MQTT_HOST}/mqtt`, { port: 8000 } ) ), [] );

    useEffect( () => {
        if ( client ) {
            client.publish( `${clientID}/Are_u_talking_to_me?`, "bringServerUp" );
            const interval = setInterval( () => {
                fetch("http://whistleblower.local/isServerUp", { method: 'GET'})
                .then(
                    ({ status }) => {
                        if ( status === 200 ) { window.location.replace("http://whistleblower.local/"); }
                    }
                )
                .catch( e => console.log(e));
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