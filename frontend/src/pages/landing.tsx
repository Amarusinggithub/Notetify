import CallToAction from '../components/call-to-action';
import Features from '../components/feature';
import FooterSection from '../components/footer';
import { HeroHeader } from '../components/hero-header';
import HeroSection from '../components/hero-section';

export default function Landing() {
	return (
		<main>
			<HeroHeader />
			<HeroSection />
			<Features />
			<CallToAction />
			<FooterSection />
		</main>
	);
}
