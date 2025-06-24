import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import CardSkeleton from '../components/card-skeleton';
import NoteCard from '../components/note-card';
import useFetchNotes from '../hooks/use-fetch-notes';
import { type UserNote } from '../types';
import noArchivedNotes from '../assets/No_Archive_notes.png';
import ErrorFallback from './error';

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
						archived.map((note: UserNote) => (
							<Suspense key={note.id} fallback={<CardSkeleton cards={6} />}>
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
