using System;

class ArrayOperations
{
    static void Main()
    {
        int[] numeros = { 1, 2, 3, 4, 5 };
        string[] nombres = new string[3];
        
        nombres[0] = "Ana";
        nombres[1] = "Luis";
        nombres[2] = "Maria";
        
        // Sumar elementos del array
        int suma = 0;
        foreach (int num in numeros)
        {
            suma += num;
        }
        
        Console.WriteLine("Suma total: " + suma);
        Console.WriteLine("Promedio: " + (suma / numeros.Length));
        
        // Buscar elemento
        bool encontrado = false;
        for (int i = 0; i < nombres.Length; i++)
        {
            if (nombres[i] == "Luis")
            {
                encontrado = true;
                break;
            }
        }
        
        Console.WriteLine("¿Luis encontrado? " + encontrado);
    }
}