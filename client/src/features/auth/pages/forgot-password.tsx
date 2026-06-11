import { LoaderCircle } from "lucide-react";
import { useState, type ChangeEvent } from "react";
import InputError from "@/shared/components/shared/input-error";
import TextLink from "@/shared/components/shared/text-link";
import { Button } from "@/shared/components/ui/button.tsx";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import AuthLayout from "@/app/layouts/auth-layout";
import { useStore } from "@/app/store/index.ts";
import forgotPassword from "@/features/auth/hooks/use-forgot-password";
import { forgatPasswordSchema } from "../utils/validators";

type ForgotPasswordForm = {
    email: string;
};

export default function ForgotPassword() {
    const [form, setForm] = useState<ForgotPasswordForm>({
        email: "",
    });

    const { isLoading, errors, setErrors } = useStore();


    const change = (e: ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value.trim() });
    };

    const submit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors(null);

        const validationResult = forgatPasswordSchema.safeParse(form);

        if (!validationResult.success) {
            const formattedErrors =
                validationResult.error.flatten().fieldErrors;
            setErrors(formattedErrors);
            return;
        }
        await forgotPassword(form.email);
    };

    return (
        <AuthLayout
            title="Forgot password"
            description="Enter your email to receive a password reset link"
        >
            <h1> Forgot password</h1>

            <div className="space-y-6">
                <form
                    onSubmit={(e) => {
                        submit(e).catch(console.error);
                    }}
                    noValidate
                >
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="off"
                            value={form.email}
                            autoFocus
                            onChange={(e) => change(e)}
                            placeholder="email@example.com"
                        />
                        {errors?.email && (
                            <InputError
                                message={errors.email[0]}
                                className="mt-2"
                            />
                        )}
                    </div>

                    <div className="my-6 flex items-center justify-start">
                        <Button className="w-full" disabled={isLoading}>
                            {isLoading && (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                            )}
                            Email password reset link
                        </Button>
                    </div>
                </form>

                <div className="text-muted-foreground space-x-1 text-center text-sm">
                    <span>Or, return to</span>
                    <TextLink to={"/login"}>log in</TextLink>
                </div>
            </div>
        </AuthLayout>
    );
}
