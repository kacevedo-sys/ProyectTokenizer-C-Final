import { Token, TokenType, LexerResult, TokenSummary } from './types';
import { CSharpKeywords, CSharpOperators, GroupingSymbols } from './patterns';

export class CSharpTokenizer {
  private source: string;
  private tokens: Token[] = [];
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;
  private braceStack: string[] = [];
  private warnings: string[] = [];
  private currentLineTokens: Token[] = []; // Nuevo: array para tokens de la línea actual

  constructor(source: string) {
    // Normalizar finales de línea (\r\n o \r) a \n para que el conteo de líneas sea consistente
    this.source = source.replace(/\r\n?/g, '\n');
  }

  public tokenize(): LexerResult {
    try {
      while (this.position < this.source.length) {
        const char = this.source[this.position];

        if (char === '\n') {
          // Validar la línea actual antes de procesarla
          this.validateCurrentLine();
          this.handleNewline();
          this.currentLineTokens = []; // Limpiar tokens de la línea
        } else if (this.isWhitespace(char)) {
          this.handleWhitespace();
        } else if (char === '/') {
          this.handleComment();
        } else if (char === '"') {
          this.handleString();
        } else if (this.isDigit(char)) {
          if (!this.handleNumber()) {
            break;
          }
        } else if (this.isLetter(char)) {
          this.handleIdentifierOrKeyword();
        } else if (this.isOperatorChar(char)) {
          this.handleOperator();
        } else if (GroupingSymbols.open.has(char)) {
          this.handleGrouping(char, TokenType.GROUPING_OPEN);
        } else if (GroupingSymbols.close.has(char)) {
          this.handleGrouping(char, TokenType.GROUPING_CLOSE);
        } else if (this.isPunctuation(char)) {
          this.handlePunctuation();
        } else {
          this.handleError(`Carácter no válido: '${char}'`);
          break;
        }
      }
      
      // Validar última línea
      this.validateCurrentLine();

      // ✅ MODIFICADO: Verificar TODOS los símbolos sin cerrar
      if (this.braceStack.length > 0) {
        const unclosedSymbols = this.braceStack.map(sym => `'${sym}'`).join(', ');
        this.handleError(`Símbolos de agrupación sin cerrar: ${unclosedSymbols}`);
        return {
          tokens: this.tokens,
          summary: this.generateSummary(),
          valid: false,
          error: {
            message: `Símbolos de agrupación sin cerrar: ${unclosedSymbols}`,
            line: this.line,
            column: this.column,
            token: this.braceStack[this.braceStack.length - 1]
          }
        };
      }

      return {
        tokens: this.tokens,
        summary: this.generateSummary(),
        valid: this.warnings.length === 0,
        warnings: this.warnings.length > 0 ? this.warnings : undefined
      };

    } catch (error: any) {
      return {
        tokens: this.tokens,
        summary: this.generateSummary(),
        valid: false,
        error: error
      };
    }
  }

