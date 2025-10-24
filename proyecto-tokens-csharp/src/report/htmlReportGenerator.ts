import { TokenSummary, Token } from '../lexer/types';
import * as fs from 'fs';

export class HTMLReportGenerator {
  public static generateHTMLReport(summary: TokenSummary[], tokens: Token[], filePath: string): void {
    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte Léxico - ${filePath}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .header {
            background: rgba(255, 255, 255, 0.95);
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            margin-bottom: 20px;
            text-align: center;
        }
        
        .header h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 2.5em;
        }
        
        .header p {
            color: #666;
            font-size: 1.1em;
        }
        
        .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .card {
            background: rgba(255, 255, 255, 0.95);
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
        
        .card h2 {
            color: #333;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #667eea;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .stat-card {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
        }
        
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .stat-label {
            font-size: 0.9em;
            opacity: 0.9;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        
        th, td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        
        th {
            background-color: #667eea;
            color: white;
            font-weight: 600;
            cursor: pointer;
        }
        
        th:hover {
            background-color: #5a6fd8;
        }
        
        tr:hover {
            background-color: #f5f5f5;
        }
        
        .token-category {
            font-weight: bold;
            color: #667eea;
            background-color: #f0f4ff;
            padding: 2px 8px;
            border-radius: 4px;
        }
        
        .full-width {
            grid-column: 1 / -1;
        }
        
        .category-item {
            margin: 10px 0;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 5px;
            display: flex;
            justify-content: between;
        }
        
        .category-name {
            font-weight: bold;
            color: #333;
        }
        
        .category-count {
            background: #667eea;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.9em;
        }
        
        .summary-total {
            background: #4CAF50;
            color: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            margin-top: 15px;
            font-weight: bold;
            font-size: 1.1em;
        }
        
        .highlight {
            background-color: #fffacd !important;
        }
        
        @media (max-width: 768px) {
            .grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Reporte de Análisis Léxico</h1>
            <p>Archivo: ${filePath}</p>
            <p>Generado: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="grid">
            <div class="card">
                <h2>📈 Estadísticas Generales</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">${this.getTotalTokens(summary)}</div>
                        <div class="stat-label">Total Tokens</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${this.getUniqueTokens(summary)}</div>
                        <div class="stat-label">Tokens Únicos</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${this.getCategoriesCount(summary)}</div>
                        <div class="stat-label">Categorías</div>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <h2>📋 Resumen por Categoría</h2>
                ${this.generateCategorySummary(summary)}
            </div>
            
            <div class="card full-width">
                <h2>📝 Detalle de Tokens</h2>
                <table id="tokensTable">
                    <thead>
                        <tr>
                            <th data-sort="category">Categoría ▼</th>
                            <th data-sort="token">Token</th>
                            <th data-sort="count">Conteo</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.generateTableRows(summary)}
                    </tbody>
                </table>
                <div class="summary-total">
                    Total de tokens encontrados: ${this.getTotalTokens(summary)}
                </div>
            </div>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const table = document.getElementById('tokensTable');
            const headers = table.querySelectorAll('th');
            const tbody = table.querySelector('tbody');
            let currentSort = { column: 'count', direction: 'desc' };
            
            // Ordenamiento de tabla
            headers.forEach(header => {
                header.addEventListener('click', () => {
                    const column = header.getAttribute('data-sort');
                    sortTable(column);
                });
            });
            
            function sortTable(column) {
                const rows = Array.from(tbody.querySelectorAll('tr'));
                const direction = currentSort.column === column && currentSort.direction === 'asc' ? 'desc' : 'asc';
                
                rows.sort((a, b) => {
                    const aValue = getCellValue(a, column);
                    const bValue = getCellValue(b, column);
                    
                    if (column === 'count') {
                        return direction === 'asc' ? aValue - bValue : bValue - aValue;
                    } else {
                        return direction === 'asc' 
                            ? aValue.localeCompare(bValue)
                            : bValue.localeCompare(aValue);
                    }
                });
                
                // Actualizar indicadores de ordenamiento
                headers.forEach(h => h.innerHTML = h.innerHTML.replace(' ▼', '').replace(' ▲', ''));
                header.innerHTML += direction === 'asc' ? ' ▲' : ' ▼';
                
                // Reordenar filas
                rows.forEach(row => tbody.appendChild(row));
                currentSort = { column, direction };
            }
            
            function getCellValue(row, column) {
                const cellIndex = column === 'category' ? 0 : column === 'token' ? 1 : 2;
                const cell = row.cells[cellIndex];
                return column === 'count' ? parseInt(cell.textContent) : cell.textContent;
            }
            
            // Resaltar filas al hacer hover
            tbody.querySelectorAll('tr').forEach(row => {
                row.addEventListener('mouseenter', function() {
                    this.style.backgroundColor = '#f0f8ff';
                });
                row.addEventListener('mouseleave', function() {
                    this.style.backgroundColor = '';
                });
            });
        });
    </script>
</body>
</html>`;

    fs.writeFileSync('reporte_lexico.html', htmlContent, 'utf-8');
    console.log('📄 Archivo HTML generado: reporte_lexico.html');
  }

  private static generateTableRows(summary: TokenSummary[]): string {
    return summary.map(item => `
        <tr>
            <td><span class="token-category">${item.element || 'General'}</span></td>
            <td><code>${this.escapeHTML(item.word)}</code></td>
            <td><strong>${item.count}</strong></td>
        </tr>
    `).join('');
  }

  private static generateCategorySummary(summary: TokenSummary[]): string {
    const categories = new Map<string, number>();
    
    summary.forEach(item => {
      const category = item.element || 'General';
      categories.set(category, (categories.get(category) || 0) + item.count);
    });
    
    return Array.from(categories.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([category, total]) => `
        <div class="category-item">
            <span class="category-name">${category}</span>
            <span class="category-count">${total}</span>
        </div>
    `).join('');
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

  private static escapeHTML(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
}