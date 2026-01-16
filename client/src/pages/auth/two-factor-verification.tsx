import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '../../components/ui/button';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '../../components/ui/form';
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from '../../components/ui/input-otp';
import AuthLayout from '../../layouts/auth-layout';

const InputOTPFormSchema = z.object({
	pin: z.string().min(6, {
		message: 'Your one-time password must be 6 characters.',
	}),
});

export function TwoFactorVerification() {
	const form = useForm<z.infer<typeof InputOTPFormSchema>>({
		resolver: zodResolver(InputOTPFormSchema),
		defaultValues: {
			pin: '',
		},
	});

	function onSubmit(data: z.infer<typeof InputOTPFormSchema>) {
		toast('You submitted the following values', {
			description: (
				<pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
					<code className="text-white">{JSON.stringify(data, null, 2)}</code>
				</pre>
			),
		});
	}

	return (
		<AuthLayout
			title="Enter one time password"
			description="Please enter the one-time password sent to your phone or
									email or from Authenticator app."
		>
			<Form {...form}>
				<form
					onSubmit={(e) => {
						form.handleSubmit(onSubmit)(e).catch(console.error);
					}}
					className="w-2/3 space-y-6"
				>
					<FormField
						control={form.control}
						name="pin"
						render={({ field }) => (
							<FormItem>
								<FormLabel>One-Time Password</FormLabel>
								<FormControl>
									<InputOTP maxLength={6} {...field}>
										<InputOTPGroup>
											<InputOTPSlot index={0} />
											<InputOTPSlot index={1} />
											<InputOTPSlot index={2} />
											<InputOTPSlot index={3} />
											<InputOTPSlot index={4} />
											<InputOTPSlot index={5} />
										</InputOTPGroup>
									</InputOTP>
								</FormControl>
								<FormDescription>
									Please enter the one-time password sent to your phone or email
									or Authenticator app.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button type="submit">Submit</Button>
				</form>
			</Form>
		</AuthLayout>
	);
}
