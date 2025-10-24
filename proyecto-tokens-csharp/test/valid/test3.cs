using System;

class Calculator
{
    public static double CalcularIMC(double peso, double altura)
    {
        if (altura <= 0)
        {
            throw new ArgumentException("La altura debe ser mayor a cero");
        }
        
        return peso / (altura * altura);
    }
    
    public static string ClasificarIMC(double imc)
    {
        if (imc < 18.5)
        {
            return "Bajo peso";
        }
        else if (imc >= 18.5 && imc < 25)
        {
            return "Peso normal";
        }
        else if (imc >= 25 && imc < 30)
        {
            return "Sobrepeso";
        }
        else
        {
            return "Obesidad";
        }
    }
}

class Program
{
    static void Main()
    {
        double peso = 70.5;
        double altura = 1.75;
        
        double imc = Calculator.CalcularIMC(peso, altura);
        string clasificacion = Calculator.ClasificarIMC(imc);
        
        Console.WriteLine($"Peso: {peso} kg");
        Console.WriteLine($"Altura: {altura} m");
        Console.WriteLine($"IMC: {imc:F2}");
        Console.WriteLine($"Clasificación: {clasificacion}");
        
        // Probar con diferentes valores
        double[] pesos = { 60.0, 80.0, 90.0 };
        foreach (double p in pesos)
        {
            double imcTemp = Calculator.CalcularIMC(p, altura);
            Console.WriteLine($"Peso {p} kg -> IMC: {imcTemp:F2}");
        }
    }
}