export default function LoadingPage({ message = 'Loading...' }: { message?: string }) {
    return (
        <div className="flex h-screen flex-col items-center justify-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-green-500" />
            <p className="text-muted-foreground text-lg">{message}</p>
        </div>
    );
}
