<div align="center">

# 🖼️ placeholder-service

**Wireframe-ready placeholder images. One URL, infinite sizes. Zero native deps.**

[![CI](https://github.com/v01dst/placeholder-service/actions/workflows/ci.yml/badge.svg)](https://github.com/v01dst/placeholder-service/actions/workflows/ci.yml)
![License](https://img.shields.io/badge/license-MIT-8A2BE2)
![Node](https://img.shields.io/badge/node-22-339933?logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-strict-3178C6?logo=typescript&logoColor=white)
![Tests](https://img.shields.io/badge/tests-18%20passing-brightgreen)

`svg output` · `crisp at any dpi` · `custom text & colors` · `cache-friendly`

</div>

---

## ✨ Features

- **📐 Any size** — `/640x360`, up to 4000×4000, validated
- **✏️ Custom text** — label your wireframes, auto-fitted font size, XML-escaped
- **🎨 Full styling** — background + foreground hex colors, font family
- **🧬 SVG native** — crisp on retina, tiny payloads, no image library needed
- **⚡ Zero-dep rendering** — hand-built SVG, no native modules, no canvas
- **♻️ Cache-friendly** — `Cache-Control: public, max-age=86400`

## 🚀 Quick Start

```bash
git clone https://github.com/v01dst/placeholder-service
cd placeholder-service
npm ci
npm start
```

Or with Docker:

```bash
docker compose up -d
```

## 📡 Usage

### Basic

```html
<img src="http://localhost:3000/640x360" alt="placeholder">
```

### Custom text & colors

```html
<img src="http://localhost:3000/800x450?text=Hero%20Banner&bg=%231226AA&fg=%23ffffff" alt="hero">
```

### Parameters

| Param    | Default        | Notes                       |
|----------|----------------|-----------------------------|
| `:size`  | *(required)*   | `WxH` form, 16–4000 px      |
| `text`   | `W × H`        | Max 64 chars, XML-escaped   |
| `bg`     | `#1f2937`      | Background hex              |
| `fg`     | `#f9fafb`      | Text hex                    |
| `font`   | `sans-serif`   | Alphanumeric + space/dash   |

### Errors

| Status | Meaning                    |
|--------|----------------------------|
| `400`  | Invalid size/colors/font   |

## 🧱 Tech Stack

| Layer     | Tech                |
|-----------|---------------------|
| Runtime   | Node.js 22          |
| Language  | TypeScript (strict) |
| Framework | Fastify 5           |
| Rendering | Hand-built SVG      |
| Testing   | Vitest 5            |
| Packaging | Docker + compose    |
| CI        | GitHub Actions      |

---

<div align="center">

Built with ⚡ by **v01dst**

[![GitHub](https://img.shields.io/badge/github-v01dst-181717?logo=github)](https://github.com/v01dst)
[![Discord](https://img.shields.io/badge/discord-9p.1-5865F2?logo=discord&logoColor=white)](https://discord.com/users/9p.1)

*Project 010 / 99 — The Loop*

</div>
