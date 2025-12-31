// Components
import { LoaderCircle } from 'lucide-react';
import { useState, type FormEventHandler } from 'react';

import InputError from '../../components/input-error';
import { Button } from '../../components/ui/button.tsx';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import AuthLayout from '../../layouts/auth-layout';
import { useStore } from '../../stores/index.ts';
import { confirmPasswordSchema } from '../../utils/validators.ts';

type ConfirmPasswordType = { password: string };

export default function ConfirmPassword() {
	const [form, setForm] = useState<ConfirmPasswordType>({
		password: '',
	});
	const { isLoading, setErrors, errors, ConfirmPassword } = useStore();

	const submit: FormEventHandler = async (e) => {
		e.preventDefault();
		setErrors(null);

		const validationResult = confirmPasswordSchema.safeParse(form);

		if (!validationResult.success) {
			const formattedErrors = validationResult.error.flatten().fieldErrors;
			setErrors(formattedErrors);
			return;
		}
		await ConfirmPassword(form.password);
	};

	function change(e: React.ChangeEvent<HTMLInputElement>) {
		setForm({ ...form, [e.target.name]: e.target.value.trim() });
	}

	return (
		<AuthLayout
			title="Confirm your password"
			description="This is a secure area of the application. Please confirm your password before continuing."
		>
			<form onSubmit={submit}>
				<div className="space-y-6">
					<div className="grid gap-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							type="password"
							name="password"
							placeholder="Password"
							autoComplete="current-password"
							value={form!.password}
							autoFocus
							onChange={change}
						/>

						{errors?.password && (
							<InputError message={errors.password[0]} className="mt-2" />
						)}
					</div>

					<div className="flex items-center">
						<Button className="w-full" disabled={isLoading}>
							{isLoading && <LoaderCircle className="h-4 w-4 animate-spin" />}
							Confirm password
						</Button>
					</div>
				</div>
			</form>
		</AuthLayout>
	);
}
