import React, { useState } from 'react';
import { apiFetch } from "../api/client";
import "./Login.css"

const Login = ({onLoginSuccess}: {onLoginSuccess: () => void}) => {

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    })

    const updateFormData = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;

        setFormData((prev) =>({ 
            ...prev,
            [name]: value
        }))
    };

    const handleLogin = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const email = formData.email;
            const password = formData.password;
            const data = await apiFetch("/auth/login", {
                method: "POST",
                body: JSON.stringify({email, password}),
            })
        
            localStorage.setItem("token", data.token);
            onLoginSuccess();
        } catch (error) {
            console.log("Error:", error);
        }
    }

    return (
        <div className='container'>
            <h1>Login</h1>
            <form className='form-container' onSubmit={handleLogin}>
                <label htmlFor="email">Email</label>
                <input 
                    id="email" 
                    name="email"
                    type="email"
                    aria-label='email'
                    required
                    value={formData.email}
                    onChange={updateFormData}
                />
                <label htmlFor="password">Password</label>
                <input 
                    id="password" 
                    name="password"
                    type="text"
                    aria-label='password'
                    required
                    value={formData.password}
                    onChange={updateFormData}
                />
                <button type="submit">Login</button>
            </form>
        </div>
    )
};

export default Login;

