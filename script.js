// Configura el número con código de país, solo dígitos (ej.: 5491123456789).
const WHATSAPP_PHONE = "";

const menuButton = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

menuButton?.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  mainNav?.classList.toggle("open", !isOpen);
});

mainNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuButton?.setAttribute("aria-expanded", "false");
    mainNav.classList.remove("open");
  });
});

document.querySelector("#year").textContent = new Date().getFullYear();

document.querySelectorAll("[data-carousel]").forEach((carousel) => {
  const viewport = carousel.querySelector(".carousel-viewport");
  const track = carousel.querySelector(".carousel-track");
  const dots = carousel.querySelector("[data-carousel-dots]");
  const previous = carousel.querySelector("[data-carousel-prev]");
  const next = carousel.querySelector("[data-carousel-next]");
  const originals = Array.from(track.children);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let position = 0;
  let visibleCount = 1;
  let timer;

  const setPosition = () => {
    const first = track.querySelector(".carousel-card");
    if (!first) return;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    const step = first.getBoundingClientRect().width + gap;
    track.style.transform = `translateX(${-position * step}px)`;
    dots.querySelectorAll(".carousel-dot").forEach((dot, index) => {
      dot.setAttribute("aria-current", String(index === position % originals.length));
    });
  };

  const buildDots = () => {
    dots.replaceChildren(...originals.map((_, index) => {
      const dot = document.createElement("button");
      dot.className = "carousel-dot";
      dot.type = "button";
      dot.setAttribute("aria-label", `Mostrar proyectos desde la tarjeta ${index + 1}`);
      dot.setAttribute("aria-current", String(index === 0));
      dot.addEventListener("click", () => {
        position = index;
        setPosition();
        restartTimer();
      });
      return dot;
    }));
  };

  const rebuildClones = () => {
    track.replaceChildren(...originals);
    const first = originals[0];
    const step = first.getBoundingClientRect().width + (parseFloat(getComputedStyle(track).gap) || 0);
    visibleCount = Math.max(1, Math.min(originals.length, Math.round(viewport.clientWidth / step)));
    originals.slice(0, visibleCount).forEach((card) => {
      const clone = card.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      clone.querySelectorAll("a, button").forEach((element) => element.setAttribute("tabindex", "-1"));
      track.append(clone);
    });
    position = 0;
    track.style.transition = "none";
    setPosition();
    requestAnimationFrame(() => { track.style.transition = ""; });
  };

  const restartTimer = () => {
    clearInterval(timer);
    if (!reducedMotion.matches && !document.hidden) timer = setInterval(advance, 4200);
  };

  const advance = () => {
    position += 1;
    setPosition();
    if (position === originals.length) {
      track.addEventListener("transitionend", () => {
        track.style.transition = "none";
        position = 0;
        setPosition();
        requestAnimationFrame(() => { track.style.transition = ""; });
      }, { once: true });
    }
  };

  previous.addEventListener("click", () => {
    if (position === 0) {
      track.style.transition = "none";
      position = originals.length;
      setPosition();
      track.getBoundingClientRect();
      track.style.transition = "";
    }
    position -= 1;
    setPosition();
    restartTimer();
  });

  next.addEventListener("click", () => { advance(); restartTimer(); });
  carousel.addEventListener("mouseenter", () => clearInterval(timer));
  carousel.addEventListener("mouseleave", restartTimer);
  carousel.addEventListener("focusin", () => clearInterval(timer));
  carousel.addEventListener("focusout", (event) => {
    if (!carousel.contains(event.relatedTarget) && !carousel.matches(":hover")) restartTimer();
  });
  document.addEventListener("visibilitychange", restartTimer);
  reducedMotion.addEventListener("change", restartTimer);
  window.addEventListener("resize", rebuildClones);

  buildDots();
  rebuildClones();
  restartTimer();
});

const themeButton = document.querySelector(".theme-toggle");
themeButton?.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark-theme");
  themeButton.setAttribute("aria-pressed", String(isDark));
  themeButton.setAttribute("aria-label", isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro");
  themeButton.textContent = isDark ? "☀" : "☾";
});

document.querySelector("#contact-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!WHATSAPP_PHONE) {
    alert("Falta configurar el número de WhatsApp del negocio en script.js antes de recibir consultas.");
    return;
  }

  const fields = new FormData(event.currentTarget);
  const message = [
    "Hola, quiero consultar por un proyecto.",
    `Nombre: ${fields.get("name")}`,
    `Correo: ${fields.get("email")}`,
    `Necesito: ${fields.get("project-type")}`,
    `Detalles: ${fields.get("message") || "Sin detalles adicionales"}`,
  ].join("\n");

  window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
});
