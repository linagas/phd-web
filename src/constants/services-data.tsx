import Image from "next/image";

export interface ServiceData {
  icon: JSX.Element;
  title: string;
  description: string | JSX.Element;
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
      "Entregamos servicios de testing según tus necesidades, con soluciones innovadoras en pruebas funcionales y no funcionales, garantizando una experiencia óptima para los usuarios.",
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
    title: "Testing Inteligente con IA",
    description:
      (
        <>
          Impulsamos la productividad de los equipos de Testing mediante IA aplicada:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Automatización</li>
            <li>Priorización inteligente de pruebas</li>
            <li>Mayor cobertura</li>
            <li>Entrega de valor</li>
          </ul>
        </>
      ),
  },
];
