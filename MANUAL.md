# REC WayFinder — Complete User & Developer Manual

Welcome to the **REC WayFinder** Developer & Administrator Manual for **Rajalakshmi Engineering College (REC), Chennai**.

This document explains step-by-step how to add, edit, or remove **buildings**, **3D models**, **positioning**, **building rotation**, **walking roads**, **navigation graph nodes**, **ground map textures**, **sky settings**, and **lighting brightness**.

---

## Table of Contents
1. [Overview & Project Structure](#1-overview--project-structure)
2. [How to Add a New Building or Landmark](#2-how-to-add-a-new-building-or-landmark)
3. [How to Remove an Existing Building](#3-how-to-remove-an-existing-building)
4. [How to Change Building Position (X, Y, Z) & Rotation (Rotation Y)](#4-how-to-change-building-position-x-y-z--rotation-rotation-y)
5. [How to Add Custom Blender (.blend / .glb) 3D Models](#5-how-to-add-custom-blender-blend--glb-3d-models)
6. [How to Add, Remove, or Modify 3D Navigation Roads & Graph Nodes](#6-how-to-add-remove-or-modify-3d-navigation-roads--graph-nodes)
7. [How to Change the Ground Map Image Texture](#7-how-to-change-the-ground-map-image-texture)
8. [How to Adjust 3D Sky & Lighting Brightness](#8-how-to-adjust-3d-sky--lighting-brightness)
9. [How to Run the Application (Frontend & Backend)](#9-how-to-run-the-application-frontend--backend)

---

## 1. Overview & Project Structure

REC WayFinder is a 3D Web Application built using **React**, **TypeScript**, **Vite**, **Three.js**, and **React Three Fiber**.

Key files to edit:
- **Buildings, Positions & Graph**: `client/src/data/recCampusData.ts`
- **3D Asset Manifest**: `client/src/data/assetManifest.ts`
- **Ground Map Texture Image**: `client/public/assets/map/Map.png`
- **3D Models Directory**: `client/public/assets/campus/`

---

## 2. How to Add a New Building or Landmark

To add a new building to the campus map:

1. Open `client/src/data/recCampusData.ts`.
2. Add a new object entry to the `LOCATIONS` array:

```typescript
{
  id: 'block-e',
  name: 'Block E (New Innovation Center)',
  category: 'academic',
  description: 'New research labs and incubation center.',
  position: { x: 100, y: 0, z: -80 }, // 3D coordinates in meters
  rotationY: 45,                       // Y Rotation angle in degrees (0 to 360)
  facilities: ['Robotics Lab', 'Incubation Cell'],
  nodeId: 'node_a_block_center',        // Nearest navigation road node
}
```

3. Save the file. The building will immediately render on the 3D map with label and pins!

---

## 3. How to Remove an Existing Building

To remove a building:

### Option A: Remove permanently from dataset
1. Open `client/src/data/recCampusData.ts`.
2. Delete the corresponding object entry from the `LOCATIONS` array.

### Option B: Delete via Admin Portal UI
1. Open the website and click the **Admin** tab at the top.
2. Click **Locations**.
3. Click the **Trash Can (Delete)** icon next to the building you wish to remove.

---

## 4. How to Change Building Position (X, Y, Z) & Rotation (Rotation Y)

You can adjust building positions and rotation angles using **Visual 3D Editor** or by editing code:

### Method A: Using Visual 3D Editor (Recommended)
1. Open **[http://localhost:5173](http://localhost:5173)** and click the **Admin** tab.
2. Under **Live 3D Position & Rotation Editor**, select your building from the dropdown.
3. Use the real-time sliders:
   - **Rotate Building (Y Angle)**: Rotates building from `0°` to `360°`.
   - **3D Position X**: Moves West ↔ East (-300m to +300m).
   - **3D Position Z**: Moves North ↔ South (-300m to +300m).
   - **Elevation Y**: Moves height up/down.
4. Click **Save Building Location & Rotation** or click **Copy recCampusData.ts Code** to copy the exact updated coordinates directly!

### Method B: Manual Code Edit
Open `client/src/data/recCampusData.ts` and modify `position` or `rotationY`:
```typescript
position: { x: 120, y: 0, z: -20 },
rotationY: 90, // Rotates building 90 degrees
```

---

## 5. How to Add Custom Blender (.blend / .glb) 3D Models

Browsers require standard `.glb` files.

### Step 1: Export from Blender
In Blender:
1. Go to **File → Export → glTF 2.0 (.glb)**.
2. Use settings: **Format: GLB**, **Transform: +Y Up**, **Units: Meters**.
3. Save the `.glb` file into:
   ```
   client/public/assets/campus/
   ```
   *(e.g., `block-a.glb`, `block-d.glb`)*

### Step 2: Enable GLB Model in Code
1. Open `client/src/data/assetManifest.ts`.
2. Set `isVerifiedModel: true` for that asset key:
```typescript
'block-d': {
  id: 'block-d',
  name: 'Block D',
  glbPath: '/assets/campus/block-d.glb',
  isVerifiedModel: true, // Loads GLB file!
  description: 'MBA and Placement cell building.',
}
```
3. Refresh browser. Three.js will auto-center and render your 3D Blender model!

---

## 6. How to Add, Remove, or Modify 3D Navigation Roads & Graph Nodes

Walking navigation paths are calculated using a road network graph defined in `client/src/data/recCampusData.ts`.

### A. How to Add a New Road Intersection (Node)
In `recCampusData.ts`, add an entry to `PATH_NODES`:
```typescript
{ id: 'node_new_gate', name: 'New Gate Circle', position: { x: -100, y: 0.2, z: -100 } }
```

### B. How to Connect Two Nodes with a Road Segment (Edge)
In `recCampusData.ts`, add an entry to `PATH_EDGES`:
```typescript
{ id: 'e34', from: 'node_main_gate', to: 'node_new_gate', distance: 90, roadName: 'New Access Road' }
```

### C. How to Remove a Road Segment
Delete the corresponding edge entry from `PATH_EDGES`.

### D. How to Show or Remove 3D Road Visual Overlay
Click the **Waypoints (3D Roads)** button on the right-side floating toolbar in the 3D map viewport to toggle road display ON or OFF!

---

## 7. How to Change the Ground Map Image Texture

The 3D ground plane displays your campus map image:

1. Replace the image file located at:
   ```
   client/public/assets/map/Map.png
   ```
2. Make sure your image is named `Map.png` (or update path in `client/src/components/3d/Terrain.tsx`).
3. Refresh the browser. The new campus map image will immediately stretch over the 3D ground plane beneath buildings and roads!

---

## 8. How to Adjust 3D Sky & Lighting Brightness

- **3D Sky Atmosphere**: The scene features a 3D atmospheric sky with realistic sun rayleigh scattering (`<Sky />`).
- **Brightness Control**: Click the **Sun (Brightness)** icon on the right floating map controls to cycle brightness between `0.8x`, `1.2x`, `1.7x`, and `2.2x` outdoor sunlight intensity!

---

## 9. How to Run the Application (Frontend & Backend)

### Start Frontend (3D Web App)
```bash
cd client
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)**.

### Start Backend API Server
```bash
cd server
npm run dev
```
Backend API will start on **[http://localhost:5000](http://localhost:5000)**.
