// =============================
// CONFIG CHAUFFEUR (MOULE)
// =============================
const DRIVER = {
  id: "driver-001",
  name: "Chauffeur Test",
  phone: "+221 70 000 00 00",
  type: "Taxi / VTC",
  plate: "DK-0000-A",
  zone: "Saly — Dakar",
  icon: "🚗"
};

// =============================
// ÉTAT GLOBAL
// =============================
const STATE = {
  isOnline: false,
  currentTab: "courses",
  courses: [],
  depenses: [],
  gps: {
    enabled: false,
    lat: null,
    lng: null
  }
};

// =============================
// INIT
// =============================
document.addEventListener("DOMContentLoaded", () => {
  initDriverUI();
  bindEvents();
  renderAll();
});

function initDriverUI() {
  // Bande info
  document.getElementById("uiDriverName").textContent = DRIVER.name;
  document.getElementById("uiDriverCar").textContent = DRIVER.type;

  // Profil
  document.getElementById("profilName").textContent = DRIVER.name;
  document.getElementById("profilPhone").textContent = DRIVER.phone;
  document.getElementById("profilType").textContent = DRIVER.type;
  document.getElementById("profilPlate").textContent = DRIVER.plate;
  document.getElementById("profilZone").textContent = DRIVER.zone;
}

function bindEvents() {
  // Online / offline
  const btnToggle = document.getElementById("btnToggleOnline");
  if (btnToggle) {
    btnToggle.addEventListener("click", toggleOnline);
  }

  // Tabs
  document.querySelectorAll(".tab").forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.getAttribute("data-tab");
      setTab(tab);
    });
  });

  // Formulaire course
  const formCourse = document.getElementById("formCourse");
  if (formCourse) {
    formCourse.addEventListener("submit", handleCourseSubmit);
  }

  // Formulaire dépense
  const formDepense = document.getElementById("formDepense");
  if (formDepense) {
    formDepense.addEventListener("submit", handleDepenseSubmit);
  }
}

// =============================
// ONLINE / OFFLINE
// =============================
function toggleOnline() {
  STATE.isOnline = !STATE.isOnline;
  updateOnlineUI();
}

function updateOnlineUI() {
  const pill = document.getElementById("btnToggleOnline");
  const label = document.getElementById("statusLabel");
  const badge = document.getElementById("statusChauffeurBadge");

  if (!pill || !label || !badge) return;

  if (STATE.isOnline) {
    pill.classList.remove("offline");
    pill.classList.add("online");
    label.textContent = "En ligne";
    badge.textContent = "En ligne";
    badge.classList.remove("badge-offline");
    badge.classList.add("badge-online");
  } else {
    pill.classList.remove("online");
    pill.classList.add("offline");
    label.textContent = "Hors ligne";
    badge.textContent = "Hors ligne";
    badge.classList.remove("badge-online");
    badge.classList.add("badge-offline");
  }
}

// =============================
// TABS
// =============================
function setTab(tabKey) {
  STATE.currentTab = tabKey;

  document.querySelectorAll(".tab").forEach(btn => {
    const k = btn.getAttribute("data-tab");
    btn.classList.toggle("active", k === tabKey);
  });

  document.querySelectorAll(".tab-panel").forEach(panel => {
    const id = panel.id.replace("tab-", "");
    panel.classList.toggle("active", id === tabKey);
  });
}

// =============================
// COURSES
// =============================
function handleCourseSubmit(e) {
  e.preventDefault();

  const amountEl = document.getElementById("courseAmount");
  const modeEl = document.getElementById("courseMode");
  const noteEl = document.getElementById("courseNote");

  const amount = Number(amountEl.value || 0);
  if (!amount || amount <= 0) return;

  const mode = modeEl.value || "cash";
  const note = noteEl.value.trim();

  STATE.courses.unshift({
    id: "course-" + Date.now(),
    amount,
    mode,
    note,
    createdAt: new Date()
  });

  amountEl.value = "";
  noteEl.value = "";

  renderCourses();
}

