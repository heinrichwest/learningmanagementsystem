/* eslint-disable*/
/* -------------------------------------------------------------------------- */
/*                                Universal contact form ajax submission                                  */
/* -------------------------------------------------------------------------- */
const formInit = () => {
  const zforms = document.querySelectorAll("[data-form]");

  if (zforms.length) {
    zforms.forEach((form) => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const feedbackEl = form.querySelector(".feedback");
        const formData = {};
        Array.from(form.elements).forEach((el) => {
          if (el.type !== "submit") {
            formData[el.name] = el.value;
          }
        });

        window.Email.send({
          Host: "smtp.mailtrap.io",
          Username: "Your User Name ",
          Password: "Your Password",
          To: formData.email,
          From: "you@isp.com",
          Subject: "This is the subject",
          Body: `
            <p>${formData.name}</p>
            <p>${formData.message}</p>
          `,
        })
          .then((message) => {
            feedbackEl.innerHTML = `<div class="alert alert-success alert-dismissible" role="alert">
            <button type="button" class="btn-close fs--1" data-bs-dismiss="alert" aria-label="Close"></button>
            Your message has been sent successfully.
          </div>`;
          })
          .catch((error) => {
            feedbackEl.innerHTML = `<div class="alert alert-danger alert-dismissible" role="alert">
          <button type="button" class="btn-close fs--1" data-bs-dismiss="alert" aria-label="Close"></button>
          Your message not sent.
        </div>`;
          });
      });
    });
  }
};

export default formInit;
