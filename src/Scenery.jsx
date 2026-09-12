import { useMemo, useRef } from "react";
import { Box3, CanvasTexture, Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
import { Clone, useGLTF } from "@react-three/drei";
import { seeded } from "./random";
import { IRONWORK_RULES, PINE_RULES, remapSwatches } from "./palette";

const model = (name) => `/models/kenney-graveyard/${name}.glb`;

// pine-fall is deliberately absent: its autumn palette reads as brown foliage,
// and every tree shares one texture, so the only way to keep the canopy green
// is to not use that model.
const PROPS = [
  "iron-fence",
  "iron-fence-border-gate",
  "lightpost-single",
  "pine",
  "pine-crooked",
  "rocks",
  "rocks-tall",
  "bench",
  "urn-round",
  "crypt-small",
  "trunk",
];

PROPS.forEach((name) => useGLTF.preload(model(name)));

export const MAUSOLEUM_CLEARANCE = 11;

export const MAUSOLEUM_SETBACK = 6;

export const mausoleumAt = (yardRadius) => ({ x: 0, z: -(yardRadius - MAUSOLEUM_SETBACK) });

const blocked = (x, z, yardRadius) => {
  const crypt = mausoleumAt(yardRadius);
  return Math.hypot(x - crypt.x, z - crypt.z) < MAUSOLEUM_CLEARANCE;
};

// Re-rolls a scattered position until it lands clear of the mausoleum.
function findSpot(random, minRadius, spread, yardRadius, attempts = 14) {
  for (let i = 0; i < attempts; i++) {
    const angle = random() * Math.PI * 2;
    const radius = minRadius + random() * spread;
    const x = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius;
    if (!blocked(x, z, yardRadius)) return { x, z };
  }
  return null;
}
const PATH_COLOR = "#1e1e2b";

// A path between each ring of graves, however far out they now reach.
const pathRings = (yardRadius) => {
  const rings = [];
  for (let radius = 6.5; radius < yardRadius - 6; radius += 5) rings.push(radius);
  return rings;
};
const PROP_SCALE = 2;

function measure(scene) {
  return new Box3().setFromObject(scene).getSize(new Vector3());
}

function Paths({ yardRadius }) {
  return (
    <group position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh>
        <circleGeometry args={[4.6, 48]} />
        <meshStandardMaterial color={PATH_COLOR} roughness={1} />
      </mesh>

      {pathRings(yardRadius).map((radius) => (
        <mesh key={radius}>
          <ringGeometry args={[radius - 0.75, radius + 0.75, 64]} />
          <meshStandardMaterial color={PATH_COLOR} roughness={1} />
        </mesh>
      ))}

      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} rotation={[0, 0, (i * Math.PI) / 2]}>
          <planeGeometry args={[1.5, yardRadius - 4]} />
          <meshStandardMaterial color={PATH_COLOR} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function Lantern({ position }) {
  const { scene } = useGLTF(model("lightpost-single"));
  const size = useMemo(() => measure(scene), [scene]);

  // The lamp housing sits just under the top of the post and juts forward on z;
  // the glow has to sit in it rather than hover above the whole model.
  const lampY = size.y * PROP_SCALE - 0.34;
  const lampZ = size.z * PROP_SCALE - 0.32;

  return (
    <group position={position}>
      <Clone object={scene} scale={PROP_SCALE} />
      <mesh position={[0, lampY, lampZ]}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshBasicMaterial color="#ffd9a6" />
      </mesh>
      <pointLight
        position={[0, lampY, lampZ]}
        color="#ffb877"
        intensity={6}
        distance={12}
        decay={2}
      />
    </group>
  );
}

function Fence({ yardRadius }) {
  const { scene } = useGLTF(model("iron-fence"));
  const { scene: gate } = useGLTF(model("iron-fence-border-gate"));

  remapSwatches(scene, IRONWORK_RULES, "ironGreyed");
  remapSwatches(gate, IRONWORK_RULES, "ironGreyed");

  const segments = useMemo(() => {
    const size = measure(scene);
    // The panel is modelled along its X axis, so aligning local +X with the
    // circle's tangent is just rotation.y = angle — no extra quarter turn.
    const runsAlongX = size.x >= size.z;
    const span = (runsAlongX ? size.x : size.z) * PROP_SCALE;
    const count = Math.max(24, Math.round((2 * Math.PI * yardRadius) / span));

    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      return {
        key: i,
        isGate: i === 0,
        position: [Math.sin(angle) * yardRadius, 0, Math.cos(angle) * yardRadius],
        rotation: runsAlongX ? angle : angle + Math.PI / 2,
      };
    });
  }, [scene, yardRadius]);

  return segments.map(({ key, isGate, position, rotation }) => (
    <group key={key} position={position} rotation={[0, rotation, 0]}>
      <Clone object={isGate ? gate : scene} scale={PROP_SCALE} />
    </group>
  ));
}

function Tree({ object, position, rotation, scale, shade }) {
  const tinted = useMemo(() => {
    const clone = object.clone(true);
    clone.traverse((node) => {
      if (!node.isMesh) return;
      node.material = node.material.clone();
      node.material.color.offsetHSL(shade * 0.05, 0, shade * 0.04);
    });
    return clone;
  }, [object, shade]);

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <primitive object={tinted} scale={scale} />
    </group>
  );
}

