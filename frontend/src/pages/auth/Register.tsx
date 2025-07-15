import { LoaderCircle } from 'lucide-react';
import React, { useState } from 'react';
import InputError from '../../components/input-error';
import TextLink from '../../components/text-link';
import { Button } from '../../components/ui/button.tsx';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useAuth } from '../../hooks/use-auth.tsx';
import AuthLayout from '../../layouts/auth-layout';
import { registerSchema } from '../../utils/validators.ts';

type RegisterForm = {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	confirmPassword: string;
};

const Register = () => {
	const [form, setForm] = useState<RegisterForm>({
		email: '',
		password: '',
		firstName: '',
		lastName: '',
		confirmPassword: '',
	});

	const { SignUp, isLoading, errors, setErrors } = useAuth();

	function change(e: React.ChangeEvent<HTMLInputElement>) {
		setForm({ ...form, [e.target.name]: e.target.value.trim() });
	}

	async function submit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		setErrors(null);

		const validationResult = registerSchema.safeParse(form);

		if (!validationResult.success) {
			const formattedErrors = validationResult.error.flatten().fieldErrors;
			setErrors(formattedErrors);
			return;
		}

		await SignUp(form.firstName, form.lastName, form.email, form.password);
	}

	return (
		<AuthLayout
			title="Create an account"
			description="Enter your details below to create your account"
		>
			<form className="flex flex-col gap-6" onSubmit={(e) => submit(e)}>
				<div className="grid gap-6">
					<div className="grid gap-2">
						<Label htmlFor="first-name">First Name</Label>
						<Input
							id="first-name"
							type="text"
							required
							autoFocus
							tabIndex={1}
							name="firstName"
							autoComplete="firstName"
							value={form.firstName}
							onChange={change}
							disabled={isLoading}
							placeholder="first name"
						/>
						{errors!.firstName && (
							<InputError message={errors.firstName[0]} className="mt-2" />
						)}
					</div>
					<div className="grid gap-2">
						<Label htmlFor="last-name">Last Name</Label>
						<Input
							id="last-name"
							type="text"
							required
							autoFocus
							name="lastName"
							tabIndex={2}
							autoComplete="lastName"
							value={form.lastName}
							onChange={change}
							disabled={isLoading}
							placeholder="last name"
						/>
						{errors!.lastName && (
							<InputError message={errors.lastName[0]} className="mt-2" />
						)}
					</div>

					<div className="grid gap-2">
						<Label htmlFor="email">Email address</Label>
						<Input
							id="email"
							type="email"
							required
							tabIndex={3}
							name="email"
							autoComplete="email"
							value={form.email}
							onChange={change}
							disabled={isLoading}
							placeholder="email@example.com"
						/>
						{errors!.email && (
							<InputError message={errors.email[0]} className="mt-2" />
						)}
					</div>

					<div className="grid gap-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							type="password"
							required
							tabIndex={4}
							name="password"
							autoComplete="new-password"
							value={form.password}
							onChange={change}
							disabled={isLoading}
							placeholder="Password"
						/>
						{errors!.password && (
							<InputError message={errors.password[0]} className="mt-2" />
						)}
					</div>

					<div className="grid gap-2">
						<Label htmlFor="password-confirmation">Confirm password</Label>
						<Input
							id="password_confirmation"
							type="password"
							required
							tabIndex={5}
							name="confirmPassword"
							autoComplete="new-password"
							value={form.confirmPassword}
							onChange={change}
							disabled={isLoading}
							placeholder="Confirm password"
						/>
						{errors!.confirmPassword && (
							<InputError
								message={errors.confirmPassword[0]}
								className="mt-2"
							/>
						)}
					</div>

					<Button
						type="submit"
						className="mt-2 w-full"
						tabIndex={5}
						disabled={isLoading}
					>
						{isLoading && <LoaderCircle className="h-4 w-4 animate-spin" />}
						Create account
					</Button>
				</div>

				<div className="text-muted-foreground text-center text-sm">
					Already have an account?{' '}
					<TextLink to={'/login'} tabIndex={6}>
						Log in
					</TextLink>
				</div>
			</form>
		</AuthLayout>
	);
};

export default Register;
