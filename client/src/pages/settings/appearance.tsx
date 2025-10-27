import { useAppearance, type Appearance } from '../../hooks/use-appearance';
import { Label } from '../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { toast } from 'sonner';

export default function Appearance() {
  const { appearance, updateAppearance } = useAppearance();

  const onChange = (value: string) => {
    updateAppearance(value as Appearance);
    toast.success(`Theme set to ${value}`);
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm">Theme</Label>
      <RadioGroup value={appearance} onValueChange={onChange} className="grid grid-cols-1 gap-2 md:grid-cols-3">
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
  );
}