function Scatter({ yardRadius }) {
  const pine = useGLTF(model("pine")).scene;
  const pineCrooked = useGLTF(model("pine-crooked")).scene;
  const rocks = [useGLTF(model("rocks")).scene, useGLTF(model("rocks-tall")).scene];
  const bench = useGLTF(model("bench")).scene;
  const urn = useGLTF(model("urn-round")).scene;
  const crypt = useGLTF(model("crypt-small")).scene;
  const trunk = useGLTF(model("trunk")).scene;

  remapSwatches(pine, PINE_RULES, "pineGreened");
  remapSwatches(pineCrooked, PINE_RULES, "pineGreened");

  const { trees, props } = useMemo(() => {
    const random = seeded(20260913);
    const grove = [];
    const placed = [];

    for (let i = 0; i < 28; i++) {
      const spot = findSpot(random, yardRadius - 7, 6, yardRadius);
      if (!spot) continue;
      grove.push({
        key: `tree-${i}`,
        object: random() > 0.45 ? pine : pineCrooked,
        position: [spot.x, 0, spot.z],
        rotation: random() * Math.PI * 2,
        scale: 2 + random() * 1.5,
        shade: random() - 0.5,
      });
    }

    // Rocks used to out-rank the graves: too many, too big, too pale, and
    // sitting among the plots. They belong at the edges as scenery.
    for (let i = 0; i < 9; i++) {
      const spot = findSpot(random, yardRadius - 6, 5, yardRadius);
      if (!spot) continue;
      placed.push({
        key: `rock-${i}`,
        object: rocks[Math.floor(random() * rocks.length)],
        position: [spot.x, 0, spot.z],
        rotation: random() * Math.PI * 2,
        scale: 1 + random() * 0.6,
      });
    }

    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + 0.4;
      placed.push({
        key: `bench-${i}`,
        object: bench,
        position: [Math.sin(angle) * 5.4, 0, Math.cos(angle) * 5.4],
        rotation: -angle,
        scale: PROP_SCALE,
      });
    }

    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2 + 1.1;
      const x = Math.sin(angle) * (yardRadius - 4.5);
      const z = Math.cos(angle) * (yardRadius - 4.5);
      if (blocked(x, z, yardRadius)) continue;
      placed.push({
        key: `crypt-${i}`,
        object: crypt,
        position: [x, 0, z],
        rotation: -angle,
        scale: 2.4,
      });
    }

    for (let i = 0; i < 5; i++) {
      const spot = findSpot(random, yardRadius - 10, 6, yardRadius);
      if (!spot) continue;
      placed.push({
        key: `urn-${i}`,
        object: random() > 0.5 ? urn : trunk,
        position: [spot.x, 0, spot.z],
        rotation: random() * Math.PI * 2,
        scale: 1.5,
      });
    }

    return { trees: grove, props: placed };
  }, [pine, pineCrooked, rocks, bench, urn, crypt, trunk, yardRadius]);

  return (
    <>
      {trees.map(({ key, ...tree }) => (
        <Tree key={key} {...tree} />
      ))}
      {props.map(({ key, object, position, rotation, scale }) => (
        <group key={key} position={position} rotation={[0, rotation, 0]}>
          <Clone object={object} scale={scale} />
        </group>
      ))}
    </>
  );
}

function GroundMist({ yardRadius }) {
  const group = useRef();

  const texture = useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, "rgba(150,165,220,0.3)");
    gradient.addColorStop(0.45, "rgba(130,145,200,0.1)");
    gradient.addColorStop(1, "rgba(110,125,180,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    return new CanvasTexture(canvas);
  }, []);

  const banks = useMemo(() => {
    const random = seeded(77123);
    return Array.from({ length: 6 }, (_, i) => {
      const angle = random() * Math.PI * 2;
      const radius = 12 + random() * (yardRadius - 14);
      return {
        key: i,
        position: [Math.sin(angle) * radius, 0.3 + random() * 0.5, Math.cos(angle) * radius],
        scale: 11 + random() * 13,
        drift: (random() - 0.5) * 0.03,
      };
    });
  }, [yardRadius]);

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.children.forEach((child, i) => {
      child.rotation.z += banks[i].drift * delta;
    });
  });

  return (
    <group ref={group}>
      {banks.map(({ key, position, scale }) => (
        <mesh key={key} position={position} rotation={[-Math.PI / 2, 0, 0]} scale={scale}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={texture} transparent depthWrite={false} opacity={0.22} />
        </mesh>
      ))}
    </group>
  );
}

export default function Scenery({ yardRadius }) {
  // A lantern ring for each band of graves, so the outer rings don't sit in
  // the dark as the graveyard grows.
  const lanterns = useMemo(() => {
    const lamps = [];
    for (let radius = 12.6; radius < yardRadius - 6; radius += 13) {
      const count = Math.max(8, Math.round((2 * Math.PI * radius) / 10));
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + Math.PI / count;
        lamps.push([Math.sin(angle) * radius, 0, Math.cos(angle) * radius]);
      }
    }
    return lamps;
  }, [yardRadius]);

  return (
    <>
      <Paths yardRadius={yardRadius} />
      <Fence yardRadius={yardRadius} />
      <Scatter yardRadius={yardRadius} />
      <GroundMist yardRadius={yardRadius} />
      {lanterns.map((position, i) => (
        <Lantern key={i} position={position} />
      ))}
    </>
  );
}
