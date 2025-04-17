import Link from "next/link";
import React from "react";

interface CardProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  iconPosition?: "left" | "right" | "top" | "bottom";
  className?: string;
  textAction?: string;
  actionClass?: string;
  width?: string;
  height?: string;
  rounded?: string;
}

const Card: React.FC<CardProps> = ({
  icon,
  title,
  description,
  iconPosition = "top",
  className = "",
  textAction = "",
  actionClass = "",
  width = "",
  height = "",
  rounded = "rounded-[55px]",
}) => {
  return (
    <div
      className={`bg-white p-6 shadow-lg ${rounded} ${width} ${height} ${
        iconPosition === "top" || iconPosition === "bottom"
          ? "flex flex-col items-center"
          : "flex flex-col sm:flex-row items-center"
      } ${className}`}
    >
      {iconPosition === "left" && (
        //hidde card icon if is mobile
        <div className="hidden sm:flex items-center justify-center w-full sm:w-1/5 mb-4 sm:mb-0">
          {icon}
        </div>
      )}
      {iconPosition === "top" &&  (
        <div className="flex items-center justify-center mb-4">{icon}</div>
      )}
      <div
        className={`${
          iconPosition === "top" || iconPosition === "bottom"
            ? "text-center"
            : "w-full sm:w-2/3"
        } ${iconPosition === "right" ? "order-first" : ""}`}
      >
        <h3 className="text-m md:text-lg  sm:text-xl lg:text-xl font-semibold ">
          {title}
        </h3>
        <p className="mb-2 text-s md:text-m text-gray-700 text-left">
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
      {textAction && (
        <div className="flex items-center justify-center ">
          <Link
            className={`mt-8 inline-flex self-center md:self-left text-white items-center justify-center rounded-[32px] px-4 py-2 text-xl font-medium text-primary-foreground shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${actionClass}`}
            href="#"
            prefetch={false}
          >
            {textAction}
          </Link>
        </div>
      )}
    </div>
  );
};

export default Card;
