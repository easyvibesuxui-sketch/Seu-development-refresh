import { statusLabel, withBase, type Highlight, type MappedProject } from "@/data/projects";
import styles from "./HeroMap.module.css";

const DROP_PATH = "M28 70C28 70 3 45 3 27a25 25 0 1 1 50 0C53 45 28 70 28 70z";

function drop(gradientId: string, from: string, to: string) {
  return `
    <svg class="${styles.drop}" viewBox="0 0 56 72" aria-hidden="true">
      <defs>
        <linearGradient id="${gradientId}" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stop-color="${from}"/>
          <stop offset="1" stop-color="${to}"/>
        </linearGradient>
      </defs>
      <path d="${DROP_PATH}" fill="url(#${gradientId})"/>
      <path d="${DROP_PATH}" fill="none" stroke="#ffffff" stroke-opacity=".35"/>
      <circle cx="28" cy="27" r="18" fill="#0e1a16" fill-opacity=".9"/>
      <circle cx="28" cy="27" r="18" fill="none" stroke="#ffffff" stroke-opacity=".25"/>
    </svg>`;
}

const icons: Record<Highlight["kind"], string> = {
  metro: `<path d="M5 17V7l7 7 7-7v10" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`,
  mall: `<path d="M6 8h12l-1 11H7L6 8z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M9 8a3 3 0 0 1 6 0" fill="none" stroke="currentColor" stroke-width="1.8"/>`,
  park: `<path d="M12 3l5 7h-3l4 6H6l4-6H7l5-7z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 16v5" stroke="currentColor" stroke-width="1.8"/>`,
};

export function createProjectPin(project: MappedProject, onClick: () => void) {
  const el = document.createElement("button");
  el.type = "button";
  el.className = `${styles.pin} ${styles.projectPin}`;
  el.dataset.status = project.status;
  el.setAttribute("aria-label", project.name);
  if (project.overviewSpread) {
    el.style.setProperty("--spread-x", `${project.overviewSpread.x}px`);
    el.dataset.labelOverview = project.overviewSpread.label;
  }
  const ongoing = project.status === "ongoing";
  el.innerHTML = `
    <span class="${styles.ground}"><span class="${styles.pulse}"></span></span>
    <span class="${styles.body}">
      ${drop(`drop-${project.id}`, ongoing ? "#3ee08d" : "#f3efe9", ongoing ? "#0a6f47" : "#9c968a")}
      <img class="${styles.logo}" src="${withBase("/brand/logo-wire.svg")}" alt="" />
    </span>
    <span class="${styles.label}">
      <span class="${styles.labelName}">${project.name}</span>
      <span class="${styles.chip}">${statusLabel[project.status]}</span>
    </span>`;
  el.addEventListener("click", (event) => {
    event.stopPropagation();
    onClick();
  });
  return el;
}

export function createHighlightPin(highlight: Highlight, distance: number) {
  const el = document.createElement("div");
  el.className = `${styles.pin} ${styles.highlightPin}`;
  el.dataset.project = highlight.project;
  el.setAttribute("role", "img");
  el.setAttribute("aria-label", highlight.name);
  el.innerHTML = `
    <span class="${styles.ground}"></span>
    <span class="${styles.body}">
      ${drop(`drop-${highlight.id}`, "#ffffff", "#b8b1a2")}
      <svg class="${styles.icon}" viewBox="0 0 24 24" aria-hidden="true">${icons[highlight.kind]}</svg>
    </span>
    <span class="${styles.label}">
      <span class="${styles.labelName}">${highlight.name}</span>
      <span class="${styles.distance}">${distance.toFixed(1)} km</span>
    </span>`;
  return el;
}
