import CallToAction from '../components/call-to-action';
import ContentSection from '../components/content';
import Features from '../components/feature';
import FooterSection from '../components/footer';
import HeroSection from '../components/hero-section';

export default function Welcome() {
	return (
		<>
			<HeroSection />
			<Features />
			<ContentSection />
			<CallToAction />
			<FooterSection />
		</>
	);
}
