// --- Фиксированная иконка меню на мобильном ---
const navMenu = document.querySelector(".nav__menu");
const siteHeader = document.querySelector(".site__header");

const handleMenuScroll = () => {
  // Только на мобильном (до 768px)
  if (window.innerWidth >= 768) {
    navMenu.classList.remove("nav__menu--fixed");
    return;
  }

  const headerBottom = siteHeader.getBoundingClientRect().bottom;

  if (headerBottom <= 0) {
    navMenu.classList.add("nav__menu--fixed");
  } else {
    navMenu.classList.remove("nav__menu--fixed");
  }
};

window.addEventListener("scroll", handleMenuScroll, { passive: true });
window.addEventListener("resize", handleMenuScroll);

// 1. Установите дату (Год-Месяц-ДеньTЧасы:Минуты:Секунды)
const targetDate = new Date("2026-09-26T00:00:00").getTime();

const countdown = setInterval(() => {
  const now = new Date().getTime();
  const distance = targetDate - now;

  if (distance < 0) {
    clearInterval(countdown);
    document.querySelector(".hero__timer-container").innerHTML = "<h3>Кэмп начался!</h3>";
    return;
  }

  // Расчет времени
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  // Вывод в HTML (добавляем 0 перед однозначными числами для красоты)
  document.getElementById("days").innerText = days < 10 ? "0" + days : days;
  document.getElementById("hours").innerText = hours < 10 ? "0" + hours : hours;
  document.getElementById("minutes").innerText = minutes < 10 ? "0" + minutes : minutes;
  document.getElementById("seconds").innerText = seconds < 10 ? "0" + seconds : seconds;

}, 1000);

const slideTrack = document.querySelector(".slide__track");
const slidePrev = document.querySelector(".slide__edge--prev");
const slideNext = document.querySelector(".slide__edge--next");
const progressBars = document.querySelectorAll(".slide__progress-bar");

if (slideTrack && slidePrev && slideNext) {
  const originalFrames = Array.from(slideTrack.querySelectorAll(".slide__frame"));
  const totalSlides = originalFrames.length;
  const SLIDE_DURATION = 5000; // мс на один слайд

  // Клоны для бесконечной прокрутки
  const firstClone = originalFrames[0].cloneNode(true);
  const lastClone = originalFrames[totalSlides - 1].cloneNode(true);
  firstClone.setAttribute("aria-hidden", "true");
  lastClone.setAttribute("aria-hidden", "true");
  slideTrack.prepend(lastClone);
  slideTrack.append(firstClone);

  let currentSlide = 1; // 1 = первый реальный слайд (0 — клон последнего)
  let isAnimating = false;
  let autoTimer = null;
  let progressTimer = null;
  let progressStart = null;
  let progressElapsed = 0;

  const moveToSlide = (index, animate = true) => {
    if (!animate) slideTrack.classList.add("is-resetting");
    slideTrack.style.transform = `translateX(-${index * 100}%)`;
    if (!animate) {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        slideTrack.classList.remove("is-resetting");
      }));
    }
  };

  // --- Прогресс-бары ---
  const stopProgress = () => {
    clearTimeout(autoTimer);
    cancelAnimationFrame(progressTimer);
    progressStart = null;
  };
  const updateBars = (activeIndex) => {
    progressBars.forEach((bar, i) => {
      const span = bar.querySelector("span");
      if (i < activeIndex) {
        // пройденные — полностью заполнены
        bar.classList.add("is-done");
        span.style.width = "100%";
      } else if (i === activeIndex) {
        // текущий — сбрасываем для анимации
        bar.classList.remove("is-done");
        span.style.width = "0%";
      } else {
        // будущие — пустые
        bar.classList.remove("is-done");
        span.style.width = "0%";
      }
    });
  };
  const startProgress = (activeIndex) => {
    stopProgress();
    updateBars(activeIndex);
    const span = progressBars[activeIndex]?.querySelector("span");
    if (!span) return;

    progressElapsed = 0;
    const tick = (timestamp) => {
      if (!progressStart) progressStart = timestamp;
      progressElapsed = timestamp - progressStart;
      const pct = Math.min((progressElapsed / SLIDE_DURATION) * 100, 100);
      span.style.width = pct + "%";

      if (progressElapsed < SLIDE_DURATION) {
        progressTimer = requestAnimationFrame(tick);
      } else {
        span.style.width = "100%";
        goToSlide(1); // следующий
      }
    };
    progressTimer = requestAnimationFrame(tick);
  };

  // --- Навигация ---
  const getRealIndex = () => currentSlide - 1; // 0-based реальный индекс

  const goToSlide = (direction) => {
    if (isAnimating) return;
    isAnimating = true;
    stopProgress();
    currentSlide += direction;
    moveToSlide(currentSlide);
  };

  moveToSlide(currentSlide, false);
  startProgress(0);

  slidePrev.addEventListener("click", () => goToSlide(-1));
  slideNext.addEventListener("click", () => goToSlide(1));

  // Клик по полосе — перейти на конкретный слайд
  progressBars.forEach((bar, i) => {
    bar.addEventListener("click", () => {
      if (isAnimating) return;
      const targetSlide = i + 1;
      if (targetSlide === currentSlide) return;
      isAnimating = true;
      stopProgress();
      currentSlide = targetSlide;
      moveToSlide(currentSlide);
    });
  });

  slideTrack.addEventListener("transitionend", () => {
    isAnimating = false;

    if (currentSlide === 0) {
      currentSlide = totalSlides;
      moveToSlide(currentSlide, false);
    } else if (currentSlide === totalSlides + 1) {
      currentSlide = 1;
      moveToSlide(currentSlide, false);
    }

    startProgress(getRealIndex());
  });

  // Пауза при скрытой вкладке
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopProgress();
    } else {
      startProgress(getRealIndex());
    }
  });
}

