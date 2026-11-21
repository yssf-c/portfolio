/**
 * A small Bowyer–Watson Delaunay triangulation, enough for the hero mesh
 * (a thousand or so points, built once, then one extra point per frame).
 */

export type Triangle = {
  a: number;
  b: number;
  c: number;
  /** Circumcentre and squared circumradius. */
  x: number;
  y: number;
  r: number;
  /** When the triangle was made, for callers that animate the construction. */
  born?: number;
};

export type Points = { x: number[]; y: number[] };

function triangle(p: Points, a: number, b: number, c: number): Triangle | null {
  const ax = p.x[a], ay = p.y[a], bx = p.x[b], by = p.y[b], cx = p.x[c], cy = p.y[c];
  const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
  if (Math.abs(d) < 1e-9) return null;
  const a2 = ax * ax + ay * ay, b2 = bx * bx + by * by, c2 = cx * cx + cy * cy;
  const x = (a2 * (by - cy) + b2 * (cy - ay) + c2 * (ay - by)) / d;
  const y = (a2 * (cx - bx) + b2 * (ax - cx) + c2 * (bx - ax)) / d;
  return { a, b, c, x, y, r: (ax - x) ** 2 + (ay - y) ** 2 };
}

/**
 * The triangles whose circumcircle holds (x, y), and the edges that bound the
 * hole they leave: joining each edge to the point re-triangulates it.
 */
export function cavity(triangles: Triangle[], x: number, y: number) {
  const bad: number[] = [];
  const edges = new Map<number, [number, number]>();
  for (let i = 0; i < triangles.length; i++) {
    const t = triangles[i];
    if ((x - t.x) ** 2 + (y - t.y) ** 2 >= t.r) continue;
    bad.push(i);
    for (const [u, v] of [[t.a, t.b], [t.b, t.c], [t.c, t.a]] as const) {
      const key = u < v ? u * 65536 + v : v * 65536 + u;
      if (edges.has(key)) edges.delete(key);
      else edges.set(key, [u, v]);
    }
  }
  return { bad, edges: [...edges.values()] };
}

/**
 * Adds point `index` (already in `p`) to the triangulation, in place. The new
 * triangles are the last ones in the array; their count is returned.
 */
export function insert(triangles: Triangle[], p: Points, index: number) {
  const { bad, edges } = cavity(triangles, p.x[index], p.y[index]);
  for (let i = bad.length - 1; i >= 0; i--) {
    triangles[bad[i]] = triangles[triangles.length - 1];
    triangles.pop();
  }
  let made = 0;
  for (const [u, v] of edges) {
    const t = triangle(p, u, v, index);
    if (!t) continue;
    triangles.push(t);
    made++;
  }
  return made;
}

/**
 * Starts a triangulation of the points without inserting any: three far-away
 * helper points are appended to `p` and stay there, and the one triangle they
 * make is returned. Triangles that touch them are kept (they lie outside any
 * sensible viewport) so later insertions keep working.
 */
export function seed(p: Points): Triangle[] {
  const n = p.x.length;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (let i = 0; i < n; i++) {
    minX = Math.min(minX, p.x[i]);
    maxX = Math.max(maxX, p.x[i]);
    minY = Math.min(minY, p.y[i]);
    maxY = Math.max(maxY, p.y[i]);
  }
  const span = Math.max(maxX - minX, maxY - minY, 1) * 20;
  const mx = (minX + maxX) / 2, my = (minY + maxY) / 2;
  p.x.push(mx - span, mx, mx + span);
  p.y.push(my - span, my + span, my - span);
  return [triangle(p, n, n + 1, n + 2)!];
}

/** Triangulates the points, all at once. See `seed` for the helper points. */
export function triangulate(p: Points): Triangle[] {
  const n = p.x.length;
  const triangles = seed(p);
  for (let i = 0; i < n; i++) insert(triangles, p, i);
  return triangles;
}
