import { useState } from 'react';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import InputError from '../../components/input-error';

const passwordSchema = z
    .object({
        current: z
            .string()
            .min(8, { message: 'Password must be at least 8 characters long.' }),
        password: z
            .string()
            .min(8, { message: 'Password must be at least 8 characters long.' }),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match.',
        path: ['confirmPassword'],
    });

const Authentication = () => {
    const [form, setForm] = useState({ current: '', password: '', confirmPassword: '' });
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    const change = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value.trim() });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        const validation = passwordSchema.safeParse(form);
        if (!validation.success) {
            setErrors(validation.error.flatten().fieldErrors);
            return;
        }

        // In a real app: call API to change password
        toast.success('Password updated');
        setForm({ current: '', password: '', confirmPassword: '' });
    };

    return (
        <form className="space-y-6" onSubmit={submit} noValidate>
            <div className="grid gap-2">
                <Label htmlFor="current">Current password</Label>
                <Input
                    id="current"
                    type="password"
                    name="current"
                    value={form.current}
                    onChange={change}
                    placeholder="Current password"
                />
                {errors.current && <InputError message={errors.current[0]} />}
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password">New password</Label>
                <Input
                    id="password"
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={change}
                    placeholder="New password"
                />
                {errors.password && <InputError message={errors.password[0]} />}
            </div>
            <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={change}
                    placeholder="Confirm new password"
                />
                {errors.confirmPassword && (
                    <InputError message={errors.confirmPassword[0]} />
                )}
            </div>
            <div>
                <Button type="submit">Update password</Button>
            </div>
        </form>
    );
};

export default Authentication;
