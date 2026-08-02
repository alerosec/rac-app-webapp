const storage = window.RACStorage;
const state = storage.loadState();
const auth = storage.loadAuth();

function renderRiskTable() {
  const tbody = document.querySelector("#riskTableBody");
  tbody.innerHTML = state.risks.map((risk) => `
    <tr>
      <td class="risk-name">${risk.title}<small>${risk.detail}</small></td>
      <td>${risk.area}</td>
      <td><span class="score ${risk.level}">${risk.score}</span></td>
      <td><span class="owner"><span class="owner-avatar">${risk.initials || storage.getInitials(risk.owner || "Owner")}</span>${risk.owner || "Owner"}</span></td>
      <td><span class="tag tag-${risk.statusTone || "slate"}">${risk.status || "Draft"}</span></td>
    </tr>
  `).join("");
}

function saveAndRender(payload) {
  state.risks.unshift(payload);
  storage.saveState(state);
  renderRiskTable();
}

renderRiskTable();

const riskForm = document.querySelector("#riskForm");
riskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = document.querySelector("#riskTitle").value.trim();
  if (!title) return;
  saveAndRender({
    id: crypto.randomUUID ? crypto.randomUUID() : `r-${Date.now()}`,
    title,
    detail: document.querySelector("#riskNotes").value.trim() || "Captured through the RAC workflow.",
    area: document.querySelector("#riskArea").value.trim() || "Operations",
    score: Number(document.querySelector("#riskScore").value),
    level: Number(document.querySelector("#riskScore").value) >= 16 ? "high" : "medium",
    owner: document.querySelector("#riskOwner").value.trim() || (auth?.name || "Authenticated owner"),
    initials: storage.getInitials(document.querySelector("#riskOwner").value.trim() || (auth?.name || "Authenticated owner")),
    status: document.querySelector("#riskStatus").value,
    statusTone: document.querySelector("#riskStatus").value === "Completed" ? "mint" : document.querySelector("#riskStatus").value === "Evidence requested" ? "blue" : "amber",
  });
  riskForm.reset();
  window.alert("Risk entry captured.");
});

const riskModal = document.querySelector("#riskModal");
document.querySelector("#openRiskModal").addEventListener("click", () => riskModal.showModal());
document.querySelectorAll("[data-close-risk]").forEach((button) => button.addEventListener("click", () => riskModal.close()));
document.querySelector("#riskModalForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const title = document.querySelector("#riskModalTitleInput").value.trim();
  if (!title) return;
  saveAndRender({
    id: crypto.randomUUID ? crypto.randomUUID() : `r-${Date.now()}`,
    title,
    detail: document.querySelector("#riskModalNotes").value.trim() || "Captured through the RAC workflow.",
    area: document.querySelector("#riskModalArea").value.trim() || "Operations",
    score: Number(document.querySelector("#riskModalScore").value),
    level: Number(document.querySelector("#riskModalScore").value) >= 16 ? "high" : "medium",
    owner: document.querySelector("#riskModalOwner").value.trim() || (auth?.name || "Authenticated owner"),
    initials: storage.getInitials(document.querySelector("#riskModalOwner").value.trim() || (auth?.name || "Authenticated owner")),
    status: document.querySelector("#riskModalStatus").value,
    statusTone: document.querySelector("#riskModalStatus").value === "Completed" ? "mint" : document.querySelector("#riskModalStatus").value === "Evidence requested" ? "blue" : "amber",
  });
  riskModal.close();
  riskModal.querySelector("form").reset();
  window.alert("Risk entry captured.");
});

const loginButton = document.querySelector("#showLogin");
loginButton.addEventListener("click", () => {
  window.location.href = "index.html";
});
