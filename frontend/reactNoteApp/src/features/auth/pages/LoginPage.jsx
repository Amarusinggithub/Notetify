import {useState} from "react";
import "../styles/LoginForm.css";
import {useAuth} from "../hooks/useAuth.jsx";

const LoginPage = () => {
    const [state, setState] = useState({
        username: '',
        password: '',
    });
    const {handleLogin} = useAuth();

    const handleChange = e => {
        setState({...state, [e.target.name]: e.target.value})
    }
    async function handleSubmit(event) {
        event.preventDefault();
        await handleLogin(state.username, state.password);

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


                <div className={"form-btn"}>

                    <button className="btn" type={"submit"}> Login</button>


                </div>
            </div>

        </form>);
};

export default LoginPage;