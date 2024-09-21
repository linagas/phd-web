"useClient";
import Contact from "@/app/components/contact/page";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const robotSvg = "/assets/robot.svg";
  return (
    <main className="min-h-screen  grid">
      <div className="relative pt-20 justify-items-stretch">
        <div className="flex h-16 sm:h-20">
          <div className="flex-none w-14 "></div>
          <div className="flex-1 flex-col pt-14">
            <h1 className=" text-left text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-blue-1 font-bold tracking-tight">
              Transformamos la calidad de tu software
            </h1>
            <p className=" text-left  mt-4 max-w-md">
              Nuestros servicios de aseguramiento de calidad te ayudan a
              entregar software confiable y de alto rendimiento. Nuestros
              servicios de aseguramiento de calidad te ayudan a entregar
              software confiable y de alto rendimiento
            </p>
            <Link
              className="inline-flex h-7 w-32 mt-10 text-white items-center justify-center rounded-[4px] bg-pink-400 px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors  focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              href={""}
            >
              Ver m&aacute;s
            </Link>
          </div>
          <div className="flex-1">
            <Image
              src={robotSvg}
              width={600}
              height={400}
              alt="Software Quality Services"
              className="rounded-lg"
              style={{
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                backgroundPosition: "bottom",
              }}
            />
          </div>
          <div className="flex-none w-20 pt-4 pr-8">
            {/* punto fucsia */}
            <div className="justify-self-end ">
              <div className={`w-[64px] h-[64px] rounded-full bg-pink-400`} />
            </div>
          </div>
        </div>
        <div
          className="flex"
          style={{
            backgroundImage: `url('/assets/background-blue.svg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: "140vh",
            zIndex: -1,
          }}
        >
          <Services />
        </div>
      </div>

      <HowWeDoIt />
      <ConsultingInfo />
      <Contact />
    </main>
  );
}

function ConsultingInfo() {
  return (
    <section
      className="flex justify-between py-14"
      style={{
        backgroundImage: `url('/assets/background-pink.svg')`,
        backgroundSize: "cover",
        zIndex: -1,
      }}
    >
      <article className="flex-1  flex justify-center pl-16 ">
        <Image
          src={"/assets/consulting-info.svg"}
          width={530}
          height={530}
          alt="Software Quality Services"
          className="rounded-lg"
          style={{
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "bottom",
          }}
        />
      </article>
      <article className="flex-1 pl-16">
        <div className="w-auto">
          <h1 className="text-5xl text-left font-bold text-white pt-20">
            Titulo 3 (por definir)
          </h1>
          <p className="text-white py-3 text-left text-balance">
            Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
            nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
            volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
            ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo
            consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate
            velit esse molestie consequat, vel illum dolore eu feugiat nulla
            facilisis at vero eros et accumsan et iusto odio dignissim qui
          </p>
          <Link
            href={""}
            className="inline-flex h-7 w-32 text-white items-center justify-center rounded-[4px] bg-blue-1 px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors  focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            Ver m&aacute;s
          </Link>
        </div>
      </article>
    </section>
  );
}

function HowWeDoIt() {
  return (
    <section className="flex justify-between py-14">
      <article className="flex-1 pl-36">
        <div className="w-auto">
          <h1 className="text-5xl text-left font-bold text-purple-12 pt-20">
            Cómo lo Hacemos
          </h1>
          <p className=" py-3 text-left text-balance">
            Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
            nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
            volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
            ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo
            consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate
            velit esse molestie consequat, vel illum dolore eu feugiat nulla
            facilisis at vero eros et accumsan et iusto odio dignissim qui
          </p>
          <Link
            href={""}
            className="inline-flex h-7 w-32 text-white items-center justify-center rounded-[4px] bg-purple-12 px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors  focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            Ver m&aacute;s
          </Link>
        </div>
      </article>
      <article className="flex-1  flex justify-center pl-16 ">
        <Image
          src={"/assets/svg-como-lo-hacemos.svg"}
          width={530}
          height={520}
          alt="Software Quality Services"
          className="rounded-lg"
          style={{
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "bottom",
          }}
        />
      </article>
    </section>
  );
}

const services = [
  {
    title: "SDLC Consulting",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    title: "Software Testing",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    title: "Third Services",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
];

function Services() {
  return (
    <section className="py-16 pt-30-percent w-full">
      <h2 className="pl-28 text-5xl text-center font-bold text-white pt-20">
        What We Do
      </h2>
      <div className="pl-28 mt-10 flex justify-around">
        {services.map((service, index) => (
          <div
            key={index}
            className="bg-white rounded-[55px] p-6 shadow-lg w-80 text-center"
          >
            <h3 className="text-xl font-semibold text-pink-500">
              {service.title}
            </h3>
            <p className="mt-4 text-gray-700">{service.description}</p>
          </div>
        ))}
      </div>
      <div className="py-20 pl-8 flex  justify-start md:flex-row gap-x-4 pr-8">
        <div className="justify-self-end pt-4 pr-8">
          <div className={`w-[52px] h-[52px] rounded-full bg-white`} />
        </div>
      </div>
    </section>
  );
}
