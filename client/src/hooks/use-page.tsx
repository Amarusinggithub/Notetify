import React, {
	createContext,
	useContext,
	useState,
	type PropsWithChildren,
} from 'react';
import type { SharedData } from '../types';

type PageContextType = {
	sharedData: SharedData | undefined;
	url: string;
	setUrl: React.Dispatch<React.SetStateAction<string>>;
	setSharedData: React.Dispatch<React.SetStateAction<SharedData | undefined>>;
};

type PageProviderProps = PropsWithChildren;

const PageContext = createContext<PageContextType | undefined>(undefined);

export function PageProvider({ children }: PageProviderProps) {
	const [url, setUrl] = useState<string>('');
	const [sharedData, setSharedData] = useState<SharedData | undefined>();

	return (
		<PageContext.Provider
			value={{
				url,
				setUrl,

				sharedData,
				setSharedData,
			}}
		>
			{children}
		</PageContext.Provider>
	);
}

export default function usePage() {
	const context = useContext(PageContext);
	if (!context) {
		throw new Error('usePage must be used within the context of PageProvider');
	}
	return context;
}
