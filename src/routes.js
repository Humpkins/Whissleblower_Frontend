import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Landing from './pages/landing';
import Dash from './pages/dashboard';
import Redirecting from './pages/redirect';
import ErrorList from './utils/errorList';

const Rotas = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/" exact element={<Landing />} />
            <Route path="/dash" element={<Dash />} />
            <Route path="/test" element={<ErrorList list={{}} />} />
            <Route path="/ESPServerRedirect" element={<Redirecting />} />
        </Routes>
    </BrowserRouter>
)

export default Rotas;