import React, { useState } from "react";
import Auth from "./components/Auth";
import Chat from "./components/Chat";
import "./styles.css";

const App = () => {
  const [authData, setAuthData] = useState(null);
  const [phone, setPhone] = useState("");

  const handleAuth = (data) => {
    setAuthData(data);
  };

  return (
    <div className="app">
      {!authData ? (
        <Auth onAuth={handleAuth} />
      ) : (
        <>
          <div className="phone-input-container">
            <input
              type="text"
              className="phone-input"
              placeholder="Введите номер телефона (например, 79991234567)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          {phone && (
            <Chat
              idInstance={authData.idInstance}
              apiTokenInstance={authData.apiTokenInstance}
              phone={phone}
            />
          )}
        </>
      )}
    </div>
  );
};

export default App;
