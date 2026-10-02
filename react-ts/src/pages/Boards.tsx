import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getBoard } from "../api/boards";
import type { Board } from "../types";

function Boards() {
  // The list of boards from the backend. Starts as an empty list.
  // <Board[]> tells TS this is an array of Board objects.
  const [boards, setBoards] = useState<Board[]>([]);

  // True while we wait for the backend to answer.
  const [loading, setLoading] = useState(true);

  // Error text, if fetching fails.
  const [error, setError] = useState("");

  // Function from react-router that lets us change page in code.
  const navigate = useNavigate();

  // useEffect with an empty [] at the end runs ONCE,
  // right after the page is shown for the first time.
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

  return (
    // Same gray background as the login page.
    <div className="min-h-screen bg-[#E0E0E2] px-4 py-12">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8">
        {/* Page title with a short blue line under it */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-3xl font-semibold text-gray-800">Your boards</h1>
          <div className="h-1 w-16 rounded-full bg-[#7389AE]" />
        </div>

        {loading && <p className="text-gray-600">Loading...</p>}

        {error && <p className="text-gray-600">{error}</p>}

        {!loading && !error && boards.length === 0 && (
          <p className="text-gray-600">You don't have any boards yet.</p>
        )}

        {/* flex-wrap puts the boxes in rows, and justify-center keeps
            every row centered, even a last row with fewer boxes. */}
        <div className="flex flex-wrap justify-center gap-6">
          {/* .map() loops through the boards and returns one button per board.
              React needs a unique "key" on each item in a list. */}
          {boards.map((board) => (
            <button
              key={board.id}
              type="button"
              onClick={() => navigate("/boards/" + board.id)}
              className="flex w-64 cursor-pointer flex-col items-center gap-4 rounded-2xl border-t-4 border-[#7389AE] bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
            >
              {/* Blue circle with the first letter of the board name */}
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
}

export default Boards;
