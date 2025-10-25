import { TokenSummary } from '../lexer/types';
import * as fs from 'fs';
import * as path from 'path';

export class CSVReportGenerator {
  public static generateCSVReport(summary: TokenSummary[], outputDir: string = './report_output'): void {
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const filePath = path.join(outputDir, 'reporte_tokens.csv');
    let csvContent = 'Categoría,Token,Conteo,Frecuencia Relativa (%)\n';

    const totalTokens = this.getTotalTokens(summary);

    // Ordenar por categoría y frecuencia
    const sortedSummary = [...summary].sort((a, b) => {
      const categoryCompare = (a.element || 'General').localeCompare(b.element || 'General');
      return categoryCompare !== 0 ? categoryCompare : b.count - a.count;
    });

    sortedSummary.forEach(item => {
      const frequency = ((item.count / totalTokens) * 100).toFixed(2);
      const category = item.element || 'General';
      const token = this.escapeCSV(item.word);

      csvContent += `"${category}","${token}",${item.count},${frequency}\n`;
    });

    // Totales
    csvContent += `\n"TOTAL","",${totalTokens},100.00\n`;

    fs.writeFileSync(filePath, csvContent, 'utf-8');
    console.log(`✅ Reporte CSV generado: ${filePath}`);
  }

  private static getTotalTokens(summary: TokenSummary[]): number {
    return summary.reduce((total, item) => total + item.count, 0);
  }

  private static escapeCSV(text: string): string {
    if (/[,"\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
    return text;
  }
}
