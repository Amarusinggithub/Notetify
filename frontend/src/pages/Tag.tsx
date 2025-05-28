import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { CreateNote, Note } from 'types/index.ts';
import NoteCard from '../components/NoteCard.tsx';
import useNote from '../hooks/useNote.tsx';
import { useSideNav } from '../hooks/useSideNav.tsx';
import noTaggedNotes from './../../assets/No_tagged_Notes.png';
import ErrorFallback from './Error.tsx';
import Loading from './Loading.tsx';

const Tag = () => {
	const { tagNotes, data } = useNote();
	const { isSideNavOpen } = useSideNav();

	if (data!.length! > 0 && tagNotes.length == 0) {
		return (
			<>
				<img
					src={noTaggedNotes}
					style={{ width: '100%', height: 'auto' }}
					className="no-notes"
					alt="No Tagged notes"
				/>
			</>
		);
	}

	return (
		<ErrorBoundary FallbackComponent={ErrorFallback}>
			<Suspense fallback={<Loading />}>
				<div className="container">
					<div
						className="all-notes"
						style={{ maxWidth: isSideNavOpen ? '1200px' : '1400px' }}
					>
						{tagNotes?.map((note: Note | CreateNote) => (
							<div key={note.id} className="note-div">
								<NoteCard note={note} route={'/tag'} />
							</div>
						))}
					</div>
				</div>
			</Suspense>
		</ErrorBoundary>
	);
};

export default Tag;
