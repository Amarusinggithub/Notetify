import {useState} from "react";
import "../../styles/SignUpForm.css";
import {useNavigate} from "react-router-dom";
import {signUp} from "../../services/AuthService.jsx";


const SignUpForm = () => {
    const [state, setState] = useState({
        email: '',
        password: '', confirmPassword: '', username: '',
    });

    const handleChange = e => {
        setState({...state, [e.target.name]: e.target.value})
    }

    let navigate = useNavigate();

    async function handleSubmit(event) {
        event.preventDefault();

        if (state.password !== state.confirmPassword) {
            console.log("Passwords do not match");
            return;  // Stop form submission if passwords don't match
        }

        try {
            const response = await signUp(state.email, state.username, state.password);
            if (response === 200) {
                navigate("/");
            } else {
                console.log("Signup failed");
            }
        } catch (error) {
            console.error("Error during signup:", error);
        }
    }


    return (
        <div className="container">
            <form>
                <h1>Sign Up</h1>
                <div className="form-ui">
                    <div className="fields">
                        <label>Username</label>
                        <input type="text"
                               className="form-control"
                               id="username"
                               name="username"
                               value={state.username}
                               placeholder="Enter a username"
                               onChange={handleChange}/>
                    </div>
                    <div className="fields">
                        <label>Email</label>
                        <input type="email"
                               className="form-control"
                               id="email"
                               name="email"
                               value={state.email}
                               placeholder="Enter a valid email"
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

                    <div className="fields">
                        <label>Confirm Password</label>
                        <input type="password"
                               className="form-control"
                               id="confirmPassword"
                               name="confirmPassword"
                               value={state.confirmPassword}
                               placeholder="Confirm Password"
                               onChange={handleChange}/>
                    </div>

                    <div>

                        <button className="btn" onClick={handleSubmit}>Sign Up</button>

                    </div>
                </div>

            </form>
        </div>

    );

};

export default SignUpForm;