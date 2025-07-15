import { LoaderCircle } from 'lucide-react';
import React, { useState } from 'react';
import InputError from '../../components/input-error';
import TextLink from '../../components/text-link';
import { Button } from '../../components/ui/button.tsx';
import { Checkbox } from '../../components/ui/checkbox.tsx';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useAuth } from '../../hooks/use-auth.tsx';
import AuthLayout from '../../layouts/auth-layout';
import { loginSchema } from '../../utils/validators.ts';

type LoginForm = {
	email: string;
	password: string;
	remember: boolean;
};

const Login = () => {
	const [form, setForm] = useState<LoginForm>({
		email: '',
		password: '',
		remember: false,
	});
	const { Login, isLoading, errors, setErrors } = useAuth();

	const change = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value.trim() });
	};

	const submit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setErrors(null);

		const validationResult = loginSchema.safeParse(form);

		if (!validationResult.success) {
			const formattedErrors = validationResult.error.flatten().fieldErrors;
			setErrors(formattedErrors);
			return;
		}
		await Login(form.email, form.password);
	};

	return (
		<AuthLayout
			title="Log in to your account"
			description="Enter your email and password below to log in"
		>
			<form className="flex flex-col gap-6" onSubmit={submit}>
				<div className="grid gap-6">
					<div className="grid gap-2">
						<Label htmlFor="email">Email address</Label>
						<Input
							id="email"
							type="email"
							required
							autoFocus
							tabIndex={1}
							name="email"
							autoComplete="email"
							value={form.email}
							onChange={change}
							placeholder="email@example.com"
						/>
						{errors!.email && (
							<InputError message={errors.email[0]} className="mt-2" />
						)}
					</div>

					<div className="grid gap-2">
						<div className="flex items-center">
							<Label htmlFor="password">Password</Label>

							<TextLink
								to={'/reset-password'}
								className="ml-auto text-sm"
								tabIndex={5}
							>
								Forgot password?
							</TextLink>
						</div>
						<Input
							id="password"
							type="password"
							required
							tabIndex={2}
							name="password"
							autoComplete="current-password"
							value={form.password}
							onChange={change}
							placeholder="Password"
						/>
						{errors!.password && (
							<InputError message={errors.password[0]} className="mt-2" />
						)}
					</div>

					<div className="flex items-center space-x-3">
						<Checkbox
							id="remember"
							name="remember"
							checked={form.remember}
							onClick={() => setForm({ ...form, ['remember']: !form.remember })}
							tabIndex={3}
						/>
						<Label htmlFor="remember">Remember me</Label>
					</div>

					<Button
						type="submit"
						className="mt-4 w-full"
						tabIndex={4}
						disabled={isLoading}
					>
						{isLoading && <LoaderCircle className="h-4 w-4 animate-spin" />}
						Log in
					</Button>
				</div>

				<div className="text-muted-foreground text-center text-sm">
					Don't have an account?{' '}
					<TextLink to="/register" tabIndex={5}>
						Sign up
					</TextLink>
				</div>
			</form>

			{status && (
				<div className="mb-4 text-center text-sm font-medium text-green-600">
					{status}
				</div>
			)}
		</AuthLayout>
	);
};

export default Login;
