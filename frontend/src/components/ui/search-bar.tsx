import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type SearchBarProps = {
	onchange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
	search: string;
	placeholder: string;
	classname: string;
};

const SearchBar = ({
	onchange,
	onSubmit,
	search,
	placeholder,
	classname,
}: SearchBarProps) => {
	return (
		<form
			onSubmit={(e) => {
				onSubmit(e);
			}}
			className={classname}
		>
			<button type="submit">
				<FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon" />
			</button>
			<input
				name="search"
				placeholder={placeholder}
				value={search}
				onChange={(e) => {
					onchange(e);
				}}
				type="text"
			/>
		</form>
	);
};

export default SearchBar;
