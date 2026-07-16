export const HEALTH_DRAFT_KEY = "jardinSoleilActiveHealthCase";
export const HEALTH_PAGE_KEY = "jardinSoleilActivePage";

export const createHealthDraft = (seed = {}) => {
  const now = new Date().toISOString();
  return {
    id:`health-case-draft-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    plantId:"", createdAt:now, updatedAt:now, status:"Draft", currentStep:"plant",
    photoIds:[], photoLabels:{}, symptoms:[], pestEvidence:[], recentConditions:[],
    affectedArea:"leaves", timeline:"", observations:"", possibleCauses:[],
    recommendedNextSteps:[], providerStatus:null, photosNeedReselection:false,
    ...seed,
  };
};

export function loadHealthDraft() {
  try {
    const value = JSON.parse(localStorage.getItem(HEALTH_DRAFT_KEY) || "null");
    return value?.id && value.status === "Draft" ? value : null;
  } catch { return null; }
}

export function saveHealthDraft(draft) {
  if (!draft?.id) return;
  localStorage.setItem(HEALTH_DRAFT_KEY, JSON.stringify({ ...draft, updatedAt:new Date().toISOString() }));
}

export const clearHealthDraft = () => localStorage.removeItem(HEALTH_DRAFT_KEY);
