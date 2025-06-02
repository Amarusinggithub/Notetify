import { Note } from 'types';
import NoteCard from '../components/NoteCard';

import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import useFetchNotes from '../hooks/useFetchNotes';
import noArchivedNotes from './../../assets/No_Archive_notes.png';
import ErrorFallback from './Error';
import Loading from './Loading';

const Archive = () => {
	const archived = useFetchNotes(
		'archive',
		'is_archived=True&is_trashed=False',
	);

	if (archived.length == 0) {
		return (
			<div className="flex min-h-screen flex-row items-center justify-center">
				<img
					src={noArchivedNotes}
					style={{ width: '100%', height: 'auto' }}
					className="no-notes"
					alt="No archived notes"
				/>
			</div>
		);
	}

	return (
		<ErrorBoundary FallbackComponent={ErrorFallback}>
			<div className="container">
				<div className="all-notes">
					{archived &&
						archived.map((note: Note) => (
							<Suspense key={note.id} fallback={<Loading />}>
								<div key={note.id} className="note-div">
									<NoteCard note={note} route={'/archive'} />
								</div>{' '}
							</Suspense>
						))}
				</div>
			</div>
		</ErrorBoundary>
	);
};

export default Archive;
