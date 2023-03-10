import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Landing from './pages/landing';
import Dash from './pages/dashboard';
import Gauge from './utils/gauge';
import Redirecting from './pages/redirect';

const Rotas = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/" exact element={<Landing />} />
            <Route path="/dash" element={<Dash />} />
            <Route path="/test" element={<Gauge />} />
            <Route path="/ESPServerRedirect" element={<Redirecting />} />
        </Routes>
    </BrowserRouter>
)

export default Rotas;