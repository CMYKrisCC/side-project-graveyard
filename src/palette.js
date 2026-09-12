// Every Kenney model shares one palette texture, so a mesh can't be recoloured
// by touching its material — but each vertex points at a flat swatch in that
// palette, and a swatch can be swapped by moving the UV. Editing the PNG itself
// would repaint the entire world; moving UVs only affects the model you pass in.
//
// Swatch coordinates are u = x / 512, v = y / 512 in
// public/models/kenney-graveyard/Textures/colormap.png, top-left origin.

const TOLERANCE = 0.02;

function matches(rule, u, v) {
  if (Math.abs(u - rule.from[0]) > TOLERANCE) return false;
  // A rule with no v matches the whole palette column.
  return rule.from[1] === undefined || Math.abs(v - rule.from[1]) <= TOLERANCE;
}

export function remapSwatches(scene, rules, key) {
  if (scene.userData[key]) return false;

  let touched = 0;

  scene.traverse((node) => {
    const uv = node.isMesh ? node.geometry.attributes.uv : null;
    if (!uv) return;

    for (let i = 0; i < uv.count; i++) {
      const rule = rules.find((candidate) => matches(candidate, uv.getX(i), uv.getY(i)));
      if (!rule) continue;
      uv.setXY(i, rule.to[0], rule.to[1]);
      touched += 1;
    }

    if (touched > 0) uv.needsUpdate = true;
  });

  scene.userData[key] = true;
  return touched > 0;
}

// Measured from pine.glb: the column at u=0.469 is the underside of each canopy
// tier (y 0.42–1.31, out at the branch tips) and reads as brown in the leaves.
// The column at u=0.219 is the trunk (y −0.10–0.32, hugging the axis) and stays
// brown, because a brown trunk is correct.
export const PINE_RULES = [{ from: [0.469], to: [0.719, 0.725] }];

// The ironwork ships painted green. These are the greys already in the palette,
// mapped light-for-light so the fence keeps its shading: darker than the pale
// tips at rgb(189,197,237), light enough to stay visible against the night.
export const IRONWORK_RULES = [
  { from: [0.719, 0.525], to: [0.969, 0.895] }, // lightest green -> rgb(150,157,189)
  { from: [0.719, 0.575], to: [0.969, 0.908] }, // -> rgb(146,153,183)
  { from: [0.719, 0.625], to: [0.969, 0.908] },
  { from: [0.719, 0.675], to: [0.969, 0.975] }, // -> rgb(125,130,156)
  { from: [0.719, 0.725], to: [0.969, 0.975] },
];
