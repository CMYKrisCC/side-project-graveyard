import { useMemo, useRef } from "react";
import { Box3, CanvasTexture, Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
import { Clone, useGLTF } from "@react-three/drei";
import { seeded } from "./random";

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

export const YARD_RADIUS = 30;
const PATH_RINGS = [6.5, 11.5, 16.5, 21.5];
const PATH_COLOR = "#1e1e2b";
const PROP_SCALE = 2;

function measure(scene) {
  return new Box3().setFromObject(scene).getSize(new Vector3());
}

function Paths() {
  return (
    <group position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh>
        <circleGeometry args={[4.6, 48]} />
        <meshStandardMaterial color={PATH_COLOR} roughness={1} />
      </mesh>

      {PATH_RINGS.map((radius) => (
        <mesh key={radius}>
          <ringGeometry args={[radius - 0.75, radius + 0.75, 64]} />
          <meshStandardMaterial color={PATH_COLOR} roughness={1} />
        </mesh>
      ))}

      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} rotation={[0, 0, (i * Math.PI) / 2]}>
          <planeGeometry args={[1.5, YARD_RADIUS - 4]} />
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

function Fence() {
  const { scene } = useGLTF(model("iron-fence"));
  const { scene: gate } = useGLTF(model("iron-fence-border-gate"));

  const segments = useMemo(() => {
    const size = measure(scene);
    // The panel is modelled along its X axis, so aligning local +X with the
    // circle's tangent is just rotation.y = angle — no extra quarter turn.
    const runsAlongX = size.x >= size.z;
    const span = (runsAlongX ? size.x : size.z) * PROP_SCALE;
    const count = Math.max(24, Math.round((2 * Math.PI * YARD_RADIUS) / span));

    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      return {
        key: i,
        isGate: i === 0,
        position: [Math.sin(angle) * YARD_RADIUS, 0, Math.cos(angle) * YARD_RADIUS],
        rotation: runsAlongX ? angle : angle + Math.PI / 2,
      };
    });
  }, [scene]);

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

function Scatter() {
  const pine = useGLTF(model("pine")).scene;
  const pineCrooked = useGLTF(model("pine-crooked")).scene;
  const rocks = [useGLTF(model("rocks")).scene, useGLTF(model("rocks-tall")).scene];
  const bench = useGLTF(model("bench")).scene;
  const urn = useGLTF(model("urn-round")).scene;
  const crypt = useGLTF(model("crypt-small")).scene;
  const trunk = useGLTF(model("trunk")).scene;

  const { trees, props } = useMemo(() => {
    const random = seeded(20260913);
    const grove = [];
    const placed = [];

    for (let i = 0; i < 28; i++) {
      const angle = random() * Math.PI * 2;
      const radius = 23 + random() * 6;
      grove.push({
        key: `tree-${i}`,
        object: random() > 0.45 ? pine : pineCrooked,
        position: [Math.sin(angle) * radius, 0, Math.cos(angle) * radius],
        rotation: random() * Math.PI * 2,
        scale: 2 + random() * 1.5,
        shade: random() - 0.5,
      });
    }

    // Rocks used to out-rank the graves: too many, too big, too pale, and
    // sitting among the plots. They belong at the edges as scenery.
    for (let i = 0; i < 9; i++) {
      const angle = random() * Math.PI * 2;
      const radius = 24 + random() * 5;
      placed.push({
        key: `rock-${i}`,
        object: rocks[Math.floor(random() * rocks.length)],
        position: [Math.sin(angle) * radius, 0, Math.cos(angle) * radius],
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
      placed.push({
        key: `crypt-${i}`,
        object: crypt,
        position: [Math.sin(angle) * 25.5, 0, Math.cos(angle) * 25.5],
        rotation: -angle,
        scale: 2.4,
      });
    }

    for (let i = 0; i < 5; i++) {
      const angle = random() * Math.PI * 2;
      const radius = 20 + random() * 6;
      placed.push({
        key: `urn-${i}`,
        object: random() > 0.5 ? urn : trunk,
        position: [Math.sin(angle) * radius, 0, Math.cos(angle) * radius],
        rotation: random() * Math.PI * 2,
        scale: 1.5,
      });
    }

    return { trees: grove, props: placed };
  }, [pine, pineCrooked, rocks, bench, urn, crypt, trunk]);

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

function GroundMist() {
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
      const radius = 12 + random() * 16;
      return {
        key: i,
        position: [Math.sin(angle) * radius, 0.3 + random() * 0.5, Math.cos(angle) * radius],
        scale: 11 + random() * 13,
        drift: (random() - 0.5) * 0.03,
      };
    });
  }, []);

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

export default function Scenery() {
  const lanterns = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2 + Math.PI / 8;
        return [Math.sin(angle) * 12.6, 0, Math.cos(angle) * 12.6];
      }),
    []
  );

  return (
    <>
      <Paths />
      <Fence />
      <Scatter />
      <GroundMist />
      {lanterns.map((position, i) => (
        <Lantern key={i} position={position} />
      ))}
    </>
  );
}
