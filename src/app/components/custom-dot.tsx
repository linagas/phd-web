import React from "react";

interface CustomDotProps {
  baseSize?: string; // Tamaño base (clase de Tailwind)
  lgSize?: string; // Tamaño grande (clase de Tailwind para pantallas lg)
  color?: string; // Clase de color de fondo (Tailwind)
  className?: string; // Clases adicionales
}

const CustomDot: React.FC<CustomDotProps> = ({
  baseSize = "w-[34px] h-[34px]",
  lgSize = "lg:w-[56px] lg:h-[56px]",
  color = "bg-pink-400",
  className = "",
}) => {
  return (
    <div className={`justify-self-end ${className}`} aria-hidden="true">
      <div className={`rounded-full ${baseSize} ${lgSize} ${color}`} />
    </div>
  );
};

export default CustomDot;