const menuToggle = document.querySelector(".nav__menu");
const menuOverlay = document.getElementById("menuOverlay");
const menuClose = document.getElementById("menuClose");

const openMenu = () => {
  menuOverlay.classList.add("is-open");
  document.body.classList.add("menu-is-open");
};

const closeMenu = () => {
  menuOverlay.classList.remove("is-open");
  document.body.classList.remove("menu-is-open");
};

menuToggle.addEventListener("click", openMenu);
menuClose.addEventListener("click", closeMenu);

// Клик на тёмный фон справа закрывает меню
menuOverlay.addEventListener("click", (e) => {
  if (e.target === menuOverlay) closeMenu();
});

// Закрытие по Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});

// --- Travel слайдер ---
const travelTrack = document.querySelector(".travel__track");
const travelPrev = document.querySelector(".travel__edge--prev");
const travelNext = document.querySelector(".travel__edge--next");

if (travelTrack) {
  const frames = Array.from(travelTrack.querySelectorAll(".travel__frame"));
  const total = frames.length;
  let current = 0;
  let isAnimating = false;

  const updateButtons = () => {
    if (!travelPrev || !travelNext) return;
    travelPrev.style.visibility = current === 0 ? "hidden" : "visible";
    travelNext.style.visibility = current === total - 1 ? "hidden" : "visible";
  };

  const moveTo = (index, animate = true) => {
    if (index < 0 || index >= total) return;
    current = index;
    const offset = frames[current].offsetLeft;
    travelTrack.style.transition = animate
      ? "transform 500ms cubic-bezier(0.16, 1, 0.3, 1)"
      : "none";
    travelTrack.style.transform = `translateX(-${offset}px)`;
    updateButtons();
  };

  travelTrack.addEventListener("transitionend", () => {
    isAnimating = false;
  });

  const goNext = () => {
    if (isAnimating || current >= total - 1) return;
    isAnimating = true;
    moveTo(current + 1);
  };

  const goPrev = () => {
    if (isAnimating || current <= 0) return;
    isAnimating = true;
    moveTo(current - 1);
  };

  if (travelPrev) travelPrev.addEventListener("click", goPrev);
  if (travelNext) travelNext.addEventListener("click", goNext);
  // Свайп для мобильного
  let touchStartX = 0;
  let touchStartY = 0;
  let isSwiping = false;
  const travelContainer = travelTrack.parentElement;

  travelContainer.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isSwiping = false;
  }, { passive: true });

  travelContainer.addEventListener("touchmove", (e) => {
    const dx = Math.abs(e.touches[0].clientX - touchStartX);
    const dy = Math.abs(e.touches[0].clientY - touchStartY);
    if (!isSwiping && dx > dy && dx > 8) {
      isSwiping = true;
    }
    if (isSwiping) e.preventDefault();
  }, { passive: false });

  travelContainer.addEventListener("touchend", (e) => {
    if (!isSwiping) return;
    isSwiping = false;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (dx < -40) goNext();
    else if (dx > 40) goPrev();
  });

  window.addEventListener("resize", () => {
    isAnimating = false;
    moveTo(current, false);
  });

  moveTo(0, false);
}

