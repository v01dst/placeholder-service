export interface PlaceholderOptions {
  width: number;
  height: number;
  bg: string;
  fg: string;
  text: string;
  font: string;
  fmt: "svg";
}

export const DEFAULTS: PlaceholderOptions = {
  width: 640,
  height: 360,
  bg: "#1f2937",
  fg: "#f9fafb",
  text: "",
  font: "sans-serif",
  fmt: "svg",
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
  const maxFontSize = Math.min(o.height / 4, o.width / (o.text.length * 0.62));
  const fontSize = Math.max(10, Math.floor(maxFontSize));
  const safeText = escapeXml(o.text);
  const safeFont = escapeXml(o.font);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${o.width}" height="${o.height}" viewBox="0 0 ${o.width} ${o.height}">
  <rect width="100%" height="100%" fill="${o.bg}"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="${safeFont}" font-size="${fontSize}" fill="${o.fg}">${safeText}</text>
</svg>
`;
}
