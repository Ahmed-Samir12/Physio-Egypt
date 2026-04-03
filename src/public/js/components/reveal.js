function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-in'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  els.forEach((el, i) => {
    if (!el.style.getPropertyValue('--d')) el.style.setProperty('--d', `${Math.min(360, i * 45)}ms`);
    io.observe(el);
  });
}

export { initReveal };

