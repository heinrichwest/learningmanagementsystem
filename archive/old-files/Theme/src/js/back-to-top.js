/*-----------------------------------------------
|   ScrollTotop
-----------------------------------------------*/
const BackToTopInit = () => {
  const backToTopEl = document.querySelector(".btn-back-to-top");

  if (backToTopEl) {
    backToTopEl.style.opacity = 0;
    window.addEventListener("scroll", () => {
      if (backToTopEl.offsetTop + window.scrollY < window.innerHeight) {
        backToTopEl.style.opacity = 0;
      } else {
        backToTopEl.style.opacity = 1;
      }
    });
  }
};
export default BackToTopInit;
