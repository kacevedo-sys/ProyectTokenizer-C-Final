import { TokenSummary } from '../lexer/types';
import * as fs from 'fs';

export class CSVReportGenerator {
  public static generateCSVReport(summary: TokenSummary[]): void {
    let csvContent = 'Categoría,Token,Conteo,Frecuencia Relativa\n';
    
    const totalTokens = this.getTotalTokens(summary);
    
    // Ordenar por categoría y luego por frecuencia
    const sortedSummary = summary.sort((a, b) => {
      const categoryCompare = (a.element || 'General').localeCompare(b.element || 'General');
      return categoryCompare !== 0 ? categoryCompare : b.count - a.count;
    });
    
    sortedSummary.forEach(item => {
      const frequency = ((item.count / totalTokens) * 100).toFixed(2);
      const category = item.element || 'General';
      const token = this.escapeCSV(item.word);
      
      csvContent += `"${category}","${token}",${item.count},${frequency}%\n`;
    });
    
    // Agregar totales al final
    csvContent += `\n"TOTAL","",${totalTokens},100.00%\n`;
    
    fs.writeFileSync('reporte_tokens.csv', csvContent, 'utf-8');
    console.log('📄 Archivo CSV generado: reporte_tokens.csv');
  }

  private static getTotalTokens(summary: TokenSummary[]): number {
    return summary.reduce((total, item) => total + item.count, 0);
  }

  private static escapeCSV(text: string): string {
    // Escapar comillas doblando las comillas existentes y envolviendo en comillas si contiene comas
    if (text.includes(',') || text.includes('"') || text.includes('\n')) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  }
}