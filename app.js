const API_BASE = "https://69f277cab15130b97352f41e.mockapi.io/Customer";

const EXPERIENCE_OPTIONS = [
  "Blue Mountain Farm-to-Table Dining Experience *VIP*",
  "Powerboat Adventure & Beachside Lunch Montego Bay *VIP*",
  "Dolphin Royal Swim Lucea",
  "Reggae Catamaran and Snorkeling Cruise Montego Bay"
];

const FIELD_SCHEMA = [
  { key: "firstName", label: "First Name", type: "text" },
  { key: "lastName", label: "Last Name", type: "text" },
  { key: "phoneNumber", label: "Phone Number (e.164)", type: "text", placeholder: "+15551234567" },
  { key: "email", label: "Email", type: "email" },

  { key: "reservationId", label: "Reservation ID", type: "text" },
  { key: "reservationStatus", label: "Reservation Status", type: "status" },

  { key: "airportTransfer", label: "Airport Transfer", type: "bool" },
  { key: "airportTransferDate", label: "Airport Transfer Date", type: "dateParts" },
  { key: "airportTransferTime", label: "Airport Transfer Time", type: "timeParts" },

  { key: "experience1Status", label: "Experience 1 Booked", type: "bool" },
  { key: "experience1Name", label: "Experience 1 Name", type: "experience" },
  { key: "experience1Date", label: "Experience 1 Date", type: "dateParts" },
  { key: "experience1Time", label: "Experience 1 Time", type: "timeParts" },
  { key: "experience1Transfer", label: "Experience 1 Transfer", type: "bool" },
  { key: "experience1Vip", label: "Experience 1 VIP", type: "bool" },

  { key: "experience2Status", label: "Experience 2 Booked", type: "bool" },
  { key: "Experience2Name", label: "Experience 2 Name", type: "experience" },
  { key: "Experience2Date", label: "Experience 2 Date", type: "dateParts" },
  { key: "Experience2Time", label: "Experience 2 Time", type: "timeParts" },
  { key: "experience2Transfer", label: "Experience 2 Transfer", type: "bool" },
  { key: "experience2Vip", label: "Experience 2 VIP", type: "bool" }
];

const GROUPS = [
  {
    id: "personal",
    label: "1) Personal",
    fields: ["firstName", "lastName", "phoneNumber", "email", "reservationId", "reservationStatus"]
  },
  {
    id: "airport",
    label: "2) Airport Transfer",
    fields: ["airportTransfer", "airportTransferDate", "airportTransferTime"]
  },
  {
    id: "exp1",
    label: "3) Experience 1",
    fields: ["experience1Status", "experience1Name", "experience1Date", "experience1Time", "experience1Transfer", "experience1Vip"]
  },
  {
    id: "exp2",
    label: "4) Experience 2",
    fields: ["experience2Status", "Experience2Name", "Experience2Date", "Experience2Time", "experience2Transfer", "experience2Vip"]
  }
];

document.addEventListener("DOMContentLoaded", () => {
  injectExtraStyles();
  initMainTabs();
  buildCreateFormWithInternalTabs();
  wireCreateButtons();
  wireSearchButtons();
  wireEmailWidget();
  loadAllRecords();
  loadKanban();
});

/* -------------------- styles for internal tabs/cards -------------------- */
function injectExtraStyles() {
  const style = document.createElement("style");
  style.textContent = `
    .inner-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px}
    .inner-tab-btn{
      background:#202738;border:1px solid #323b52;color:#d7def0;
      padding:7px 10px;border-radius:9px;font-size:.82rem;cursor:pointer;font-weight:700
    }
    .inner-tab-btn.active{border-color:#4da3ff;box-shadow:0 0 0 1px rgba(77,163,255,.4) inset}
    .inner-panel{display:none}
    .inner-panel.active{display:block}
    .compact-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .card-tabs{margin-top:8px}
    .small-card{padding:10px}
    .kanban-card-head{margin-bottom:8px}
    .edit-inline-wrap{display:flex;gap:6px;align-items:center}
    .edit-inline-wrap input,.edit-inline-wrap select{margin:0}
    @media (max-width:900px){ .compact-grid{grid-template-columns:1fr} }
  `;
  document.head.appendChild(style);
}

