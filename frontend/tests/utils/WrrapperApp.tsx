import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthProvider from '../../src/hooks/useAuth.tsx';
import { NoteProvider } from '../../src/hooks/useNote.tsx';
import { SideNavProvider } from '../../src/hooks/useSideNav.tsx';
import { TagProvider } from '../../src/hooks/useTag.tsx';

type WrapperProps = {
	component: React.ReactElement;
};

const Wrapper = ({ component }: WrapperProps) => {
	const queryClient = new QueryClient();

	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<NoteProvider>
					<TagProvider>
						<SideNavProvider>{component}</SideNavProvider>
					</TagProvider>
				</NoteProvider>
			</AuthProvider>
		</QueryClientProvider>
	);
};

export default Wrapper;
