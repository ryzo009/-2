const list1 = [
  "Мама", "Парусина", "Вода", "Земля", "Книга", "Школа", "Страна", "Весна", "Зима", "Гора",
  "Стена", "Трава", "Семья", "Баня", "Дорога", "Липа", "Улыбка", "Муха", "Ракета", "Папа",
  "Дедушка", "Дядя", "Мужчина", "Юноша", "Судья",
  "Звезда", "Река", "Тропа", "Луна", "Туча", "Птица", "Рыба", "Шляпа", "Тропинка", "Капля",
  "Ручка", "Роза", "Деревня", "Армия", "Нота",
  "День", "Закон", "Герой"
];

const list2 = [
  "Стол", "Дом", "Конь", "Стул", "Трамвай", "Дуб", "Ветер", "Завод", "Врач", "Дождь",
  "Окно", "Солнце", "Небо", "Молоко", "Поле", "Море", "Здание", "Блюдце", "Письмо", "Яблоко",
  "Дерево", "Озеро", "Лето", "Утро", "Животное",
  "Гриб", "Лес", "Пень", "Город", "Забор", "Мост", "Огонь", "Цветок", "Брат", "Камень",
  "Леопард", "Ключ"
];

let score1 = 0;
let score2 = 0;
let totalSolved = 0;
const totalMushrooms = list1.length + list2.length;

const gameField = document.getElementById("game-field");
const score1El = document.getElementById("score-1");
const score2El = document.getElementById("score-2");
const progressBar = document.getElementById("progress-bar");
const errorCross = document.getElementById("error-cross");
const victoryModal = document.getElementById("victory-modal");
const basket1 = document.getElementById("basket-1");
const basket2 = document.getElementById("basket-2");

function initGame() {
  score1 = 0;
  score2 = 0;
  totalSolved = 0;
  updateUI();
  gameField.innerHTML = "";
  victoryModal.classList.add("hidden");

  let allMushrooms = [
    ...list1.map(word => ({ word, target: 1 })),
    ...list2.map(word => ({ word, target: 2 }))
  ];
  allMushrooms.sort(() => Math.random() - 0.5);

  spawnLargeOrderedGrid(allMushrooms);
}

function spawnLargeOrderedGrid(items) {
  const fieldWidth = gameField.clientWidth;
  
  const mushroomW = 78;
  const mushroomH = 86;
  const gapX = 10;
  const gapY = 8;

  const cols = Math.floor((fieldWidth - 16) / (mushroomW + gapX)) || 5;
  const totalGridW = cols * mushroomW + (cols - 1) * gapX;
  const startX = Math.max(8, (fieldWidth - totalGridW) / 2);
  const startY = 8;

  items.forEach((item, index) => {
    const r = Math.floor(index / cols);
    const c = index % cols;

    const posX = startX + c * (mushroomW + gapX);
    const posY = startY + r * (mushroomH + gapY);

    const el = createMushroomAt(item.word, item.target, posX, posY);
    // Плавный каскадный эффект появления грибочков
    el.style.animationDelay = `${index * 0.025}s`;
  });
}

function createMushroomAt(word, targetBasket, x, y) {
  const el = document.createElement("div");
  el.className = "mushroom";
  el.dataset.target = targetBasket;

  el.innerHTML = `
    <div class="mushroom-cap" style="width: 70px; height: 38px;"></div>
    <div class="mushroom-stem" style="width: 26px; height: 34px;"></div>
    <div class="mushroom-text">${word}</div>
  `;

  el.style.width = "78px";
  el.style.height = "86px";
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;

  el.dataset.homeX = x;
  el.dataset.homeY = y;

  addDragListeners(el);
  gameField.appendChild(el);
  return el;
}

