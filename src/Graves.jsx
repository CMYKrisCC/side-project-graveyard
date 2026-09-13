import { useMemo, useRef, useState } from "react";
import { Box3, Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
import { useQuery } from "convex/react";
import { Billboard, Clone, Text, useGLTF } from "@react-three/drei";
import { api } from "../convex/_generated/api";
import { plotPosition } from "./layout";
import { memorialFor } from "./memorials";
import { wasDrag } from "./pointer";
import { candleLife, isFresh } from "./candles";

const CINZEL = "/fonts/Cinzel-Bold.ttf";
const MANROPE = "/fonts/Manrope-Regular.ttf";

const STYLES = [
  "gravestone-bevel",
  "gravestone-round",
  "gravestone-cross",
  "gravestone-wide",
  "gravestone-decorative",
  "gravestone-roof",
  "cross",
  "gravestone-broken",
  "cross-wood",
];

const modelPath = (style) => `/models/kenney-graveyard/${STYLES[style % STYLES.length]}.glb`;

STYLES.forEach((_, i) => useGLTF.preload(modelPath(i)));

const STONE_SCALE = 2.2;
const heightCache = new Map();

function stoneHeight(path, scene, scale) {
  if (!heightCache.has(path)) {
    heightCache.set(path, new Box3().setFromObject(scene).max.y);
  }
  // Must use the grave's own scale: monuments grow with flowers, and a taller
  // stone would otherwise push straight through its own inscription.
  return heightCache.get(path) * scale;
}

const NAME_SIZE = 0.26;
const NAME_TOP = 0.56;
const NAME_MAX_WIDTH = 3.1;
const CHARS_PER_LINE = 22;
const READABLE_RANGE = 15;

function Inscription({ grave }) {
  const lines = grave.name.length > CHARS_PER_LINE ? 2 : 1;
  const nameBottom = NAME_TOP - lines * NAME_SIZE * 1.2;

  return (
    <>
      <Text
        position={[0, NAME_TOP + 0.08, 0]}
        font={MANROPE}
        fontSize={0.1}
        letterSpacing={0.22}
        color="#9a9ab4"
        anchorX="center"
        anchorY="bottom"
      >
        {memorialFor(grave.plot).toUpperCase()}
      </Text>

      <Text
        position={[0, NAME_TOP, 0]}
        font={CINZEL}
        fontSize={NAME_SIZE}
        color="#f2f1f8"
        anchorX="center"
        anchorY="top"
        maxWidth={NAME_MAX_WIDTH}
        textAlign="center"
        lineHeight={1.2}
        outlineWidth={0.008}
        outlineColor="#05050a"
      >
        {grave.name}
      </Text>

      <Text
        position={[0, nameBottom + 0.02, 0]}
        font={MANROPE}
        fontSize={0.14}
        color="#c3c2d6"
        anchorX="center"
        anchorY="top"
        maxWidth={NAME_MAX_WIDTH}
        textAlign="center"
      >
        {grave.cause}
      </Text>

      <Text
        position={[0, nameBottom - 0.2, 0]}
        font={MANROPE}
        fontSize={0.12}
        color="#8a89a6"
        anchorX="center"
        anchorY="top"
      >
        {`• ${grave.bornYear} – ${grave.diedYear} •`}
      </Text>
    </>
  );
}

// A grave has to be findable from across the yard or it reads as scenery, so
// every one carries a marker light. The candle on top of that is the part
// visitors control, and the part that goes out.
function GraveLight({ life, fresh }) {
  const flame = useRef();
  const glow = useRef();

  useFrame(({ clock }) => {
    if (!flame.current) return;
    const flicker = 0.82 + Math.sin(clock.elapsedTime * 11) * 0.1 + Math.random() * 0.08;
    // An unlit grave still glows faintly — dark enough to read as neglected,
    // bright enough that you can find it from across the yard.
    const strength = 0.5 + life * 0.5;
    flame.current.scale.setScalar(flicker * (0.7 + life * 0.5));
    if (glow.current) glow.current.intensity = (fresh ? 6.5 : 4.6) * strength * flicker;
  });

  return (
    <group position={[0, 0.42, 0.85]}>
      <mesh ref={flame}>
        <sphereGeometry args={[0.085, 10, 10]} />
        <meshBasicMaterial color={life > 0 ? "#ffcf8a" : "#93a0dd"} />
      </mesh>
      <pointLight
        ref={glow}
        color={life > 0 ? "#ffb066" : "#8a97e0"}
        distance={life > 0 ? 8 : 5.5}
        decay={2}
      />
    </group>
  );
}

function Grave({ grave, onSelect, isFocused, isSelected, now }) {
  const path = modelPath(grave.style);
  const { scene } = useGLTF(path);
  const { x, z, angle } = plotPosition(grave.plot);
  const [hovered, setHovered] = useState(false);
  const inscription = useRef();

  const life = candleLife(grave.candleLitAt, now);
  const fresh = isFresh(grave.buriedAt, now);
  // Mourning makes a monument: the more flowers, the taller it stands.
  const scale = STONE_SCALE * (1 + Math.min(0.45, Math.log2(grave.flowers + 1) * 0.09));
  const textY = stoneHeight(path, scene, scale) + 0.4;
  const anchor = useMemo(() => new Vector3(x, textY, z), [x, textY, z]);

  useFrame(({ camera }) => {
    if (!inscription.current) return;
    const near = camera.position.distanceTo(anchor) < READABLE_RANGE;
    inscription.current.visible = near || isSelected || hovered;
  });

  return (
    <>
      <group position={[x, 0, z]} rotation={[0, angle, 0]}>
        <Clone object={scene} scale={scale} castShadow receiveShadow />
        <GraveLight life={life} fresh={fresh} />

        <mesh
          position={[0, 1.1, 0.3]}
          visible={false}
          onClick={(event) => {
            event.stopPropagation();
            if (wasDrag(event)) return;
            onSelect(grave._id);
          }}
          onPointerOver={(event) => {
            event.stopPropagation();
            setHovered(true);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = "default";
          }}
        >
          <boxGeometry args={[2, 2.4, 1.4]} />
        </mesh>

        {grave.flowers > 0 && (
          <Text
            position={[0, 0.3, 1.35]}
            font={MANROPE}
            fontSize={0.22}
            color="#e0b34d"
            anchorX="center"
          >
            {`❀ ${grave.flowers}`}
          </Text>
        )}

        {(isFocused || isSelected) && (
          <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.5, 1.75, 40]} />
            <meshBasicMaterial color="#e0b34d" transparent opacity={0.5} />
          </mesh>
        )}
      </group>

      <Billboard ref={inscription} position={[x, textY, z]}>
        <Inscription grave={grave} />
      </Billboard>
    </>
  );
}

let sceneReady = false;

export const isSceneReady = () => sceneReady;

// Frames to wait after mounting. The first few are spent compiling shaders and
// uploading textures, and on a slow machine they present an empty ground.
const SETTLE_FRAMES = 12;

// Mounted inside the scene's Suspense boundary, after the graves have arrived,
// so its frames only run once every model has loaded.
function SceneReady() {
  const frames = useRef(0);
  useFrame(() => {
    frames.current += 1;
    if (frames.current >= SETTLE_FRAMES) sceneReady = true;
  });
  return null;
}

export default function Graves({ focusId, selectedId, onSelect, now }) {
  const graves = useQuery(api.graves.list);

  if (!graves) return null;

  return (
    <>
      {graves.map((grave) => (
        <Grave
          key={grave._id}
          grave={grave}
          onSelect={onSelect}
          isFocused={grave._id === focusId}
          isSelected={grave._id === selectedId}
          now={now}
        />
      ))}
      <SceneReady />
    </>
  );
}
