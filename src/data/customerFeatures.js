export const CUSTOMER_ENVIRONMENT_DEFAULTS_VERSION = 1;

export const customerFeatures = Object.freeze({
  buddyEnabled:false,
  wildlifeDefault:"Off",
  fountainAnimationEnabled:false,
  dashboardHealthNoticeMode:"menu-badge",
  dashboardHotspotDensity:"minimal",
});

const legacyCustomerRoutes = {
  "Buddy's Garden":"Garden Games",
  "Buddy's Garden Journal":"Journal",
  "Buddy Garden Day":"New Journal Entry",
};

export const resolveCustomerRoute = (page) => (
  customerFeatures.buddyEnabled ? page : legacyCustomerRoutes[page] || page
);

export const resolveCustomerCompanion = (companion) => (
  !customerFeatures.buddyEnabled && companion === "buddy" ? "gardener" : companion
);
