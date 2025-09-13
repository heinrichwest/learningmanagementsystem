// import utils from "./utils";
/*-----------------------------------------------
|   Top navigation opacity on scroll
-----------------------------------------------*/
const navbarInit = () => {
  const navbar = document.querySelector("[data-navbar-on-scroll]");
  const headerOverlay = document.querySelector(".header-overlay");
  const headerIndicator = document.querySelector(".header-indicator-down");
  const headerText = document.querySelector(".header-text");
  if (navbar) {
    const windowHeight = window.innerHeight;
    const handleAlpha = () => {
      const scrollTop = window.pageYOffset;
      let alpha = (scrollTop / windowHeight) * 2;
      let beta = scrollTop / windowHeight;
      alpha >= 1 && (alpha = 1);
      navbar.style.backgroundColor = `rgba(0, 0, 0, ${alpha})`;
      headerOverlay.style.backgroundColor = `rgba(0, 0, 0, ${alpha})`;
      navbar.style.borderColor = `rgba(255, 255, 255, ${0.15 - alpha})`;
      // Reduce header content opacity on scroll
      alpha >= 1 && (alpha = 1);
      if (headerIndicator) {
        headerIndicator.style.opacity = 1 - beta;
        headerText.style.opacity = 1 - beta;
      }
    };
    handleAlpha();
    document.addEventListener("scroll", () => handleAlpha());

    // Top navigation background toggle on mobile
    navbar.addEventListener("show.bs.collapse", (e) => {
      e.currentTarget.classList.toggle("bg-dark");
    });
    navbar.addEventListener("hide.bs.collapse", (e) => {
      e.currentTarget.classList.toggle("bg-dark");
    });
  }
};
export default navbarInit;
