import ContentSection from "../components/content";
import Features from "../components/feature";
import HeroSection from "../components/hero-section";
import CallToAction from "../components/call-to-action";
import FooterSection from "../components/footer";

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
