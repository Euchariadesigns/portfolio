import type { Project } from "@/lib/projects";

export default function ProjectIcon({ project }: { project: Project }) {
  const { icon, id } = project;
  if (icon.kind === "flags") {
    return (
      <span className="p-icon p-icon--flags" aria-hidden="true">
        <span className="flag flag-ga" />
        <span className="flag flag-td" />
        <span className="flag flag-cm" />
      </span>
    );
  }
  if (id === "margin") {
    return (
      <span className="p-icon p-icon--app" aria-hidden="true">
        <img src={icon.src} alt="" width={36} height={36} />
      </span>
    );
  }
  return (
    <span className={`p-icon${icon.round ? " p-icon--round" : ""}`} aria-hidden="true">
      <img src={icon.src} alt="" width={26} height={26} />
    </span>
  );
}
