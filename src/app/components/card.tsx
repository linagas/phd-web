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
          : "flex flex-col sm:flex-row items-center"
      } ${className}`}
    >
      {iconPosition === "left" && (
        //hidde card icon if is mobile
        <div className="hidden sm:flex items-center justify-center w-full sm:w-1/3 mb-4 sm:mb-0">
          {icon}
        </div>
      )}
      {iconPosition === "top" && (
        <div className="flex items-center justify-center mb-4 hidden">
          {icon}
        </div>
      )}
      <div
        className={`${
          iconPosition === "top" || iconPosition === "bottom"
            ? "text-center"
            : "w-full sm:w-2/3"
        } ${iconPosition === "right" ? "order-first" : ""}`}
      >
        <h3 className="text-m md:text-lg  sm:text-xl lg:text-xl font-semibold text-pink-500">
          {title}
        </h3>
        <p className="mt-4 text-s md:text-m text-gray-700 text-left">
          {description}
        </p>
      </div>
      {iconPosition === "right" && (
        <div className="flex items-center justify-center w-full sm:w-1/3 mt-4 sm:mt-0">
          {icon}
        </div>
      )}
      {iconPosition === "bottom" && (
        <div className="flex items-center justify-center mt-4">{icon}</div>
      )}
    </div>
  );
};

export default Card;
