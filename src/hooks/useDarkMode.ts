import { useState, useEffect } from "react";

// Interface Segregation Principle (ISP): Mantenemos la interfaz simple y segregada.
interface UseDarkMode {
  isDarkMode: boolean;
}

export const useDarkMode = (): UseDarkMode => {
  // Single Responsibility Principle (SRP): Este hook se encarga solo de detectar el modo nocturno.
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const matchDark = window.matchMedia("(prefers-color-scheme: dark)");

    // Dependency Inversion Principle (DIP): Dependemos de una abstracción (matchMedia API) en lugar de una implementación concreta.
    const handleChange = () => {
      setIsDarkMode(matchDark.matches);
    };

    handleChange(); // Set initial value
    matchDark.addEventListener("change", handleChange);

    // Open/Closed Principle (OCP): Podemos extender la funcionalidad sin modificar el hook, simplemente añadiendo más lógica.
    return () => {
      matchDark.removeEventListener("change", handleChange);
    };
  }, []);

  return { isDarkMode };
};
