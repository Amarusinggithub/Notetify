import * as authService from "@/features/auth/services/auth-service";
import { useStore } from "@/app/store/index";

const useLogout = async (): Promise<void> => {
    useStore.setState({ isLoading: true, errors: null });
    try {
        await authService.logout();
    } finally {
        useStore.setState({
            isAuthenticated: false,
            sharedData: null,
            selectedNoteId: null,
            selectedNotebookId: null,
            searchNotes: "",
            searchNotebooks: "",
            isLoading: false,
        });
        window.location.href = "/";
    }
};

export default useLogout;
