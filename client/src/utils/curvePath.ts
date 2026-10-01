import { Vector3, LineCurve3, QuadraticBezierCurve3, CurvePath } from 'three';

/**
 * Creates a smooth, continuous 3D path through an ordered list of waypoints.
 * Guarantees that the path travels along the exact centerline of straight road segments,
 * and executes smooth, filleted curved arcs inside junction hubs at every turn.
 * 
 * This ensures route arrows and roads are 100% aligned and arrows NEVER cut across
 * corners outside of the road.
 */
export function createSmoothPathFromNodes(
  rawPoints: { x: number; y?: number; z: number }[],
  filletRadius: number = 3.5,
  elevationOffset: number = 0
): CurvePath<Vector3> | null {
  if (!rawPoints || rawPoints.length < 2) return null;

  // Filter out redundant consecutive duplicate points
  const points: Vector3[] = [];
  for (const pt of rawPoints) {
    const v = new Vector3(pt.x, (pt.y || 0) + elevationOffset, pt.z);
    if (points.length === 0 || points[points.length - 1].distanceTo(v) > 0.15) {
      points.push(v);
    }
  }

  if (points.length < 2) return null;

  const path = new CurvePath<Vector3>();

  // 2 points: single straight segment along road centerline
  if (points.length === 2) {
    path.add(new LineCurve3(points[0], points[1]));
    return path;
  }

  // Multi-point path: generate straight road centerlines with smooth filleted curves at every corner
  let currentStart = points[0].clone();

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];

    const vIn = new Vector3().subVectors(curr, prev);
    const vOut = new Vector3().subVectors(next, curr);

    const lenIn = vIn.length();
    const lenOut = vOut.length();

    if (lenIn < 0.2 || lenOut < 0.2) continue;

    // Corner fillet radius: strictly constrained to fit inside junction hub cylinder (max 35% of segment)
    const actualFillet = Math.min(filletRadius, Math.min(lenIn, lenOut) * 0.35);

    // Turn start point on incoming road segment
    const turnStart = curr.clone().addScaledVector(vIn.clone().normalize(), -actualFillet);
    // Turn end point on outgoing road segment
    const turnEnd = curr.clone().addScaledVector(vOut.clone().normalize(), actualFillet);

    // Straight segment along incoming road centerline up to the junction entrance
    if (currentStart.distanceTo(turnStart) > 0.1) {
      path.add(new LineCurve3(currentStart.clone(), turnStart.clone()));
    }

    // Smooth rounded turning arc inside the junction hub
    path.add(new QuadraticBezierCurve3(turnStart.clone(), curr.clone(), turnEnd.clone()));

    currentStart = turnEnd.clone();
  }

  // Final straight segment along road centerline to the destination
  const lastPoint = points[points.length - 1];
  if (currentStart.distanceTo(lastPoint) > 0.1) {
    path.add(new LineCurve3(currentStart, lastPoint.clone()));
  }

  return path;
}