function renderCourses() {
  const list = document.getElementById("listCourses");
  const totalEl = document.getElementById("kpiCoursesTotal");
  const countEl = document.getElementById("kpiCoursesCount");

  if (!list || !totalEl || !countEl) return;

  if (STATE.courses.length === 0) {
    list.innerHTML = `<p class="list-empty">Aucune course pour l’instant.</p>`;
    totalEl.textContent = "0 FCFA";
    countEl.textContent = "0";
    return;
  }

  let total = 0;
  const rows = STATE.courses.map(c => {
    total += c.amount;
    const modeLabel = modeToLabel(c.mode);
    const time = c.createdAt instanceof Date
      ? c.createdAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
      : "";

    return `
      <div class="list-item">
        <div>
          <div class="item-label">${c.amount.toLocaleString("fr-FR")} FCFA · ${modeLabel}</div>
          <div class="item-meta">${time}${c.note ? " — " + escapeHtml(c.note) : ""}</div>
        </div>
        <div class="item-amount">${c.amount.toLocaleString("fr-FR")} FCFA</div>
      </div>
    `;
  }).join("");

  list.innerHTML = rows;
  totalEl.textContent = total.toLocaleString("fr-FR") + " FCFA";
  countEl.textContent = String(STATE.courses.length);
}

// =============================
// DÉPENSES
// =============================
function handleDepenseSubmit(e) {
  e.preventDefault();

  const labelEl = document.getElementById("depenseLabel");
  const amountEl = document.getElementById("depenseAmount");

  const label = labelEl.value.trim();
  const amount = Number(amountEl.value || 0);

  if (!label || !amount || amount <= 0) return;

  STATE.depenses.unshift({
    id: "dep-" + Date.now(),
    label,
    amount,
    createdAt: new Date()
  });

  labelEl.value = "";
  amountEl.value = "";

  renderDepenses();
}

function renderDepenses() {
  const list = document.getElementById("listDepenses");
  const totalEl = document.getElementById("kpiDepensesTotal");
  const countEl = document.getElementById("kpiDepensesCount");

  if (!list || !totalEl || !countEl) return;

  if (STATE.depenses.length === 0) {
    list.innerHTML = `<p class="list-empty">Aucune dépense enregistrée.</p>`;
    totalEl.textContent = "0 FCFA";
    countEl.textContent = "0";
    return;
  }

  let total = 0;
  const rows = STATE.depenses.map(d => {
    total += d.amount;
    const time = d.createdAt instanceof Date
      ? d.createdAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
      : "";

    return `
      <div class="list-item">
        <div>
          <div class="item-label">${escapeHtml(d.label)}</div>
          <div class="item-meta">${time}</div>
        </div>
        <div class="item-amount">${d.amount.toLocaleString("fr-FR")} FCFA</div>
      </div>
    `;
  }).join("");

  list.innerHTML = rows;
  totalEl.textContent = total.toLocaleString("fr-FR") + " FCFA";
  countEl.textContent = String(STATE.depenses.length);
}

// =============================
// STATUT & GPS (placeholder)
// =============================
function renderStatut() {
  const gpsEl = document.getElementById("gpsStatus");
  if (!gpsEl) return;

  if (STATE.gps.enabled) {
    gpsEl.textContent = "Actif";
    gpsEl.classList.remove("badge-disabled");
    gpsEl.classList.add("badge-online");
  } else {
    gpsEl.textContent = "Inactif";
    gpsEl.classList.remove("badge-online");
    gpsEl.classList.add("badge-disabled");
  }
}

// =============================
// HELPERS
// =============================
function renderAll() {
  updateOnlineUI();
  renderCourses();
  renderDepenses();
  renderStatut();
}

function modeToLabel(mode) {
  switch (mode) {
    case "cash": return "Cash";
    case "wave": return "Wave";
    case "om":   return "Orange Money";
    default:     return "Autre";
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

