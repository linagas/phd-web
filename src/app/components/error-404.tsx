import React from "react";
import Link from "next/link";
import Image from "next/image";

interface Error404Props {
  showBackButton?: boolean;
}

const Error404: React.FC<Error404Props> = ({ showBackButton = true }) => {
  return (
    <div className="relative min-h-screen bg-white flex items-center justify-center overflow-hidden">
      {/* Decorative top-left corner blocks */}
      <div className="absolute top-16 sm:top-20 left-0 flex">
        <div className="w-[110px] h-[56px] bg-pink-400" />
        <div className="w-[110px] h-[56px] bg-blue-400" />
        <div className="w-[110px] h-[56px] bg-[#B8D9EE]" />
      </div>

      {/* Decorative bottom-right corner blocks */}
      <div className="absolute bottom-0 right-0 flex">
        <div className="w-[110px] h-[56px] bg-[#E8EBED]" />
        <div className="w-[110px] h-[56px] bg-blue-2" />
        <div className="w-[110px] h-[56px] bg-purple-400" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 px-4">
        {/* Left text */}
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-normal text-blue-2 text-center md:text-right">
          Oops! Pagina no Encontrada
        </h2>

        {/* Center PHD flag icon */}
        <div className="relative flex items-center justify-center">
          <Image
            src="/assets/phd-not-found.svg"
            alt="PHD Not Found"
            width={300}
            height={300}
            className="w-64 md:w-80 lg:w-96"
          />
        </div>

        {/* Right text with dot */}
        <div className="flex items-center gap-3">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-blue-2">
            Error 404
          </h1>
          <div className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 rounded-full bg-purple-400" />
        </div>
      </div>

      {/* Optional back button */}
      {showBackButton && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-blue-1 px-8 py-3 text-lg font-medium text-white shadow-lg transition-colors hover:bg-blue-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-1"
          >
            Volver al Inicio
          </Link>
        </div>
      )}
    </div>
  );
};

export default Error404;
