// Components
import { LoaderCircle } from 'lucide-react';
import { useState, type FormEventHandler } from 'react';

import type { AuthField } from 'types';
import InputError from '../../components/input-error';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import useAuth from '../../hooks/use-auth';
import AuthLayout from '../../layouts/auth-layout';

type ConfirmPasswordType = { password: string };

export default function ConfirmPassword() {
	const [form, setForm] = useState<ConfirmPasswordType>({
		password: '',
	});
	const { isLoading, errors } = useAuth();

	const submit: FormEventHandler = (e) => {
		e.preventDefault();
	};

	function getFieldError(field: AuthField): string | undefined {
		if (!errors) return undefined;
		const error = errors.find((err) => err.startsWith(`${field}:`));
		return error ? error.split(':')[1] : undefined;
	}

	function change(e: React.ChangeEvent<HTMLInputElement>) {
		setForm({ ...form, [e.target.name]: e.target.value.trim() });
	}

	return (
		<AuthLayout title="Confirm your password" description="This is a secure area of the application. Please confirm your password before continuing.">
			<h1>Confirm password</h1>

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

						{getFieldError('password') && <InputError message={getFieldError('password')} className="mt-2" />}
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
