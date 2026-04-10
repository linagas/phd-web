const useScrollToSection = (sectionId: string, offset = 0) => {
  const scrollToSection = () => {
    const element = document.getElementById(sectionId);
    if (element) {
      const y =
        element.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // sectionRef mantenido para compatibilidad; el elemento ya tiene id en JSX
  const sectionRef = (_node: HTMLElement | null) => {};

  return { sectionRef, scrollToSection };
};

export default useScrollToSection;