/* -------------------- main tabs -------------------- */
function initMainTabs() {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
      if (btn.dataset.tab === "tab2") loadKanban();
    });
  });
}

/* -------------------- create form with 4 internal tabs -------------------- */
function buildCreateFormWithInternalTabs() {
  const form = document.getElementById("createForm");
  form.innerHTML = "";

  const tabs = document.createElement("div");
  tabs.className = "inner-tabs";

  const panelWrap = document.createElement("div");
  panelWrap.id = "createInternalPanels";

  GROUPS.forEach((g, idx) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "inner-tab-btn" + (idx === 0 ? " active" : "");
    b.textContent = g.label;
    b.dataset.target = `create_panel_${g.id}`;
    b.addEventListener("click", () => activateInnerTab(tabs, panelWrap, b.dataset.target));
    tabs.appendChild(b);

    const panel = document.createElement("div");
    panel.className = "inner-panel" + (idx === 0 ? " active" : "");
    panel.id = `create_panel_${g.id}`;

    const grid = document.createElement("div");
    grid.className = "compact-grid";

    g.fields.forEach(key => {
      const field = FIELD_SCHEMA.find(f => f.key === key);
      if (!field) return;
      const wrapper = createCreateInput(field);
      grid.appendChild(wrapper);
    });

    panel.appendChild(grid);
    panelWrap.appendChild(panel);
  });

  form.appendChild(tabs);
  form.appendChild(panelWrap);
}

function activateInnerTab(tabBar, panelWrap, panelId) {
  tabBar.querySelectorAll(".inner-tab-btn").forEach(x => x.classList.remove("active"));
  panelWrap.querySelectorAll(".inner-panel").forEach(p => p.classList.remove("active"));
  [...tabBar.querySelectorAll(".inner-tab-btn")].find(b => b.dataset.target === panelId)?.classList.add("active");
  document.getElementById(panelId)?.classList.add("active");
}

function createCreateInput(field) {
  const wrapper = document.createElement("div");
  const label = document.createElement("label");
  label.className = "label";
  label.textContent = field.label;
  wrapper.appendChild(label);

  if (field.type === "text" || field.type === "email") {
    const input = document.createElement("input");
    input.type = field.type;
    input.id = `create_${field.key}`;
    if (field.placeholder) input.placeholder = field.placeholder;
    wrapper.appendChild(input);
  }

  if (field.type === "bool") wrapper.appendChild(createBoolSelect(`create_${field.key}`, false));

  if (field.type === "experience") {
    const sel = document.createElement("select");
    sel.id = `create_${field.key}`;
    sel.appendChild(opt("", "-- Select experience --"));
    EXPERIENCE_OPTIONS.forEach(e => sel.appendChild(opt(e, e)));
    wrapper.appendChild(sel);
  }

  if (field.type === "status") {
    const sel = document.createElement("select");
    sel.id = `create_${field.key}`;
    ["Booked", "Confirmed", "Cancelled"].forEach((s, i) => {
      const o = opt(s, s);
      if (i === 0) o.selected = true;
      sel.appendChild(o);
    });
    wrapper.appendChild(sel);
  }

  if (field.type === "dateParts") wrapper.appendChild(createDateParts(`create_${field.key}`));
  if (field.type === "timeParts") wrapper.appendChild(createTimeParts(`create_${field.key}`));

  return wrapper;
}

function opt(v, t) {
  const o = document.createElement("option");
  o.value = v;
  o.textContent = t;
  return o;
}

function createBoolSelect(id, defaultTrue = false) {
  const sel = document.createElement("select");
  sel.id = id;
  sel.appendChild(opt("false", "false"));
  sel.appendChild(opt("true", "true"));
  sel.value = defaultTrue ? "true" : "false";
  return sel;
}

function createDateParts(baseId) {
  const row = document.createElement("div");
  row.className = "row-3";

  const month = document.createElement("select");
  month.id = `${baseId}_month`;
  ["", "January","February","March","April","May","June","July","August","September","October","November","December"]
    .forEach(m => month.appendChild(opt(m, m || "Month")));

  const day = document.createElement("select");
  day.id = `${baseId}_day`;
  day.appendChild(opt("", "Day"));
  for (let i = 1; i <= 31; i++) day.appendChild(opt(String(i), String(i)));

  const year = document.createElement("select");
  year.id = `${baseId}_year`;
  year.appendChild(opt("", "Year"));
  for (let y = 2026; y <= 2035; y++) year.appendChild(opt(String(y), String(y)));

  row.append(month, day, year);
  return row;
}

