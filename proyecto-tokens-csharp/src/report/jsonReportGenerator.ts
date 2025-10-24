import { TokenSummary, Token } from '../lexer/types';
import * as fs from 'fs';

export class JSONReportGenerator {
  public static generateJSONReport(summary: TokenSummary[], tokens: Token[]): void {
    const report = {
      metadata: {
        generatedAt: new Date().toISOString(),
        totalTokens: tokens.length,
        validTokens: tokens.filter((t: any) => t.type !== 'ERROR').length,
        errorTokens: tokens.filter((t: any) => t.type === 'ERROR').length
      },
      statistics: {
        totalTokens: this.getTotalTokens(summary),
        uniqueTokens: this.getUniqueTokens(summary),
        categoriesCount: this.getCategoriesCount(summary),
        tokenDensity: this.calculateTokenDensity(summary)
      },
      tokensByCategory: this.groupByCategory(summary),
      detailedSummary: summary,
      tokenFrequency: this.getTokenFrequency(summary),
      mostFrequentTokens: this.getMostFrequentTokens(summary, 10)
    };

    const jsonContent = JSON.stringify(report, null, 2);
    fs.writeFileSync('analisis_lexico.json', jsonContent, 'utf-8');
    console.log('📄 Archivo JSON generado: analisis_lexico.json');
  }

  private static groupByCategory(summary: TokenSummary[]): any {
    const grouped: any = {};
    
    summary.forEach(item => {
      const category = item.element || 'General';
      if (!grouped[category]) {
        grouped[category] = {
          total: 0,
          tokens: []
        };
      }
      grouped[category].total += item.count;
      grouped[category].tokens.push({
        token: item.word,
        count: item.count,
        percentage: ((item.count / this.getTotalTokens(summary)) * 100).toFixed(2) + '%'
      });
    });
    
    // Ordenar tokens por frecuencia dentro de cada categoría
    Object.keys(grouped).forEach(category => {
      grouped[category].tokens.sort((a: any, b: any) => b.count - a.count);
    });
    
    return grouped;
  }

  private static getTokenFrequency(summary: TokenSummary[]): any[] {
    const frequency = summary.map(item => ({
      token: item.word,
      category: item.element || 'General',
      count: item.count,
      percentage: ((item.count / this.getTotalTokens(summary)) * 100).toFixed(2) + '%'
    }));
    
    return frequency.sort((a, b) => b.count - a.count);
  }

  private static getMostFrequentTokens(summary: TokenSummary[], limit: number): any[] {
    return this.getTokenFrequency(summary)
      .slice(0, limit)
      .map((item, index) => ({
        rank: index + 1,
        ...item
      }));
  }

  private static getTotalTokens(summary: TokenSummary[]): number {
    return summary.reduce((total, item) => total + item.count, 0);
  }

  private static getUniqueTokens(summary: TokenSummary[]): number {
    return new Set(summary.map(item => item.word)).size;
  }

  private static getCategoriesCount(summary: TokenSummary[]): number {
    return new Set(summary.filter(item => item.element).map(item => item.element)).size;
  }

  private static calculateTokenDensity(summary: TokenSummary[]): any {
    const total = this.getTotalTokens(summary);
    const categories = this.groupByCategory(summary);
    const density: any = {};
    
    Object.keys(categories).forEach(category => {
      density[category] = ((categories[category].total / total) * 100).toFixed(2) + '%';
    });
    
    return density;
  }
}