# REC WayFinder — 3D Web Campus Navigation System
**Rajalakshmi Engineering College (REC), Chennai**

REC WayFinder is an interactive 3D Web Campus Navigation System built with **React**, **TypeScript**, **Vite**, **Three.js**, **React Three Fiber**, and **Tailwind CSS**.

---

## 🌟 Key Features
- **3D Atmospheric Sky & Sunlight Brightness Control**: Outdoor 3D WebGL atmosphere with 1-click brightness cycling button.
- **Custom Campus Map Texture Ground**: Renders campus map texture (`/assets/map/Map.png`) directly on 3D ground plane.
- **Building Rotation Y Angle Slider**: Rotate any building live in 3D (`0° to 360°`).
- **Show/Remove 3D Roads Toggle**: Easily toggle 3D road overlays ON or OFF.
- **Dijkstra Shortest-Path Navigation**: Calculates distance in meters, walking time in minutes, and step-by-step turn instructions with 3D glowing polyline route animation.
- **Blender GLB Model Auto-Centering**: Supports loading Blender `.glb` models from `/assets/campus/` with automatic ground alignment.

---

## 📚 Complete Manual & Guides
- 📖 [MANUAL.md](MANUAL.md): Step-by-step instructions on adding/removing buildings, modifying positions, building rotation, adding/removing roads, and changing map textures.
- 🎨 [BLENDER_ASSET_GUIDE.md](BLENDER_ASSET_GUIDE.md): Complete guide for Blender model export, metric units, and GLB asset setup.

---

## 🚀 Quick Start

### 1. Run Frontend
```bash
cd client
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### 2. Run Backend
```bash
cd server
npm run dev
```
Backend server runs on **[http://localhost:5000](http://localhost:5000)**.
