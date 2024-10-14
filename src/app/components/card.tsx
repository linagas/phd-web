import React from "react";

interface CardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconPosition?: "left" | "right" | "top" | "bottom";
  className?: string;
}

const Card: React.FC<CardProps> = ({
  icon,
  title,
  description,
  iconPosition = "top",
  className = "",
}) => {
  return (
    <div
      className={`bg-white rounded-[55px] p-6 shadow-lg ${
        iconPosition === "top" || iconPosition === "bottom"
          ? "flex flex-col items-center"
          : "flex"
      } ${className}`}
    >
      {iconPosition === "left" && (
        <div className="flex items-center justify-center w-1/3">{icon}</div>
      )}
      {iconPosition === "top" && (
        <div className="flex items-center justify-center mb-4">{icon}</div>
      )}
      <div
        className={`${
          iconPosition === "top" || iconPosition === "bottom"
            ? "text-center"
            : "w-2/3 pl-4"
        } ${iconPosition === "right" ? "order-first" : ""}`}
      >
        <h3 className="text-xl font-semibold text-pink-500">{title}</h3>
        <p className="mt-4 text-gray-700 text-left">{description}</p>
      </div>
      {iconPosition === "right" && (
        <div className="flex items-center justify-center w-1/3">{icon}</div>
      )}
      {iconPosition === "bottom" && (
        <div className="flex items-center justify-center mt-4">{icon}</div>
      )}
    </div>
  );
};

export default Card;
