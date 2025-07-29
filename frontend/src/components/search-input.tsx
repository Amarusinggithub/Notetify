import { SearchIcon } from 'lucide-react';
import { Input } from './ui/input';

export const SearchInput = ({ disabled }: { disabled: boolean }) => {
	return (
		<div className="relative">
			<SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />

			<Input placeholder="Search" className="pl-10" disabled={disabled} />
		</div>
	);
};
