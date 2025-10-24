export enum TokenType {
  // Palabras reservadas
  KEYWORD,
  
  // Identificadores y literales
  IDENTIFIER,
  NUMBER,
  STRING,
  BOOLEAN,
  
  // Operadores
  OPERATOR_ARITHMETIC,
  OPERATOR_COMPARISON,
  OPERATOR_LOGICAL,
  OPERATOR_ASSIGNMENT,
  
  // Signos
  GROUPING_OPEN,
  GROUPING_CLOSE,
  PUNCTUATION,
  
  // Comentarios
  COMMENT,
  
  // Espacios
  WHITESPACE,
  NEWLINE,
  
  // Control
  ERROR,
  EOF
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

export interface TokenSummary {
  element: string;
  word: string;
  count: number;
}

export interface LexerResult {
  tokens: Token[];
  summary: TokenSummary[];
  valid: boolean;
  error?: {
    message: string;
    line: number;
    column: number;
    token: string;
  };
  warnings?: string[]; // Agregar este campo opcional
}