"useClient";
import Link from "next/link";

export default function Home() {
  const robotSvg = "/assets/robot.svg";
  return (
    <main className="min-h-screen grid justify-items-stretch py-20">
      <div className="justify-self-end pt-4 pr-8">
        <div className={`w-[64px] h-[64px] rounded-full bg-pink-400`} />
      </div>
      <section
        className="flex flex-col md:flex-row gap-x-4"
        style={{ backgroundImage: `url('/assets/background-blue.svg')` }}
      >
        <div>
          <h1 className=" text-left text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-blue-1 font-bold tracking-tight">
            Transformamos la calidad de tu software
          </h1>
          <p className="text-left text-muted-foreground mt-4 max-w-md">
            Nuestros servicios de aseguramiento de calidad te ayudan a entregar
            software confiable y de alto rendimientoNuestros servicios de
            aseguramiento de calidad te ayudan a entregar software confiable y
            de alto rendimiento
          </p>
          <Link className="mt-8 bg-pink-400" href={""}>
            Ver m&aacute;s
          </Link>
        </div>
        <div>
          <img
            src={robotSvg}
            width={600}
            height={400}
            alt="Software Quality Services"
            className="rounded-lg"
            style={{
              aspectRatio: "600/400",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
            }}
          />
        </div>
      </section>
    </main>
  );
}
