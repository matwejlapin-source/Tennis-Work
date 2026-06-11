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

if (slideTrack && slidePrev && slideNext) {
  const originalFrames = Array.from(slideTrack.querySelectorAll(".slide__frame"));

  if (originalFrames.length > 1) {
    const firstFrameClone = originalFrames[0].cloneNode(true);
    const lastFrameClone = originalFrames[originalFrames.length - 1].cloneNode(true);
    let currentSlide = 1;
    let isAnimating = false;

    firstFrameClone.setAttribute("aria-hidden", "true");
    lastFrameClone.setAttribute("aria-hidden", "true");
    slideTrack.prepend(lastFrameClone);
    slideTrack.append(firstFrameClone);

    const moveToSlide = (index) => {
      slideTrack.style.transform = `translateX(-${index * 100}%)`;
    };

    const resetWithoutAnimation = (index) => {
      slideTrack.classList.add("is-resetting");
      currentSlide = index;
      moveToSlide(currentSlide);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          slideTrack.classList.remove("is-resetting");
        });
      });
    };

    const showSlide = (direction) => {
      if (isAnimating) {
        return;
      }

      isAnimating = true;
      currentSlide += direction;
      moveToSlide(currentSlide);
    };

    resetWithoutAnimation(currentSlide);
    slidePrev.addEventListener("click", () => showSlide(-1));
    slideNext.addEventListener("click", () => showSlide(1));

    slideTrack.addEventListener("transitionend", () => {
      isAnimating = false;

      if (currentSlide === 0) {
        resetWithoutAnimation(originalFrames.length);
      }

      if (currentSlide === originalFrames.length + 1) {
        resetWithoutAnimation(1);
      }
    });
  }
}
