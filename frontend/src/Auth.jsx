import { useState } from "react";

function Auth({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        const endpoint = isLogin
            ? "login"
            : "register";

        const body = isLogin
            ? { email, password }
            : { name, email, password };

        const response = await fetch(
            `http://localhost:5000/api/auth/${endpoint}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            setMessage(data.message || "Something went wrong");
            return;
        }

        if (isLogin) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            onLogin(data.user);
        } else {
            setMessage("Registration successful. Please login.");
            setIsLogin(true);
            setPassword("");
        }
    };

    return (
        <div className="auth-container">

            <h1>TaskFlow</h1>

            <p>
                {isLogin
                    ? "Login to your account"
                    : "Create your account"}
            </p>

            <form onSubmit={handleSubmit}>

                {!isLogin && (
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                )}

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type="submit">
                    {isLogin ? "Login" : "Register"}
                </button>

            </form>

            {message && <p>{message}</p>}

            <button
                className="switch-button"
                onClick={() => {
                    setIsLogin(!isLogin);
                    setMessage("");
                }}
            >
                {isLogin
                    ? "Create an account"
                    : "Already have an account?"}
            </button>

        </div>
    );
}

export default Auth;