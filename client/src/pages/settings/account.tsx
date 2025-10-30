import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useAuthStore } from '../../stores/use-auth-store';
import { toast } from 'sonner';

export default function Account() {
  const { sharedData, setSharedData } = useAuthStore();
  const user = sharedData?.auth.user;

  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [email] = useState(user?.email || '');

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
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
    toast.success('Account details updated');
  };

  return (
    <form className="space-y-6" onSubmit={onSave} noValidate>
      <div className="grid gap-2">
        <Label htmlFor="first_name">First name</Label>
        <Input id="first_name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="last_name">Last name</Label>
        <Input id="last_name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} disabled />
      </div>
      <div className="pt-2">
        <Button type="submit">Save changes</Button>
      </div>
    </form>
  );
}

