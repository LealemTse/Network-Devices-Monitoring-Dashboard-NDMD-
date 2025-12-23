import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import "./index.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="main">
      <header>
        <h2>Create Account</h2>
      </header>
      <a className="auth-btn" href="/sign-up">
        <button>Sign Up</button>
      </a>
      <a className="auth-btn" href="/login">
        <button>Login</button>
      </a>
    </div>
  );
}

export default App;