function addDragListeners(el) {
  let isDragging = false;
  let startX, startY, initialLeft, initialTop;

  const onStart = (e) => {
    e.preventDefault();
    isDragging = true;
    el.style.transition = "none";
    el.classList.add("dragging");
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    startX = clientX;
    startY = clientY;
    initialLeft = parseFloat(el.style.left);
    initialTop = parseFloat(el.style.top);

    document.addEventListener("mousemove", onMove);
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("mouseup", onEnd);
    document.addEventListener("touchend", onEnd);
  };

  const onMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - startX;
    const deltaY = clientY - startY;

    el.style.left = `${initialLeft + deltaX}px`;
    el.style.top = `${initialTop + deltaY}px`;
  };

  const onEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    el.classList.remove("dragging");

    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("touchmove", onMove);
    document.removeEventListener("mouseup", onEnd);
    document.removeEventListener("touchend", onEnd);

    checkDrop(el);
  };

  el.addEventListener("mousedown", onStart);
  el.addEventListener("touchstart", onStart, { passive: false });
}

function checkDrop(el) {
  const rect = el.getBoundingClientRect();
  const mushroomCenter = {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  };

  const b1Rect = basket1.getBoundingClientRect();
  const b2Rect = basket2.getBoundingClientRect();

  const expandedB1 = {
    left: b1Rect.left - 40,
    right: b1Rect.right + 40,
    top: b1Rect.top - 80,
    bottom: b1Rect.bottom + 20
  };

  const expandedB2 = {
    left: b2Rect.left - 40,
    right: b2Rect.right + 40,
    top: b2Rect.top - 80,
    bottom: b2Rect.bottom + 20
  };

  const inBasket1 = isInside(mushroomCenter, expandedB1);
  const inBasket2 = isInside(mushroomCenter, expandedB2);

  const target = parseInt(el.dataset.target);

  if (inBasket1) {
    if (target === 1) handleSuccess(el, basket1, 1);
    else handleError(el);
  } else if (inBasket2) {
    if (target === 2) handleSuccess(el, basket2, 2);
    else handleError(el);
  } else {
    returnToHome(el);
  }
}

function isInside(point, rect) {
  return (
    point.x >= rect.left &&
    point.x <= rect.right &&
    point.y >= rect.top &&
    point.y <= rect.bottom
  );
}

function returnToHome(el) {
  el.style.transition = "left 0.25s ease-out, top 0.25s ease-out";
  el.style.left = `${el.dataset.homeX}px`;
  el.style.top = `${el.dataset.homeY}px`;
}

function handleSuccess(el, basketEl, basketNum) {
  if (basketNum === 1) score1++;
  else score2++;
  
  totalSolved++;
  updateUI();

  el.style.zIndex = "999999";
  el.classList.add("falling-in");

  const fieldRect = gameField.getBoundingClientRect();
  const basketRect = basketEl.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  
  const targetX = (basketRect.left + basketRect.width / 2) - fieldRect.left - (elRect.width / 2);
  const targetY = (basketRect.top + basketRect.height / 2) - fieldRect.top;

  el.style.transition = "all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)";
  el.style.left = `${targetX}px`;
  el.style.top = `${targetY}px`;
  el.style.transform = "scale(0.25)";
  el.style.opacity = "0";

  setTimeout(() => {
    el.remove();
  }, 400);

  basketEl.classList.remove("basket-bounce");
  void basketEl.offsetWidth;
  basketEl.classList.add("basket-bounce");

  if (window.confetti) {
    confetti({
      particleCount: 25,
      spread: 50,
      origin: {
        x: (basketRect.left + basketRect.width / 2) / window.innerWidth,
        y: basketRect.top / window.innerHeight
      }
    });
  }

  if (totalSolved === totalMushrooms) {
    setTimeout(() => {
      victoryModal.classList.remove("hidden");
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
    }, 450);
  }
}

function handleError(el) {
  errorCross.classList.remove("hidden");
  errorCross.style.animation = "none";
  void errorCross.offsetWidth;
  errorCross.style.animation = "popAndShake 0.4s ease forwards";

  returnToHome(el);

  setTimeout(() => {
    errorCross.classList.add("hidden");
  }, 400);
}

function updateUI() {
  score1El.textContent = score1;
  score2El.textContent = score2;
  const progressPercent = (totalSolved / totalMushrooms) * 100;
  progressBar.style.width = `${progressPercent}%`;
}

// Запуск игры по клику на стартовую заставку
window.addEventListener("load", () => {
  const startScreen = document.getElementById("start-screen");
  const startBtn = document.getElementById("start-btn");

  startBtn.addEventListener("click", () => {
    startScreen.classList.add("hidden");
    initGame();
  });
});