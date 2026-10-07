import { contentApi } from "./client.ts";
import type { Note } from "../types";

// Alla note endpoints. Tar emot data och requestInit objects ( method, data etc) som parameter.
// Kan på så vis använda samma bas fetch och modifiera den enligt endpointens behov

export const getNotes = (boardId: number) => contentApi<Note[]>(`/notes/${boardId}`);


export const createNote = (noteData: {
  note: string;
  boardId: number;
  color: string;
  position: { x: number; y: number };
}) =>
  contentApi<Note>(`/notes`, {
    method: "POST",
    body: JSON.stringify(noteData),
  });

export const patchNote = (
  boardId: number,
  noteId: number,
  noteData: {
    note?: string;
    color?: string;
    position?: { x: number; y: number };
  },
) =>
  contentApi<Note>(`/notes/${boardId}/${noteId}`, {
    method: "PATCH",
    body: JSON.stringify(noteData),
  });

export const putNote = (
  boardId: number,
  noteId: number,
  noteData: {
    author_id: number;
    note: string;
    boardId: number;
    color: string;
    position: { x: number; y: number };
  },
) =>
  contentApi<Note>(`/notes/${boardId}/${noteId}`, {
    method: "PUT",
    body: JSON.stringify(noteData),
  });

export const deleteNote = (boardId: number, noteId: number): Promise<void> =>
  contentApi<void>(`/notes/${boardId}/${noteId}`, {
    method: "DELETE",
  });
