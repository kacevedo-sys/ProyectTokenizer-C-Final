import { TokenSummary, Token } from '../lexer/types';
import * as fs from 'fs';
import * as path from 'path';

export class HTMLReportGenerator {
  public static generateHTMLReport(summary: TokenSummary[], tokens: Token[], filePath: string, outputDir: string = './report_output'): void {
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    const htmlPath = path.join(outputDir, 'reporte_lexico.html');

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Reporte Léxico - ${filePath}</title>
<style>
  body {
    font-family: 'Segoe UI', sans-serif;
    background-color: #1e1e1e;
    color: #ddd;
    padding: 20px;
  }
  h1 { text-align: center; color: #61dafb; }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }
  th, td {
    padding: 8px 12px;
    border-bottom: 1px solid #333;
  }
  th {
    background: #333;
    color: #fff;
    cursor: pointer;
  }
  tr:hover { background-color: #2a2a2a; }
  .token-category {
    color: #61dafb;
    font-weight: bold;
  }
  .summary {
    background-color: #007acc;
    color: white;
    padding: 10px;
    text-align: center;
    border-radius: 8px;
    margin-top: 15px;
  }
</style>
</head>
<body>
  <h1>📘 Reporte de Análisis Léxico</h1>
  <p><b>Archivo:</b> ${filePath}</p>
  <p><b>Generado:</b> ${new Date().toLocaleString()}</p>

  <table id="tokensTable">
    <thead>
      <tr>
        <th>Categoría</th>
        <th>Token</th>
        <th>Conteo</th>
      </tr>
    </thead>
    <tbody>
      ${this.generateTableRows(summary)}
    </tbody>
  </table>

  <div class="summary">
    Total de tokens analizados: ${this.getTotalTokens(summary)} |
    Categorías: ${this.getCategoriesCount(summary)} |
    Tokens únicos: ${this.getUniqueTokens(summary)}
  </div>
</body>
</html>`;

    fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
    console.log(`🌐 Reporte HTML generado: ${htmlPath}`);
  }

  private static generateTableRows(summary: TokenSummary[]): string {
    return summary
      .map(item => `
        <tr>
          <td class="token-category">${item.element || 'General'}</td>
          <td><code>${this.escapeHTML(item.word)}</code></td>
          <td>${item.count}</td>
        </tr>
      `)
      .join('');
  }

  private static getTotalTokens(summary: TokenSummary[]): number {
    return summary.reduce((total, item) => total + item.count, 0);
  }

  private static getUniqueTokens(summary: TokenSummary[]): number {
    return new Set(summary.map(item => item.word)).size;
  }

  private static getCategoriesCount(summary: TokenSummary[]): number {
    return new Set(summary.filter(i => i.element).map(i => i.element)).size;
  }

  private static escapeHTML(text: string): string {
    return text.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;')
               .replace(/"/g, '&quot;')
               .replace(/'/g, '&#039;');
  }
}
