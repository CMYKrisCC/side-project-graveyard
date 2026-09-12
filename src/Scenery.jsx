import { useMemo } from "react";
import { Box3, Vector3 } from "three";
import { Clone, useGLTF } from "@react-three/drei";
import { seeded } from "./random";

const model = (name) => `/models/kenney-graveyard/${name}.glb`;

const PROPS = [
  "iron-fence",
  "iron-fence-border-gate",
  "lightpost-single",
  "pine",
  "pine-crooked",
  "pine-fall",
  "rocks",
  "rocks-tall",
  "bench",
  "urn-round",
  "crypt-small",
  "cross-wood",
  "trunk",
];

PROPS.forEach((name) => useGLTF.preload(model(name)));

const YARD_RADIUS = 30;
const PATH_RINGS = [6.5, 11.5, 16.5, 21.5];
const PATH_COLOR = "#21212e";

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
        <mesh key={i} rotation={[0, 0, (i * Math.PI) / 2]} position={[0, 0, 0]}>
          <planeGeometry args={[1.5, YARD_RADIUS - 4]} />
          <meshStandardMaterial color={PATH_COLOR} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function Lantern({ position }) {
  const { scene } = useGLTF(model("lightpost-single"));

  return (
    <group position={position}>
      <Clone object={scene} scale={2} />
      <mesh position={[0, 3.1, 0]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshBasicMaterial color="#ffcf94" />
      </mesh>
      <pointLight position={[0, 3.1, 0]} color="#ffb06a" intensity={7} distance={12} decay={2} />
    </group>
  );
}

function Fence() {
  const { scene } = useGLTF(model("iron-fence"));
  const { scene: gate } = useGLTF(model("iron-fence-border-gate"));

  const segments = useMemo(() => {
    const width = new Box3().setFromObject(scene).getSize(new Vector3()).x || 1;
    const spacing = width * 2;
    const count = Math.max(24, Math.floor((2 * Math.PI * YARD_RADIUS) / spacing));

    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      return {
        key: i,
        // The gate faces the camera's opening view, so arrivals read as entering.
        isGate: i === 0,
        position: [Math.sin(angle) * YARD_RADIUS, 0, Math.cos(angle) * YARD_RADIUS],
        rotation: angle + Math.PI / 2,
      };
    });
  }, [scene]);

  return segments.map(({ key, isGate, position, rotation }) => (
    <group key={key} position={position} rotation={[0, rotation, 0]}>
      <Clone object={isGate ? gate : scene} scale={2} />
    </group>
  ));
}

function Scatter() {
  const trees = [useGLTF(model("pine")), useGLTF(model("pine-crooked")), useGLTF(model("pine-fall"))];
  const rocks = [useGLTF(model("rocks")), useGLTF(model("rocks-tall"))];
  const { scene: bench } = useGLTF(model("bench"));
  const { scene: urn } = useGLTF(model("urn-round"));
  const { scene: crypt } = useGLTF(model("crypt-small"));
  const { scene: trunk } = useGLTF(model("trunk"));

  const items = useMemo(() => {
    const random = seeded(20260913);
    const placed = [];

    for (let i = 0; i < 26; i++) {
      const angle = random() * Math.PI * 2;
      const radius = 23 + random() * 6;
      placed.push({
        key: `tree-${i}`,
        object: trees[Math.floor(random() * trees.length)].scene,
        position: [Math.sin(angle) * radius, 0, Math.cos(angle) * radius],
        rotation: random() * Math.PI * 2,
        scale: 2 + random() * 1.4,
      });
    }

    for (let i = 0; i < 18; i++) {
      const angle = random() * Math.PI * 2;
      const radius = 8 + random() * 14;
      placed.push({
        key: `rock-${i}`,
        object: rocks[Math.floor(random() * rocks.length)].scene,
        position: [Math.sin(angle) * radius, 0, Math.cos(angle) * radius],
        rotation: random() * Math.PI * 2,
        scale: 1.4 + random() * 0.9,
      });
    }

    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + 0.4;
      placed.push({
        key: `bench-${i}`,
        object: bench,
        position: [Math.sin(angle) * 5.4, 0, Math.cos(angle) * 5.4],
        rotation: -angle,
        scale: 2,
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

    for (let i = 0; i < 8; i++) {
      const angle = random() * Math.PI * 2;
      const radius = 6 + random() * 16;
      placed.push({
        key: `urn-${i}`,
        object: random() > 0.5 ? urn : trunk,
        position: [Math.sin(angle) * radius, 0, Math.cos(angle) * radius],
        rotation: random() * Math.PI * 2,
        scale: 1.6,
      });
    }

    return placed;
  }, [trees, rocks, bench, urn, crypt, trunk]);

  return items.map(({ key, object, position, rotation, scale }) => (
    <group key={key} position={position} rotation={[0, rotation, 0]}>
      <Clone object={object} scale={scale} />
    </group>
  ));
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
      {lanterns.map((position, i) => (
        <Lantern key={i} position={position} />
      ))}
    </>
  );
}
