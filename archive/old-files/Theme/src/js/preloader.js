/* -------------------------------------------------------------------------- */
/*                                  Preloader                                 */
/* -------------------------------------------------------------------------- */

const preloaderInit = () => {
  const bodyElement = document.querySelector("body");
  window.imagesLoaded(bodyElement, () => {
    const preloader = document.querySelector("[data-preloader]");
    preloader?.classList.add("loaded");
    setTimeout(() => {
      preloader?.remove();
    }, 900);
  });
};

export default preloaderInit;
