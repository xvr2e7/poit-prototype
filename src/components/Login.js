import React, { useState } from 'react';
import '../styles/Login.css';

function Login({ onLogin, enterPlayground }) {
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="login-page">
      <h2>{isRegistering ? 'Register' : 'Login'}</h2>
      <form onSubmit={handleLogin}>
        <label>
          Username:
          <input type="text" required />
        </label>
        <label>
          Password:
          <input type="password" required />
        </label>
        <button type="submit">{isRegistering ? 'Register' : 'Login'}</button>
      </form>
      <button onClick={() => setIsRegistering(!isRegistering)}>
        {isRegistering ? 'Switch to Login' : 'Switch to Register'}
      </button>
      <button className="playground-direct" onClick={enterPlayground}>
        Enter Playground Without Login
      </button>
    </div>
  );
}

export default Login;
