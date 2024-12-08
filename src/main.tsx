import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import AppOld from './AppOld';

createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AppOld />
    </React.StrictMode>,
);
