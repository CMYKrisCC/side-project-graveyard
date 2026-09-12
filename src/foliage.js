// The pine's canopy is entirely green already. What reads as "brown in the
// leaves" is the trunk, which runs up between the tiers and shows through the
// gaps. The whole tree is one mesh sharing one palette texture, so there is no
// material to recolour — but every vertex points at a flat swatch in that
// palette, and the brown one can simply be pointed at a green one instead.
const TRUNK_UV = [0.219, 0.525]; // the tan swatch
const DARK_GREEN_UV = [0.719, 0.705]; // darkest canopy green in the same palette
const EPSILON = 0.01;

export function greenTrunk(scene) {
  if (scene.userData.trunkGreened) return false;

  let touched = 0;

  scene.traverse((node) => {
    const uv = node.isMesh ? node.geometry.attributes.uv : null;
    if (!uv) return;

    for (let i = 0; i < uv.count; i++) {
      if (
        Math.abs(uv.getX(i) - TRUNK_UV[0]) < EPSILON &&
        Math.abs(uv.getY(i) - TRUNK_UV[1]) < EPSILON
      ) {
        uv.setXY(i, DARK_GREEN_UV[0], DARK_GREEN_UV[1]);
        touched += 1;
      }
    }

    if (touched > 0) uv.needsUpdate = true;
  });

  scene.userData.trunkGreened = true;
  return touched > 0;
}
