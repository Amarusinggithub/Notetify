import { Input } from './ui/input';

export const SearchInput = () => {
	return (
		<div className="flex flex-1 items-center justify-center">
			<form className="relative w-full max-w-[720px]">
				<Input
					placeholder="Search"
					className="w-full border-none px-14 placeholder:text-neutral-800 focus-visible:shadow-[0_1px_1px_0_rgba(65,69,73,.3),0_1px_3px_1px_rgba(65,69,73,.15)] md:text-base bg-[#F0F4F8] rounded-full h-[48px] focus-visible:ring-0 focus:bg-white"
				/>
			</form>
		</div>
	);
};
