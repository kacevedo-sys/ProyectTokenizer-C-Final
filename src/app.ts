import { CSharpTokenizer } from './lexer/tokenizer';
import { FileReader } from './file/fileReader';
import { ReportGenerator } from './report/reportGenerator';
import { TerminalColorizer } from './color/terminalColor';
import { HTMLReportGenerator } from './report/htmlReportGenerator';
import { JSONReportGenerator } from './report/jsonReportGenerator';
import { CSVReportGenerator } from './report/csvReportGenerator';

class LexicalColorizer {
  public static run(): void {
    try {
      console.clear();
      console.log('COLOREADOR LÉXICO C# - PROYECTO 2\n');
      
      // Mostrar leyenda de colores
      TerminalColorizer.displayColorLegend();
      
      const filePath = process.argv[2];
      if (!filePath) {
        console.log('\nUso: npm start <ruta-archivo.cs>');
        console.log('Ejemplo: npm start test/simple_test.cs');
        return;
      }

      if (!FileReader.validateCSharpFile(filePath)) {
        console.log('Error: El archivo debe tener extensión .cs');
        return;
      }

      console.log(`\nLeyendo archivo: ${filePath}`);
      const content = FileReader.readFile(filePath);
      
      console.log('Analizando código...\n');
      const tokenizer = new CSharpTokenizer(content);
      const result = tokenizer.tokenize();

      // Mostrar código coloreado
      TerminalColorizer.displayColoredCode(result.tokens);

      // Mostrar resultado de validación
      console.log('\n=== VALIDACIÓN LÉXICA ===');
      if (result.valid && !result.warnings) {
        console.log('EL ARCHIVO ES VÁLIDO LÉXICAMENTE');
      } else if (result.warnings) {
        console.log('ARCHIVO CON ADVERTENCIAS:');
        result.warnings.forEach(warning => console.log(`   ${warning}`));
      } else {
        console.log('ERROR LÉXICO ENCONTRADO:');
        console.log(`   Línea: ${result.error?.line}, Columna: ${result.error?.column}`);
        console.log(`   Token: '${result.error?.token}'`);
        console.log(`   Mensaje: ${result.error?.message}`);
        console.log('\nANÁLISIS DETENIDO - Primer error encontrado');
        return;
      }

      // Generar reporte del Proyecto 1
      console.log('\n=== REPORTE DE TOKENS ===');
      const summary = ReportGenerator.generateConsoleSummary(result.summary);
      console.log(summary);

      //  NUEVO: GENERAR TODOS LOS REPORTES MEJORADOS
      console.log('\n GENERANDO REPORTES MEJORADOS...');
      
      // 1. HTML (Principal - Recomendado)
      HTMLReportGenerator.generateHTMLReport(result.summary, result.tokens, filePath);
      
      // 2. JSON (Para análisis programático)
      JSONReportGenerator.generateJSONReport(result.summary, result.tokens);
      
      // 3. CSV (Para hojas de cálculo)
      CSVReportGenerator.generateCSVReport(result.summary);
      
      // 4. TXT (Legacy - mantener compatibilidad)
      ReportGenerator.generateSalidaTxt(result.summary, filePath);

      console.log('\n TODOS LOS REPORTES HAN SIDO GENERADOS:');
      console.log('    reporte_lexico.html (Visualización interactiva)');
      console.log('    analisis_lexico.json (Datos estructurados)');
      console.log('    reporte_tokens.csv (Para Excel/Sheets)');
      console.log('    Salida.txt (Formato legacy)');
      
      console.log('\n Proceso completado exitosamente!');

    } catch (error: any) {
      console.error(' Error en la aplicación:', error.message);
    }
  }
}

// Ejecutar aplicación
LexicalColorizer.run();