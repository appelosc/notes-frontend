import { useState } from "react";
import type { SubmitEvent } from "react";
import { useNavigate } from "react-router";
import { loginUser, registerUser } from "../api/users";

function Login() {
  // Which form is shown. The type "login" | "register" means
  // this variable can ONLY ever be one of those two strings.
  const [mode, setMode] = useState<"login" | "register">("login");

  // What the user has typed in the inputs.
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Text shown under the form (success or error).
  const [message, setMessage] = useState("");

  // Function from react-router that lets us change page in code.
  const navigate = useNavigate();

  // Runs when the form is submitted (button click or Enter key).
  // "async" lets us use "await" to wait for the backend to answer.
  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    // Stop the browser from reloading the page (default form behavior).
    event.preventDefault();

    try {
      if (mode === "login") {
        const result = await loginUser({ username, password });
        // Save the token. client.ts reads this same key ("jwtToken")
        // and sends it with every later request.
        localStorage.setItem("jwtToken", result.token);
        // Go to the boards page.
        navigate("/boards");
      } else {
        await registerUser({ username, password });
        setMessage("Registered! You can now log in.");
        setMode("login");
      }
    } catch (error) {
      // "error" has type "unknown" in TS, so we check that it is
      // a real Error before reading .message from it.
      if (error instanceof Error) {
        setMessage("Something went wrong: " + error.message);
      } else {
        setMessage("Something went wrong.");
      }
    }
  }

  // Tailwind classes for the two switch buttons.
  // The selected one gets the blue accent color, the other stays gray.
  const activeTab = "flex-1 cursor-pointer rounded-md py-2 font-medium bg-[#7389AE] text-white shadow";
  const inactiveTab = "flex-1 cursor-pointer rounded-md py-2 font-medium text-gray-600 hover:text-gray-900";

  return (
    // Full-screen gray background with the card centered in the middle.
    <div className="flex min-h-screen items-center justify-center bg-[#E0E0E2] p-4">
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-center text-2xl font-semibold text-gray-800">
          {mode === "login" ? "Welcome back" : "Create an account"}
        </h1>

        {/* Buttons to switch between login and register */}
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

        {/* Only show the message if there is one */}
        {message && <p className="text-center text-sm text-gray-600">{message}</p>}
      </div>
    </div>
  );
}

export default Login;
