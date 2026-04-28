const buttons = Array.from(document.querySelectorAll("[data-target]"));
const screens = Array.from(document.querySelectorAll(".screen"));
const motionTargets = Array.from(document.querySelectorAll(".note-card, .quiet-card, .quiet-section"));
const tiltTargets = Array.from(document.querySelectorAll(".postcard-photo-wrap, .quiet-photo-frame"));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.documentElement.classList.add("is-ready");

const activateScreen = (target) => {
  buttons.forEach((item) => {
    const selected = item.dataset.target === target;
    item.setAttribute("aria-selected", String(selected));
  });

  screens.forEach((screen) => {
    screen.classList.toggle("is-active", screen.id === target);
  });

  document.body.dataset.variant = target;
  window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
};

buttons.forEach((button, index) => {
  button.setAttribute("aria-controls", button.dataset.target);

  button.addEventListener("click", () => {
    activateScreen(button.dataset.target);
  });

  button.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();

    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? buttons.length - 1
          : (index + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length;

    buttons[nextIndex].focus();
    activateScreen(buttons[nextIndex].dataset.target);
  });
});

if ("IntersectionObserver" in window && !reduceMotion) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.16 },
  );

  motionTargets.forEach((target, index) => {
    target.classList.add("motion-observed");
    target.style.transitionDelay = `${Math.min(index * 45, 180)}ms`;
    observer.observe(target);
  });
} else {
  motionTargets.forEach((target) => target.classList.add("is-visible"));
}

tiltTargets.forEach((target) => {
  target.addEventListener("pointermove", (event) => {
    if (reduceMotion) return;

    const rect = target.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    target.style.setProperty("--tilt-x", `${x * 2.8}deg`);
    target.style.setProperty("--tilt-y", `${y * -2.8}deg`);
    target.style.setProperty("--photo-x", `${x * -10}px`);
    target.style.setProperty("--photo-y", `${y * -8}px`);
  });

  target.addEventListener("pointerleave", () => {
    target.style.setProperty("--tilt-x", "0deg");
    target.style.setProperty("--tilt-y", "0deg");
    target.style.setProperty("--photo-x", "0px");
    target.style.setProperty("--photo-y", "0px");
  });
});
