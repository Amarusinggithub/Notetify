import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { type UserNote } from 'types/index.ts';
import AddNoteCard from '../components/add-note-card.tsx';
import CardSkeleton from '../components/card-skeleton.tsx';
import NoteCard from '../components/note-card.tsx';
import useFetchNotes from '../hooks/use-fetch-notes.ts';
import { useSideNav } from '../hooks/use-side-nav.tsx';
import '../styles/Homepage.css';
import noNotes from './../../assets/No_Note.png';
import ErrorFallback from './error.tsx';

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
				{pinned && pinned.length != 0 && (
					<>
						<div className="flex-column">
							<h1 data-testid="cypress-pinnedNotes-title">Pinned Notes</h1>
						</div>
						<div
							className="pinned-notes"
							style={{ maxWidth: isSideNavOpen ? '1200px' : '1360px' }}
						>
							{pinned.map((note: UserNote) => (
								<Suspense key={note.id} fallback={<CardSkeleton cards={6} />}>
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
						{pinned && pinned.length != 0 && (
							<div className="flex-column">
								<h1>Others</h1>
							</div>
						)}
						<div
							className="all-notes"
							style={{ maxWidth: isSideNavOpen ? '1200px' : '1400px' }}
						>
							{other?.map((note: UserNote) => (
								<Suspense key={note.id} fallback={<CardSkeleton cards={6} />}>
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
