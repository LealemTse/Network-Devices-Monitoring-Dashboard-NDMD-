export default function ForgotPassword() {
  return (
    <div className="recovery-container">
      <form className="recovery-form" action="">
        <h1 className="recovery-title">Verify Identity</h1>
        <p className="description">
          Please verify your identity to reset your dashboard access. Select
          your security question and provied the answer.
        </p>

        <div className="form-group">
          <label className="label" htmlFor="recovery-security-question">
            Security Questions
          </label>
          <select
            className=" recovery-security-questions"
            name=""
            id="recovery-security-question"
          >
            <option value="">Security Questions ...</option>
            <option value="whats your 7th grade school name">
              whats your 7th grade school name?
            </option>
            <option value="when is your mothers birthday">
              when is your mothers birthday?
            </option>
            <option value="Where were you born">Where were you born?</option>
          </select>
        </div>

        <div className="form-group">
          <label className="label" htmlFor="security-answer">
            Your Answer
          </label>
          <input
            type="password"
            className="input security-answer"
            placeholder="Type your answer here..."
          />
        </div>
        <button className="forgot-submit"> Verify Me</button>
      </form>
    </div>
  );
}
