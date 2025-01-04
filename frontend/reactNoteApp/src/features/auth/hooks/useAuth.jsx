import {logout} from "../services/AuthService.jsx";

const useAuth = () => {
    const handleLogout = async () => {
        try {
            const response = await logout();
            if (response.status === 200) {
                console.log("Logout successful");
                setLogout();
                navigate("/login");
            } else {
                console.log("Logout failed");
            }
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

}

export default useAuth;