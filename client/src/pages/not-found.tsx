import {
	ArrowLeft,
	Compass,
	FileText,
	Home,
	Search,
	type LucideIcon,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import AppLogoIcon from '../components/app-logo-icon';
import { Button } from '../components/ui/button';
import { useStore } from '../stores/index.ts';

type QuickLink = {
	description: string;
	icon: LucideIcon;
	label: string;
	to: string;
};

export default function NotFound() {
	const isAuthenticated = useStore((state) => state.isAuthenticated);
	const fallbackHref = isAuthenticated ? '/notes' : '/';
	const homeLabel = isAuthenticated ? 'Back to workspace' : 'Back to home';

	const quickLinks: QuickLink[] = isAuthenticated
		? [
				{
					description: 'Jump into the notes view and keep writing.',
					icon: FileText,
					label: 'Open notes',
					to: '/notes',
				},
				{
					description: 'Browse the bigger structure of your workspace.',
					icon: Compass,
					label: 'Browse notebooks',
					to: '/notebooks',
				},
				{
					description: 'Reset preferences or account options.',
					icon: Search,
					label: 'Open settings',
					to: '/settings/general',
				},
			]
		: [
				{
					description: 'Return to the main landing page.',
					icon: Home,
					label: 'View homepage',
					to: '/',
				},
				{
					description: 'Sign back in and return to your workspace.',
					icon: Compass,
					label: 'Sign in',
					to: '/login',
				},
				{
					description: 'Create a new workspace and start fresh.',
					icon: FileText,
					label: 'Create account',
					to: '/register',
				},
			];

	const handleGoBack = () => {
		if (window.history.length > 1) {
			window.history.back();
			return;
		}

		window.location.href = fallbackHref;
	};

	return (
		<div className="bg-background relative min-h-screen overflow-hidden">
			<div className="pointer-events-none absolute inset-0">
				<div className="bg-primary/20 absolute top-[-10rem] left-[12%] h-72 w-72 rounded-full blur-3xl" />
				<div className="bg-primary/10 absolute right-[-6rem] bottom-[-8rem] h-96 w-96 rounded-full blur-3xl" />
				<div className="from-background via-background/85 to-background absolute inset-0 bg-gradient-to-br" />
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_30%),linear-gradient(rgba(120,120,120,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(120,120,120,0.08)_1px,transparent_1px)] bg-[length:100%_100%,2.75rem_2.75rem,2.75rem_2.75rem]" />
			</div>

			<div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-6 py-10 sm:px-10 lg:px-12">
				<div className="grid w-full gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-center">
					<motion.section
						initial={{ opacity: 0, y: 24 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, ease: 'easeOut' }}
						className="max-w-2xl"
					>
						<Link
							to={fallbackHref}
							className="bg-background/80 border-border/60 text-foreground mb-8 inline-flex items-center gap-3 rounded-full border px-4 py-2 text-sm shadow-sm backdrop-blur"
						>
							<span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-full">
								<AppLogoIcon className="size-4" />
							</span>
							<span className="font-medium">Notetify</span>
						</Link>

						<div className="space-y-6">
							<motion.div
								initial={{ opacity: 0, scale: 0.94 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: 0.1, duration: 0.45, ease: 'easeOut' }}
								className="text-primary bg-primary/12 border-primary/20 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium"
							>
								<Search className="size-4" />
								Page not found
							</motion.div>

							<div className="space-y-4">
								<h1 className="max-w-xl text-5xl leading-none font-semibold tracking-[-0.04em] text-balance sm:text-6xl lg:text-7xl">
									This page slipped out of your notebook.
								</h1>
								<p className="text-muted-foreground max-w-xl text-base leading-7 sm:text-lg">
									The address may be outdated, the page may have been moved, or
									there might just be a typo in the URL. Either way, there is
									nothing here for Notetify to load.
								</p>
							</div>

							<div className="flex flex-col gap-3 sm:flex-row">
								<Button asChild size="lg" className="gap-2">
									<Link to={fallbackHref}>
										<Home className="size-4" />
										{homeLabel}
									</Link>
								</Button>
								<Button
									variant="outline"
									size="lg"
									className="gap-2 bg-background/70 backdrop-blur"
									onClick={handleGoBack}
								>
									<ArrowLeft className="size-4" />
									Go back
								</Button>
							</div>
						</div>

						<div className="mt-10 grid gap-4 sm:grid-cols-3">
							{quickLinks.map(({ description, icon: Icon, label, to }, index) => (
								<motion.div
									key={to}
									initial={{ opacity: 0, y: 18 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{
										delay: 0.2 + index * 0.08,
										duration: 0.45,
										ease: 'easeOut',
									}}
								>
									<Link
										to={to}
										className="group bg-card/75 border-border/60 hover:border-primary/35 hover:bg-card flex h-full flex-col rounded-3xl border p-5 shadow-sm backdrop-blur transition-all duration-200"
									>
										<div className="bg-primary/14 text-primary mb-4 flex size-11 items-center justify-center rounded-2xl">
											<Icon className="size-5" />
										</div>
										<div className="space-y-2">
											<p className="text-base font-semibold">{label}</p>
											<p className="text-muted-foreground text-sm leading-6">
												{description}
											</p>
										</div>
									</Link>
								</motion.div>
							))}
						</div>
					</motion.section>

					<motion.aside
						initial={{ opacity: 0, x: 24 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.15, duration: 0.55, ease: 'easeOut' }}
						className="relative"
					>
						<div className="from-card/95 to-card/75 border-border/60 relative overflow-hidden rounded-[2rem] border bg-gradient-to-br p-6 shadow-2xl shadow-black/5 backdrop-blur sm:p-8">
							<div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent dark:via-white/20" />

							<div className="space-y-8">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-muted-foreground text-xs font-medium tracking-[0.24em] uppercase">
											Error state
										</p>
										<p className="mt-2 text-sm font-medium">HTTP 404</p>
									</div>
									<div className="bg-primary/12 text-primary rounded-full px-3 py-1 text-xs font-semibold">
										Missing route
									</div>
								</div>

								<div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-neutral-950 px-6 py-8 text-white shadow-inner">
									<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,214,10,0.28),transparent_45%)]" />
									<div className="relative">
										<p className="text-white/60 text-sm uppercase tracking-[0.28em]">
											404
										</p>
										<div className="mt-3 text-7xl font-semibold tracking-[-0.08em] sm:text-8xl">
											404
										</div>
										<p className="mt-4 max-w-xs text-sm leading-6 text-white/70">
											Not every path becomes a page. This one ends in empty
											space.
										</p>
									</div>
								</div>

								<div className="space-y-4">
									<div className="flex items-center gap-3">
										<div className="bg-primary/14 text-primary flex size-10 items-center justify-center rounded-2xl">
											<Compass className="size-5" />
										</div>
										<div>
											<p className="text-sm font-semibold">Recovery options</p>
											<p className="text-muted-foreground text-sm">
												Pick a route that definitely exists.
											</p>
										</div>
									</div>

									<div className="space-y-3">
										{quickLinks.map(({ description, icon: Icon, label, to }) => (
											<Link
												key={label}
												to={to}
												className="bg-background/70 border-border/60 hover:border-primary/35 flex items-center gap-4 rounded-2xl border p-4 transition-colors"
											>
												<div className="bg-muted flex size-10 items-center justify-center rounded-xl">
													<Icon className="text-foreground size-[18px]" />
												</div>
												<div className="min-w-0">
													<p className="truncate text-sm font-medium">{label}</p>
													<p className="text-muted-foreground truncate text-xs">
														{description}
													</p>
												</div>
											</Link>
										))}
									</div>
								</div>
							</div>
						</div>
					</motion.aside>
				</div>
			</div>
		</div>
	);
}
