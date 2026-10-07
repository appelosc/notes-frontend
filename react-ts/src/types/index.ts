// Typer för Note och Board
/*Används för att berätta ts hur en note object ser ut. Kan då lova en function med Promise<Type> 
att t.ex. en fetch call returnerar ett object av denna typ, och då vet TS att t.ex. note.id finns
Den autocorrectar även om man skriver fel t.ex. note.di etc, hjälper med kodandet.
*/

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
  createdAt: string;
  updatedAt: string;
}
