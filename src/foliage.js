// Kenney's pines are one mesh sharing one palette texture, so there is no
// material to recolour — but every vertex points at a flat swatch in that
// palette, and swatches can be swapped by moving the UV.
//
// Measured from pine.glb and pine-crooked.glb: all nine greens sit in the
// palette column at u≈0.719, and all nine warm browns sit outside it (u≈0.219
// for the trunk, u≈0.469 for the undersides of each canopy tier). So anything
// off that column is the brown we want gone.
const GREEN_COLUMN = 0.719;
const COLUMN_EPSILON = 0.05;
// Darkest green in the same column. Keeping undersides darker than tops
// preserves the layered read of the tiers instead of flattening the tree.
const DARK_GREEN = [0.719, 0.725];

export function greenTrunk(scene) {
  if (scene.userData.trunkGreened) return false;

  let touched = 0;

  scene.traverse((node) => {
    const uv = node.isMesh ? node.geometry.attributes.uv : null;
    if (!uv) return;

    for (let i = 0; i < uv.count; i++) {
      if (Math.abs(uv.getX(i) - GREEN_COLUMN) <= COLUMN_EPSILON) continue;
      uv.setXY(i, DARK_GREEN[0], DARK_GREEN[1]);
      touched += 1;
    }

    if (touched > 0) uv.needsUpdate = true;
  });

  scene.userData.trunkGreened = true;
  return touched > 0;
}
