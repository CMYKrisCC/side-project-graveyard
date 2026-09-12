import { useMemo, useRef, useState } from "react";
import { Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
import { Clone, Html, useGLTF } from "@react-three/drei";
import { candleLife, isFresh } from "./candles";

const KEEPER = "/models/kenney-graveyard/character-keeper.glb";
const LANTERN = "/models/kenney-graveyard/lantern-candle.glb";

useGLTF.preload(KEEPER);
useGLTF.preload(LANTERN);

const ROUNDS_RADIUS = 16.5;
const PACE = 0.095;
const WALK_SPEED = 2.4;
const GREET_RANGE = 6;
const TALK_MS = 15000;
const REST_MS = 26000;

const IDLE_LINES = [
  "Mind the roots. They come up where the soil's been turned.",
  "Everyone says they'll come back and finish it. Almost nobody does.",
  "Plenty of room left. There's always plenty of room left.",
  "I keep the lamps lit. The rest is up to you.",
];

// What he says is pulled from the live graveyard, so he's a way of surfacing
// content you'd otherwise have to stumble on.
function chooseLine(graves) {
  if (!graves || graves.length === 0) {
    return "Empty tonight. You could be the first to put something down.";
  }

  const now = Date.now();

  const freshest = graves.find((grave) => isFresh(grave.buriedAt, now));
  if (freshest && Math.random() < 0.5) {
    return `They buried ${freshest.name} not an hour ago. Soil's still loose.`;
  }

  const dark = graves
    .filter((grave) => candleLife(grave.candleLitAt, now) === 0)
    .sort((a, b) => a.flowers - b.flowers);
  if (dark.length > 0 && Math.random() < 0.6) {
    return `Nobody's lit a candle for ${dark[0].name}. Wouldn't take you a moment.`;
  }

  const mourned = [...graves].sort((a, b) => b.flowers - a.flowers)[0];
  if (mourned && mourned.flowers > 0) {
    const flowers = mourned.flowers === 1 ? "1 flower" : `${mourned.flowers} flowers`;
    return `${mourned.name} gets the most visitors. ${flowers} and counting.`;
  }

  return IDLE_LINES[Math.floor(Math.random() * IDLE_LINES.length)];
}

export default function Caretaker({ graves, ownPositionRef }) {
  const { scene } = useGLTF(KEEPER);
  const { scene: lantern } = useGLTF(LANTERN);
  const group = useRef();
  const angle = useRef(Math.PI * 0.6);
  const spot = useRef(
    new Vector3(Math.sin(Math.PI * 0.6) * ROUNDS_RADIUS, 0, Math.cos(Math.PI * 0.6) * ROUNDS_RADIUS)
  );
  const mode = useRef("rounds");
  const talkUntil = useRef(0);
  const restUntil = useRef(Date.now() + 6000);
  const [greeting, setGreeting] = useState(null);
  const flame = useRef();

  useFrame(({ clock }, delta) => {
    if (!group.current) return;

    const me = ownPositionRef.current;
    const now = Date.now();
    const here = spot.current;
    const distance = Math.hypot(me.x - here.x, me.z - here.z);

    if (mode.current === "talking") {
      if (now > talkUntil.current) {
        mode.current = "rounds";
        restUntil.current = now + REST_MS;
        angle.current = Math.atan2(here.x, here.z);
        setGreeting(null);
      }
    } else if (distance < GREET_RANGE) {
      mode.current = "talking";
      talkUntil.current = now + TALK_MS;
      setGreeting(chooseLine(graves));
    } else if (mode.current === "approach") {
      // He walks over rather than waiting to be found — otherwise a visitor
      // who never leaves the middle would never meet him at all.
      const step = (WALK_SPEED * delta) / distance;
      here.x += (me.x - here.x) * Math.min(1, step);
      here.z += (me.z - here.z) * Math.min(1, step);
    } else {
      if (now > restUntil.current) {
        mode.current = "approach";
      } else {
        angle.current += PACE * delta;
        here.set(Math.sin(angle.current) * ROUNDS_RADIUS, 0, Math.cos(angle.current) * ROUNDS_RADIUS);
      }
    }

    group.current.position.copy(here);
    group.current.rotation.y =
      mode.current === "rounds"
        ? angle.current + Math.PI / 2
        : Math.atan2(me.x - here.x, me.z - here.z);

    if (flame.current) {
      flame.current.scale.setScalar(0.9 + Math.sin(clock.elapsedTime * 9) * 0.12);
    }
  });

  const bubble = useMemo(
    () =>
      greeting && (
        // No distanceFactor: dialogue should stay legible wherever he is, not
        // shrink into a sliver when you back the camera off.
        <Html center position={[0, 2.4, 0]} zIndexRange={[15, 0]}>
          <div className="caretaker-line">{greeting}</div>
        </Html>
      ),
    [greeting]
  );

  return (
    <group ref={group}>
      <Clone object={scene} scale={2.6} />

      <group position={[0.42, 0.62, 0.1]}>
        <Clone object={lantern} scale={1.6} />
        <mesh ref={flame} position={[0, 0.2, 0]}>
          <sphereGeometry args={[0.07, 10, 10]} />
          <meshBasicMaterial color="#ffd8a0" />
        </mesh>
        <pointLight color="#ffb877" intensity={3.4} distance={7} decay={2} />
      </group>

      {bubble}
    </group>
  );
}
