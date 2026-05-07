import AppLogoIcon from '@/components/app/app-logo-icon';

export default function AppLogo() {
	return (
		<div className="flex items-center gap-2">
			<div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md">
				<AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
			</div>
			<span className="truncate text-sm font-semibold leading-tight">
				Notetify
			</span>
		</div>
	);
}
