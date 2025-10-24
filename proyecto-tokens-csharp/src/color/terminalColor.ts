import { Token, TokenType } from '../lexer/types';

export class TerminalColorizer {
  // Códigos ANSI para colores con fondo oscuro
  private static readonly colors = {
    // Texto coloreado
    blue: '\x1b[34m',           // Azul - Palabras reservadas
    orange: '\x1b[38;5;214m',   // Anaranjado - Números y constantes
    white: '\x1b[37m',          // Blanco - Signos de agrupación
    yellow: '\x1b[33m',         // Amarillo - Operadores de comparación y lógicos
    green: '\x1b[32m',          // Verde claro - Cadenas de texto
    pink: '\x1b[38;5;205m',     // Rosado más intenso
    gray: '\x1b[90m',           // Gris - Comentarios
    
    // Errores (fondo rojo + texto blanco)
    error: '\x1b[41m\x1b[37m',  // Fondo rojo, texto blanco
    
    // Reset
    reset: '\x1b[0m',
    
    // Fondo oscuro (simulación)
    darkBg: '\x1b[40m'          // Fondo negro
  };

  public static colorizeToken(token: Token): string {
    switch (token.type) {
      // Palabras reservadas - AZUL
      case TokenType.KEYWORD:
        return `${this.colors.blue}${token.value}${this.colors.reset}`;
      
      // Números y constantes - ANARANJADO
      case TokenType.NUMBER:
      case TokenType.BOOLEAN:
        return `${this.colors.orange}${token.value}${this.colors.reset}`;
      
      // Signos de agrupación - BLANCO
      case TokenType.GROUPING_OPEN:
      case TokenType.GROUPING_CLOSE:
        return `${this.colors.white}${token.value}${this.colors.reset}`;
      
      // Operadores de comparación y lógicos - AMARILLO
      case TokenType.OPERATOR_COMPARISON:
      case TokenType.OPERATOR_LOGICAL:
        return `${this.colors.yellow}${token.value}${this.colors.reset}`;
      
      // Operadores aritméticos y asignación - AMARILLO (según especificación)
      case TokenType.OPERATOR_ARITHMETIC:
      case TokenType.OPERATOR_ASSIGNMENT:
        return `${this.colors.yellow}${token.value}${this.colors.reset}`;
      
      // Cadenas de texto - VERDE CLARO
      case TokenType.STRING:
        return `${this.colors.green}${token.value}${this.colors.reset}`;
      
      // Variables/Identificadores - ROSADO
      case TokenType.IDENTIFIER:
        return `${this.colors.pink}${token.value}${this.colors.reset}`;
      
      // Comentarios - GRIS
      case TokenType.COMMENT:
        return `${this.colors.gray}${token.value}${this.colors.reset}`;
      
      // Errores - FONDO ROJO CON TEXTO BLANCO
      case TokenType.ERROR:
        return `${this.colors.error}${token.value}${this.colors.reset}`;
      
      // Puntuación - BLANCO
      case TokenType.PUNCTUATION:
        return `${this.colors.white}${token.value}${this.colors.reset}`;
      
      // Espacios y saltos de línea - sin color
      case TokenType.WHITESPACE:
      case TokenType.NEWLINE:
        return token.value;
      
      default:
        return token.value;
    }
  }

  public static displayColoredCode(tokens: Token[]): void {
    // Configurar fondo oscuro
    process.stdout.write(this.colors.darkBg);
    
    let currentLine = 1;
    let lineContent = '';
    let lineNumber = 1;

    console.log('\n' + '='.repeat(80));
    console.log('🎨 CÓDIGO C# COLOREADO');
    console.log('='.repeat(80) + '\n');

    for (const token of tokens) {
      if (token.type === TokenType.EOF) break;

      // Manejo de líneas - mostrar número de línea
      if (token.line > currentLine) {
        if (lineContent.trim()) {
          console.log(`${this.formatLineNumber(lineNumber)} ${lineContent}`);
          lineNumber++;
        }
        lineContent = '';
        currentLine = token.line;
      }

      // Agregar token coloreado a la línea
      lineContent += this.colorizeToken(token);
    }

    // Imprimir última línea si tiene contenido
    if (lineContent.trim()) {
      console.log(`${this.formatLineNumber(lineNumber)} ${lineContent}`);
    }

    // Resetear colores al final
    process.stdout.write(this.colors.reset);
    console.log('\n' + '='.repeat(80));
  }

  private static formatLineNumber(lineNumber: number): string {
    return `\x1b[90m${lineNumber.toString().padStart(3, ' ')} │\x1b[0m`;
  }

  public static displayColorLegend(): void {
    console.log('\n🎨 LEYENDA DE COLORES:');
    console.log('='.repeat(40));
    console.log(`${this.colors.blue}Azul${this.colors.reset} - Palabras reservadas`);
    console.log(`${this.colors.orange}Anaranjado${this.colors.reset} - Números y constantes`);
    console.log(`${this.colors.white}Blanco${this.colors.reset} - Signos de agrupación`);
    console.log(`${this.colors.yellow}Amarillo${this.colors.reset} - Operadores de comparación/lógicos`);
    console.log(`${this.colors.green}Verde claro${this.colors.reset} - Cadenas de texto`);
    console.log(`${this.colors.pink}Rosado${this.colors.reset} - Variables/Identificadores`);
    console.log(`${this.colors.gray}Gris${this.colors.reset} - Comentarios`);
    console.log(`${this.colors.error}Rojo (fondo)${this.colors.reset} - Errores`);
    console.log('='.repeat(40));
  }
}