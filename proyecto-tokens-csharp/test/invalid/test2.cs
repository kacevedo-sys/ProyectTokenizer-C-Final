class ErroresOperadores
{
    static void Main()
    {
        int x = 10
        int y = 20  // ERROR: Falta punto y coma
        
        // ERROR: Operador no válido
        int resultado = x ** y;
        
        // ERROR: Expresión incompleta
        int z = 5 + ;
        
        // ERROR: Paréntesis no balanceados
        if (x > 5 && (y < 30 || z == 15)
        {
            Console.WriteLine("Dentro del if");
        }
        
        // ERROR: Llave sin cerrar
        for (int i = 0; i < 10; i++
        {
            Console.WriteLine(i);
        }
    }
}  // El archivo termina aquí pero falta llave de cierre