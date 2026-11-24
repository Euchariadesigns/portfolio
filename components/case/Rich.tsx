import type { ReactNode } from "react";

/*
  Inline text from the case studies: **bold**, *italic*, [link](url) and
  line breaks. Nothing else is interpreted.
*/
export default function Rich({ text }: { text: string }) {
  return <>{parse(text)}</>;
}

const TOKEN = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\)|\n)/g;

function parse(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let k = 0;
  for (const part of text.split(TOKEN)) {
    if (!part) continue;
    if (part === "\n") out.push(<br key={k++} />);
    else if (part.startsWith("**") && part.endsWith("**")) out.push(<strong key={k++}>{part.slice(2, -2)}</strong>);
    else if (part.startsWith("*") && part.endsWith("*") && part.length > 2) out.push(<em key={k++}>{part.slice(1, -1)}</em>);
    else if (part.startsWith("[")) {
      const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (m) {
        const external = /^https?:/.test(m[2]);
        out.push(
          <a key={k++} href={m[2]} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
            {m[1]}
          </a>,
        );
      } else out.push(part);
    } else out.push(part);
  }
  return out;
}
