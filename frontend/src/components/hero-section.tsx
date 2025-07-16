import { Link } from 'react-router';
import { HeroHeader } from './hero-header';
import { Button } from './ui/button';
import InfiniteSlider from './ui/infinite-slider';
import { ProgressiveBlur } from './ui/progressive-bur';


export default function HeroSection() {
	return (
		<>
			<HeroHeader />
			<main className="overflow-x-hidden">
				<section>
					<div className="pt-12 pb-24 md:pb-32 lg:pt-44 lg:pb-56">
						<div className="relative mx-auto flex max-w-6xl flex-col px-6 lg:block">
							<div className="mx-auto max-w-lg text-center lg:ml-0 lg:w-1/2 lg:text-left">
								<h1 className="mt-8 max-w-2xl text-5xl font-medium text-balance md:text-6xl lg:mt-16 xl:text-7xl">
									Ship 10x Faster with NS
								</h1>
								<p className="mt-8 max-w-2xl text-lg text-pretty">
									Highly customizable components for building modern websites
									and applications that look and feel the way you mean it.
								</p>

								<div className="mt-12 flex flex-col items-center justify-center gap-2 sm:flex-row lg:justify-start">
									<Button asChild size="lg" className="px-5 text-base">
										<Link to="#link">
											<span className="text-nowrap">Start Building</span>
										</Link>
									</Button>
									<Button
										key={2}
										asChild
										size="lg"
										variant="ghost"
										className="px-5 text-base"
									>
										<Link to="#link">
											<span className="text-nowrap">Request a demo</span>
										</Link>
									</Button>
								</div>
							</div>
							<img
								className="-z-10 order-first ml-auto h-56 w-full object-cover invert sm:h-96 lg:absolute lg:inset-0 lg:-top-96 lg:-right-20 lg:order-last lg:h-max lg:w-2/3 lg:object-contain dark:mix-blend-lighten dark:invert-0"
								src="https://res.cloudinary.com/dg4jhba5c/image/upload/v1741605150/abstract-bg_wq4f8w.jpg"
								alt="Abstract Object"
								height="4000"
								width="3000"
							/>
						</div>
					</div>
				</section>
				<section className="bg-background pb-16 md:pb-32">
					<div className="group relative m-auto max-w-6xl px-6">
						<div className="flex flex-col items-center md:flex-row">
							<div className="md:max-w-44 md:border-r md:pr-6">
								<p className="text-end text-sm">Powering the best teams</p>
							</div>
							<div className="relative py-6 md:w-[calc(100%-11rem)]">
								<InfiniteSlider speedOnHover={20} speed={40} gap={112}>
									<div className="flex">
										<img
											className="mx-auto h-5 w-fit dark:invert"
											src="https://html.tailus.io/blocks/customers/nvidia.svg"
											alt="Nvidia Logo"
											height="20"
											width="auto"
										/>
									</div>

									<div className="flex">
										<img
											className="mx-auto h-4 w-fit dark:invert"
											src="https://html.tailus.io/blocks/customers/column.svg"
											alt="Column Logo"
											height="16"
											width="auto"
										/>
									</div>
									<div className="flex">
										<img
											className="mx-auto h-4 w-fit dark:invert"
											src="https://html.tailus.io/blocks/customers/github.svg"
											alt="GitHub Logo"
											height="16"
											width="auto"
										/>
									</div>
									<div className="flex">
										<img
											className="mx-auto h-5 w-fit dark:invert"
											src="https://html.tailus.io/blocks/customers/nike.svg"
											alt="Nike Logo"
											height="20"
											width="auto"
										/>
									</div>
									<div className="flex">
										<img
											className="mx-auto h-5 w-fit dark:invert"
											src="https://html.tailus.io/blocks/customers/lemonsqueezy.svg"
											alt="Lemon Squeezy Logo"
											height="20"
											width="auto"
										/>
									</div>
									<div className="flex">
										<img
											className="mx-auto h-4 w-fit dark:invert"
											src="https://html.tailus.io/blocks/customers/laravel.svg"
											alt="Laravel Logo"
											height="16"
											width="auto"
										/>
									</div>
									<div className="flex">
										<img
											className="mx-auto h-7 w-fit dark:invert"
											src="https://html.tailus.io/blocks/customers/lilly.svg"
											alt="Lilly Logo"
											height="28"
											width="auto"
										/>
									</div>

									<div className="flex">
										<img
											className="mx-auto h-6 w-fit dark:invert"
											src="https://html.tailus.io/blocks/customers/openai.svg"
											alt="OpenAI Logo"
											height="24"
											width="auto"
										/>
									</div>
								</InfiniteSlider>

								<div className="from-background absolute inset-y-0 left-0 w-20 bg-linear-to-r"></div>
								<div className="from-background absolute inset-y-0 right-0 w-20 bg-linear-to-l"></div>
								<ProgressiveBlur
									className="pointer-events-none absolute top-0 left-0 h-full w-20"
									direction="left"
									blurIntensity={1}
								/>
								<ProgressiveBlur
									className="pointer-events-none absolute top-0 right-0 h-full w-20"
									direction="right"
									blurIntensity={1}
								/>
							</div>
						</div>
					</div>
				</section>
			</main>
		</>
	);
}
