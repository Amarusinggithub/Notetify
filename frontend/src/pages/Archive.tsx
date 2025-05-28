import { CreateNote, Note } from 'types';
import NoteCard from '../components/NoteCard';
import useNote from '../hooks/useNote';

import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import noArchivedNotes from './../../assets/No_Archive_notes.png';
import ErrorFallback from './Error';
import Loading from './Loading';

const Archive = () => {
	const { archived, data } = useNote();

	if (data!.length! > 0 && archived.length == 0) {
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
						archived.map((note: Note | CreateNote) => (
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
