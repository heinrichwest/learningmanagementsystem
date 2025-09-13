/* -------------------------------------------------------------------------- */
/*                                 bigPicture                                 */
/* -------------------------------------------------------------------------- */
import utils from "./utils";

const bigPictureInit = () => {
  if (window.BigPicture) {
    const bpItems = document.querySelectorAll("[data-bigpicture]");
    bpItems.forEach((bpItem) => {
      const userOptions = utils.getData(bpItem, "bigpicture");
      const defaultOptions = {
        el: bpItem,
        noLoader: true,
        allowfullscreen: true,
      };
      const options = window._.merge(defaultOptions, userOptions);

      bpItem.addEventListener("click", () => {
        window.BigPicture(options);
      });

      //  style
      if (
        userOptions.imgSrc &&
        !bpItem.classList.value
          .split(" ")
          .filter((className) => className.indexOf("btn") === 0)[0]
      ) {
        const styleCursorElement = bpItem;
        styleCursorElement.style.cursor = "zoom-in";
      }
    });
  }
};

export default bigPictureInit;
