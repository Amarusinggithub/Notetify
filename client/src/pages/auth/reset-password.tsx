import { LoaderCircle } from 'lucide-react';
import { type FormEventHandler, useState } from 'react';
import { useParams } from 'react-router';
import InputError from '../../components/input-error';
import { Button } from '../../components/ui/button.tsx';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import AuthLayout from '../../layouts/auth-layout';
import { useStore } from '../../stores/index.ts';
import { resetPasswordSchema } from '../../utils/validators.ts';

type ResetPasswordForm = {
	password: string;
	confirmPassword: string;
};

export default function ResetPassword() {
	const { token } = useParams();

	const [form, setForm] = useState<ResetPasswordForm>({
		password: '',
		confirmPassword: '',
	});

	const { isLoading, errors, PasswordReset, setErrors } = useStore();

	const submit: FormEventHandler = async (e) => {
		e.preventDefault();
		setErrors(null);

		const validationResult = resetPasswordSchema.safeParse(form);

		if (!validationResult.success) {
			const formattedErrors = validationResult.error.flatten().fieldErrors;
			setErrors(formattedErrors);
			return;
		}
		await PasswordReset(token, form.password);
	};

	function change(e: React.ChangeEvent<HTMLInputElement>) {
		setForm({ ...form, [e.target.name]: e.target.value.trim() });
	}
	return (
		<AuthLayout
			title="Reset password"
			description="Please enter your new password below"
		>
			<form onSubmit={submit}>
				<div className="grid gap-6">
					<div className="grid gap-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							type="password"
							name="password"
							autoComplete="new-password"
							value={form.password}
							className="mt-1 block w-full"
							autoFocus
							onChange={change}
							placeholder="Password"
						/>
						{errors?.password && (
							<InputError message={errors.password[0]} className="mt-2" />
						)}
					</div>

					<div className="grid gap-2">
						<Label htmlFor="confirmPassword">Confirm password</Label>
						<Input
							id="confirmPassword"
							type="password"
							name="confirmPassword"
							autoComplete="new-password"
							value={form.confirmPassword}
							className="mt-1 block w-full"
							onChange={change}
							placeholder="Confirm password"
						/>
						{errors?.confirmPassword && (
							<InputError
								message={errors.confirmPassword[0]}
								className="mt-2"
							/>
						)}
					</div>

					<Button type="submit" className="mt-4 w-full" disabled={isLoading}>
						{isLoading && <LoaderCircle className="h-4 w-4 animate-spin" />}
						Reset password
					</Button>
				</div>
			</form>
		</AuthLayout>
	);
}
