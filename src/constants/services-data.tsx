import Image from "next/image";

export interface ServiceData {
  icon: JSX.Element;
  title: string;
  description: string;
}

export const SERVICES_DATA: ServiceData[] = [
  {
    icon: (
      <Image
        src="/assets/sdlc-consulting.svg"
        width={92}
        height={92}
        alt="Consultoría de SDLC"
      />
    ),
    title: "Consultoría de SDLC",
    description:
      "Transforma tu SDLC con un enfoque ágil y eficiente. Nuestra consultoría te guía para optimizar procesos y asegurar la entrega continua de software de calidad.",
  },
  {
    icon: (
      <Image
        src="/assets/software-testing.svg"
        width={92}
        height={92}
        alt="Servicio de Testing"
      />
    ),
    title: "Servicio de Testing",
    description:
      "Diseñamos servicios de testing según tus necesidades, con soluciones innovadoras en pruebas funcionales y no funcionales, garantizando una experiencia óptima para los usuarios.",
  },
  {
    icon: (
      <Image
        src="/assets/third-services.svg"
        width={92}
        height={92}
        alt="Agile Testing"
      />
    ),
    title: "Agile Testing",
    description:
      "Lleva tu Agile Testing al siguiente nivel. Evolucionamos tus métodos de prueba para adaptarlos a un entorno ágil y cambiante, asegurando una entrega continua de valor.",
  },
];
