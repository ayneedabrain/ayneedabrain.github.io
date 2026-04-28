const motionTargets = Array.from(document.querySelectorAll(".note-card"));
const tiltTargets = Array.from(document.querySelectorAll(".postcard-photo-wrap"));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.documentElement.classList.add("is-ready");

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
