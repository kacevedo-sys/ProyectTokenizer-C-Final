import { TokenSummary, Token } from '../lexer/types';
import * as fs from 'fs';
import * as path from 'path';

export class JSONReportGenerator {
  public static generateJSONReport(
    summary: TokenSummary[],
    tokens: Token[],
    outputDir: string = './report_output'
  ): void {
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    const jsonPath = path.join(outputDir, 'analisis_lexico.json');

    const totalTokens = this.getTotalTokens(summary);
    const report = {
      metadata: {
        generatedAt: new Date().toISOString(),
        analyzedFile:
          tokens.length > 0 && 'source' in tokens[0]
            ? (tokens[0] as any).source
            : 'Desconocido',
        totalTokens: tokens.length,
        validTokens: tokens.filter(t => (t as any).type !== 'ERROR').length,
        errorTokens: tokens.filter(t => (t as any).type === 'ERROR').length,
      },
      statistics: {
        totalTokens,
        uniqueTokens: this.getUniqueTokens(summary),
        categories: this.getCategoriesCount(summary),
        density: this.calculateTokenDensity(summary),
      },
      groupedTokens: this.groupByCategory(summary),
      frequencyList: this.getTokenFrequency(summary),
    };

    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`🧩 Reporte JSON generado: ${jsonPath}`);
  }

  private static groupByCategory(summary: TokenSummary[]): Record<string, { total: number; tokens: { token: string; count: number; percentage: string }[] }> {
    const grouped: Record<string, { total: number; tokens: { token: string; count: number; percentage: string }[] }> = {};
    const total = this.getTotalTokens(summary);

    for (const item of summary) {
      const cat = item.element || 'General';
      if (!grouped[cat]) grouped[cat] = { total: 0, tokens: [] };
      grouped[cat].total += item.count;
      grouped[cat].tokens.push({
        token: item.word,
        count: item.count,
        percentage: ((item.count / total) * 100).toFixed(2) + '%',
      });
    }

    Object.keys(grouped).forEach(cat => {
      grouped[cat].tokens.sort((a, b) => b.count - a.count);
    });

    return grouped;
  }

  private static getTokenFrequency(summary: TokenSummary[]): { token: string; category: string; count: number; percentage: string }[] {
    const total = this.getTotalTokens(summary);
    return summary
      .map(item => ({
        token: item.word,
        category: item.element || 'General',
        count: item.count,
        percentage: ((item.count / total) * 100).toFixed(2) + '%',
      }))
      .sort((a, b) => b.count - a.count);
  }

  private static getTotalTokens(summary: TokenSummary[]): number {
    return summary.reduce((sum, item) => sum + item.count, 0);
  }

  private static getUniqueTokens(summary: TokenSummary[]): number {
    return new Set(summary.map(i => i.word)).size;
  }

  private static getCategoriesCount(summary: TokenSummary[]): number {
    return new Set(summary.filter(i => i.element).map(i => i.element)).size;
  }

  private static calculateTokenDensity(summary: TokenSummary[]): Record<string, string> {
    const total = this.getTotalTokens(summary);
    const grouped = this.groupByCategory(summary);
    const density: Record<string, string> = {};
    for (const cat of Object.keys(grouped)) {
      density[cat] = ((grouped[cat].total / total) * 100).toFixed(2) + '%';
    }
    return density;
  }
}
