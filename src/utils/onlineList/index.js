import { useEffect, useState } from 'react';
import './style.css';
import mqtt from 'mqtt';

const WhistleblowerTopics = ({ setSelected }) => {
    const [topics, setTopics] = useState([]);

    //  Subscribe to topics
    const [ client, setClient ] = useState(null);
    useEffect( () => setClient( mqtt.connect(
        {
            protocol: 'ws',
            hostname: process.env.REACT_APP_MQTT_HOST,
            port: process.env.REACT_APP_MQTT_PORT,
            clientId: "WebClient_" + Math.random().toString(16).substring(2, 8),
            username: process.env.REACT_APP_MQTT_USER,
            password: process.env.REACT_APP_MQTT_PWD
        }
    ) ), [] );
    useEffect(() => {

        if ( client ) {
            client.on('error', (err) => {
                console.error('Connection error: ', err);
                client.end();
            });

            client.on('connect', () => {
                console.log("Connected to " + process.env.REACT_APP_MQTT_HOST + ":" + process.env.REACT_APP_MQTT_PORT.toString());
                client.subscribe("Whistleblower/#");
            });
    
            client.on('message', (topic, message) => {
                if (topic.startsWith('Whistleblower')) {
                    const topico = topic.toString();
                    const firstOccourence = topico.indexOf("/");
                    const secondOccourence = topico.indexOf("/", firstOccourence + 1 );
                    const deviceID = topico.substring( firstOccourence + 1, secondOccourence );

                    setTopics( prevTopics => {
                        if (!prevTopics.some( topic => topic.name === deviceID )) {
                            return [ ...prevTopics,  ({ id: Math.floor(Math.random() * (1000 - 0 + 1)), name: deviceID, time: Date.now() }) ];
                        } else return prevTopics
                    });
                }
            });
        }

        return () => {
            client && client.end();
        };

    }, [client]);

    //  Force render in time interval
    useEffect(()=> {
        const Period = setInterval( () => setTopics( topics => topics.filter( topico => (Date.now() - topico.time < 20000) ) ), 1000 );
        return () => clearInterval(Period);
    }, );

    const renderTopics = () => {

        return topics.map(topic => {
            return (
                <li key={topic.id} onClick={ () => setSelected(topic.name) }>
                    <div> {topic.name} </div>
                </li>
            );
        });
    };

    return (
        <div className="onlines">
            <h1>Connected devices</h1>
            <ul className="onlineList" >{renderTopics()}</ul>
        </div>
    );
};

export default WhistleblowerTopics;
