import Footer from '@/features/landing/components/footer';
import { HeroHeader } from '@/features/landing/components/hero-header';
import { Outlet } from 'react-router';

export default function LandingLayout() {
	return (
		<div className="flex min-h-svh flex-col">
			<HeroHeader />
			<main className="flex-1">
				<Outlet />
			</main>
			<Footer />
		</div>
	);
}
