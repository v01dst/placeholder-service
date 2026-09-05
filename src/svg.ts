export interface PlaceholderOptions {
  width: number;
  height: number;
  bg: string;
  fg: string;
  text: string;
  font: string;
  fmt: "svg";
  gradient: [string, string] | null;
}

export const DEFAULTS: PlaceholderOptions = {
  width: 640,
  height: 360,
  bg: "#1f2937",
  fg: "#f9fafb",
  text: "",
  font: "sans-serif",
  fmt: "svg",
  gradient: null,
};

const HEX_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export interface ParsedQuery {
  options: PlaceholderOptions;
  errors: string[];
}

export function parseQuery(q: Record<string, unknown>): ParsedQuery {
  const errors: string[] = [];
  const opts: PlaceholderOptions = { ...DEFAULTS };

  const size = q.size;
  if (typeof size === "string" && /^\d+x\d+$/.test(size)) {
    const [w, h] = size.split("x");
    const width = Number(w);
    const height = Number(h);
    if (!Number.isInteger(width) || width < 16 || width > 4000) {
      errors.push("width must be an integer 16-4000");
    } else {
      opts.width = width;
    }
    if (!Number.isInteger(height) || height < 16 || height > 4000) {
      errors.push("height must be an integer 16-4000");
    } else {
      opts.height = height;
    }
  } else if (q.size !== undefined) {
    errors.push("size must be in WxH form, e.g. 640x360");
  } else {
    const width = Number(q.width);
    const height = Number(q.height);
    if (q.width !== undefined) {
      if (!Number.isInteger(width) || width < 16 || width > 4000) {
        errors.push("width must be an integer 16-4000");
      } else {
        opts.width = width;
      }
    }
    if (q.height !== undefined) {
      if (!Number.isInteger(height) || height < 16 || height > 4000) {
        errors.push("height must be an integer 16-4000");
      } else {
        opts.height = height;
      }
    }
  }

  if (q.bg !== undefined) {
    const bg = String(q.bg);
    if (!HEX_RE.test(bg)) errors.push("bg must be a hex color");
    else opts.bg = bg;
  }

  if (q.fg !== undefined) {
    const fg = String(q.fg);
    if (!HEX_RE.test(fg)) errors.push("fg must be a hex color");
    else opts.fg = fg;
  }

  if (q.text !== undefined && String(q.text).trim() !== "") {
    const text = String(q.text).slice(0, 64);
    opts.text = text;
  }

  if (q.gradient !== undefined) {
    const parts = String(q.gradient).split(",");
    if (parts.length !== 2 || !HEX_RE.test(parts[0]!) || !HEX_RE.test(parts[1]!)) {
      errors.push("gradient must be two hex colors like %23ff0000,%230000ff");
    } else {
      opts.gradient = [parts[0]!, parts[1]!];
    }
  }

  if (q.font !== undefined) {
    const font = String(q.font);
    if (!/^[a-zA-Z0-9 _-]{1,40}$/.test(font)) {
      errors.push("font contains invalid characters");
    } else {
      opts.font = font;
    }
  }

  if (opts.text === "") {
    opts.text = `${opts.width} × ${opts.height}`;
  }

  return { options: opts, errors };
}

function worstLineFits(
  lines: string[],
  fontSize: number,
  charWidth: number,
  maxWidth: number
): boolean {
  return lines.every((l) => l.length * fontSize * charWidth <= maxWidth);
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Render the placeholder as a standalone SVG string. */
export function renderSvg(o: PlaceholderOptions): string {
  const defs = o.gradient
    ? `<defs>
  <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="${o.gradient[0]}"/>
    <stop offset="100%" stop-color="${o.gradient[1]}"/>
  </linearGradient>
</defs>
`
    : "";
  const fill = o.gradient ? "url(#g)" : o.bg;

  const maxTextWidth = o.width * 0.9;
  const approxCharWidth = 0.58;
  let fontSize = Math.max(
    10,
    Math.floor(Math.min(o.height / 4, (o.width / Math.max(o.text.length, 1)) / approxCharWidth))
  );
  let lines: string[] = [];

  for (let attempt = 0; attempt < 12 && fontSize >= 10; attempt++) {
    lines = [];
    let current = "";
    for (const w of o.text.split(/\s+/).filter(Boolean)) {
      const candidate = current ? `${current} ${w}` : w;
      if (candidate.length * fontSize * approxCharWidth <= maxTextWidth) {
        current = candidate;
      } else {
        if (current) lines.push(current);
        current = w;
      }
    }
    if (current) lines.push(current);
    if (worstLineFits(lines, fontSize, approxCharWidth, maxTextWidth)) break;
    fontSize = Math.floor(fontSize * 0.85);
  }

  const lineHeight = Math.floor(fontSize * 1.25);
  const startY =
    o.height / 2 - ((lines.length - 1) * lineHeight) / 2 + fontSize * 0.35;
  const tspans = lines
    .map((line, i) => {
      const y = Math.round(startY + i * lineHeight);
      return `  <text x="50%" y="${y}" dominant-baseline="middle" text-anchor="middle" font-family="${escapeXml(o.font)}" font-size="${fontSize}" fill="${o.fg}">${escapeXml(line)}</text>`;
    })
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${o.width}" height="${o.height}" viewBox="0 0 ${o.width} ${o.height}">
  ${defs}<rect width="100%" height="100%" fill="${fill}"/>
${tspans}
</svg>
`;
}
