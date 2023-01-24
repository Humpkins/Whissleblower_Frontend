import React, { useState } from 'react';
import { Navigate, useNavigate } from "react-router-dom";
import './style.css';

const Landing = () => {
    const [ name, setName ] = useState('');
    const navigate = useNavigate();

    const goDash = ( e ) => {
        e.preventDefault();

        if ( name === '' )
            alert('O nome do dispositivo deve ser preenchido antes de prosseguir');
        else
            navigate('\dash', { state: { clientID: name } });
    }

    const goESPServer = ( e ) => {
        e.preventDefault();

        if ( name === '' )
            alert('O nome do dispositivo deve ser preenchido antes de prosseguir');
        else {
            navigate('\ESPServerRedirect', { state: { clientID: name } })
        }

    }

    return (
        <div className='Landing'>
            <div>
                <h1> Bem vindo! </h1>
                <p> Nos informe o nome da sua moto para que possamos te informar os seus dados </p>
                <div>
                    <label> Nome do dispositivo </label>
                    <input type={'text'} value={name} onChange={ (e) => setName( e.target.value ) } />
                </div>
                <div className='buttonContainer'>
                    <button onClick={ e => goDash(e) } > Reatime data </button>
                    <button onClick={ e => goESPServer(e) } > Fileserver </button>
                </div>

            </div>
        </div>
    );
}

export default Landing;