function createTimeParts(baseId) {
  const row = document.createElement("div");
  row.className = "row";

  const time = document.createElement("select");
  time.id = `${baseId}_time`;
  time.appendChild(opt("", "HH:MM"));
  for (let h = 0; h <= 11; h++) {
    for (const m of [0, 30]) {
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      const t = `${hh}:${mm}`;
      time.appendChild(opt(t, t));
    }
  }

  const ampm = document.createElement("select");
  ampm.id = `${baseId}_ampm`;
  ampm.appendChild(opt("AM", "AM"));
  ampm.appendChild(opt("PM", "PM"));

  row.append(time, ampm);
  return row;
}

/* -------------------- create/clear -------------------- */
function wireCreateButtons() {
  document.getElementById("createBtn").addEventListener("click", createRecord);
  document.getElementById("clearCreateBtn").addEventListener("click", clearCreateForm);
}

function collectCreatePayload() {
  const out = {};
  FIELD_SCHEMA.forEach(f => {
    const key = f.key;
    if (["text","email","experience","status"].includes(f.type)) {
      out[key] = (document.getElementById(`create_${key}`)?.value || "").trim();
    } else if (f.type === "bool") {
      out[key] = document.getElementById(`create_${key}`)?.value === "true";
    } else if (f.type === "dateParts") {
      const m = document.getElementById(`create_${key}_month`)?.value || "";
      const d = document.getElementById(`create_${key}_day`)?.value || "";
      const y = document.getElementById(`create_${key}_year`)?.value || "";
      out[key] = (m && d && y) ? `${m} ${d}, ${y}` : "";
    } else if (f.type === "timeParts") {
      const t = document.getElementById(`create_${key}_time`)?.value || "";
      const ap = document.getElementById(`create_${key}_ampm`)?.value || "AM";
      out[key] = t ? `${t} ${ap}` : "";
    }
  });
  if (!out.reservationStatus) out.reservationStatus = "Booked";
  return out;
}

async function createRecord() {
  try {
    const payload = collectCreatePayload();
    await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    alert("Reservation created.");
    clearCreateForm();
    loadAllRecords();
    loadKanban();
  } catch (err) {
    console.error(err);
    alert("Failed to create reservation.");
  }
}

function clearCreateForm() {
  FIELD_SCHEMA.forEach(f => {
    const key = f.key;
    if (["text","email","experience"].includes(f.type)) {
      const el = document.getElementById(`create_${key}`);
      if (el) el.value = "";
    }
    if (f.type === "status") {
      const el = document.getElementById(`create_${key}`);
      if (el) el.value = "Booked";
    }
    if (f.type === "bool") {
      const el = document.getElementById(`create_${key}`);
      if (el) el.value = "false";
    }
    if (f.type === "dateParts") {
      document.getElementById(`create_${key}_month`).value = "";
      document.getElementById(`create_${key}_day`).value = "";
      document.getElementById(`create_${key}_year`).value = "";
    }
    if (f.type === "timeParts") {
      document.getElementById(`create_${key}_time`).value = "";
      document.getElementById(`create_${key}_ampm`).value = "AM";
    }
  });
}

/* -------------------- search / edit / delete -------------------- */
function wireSearchButtons() {
  document.getElementById("searchBtn").addEventListener("click", searchRecords);
  document.getElementById("loadAllBtn").addEventListener("click", loadAllRecords);
}

async function fetchAll() {
  const res = await fetch(API_BASE);
  return await res.json();
}

async function loadAllRecords() {
  const data = await fetchAll();
  renderResults(data);
}

async function searchRecords() {
  const q = (document.getElementById("searchInput").value || "").trim().toLowerCase();
  const data = await fetchAll();
  if (!q) return renderResults(data);
  const filtered = data.filter(rec =>
    Object.keys(rec).some(k => String(rec[k] ?? "").toLowerCase().includes(q))
  );
  renderResults(filtered);
}

