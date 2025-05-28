import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { CreateNote, Note } from 'types';
import NoteCard from '../components/NoteCard';
import useNote from '../hooks/useNote';
import { useSideNav } from '../hooks/useSideNav';
import noSearchNotes from './../../assets/No_Search.png';
import ErrorFallback from './Error';
import Loading from './Loading';

const Search = () => {
	const { searchNotes, data } = useNote();
	const { isSideNavOpen } = useSideNav();

	if (data!.length! > 0 && searchNotes.length == 0) {
		return (
			<>
				<img
					src={noSearchNotes}
					style={{ width: '100%', height: 'auto' }}
					className="no-notes"
					alt="No notes"
				/>
			</>
		);
	}

	return (
		<ErrorBoundary FallbackComponent={ErrorFallback}>
			<div>
				<div
					className="all-notes"
					style={{ maxWidth: isSideNavOpen ? '1200px' : '1400px' }}
				>
					{searchNotes?.map((note: Note | CreateNote) => (
						<Suspense key={note.id} fallback={<Loading />}>
							<div key={note.id} className="note-div">
								<NoteCard note={note} route={''} />
							</div>
						</Suspense>
					))}
				</div>
			</div>
		</ErrorBoundary>
	);
};

export default Search;
