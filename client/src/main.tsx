import { createRoot } from 'react-dom/client';

import { TanStackDevtools } from '@tanstack/react-devtools';
import  "./utils/i18n"
import './index.css';

import { StrictMode } from 'react';
import App from '@/App.tsx';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App />
		<TanStackDevtools
			config={{ hideUntilHover: true }}
			eventBusConfig={{ debug: true }}
			plugins={[

			]}
		/>
	</StrictMode>
);
