const buttons = document.querySelectorAll("[data-refresh] > a");

buttons.forEach((button) => {
  const delay = button.closest("[data-refresh]").getAttribute("data-refresh");
  const target = button.closest("[data-target]").getAttribute("data-target");

  button.addEventListener("click", (e) => {
    const loader = button.parentElement.querySelector(".svg-loader");
    if (loader) {
      loader.classList.remove("is-hidden-onload");
    }
    e.preventDefault();
    const url = button.href + target;

    fetch(url)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (loader) {
          loader.classList.add("is-hidden-onload");
        }
      });
    setTimeout(() => {
      window.location.reload();
    }, delay);
  });
});
