import { createRoot } from 'react-dom/client';

import '@liveblocks/react-tiptap/styles.css';
import '@liveblocks/react-ui/styles.css';
import './index.css';

import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
	//<StrictMode>
	<App />,
	//</StrictMode>
);
