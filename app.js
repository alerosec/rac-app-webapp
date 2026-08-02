const STORAGE_KEY = "rac-local-db-v1";
const AUTH_KEY = "rac-auth-v1";

const defaultState = {
  assessments: [
    { id: crypto.randomUUID ? crypto.randomUUID() : `a-${Date.now()}-1`, name: "2026 annual security review", framework: "NIST CSF 2.0", progress: 82, status: "In review", tone: "blue", icon: "N", owner: "Maya Chen", description: "Enterprise-wide review covering access, backups, and vendor controls." },
    { id: crypto.randomUUID ? crypto.randomUUID() : `a-${Date.now()}-2`, name: "Supplier risk assessment", framework: "Third-party risk", progress: 61, status: "Evidence requested", tone: "amber", icon: "S", owner: "Owen Bell", description: "Critical vendors need assurance evidence before renewal." },
  ],
  risks: [
    { id: crypto.randomUUID ? crypto.randomUUID() : `r-${Date.now()}-1`, title: "Privileged access reviews are inconsistent", detail: "Access control evidence has not been validated for two systems.", area: "Identity", score: 20, level: "high", owner: "Maya Chen", initials: "MC", status: "Needs review", statusTone: "amber" },
    { id: crypto.randomUUID ? crypto.randomUUID() : `r-${Date.now()}-2`, title: "Applicant record retention is undocumented", detail: "Retention trigger and deletion workflow need human validation.", area: "Privacy", score: 12, level: "medium", owner: "Alex Rivers", initials: "AR", status: "Draft remediation", statusTone: "slate" },
  ],
  evidence: [
    { id: crypto.randomUUID ? crypto.randomUUID() : `e-${Date.now()}-1`, type: "PDF", name: "Information Security Policy", meta: "Reviewed 12 Aug 2026 · 1.8 MB", tag: "Accepted" },
    { id: crypto.randomUUID ? crypto.randomUUID() : `e-${Date.now()}-2`, type: "XLS", name: "Supplier assurance register", meta: "Uploaded today · 624 KB", tag: "In review" },
  ],
  compliance: [
    { id: crypto.randomUUID ? crypto.randomUUID() : `c-${Date.now()}-1`, topic: "Data retention policy", owner: "Privacy team", requirement: "GDPR", status: "Pending", notes: "Evidence requested from records management." },
    { id: crypto.randomUUID ? crypto.randomUUID() : `c-${Date.now()}-2`, topic: "Vendor subprocessor register", owner: "Procurement", requirement: "ISO 27001", status: "In progress", notes: "Reviewing updated contracts and evidence." },
  ],
};

const assessmentList = document.querySelector("#assessmentList");
const riskTableBody = document.querySelector("#riskTableBody");
const evidenceList = document.querySelector("#evidenceList");
const complianceList = document.querySelector("#complianceList");
const toast = document.querySelector("#toast");
const assessmentModal = document.querySelector("#assessmentModal");
const dataEntryModal = document.querySelector("#dataEntryModal");
const complianceModal = document.querySelector("#complianceModal");
const authModal = document.querySelector("#authModal");
const accountName = document.querySelector("#accountName");
let toastTimer;
let state = loadState();
let currentUser = loadAuth();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(defaultState));
    const parsed = JSON.parse(raw);
    return {
      assessments: parsed.assessments || [],
      risks: parsed.risks || [],
      evidence: parsed.evidence || [],
      compliance: parsed.compliance || [],
    };
  } catch (error) {
    console.error("Unable to load local RAC data.", error);
    return JSON.parse(JSON.stringify(defaultState));
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadAuth() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY));
  } catch (error) {
    return null;
  }
}

function saveAuth(user) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 3200);
}

function getInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function updateAccountLabel() {
  if (currentUser?.name) {
    accountName.textContent = currentUser.name;
  } else {
    accountName.textContent = "Demo user";
  }
}