  private validateCurrentLine(): void {
    // Filtrar tokens significativos (ignorar espacios, comentarios y saltos de línea)
    const significantTokens = this.currentLineTokens.filter(token =>
      token.type !== TokenType.WHITESPACE &&
      token.type !== TokenType.COMMENT &&
      token.type !== TokenType.NEWLINE
    );

    if (significantTokens.length === 0) {
      this.currentLineTokens = [];
      return;
    }

    // Caso: una sola entrada en la línea
    if (significantTokens.length === 1) {
      const token = significantTokens[0];

      // Permitir líneas que sólo contienen símbolos de agrupación ({, }, (, ), [, ])
      if (token.type === TokenType.GROUPING_OPEN || token.type === TokenType.GROUPING_CLOSE) {
        this.currentLineTokens = [];
        return;
      }

      // Error: término aislado (no agrupación)
      const errorToken: Token = {
        type: TokenType.ERROR,
        value: token.value,
        line: token.line,
        column: token.column
      };
      this.tokens.push(errorToken);

      throw {
        message: `Error de sintaxis: Término aislado '${token.value}' en la línea ${token.line}. Una línea no puede contener un único término.`,
        line: token.line,
        column: token.column,
        token: token.value
      };
    }

    // Caso: toda la línea son operadores/puntuación -> inválido (ej. +++++)
    const allOpsOrPunct = significantTokens.every(t =>
      this.isOperatorTokenType(t.type) || t.type === TokenType.PUNCTUATION
    );
    if (allOpsOrPunct) {
      const first = significantTokens[0];
      const errorToken: Token = {
        type: TokenType.ERROR,
        value: first.value,
        line: first.line,
        column: first.column
      };
      this.tokens.push(errorToken);

      throw {
        message: `Error léxico: Secuencia de operadores sin operandos en la línea ${first.line}.`,
        line: first.line,
        column: first.column,
        token: first.value
      };
    }

    // Caso: identificador seguido sólo por ';' (ej. "nombre;") -> marcar como instrucción inválida
    if (significantTokens.length === 2 &&
        significantTokens[0].type === TokenType.IDENTIFIER &&
        significantTokens[1].type === TokenType.PUNCTUATION &&
        significantTokens[1].value === ';') {
      const id = significantTokens[0];
      const errorToken: Token = {
        type: TokenType.ERROR,
        value: id.value,
        line: id.line,
        column: id.column
      };
      this.tokens.push(errorToken);

      throw {
        message: `Error: instrucción incompleta. Identificador aislado '${id.value}' antes de ';' en la línea ${id.line}. ('; expected' CS1002)`,
        line: id.line,
        column: id.column,
        token: id.value,
        code: 'CS1002'
      };
    }

    // Caso heurístico: operador al inicio o final de la línea -> probable error (ej. "+ a" o "a +")
    const first = significantTokens[0];
    const last = significantTokens[significantTokens.length - 1];
    if (this.isOperatorTokenType(first.type) || this.isOperatorTokenType(last.type)) {
      const problemToken = this.isOperatorTokenType(first.type) ? first : last;
      const errorToken: Token = {
        type: TokenType.ERROR,
        value: problemToken.value,
        line: problemToken.line,
        column: problemToken.column
      };
      this.tokens.push(errorToken);

      throw {
        message: `Error sintáctico: Operador en posición inválida '${problemToken.value}' en la línea ${problemToken.line}. Falta operando.`,
        line: problemToken.line,
        column: problemToken.column,
        token: problemToken.value
      };
    }

    // Nuevo: detectar coma seguida inmediatamente por ')' -> falta argumento (ej: Calcular(10, ) )
    for (let i = 0; i < significantTokens.length; i++) {
      const t = significantTokens[i];
      if (t.type === TokenType.PUNCTUATION && t.value === ',') {
        // buscar siguiente token significativo
        const next = significantTokens[i + 1];
        if (!next || (next.type === TokenType.PUNCTUATION && next.value === ')')) {
          const errorToken: Token = {
            type: TokenType.ERROR,
            value: t.value,
            line: t.line,
            column: t.column
          };
          this.tokens.push(errorToken);

          throw {
            message: `Error: Se esperaba un argumento después de ',' en la línea ${t.line}.`,
            line: t.line,
            column: t.column,
            token: t.value
          };
        }
      }
    }

    // Nuevo: detectar falta de ';' en una expresión/llamada (heurística)
    const hasSemicolon = significantTokens.some(t => t.type === TokenType.PUNCTUATION && t.value === ';');
    const hasOpenParen = significantTokens.some(t => t.type === TokenType.PUNCTUATION && t.value === '(');
    const hasCloseParen = significantTokens.some(t => t.type === TokenType.PUNCTUATION && t.value === ')');

    // Excluir encabezados de control/definición comunes
    const controlKeywords = new Set([
      'if', 'for', 'while', 'switch', 'catch', 'using', 'namespace', 'class', 'struct', 'interface', 'else', 'do', 'try'
    ]);
    const startsWithControl = first.type === TokenType.KEYWORD && controlKeywords.has(first.value);

    if (!hasSemicolon && hasOpenParen && hasCloseParen && last.type === TokenType.PUNCTUATION && last.value === ')' && !startsWithControl) {
      // si parece una llamada/expresión que termina en ')' y no hay ';' en la línea => probable ';' faltante
      const errorToken: Token = {
        type: TokenType.ERROR,
        value: last.value,
        line: last.line,
        column: last.column
      };
      this.tokens.push(errorToken);

      throw {
        message: `Error: ';' esperado al final de la expresión en la línea ${last.line}. ('; expected' CS1002)`,
        line: last.line,
        column: last.column,
        token: last.value,
        code: 'CS1002'
      };
    }

    // Si pasó todas las comprobaciones, limpiar tokens de la línea y continuar
    this.currentLineTokens = [];
  }

