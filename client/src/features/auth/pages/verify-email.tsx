import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button.tsx";
import AuthLayout from "@/app/layouts/auth-layout";
import { useStore } from "@/app/store/index.ts";
import verifyEmail from "@/features/auth/hooks/use-verify-email";
import logout from "@/features/auth/hooks/use-logout";

export default function VerifyEmail() {
    const { isLoading } = useStore();
    const [resent, setResent] = useState(false);

    const handleResend = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        await verifyEmail();
        setResent(true);
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
                        logout().catch(console.error);
                    }}
                    className="mx-auto block text-sm underline"
                >
                    Log out
                </Button>
            </form>
        </AuthLayout>
    );
}
