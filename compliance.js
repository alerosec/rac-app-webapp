const storage = window.RACStorage;
const state = storage.loadState();
const auth = storage.loadAuth();

function renderComplianceList() {
  const list = document.querySelector("#complianceList");
  list.innerHTML = state.compliance.map((item) => `
    <button class="check-row" type="button">
      <span class="check-icon ${item.status === "Completed" ? "progress" : "pending"}">${item.status === "Completed" ? "✓" : "!"}</span>
      <span><strong>${item.topic}</strong><small>${item.requirement} · ${item.owner} · ${item.notes}</small></span>
      <span class="row-arrow">→</span>
    </button>
  `).join("");
}

function saveAndRender(payload) {
  state.compliance.unshift(payload);
  storage.saveState(state);
  renderComplianceList();
}

renderComplianceList();

const form = document.querySelector("#complianceForm");
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const topic = document.querySelector("#complianceTopic").value.trim();
  if (!topic) return;
  saveAndRender({
    id: crypto.randomUUID ? crypto.randomUUID() : `c-${Date.now()}`,
    topic,
    owner: document.querySelector("#complianceOwner").value.trim() || (auth?.name || "Local owner"),
    requirement: document.querySelector("#complianceRequirement").value,
    status: document.querySelector("#complianceStatus").value,
    notes: document.querySelector("#complianceNotes").value.trim() || "Captured through compliance workflow.",
  });
  form.reset();
  window.alert("Compliance item saved locally.");
});

const modal = document.querySelector("#complianceModal");
document.querySelector("#openComplianceModal").addEventListener("click", () => modal.showModal());
document.querySelectorAll("[data-close-compliance]").forEach((button) => button.addEventListener("click", () => modal.close()));
document.querySelector("#complianceModalForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const topic = document.querySelector("#complianceModalTopic").value.trim();
  if (!topic) return;
  saveAndRender({
    id: crypto.randomUUID ? crypto.randomUUID() : `c-${Date.now()}`,
    topic,
    owner: document.querySelector("#complianceModalOwner").value.trim() || (auth?.name || "Local owner"),
    requirement: document.querySelector("#complianceModalRequirement").value,
    status: document.querySelector("#complianceModalStatus").value,
    notes: document.querySelector("#complianceModalNotes").value.trim() || "Captured through compliance workflow.",
  });
  modal.close();
  modal.querySelector("form").reset();
  window.alert("Compliance item saved locally.");
});

const loginButton = document.querySelector("#showLogin");
loginButton.addEventListener("click", () => {
  window.location.href = "index.html";
});