  private handleNewline(): void {
    this.addToken(TokenType.NEWLINE, '\n', this.line, this.column);
    this.position++;
    this.line++;
    this.column = 1;
  }

  private handleWhitespace(): void {
    let value = '';
    const startLine = this.line;
    const startColumn = this.column;

    while (this.position < this.source.length &&
      this.isWhitespace(this.source[this.position]) &&
      this.source[this.position] !== '\n') {
      value += this.source[this.position];
      this.position++;
      this.column++;
    }

    this.addToken(TokenType.WHITESPACE, value, startLine, startColumn);
  }

  private handleComment(): void {
    const startLine = this.line;
    const startColumn = this.column;

    if (this.position + 1 < this.source.length && this.source[this.position + 1] === '/') {
      // Comentario de línea
      let value = '';
      while (this.position < this.source.length && this.source[this.position] !== '\n') {
        value += this.source[this.position];
        this.position++;
        this.column++;
      }
      this.addToken(TokenType.COMMENT, value, startLine, startColumn);
    } else {
      // Operador de división
      this.handleOperator();
    }
  }

  private handleString(): void {
    let value = '';
    const startLine = this.line;
    const startColumn = this.column;

    // Comilla inicial
    value += this.source[this.position++];
    this.column++;

    // Contenido del string
    while (this.position < this.source.length && this.source[this.position] !== '"') {
      if (this.source[this.position] === '\\') {
        // Carácter de escape
        value += this.source[this.position++];
        this.column++;
        if (this.position < this.source.length) {
          value += this.source[this.position++];
          this.column++;
        }
      } else if (this.source[this.position] === '\n') {
        // Error: string sin cerrar
        this.handleError('String sin cerrar');
        return;
      } else {
        value += this.source[this.position++];
        this.column++;
      }
    }

    // Comilla final
    if (this.position < this.source.length && this.source[this.position] === '"') {
      value += this.source[this.position++];
      this.column++;
    } else if (this.position >= this.source.length) {
      this.handleError('String sin cerrar al final del archivo');
      return;
    }

    this.addToken(TokenType.STRING, value, startLine, startColumn);
  }

  private handleNumber(): boolean {
    let value = '';
    const startLine = this.line;
    const startColumn = this.column;
    let hasDecimalPoint = false;

    // Leer parte entera
    while (this.position < this.source.length && this.isDigit(this.source[this.position])) {
      value += this.source[this.position];
      this.position++;
      this.column++;
    }

    // Verificar punto decimal
    if (this.position < this.source.length && this.source[this.position] === '.') {
      // Verificar si ya hay un punto decimal (error)
      if (hasDecimalPoint) {
        this.handleError('Número con múltiples puntos decimales');
        return false;
      }

      value += this.source[this.position];
      this.position++;
      this.column++;
      hasDecimalPoint = true;

      // Leer parte decimal
      while (this.position < this.source.length && this.isDigit(this.source[this.position])) {
        value += this.source[this.position];
        this.position++;
        this.column++;
      }

      // Verificar si hay otro punto decimal inmediatamente después
      if (this.position < this.source.length && this.source[this.position] === '.') {
        this.handleError('Número con múltiples puntos decimales');
        return false;
      }
    }

    // Verificar sufijos válidos (f, d, m, l, u)
    if (this.position < this.source.length) {
      const nextChar = this.source[this.position].toLowerCase();
      const validSuffixes = ['f', 'd', 'm', 'l', 'u']; 

      if (validSuffixes.includes(nextChar)) {
        value += this.source[this.position];
        this.position++;
        this.column++;
      } else if (this.isLetter(this.source[this.position])) {
        // Carácter no válido después del número
        this.handleError(`Carácter no válido '${this.source[this.position]}' después de número`);
        return false;
      }
    }

    this.addToken(TokenType.NUMBER, value, startLine, startColumn);
    return true;
  }