function renderAssessments() {
  assessmentList.innerHTML = state.assessments.map((assessment) => `
    <article class="assessment-item">
      <span class="assessment-icon">${assessment.icon || "D"}</span>
      <span><strong>${assessment.name}</strong><small>${assessment.framework} · ${assessment.owner || "Local owner"}</small></span>
      <span class="assessment-progress"><span class="progress-track"><i style="width:${assessment.progress || 0}%"></i></span><small><span>Progress</span><b>${assessment.progress || 0}%</b></small></span>
      <span class="tag tag-${assessment.tone || "slate"}">${assessment.status || "Draft"}</span>
    </article>
  `).join("");

  const assessmentCount = state.assessments.length;
  document.querySelector("#assessmentCount").textContent = assessmentCount;
  document.querySelector("#assessmentDelta").textContent = assessmentCount > 0 ? `+${assessmentCount}` : "0";
}

function renderRisks(filter = "all") {
  const visibleRisks = filter === "all" ? state.risks : state.risks.filter((risk) => risk.level === filter);
  riskTableBody.innerHTML = visibleRisks.map((risk) => `
    <tr>
      <td class="risk-name">${risk.title}<small>${risk.detail}</small></td>
      <td>${risk.area}</td>
      <td><span class="score ${risk.level}">${risk.score}</span></td>
      <td><span class="owner"><span class="owner-avatar">${risk.initials || getInitials(risk.owner || "Owner")}</span>${risk.owner || "Owner"}</span></td>
      <td><span class="tag tag-${risk.statusTone || "slate"}">${risk.status || "Draft"}</span></td>
      <td><button class="row-menu" type="button" aria-label="Open ${risk.title}" data-risk="${risk.title}">•••</button></td>
    </tr>
  `).join("");
}

function renderEvidence() {
  evidenceList.innerHTML = state.evidence.map((item) => `
    <article class="evidence-item">
      <span class="file-icon">${item.type}</span>
      <span><strong>${item.name}</strong><small>${item.meta}</small></span>
      <button type="button" data-evidence="${item.name}">${item.tag}</button>
    </article>
  `).join("");
}

function renderCompliance() {
  complianceList.innerHTML = state.compliance.map((item) => `
    <button class="check-row" type="button" data-check="${item.topic}">
      <span class="check-icon ${item.status === "Completed" ? "progress" : "pending"}">${item.status === "Completed" ? "✓" : "!"}</span>
      <span><strong>${item.topic}</strong><small>${item.requirement} · ${item.notes}</small></span>
      <span class="row-arrow">→</span>
    </button>
  `).join("");
}

function renderSummaryMetrics() {
  const highRiskCount = state.risks.filter((risk) => risk.level === "high").length;
  const complianceCount = state.compliance.length;
  const evidenceCount = state.evidence.length;
  const completedEntries = state.assessments.filter((assessment) => assessment.progress >= 80).length + state.compliance.filter((item) => item.status === "Completed").length;
  const pendingEntries = state.risks.filter((risk) => risk.status.includes("review") || risk.status.includes("requested") || risk.status.includes("progress")).length + state.compliance.filter((item) => item.status === "Pending" || item.status === "In progress").length;
  const draftEntries = state.assessments.filter((assessment) => assessment.status === "Draft").length + state.risks.filter((risk) => risk.status === "Draft remediation").length;
  const coveragePercent = Math.min(100, Math.round((completedEntries / Math.max(1, completedEntries + pendingEntries + draftEntries)) * 100));

  document.querySelector("#highRiskCount").textContent = highRiskCount;
  document.querySelector("#complianceCount").textContent = complianceCount;
  document.querySelector("#complianceDelta").textContent = complianceCount > 0 ? `+${complianceCount}` : "0";
  document.querySelector("#evidenceCount").textContent = evidenceCount;
  document.querySelector("#coveragePercent").textContent = `${coveragePercent}%`;
  document.querySelector("#completedEntries").textContent = completedEntries;
  document.querySelector("#pendingEntries").textContent = pendingEntries;
  document.querySelector("#draftEntries").textContent = draftEntries;
  document.querySelector("#complianceTag").textContent = `${complianceCount} items`;
}

