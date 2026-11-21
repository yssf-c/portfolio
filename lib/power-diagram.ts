/**
 * A power diagram (a weighted Voronoi diagram) inside a rectangle. A point
 * belongs to the site with the smallest `distance² − weight`, so raising a
 * site's weight grows its cell at its neighbours' expense. With all weights
 * equal this is the ordinary Voronoi diagram, the dual of the Delaunay
 * triangulation.
 */

export type Cell = {
  /** Corners as a flat x, y list; empty if the site has been squeezed out. */
  polygon: number[];
  area: number;
  /** Centroid. */
  x: number;
  y: number;
  /** Distance from the centroid to the nearest side. */
  radius: number;
};

/** Keeps the part of a convex polygon where `nx·x + ny·y ≤ c`. */
function clip(polygon: number[], nx: number, ny: number, c: number) {
  const out: number[] = [];
  const n = polygon.length;
  for (let i = 0; i < n; i += 2) {
    const ax = polygon[i], ay = polygon[i + 1];
    const bx = polygon[(i + 2) % n], by = polygon[(i + 3) % n];
    const da = nx * ax + ny * ay - c;
    const db = nx * bx + ny * by - c;
    if (da <= 0) out.push(ax, ay);
    if ((da < 0 && db > 0) || (da > 0 && db < 0)) {
      const t = da / (da - db);
      out.push(ax + (bx - ax) * t, ay + (by - ay) * t);
    }
  }
  return out;
}

export function powerCells(px: number[], py: number[], weight: number[], width: number, height: number): Cell[] {
  const cells: Cell[] = [];
  for (let i = 0; i < px.length; i++) {
    let polygon = [0, 0, width, 0, width, height, 0, height];
    for (let j = 0; j < px.length && polygon.length >= 6; j++) {
      if (j === i) continue;
      const nx = px[j] - px[i], ny = py[j] - py[i];
      const c = (px[j] ** 2 + py[j] ** 2 - px[i] ** 2 - py[i] ** 2 + weight[i] - weight[j]) / 2;
      polygon = clip(polygon, nx, ny, c);
    }
    if (polygon.length < 6) {
      cells.push({ polygon: [], area: 0, x: px[i], y: py[i], radius: 0 });
      continue;
    }
    let twice = 0, cx = 0, cy = 0;
    const n = polygon.length;
    for (let k = 0; k < n; k += 2) {
      const ax = polygon[k], ay = polygon[k + 1];
      const bx = polygon[(k + 2) % n], by = polygon[(k + 3) % n];
      const cross = ax * by - bx * ay;
      twice += cross;
      cx += (ax + bx) * cross;
      cy += (ay + by) * cross;
    }
    if (Math.abs(twice) < 1e-6) {
      cells.push({ polygon: [], area: 0, x: px[i], y: py[i], radius: 0 });
      continue;
    }
    cx /= 3 * twice;
    cy /= 3 * twice;
    let radius = Infinity;
    for (let k = 0; k < n; k += 2) {
      const ax = polygon[k], ay = polygon[k + 1];
      const dx = polygon[(k + 2) % n] - ax, dy = polygon[(k + 3) % n] - ay;
      const length = Math.hypot(dx, dy);
      if (length > 1e-6) radius = Math.min(radius, Math.abs((cx - ax) * dy - (cy - ay) * dx) / length);
    }
    cells.push({ polygon, area: Math.abs(twice) / 2, x: cx, y: cy, radius });
  }
  return cells;
}
