import { useEffect, useState } from 'react';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { toast } from 'sonner';

type Prefs = {
  email: boolean;
  push: boolean;
  marketing: boolean;
};

const STORAGE_KEY = 'notification_prefs';

export default function Notification() {
  const [prefs, setPrefs] = useState<Prefs>({ email: true, push: false, marketing: false });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPrefs(JSON.parse(raw));
    } catch {}
  }, []);

  const update = (key: keyof Prefs, value: boolean) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    toast.success('Notification preferences updated');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Label>Email notifications</Label>
          <p className="text-muted-foreground text-sm">Important updates about your account</p>
        </div>
        <Switch checked={prefs.email} onCheckedChange={(v) => update('email', v)} />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <Label>Push notifications</Label>
          <p className="text-muted-foreground text-sm">Receive alerts on this device</p>
        </div>
        <Switch checked={prefs.push} onCheckedChange={(v) => update('push', v)} />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <Label>Marketing emails</Label>
          <p className="text-muted-foreground text-sm">Product tips and offers</p>
        </div>
        <Switch checked={prefs.marketing} onCheckedChange={(v) => update('marketing', v)} />
      </div>
    </div>
  );
}

