import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import AuthLayout from "@/layouts/auth-layout";
import { useStore } from "@/store";

export default function VerifyEmail() {
    const { isLoading, VerifyEmail, Logout } = useStore();
    const [resent, setResent] = useState(false);

    const handleResend = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const result = await VerifyEmail();
        if (result) setResent(true);
    };

    return (
        <AuthLayout
            title="Verify email"
            description="Please verify your email address by clicking on the link we just emailed to you."
        >
            <form
                onSubmit={(e) => {
                    handleResend(e).catch(console.error);
                }}
                className="space-y-6 text-center"
            >
                {resent && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                        A new verification link has been sent to your email.
                    </p>
                )}

                <Button disabled={isLoading || resent} variant="secondary">
                    {isLoading && (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                    )}
                    {resent ? "Email sent" : "Resend verification email"}
                </Button>

                <Button
                    variant={"link"}
                    onClick={() => {
                        Logout().catch(console.error);
                    }}
                    className="mx-auto block text-sm underline"
                >
                    Log out
                </Button>
            </form>
        </AuthLayout>
    );
}
