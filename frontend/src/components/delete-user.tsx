import HeadingSmall from './heading-small';
import { useDeleteUser } from './hooks/use-delete-user';
import InputError from './input-error';
import { Button } from './ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogTitle,
	DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

export default function DeleteUser() {
	const {
		password,
		setPassword,
		processing,
		errors,
		passwordRef,
		submit,
		reset,
		clearErrors,
	} = useDeleteUser({
		url: '/api/profile',
		onSuccess: () => closeModal(),
		onError: () => {},
		onFinish: () => reset(),
	});

	const closeModal = () => {
		clearErrors();
		reset();
	};

	return (
		<div className="space-y-6">
			<HeadingSmall
				title="Delete account"
				description="Delete your account and all of its resources"
			/>

			<div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-200/10 dark:bg-red-700/10">
				<div className="text-red-600 dark:text-red-100">
					<p className="font-medium">Warning</p>
					<p className="text-sm">This cannot be undone.</p>
				</div>

				<Dialog>
					<DialogTrigger asChild>
						<Button variant="destructive">Delete account</Button>
					</DialogTrigger>

					<DialogContent>
						<DialogTitle>Confirm account deletion</DialogTitle>
						<DialogDescription>
							All data will be permanently deleted. Enter your password to
							proceed.
						</DialogDescription>

						<form className="space-y-6" onSubmit={submit}>
							<div className="grid gap-2">
								<Label htmlFor="password" className="sr-only">
									Password
								</Label>

								<Input
									id="password"
									type="password"
									name="password"
									placeholder="Password"
									autoComplete="current-password"
									ref={passwordRef}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
								/>

								{errors.password && <InputError message={errors.password} />}
								{errors.form && (
									<div className="text-red-600">{errors.form}</div>
								)}
							</div>

							<DialogFooter className="gap-2">
								<DialogClose asChild>
									<Button variant="secondary" onClick={closeModal}>
										Cancel
									</Button>
								</DialogClose>

								<Button
									variant="destructive"
									disabled={processing}
									type="submit"
								>
									{processing ? 'Deleting…' : 'Delete account'}
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
