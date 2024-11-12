import {Link, useNavigate} from "react-router-dom";
import {logout} from "../services/AuthService.jsx";

const Homepage = () => {
    let navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const response = await logout();
            if (response === 200) {
                console.log("Logout successful");
                navigate("/LoginForm");
            } else {
                console.log("Logout failed");
            }
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    return (
        <div>
            <Link to="/SignUpForm">Sign Up</Link> <br/>
            <Link to="/LoginForm">Login</Link>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default Homepage;
