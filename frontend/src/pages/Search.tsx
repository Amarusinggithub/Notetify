import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { type UserNote } from 'types';
import CardSkeleton from '../components/card-skeleton.tsx';
import NoteCard from '../components/note-card.tsx';
import useSearchNotes from '../hooks/use-search-notes';
import useSearchState from '../hooks/use-search-state.tsx';
import { useSideNav } from '../hooks/use-side-nav';
import noSearchNotes from './../../assets/No_Search.png';
import ErrorFallback from './error';

const Search = () => {
	const { params, query } = useSearchState();
	const searchNotes = useSearchNotes(query, params);
	const { isSideNavOpen } = useSideNav();

	if (searchNotes.length == 0) {
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
					{searchNotes?.map((note: UserNote) => (
						<Suspense key={note.id} fallback={<CardSkeleton cards={6} />}>
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
