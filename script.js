/* =========================================================
   FOODPICKER ITF — App logic
   - ข้อมูลเมนูอาหาร (อย่างน้อย 5 รายการ)
   - สุ่มเมนูแบบไม่ซ้ำทันที
   - เปลี่ยนรูป / ชื่อ / คำอธิบาย / ราคา พร้อมแอนิเมชัน
   ========================================================= */

/* ---------- 1) ข้อมูลเมนูอาหาร ---------- */
/* รูปภาพใช้ Wikimedia Commons (ฟรีไลเซนส์) หากต้องการเปลี่ยน
   สามารถแก้ที่ image ได้เลย เช่น URL จาก Unsplash ก็ใช้ได้ */
const commons = (file) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=1200`;

const MENUS = [
  {
    name: "ข้าวมันไก่",
    tag: "เมนูยอดนิยม",
    description:
      "ข้าวหุงน้ำมันมันไก่หอม ๆ เสิร์ฟคู่ไก่ต้มนุ่มฉ่ำ ราดน้ำจิ้มขิงสูตรเด็ด พร้อมน้ำซุปใสกลมกล่อม",
    price: "50 – 60",
    rating: 4.9,
    image: commons("Hainanese chicken rice at Thai Ten.jpg"),
  },
  {
    name: "ข้าวผัดกุ้ง",
    tag: "จานเดียวอิ่ม",
    description:
      "ข้าวผัดร้อน ๆ จากกระทะไฟแรง ใส่กุ้งสดตัวโต ไข่ และต้นหอม กลิ่นหอมชวนหิวทุกคำ",
    price: "55 – 65",
    rating: 4.7,
    image: commons("Shrimp Fried Rice (Taiwan).jpg"),
  },
  {
    name: "ก๋วยเตี๋ยวเรือ",
    tag: "รสจัดจ้าน",
    description:
      "เส้นเล็กนุ่มในน้ำซุปเข้มข้นเครื่องยาจีน กลิ่นหอมเฉพาะตัว เสิร์ฟพร้อมลูกชิ้นและใบกะเพรา",
    price: "40 – 55",
    rating: 4.8,
    image: commons(
      "Boat Noodles with sliced beef round steak, beef ball, braised shank and tendon.jpg"
    ),
  },
  {
    name: "ส้มตำไทย",
    tag: "ยอดนิยมหน้าร้อน",
    description:
      "มะละกอกรอบคลุกน้ำปลา น้ำตาลปี๊บ และมะนาวสด รสเปรี้ยวหวานเค็มกลมกล่อม เผ็ดกำลังดี",
    price: "45 – 60",
    rating: 4.6,
    image: commons("Somtam.jpg"),
  },
  {
    name: "ผัดไทย",
    tag: "เมนูคลาสสิก",
    description:
      "เส้นจันท์เหนียวนุ่มผัดซอสมะขามเข้มข้น ใส่กุ้งแห้ง ถั่วงอก และไข่ เสิร์ฟพร้อมมะนาวและถั่วลิสง",
    price: "50 – 70",
    rating: 4.8,
    image: commons("Pad Thai Hor Kai.jpg"),
  },
  {
    name: "ต้มยำกุ้ง",
    tag: "ซุปไทยระดับโลก",
    description:
      "น้ำซุปเปรี้ยวเผ็ดหอมตะไคร้และใบมะกรูด ใส่กุ้งสดตัวโต มันกุ้งลอยหน้า อร่อยกลมกล่อม",
    price: "60 – 80",
    rating: 4.9,
    image: commons("Tom yum goong at Thai Orchid Villa Kamppi.jpg"),
  },
];

/* ---------- 2) อ้างอิง element ---------- */
const el = {
  card: document.getElementById("foodCard"),
  image: document.getElementById("foodImage"),
  tag: document.getElementById("foodTag"),
  index: document.getElementById("foodIndex"),
  name: document.getElementById("foodName"),
  desc: document.getElementById("foodDesc"),
  price: document.getElementById("foodPrice"),
  rating: document.getElementById("foodRatingValue"),
  button: document.getElementById("shuffleBtn"),
  counter: document.getElementById("spinCount"),
  menuCount: document.getElementById("menuCount"),
};

let currentIndex = -1;
let spins = 0;
let isRolling = false;

/* ---------- 3) ผู้ช่วยเหลือ ---------- */
const pad = (n) => String(n).padStart(2, "0");

/** ภาพสำรองกรณีโหลดรูปจริงไม่สำเร็จ */
function fallbackImage(food) {
  const label = encodeURIComponent(food.name);
  return `https://placehold.co/1200x900/FFE9DC/B43A0C?font=kanit&text=${label}`;
}

/** แสดงข้อมูลเมนูลงการ์ด */
function render(food, index) {
  el.name.textContent = food.name;
  el.desc.textContent = food.description;
  el.price.textContent = food.price;
  el.rating.textContent = food.rating.toFixed(1);
  el.tag.textContent = food.tag;
  el.index.textContent = `${pad(index + 1)} / ${pad(MENUS.length)}`;

  el.image.onerror = () => {
    el.image.onerror = null;
    el.image.src = fallbackImage(food);
  };
  el.image.alt = `รูปภาพ ${food.name}`;
  el.image.src = food.image;
}

/** สุ่มหมายเลขเมนูใหม่ (ไม่ซ้ำกับเมนูปัจจุบันถ้ามีมากกว่า 1 เมนู) */
function pickRandomIndex() {
  if (MENUS.length <= 1) return 0;

  let next = Math.floor(Math.random() * MENUS.length);
  while (next === currentIndex) {
    next = Math.floor(Math.random() * MENUS.length);
  }
  return next;
}

/** โหลดรูปเมนูล่วงหน้าแบบเว้นจังหวะ เพื่อให้การสุ่มลื่นไหล */
function preloadImages() {
  let i = 0;
  const step = () => {
    if (i >= MENUS.length) return;
    const img = new Image();
    img.src = MENUS[i].image;
    i += 1;
    window.setTimeout(step, 900);
  };
  window.setTimeout(step, 800);
}

/* ---------- 4) การสุ่ม ---------- */
function shuffleMenu() {
  if (isRolling) return;
  isRolling = true;

  const nextIndex = pickRandomIndex();
  const rollingTime = 520;

  el.button.classList.add("is-rolling");
  el.card.classList.add("is-rolling");
  el.button.querySelector(".shuffle__text").textContent = "กำลังสุ่ม…";

  window.setTimeout(() => {
    currentIndex = nextIndex;
    render(MENUS[currentIndex], currentIndex);

    spins += 1;
    el.counter.textContent = spins;

    el.card.classList.remove("is-rolling");
    el.button.classList.remove("is-rolling");
    el.button.querySelector(".shuffle__text").textContent = "สุ่มเมนูอาหาร";
    isRolling = false;
  }, rollingTime);
}

/* ---------- 5) เริ่มต้นการทำงาน ---------- */
el.button.addEventListener("click", shuffleMenu);

el.menuCount.textContent = MENUS.length;
currentIndex = 0;
render(MENUS[0], 0);
preloadImages();
