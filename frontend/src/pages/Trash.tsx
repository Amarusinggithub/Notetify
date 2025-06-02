import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Note } from 'types/index.ts';
import NoteCard from '../components/NoteCard.tsx';
import useFetchNotes from '../hooks/useFetchNotes.ts';
import { useSideNav } from '../hooks/useSideNav.tsx';
import noTrashedNotes from './../../assets/No_trashed_notes.png';
import ErrorFallback from './Error.tsx';
import Loading from './Loading.tsx';

const Trash = () => {
	const { isSideNavOpen } = useSideNav();

	const trashed = useFetchNotes('trashed', 'is_trashed=True');

	if (trashed.length == 0) {
		return (
			<>
				<img
					src={noTrashedNotes}
					style={{ width: '100%', height: 'auto' }}
					className="no-notes"
					alt="No tagged notes"
				/>
			</>
		);
	}

	return (
		<ErrorBoundary FallbackComponent={ErrorFallback}>
			<div className="container">
				<div
					className="all-notes"
					style={{ maxWidth: isSideNavOpen ? '1200px' : '1400px' }}
				>
					{trashed &&
						trashed.map((note: Note) => (
							<Suspense key={note.id} fallback={<Loading />}>
								<div key={note.id} className="note-div">
									<NoteCard note={note} route={'/trash'} />
								</div>
							</Suspense>
						))}
				</div>
			</div>
		</ErrorBoundary>
	);
};
export default Trash;