  private handleIdentifierOrKeyword(): void {
    let value = '';
    const startLine = this.line;
    const startColumn = this.column;

    // Primer carácter debe ser letra o _
    if (this.isLetter(this.source[this.position]) || this.source[this.position] === '_') {
      value += this.source[this.position];
      this.position++;
      this.column++;
    } else {
      this.handleError('Identificador debe comenzar con letra o _');
      return;
    }

    // Caracteres siguientes pueden ser letras, números o _
    while (this.position < this.source.length &&
      (this.isLetter(this.source[this.position]) ||
        this.isDigit(this.source[this.position]) ||
        this.source[this.position] === '_')) {
      value += this.source[this.position];
      this.position++;
      this.column++;
    }

    let type: TokenType;
    if (CSharpKeywords.has(value)) {
      type = TokenType.KEYWORD;
    } else if (value === 'true' || value === 'false') {
      type = TokenType.BOOLEAN;
    } else if (value === 'null') {
      type = TokenType.KEYWORD;
    } else {
      type = TokenType.IDENTIFIER;
    }

    this.addToken(type, value, startLine, startColumn);
  }

  private handleOperator(): void {
    let value = '';
    const startLine = this.line;
    const startColumn = this.column;

    // Leer operador (puede ser de 1 o 2 caracteres)
    value += this.source[this.position++];
    this.column++;

    // Verificar si es operador de 2 o 3 caracteres
    if (this.position < this.source.length) {
      const nextChar = this.source[this.position];
      const twoCharOp = value + nextChar;
      const multiCharOperators = [
        '==', '!=', '>=', '<=', '+=', '-=', '*=', '/=', '%=',
        '&&', '||', '++', '--', '->', '??', '?:', '<<', '>>', '=>'
      ];

      if (multiCharOperators.includes(twoCharOp)) {
        value = twoCharOp;
        this.position++;
        this.column++;
        
        // Verificar 3 caracteres (ej: ??=)
        if (twoCharOp === '??' && this.position < this.source.length && this.source[this.position] === '=') {
          value += this.source[this.position]; // ??=
          this.position++;
          this.column++;
        }
      }
    }

    let type: TokenType;
    if (['+', '-', '*', '/', '%', '++', '--'].includes(value)) {
      type = TokenType.OPERATOR_ARITHMETIC;
    } else if (['==', '!=', '>', '<', '>=', '<='].includes(value)) {
      type = TokenType.OPERATOR_COMPARISON;
    } else if (['&&', '||', '!', '&', '|', '^'].includes(value)) {
      type = TokenType.OPERATOR_LOGICAL;
    } else if (['=', '+=', '-=', '*=', '/=', '%='].includes(value) || value === '??=') {
      type = TokenType.OPERATOR_ASSIGNMENT;
    } else {
      // Los operadores restantes (->, ??, ?:, =>) se clasifican como aritméticos por defecto si no están cubiertos arriba.
      type = TokenType.OPERATOR_ARITHMETIC; 
    }

    this.addToken(type, value, startLine, startColumn);
  }

  private handleGrouping(char: string, type: TokenType): void {
  // Manejar balance de TODOS los símbolos de agrupación
  if (char === '{' || char === '(' || char === '[') {
    this.braceStack.push(char);
  } else if (char === '}' || char === ')' || char === ']') {
    if (this.braceStack.length === 0) {
      this.handleError(`Símbolo de cierre '${char}' sin apertura`);
      return;
    }
    
    const lastOpen = this.braceStack[this.braceStack.length - 1];
    const expectedClose = this.getMatchingClose(lastOpen);
    
    if (char === expectedClose) {
      this.braceStack.pop();
    } else {
      this.handleError(`Símbolo de cierre '${char}' no coincide con apertura '${lastOpen}'`);
      return;
    }
  }

  this.addToken(type, char, this.line, this.column);
  this.position++;
  this.column++;
}

private getMatchingClose(openChar: string): string {
  switch (openChar) {
    case '{': return '}';
    case '(': return ')';
    case '[': return ']';
    default: return '';
  }
}

