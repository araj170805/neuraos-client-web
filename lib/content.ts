/** Site copy and links. Placeholder `#` targets wait on real URLs (see PROGRESS.md). */

export const brandName = "NeuraOS";

/** Section anchors: the ids sections render and the hrefs links point at. */
export const sectionIds = {
  top: "top",
  cores: "cores",
  privacy: "private",
  app: "app",
  get: "get",
} as const;

export const navLinks = [
  { label: "Cores", href: `#${sectionIds.cores}` },
  { label: "Privacy", href: `#${sectionIds.privacy}` },
  { label: "App", href: `#${sectionIds.app}` },
] as const;

/** The web app; signed-out visitors land on Google sign-in. */
export const webAppHref = "/chat";

/** App calls to action. Web opens the app; the stores show a "launching soon" notice. */
export const launchCtas = {
  nav: { label: "Try it" },
  hero: { label: "Try it on web" },
  appStore: { label: "App Store", message: "NeuraOS for iOS" },
  googlePlay: { label: "Google Play", message: "NeuraOS for Android" },
} as const;

/** Social profiles. Placeholders: the design links to each site's home page. */
export const socialLinks = [
  { label: "X / Twitter", href: "https://x.com/" },
  { label: "YouTube", href: "https://www.youtube.com/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/" },
] as const;

export const footerQuote = {
  text: "Medicine is a science of uncertainty and an art of probability.",
  author: "Sir William Osler",
} as const;

/** Privacy guarantees shown as label / value rows. */
export const privacyFacts = [
  { label: "De-identification", value: "On-device" },
  { label: "Model training", value: "Never on your cases" },
  { label: "Access", value: "Every view logged" },
] as const;

/** Footer link columns. Clinical and Company pages don't exist yet: they point at the top. */
export const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "Cores", href: `#${sectionIds.cores}` },
      { label: "Privacy", href: `#${sectionIds.privacy}` },
      { label: "The app", href: `#${sectionIds.app}` },
    ],
  },
  {
    title: "Clinical",
    links: [
      { label: "Validation", href: `#${sectionIds.top}` },
      { label: "Safety", href: `#${sectionIds.top}` },
      { label: "For hospitals", href: `#${sectionIds.top}` },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: `#${sectionIds.top}` },
      { label: "Careers", href: `#${sectionIds.top}` },
      { label: "Contact", href: `#${sectionIds.top}` },
    ],
  },
] as const;

export const legalLinks = [
  { label: "Privacy", href: `#${sectionIds.privacy}` },
  { label: "Terms", href: `#${sectionIds.top}` },
  { label: "Security", href: `#${sectionIds.top}` },
] as const;

/** Example personalisation settings shown as chips in the App section. */
export const appSettings = ["Cardiology", "Detailed reasoning", "Guidelines first"] as const;

/** The six cores, in the order the scroll highlights them (and the 3D hexes light up). */
export const cores = [
  {
    name: "Second opinion",
    description:
      "Lay out a case and get a ranked differential, with the reasoning behind each diagnosis.",
  },
  {
    name: "Case files",
    description:
      "Labs, notes and imaging reports in one thread that follows the patient across visits.",
  },
  {
    name: "Imaging",
    description:
      "Reads alongside you — flags findings on X-ray, CT and dermatology photos for you to confirm.",
  },
  {
    name: "Evidence",
    description: "Every claim links to the guideline, trial or review it came from.",
  },
  {
    name: "Stay current",
    description:
      "A weekly brief of new guidelines and trials in your specialty, summarised in minutes.",
  },
  {
    name: "Tuned to you",
    description: "Learns your specialty, your formulary and how you like answers written.",
  },
] as const;
