import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Note } from 'types/index.ts';
import AddNoteCard from '../components/AddNoteCard.tsx';
import NoteCard from '../components/NoteCard.tsx';
import useFetchNotes from '../hooks/useFetchNotes.ts';
import { useSideNav } from '../hooks/useSideNav.tsx';
import '../styles/Homepage.css';
import noNotes from './../../assets/No_Note.png';
import ErrorFallback from './Error.tsx';
import Loading from './Loading.tsx';

const Home = () => {
	const pinned = useFetchNotes(
		'pinned',
		'is_pinned=True&is_trashed=False&is_archived=False',
	);
	const other = useFetchNotes(
		'other',
		'is_pinned=False&is_trashed=False&is_archived=False',
	);

	const { isSideNavOpen } = useSideNav();

	if (pinned.length == 0 && other.length == 0) {
		return (
			<div>
				<div className="add-note-card-cantainer">
					<AddNoteCard />
				</div>

				<img
					src={noNotes}
					style={{ width: '100%', height: 'auto' }}
					className="no-notes"
					alt="No notes"
				/>
			</div>
		);
	}
	return (
		<ErrorBoundary FallbackComponent={ErrorFallback}>
			<div className="container">
				<div className="add-note-card-cantainer">
					<AddNoteCard />
				</div>
				{pinned && (
					<>
						<div className="flex-column">
							<h1 data-testid="cypress-pinnedNotes-title">Pinned Notes</h1>
						</div>
						<div
							className="pinned-notes"
							style={{ maxWidth: isSideNavOpen ? '1200px' : '1360px' }}
						>
							{pinned.map((note: Note) => (
								<Suspense key={note.id} fallback={<Loading />}>
									<div key={note.id} className="note-div">
										<NoteCard note={note} route={'/'} />
									</div>
								</Suspense>
							))}
						</div>
					</>
				)}
				{other && (
					<>
						<div className="flex-column">
							<h1>Others</h1>
						</div>
						<div
							className="all-notes"
							style={{ maxWidth: isSideNavOpen ? '1200px' : '1400px' }}
						>
							{other?.map((note: Note) => (
								<Suspense key={note.id} fallback={<Loading />}>
									<div key={note.id} className="note-div">
										<NoteCard note={note} route={'/'} />
									</div>
								</Suspense>
							))}
						</div>
					</>
				)}
			</div>
		</ErrorBoundary>
	);
};

export default Home;
