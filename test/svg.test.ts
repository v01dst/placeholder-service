import { describe, expect, it } from "vitest";
import { parseQuery, renderSvg } from "../src/svg.js";

describe("parseQuery", () => {
  it("parses size in WxH form", () => {
    const { options, errors } = parseQuery({ size: "800x600" });
    expect(errors).toEqual([]);
    expect(options.width).toBe(800);
    expect(options.height).toBe(600);
  });

  it("parses separate width/height", () => {
    const { options, errors } = parseQuery({ width: "320", height: "240" });
    expect(errors).toEqual([]);
    expect(options.width).toBe(320);
    expect(options.height).toBe(240);
  });

  it("rejects tiny and huge sizes", () => {
    expect(parseQuery({ size: "5x100" }).errors.length).toBeGreaterThan(0);
    expect(parseQuery({ size: "5000x100" }).errors.length).toBeGreaterThan(0);
    expect(parseQuery({ width: "0" }).errors.length).toBeGreaterThan(0);
  });

  it("defaults text to dimensions", () => {
    const { options } = parseQuery({ size: "640x360" });
    expect(options.text).toBe("640 × 360");
  });

  it("accepts custom text and colors", () => {
    const { options, errors } = parseQuery({
      size: "300x200",
      text: "Hero image",
      bg: "#112233",
      fg: "#fff",
    });
    expect(errors).toEqual([]);
    expect(options.text).toBe("Hero image");
    expect(options.bg).toBe("#112233");
    expect(options.fg).toBe("#fff");
  });

  it("truncates long text to 64 chars", () => {
    const { options } = parseQuery({ text: "x".repeat(200) });
    expect(options.text).toHaveLength(64);
  });

  it("rejects bad colors", () => {
    expect(parseQuery({ bg: "red" }).errors.length).toBeGreaterThan(0);
    expect(parseQuery({ fg: "javascript:alert(1)" }).errors.length).toBeGreaterThan(0);
  });

  it("rejects fonts with special characters", () => {
    expect(parseQuery({ font: "a;b" }).errors.length).toBeGreaterThan(0);
  });
});

describe("renderSvg", () => {
  it("produces a valid svg with dimensions", () => {
    const svg = renderSvg({
      width: 400,
      height: 200,
      bg: "#000",
      fg: "#fff",
      text: "400 × 200",
      font: "sans-serif",
      fmt: "svg",
      gradient: null,
    });
    expect(svg).toContain('width="400"');
    expect(svg).toContain('height="200"');
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
    expect(svg).toContain('fill="#000"');
    expect(svg).toContain("400 × 200");
  });

  it("escapes xml-unsafe text", () => {
    const svg = renderSvg({
      width: 300,
      height: 150,
      bg: "#000",
      fg: "#fff",
      text: '<script>alert("x")</script>',
      font: "sans-serif",
      fmt: "svg",
      gradient: null,
    });
    expect(svg).not.toContain("<script>");
    expect(svg).toContain("&lt;script&gt;");
  });

  it("scales font with the image size", () => {
    const big = renderSvg({
      width: 1200,
      height: 600,
      bg: "#000",
      fg: "#fff",
      text: "big",
      font: "sans-serif",
      fmt: "svg",
      gradient: null,
    });
    const small = renderSvg({
      width: 100,
      height: 50,
      bg: "#000",
      fg: "#fff",
      text: "big",
      font: "sans-serif",
      fmt: "svg",
      gradient: null,
    });
    const fontOf = (s: string) => Number(s.match(/font-size="(\d+)"/)?.[1]);
    expect(fontOf(big)).toBeGreaterThan(fontOf(small));
  });
});

describe("gradient", () => {
  it("parses two valid colors", () => {
    const { options, errors } = parseQuery({ gradient: "#ff0000,#00ff00" });
    expect(errors).toEqual([]);
    expect(options.gradient).toEqual(["#ff0000", "#00ff00"]);
  });

  it("rejects malformed gradients", () => {
    expect(parseQuery({ gradient: "red" }).errors.length).toBeGreaterThan(0);
    expect(parseQuery({ gradient: "#fff,#fff,#fff" }).errors.length).toBeGreaterThan(0);
  });

  it("renders a linearGradient instead of solid fill", () => {
    const svg = renderSvg({
      width: 400,
      height: 200,
      bg: "#000",
      fg: "#fff",
      text: "hero",
      font: "sans-serif",
      fmt: "svg",
      gradient: ["#ff0000", "#00ff00"],
    });
    expect(svg).toContain("linearGradient");
    expect(svg).toContain('fill="url(#g)"');
    expect(svg).toContain('stop-color="#ff0000"');
  });

  it("keeps solid bg when gradient is null", () => {
    const svg = renderSvg({
      width: 400,
      height: 200,
      bg: "#123456",
      fg: "#fff",
      text: "x",
      font: "sans-serif",
      fmt: "svg",
      gradient: null,
    });
    expect(svg).not.toContain("linearGradient");
    expect(svg).toContain('fill="#123456"');
  });
});
