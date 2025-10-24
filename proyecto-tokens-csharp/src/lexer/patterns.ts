export const CSharpKeywords = new Set([
  // Tipos de datos
  'bool', 'byte', 'char', 'decimal', 'double', 'float', 'int', 'long', 
  'sbyte', 'short', 'uint', 'ulong', 'ushort', 'void', 'string', 'object',
  
  // Modificadores de acceso
  'public', 'private', 'protected', 'internal', 'static', 'readonly', 'const',
  
  // Palabras reservadas de control
  'if', 'else', 'while', 'for', 'foreach', 'do', 'switch', 'case', 'default',
  'break', 'continue', 'return', 'goto', 'throw', 'try', 'catch', 'finally',
  
  // Otros
  'class', 'struct', 'interface', 'enum', 'delegate', 'event', 'operator',
  'namespace', 'using', 'new', 'this', 'base', 'null', 'true', 'false',
  'async', 'await', 'checked', 'unchecked', 'fixed', 'lock', 'out', 'ref',
  'params', 'sizeof', 'typeof', 'nameof', 'when', 'where', 'yield', 'partial',
  'abstract', 'virtual', 'override', 'sealed', 'extern', 'volatile'
]);

// ... resto del código igual
export const CSharpOperators = {
  arithmetic: new Set(['+', '-', '*', '/', '%', '++', '--']),
  comparison: new Set(['==', '!=', '>', '<', '>=', '<=']),
  logical: new Set(['&&', '||', '!', '&', '|', '^', '~']),
  assignment: new Set(['=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>='])
};

export const GroupingSymbols = {
  open: new Set(['(', '{', '[']),
  close: new Set([')', '}', ']'])
};