// --- Coach слайдер ---
const coachTrack = document.querySelector(".coach__track");
const coachPrev = document.querySelector(".coach__edge--prev");
const coachNext = document.querySelector(".coach__edge--next");

if (coachTrack) {
  const frames = Array.from(coachTrack.querySelectorAll(".coach__frame"));
  const total = frames.length;
  let current = 0;
  let isAnimating = false;

  const updateButtons = () => {
    if (!coachPrev || !coachNext) return;
    coachPrev.style.visibility = current === 0 ? "hidden" : "visible";
    coachNext.style.visibility = current === total - 1 ? "hidden" : "visible";
  };

  const moveTo = (index, animate = true) => {
    if (index < 0 || index >= total) return;
    current = index;
    const offset = frames[current].offsetLeft;
    coachTrack.style.transition = animate
      ? "transform 500ms cubic-bezier(0.16, 1, 0.3, 1)"
      : "none";
    coachTrack.style.transform = `translateX(-${offset}px)`;
    updateButtons();
  };

  coachTrack.addEventListener("transitionend", () => {
    isAnimating = false;
  });

  const goNext = () => {
    if (isAnimating || current >= total - 1) return;
    isAnimating = true;
    moveTo(current + 1);
  };

  const goPrev = () => {
    if (isAnimating || current <= 0) return;
    isAnimating = true;
    moveTo(current - 1);
  };

  if (coachPrev) coachPrev.addEventListener("click", goPrev);
  if (coachNext) coachNext.addEventListener("click", goNext);

  // Свайп
  let touchStartX = 0;
  let touchStartY = 0;
  let isSwiping = false;
  const coachContainer = coachTrack.parentElement;

  coachContainer.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isSwiping = false;
  }, { passive: true });

  coachContainer.addEventListener("touchmove", (e) => {
    const dx = Math.abs(e.touches[0].clientX - touchStartX);
    const dy = Math.abs(e.touches[0].clientY - touchStartY);
    if (!isSwiping && dx > dy && dx > 8) isSwiping = true;
    if (isSwiping) e.preventDefault();
  }, { passive: false });

  coachContainer.addEventListener("touchend", (e) => {
    if (!isSwiping) return;
    isSwiping = false;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (dx < -40) goNext();
    else if (dx > 40) goPrev();
  });

  window.addEventListener("resize", () => {
    isAnimating = false;
    moveTo(current, false);
  });

  moveTo(0, false);
}

// --- Hotel слайдер ---
const hotelTrack = document.querySelector(".hotel__track");
const hotelPrev = document.querySelector(".hotel__edge--prev");
const hotelNext = document.querySelector(".hotel__edge--next");

