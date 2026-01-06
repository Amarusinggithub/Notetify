import { AlertTriangle, RefreshCw, Home, Copy, Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '../components/ui/card';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '../components/ui/collapsible';
import { cn } from '../lib/utils';

type FallBackProps = {
	error: Error;
	resetErrorBoundary: () => void;
};

function ErrorFallback({ error, resetErrorBoundary }: FallBackProps) {
	const [copied, setCopied] = useState(false);
	const [detailsOpen, setDetailsOpen] = useState(false);

	const errorDetails = `Error: ${error.message}\n\nStack Trace:\n${error.stack ?? 'No stack trace available'}`;

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(errorDetails);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// Clipboard API not available
		}
	};

	const handleGoHome = () => {
		window.location.href = '/';
	};

	return (
		<div className="bg-background flex min-h-screen items-center justify-center p-4">
			<div className="w-full max-w-lg">
				<Card className="border-destructive/20">
					<CardHeader className="text-center">
						<div className="bg-destructive/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
							<AlertTriangle className="text-destructive h-8 w-8" />
						</div>
						<CardTitle className="text-2xl">Something went wrong</CardTitle>
						<CardDescription className="text-base">
							We encountered an unexpected error. Don't worry, your data is safe.
						</CardDescription>
					</CardHeader>

					<CardContent className="space-y-4">
						<div className="bg-destructive/5 border-destructive/20 rounded-lg border p-4">
							<p className="text-destructive text-sm font-medium">
								{error.message || 'An unknown error occurred'}
							</p>
						</div>

						<Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
							<CollapsibleTrigger asChild>
								<Button
									variant="ghost"
									size="sm"
									className="text-muted-foreground hover:text-foreground w-full justify-between"
								>
									<span>Technical details</span>
									<ChevronDown
										className={cn(
											'h-4 w-4 transition-transform duration-200',
											detailsOpen && 'rotate-180',
										)}
									/>
								</Button>
							</CollapsibleTrigger>
							<CollapsibleContent className="mt-2">
								<div className="bg-muted/50 relative rounded-lg border p-4">
									<Button
										variant="ghost"
										size="icon"
										className="absolute top-2 right-2 h-8 w-8"
										onClick={handleCopy}
									>
										{copied ? (
											<Check className="h-4 w-4 text-green-500" />
										) : (
											<Copy className="text-muted-foreground h-4 w-4" />
										)}
									</Button>
									<pre className="text-muted-foreground max-h-48 overflow-auto pr-8 font-mono text-xs">
										{error.stack ?? 'No stack trace available'}
									</pre>
								</div>
							</CollapsibleContent>
						</Collapsible>
					</CardContent>

					<CardFooter className="flex flex-col gap-3 sm:flex-row">
						<Button
							onClick={resetErrorBoundary}
							className="w-full gap-2 sm:flex-1"
						>
							<RefreshCw className="h-4 w-4" />
							Try again
						</Button>
						<Button
							variant="outline"
							onClick={handleGoHome}
							className="w-full gap-2 sm:flex-1"
						>
							<Home className="h-4 w-4" />
							Go to home
						</Button>
					</CardFooter>
				</Card>

				<p className="text-muted-foreground mt-6 text-center text-sm">
					If this problem persists, please{' '}
					<a
						href="mailto:support@notetify.com"
						className="text-primary hover:underline"
					>
						contact support
					</a>
				</p>
			</div>
		</div>
	);
}

export default ErrorFallback;
