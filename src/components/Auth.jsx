// Auth.jsx
import React, { useState } from "react";

const Auth = ({ onAuth }) => {
  const [credentials, setCredentials] = useState({
    idInstance: "",
    apiTokenInstance: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAuth(credentials);
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="ID Instance"
        value={credentials.idInstance}
        onChange={(e) =>
          setCredentials((prev) => ({ ...prev, idInstance: e.target.value }))
        }
      />
      <input
        type="password"
        placeholder="API Token"
        value={credentials.apiTokenInstance}
        onChange={(e) =>
          setCredentials((prev) => ({
            ...prev,
            apiTokenInstance: e.target.value,
          }))
        }
      />
      <button type="submit">Авторизоваться</button>
    </form>
  );
};

export default Auth;