if (hotelTrack) {
  const frames = Array.from(hotelTrack.querySelectorAll(".hotel__frame"));
  const total = frames.length;
  let current = 0;
  let isAnimating = false;

  const updateButtons = () => {
    if (!hotelPrev || !hotelNext) return;
    hotelPrev.style.visibility = current === 0 ? "hidden" : "visible";
    hotelNext.style.visibility = current === total - 1 ? "hidden" : "visible";
  };

  const moveTo = (index, animate = true) => {
    if (index < 0 || index >= total) return;
    current = index;
    const offset = frames[current].offsetLeft;
    hotelTrack.style.transition = animate
      ? "transform 500ms cubic-bezier(0.16, 1, 0.3, 1)"
      : "none";
    hotelTrack.style.transform = `translateX(-${offset}px)`;
    updateButtons();
  };

  hotelTrack.addEventListener("transitionend", () => {
    isAnimating = false;
  });

  const goNext = () => {
    if (isAnimating || current >= total - 1) return;
    isAnimating = true;
    moveTo(current + 1);
  };

  const goPrev = () => {
    if (isAnimating || current <= 0) return;
    isAnimating = true;
    moveTo(current - 1);
  };

  if (hotelPrev) hotelPrev.addEventListener("click", goPrev);
  if (hotelNext) hotelNext.addEventListener("click", goNext);

  // Свайп
  let touchStartX = 0;
  let touchStartY = 0;
  let isSwiping = false;
  const hotelContainer = hotelTrack.parentElement;

  hotelContainer.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isSwiping = false;
  }, { passive: true });

  hotelContainer.addEventListener("touchmove", (e) => {
    const dx = Math.abs(e.touches[0].clientX - touchStartX);
    const dy = Math.abs(e.touches[0].clientY - touchStartY);
    if (!isSwiping && dx > dy && dx > 8) isSwiping = true;
    if (isSwiping) e.preventDefault();
  }, { passive: false });

  hotelContainer.addEventListener("touchend", (e) => {
    if (!isSwiping) return;
    isSwiping = false;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (dx < -40) goNext();
    else if (dx > 40) goPrev();
  });

  window.addEventListener("resize", () => {
    isAnimating = false;
    moveTo(current, false);
  });

  moveTo(0, false);
}

// --- Levels слайдер ---
const levelsTrack = document.querySelector(".levels__track");
const levelsPrev = document.querySelector(".levels__edge--prev");
const levelsNext = document.querySelector(".levels__edge--next");

if (levelsTrack) {
  const frames = Array.from(levelsTrack.querySelectorAll(".levels__frame"));
  const total = frames.length;
  let current = 0;
  let isAnimating = false;

  const isDesktop = () => window.innerWidth >= 768;

  const updateButtons = () => {
    if (!levelsPrev || !levelsNext) return;
    if (isDesktop()) {
      levelsPrev.style.visibility = "hidden";
      levelsNext.style.visibility = "hidden";
      return;
    }
    levelsPrev.style.visibility = current === 0 ? "hidden" : "visible";
    levelsNext.style.visibility = current === total - 1 ? "hidden" : "visible";
  };

  const moveTo = (index, animate = true) => {
    if (isDesktop()) {
      levelsTrack.style.transition = "none";
      levelsTrack.style.transform = "translateX(0)";
      updateButtons();
      return;
    }
    if (index < 0 || index >= total) return;
    current = index;
    const offset = frames[current].offsetLeft;
    levelsTrack.style.transition = animate
      ? "transform 500ms cubic-bezier(0.16, 1, 0.3, 1)"
      : "none";
    levelsTrack.style.transform = `translateX(-${offset}px)`;
    updateButtons();
  };

  levelsTrack.addEventListener("transitionend", () => {
    isAnimating = false;
  });

  const goNext = () => {
    if (isDesktop() || isAnimating || current >= total - 1) return;
    isAnimating = true;
    moveTo(current + 1);
  };

  const goPrev = () => {
    if (isDesktop() || isAnimating || current <= 0) return;
    isAnimating = true;
    moveTo(current - 1);
  };

  if (levelsPrev) levelsPrev.addEventListener("click", goPrev);
  if (levelsNext) levelsNext.addEventListener("click", goNext);

  let touchStartX = 0;
  let touchStartY = 0;
  let isSwiping = false;
  const levelsContainer = levelsTrack.parentElement;

  levelsContainer.addEventListener("touchstart", (e) => {
    if (isDesktop()) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isSwiping = false;
  }, { passive: true });

  levelsContainer.addEventListener("touchmove", (e) => {
    if (isDesktop()) return;
    const dx = Math.abs(e.touches[0].clientX - touchStartX);
    const dy = Math.abs(e.touches[0].clientY - touchStartY);
    if (!isSwiping && dx > dy && dx > 8) isSwiping = true;
    if (isSwiping) e.preventDefault();
  }, { passive: false });

  levelsContainer.addEventListener("touchend", (e) => {
    if (isDesktop() || !isSwiping) return;
    isSwiping = false;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (dx < -40) goNext();
    else if (dx > 40) goPrev();
  });

  window.addEventListener("resize", () => {
    isAnimating = false;
    current = 0;
    moveTo(0, false);
  });

  moveTo(0, false);
}

