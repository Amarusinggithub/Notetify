import { Link } from 'react-router';
import dark from '../assets/dark.png';
import light from '../assets/light.png';
import { AnimatedGroup } from '../components/ui/animated-group';
import { TextEffect } from '../components/ui/text-effect';
import { Button } from './ui/button';

const transitionVariants = {
	item: {
		hidden: {
			opacity: 0,
			filter: 'blur(12px)',
			y: 12,
		},
		visible: {
			opacity: 1,
			filter: 'blur(0px)',
			y: 0,
		},
	},
};

export default function HeroSection() {
	return (
		<section>
			<div aria-hidden className="absolute inset-0 isolate hidden lg:block">
				<div className="absolute top-0 left-0 h-320 w-140 -translate-y-87.5 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
				<div className="absolute top-0 left-0 h-320 w-60 [translate:5%_-50%] -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
				<div className="absolute top-0 left-0 h-320 w-60 -translate-y-87.5 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
			</div>
			<div className="relative pt-24">
				<div className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"></div>
				<div className="mx-auto max-w-5xl px-6">
					<div className="sm:mx-auto lg:mt-0 lg:mr-auto">
						<TextEffect
							preset="fade-in-blur"
							speedSegment={0.3}
							as="h1"
							className="mt-8 max-w-2xl text-5xl font-medium text-balance md:text-6xl lg:mt-16"
						>
							Create Your Second Brain
						</TextEffect>
						<TextEffect
							per="line"
							preset="fade-in-blur"
							speedSegment={0.3}
							delay={0.5}
							as="p"
							className="mt-8 max-w-2xl text-lg text-pretty"
						>
							Supercharge your workflow with Notetify — the smartest way to
							capture, organize, and link your notes, and insights.
						</TextEffect>

						<AnimatedGroup
							variants={{
								container: {
									visible: {
										transition: {
											staggerChildren: 0.05,
											delayChildren: 0.75,
										},
									},
								},
								...transitionVariants,
							}}
							className="mt-12 flex items-center gap-2"
						>
							<div
								key={1}
								className="bg-foreground/10 rounded-[calc(var(--radius-xl)+0.125rem)] border p-0.5"
							>
								<Button asChild size="lg" className="rounded-xl px-5 text-base">
									<Link to="/home">
										<span className="text-nowrap">Start Writing</span>
									</Link>
								</Button>
							</div>
						</AnimatedGroup>
					</div>
				</div>
				<AnimatedGroup
					variants={{
						container: {
							visible: {
								transition: {
									staggerChildren: 0.05,
									delayChildren: 0.75,
								},
							},
						},
						...transitionVariants,
					}}
				>
					<div className="relative mt-8 -mr-56 px-2 sm:mt-12 sm:mr-0 md:mt-20">
						<div
							aria-hidden
							className="to-background absolute inset-0 z-10 bg-linear-to-b from-transparent from-35%"
						/>
						<div className="ring-background bg-background relative mx-auto max-w-5xl overflow-hidden rounded-2xl border p-4 shadow-lg ring-1 inset-shadow-2xs shadow-zinc-950/15 dark:inset-shadow-white/20">
							<img
								className="bg-background relative hidden aspect-15/8 rounded-2xl dark:block"
								src={dark}
								alt="app screen"
								width="2700"
								height="1440"
							/>
							<img
								src={light}
								className="border-border/25 relative z-2 aspect-15/8 rounded-2xl border dark:hidden"
								alt="app screen"
								width="2700"
								height="1440"
							/>
						</div>
					</div>
				</AnimatedGroup>
			</div>
		</section>
	);
}
