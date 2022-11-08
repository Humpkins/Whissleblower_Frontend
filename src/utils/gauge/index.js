import React, { useEffect, useState } from "react";
import './style.css';
import GaugeChart from 'react-gauge-chart';

const Gauge = ({ value=20, total=100, firstStep = 0.6, secondStep = 0.75, unit='km/h', Name= 'Default' }) => {

    //  //  Test value change
    // const [ value, setValue ] = useState(Math.round(Math.random() * (100 - 0 + 1) + 0));
    // useEffect(() => {
    //   const thisInterval = setInterval( () => setValue(Math.round(Math.random() * (100 - 0 + 1) + 0)), 1000 );
    
    //   return () => clearInterval(thisInterval);
    // }, []);
    

    const gaugeContainer = {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',

        borderRadius: '25px',
        width: '80%'

    };

    const gaugeTextStyle = {
        position: 'absolute',
        bottom: '15%',
        fontSize: '1.5em'
    };

    return (
        <div className='gaugeContainer' style={gaugeContainer}>
            <p style={{ alignSelf: 'start', left: '10%',  top: 0, fontSize: '1em'}}> {Name} </p>

            <GaugeChart
                id="uv-gauge-chart"
                animate={false}
                nrOfLevels={2}
                arcsLength={[value/total,  (total - value)/total]}
                colors={[
                    ((value/total) > firstStep && (value/total) < secondStep )
                        ?'rgba(255, 255, 0, 0.5)'
                        :((value/total) > secondStep )
                            ?'rgba(255, 0, 0, 0.5)'
                            :'rgba(0, 255, 0, 0.5)',
                    'rgba(0, 0, 0, 0.2)'
                ]}
                arcPadding={0.02}
                needleColor="transparent"
                needleBaseColor="transparent"
                hideText
            />
        
            <div
                className="gaugeText"
                style={gaugeTextStyle}
            >
                {value} {unit}
            </div>

        </div>
    );
}

export default Gauge;