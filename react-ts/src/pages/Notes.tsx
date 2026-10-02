import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { useNavigate, useParams } from "react-router";
import { createNote, deleteNote, getNotes, patchNote } from "../api/notes";
import { getBoard } from "../api/boards";
import type { Note } from "../types";

// The only color names the backend accepts (must match the zod schema).
const colors = ["yellow", "blue", "red", "green", "orange"];

// Which Tailwind background class to use for each color name.
// Record<string, string> means: an object with string keys and string values.
// Tailwind needs to see the full class names written out like this.
const colorClasses: Record<string, string> = {
  yellow: "bg-[#FFF3A3]",
  blue: "bg-[#BFD7FF]",
  red: "bg-[#FFB8B8]",
  green: "bg-[#C6F0C2]",
  orange: "bg-[#FFD3A3]",
};

function Notes() {
  // Read the board id from the URL, e.g. "/boards/42" gives "42".
  // It is always a string, so we turn it into a number with Number().
  const { boardId } = useParams();
  const id = Number(boardId);

  const navigate = useNavigate();

  // The notes for this board. Starts as an empty list.
  const [notes, setNotes] = useState<Note[]>([]);

  // True while we wait for the backend to answer.
  const [loading, setLoading] = useState(true);

  // Error text, if fetching fails.
  const [error, setError] = useState("");

  // The note being edited in the popup. null means the popup is closed.
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // True while the popup is used to create a NEW note (instead of editing one).
  const [creating, setCreating] = useState(false);

  // What the user has typed/picked in the popup.
  const [editText, setEditText] = useState("");
  const [editColor, setEditColor] = useState("yellow");

  // Error text shown inside the popup if saving fails.
  const [editError, setEditError] = useState("");

  // Id of the note being dragged right now. null means no drag.
  const [draggingId, setDraggingId] = useState<number | null>(null);

  // Where the mouse was when the drag started. Used to tell
  // a click (mouse barely moved) apart from a real drag.
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Distance from the mouse to the note's top-left corner, so the note
  // doesn't "jump" to put its corner under the mouse.
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // A "ref" gives us direct access to the board's HTML element,
  // so we can read its width and height (used to find its center).
  const boardRef = useRef<HTMLDivElement>(null);

  // Name of the board, shown as the page title. "Notes" until it has loaded.
  const [boardName, setBoardName] = useState("Notes");

  // Runs when the page opens, and again if the board id changes.
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

    // Get all the user's boards and find the one with this page's id.
    // .find() returns the first board that matches, or undefined if none does.
    getBoard().then((boards) => {
      const board = boards.find((b) => b.id === id);
      if (board !== undefined) {
        setBoardName(board.name);
      }
    });
  }, [id]);

  // Opens the popup and fills it with the clicked note's values.
  function openEditor(note: Note) {
    setEditingNote(note);
    setEditText(note.note);
    setEditColor(note.color);
    setEditError("");
  }

  // Opens an empty popup for creating a new note.
  function openCreator() {
    setCreating(true);
    setEditText("");
    setEditColor("yellow");
    setEditError("");
  }

  // Checks the popup fields before anything is sent to the backend.
  // Returns true if everything is OK, otherwise shows an error and returns false.
  function fieldsAreValid() {
    // .trim() removes spaces at the start/end, so "   " also counts as empty.
    if (editText.trim() === "") {
      setEditError("The note can't be empty.");
      return false;
    }
    // .includes() checks if editColor is one of the 5 allowed colors.
    if (!colors.includes(editColor)) {
      setEditError("Please pick a color.");
      return false;
    }
    return true;
  }

  // Closes the popup, no matter if we were editing or creating.
  function closeEditor() {
    setEditingNote(null);
    setCreating(false);
  }

  async function createNewNote() {
    // Stop here if the fields are not OK.
    if (!fieldsAreValid()) {
      return;
    }

    // Center of the board. A note is 192px (h-48/w-48) big, so we
    // subtract half of that (96) to put the note's middle in the center.
    // boardRef.current can be null in theory, so we fall back to 0.
    const boardWidth = boardRef.current?.clientWidth ?? 0;
    const boardHeight = boardRef.current?.clientHeight ?? 0;
    const position = {
      x: Math.max(0, boardWidth / 2 - 96),
      y: Math.max(0, boardHeight / 2 - 96),
    };

    try {
      await createNote({
        note: editText,
        boardId: id,
        color: editColor,
        position: position,
      });
      closeEditor();

      // Load the notes again so the new one shows up.
      const result = await getNotes(id);
      setNotes(result);
    } catch (error) {
      if (error instanceof Error) {
        setEditError("Could not create note: " + error.message);
      } else {
        setEditError("Could not create note.");
      }
    }
  }

  // Deletes the note that is open in the popup.
  // (Called removeNote so the name doesn't clash with deleteNote from notes.ts.)
  async function removeNote() {
    if (editingNote === null) {
      return;
    }

    try {
      await deleteNote(editingNote.id);

      // Remove the note from our list. .filter() keeps every note
      // whose id is NOT the deleted one.
      setNotes(notes.filter((n) => n.id !== editingNote.id));
      closeEditor();
    } catch (error) {
      if (error instanceof Error) {
        setEditError("Could not delete: " + error.message);
      } else {
        setEditError("Could not delete.");
      }
    }
  }

  async function saveNote() {
    // The popup is only open when editingNote is set, but TS doesn't
    // know that, so we check it here.
    if (editingNote === null) {
      return;
    }

    // Stop here if the fields are not OK.
    if (!fieldsAreValid()) {
      return;
    }

    try {
      await patchNote(editingNote.id, { note: editText, color: editColor });

      // Update the note in our list so the page shows the change.
      // For the edited note we make a copy ({ ...n }) with the new values,
      // every other note stays the same.
      setNotes(
        notes.map((n) =>
          n.id === editingNote.id ? { ...n, note: editText, color: editColor } : n,
        ),
      );
      closeEditor();
    } catch (error) {
      if (error instanceof Error) {
        setEditError("Could not save: " + error.message);
      } else {
        setEditError("Could not save.");
      }
    }
  }

  // Mouse button pressed on a note: start dragging it.
  function handlePointerDown(event: PointerEvent<HTMLDivElement>, note: Note) {
    setDraggingId(note.id);
    setDragStart({ x: event.clientX, y: event.clientY });
    setDragOffset({
      x: event.clientX - note.position.x,
      y: event.clientY - note.position.y,
    });
    // Keep sending mouse events to this note, even if the mouse
    // moves faster than the note and leaves it for a moment.
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  // Mouse moving: if this note is being dragged, move it with the mouse.
  function handlePointerMove(event: PointerEvent<HTMLDivElement>, note: Note) {
    if (draggingId !== note.id) {
      return;
    }

    // Math.max(0, ...) stops the note from going off the left/top edge.
    const newPosition = {
      x: Math.max(0, event.clientX - dragOffset.x),
      y: Math.max(0, event.clientY - dragOffset.y),
    };

    // Only changes the screen. The backend is updated when the mouse is released.
    setNotes(
      notes.map((n) => (n.id === note.id ? { ...n, position: newPosition } : n)),
    );
  }

  // Mouse button released: either it was a click (open the editor)
  // or a drag (save the new position).
  async function handlePointerUp(event: PointerEvent<HTMLDivElement>, note: Note) {
    if (draggingId !== note.id) {
      return;
    }
    setDraggingId(null);

    // How far the mouse moved since the button was pressed.
    const movedX = Math.abs(event.clientX - dragStart.x);
    const movedY = Math.abs(event.clientY - dragStart.y);

    // Moved less than 5 pixels: treat it as a click.
    if (movedX < 5 && movedY < 5) {
      openEditor(note);
      return;
    }

    const newPosition = {
      x: Math.max(0, event.clientX - dragOffset.x),
      y: Math.max(0, event.clientY - dragOffset.y),
    };

    try {
      await patchNote(note.id, { position: newPosition });
    } catch (error) {
      if (error instanceof Error) {
        setError("Could not move note: " + error.message);
      }
    }

    // Load the notes again so the screen shows what the backend saved.
    const result = await getNotes(id);
    setNotes(result);
  }

  return (
    // Same gray background as the other pages.
    <div className="min-h-screen bg-[#E0E0E2] px-4 py-12">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8">
        {/* Top row: back button on the left, new note button on the right */}
        <div className="flex w-full justify-between">
          <button
            type="button"
            onClick={() => navigate("/boards")}
            className="cursor-pointer rounded-lg bg-[#7389AE] px-4 py-2 font-medium text-white transition hover:brightness-90"
          >
            ← Back to boards
          </button>
          <button
            type="button"
            onClick={openCreator}
            className="cursor-pointer rounded-lg bg-[#7389AE] px-4 py-2 font-medium text-white transition hover:brightness-90"
          >
            + New note
          </button>
        </div>

        {/* Page title with a short blue line under it */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-3xl font-semibold text-gray-800">{boardName}</h1>
          <div className="h-1 w-16 rounded-full bg-[#7389AE]" />
        </div>

        {loading && <p className="text-gray-600">Loading...</p>}

        {error && <p className="text-gray-600">{error}</p>}

        {!loading && !error && notes.length === 0 && (
          <p className="text-gray-600">This board has no notes yet.</p>
        )}

        {/* The board. Notes are placed inside it using their saved position:
            "left" is position.x and "top" is position.y, in pixels from
            the board's top-left corner. */}
        <div
          ref={boardRef}
          className="relative h-[80vh] w-full rounded-2xl border-2 border-dashed border-[#7389AE]/50"
        >
          {/* "index" is the position in the list (0, 1, 2...).
              We use it to tilt every other note a different way. */}
          {notes.map((note, index) => (
            <div
              key={note.id}
              onPointerDown={(event) => handlePointerDown(event, note)}
              onPointerMove={(event) => handlePointerMove(event, note)}
              onPointerUp={(event) => handlePointerUp(event, note)}
              style={{ left: note.position.x, top: note.position.y }}
              className={
                // touch-none stops the page from scrolling while dragging on a phone.
                // select-none stops text from getting highlighted while dragging.
                "absolute flex h-48 w-48 cursor-grab touch-none select-none flex-col p-5 pt-7 shadow-lg " +
                // Use the note's color, or yellow if the color is unknown.
                (colorClasses[note.color] ?? colorClasses.yellow) +
                " " +
                (index % 2 === 0 ? "-rotate-2" : "rotate-2") +
                " " +
                // The dragged note is lifted above the others.
                (draggingId === note.id ? "z-10 scale-105 cursor-grabbing shadow-2xl" : "")
              }
            >
              {/* Blue "tape" holding the note at the top */}
              <div className="absolute -top-2 left-1/2 h-5 w-16 -translate-x-1/2 bg-[#7389AE]/70" />

              <p className="break-words text-gray-800">{note.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* The popup. Shown while a note is being edited OR created.
          "||" means "or". */}
      {(editingNote !== null || creating) && (
        // Dark see-through layer covering the whole page.
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

            {/* Dropdown with one <option> per color */}
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
                // Same button, but it calls a different function
                // depending on if we are creating or editing.
                onClick={creating ? createNewNote : saveNote}
                className="flex-1 cursor-pointer rounded-lg bg-[#7389AE] p-3 font-medium text-white transition hover:brightness-90"
              >
                Save
              </button>
            </div>

            {/* Delete only makes sense for an existing note, not a new one */}
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
}

export default Notes;
