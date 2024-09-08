import React from "react";

export default function Contact() {
  return (
    <section className="flex py-16 justify-start">
      <article className="pl-16  w-2/3">
        <h2 className="text-4xl text-left font-bold text-blue-2">
          Contáctanos
        </h2>
        <p
          className="text-left text-gray-700 mt-4"
          style={{ color: "#21323F", letterSpacing: "0px", opacity: 1 }}
        >
          Estamos aqui para ayudarte a mejorar la calidad de tu software llena
          el formulario y nos pondremos en contacto contigo.
        </p>
        <form className="mt-8 w-full flex flex-col items-end">
          <input
            type="text"
            placeholder="Ingresa tu nombre"
            className="w-full mb-4 p-4 rounded-[12px] border border-gray-300"
          />

          <input
            type="email"
            placeholder="Ingresa tu correo"
            className="w-full mb-4 p-4 rounded-[12px] border border-gray-300"
          />
          <textarea
            placeholder="Ingresa tu mensaje"
            className="w-full mb-4 p-4 rounded-[12px] border border-gray-300"
          ></textarea>
          <button
            className="justify-self-end h-9 w-32 bg-blue-1 text-white py-2 px-8 rounded-[4px]"
            type="submit"
          >
            Enviar
          </button>
        </form>
      </article>
      <article className="flex items-center  w-2/3">
        <div className="relative w-full max-w-[350px] mx-auto rounded-full overflow-hidden aspect-square">
          <video className="w-full h-full object-cover">
            <source
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
              type="video/mp4"
            />
          </video>
        </div>
      </article>
    </section>
  );
}
