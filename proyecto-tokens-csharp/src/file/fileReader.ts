import * as fs from 'fs';
import * as path from 'path';

export class FileReader {
  public static readFile(filePath: string): string {
    const absolutePath = path.resolve(process.cwd(), filePath);
    
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`El archivo no existe: ${absolutePath}`);
    }

    return fs.readFileSync(absolutePath, 'utf-8');
  }

  public static validateCSharpFile(filePath: string): boolean {
    return filePath.toLowerCase().endsWith('.cs');
  }
}