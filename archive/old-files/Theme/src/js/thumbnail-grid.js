import utils from "./utils";
/*-----------------------------------------------
|  Thumbnail Grid
-----------------------------------------------*/
const initNavBtns = (grid) => {
  const navBtns = grid.querySelectorAll("[data-thumbnail-grid-nav]");
  navBtns.forEach((navBtn) => {
    const target = utils.getData(navBtn, "grid-target");
    if (target === "#!") {
      navBtn.classList.add("disabled");
    }
    navBtn.addEventListener("click", () => {
      if (target !== "#!") {
        window.bootstrap.Collapse.getOrCreateInstance(target).show();
      }
    });
  });
};

const initCloseBtn = (content) => {
  const closeBtn = content.querySelector(".thumbnail-close");

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      window.bootstrap.Collapse.getOrCreateInstance(content).hide();
    });
  }
};

const thumbnailgridInit = () => {
  const thumbnailGridContainer = document.querySelectorAll(
    ".thumbnail-grid-container"
  );

  if (thumbnailGridContainer.length) {
    thumbnailGridContainer.forEach((thumbnailGrid) => {
      const thumbnailGridContents = thumbnailGrid.querySelectorAll(
        ".thumbnail-grid-content"
      );
      initNavBtns(thumbnailGrid);

      thumbnailGridContents.forEach((content) => {
        const gridderItem = content.closest(".thumbnail-grid-item");
        initCloseBtn(content);

        content.addEventListener("show.bs.collapse", () => {
          const marginBottom = window.getComputedStyle(content).height;
          gridderItem.style.marginBottom = marginBottom;
          gridderItem.style.zIndex = 11;
          setTimeout(() => {
            thumbnailGrid.classList.add("hasOpenItems");
          }, 1);
        });

        content.addEventListener("hide.bs.collapse", () => {
          gridderItem.style.marginBottom = "unset";
          gridderItem.style.zIndex = 10;
          thumbnailGrid.classList.remove("hasOpenItems");
        });
      });

      window.addEventListener("resize", () => {
        const collapse = thumbnailGrid.querySelector(".collapse.show");
        if (collapse) {
          const gridderItem = collapse.closest(".thumbnail-grid-item");
          gridderItem.style.marginBottom =
            window.getComputedStyle(collapse).height;
        }
      });
    });
  }
};

export default thumbnailgridInit;
