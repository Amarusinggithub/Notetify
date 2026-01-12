import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../../components/ui/select';
import { Separator } from '../../components/ui/separator';
import { Switch } from '../../components/ui/switch';
import { useStore } from '../../stores/index';
import { type Theme } from '../../types';

type NotificationPrefs = {
	email: boolean;
	push: boolean;
	marketing: boolean;
};

const STORAGE_KEY_NOTIFICATIONS = 'notification_prefs';

const General = () => {
	const { sharedData, setSharedData, theme, setTheme, language, setLanguage } =
		useStore();
	const user = sharedData?.auth.user;

	// Profile State
	const [firstName, setFirstName] = useState(user?.first_name || '');
	const [lastName, setLastName] = useState(user?.last_name || '');
	const email = user?.email || '';

	// Notification State
	const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>(() => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
			if (raw) return JSON.parse(raw);
		} catch {
			console.error(
				'there was an error adding notification preference to local storage'
			);
		}
		return {
			email: true,
			push: false,
			marketing: false,
		};
	});

	// Preferences State

	const onSaveProfile = (e: React.FormEvent) => {
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
		toast.success('Profile updated');
	};

	const onThemeChange = (value: string) => {
		setTheme(value as Theme);
		toast.success(`Theme set to ${value}`);
	};

	const updateNotifPref = (key: keyof NotificationPrefs, value: boolean) => {
		const next = { ...notifPrefs, [key]: value };
		setNotifPrefs(next);
		localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(next));
		toast.success('Notification preferences updated');
	};

	return (
		<div className="space-y-10">
			{/* Profile Section */}
			<section className="space-y-6">
				<div>
					<h3 className="text-lg font-medium">Profile</h3>
					<p className="text-muted-foreground text-sm">
						This is how others will see you on the site.
					</p>
				</div>
				<Separator />
				<form className="space-y-6" onSubmit={onSaveProfile} noValidate>
					<div className="grid grid-cols-2 gap-4">
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
					</div>
					<div className="grid gap-2">
						<Label htmlFor="email">Email</Label>
						<Input id="email" name="email" value={email} disabled />
						<p className="text-muted-foreground text-[0.8rem]">
							You can manage verified email addresses in your{' '}
							<a
								href="/settings/account"
								className="text-primary hover:underline"
							>
								account settings
							</a>
							.
						</p>
					</div>
					<div className="flex justify-start">
						<Button type="submit">Save profile</Button>
					</div>
				</form>
			</section>

			{/* Appearance Section */}
			<section className="space-y-6">
				<div>
					<h3 className="text-lg font-medium">Appearance</h3>
					<p className="text-muted-foreground text-sm">
						Customize the look and feel of the application.
					</p>
				</div>
				<Separator />
				<div className="space-y-4">
					<Label className="text-base">Theme</Label>
					<p className="text-muted-foreground text-sm">
						Select the theme for the dashboard.
					</p>
					<RadioGroup
						value={theme}
						onValueChange={onThemeChange}
						className="grid max-w-md grid-cols-1 gap-4 pt-2 md:grid-cols-3"
					>
						<div className="flex items-center space-x-2">
							<RadioGroupItem id="theme-system" value="system" />
							<Label htmlFor="theme-system">System</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem id="theme-light" value="light" />
							<Label htmlFor="theme-light">Light</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem id="theme-dark" value="dark" />
							<Label htmlFor="theme-dark">Dark</Label>
						</div>
					</RadioGroup>
				</div>
			</section>

			{/* Notifications Section */}
			<section className="space-y-6">
				<div>
					<h3 className="text-lg font-medium">Notifications</h3>
					<p className="text-muted-foreground text-sm">
						Configure how you receive notifications.
					</p>
				</div>
				<Separator />
				<div className="space-y-6">
					<div className="flex items-center justify-between rounded-lg border p-4">
						<div className="space-y-0.5">
							<Label className="text-base">Email notifications</Label>
							<p className="text-muted-foreground text-sm">
								Important updates about your account and security.
							</p>
						</div>
						<Switch
							checked={notifPrefs.email}
							onCheckedChange={(v) => updateNotifPref('email', v)}
						/>
					</div>
					<div className="flex items-center justify-between rounded-lg border p-4">
						<div className="space-y-0.5">
							<Label className="text-base">Push notifications</Label>
							<p className="text-muted-foreground text-sm">
								Receive real-time alerts on this device.
							</p>
						</div>
						<Switch
							checked={notifPrefs.push}
							onCheckedChange={(v) => updateNotifPref('push', v)}
						/>
					</div>
					<div className="flex items-center justify-between rounded-lg border p-4">
						<div className="space-y-0.5">
							<Label className="text-base">Marketing emails</Label>
							<p className="text-muted-foreground text-sm">
								Receive product tips, news, and exclusive offers.
							</p>
						</div>
						<Switch
							checked={notifPrefs.marketing}
							onCheckedChange={(v) => updateNotifPref('marketing', v)}
						/>
					</div>
				</div>
			</section>

			{/* Preferences Section (New) */}
			<section className="space-y-6">
				<div>
					<h3 className="text-lg font-medium">Preferences</h3>
					<p className="text-muted-foreground text-sm">
						Manage your regional and language settings.
					</p>
				</div>
				<Separator />
				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-2">
						<Label htmlFor="language">Language</Label>
						<Select value={language} onValueChange={setLanguage}>
							<SelectTrigger id="language" className="w-50">
								<SelectValue placeholder="Select language" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="en">English</SelectItem>
								<SelectItem value="es">Spanish</SelectItem>
								<SelectItem value="fr">French</SelectItem>
								<SelectItem value="de">German</SelectItem>
								<SelectItem value="ja">Japanese</SelectItem>
							</SelectContent>
						</Select>
						<p className="text-muted-foreground text-[0.8rem]">
							This is the language that will be used in the dashboard.
						</p>
					</div>
				</div>
			</section>
		</div>
	);
};

export default General;
