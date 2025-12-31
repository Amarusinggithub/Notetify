import { Button } from '../../components/ui/button';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from '../../components/ui/card';
import { Label } from '../../components/ui/label';

export default function Billing() {
	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Current Plan</CardTitle>
				</CardHeader>
				<CardContent className="space-y-1">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium">Free</p>
							<p className="text-muted-foreground text-sm">Up to 100 notes</p>
						</div>
						<div className="text-right">
							<span className="text-lg font-semibold">$0</span>
							<span className="text-muted-foreground ml-1">/ mo</span>
						</div>
					</div>
				</CardContent>
				<CardFooter>
					<Button disabled variant="outline">
						Upgrade (coming soon)
					</Button>
				</CardFooter>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Payment Method</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2">
					<Label className="text-muted-foreground text-sm">
						No payment method on file.
					</Label>
				</CardContent>
				<CardFooter>
					<Button disabled>Add payment method</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
