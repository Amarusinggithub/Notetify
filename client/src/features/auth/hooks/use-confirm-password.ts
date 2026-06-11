import * as authService from "@/features/auth/services/auth-service";
import { useStore } from "@/app/store/index";
import { mapAxiosErrorToFieldErrors } from "@/shared/utils/helpers";

const useConfirmPassword = async (password: string): Promise<boolean> => {
    useStore.setState({ isLoading: true, errors: null });
    try {
        if (!password?.trim()) {
            useStore.setState({
                errors: { password: ["Password is required."] },
            });
            return false;
        }

        await authService.confirmPassword(password);
        return true;
    } catch (error) {
        useStore.setState({ errors: mapAxiosErrorToFieldErrors(error) });
        return false;
    } finally {
        useStore.setState({ isLoading: false });
    }
};
export default useConfirmPassword;
