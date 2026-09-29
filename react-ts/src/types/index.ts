export interface Note {
  id: number;
  author_id: number;
  note: string;
  boardId: number;
  color: string;
  position: {
    x: number;
    y: number;
  };

  createdAt: string;
  updatedAt: string;
}
export interface Board {
  id: number;
  name: string;
  userIds: number[];
  notes: Note[];
  createdAt: string;
  updatedAt: string;
}
export interface User {
  id: number;
  username: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}