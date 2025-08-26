import { LocateIcon, NotebookPen, User2 } from 'lucide-react';
import { type ReactNode } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/card';

export default function Features() {
	return (
		<section
			id="features"
			className="scroll-mt-20 bg-zinc-50 py-16 md:py-32 dark:bg-transparent"
		>
			<div className="@container mx-auto max-w-5xl px-6">
				<div className="text-center">
					<h2 className="text-4xl font-semibold text-balance lg:text-5xl">
						Remember everything
					</h2>
					<p className="mt-4">
						Make notes more useful by adding text, images, audio, scans, PDFs,
						and documents.
					</p>
				</div>
				<div className="mx-auto mt-8 grid max-w-sm gap-6 *:text-center md:mt-16 @min-4xl:max-w-full @min-4xl:grid-cols-3">
					<Card className="group bg-background">
						<CardHeader className="pb-3">
							<CardDecorator>
								<NotebookPen className="size-6" aria-hidden />
							</CardDecorator>

							<h3 className="mt-6 font-medium">Quick Notes</h3>
						</CardHeader>

						<CardContent>
							<p className="text-sm">
								Capture ideas instantly with lightning-fast input and
								keyboard-first UX. No friction — just flow.
							</p>
						</CardContent>
					</Card>

					<Card className="group bg-background">
						<CardHeader className="pb-3">
							<CardDecorator>
								<LocateIcon className="size-6" aria-hidden />
							</CardDecorator>

							<h3 className="mt-6 font-medium">Work anywhere</h3>
						</CardHeader>

						<CardContent>
							<p className="mt-3 text-sm">
								Keep important info handy—your notes sync automatically to all
								your devices.
							</p>
						</CardContent>
					</Card>

					<Card className="group bg-background">
						<CardHeader className="pb-3">
							<CardDecorator>
								<User2 className="size-6" aria-hidden />
							</CardDecorator>

							<h3 className="mt-6 font-medium">Collaboration</h3>
						</CardHeader>

						<CardContent>
							<p className="mt-3 text-sm">
								Your notes are private. Local-first architecture and optional
								end-to-end encryption mean full control.
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</section>
	);
}

const CardDecorator = ({ children }: { children: ReactNode }) => (
	<div className="relative mx-auto size-36 duration-200 [--color-border:color-mix(in_oklab,var(--color-zinc-950)10%,transparent)] group-hover:[--color-border:color-mix(in_oklab,var(--color-zinc-950)20%,transparent)] dark:[--color-border:color-mix(in_oklab,var(--color-white)15%,transparent)] dark:group-hover:bg-white/5 dark:group-hover:[--color-border:color-mix(in_oklab,var(--color-white)20%,transparent)]">
		<div
			aria-hidden
			className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px]"
		/>
		<div
			aria-hidden
			className="to-background absolute inset-0 bg-radial from-transparent to-75%"
		/>
		<div className="bg-background absolute inset-0 m-auto flex size-12 items-center justify-center border-t border-l">
			{children}
		</div>
	</div>
);
