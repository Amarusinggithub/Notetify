import Footer from '@/components/landing/footer';
import { HeroHeader } from '@/components/landing/hero-header';
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
