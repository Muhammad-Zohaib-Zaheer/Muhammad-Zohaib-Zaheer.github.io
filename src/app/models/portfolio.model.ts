// Shapes of everything in data/portfolio.data.ts.
// Change the content there; change these types only when a section needs a new field.

// #region Shared

/** Names of the symbols in public/icons.svg. */
export type IconName =
  | 'arrow-right'
  | 'arrow-up'
  | 'arrow-up-right'
  | 'award'
  | 'book'
  | 'briefcase'
  | 'check'
  | 'code'
  | 'copy'
  | 'database'
  | 'github'
  | 'globe'
  | 'layers'
  | 'linkedin'
  | 'mail'
  | 'map-pin'
  | 'menu'
  | 'rotate'
  | 'server'
  | 'shield'
  | 'tool'
  | 'users'
  | 'x'
  | 'zap';

export interface Link {
  label: string;
  href: string;
}

export interface IconText {
  icon: IconName;
  text: string;
}

export interface IconLink extends Link {
  icon: IconName;
}

// #endregion

// #region Site-wide

export interface Seo {
  title: string;
  description: string;
}

export interface Profile {
  name: string;
  initials: string;
  role: string;
  location: string;
  email: string;
  /** Profile links shown in the contact section and the footer. */
  socials: IconLink[];
  /** Path inside public/. Leave empty to show the initials instead. */
  photo: string;
  /** Path inside public/ to a PDF. Leave empty to hide the resume button. */
  resumeUrl: string;
}

export interface NavItem {
  /** Must match the id of the section element. */
  id: string;
  label: string;
}

/** Small interface strings that are not part of any one section. */
export interface UiText {
  skipToContent: string;
  openMenu: string;
  closeMenu: string;
  resume: string;
  scrollDown: string;
  backToTop: string;
  builtWith: string;
}

// #endregion

// #region Hero and avatar

export interface HeroAction extends IconLink {
  variant: 'primary' | 'ghost';
}

export interface Stat {
  value: string;
  label: string;
}

export interface Hero {
  availability: string;
  greeting: string;
  /** Cycled by the typewriter next to the greeting. */
  roles: string[];
  headline: { start: string; highlight: string; end: string };
  intro: string;
  actions: HeroAction[];
  stats: Stat[];
}

export interface AvatarLook {
  /**
   * Optional .glb file inside public/ (for example a model made from your photo).
   * When set it replaces the built-in character.
   */
  modelUrl: string;
  /**
   * Optional cut-out photo (transparent PNG or WebP) inside public/. Used when modelUrl is empty;
   * it is shaped into a 3D relief in the browser. When both are empty the built-in character is used.
   */
  photoUrl: string;
  skin: string;
  hair: string;
  eyes: string;
  lips: string;
  shirt: string;
  /** Blazer cloth: base colour, the dark checks and the thin light lines. */
  blazer: string;
  blazerCheck: string;
  blazerLine: string;
  beard: boolean;
  /** Light moustache. */
  stubble: boolean;
  glasses: boolean;
  watch: boolean;
  /** Speech bubble shown while the avatar waves. */
  greeting: string;
  hint: string;
  /** Labels that orbit around the avatar. */
  orbitLabels: string[];
  /** Shown on the floating editor panel and the laptop screen. */
  codeFileName: string;
  codeLines: string[];
}

// #endregion

// #region Sections

export interface About {
  title: string;
  /** Short labels floating around the photo. */
  photoBadges: string[];
  paragraphs: string[];
  tags: string[];
  strengthsTitle: string;
  strengths: (IconText & { title: string })[];
}

export interface SkillGroup {
  label: string;
  icon: IconName;
  items: string[];
}

export interface Skills {
  title: string;
  intro: string;
  sphereHint: string;
  groups: SkillGroup[];
}

export interface Job {
  company: string;
  companyUrl: string;
  role: string;
  period: string;
  location: string;
  summary: string;
  points: string[];
  stack: string[];
}

export interface Project {
  name: string;
  context: string;
  summary: string;
  points: string[];
  stack: string[];
  /** Featured projects take the full row. */
  featured: boolean;
  links: Link[];
}

export interface Degree {
  degree: string;
  school: string;
  schoolUrl: string;
  location: string;
  period: string;
  detail: string;
}

export interface Award {
  title: string;
  event: string;
  detail: string;
  link: Link | null;
}

export interface Language {
  name: string;
  level: string;
  detail: string;
  /** 0 to 100, drives the bar width. */
  proficiency: number;
}

export interface Highlights {
  title: string;
  awardsTitle: string;
  awards: Award[];
  languagesTitle: string;
  languages: Language[];
}

export interface Contact {
  title: string;
  text: string;
  emailLabel: string;
  copyLabel: string;
  copiedLabel: string;
  facts: IconText[];
}

/** Section wrapper for list-style sections. */
export interface ListSection<T> {
  title: string;
  intro: string;
  items: T[];
}

// #endregion

export interface Portfolio {
  seo: Seo;
  profile: Profile;
  nav: NavItem[];
  ui: UiText;
  hero: Hero;
  avatar: AvatarLook;
  about: About;
  skills: Skills;
  experience: ListSection<Job>;
  projects: ListSection<Project>;
  education: ListSection<Degree>;
  highlights: Highlights;
  contact: Contact;
  footer: { text: string };
}
