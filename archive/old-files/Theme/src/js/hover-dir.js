// import utils from "./utils";
/*-----------------------------------------------
|   Hover Dir 
-----------------------------------------------*/

const hoverDirInit = () => {
  const hoverdir = document.querySelectorAll(
    ".hoverdir-item > .hoverdir-item-content"
  );
  if (hoverdir.length) {
    window.hoverDir(hoverdir);
  }
};

export default hoverDirInit;
