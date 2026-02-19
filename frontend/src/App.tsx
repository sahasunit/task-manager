import { useState } from 'react';
import Login from "./pages/Login";
import Task from "./pages/Tasks";

function App() {

  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  return isAuthenticated ? (
    <Task 
      onLogout={() => {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
      }}
    />
  ) : <Login onLoginSuccess={() => setIsAuthenticated(true)} />
}

export default App