function renderResults(records) {
  const box = document.getElementById("results");
  box.innerHTML = "";

  if (!records.length) {
    box.innerHTML = `<div class="card">No records found.</div>`;
    return;
  }

  records.forEach(rec => {
    const card = document.createElement("div");
    card.className = "card small-card";

    const title = document.createElement("div");
    title.innerHTML = `<strong>${safe(rec.firstName)} ${safe(rec.lastName)}</strong> <span class="mini">| ID: ${safe(rec.reservationId || "-")}</span>`;
    card.appendChild(title);

    const tabs = document.createElement("div");
    tabs.className = "inner-tabs card-tabs";

    const panelWrap = document.createElement("div");

    GROUPS.forEach((g, idx) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "inner-tab-btn" + (idx === 0 ? " active" : "");
      b.textContent = g.label;
      b.dataset.target = `res_${rec.id}_${g.id}`;
      b.addEventListener("click", () => activateInnerTab(tabs, panelWrap, b.dataset.target));
      tabs.appendChild(b);

      const panel = document.createElement("div");
      panel.className = "inner-panel" + (idx === 0 ? " active" : "");
      panel.id = `res_${rec.id}_${g.id}`;

      g.fields.forEach(key => {
        const f = FIELD_SCHEMA.find(x => x.key === key);
        if (!f) return;
        panel.appendChild(createReadEditRow(rec, f));
      });

      panelWrap.appendChild(panel);
    });

    const del = document.createElement("button");
    del.className = "btn btn-red";
    del.textContent = "Delete";
    del.addEventListener("click", () => deleteRecord(rec.id));

    card.appendChild(tabs);
    card.appendChild(panelWrap);
    card.appendChild(del);

    box.appendChild(card);
  });
}

function createReadEditRow(rec, field) {
  const row = document.createElement("div");
  row.className = "field-row";

  const k = document.createElement("div");
  k.className = "k";
  k.textContent = field.label;

  const v = document.createElement("div");
  v.className = "v";
  v.id = `val_${rec.id}_${field.key}`;
  v.textContent = formatValue(rec[field.key]);

  const b = document.createElement("button");
  b.className = "edit-btn";
  b.textContent = "Edit";
  b.addEventListener("click", () => inlineEditField(rec, field));

  row.append(k, v, b);
  return row;
}

function formatValue(v) {
  if (typeof v === "boolean") return v ? "true" : "false";
  return v ?? "";
}

function inlineEditField(rec, field) {
  const cell = document.getElementById(`val_${rec.id}_${field.key}`);
  if (!cell) return;
  cell.innerHTML = "";

  const wrap = document.createElement("div");
  wrap.className = "edit-inline-wrap";

  let editor;
  if (field.type === "bool") {
    editor = createBoolSelect(`edit_${rec.id}_${field.key}`, rec[field.key] === true);
  } else if (field.type === "status") {
    editor = document.createElement("select");
    ["Booked","Confirmed","Cancelled"].forEach(s => {
      const o = opt(s, s);
      if ((rec[field.key] || "") === s) o.selected = true;
      editor.appendChild(o);
    });
  } else if (field.type === "experience") {
    editor = document.createElement("select");
    editor.appendChild(opt("", "-- Select experience --"));
    EXPERIENCE_OPTIONS.forEach(e => {
      const o = opt(e, e);
      if ((rec[field.key] || "") === e) o.selected = true;
      editor.appendChild(o);
    });
  } else {
    editor = document.createElement("input");
    editor.type = "text";
    editor.value = rec[field.key] || "";
  }

  const save = document.createElement("button");
  save.className = "edit-btn";
  save.textContent = "Save";

  save.addEventListener("click", async () => {
    const newVal = (field.type === "bool") ? (editor.value === "true") : editor.value;
    await updateRecord(rec.id, { [field.key]: newVal });
    rec[field.key] = newVal;
    cell.textContent = formatValue(newVal);
    loadKanban();
  });

  wrap.append(editor, save);
  cell.appendChild(wrap);
}

async function updateRecord(id, patchObj) {
  try {
    await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patchObj)
    });
  } catch (err) {
    console.error(err);
    alert("Update failed.");
  }
}

async function deleteRecord(id) {
  if (!confirm("Delete this reservation permanently?")) return;
  try {
    await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
    loadAllRecords();
    loadKanban();
  } catch (err) {
    console.error(err);
    alert("Delete failed.");
  }
}

