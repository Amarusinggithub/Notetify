import { createRoot } from 'react-dom/client';
import  "./utils/i18n"
import './index.css';

import { StrictMode } from 'react';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App />,
	</StrictMode>
);