function refreshDashboard() {
  renderAssessments();
  renderRisks();
  renderEvidence();
  renderCompliance();
  renderSummaryMetrics();
  saveState();
}

function ensureAuth() {
  if (!currentUser) {
    authModal.showModal();
  } else {
    updateAccountLabel();
  }
}

refreshDashboard();
ensureAuth();

document.querySelectorAll("[data-toast]").forEach((button) => {
  button.addEventListener("click", () => showToast(button.dataset.toast));
});

document.querySelector("#openAssessmentModal").addEventListener("click", () => {
  if (!currentUser) {
    authModal.showModal();
    return;
  }
  assessmentModal.showModal();
});

document.querySelector("#openDataEntryModal").addEventListener("click", () => {
  if (!currentUser) {
    authModal.showModal();
    return;
  }
  dataEntryModal.showModal();
});

document.querySelector("#openComplianceModal").addEventListener("click", () => {
  if (!currentUser) {
    authModal.showModal();
    return;
  }
  complianceModal.showModal();
});

document.querySelectorAll("[data-close-modal]").forEach((button) => button.addEventListener("click", () => assessmentModal.close()));
document.querySelectorAll("[data-close-data-entry]").forEach((button) => button.addEventListener("click", () => dataEntryModal.close()));
document.querySelectorAll("[data-close-compliance]").forEach((button) => button.addEventListener("click", () => complianceModal.close()));

document.querySelector("#assessmentForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.querySelector("#newAssessmentName").value.trim();
  const framework = document.querySelector("#framework").value;
  const owner = document.querySelector("#assessmentOwner").value.trim();
  const description = document.querySelector("#assessmentDescription").value.trim();
  if (!name) return;
  state.assessments.unshift({
    id: crypto.randomUUID ? crypto.randomUUID() : `a-${Date.now()}`,
    name,
    framework,
    progress: 14,
    status: "Draft",
    tone: "slate",
    icon: "D",
    owner: owner || currentUser?.name || "Local owner",
    description: description || "Captured through the local RAC prototype.",
  });
  state.evidence.unshift({
    id: crypto.randomUUID ? crypto.randomUUID() : `e-${Date.now()}`,
    type: "DOC",
    name: `${name} brief`,
    meta: `Captured by ${currentUser?.name || "local user"} · pending review`,
    tag: "Pending",
  });
  refreshDashboard();
  assessmentModal.close();
  event.currentTarget.reset();
  showToast("Assessment saved locally. You can review it in the dashboard and update it later.");
});

document.querySelector("#dataEntryForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const entryType = document.querySelector("#entryType").value;
  const title = document.querySelector("#entryTitle").value.trim();
  const area = document.querySelector("#entryArea").value.trim();
  const owner = document.querySelector("#entryOwner").value.trim();
  const status = document.querySelector("#entryStatus").value;
  const notes = document.querySelector("#entryNotes").value.trim();
  if (!title) return;

  if (entryType === "risk") {
    state.risks.unshift({
      id: crypto.randomUUID ? crypto.randomUUID() : `r-${Date.now()}`,
      title,
      detail: notes || "Captured through local data entry.",
      area: area || "Operations",
      score: status === "Completed" ? 10 : 16,
      level: status === "Completed" ? "medium" : "high",
      owner: owner || currentUser?.name || "Local owner",
      initials: getInitials(owner || currentUser?.name || "Local owner"),
      status,
      statusTone: status === "Completed" ? "mint" : status === "Evidence requested" ? "blue" : "amber",
    });
  } else {
    state.compliance.unshift({
      id: crypto.randomUUID ? crypto.randomUUID() : `c-${Date.now()}`,
      topic: title,
      owner: owner || currentUser?.name || "Local owner",
      requirement: area || "Internal policy",
      status,
      notes: notes || "Captured through local data entry.",
    });
  }

  state.evidence.unshift({
    id: crypto.randomUUID ? crypto.randomUUID() : `e-${Date.now()}`,
    type: entryType === "risk" ? "PDF" : "DOC",
    name: title,
    meta: `${entryType === "risk" ? "Risk" : "Compliance"} record captured locally · ${status}`,
    tag: status,
  });

  refreshDashboard();
  dataEntryModal.close();
  event.currentTarget.reset();
  showToast(`${entryType === "risk" ? "Risk" : "Compliance"} input saved locally.`);
});

