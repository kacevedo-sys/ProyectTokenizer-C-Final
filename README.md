# Analizador Léxico para C#

Un analizador léxico para código C# que valida la sintaxis y genera reportes detallados. Esta herramienta ayuda a identificar errores comunes de programación y proporciona un análisis completo de tokens.

## Características

- Tokeniza archivos de código fuente C#
- Valida la sintaxis e identifica errores comunes:
  - Términos aislados en líneas
  - Secuencias inválidas de operadores
  - Punto y coma faltantes
  - Argumentos incompletos en métodos
  - Declaraciones inválidas de identificadores
- Genera reportes en múltiples formatos:
  - Reporte HTML con resaltado de sintaxis
  - Lista de tokens en CSV
  - Resultados del análisis en JSON

## Ejemplos de Detección de Errores

El analizador detecta varios errores de sintaxis incluyendo por ejemplo:

- Términos aislados: `nombre`
- Secuencias inválidas de operadores: `++++`

## Instalación

1. Clona el repositorio
2. Instala las dependencias:
```bash
npm install
```

## Uso

Ejecuta el analizador en un archivo C#:

```bash
npm start test/valid/test1.cs
```

Para modo desarrollo con recarga automática:

```bash
npm run dev
```

## Estructura del Proyecto

```
proyecto-tokens-csharp/
├── src/
│   ├── app.ts                 # Aplicación principal
│   ├── color/                 # Coloreado de terminal
│   ├── file/                 # Operaciones de archivo
│   ├── lexer/                # Análisis léxico
│   └── report/               # Generación de reportes
├── test/
│   ├── valid/                # Archivos C# válidos
│   └── invalid/              # Archivos C# inválidos
└── package.json
```

## Archivos de Salida

- `reporte_lexico.html`: Reporte con sintaxis coloreada
- `reporte_tokens.csv`: Lista de tokens
- `analisis_lexico.json`: Análisis detallado

## Códigos de Error

El analizador utiliza códigos de error estándar del compilador C#:
- CS1002: Falta punto y coma
- CS0103: Uso inválido de identificador
- CS7036: Argumento faltante

## Requisitos

- Node.js 14+
- TypeScript 4.5+
- npm 6+
