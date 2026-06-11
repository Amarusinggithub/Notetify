import { lazy } from "react";
import {
    createBrowserRouter,
    Navigate,
    RouterProvider,
    type RouteObject,
} from "react-router";
import { notesLoader } from "@/features/notes/components/notes-sidebar";
import AppLayout from "@/app/layouts/app-layout";
import SettingsLayout from "@/app/layouts/settings/layout";
import LandingLayout from "@/app/layouts/landing/layout";
import LoadingPage from "@/app/pages/loading";
import { useStore } from "@/app/store/index";

const NotFound = lazy(() => import("@/app/pages/not-found"));
const Notes = lazy(() => import("@/features/notes/pages/notes"));
const Notebooks = lazy(() => import("@/features/notebooks/pages/notebook"));
const Files = lazy(() => import("@/features/files/pages/files"));
const Calender = lazy(() => import("@/features/calendar/pages/calender"));
const Tasks = lazy(() => import("@/features/tasks/pages/tasks"));
const Shared = lazy(() => import("@/features/sharing/pages/shared"));
const Tags = lazy(() => import("@/features/tags/pages/tags"));
const Spaces = lazy(() => import("@/features/spaces/pages/spaces"));
const Trash = lazy(() => import("@/features/trash/pages/trash"));
const Billing = lazy(() => import("@/features/settings/pages/billing"));
const General = lazy(() => import("@/features/settings/pages/general"));
const Authentication = lazy(
    () => import("@/features/settings/pages/authentication"),
);
const ForgotPassword = lazy(
    () => import("@/features/auth/pages/forgot-password"),
);
const ResetPassword = lazy(
    () => import("@/features/auth/pages/reset-password"),
);
const VerifyEmail = lazy(() => import("@/features/auth/pages/verify-email"));
const TwoFactorVerification = lazy(
    () => import("@/features/auth/pages/two-factor-verification"),
);
const Register = lazy(() => import("@/features/auth/pages/signup"));
const Login = lazy(() => import("@/features/auth/pages/login"));
const Home = lazy(() => import("@/features/dashboard/pages/home"));
const Landing = lazy(() => import("@/features/landing/pages/landing"));

function AppRoutes() {
    const checkingAuth = useStore((state) => state.checkingAuth);
    const isAuthenticated = useStore((state) => state.isAuthenticated);
    const isVerified = useStore(
        (state) => state.sharedData?.auth.user.is_verified,
    );

    const emailVerified = isAuthenticated && isVerified;

    if (checkingAuth) return <LoadingPage message="Checking session..." />;

    const publicRoutes: RouteObject[] = [
        {
            Component: LandingLayout,
            HydrateFallback: LoadingPage,
            children: [{ index: true, Component: Landing }],
        },
        {
            path: "login",
            Component: Login,
            HydrateFallback: LoadingPage,
        },
        {
            path: "forgot-password",
            Component: ForgotPassword,
            HydrateFallback: LoadingPage,
        },
        {
            path: "reset-password/:token",
            Component: ResetPassword,
            HydrateFallback: LoadingPage,
        },
        {
            path: "verify-email",
            Component: VerifyEmail,
            HydrateFallback: LoadingPage,
        },
        {
            path: "Two-factor-verification",
            Component: TwoFactorVerification,
            HydrateFallback: LoadingPage,
        },
        {
            path: "register",
            Component: Register,
            HydrateFallback: LoadingPage,
        },
        {
            path: "*",
            Component: NotFound,
            HydrateFallback: LoadingPage,
        },
    ];

    const privateRoutes: RouteObject[] = [
        {
            path: "/",
            id: "notes",
            Component: AppLayout,
            HydrateFallback: () => (
                <LoadingPage message="Loading Your Workspace..." />
            ),
            children: [
                { index: true, Component: Home },
                { path: "trash", Component: Trash },
                { path: "shared", Component: Shared },
                { path: "files", Component: Files },
                { path: "calender", Component: Calender },
                { path: "tags", Component: Tags },
                { path: "notebooks", Component: Notebooks },
                { path: "spaces", Component: Spaces },
                { path: "notes", Component: Notes, loader: notesLoader },
                {
                    path: "notes/:noteId",
                    Component: Notes,
                    loader: notesLoader,
                },
                { path: "tasks", Component: Tasks },
                { path: "*", Component: NotFound },
            ],
        },
        {
            path: "settings",
            Component: SettingsLayout,
            children: [
                {
                    index: true,
                    Component: () => (
                        <Navigate to="/settings/general" replace />
                    ),
                    HydrateFallback: () => (
                        <LoadingPage message="Loading Settings..." />
                    ),
                },
                { path: "general", Component: General },
                { path: "authentication", Component: Authentication },
                { path: "billing", Component: Billing },
                { path: "*", Component: NotFound },
            ],
        },

        { path: "*", Component: NotFound },
    ];

    const verificationRoutes: RouteObject[] = [
        {
            path: "verify-email",
            Component: VerifyEmail,
            HydrateFallback: LoadingPage,
        },
        { path: "*", Component: () => <Navigate to="/verify-email" replace /> },
    ];

    const router = createBrowserRouter(
        !isAuthenticated
            ? publicRoutes
            : !emailVerified
              ? verificationRoutes
              : privateRoutes,
    );

    return (
        <RouterProvider
            router={router}
            key={
                !isAuthenticated
                    ? "guest"
                    : !emailVerified
                      ? "unverified"
                      : "auth"
            }
        />
    );
}

export default AppRoutes;
