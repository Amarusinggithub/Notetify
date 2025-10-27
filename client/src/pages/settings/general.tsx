import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useAuth } from '../../hooks/use-auth';

const General = () => {
    const { sharedData, setSharedData } = useAuth();
    const user = sharedData?.auth.user;

    const [firstName, setFirstName] = useState(user?.first_name || '');
    const [lastName, setLastName] = useState(user?.last_name || '');
    const email = user?.email || '';

    const onSave = (e: React.FormEvent) => {
        e.preventDefault();
        // Persist locally to the shared store; in a real app we would call an API here
        if (!sharedData || !user) return;
        const updated = {
            ...sharedData,
            name: `${firstName} ${lastName}`.trim(),
            auth: {
                user: {
                    ...user,
                    first_name: firstName.trim(),
                    last_name: lastName.trim(),
                },
            },
        };
        setSharedData(updated);
        toast.success('Profile updated');
    };

    return (
        <form className="space-y-6" onSubmit={onSave} noValidate>
            <div className="grid gap-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                    id="first_name"
                    name="first_name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                    id="last_name"
                    name="last_name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" value={email} disabled />
            </div>
            <div>
                <Button type="submit">Save changes</Button>
            </div>
        </form>
    );
};

export default General;
