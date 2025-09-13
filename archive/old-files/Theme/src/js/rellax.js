/* -------------------------------------------------------------------------- 
|                                 Rellax js                                 
/* -------------------------------------------------------------------------- */

const rellaxInit = () => {
  return window.Rellax && new window.Rellax("[data-parallax]", { speed: -3 });
};

export default rellaxInit;
