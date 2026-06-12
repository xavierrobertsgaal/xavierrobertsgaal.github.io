// Tag filtering for the publications list. No-op on pages without .filter buttons.
document.addEventListener("click", (event) => {
  const button = event.target.closest(".filter");
  if (!button) return;
  document.querySelectorAll(".filter").forEach((b) => {
    b.classList.toggle("active", b === button);
  });
  const tag = button.dataset.tag;
  document.querySelectorAll("main ul").forEach((list) => {
    let visible = 0;
    list.querySelectorAll("li").forEach((item) => {
      const hide = tag !== "all" && !item.querySelector(".tag-" + tag);
      item.hidden = hide;
      if (!hide) visible += 1;
    });
    list.hidden = visible === 0;
    const heading = list.previousElementSibling;
    if (heading && heading.tagName === "H2") heading.hidden = visible === 0;
  });
});
