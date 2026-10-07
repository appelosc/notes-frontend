import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { useNavigate, useParams } from "react-router";
import { createNote, deleteNote, getNotes, patchNote } from "../api/notes";
import { getBoard } from "../api/boards";
import type { Note } from "../types";

// samma färger som accepteras av Zod schema i backend
const colors = ["yellow", "blue", "red", "green", "orange"];
const colorClasses: Record<string, string> = {
  yellow: "bg-[#FFF3A3]",
  blue: "bg-[#BFD7FF]",
  red: "bg-[#FFB8B8]",
  green: "bg-[#C6F0C2]",
  orange: "bg-[#FFD3A3]",
};


const refreshInterval = 5000;
const noteSize = 192;

// Function som kollar ifall errorn är av typ Error och returnerar det som en string
function errorText(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return fallback + ": " + error.message;
  }
  return fallback + ".";
}

function Notes() {
  // Behövliga variabler för react state
  const { boardId } = useParams();
  const id = Number(boardId);

  const navigate = useNavigate();

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // editing + creating popups state
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [creating, setCreating] = useState(false);

  // text + color i edit popup
  const [editText, setEditText] = useState("");
  const [editColor, setEditColor] = useState("yellow");
  const [editError, setEditError] = useState("");
  // state variabler för förflyttning av notes
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // referens till board div som används för att räkna ut position av notes och vart de får flyttas
  const boardRef = useRef<HTMLDivElement>(null);

  const [boardName, setBoardName] = useState("Notes");

  // Samma som i boards, körs även när id ändras ( om man ändrar board id i url)
  useEffect(() => {
    getNotes(id)
      .then((result) => {
        setNotes(result);
        setLoading(false);
      })
      .catch((error) => {
        setError("Could not load notes: " + error.message);
        setLoading(false);
      });

    // Titeln för board
    getBoard().then((boards) => {
      const board = boards.find((b) => b.id === id);
      if (board !== undefined) {
        setBoardName(board.name);
      }
    });
  }, [id]);

  // UseEffect som har setinterval som körs varje refreshinterval och hämtar notes igen. kan se andra användarens notes.
  useEffect(() => {
    if (draggingId !== null) {
      return;
    }

    const timer = setInterval(() => {
      if (document.hidden) {
        return;
      }
      getNotes(id)
        .then((result) => setNotes(result))
        .catch(() => {});
    }, refreshInterval);

    return () => clearInterval(timer);
  }, [id, draggingId]);

  // samma logout som i Boards.tsx
  function logout() {
    localStorage.removeItem("jwtToken");
    navigate("/");
  }

  // Popups för editering av note same att skapa ny note
  function openEditor(note: Note) {
    setEditingNote(note);
    setEditText(note.note);
    setEditColor(note.color);
    setEditError("");
  }

  function openCreator() {
    setCreating(true);
    setEditText("");
    setEditColor("yellow");
    setEditError("");
  }

  //validering av note fält
  function fieldsAreValid() {
    if (editText.trim() === "") {
      setEditError("The note can't be empty.");
      return false;
    }
    return true;
  }

  function closeEditor() {
    setEditingNote(null);
    setCreating(false);
  }

  // skapa ny note

  async function createNewNote() {
    if (!fieldsAreValid()) {
      return;
    }
    // centrerar noten i mitten av boarden, räknar ut så noten blir i mitten
    const boardWidth = boardRef.current?.clientWidth ?? 0;
    const boardHeight = boardRef.current?.clientHeight ?? 0;
    const position = {
      x: Math.max(0, boardWidth / 2 - noteSize / 2),
      y: Math.max(0, boardHeight / 2 - noteSize / 2),
    };

    try {
      await createNote({
        note: editText,
        boardId: id,
        color: editColor,
        position: position,
      });
      closeEditor();
      setNotes(await getNotes(id));
    } catch (error) {
      setEditError(errorText(error, "Could not create note"));
    }
  }

  // radering av note
  async function removeNote() {
    if (editingNote === null) {
      return;
    }

    try {
      await deleteNote(id, editingNote.id);
      closeEditor();
      setNotes(await getNotes(id));
    } catch (error) {
      setEditError(errorText(error, "Could not delete"));
    }
  }

  // spara not efter uppdatering
  async function saveNote() {
    if (editingNote === null) {
      return;
    }
    if (!fieldsAreValid()) {
      return;
    }

    try {
      await patchNote(id, editingNote.id, { note: editText, color: editColor });
      closeEditor();
      setNotes(await getNotes(id));
    } catch (error) {
      setEditError(errorText(error, "Could not save"));
    }
  }
// ----- Skriven med hjälp av Claude Code Opus 5.5 -----
  // Dragfunktionalitet
  // räkna ut ny position av note när den dras av användaren
  function positionFromPointer(event: PointerEvent<HTMLDivElement>) {
    const maxX = (boardRef.current?.clientWidth ?? 0) - noteSize;
    const maxY = (boardRef.current?.clientHeight ?? 0) - noteSize;

    return {
      x: Math.max(0, Math.min(event.clientX - dragOffset.x, maxX)),
      y: Math.max(0, Math.min(event.clientY - dragOffset.y, maxY)),
    };
  }

  
  /* kollar vilken not vi tar i, räknar ut en offset mellan musen och noten,
  annars skulle notens vänstra kant hoppa till musens position direkt när man drar den
  låser noten till musen ( pointern)*/
  function handlePointerDown(event: PointerEvent<HTMLDivElement>, note: Note) {
    setDraggingId(note.id);
    setDragStart({ x: event.clientX, y: event.clientY });
    setDragOffset({
      x: event.clientX - note.position.x,
      y: event.clientY - note.position.y,
    });

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  // om noten dras så uppdateras notens position i react state och syns på frontend endast i detta skede
  function handlePointerMove(event: PointerEvent<HTMLDivElement>, note: Note) {
    if (draggingId !== note.id) {
      return;
    }
    const newPosition = positionFromPointer(event);

    setNotes(
      notes.map((n) => (n.id === note.id ? { ...n, position: newPosition } : n)),
    );
  }

  // Kollar när vi släpper musknappen ifall man endast klickade eller ifall notens position ändrats så mycket att det var ett drag.
  async function handlePointerUp(event: PointerEvent<HTMLDivElement>, note: Note) {
    if (draggingId !== note.id) {
      return;
    }
    setDraggingId(null);

    const movedX = Math.abs(event.clientX - dragStart.x);
    const movedY = Math.abs(event.clientY - dragStart.y);

    if (movedX < 5 && movedY < 5) {
      openEditor(note);
      return;
    }

    // uppdatera notens position i backend när vi checkat att det var en förflyttning

    try {
      await patchNote(id, note.id, { position: positionFromPointer(event) });
      setNotes(await getNotes(id));
    } catch (error) {
      setError(errorText(error, "Could not move note"));
    }
  }
  // ----- Slut på skriven med hjälp av Claude Code Opus 5.5 -----

  // ----- Skriven av Claude Code Opus 5.5 -----

  return (
    
    <div className="min-h-screen bg-[#E0E0E2] px-4 py-12">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8">
      
        <div className="flex w-full justify-between">
          <button
            type="button"
            onClick={() => navigate("/boards")}
            className="cursor-pointer rounded-lg bg-[#7389AE] px-4 py-2 font-medium text-white transition hover:brightness-90"
          >
            ← Back to boards
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={openCreator}
              className="cursor-pointer rounded-lg bg-[#7389AE] px-4 py-2 font-medium text-white transition hover:brightness-90"
            >
              + New note
            </button>
            <button
              type="button"
              onClick={logout}
              className="cursor-pointer rounded-lg bg-white px-4 py-2 font-medium text-gray-700 shadow transition hover:brightness-95"
            >
              Log out
            </button>
          </div>
        </div>

        
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-3xl font-semibold text-gray-800">{boardName}</h1>
          <div className="h-1 w-16 rounded-full bg-[#7389AE]" />
        </div>

        {loading && <p className="text-gray-600">Loading...</p>}

        {error && <p className="text-gray-600">{error}</p>}

        {!loading && !error && notes.length === 0 && (
          <p className="text-gray-600">This board has no notes yet.</p>
        )}
      </div>

      {/* Boarden + notes */}
      <div ref={boardRef} className="relative mt-8 h-[80vh] w-full">
        
        {notes.map((note, index) => (
          <div
            key={note.id}
            onPointerDown={(event) => handlePointerDown(event, note)}
            onPointerMove={(event) => handlePointerMove(event, note)}
            onPointerUp={(event) => handlePointerUp(event, note)}
            style={{ left: note.position.x, top: note.position.y }}
            className={
              
              "absolute flex h-48 w-48 cursor-grab touch-none select-none flex-col p-5 pt-7 shadow-lg " +
              (colorClasses[note.color] ?? colorClasses.yellow) +
              " " +
              (index % 2 === 0 ? "-rotate-2" : "rotate-2") +
              " " +
              (draggingId === note.id ? "z-10 scale-105 cursor-grabbing shadow-2xl" : "")
            }
          >
            <div className="absolute -top-2 left-1/2 h-5 w-16 -translate-x-1/2 bg-[#7389AE]/70" />

            <p className="break-words text-gray-800">{note.note}</p>
          </div>
        ))}
      </div>

      {/* Popups */}
      {(editingNote !== null || creating) && (
        
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
          <div className="flex w-full max-w-sm flex-col gap-4 rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800">
              {creating ? "New note" : "Edit note"}
            </h2>

            <textarea
              value={editText}
              onChange={(event) => setEditText(event.target.value)}
              rows={5}
              placeholder="Write your note..."
              className="rounded-lg border border-[#E0E0E2] p-3 outline-none focus:border-[#7389AE] focus:ring-2 focus:ring-[#7389AE]/30"
            />

            {/* Dropdowns */}
            <select
              value={editColor}
              onChange={(event) => setEditColor(event.target.value)}
              className="cursor-pointer rounded-lg border border-[#E0E0E2] p-3 outline-none focus:border-[#7389AE] focus:ring-2 focus:ring-[#7389AE]/30"
            >
              {colors.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>

            {editError && <p className="text-sm text-gray-600">{editError}</p>}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={closeEditor}
                className="flex-1 cursor-pointer rounded-lg bg-[#E0E0E2] p-3 font-medium text-gray-700 transition hover:brightness-95"
              >
                Cancel
              </button>
              <button
                type="button"
                // Save knapp
                onClick={creating ? createNewNote : saveNote}
                className="flex-1 cursor-pointer rounded-lg bg-[#7389AE] p-3 font-medium text-white transition hover:brightness-90"
              >
                Save
              </button>
            </div>

            {/* Delete syns endast på existerade notes*/}
            {!creating && (
              <button
                type="button"
                onClick={removeNote}
                className="cursor-pointer rounded-lg border border-red-300 p-3 font-medium text-red-600 transition hover:bg-red-50"
              >
                Delete note
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
  // ----- Slut på skriven av Claude Code Opus 5.5 -----
}

export default Notes;
