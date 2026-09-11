import { useMemo, useRef, useState } from "react";
import { Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
import { useQuery, useMutation } from "convex/react";
import { Billboard, Clone, Html, Text, useGLTF } from "@react-three/drei";
import { api } from "../convex/_generated/api";
import { plotPosition } from "./layout";
import { memorialFor } from "./memorials";
import { getSessionId } from "./session";

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

const NAME_SIZE = 0.26;
const NAME_TOP = 0.62;
const NAME_MAX_WIDTH = 3.1;
const CHARS_PER_LINE = 22;
// Inscriptions all face the camera, so distant ones would pile on top of each
// other. Only the graves you are standing near get to speak.
const READABLE_RANGE = 15;

function Inscription({ grave }) {
  const lines = grave.name.length > CHARS_PER_LINE ? 2 : 1;
  const nameBottom = NAME_TOP - lines * NAME_SIZE * 1.2;

  return (
    <>
      <Text
        position={[0, NAME_TOP + 0.16, 0]}
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
        position={[0, nameBottom - 0.07, 0]}
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
        position={[0, nameBottom - 0.3, 0]}
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

function Grave({ grave, onFlower }) {
  const { scene } = useGLTF(modelPath(grave.style));
  const { x, z, angle } = plotPosition(grave.plot);
  const [hovered, setHovered] = useState(false);
  const inscription = useRef();
  const anchor = useMemo(() => new Vector3(x, 2.2, z), [x, z]);

  useFrame(({ camera }) => {
    if (inscription.current) {
      inscription.current.visible = camera.position.distanceTo(anchor) < READABLE_RANGE;
    }
  });

  return (
    <>
      <group position={[x, 0, z]} rotation={[0, angle, 0]}>
        <Clone object={scene} scale={2.2} castShadow receiveShadow />

        <mesh
          position={[0, 1.1, 0.3]}
          visible={false}
          onClick={(event) => {
            event.stopPropagation();
            onFlower(grave._id);
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
            position={[0, 0.3, 0.9]}
            font={MANROPE}
            fontSize={0.22}
            color="#e0b34d"
            anchorX="center"
          >
            {`❀ ${grave.flowers}`}
          </Text>
        )}
      </group>

      <Billboard ref={inscription} position={[x, 2.2, z]}>
        <Inscription grave={grave} />

        {hovered && grave.epitaph && (
          <Html center position={[0, -0.5, 0]} distanceFactor={12} zIndexRange={[20, 0]}>
            <div className="epitaph">{`“${grave.epitaph}”`}</div>
          </Html>
        )}
      </Billboard>
    </>
  );
}

export default function Graves() {
  const graves = useQuery(api.graves.list);
  const leaveFlower = useMutation(api.graves.leaveFlower);

  if (!graves) return null;

  const onFlower = (graveId) => leaveFlower({ graveId, sessionId: getSessionId() });

  return graves.map((grave) => <Grave key={grave._id} grave={grave} onFlower={onFlower} />);
}
