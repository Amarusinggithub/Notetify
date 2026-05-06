import { SidebarProvider } from '@/components/ui/sidebar';

interface AppShellProps {
	children: React.ReactNode;
	variant?: 'header' | 'sidebar';
}

export function AppShell({ children, variant = 'header' }: AppShellProps) {
	if (variant === 'header') {
		return <div className="flex min-h-svh w-full flex-col">{children}</div>;
	}

	return (
		<SidebarProvider defaultOpen={true} className="h-svh overflow-hidden">
			{children}
		</SidebarProvider>
	);
}
