import { contentApi } from "./client.ts";
import type { Note } from "../types";

export const getNotes = (boardId: number) => contentApi<Note[]>(`/notes/${boardId}`);

export const getNoteById = (noteId: number) => contentApi<Note>(`/notes/${noteId}`);

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
  noteId: number,
  noteData: {
    note?: string;
    color?: string;
    position?: { x: number; y: number };
  },
) =>
  contentApi<Note>(`/notes/${noteId}`, {
    method: "PATCH",
    body: JSON.stringify(noteData),
  });

export const putNote = (
  noteId: number,
  noteData: {
    author_id: number;
    note: string;
    boardId: number;
    color: string;
    position: { x: number; y: number };
  },
) =>
  contentApi<Note>(`/notes/${noteId}`, {
    method: "PUT",
    body: JSON.stringify(noteData),
  });

export const deleteNote = (noteId: number): Promise<void> =>
  contentApi<void>(`/notes/${noteId}`, {
    method: "DELETE",
  });
