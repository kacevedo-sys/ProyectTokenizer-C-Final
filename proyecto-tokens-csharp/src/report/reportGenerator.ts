import { TokenSummary } from '../lexer/types';
import * as fs from 'fs';
import * as path from 'path';

export class ReportGenerator {
  public static generateSalidaTxt(summary: TokenSummary[], filePath: string, outputDir: string = './report_output'): void {
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    const txtPath = path.join(outputDir, 'Salida.txt');

    let content = '📘 RESUMEN DE CONTEO POR PALABRA\n';
    content += '=====================================\n\n';
    content += '| Elemento | Palabra | Conteo |\n';
    content += '|----------|----------|--------|\n';

    for (const item of summary) {
      content += `| ${item.element || '-'} | ${item.word} | ${item.count} |\n`;
    }

    fs.writeFileSync(txtPath, content, 'utf-8');
    console.log(`📝 Archivo TXT generado: ${txtPath}`);
  }

  public static generateConsoleSummary(summary: TokenSummary[]): string {
    const header = '| Elemento | Palabra | Conteo |\n|----------|----------|--------|\n';
    const rows = summary
      .map(item => `| ${item.element || '-'} | ${item.word} | ${item.count} |`)
      .join('\n');
    return header + rows;
  }
}
