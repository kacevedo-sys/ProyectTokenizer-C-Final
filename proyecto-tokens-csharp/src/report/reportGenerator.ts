import { TokenSummary } from '../lexer/types';
import * as fs from 'fs';

export class ReportGenerator {
  public static generateSalidaTxt(summary: TokenSummary[], filePath: string): void {
    let content = 'RESUMEN DE CONTEO POR PALABRA\n';
    content += '================================\n\n';

    let table = '| Elemento | Palabra | Conteo |\n';
    table += '|----------|---------|--------|\n';

    for (const item of summary) {
      if (item.element) {
        table += `| ${item.element} | ${item.word} | ${item.count} |\n`;
      } else {
        table += `| | ${item.word} | ${item.count} |\n`;
      }
    }

    content += table;
    
    // Guardar archivo
    fs.writeFileSync('Salida.txt', content, 'utf-8');
    console.log('📄 Archivo Salida.txt generado correctamente');
  }

  public static generateConsoleSummary(summary: TokenSummary[]): string {
    let table = '| Elemento | Palabra | Conteo |\n';
    table += '|----------|---------|--------|\n';
    
    for (const item of summary) {
      if (item.element) {
        table += `| ${item.element} | ${item.word} | ${item.count} |\n`;
      } else {
        table += `| | ${item.word} | ${item.count} |\n`;
      }
    }

    return table;
  }
}