/* -------------------- kanban with internal tabs and full info -------------------- */
async function loadKanban() {
  const data = await fetchAll();

  const colBooked = document.getElementById("colBooked");
  const colConfirmed = document.getElementById("colConfirmed");
  const colCancelled = document.getElementById("colCancelled");
  colBooked.innerHTML = "";
  colConfirmed.innerHTML = "";
  colCancelled.innerHTML = "";

  data.forEach(rec => {
    const status = ["Booked","Confirmed","Cancelled"].includes(rec.reservationStatus)
      ? rec.reservationStatus : "Booked";

    const card = document.createElement("div");
    card.className = "card small-card";
    card.style.marginBottom = "10px";

    const head = document.createElement("div");
    head.className = "kanban-card-head";
    head.innerHTML = `<strong>${safe(rec.firstName)} ${safe(rec.lastName)}</strong><div class="mini">Res ID: ${safe(rec.reservationId || "-")}</div>`;
    card.appendChild(head);

    const statusLabel = document.createElement("label");
    statusLabel.className = "label";
    statusLabel.textContent = "Status";
    card.appendChild(statusLabel);

    const statusSel = document.createElement("select");
    ["Booked","Confirmed","Cancelled"].forEach(s => {
      const o = opt(s, s);
      if (s === status) o.selected = true;
      statusSel.appendChild(o);
    });
    statusSel.addEventListener("change", async () => {
      await updateRecord(rec.id, { reservationStatus: statusSel.value });
      loadKanban();
      loadAllRecords();
    });
    card.appendChild(statusSel);

    const tabs = document.createElement("div");
    tabs.className = "inner-tabs card-tabs";
    const panelWrap = document.createElement("div");

    GROUPS.forEach((g, idx) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "inner-tab-btn" + (idx === 0 ? " active" : "");
      b.textContent = g.label;
      b.dataset.target = `kan_${rec.id}_${g.id}`;
      b.addEventListener("click", () => activateInnerTab(tabs, panelWrap, b.dataset.target));
      tabs.appendChild(b);

      const panel = document.createElement("div");
      panel.className = "inner-panel" + (idx === 0 ? " active" : "");
      panel.id = `kan_${rec.id}_${g.id}`;

      g.fields.forEach(key => {
        const f = FIELD_SCHEMA.find(x => x.key === key);
        if (!f) return;
        const line = document.createElement("div");
        line.className = "mini";
        line.style.marginBottom = "4px";
        line.innerHTML = `<strong>${f.label}:</strong> ${safe(formatValue(rec[f.key]))}`;
        panel.appendChild(line);
      });

      panelWrap.appendChild(panel);
    });

    card.appendChild(tabs);
    card.appendChild(panelWrap);

    if (status === "Booked") colBooked.appendChild(card);
    if (status === "Confirmed") colConfirmed.appendChild(card);
    if (status === "Cancelled") colCancelled.appendChild(card);
  });
}

/* -------------------- email widget -------------------- */
function wireEmailWidget() {
  const nameEl = document.getElementById("mailName");
  const fromEl = document.getElementById("mailFrom");
  const subEl = document.getElementById("mailSubject");
  const attachEl = document.getElementById("mailAttach");

  document.getElementById("mailSendBtn").addEventListener("click", () => {
    const name = nameEl.value.trim();
    const from = fromEl.value.trim();
    const subject = subEl.value.trim() || "Customer message";
    const attachmentNames = [...(attachEl.files || [])].map(f => f.name).join(", ");

    const body = [
      `Customer Name: ${name || "-"}`,
      `Customer Email: ${from || "-"}`,
      ``,
      `Attachments selected in widget: ${attachmentNames || "None"}`,
      ``,
      `Please review this customer request.`
    ].join("\n");

    const mailto = `mailto:cxdemo76@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  });

  document.getElementById("mailCancelBtn").addEventListener("click", clearEmailWidget);
  document.getElementById("mailClearBtn").addEventListener("click", clearEmailWidget);

  function clearEmailWidget() {
    nameEl.value = "";
    fromEl.value = "";
    subEl.value = "";
    attachEl.value = "";
  }
}

function safe(v) {
  return String(v ?? "").replace(/[<>&]/g, s => ({ "<":"&lt;", ">":"&gt;", "&":"&amp;" }[s]));
}