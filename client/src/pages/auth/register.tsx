import { LoaderCircle } from 'lucide-react';
import React, { useState } from 'react';
import AuthProviderButtons from '@/components/shared/auth-provider-buttons';
import InputError from '@/components/shared/input-error.tsx';
import TextLink from '@/components/shared/text-link.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import AuthLayout from '@/layouts/auth-layout.tsx';
import { useStore } from '@/stores/index.ts';
import { registerSchema } from '@/utils/validators.ts';

type RegisterForm = {
	first_name: string;
	last_name: string;
	email: string;
	password: string;
	confirmPassword: string;
};

const Register = () => {
	const [form, setForm] = useState<RegisterForm>({
		email: '',
		password: '',
		first_name: '',
		last_name: '',
		confirmPassword: '',
	});

	const { SignUp, isLoading, errors, setErrors } = useStore();

	function change(e: React.ChangeEvent<HTMLInputElement>) {
		setForm({ ...form, [e.target.name]: e.target.value.trim() });
	}

	async function submit(e: React.SubmitEvent<HTMLFormElement>) {
		e.preventDefault();

		setErrors(null);

		const validationResult = registerSchema.safeParse(form);

		if (!validationResult.success) {
			const formattedErrors = validationResult.error.flatten().fieldErrors;
			setErrors(formattedErrors);
			return;
		}

		await SignUp(form.first_name, form.last_name, form.email, form.password);
	}

	function handleOnLinkClick() {
		setErrors(null);
	}

	return (
		<AuthLayout
			title="Create an account"
			description="Enter your details below to create your account"
		>
			<form
				className="flex flex-col gap-6"
				onSubmit={(e) => {
					submit(e).catch(console.error);
				}}
				noValidate
			>
				<div className="grid gap-6">
					{errors?.general && <InputError message={errors.general[0]} />}
					<div className="grid gap-2">
						<Label htmlFor="first-name">First Name</Label>
						<Input
							id="first-name"
							type="text"
							required
							autoFocus
							tabIndex={1}
							name="first_name"
							autoComplete="firstName"
							value={form.first_name}
							onChange={change}
							disabled={isLoading}
							placeholder="first name"
						/>
						{errors?.first_name && (
							<InputError message={errors.first_name[0]} className="mt-2" />
						)}
					</div>
					<div className="grid gap-2">
						<Label htmlFor="last-name">Last Name</Label>
						<Input
							id="last-name"
							type="text"
							required
							autoFocus
							name="last_name"
							tabIndex={2}
							autoComplete="lastName"
							value={form.last_name}
							onChange={change}
							disabled={isLoading}
							placeholder="last name"
						/>
						{errors?.last_name && (
							<InputError message={errors.last_name[0]} className="mt-2" />
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
						{errors?.email && (
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
						{errors?.password && (
							<InputError message={errors.password[0]} className="mt-2" />
						)}
					</div>

					<div className="grid gap-2">
						<Label htmlFor="password_confirmation">Confirm password</Label>
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
						{errors?.confirmPassword && (
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
				<div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
					<span className="bg-background text-muted-foreground relative z-10 px-2">
						Or continue with
					</span>
				</div>
				<AuthProviderButtons />

				<div className="text-muted-foreground text-center text-sm">
					Already have an account?{' '}
					<TextLink onClick={handleOnLinkClick} to={'/login'} tabIndex={6}>
						Log in
					</TextLink>
				</div>
			</form>
		</AuthLayout>
	);
};

export default Register;