document.querySelector("#complianceForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const topic = document.querySelector("#complianceTopic").value.trim();
  const owner = document.querySelector("#complianceOwner").value.trim();
  const requirement = document.querySelector("#complianceRequirement").value;
  const status = document.querySelector("#complianceStatus").value;
  const notes = document.querySelector("#complianceNotes").value.trim();
  if (!topic) return;
  state.compliance.unshift({
    id: crypto.randomUUID ? crypto.randomUUID() : `c-${Date.now()}`,
    topic,
    owner: owner || currentUser?.name || "Local owner",
    requirement,
    status,
    notes: notes || "Captured through compliance intake.",
  });
  state.evidence.unshift({
    id: crypto.randomUUID ? crypto.randomUUID() : `e-${Date.now()}`,
    type: "DOC",
    name: topic,
    meta: `Compliance record captured locally · ${status}`,
    tag: status,
  });
  refreshDashboard();
  complianceModal.close();
  event.currentTarget.reset();
  showToast("Compliance input saved locally.");
});

document.querySelectorAll(".filter").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderRisks(button.dataset.filter);
  });
});

riskTableBody.addEventListener("click", (event) => {
  const button = event.target.closest("[data-risk]");
  if (button) showToast(`Opening local risk: ${button.dataset.risk}`);
});

evidenceList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-evidence]");
  if (button) showToast(`Evidence status opened: ${button.dataset.evidence}`);
});

complianceList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-check]");
  if (button) showToast(`Compliance review opened: ${button.dataset.check}`);
});

document.querySelector("#mockUpload").addEventListener("click", () => {
  state.evidence.unshift({
    id: crypto.randomUUID ? crypto.randomUUID() : `e-${Date.now()}`,
    type: "PDF",
    name: "Fresh upload packet",
    meta: `Queued by ${currentUser?.name || "local user"} · ready for review`,
    tag: "Queued",
  });
  refreshDashboard();
  showToast("New evidence item queued locally for review.");
});

document.querySelector("#showLogin").addEventListener("click", () => authModal.showModal());
document.querySelector("#accountMenu").addEventListener("click", () => authModal.showModal());
document.querySelectorAll("[data-close-auth]").forEach((button) => button.addEventListener("click", () => authModal.close()));
document.querySelector("#mockGoogle").addEventListener("click", () => {
  currentUser = { name: "Google demo user", email: "google@local.dev" };
  saveAuth(currentUser);
  updateAccountLabel();
  authModal.close();
  showToast("Signed in with a local demo account.");
});
document.querySelector("#authForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const email = document.querySelector("#demoEmail").value.trim();
  const password = document.querySelector("#authForm input[name='password']").value;
  if (!email.includes("@") || password.length < 6) {
    showToast("Please use a valid email address and a password with at least 6 characters.");
    return;
  }
  currentUser = { name: email.split("@")[0] || "Demo user", email };
  saveAuth(currentUser);
  updateAccountLabel();
  authModal.close();
  showToast("Signed in and ready to capture local RAC data.");
});

document.querySelector("#launchReviewFlow").addEventListener("click", () => showToast("Review queue opened with your latest local assessments and compliance items."));
document.querySelector("#viewReviewSummary").addEventListener("click", () => showToast(`Review summary: ${state.assessments.length} assessments, ${state.compliance.length} compliance items, ${state.evidence.length} evidence records.`));

document.querySelector("#mobileMenu").addEventListener("click", () => document.querySelector(".sidebar").classList.toggle("open"));
document.querySelectorAll(".nav-link").forEach((link) => link.addEventListener("click", () => {
  document.querySelectorAll(".nav-link").forEach((item) => item.classList.remove("active"));
  link.classList.add("active");
  document.querySelector(".sidebar").classList.remove("open");
}));
