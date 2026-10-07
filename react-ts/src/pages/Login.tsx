import { useState } from "react";
import type { SubmitEvent } from "react";
import { useNavigate } from "react-router";
import { loginUser, registerUser } from "../api/users";

function Login() {
  //Behövliga variabler för react state
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  // loginform funktion

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      if (mode === "login") {
        const result = await loginUser({ username, password });
        localStorage.setItem("jwtToken", result.token);
        navigate("/boards");
      } else {
        await registerUser({ username, password });
        setMessage("Registered! You can now log in.");
        setMode("login");
      }
    } catch (error) {
      if (error instanceof Error) {
        setMessage("Something went wrong: " + error.message);
      } else {
        setMessage("Something went wrong.");
      }
    }
  }

  //----- Skriven av Claude Code Opus 5.5 -----
  const activeTab = "flex-1 cursor-pointer rounded-md py-2 font-medium bg-[#7389AE] text-white shadow";
  const inactiveTab = "flex-1 cursor-pointer rounded-md py-2 font-medium text-gray-600 hover:text-gray-900";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#E0E0E2] p-4">
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-center text-2xl font-semibold text-gray-800">
          {mode === "login" ? "Welcome back" : "Create an account"}
        </h1>

        <div className="flex gap-1 rounded-lg bg-[#E0E0E2] p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={mode === "login" ? activeTab : inactiveTab}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={mode === "register" ? activeTab : inactiveTab}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="rounded-lg border border-[#E0E0E2] p-3 outline-none focus:border-[#7389AE] focus:ring-2 focus:ring-[#7389AE]/30"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded-lg border border-[#E0E0E2] p-3 outline-none focus:border-[#7389AE] focus:ring-2 focus:ring-[#7389AE]/30"
          />
          <button
            type="submit"
            className="mt-2 cursor-pointer rounded-lg bg-[#7389AE] p-3 font-medium text-white transition hover:brightness-90"
          >
            {mode === "login" ? "Login" : "Register"}
          </button>
        </form>

        {message && <p className="text-center text-sm text-gray-600">{message}</p>}
      </div>
    </div>
  );
  // ----- Slut på skriven av Claude Code Opus 5.5 -----
}

export default Login;
