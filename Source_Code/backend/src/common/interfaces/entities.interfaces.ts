export interface Answer {
  id: number;
  description: string;
}

export interface DoneQuestion {
  id: number;
  isChosen: boolean;
  isCorrect: boolean;
  isMarked: boolean;
  description: string;
  type: string;
  explaination?: string;
  level?: number;
  answers: Answer[];
  chosenAnswerId: number[];
  correctAnswerId: number[];
}