  private handlePunctuation(): void {
    const char = this.source[this.position];
    this.addToken(TokenType.PUNCTUATION, char, this.line, this.column);
    this.position++;
    this.column++;
  }

  private handleError(message: string): void {
    const errorToken: Token = {
      type: TokenType.ERROR,
      value: this.source[this.position],
      line: this.line,
      column: this.column
    };

    this.tokens.push(errorToken);

    throw {
      message,
      line: this.line,
      column: this.column,
      token: this.source[this.position]
    };
  }

  private generateSummary(): TokenSummary[] {
    const summaryMap = new Map<string, Map<string, number>>();

    for (const token of this.tokens) {
      if (token.type === TokenType.WHITESPACE || token.type === TokenType.NEWLINE || token.type === TokenType.COMMENT) {
        continue;
      }

      // ✅ CORRECCIÓN CLAVE: Pasamos el valor del token (token.value) para ayudar a clasificar Llaves
      const category = this.getTokenCategory(token.type, token.value);
      const word = token.value;

      if (!summaryMap.has(category)) {
        summaryMap.set(category, new Map());
      }

      const categoryMap = summaryMap.get(category)!;
      categoryMap.set(word, (categoryMap.get(word) || 0) + 1);
    }

    const summary: TokenSummary[] = [];
    for (const [category, wordMap] of summaryMap) {
      let first = true;
      for (const [word, count] of wordMap) {
        summary.push({
          element: first ? category : '',
          word: word,
          count: count
        });
        first = false;
      }
    }

    return summary;
  }

  // ✅ CORRECCIÓN CLAVE: La función ahora acepta el valor y hace distinciones claras.
  private getTokenCategory(tokenType: TokenType, tokenValue: string): string {
    switch (tokenType) {
      case TokenType.KEYWORD: return 'Palabras Reservadas';
      case TokenType.IDENTIFIER: return 'Variables/Identificadores'; // Nombre mejorado
      case TokenType.NUMBER: return 'Números y Constantes'; // Nombre mejorado
      case TokenType.STRING: return 'Cadenas de Texto';
      case TokenType.BOOLEAN: return 'Valores Booleanos';
      case TokenType.OPERATOR_ARITHMETIC: return 'Operadores Aritméticos';
      case TokenType.OPERATOR_COMPARISON: return 'Operadores de Comparación';
      case TokenType.OPERATOR_LOGICAL: return 'Operadores Lógicos';
      case TokenType.OPERATOR_ASSIGNMENT: return 'Operadores de Asignación';
      
      // Clasificación específica de Agrupación, usando el valor del token:
      case TokenType.GROUPING_OPEN:
        return tokenValue === '{' ? 'Llaves Abiertas' : 'Signos de Agrupación';
      case TokenType.GROUPING_CLOSE:
        return tokenValue === '}' ? 'Llaves Cerradas' : 'Signos de Agrupación';
      
      case TokenType.PUNCTUATION: return 'Signos de Puntuación';
      case TokenType.ERROR: return 'Errores';
      default: return 'Otros/Tokens no clasificados'; // Categoría de fallback clara
    }
  }

  private addToken(type: TokenType, value: string, line: number, column: number): void {
    const token = {
      type,
      value,
      line,
      column
    };
    this.tokens.push(token);
    this.currentLineTokens.push(token); // Agregar a tokens de línea actual
  }

  // Métodos auxiliares
  private isWhitespace(char: string): boolean {
    return /\s/.test(char) && char !== '\n';
  }

  private isDigit(char: string): boolean {
    return /[0-9]/.test(char);
  }

  private isLetter(char: string): boolean {
    return /[a-zA-Z_]/.test(char);
  }

  private isOperatorChar(char: string): boolean {
    return /[+\-*/%=<>!&|^~]/.test(char);
  }

  private isPunctuation(char: string): boolean {
    return /[;,.:]/.test(char);
  }

  // Añadir helper para reconocer cualquier tipo de operador del enum TokenType
  private isOperatorTokenType(type: TokenType): boolean {
    return type === TokenType.OPERATOR_ARITHMETIC ||
           type === TokenType.OPERATOR_COMPARISON ||
           type === TokenType.OPERATOR_LOGICAL ||
           type === TokenType.OPERATOR_ASSIGNMENT;
  }
}
