import React, { useState } from 'react';
import { Navigate, useNavigate } from "react-router-dom";
import './style.css';

const Landing = () => {
    const [ name, setName ] = useState('');
    const navigate = useNavigate();

    return (
        <div className='Landing'>
            <form onSubmit={() => (name !== '')?navigate('\dash', { state: { clientID: name } }):alert('O nome do dispositivo deve ser preenchido antes de prosseguir')}>
                <h1> Bem vindo! </h1>
                <p> Nos informe o nome da sua moto para que possamos te informar os seus dados </p>
                <div>
                    <label> Nome do dispositivo </label>
                    <input type={'text'} value={name} onChange={ (e) => setName( e.target.value ) } />
                </div>
                    <button type={'submit'} > Procurar </button>
            </form>
        </div>
    );
}

export default Landing;