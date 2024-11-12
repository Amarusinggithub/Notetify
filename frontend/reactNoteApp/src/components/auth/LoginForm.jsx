import {useState} from "react";
import "../../styles/LoginForm.css";

import {login,} from "../../services/AuthService.jsx";
import {useNavigate} from "react-router-dom";

const LoginForm = () => {
    const [state, setState] = useState({
        username: '',
        password: '',
    });

    const handleChange = e => {
        setState({...state, [e.target.name]: e.target.value})
    }
    let navigate = useNavigate();

    async function handleSubmit(event) {
        event.preventDefault();
        try {
            const response = await login(state.username, state.password);
            if (response === 200) {
                navigate("/");
            } else {
                console.log("Login failed");
            }
        } catch (error) {
            console.error("Error during login:", error);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h1>Login</h1>
            <div className="form-ui">

                <div className="fields">
                    <label>Username</label>
                    <input type="Text"
                           className="form-control"
                           id="username"
                           name="username"
                           value={state.username}
                           placeholder="Enter a valid Username"
                           onChange={handleChange}/>
                </div>

                <div className="fields">
                    <label>Password</label>
                    <input type="password"
                           className="form-control"
                           id="password"
                           name="password"
                           value={state.password}
                           placeholder="Enter a valid password"
                           onChange={handleChange}/>
                </div>


                <div>

                    <button className="btn" type={"submit"}> Login</button>


                </div>
            </div>

        </form>);
};

export default LoginForm;