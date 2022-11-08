import React from "react";
import Motorcycle from '../../assets/lateral.png'

const Pitch = ({ angle=10, acc= 0 }) => {

    const containerStyle = {
        display: 'grid',
        gridTemplateAreas: '"left mid right"',
        gridTemplateColumns: '1fr 2fr 1fr',
        zIndex: 1,

        border: 'solid 1px black',
        borderRadius: '25px',
        height: '100%'
    };

    const vehicleStyle = {
        gridArea: 'mid',
        margin: 'auto auto 0',

        overflow: 'hidden',

        width: '70%',

        transformOrigin: ( angle > 0 )
                ?'bottom right'
                :'bottom left',

        transform: ( angle > 90 )
                        ?'rotate(90deg)'
                        :( angle < -90 )
                            ?'rotate(-90deg)'
                            :'rotate('+angle.toString()+'deg)',
    };

    const angleStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '3.5em',
        zIndex: '2',
    }

    const accStyle = {
        display: 'flex',
        marginTop: 'auto',
        background: 'rgba(255, 0, 0, 0.5)',
        color: 'white',
        marginRight: '1px',
        paddingTop: '3.5px',
        paddingBottom: '3.5px'
    }

    const accStyleLeft = {
        gridArea: 'left',
        justifyContent: 'start',
        borderBottomLeftRadius: '25px',
        paddingLeft: '20px',
        boxShadow: 'inset -100px 0px 100px -50px rgba(255, 255, 255, 1)',
    }

    const accStyleRight = {
        gridArea: 'right',
        justifyContent: 'end',
        borderBottomRightRadius: '25px',
        paddingRight: '20px',
        boxShadow: 'inset 100px 0px 100px -50px rgba(255, 255, 255, 1)',
    }

    return (
        <div className="pitchContainer" style={containerStyle} >
            { angle > 0 && <div style={{...angleStyle, gridArea: 'left'}}> {Math.abs(angle)}° </div>}
            { angle < 0 && <div style={{...angleStyle, gridArea: 'right'}}> {Math.abs(angle)}° </div> }
            <img src={Motorcycle} alt="moto" style={vehicleStyle}/>
            { acc > 0 && <div style={{ ...accStyle, ...accStyleRight}}> {Math.abs(acc)} m/s² </div> }
            { acc < 0 && <div style={{ ...accStyle, ...accStyleLeft}}> {Math.abs(acc)} m/s² </div> }
        </div>
    );
}

export default Pitch;