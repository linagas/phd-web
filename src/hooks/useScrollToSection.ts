import { useRef } from "react";

const useScrollToSection = (sectionId: string, offset = 0) => {
  const sectionRef = useRef<HTMLElement | null>(null);

  const scrollToSection = () => {
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = offset;
      const y =
        element.getBoundingClientRect().top + window.pageYOffset - yOffset;

      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return { sectionRef, scrollToSection };
};
export default useScrollToSection;
