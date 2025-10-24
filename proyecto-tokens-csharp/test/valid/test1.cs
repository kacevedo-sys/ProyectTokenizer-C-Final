using System;

class Program
{
    static void Main()
    {
        // Variables básicas
        string nombre = "Juan";
        int edad = 25;
        double salario = 1500.75;
        bool activo = true;
        // Operaciones aritméticas
        int suma = 10 + 5;
        double total = salario * 1.21;

        // Estructuras de control
        if (edad >= 18 && activo)
        {
            Console.WriteLine(nombre + " es mayor de edad");
        }
        

        
        for (int i = 0; i < 5; i++)
        {
            Console.WriteLine("Iteración: " + i);
        }
        
        // Llamada a método
        int resultado = Calcular(10, 20);
        Console.WriteLine("Resultado: " + resultado);
    }
    
    static int Calcular(int a, int b)
    {
        return (a + b) * 2;
    }
}