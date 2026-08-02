(function () {
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

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return JSON.parse(JSON.stringify(defaultState));
      }
      const parsed = JSON.parse(raw);
      return {
        assessments: parsed.assessments || [],
        risks: parsed.risks || [],
        evidence: parsed.evidence || [],
        compliance: parsed.compliance || [],
      };
    } catch (error) {
      console.error("Unable to load RAC state", error);
      return JSON.parse(JSON.stringify(defaultState));
    }
  }

  function saveState(state) {
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

  function getInitials(name) {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
  }

  window.RACStorage = { STORAGE_KEY, AUTH_KEY, defaultState, loadState, saveState, loadAuth, saveAuth, getInitials };
})();
