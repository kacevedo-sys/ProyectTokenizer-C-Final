using System

class ClaseConErroresMixtos  // ERROR: Falta punto y coma después de using
{
    // ERROR: Palabra reservada mal escrita
    publc string Nombre = "Test";
    
    static void Main()
    {
        // ERROR: Número con formato inválido
        double valor = 123.45.67.89;
        
        // ERROR: Operador de asignación incorrecto
        int x == 10;
        
        // ERROR: String con escape inválido
        string path = "C:\nueva\ruta\archivo.cs";
        
        // ERROR: Carácter no válido
        int @special = 10000;
        
        // ERROR: Método sin paréntesis
        Console.WriteLine "Hola mundo";
        
        // ERROR: Falta operando
        int calculo = 15 * ;
    }
    
    // ERROR: Método sin cuerpo completo
    void MetodoIncompleto(
}