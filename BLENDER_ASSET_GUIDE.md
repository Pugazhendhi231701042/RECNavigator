# Blender 3D Asset Pipeline Guide — REC WayFinder

This document provides complete instructions for preparing, exporting, and integrating custom 3D building models created in **Blender** into the **REC WayFinder 3D Web Engine**.

---

## 1. Blender Model Standards

To ensure optimal performance and seamless integration with Three.js and React Three Fiber:

| Parameter | Recommendation |
|---|---|
| **Unit System** | **Metric** |
| **Length Unit** | **Meters** (`1 unit = 1 meter`) |
| **Origin Point** | Bottom Center of building ground footprint `(0, 0, 0)` |
| **Axis Orientation** | **+Y Up**, **-Z Forward** (Standard GLTF convention) |
| **Polygon Budget** | Under **15,000 triangles** per building GLB |
| **Textures** | 1024x1024 or 2048x2048 compressed PNG/WebP (PBR Metallic/Roughness) |
| **Material Format** | Standard Principled BSDF |

---

## 2. Recommended Naming & File Locations

Save exported GLB files into `client/public/assets/campus/`:

```
client/public/assets/campus/
├── terrain.glb           # Ground mesh with lawns and campus boundaries
├── roads.glb             # Asphalt roads and paved walkways mesh
├── block-a.glb           # Block A (CSE, IT, ECE)
├── block-b.glb           # Block B (Mechanical & EEE)
├── block-c.glb           # Block C (Biotech & Sciences)
├── block-d.glb           # Block D (Management & Placement)
├── rec-cafe.glb          # Central Cafeteria building
├── hut-cafe.glb          # Hut Cafe pavilion
├── dominos.glb           # Food square counter
├── sports-ground.glb     # Main running track & football turf
├── auditorium.glb        # Indoor Auditorium hall
└── girls-hostel.glb      # Girls Hostel Complex
```

---

## 3. Blender GLB Export Settings

When exporting from Blender (`File -> Export -> glTF 2.0 (.glb/.gltf)`):

1. **Format**: `glTF Binary (.glb)`
2. **Include**:
   - Check `Selected Objects` (if exporting single building)
   - Check `Custom Properties`
3. **Transform**:
   - Check `+Y Up`
4. **Geometry**:
   - Check `Apply Modifiers`
   - Check `UVs`, `Normals`, `Vertex Colors`
   - Enable `Draco Mesh Compression` (compression level 6)
5. **Materials**:
   - Export `Export Materials` (Principled BSDF PBR)

---

## 4. Replacing Placeholder Geometry with Verified Blender Models

REC WayFinder is designed to automatically detect and load GLB models without modifying React code:

1. Drop the exported `.glb` file into `client/public/assets/campus/block-a.glb`.
2. Open `client/src/data/assetManifest.ts`.
3. Set `isVerifiedModel: true` for the corresponding key:

```typescript
'block-a': {
  id: 'block-a',
  name: 'Block A (Academic & Admin)',
  glbPath: '/assets/campus/block-a.glb',
  isVerifiedModel: true, // Marked as verified GLB model
  description: '4-Story academic building housing CSE, IT, and ECE departments.',
}
```

The 3D engine will instantly render your high-definition Blender model in place of the procedural low-poly fallback!
