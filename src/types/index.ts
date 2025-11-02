// src/types/index.ts

export interface Literal {
  variable: string;
  negated: boolean;
}

export type Clause = Literal[];

export type CNFFormula = Clause[];

export interface VariableAssignment {
  [key: string]: boolean;
}