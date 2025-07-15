import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthProvider from '../../src/hooks/use-auth.tsx';
import { NoteProvider } from '../../src/hooks/use-mutate-note.tsx';
import { TagProvider } from '../../src/hooks/use-mutate-tag.tsx';

type WrapperProps = {
	component: React.ReactElement;
};

const Wrapper = ({ component }: WrapperProps) => {
	const queryClient = new QueryClient();

	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<NoteProvider>
					<TagProvider>{component}</TagProvider>
				</NoteProvider>
			</AuthProvider>
		</QueryClientProvider>
	);
};

export default Wrapper;
