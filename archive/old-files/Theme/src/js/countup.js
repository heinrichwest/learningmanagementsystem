import utils from "./utils";
/* -------------------------------------------------------------------------- */
/*                                  Count Up                                  */
/* -------------------------------------------------------------------------- */
const countupInit = () => {
  if (window.countUp) {
    const countups = document.querySelectorAll("[data-countup]");
    if (countups.length) {
      countups.forEach((node) => {
        const { endValue, ...options } = utils.getData(node, "countup");

        let countUpTriggered = false;
        window.addEventListener("scroll", () => {
          if (utils.isScrolledIntoView(node).partial) {
            if (!countUpTriggered) {
              const countUp = new window.countUp.CountUp(node, endValue, {
                duration: 5,
                ...options,
              });
              countUp.start();
              countUpTriggered = true;
            }
          }
        });
      });
    }
  }
};
export default countupInit;
