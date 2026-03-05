import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './components/App';
import './styles/index.css';
import { analytics } from './services/analytics';

// ── Application Entry ───────────────────────────────────────────
analytics.init();

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('No #root element');
createRoot(rootElement).render(<App />);
