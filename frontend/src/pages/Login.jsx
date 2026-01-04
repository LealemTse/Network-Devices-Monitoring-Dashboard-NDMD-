export default function Login() {
  return (
    <div className="login-container">
      <form className="login-form" action="">
        <h1 className="login-title">Login to NDMD</h1>
        <label className="login-label label" htmlFor="login-admin">
          User
        </label>
        <input
          type="text"
          className="input login-admin"
          placeholder="Admin"
          value="Admin"
          disabled
        />
        <label className="login-label label" htmlFor="login-password">
          Password
        </label>
        <input
          type="password"
          className="input login-password"
          placeholder="Min. 8 characters"
        />
        <button className="login-submit">Login</button>
        <a className="forgot-password" href="/forgot_password">
          Forgot Password
        </a>
      </form>
    </div>
  );
}
