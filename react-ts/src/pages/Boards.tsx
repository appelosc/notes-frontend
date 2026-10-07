import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getBoard } from "../api/boards";
import type { Board } from "../types";

function Boards() {
  //behövliga variabler
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  /*UseEffect låter oss köra kod i ts som inte har med renderingen att köra. Kör alla våra fetches via det
  och sparar boardena i boards med setBoards*/
  useEffect(() => {
    getBoard()
      .then((result) => {
        setBoards(result);
        setLoading(false);
      })
      .catch((error) => {
        setError("Could not load boards: " + error.message);
        setLoading(false);
      });
  }, []);

  // simpel logout funktion som tar bort jwtToken från localstorage och reroutar till huvudsidan där login finns
  function logout() {
    localStorage.removeItem("jwtToken");
    navigate("/");
  }

  // ----- Skriven av Claude Code Opus 5.5 -----

  return (
    
    <div className="min-h-screen bg-[#E0E0E2] px-4 py-12">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8">
        {/* Utloggningsknappen */}
        <div className="flex w-full justify-end">
          <button
            type="button"
            onClick={logout}
            className="cursor-pointer rounded-lg bg-white px-4 py-2 font-medium text-gray-700 shadow transition hover:brightness-95"
          >
            Log out
          </button>
        </div>

        {/* Titlen*/}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-3xl font-semibold text-gray-800">Your boards</h1>
          <div className="h-1 w-16 rounded-full bg-[#7389AE]" />
        </div>
        {/* Loading + error message visas ifall de är true / har innehåll*/}

        {loading && <p className="text-gray-600">Loading...</p>}

        {error && <p className="text-gray-600">{error}</p>}

        {!loading && !error && boards.length === 0 && (
          <p className="text-gray-600">You don't have any boards yet.</p>
        )}

        
        <div className="flex flex-wrap justify-center gap-6">
          {/* Loopar och visar all boards, klick reroutar en till boards/id */}
          {boards.map((board) => (
            <button
              key={board.id}
              type="button"
              onClick={() => navigate("/boards/" + board.id)}
              className="flex w-64 cursor-pointer flex-col items-center gap-4 rounded-2xl border-t-4 border-[#7389AE] bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7389AE] text-xl font-semibold text-white">
                {board.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-lg font-medium text-gray-800">{board.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
  // ----- Slut på skriven av Claude Code Opus 5.5 -----
}

export default Boards;
