import { UserNote, UserNoteData } from 'types';
import NoteCard from '../components/NoteCard';
import useNote from '../hooks/useNote';
import { useSideNav } from '../hooks/useSideNav';
import noSearchNotes from './../../assets/No_Search.png';

const Search = () => {
	const { searchNotes, isLoading, isError } = useNote();
	const { isSideNavOpen } = useSideNav();

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (isError) {
		return <div>Error: {isError.message}</div>;
	}

	if (searchNotes.length < 1) {
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
		<div>
			<div className="all-notes" style={{ maxWidth: isSideNavOpen ? '1200px' : '1400px' }}>
				{searchNotes?.map((note: UserNote | UserNoteData) => (
					<div key={note.id} className="note-div">
						<NoteCard note={note} route={''} />
					</div>
				))}
			</div>
		</div>
	);
};

export default Search;