// --- Pack слайдер ---
const packTrack = document.querySelector(".pack__track");
const packPrev = document.querySelector(".pack__edge--prev");
const packNext = document.querySelector(".pack__edge--next");

if (packTrack) {
    const slides = Array.from(packTrack.querySelectorAll(".pack__slide"));
    const total = slides.length;
    let current = 0;
    let isAnimating = false;

    const isDesktop = () => window.innerWidth >= 768;

    const updateButtons = () => {
        if (!packPrev || !packNext) return;
        if (isDesktop()) {
            packPrev.style.visibility = "hidden";
            packNext.style.visibility = "hidden";
            return;
        }
        packPrev.style.visibility = current === 0 ? "hidden" : "visible";
        packNext.style.visibility = current === total - 1 ? "hidden" : "visible";
    };

    const moveTo = (index, animate = true) => {
        if (isDesktop()) {
            packTrack.style.transition = "none";
            packTrack.style.transform = "translateX(0)";
            updateButtons();
            return;
        }
        if (index < 0 || index >= total) return;
        current = index;
        const offset = slides[current].offsetLeft;
        packTrack.style.transition = animate
            ? "transform 500ms cubic-bezier(0.16, 1, 0.3, 1)"
            : "none";
        packTrack.style.transform = `translateX(-${offset}px)`;
        updateButtons();
    };

    packTrack.addEventListener("transitionend", () => {
        isAnimating = false;
    });

    const goNext = () => {
        if (isDesktop() || isAnimating || current >= total - 1) return;
        isAnimating = true;
        moveTo(current + 1);
    };

    const goPrev = () => {
        if (isDesktop() || isAnimating || current <= 0) return;
        isAnimating = true;
        moveTo(current - 1);
    };

    if (packPrev) packPrev.addEventListener("click", goPrev);
    if (packNext) packNext.addEventListener("click", goNext);

    // Свайп
    let touchStartX = 0;
    let touchStartY = 0;
    let isSwiping = false;
    const packContainer = packTrack.parentElement;

    packContainer.addEventListener("touchstart", (e) => {
        if (isDesktop()) return;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isSwiping = false;
    }, { passive: true });

    packContainer.addEventListener("touchmove", (e) => {
        if (isDesktop()) return;
        const dx = Math.abs(e.touches[0].clientX - touchStartX);
        const dy = Math.abs(e.touches[0].clientY - touchStartY);
        if (!isSwiping && dx > dy && dx > 8) isSwiping = true;
        if (isSwiping) e.preventDefault();
    }, { passive: false });

    packContainer.addEventListener("touchend", (e) => {
        if (isDesktop() || !isSwiping) return;
        isSwiping = false;
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (dx < -40) goNext();
        else if (dx > 40) goPrev();
    });

    window.addEventListener("resize", () => {
        isAnimating = false;
        current = 0;
        moveTo(0, false);
    });

    moveTo(0, false);
}

// --- FAQ аккордеон ---

const faqItems = document.querySelectorAll(".faq__item");

faqItems.forEach((item) => {
    const button = item.querySelector(".faq__question");

    button.addEventListener("click", () => {

        const isOpen = item.classList.contains("active");

        faqItems.forEach((faq) => {
            faq.classList.remove("active");
        });

        if (!isOpen) {
            item.classList.add("active");
        }
    });
});