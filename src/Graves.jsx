import { useQuery, useMutation } from "convex/react";
import { Clone, Text, useGLTF } from "@react-three/drei";
import { api } from "../convex/_generated/api";
import { plotPosition } from "./layout";
import { getSessionId } from "./session";

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

function Grave({ grave, onFlower }) {
  const { scene } = useGLTF(modelPath(grave.style));
  const { x, z, angle } = plotPosition(grave.plot);

  return (
    <group position={[x, 0, z]} rotation={[0, angle, 0]}>
      <Clone object={scene} scale={2.2} castShadow receiveShadow />

      <Text
        position={[0, 2.55, 0]}
        fontSize={0.3}
        color="#cfd0e8"
        anchorX="center"
        anchorY="bottom"
        maxWidth={3.2}
        textAlign="center"
        outlineWidth={0.014}
        outlineColor="#05050a"
      >
        {grave.name}
      </Text>

      <Text
        position={[0, 2.32, 0]}
        fontSize={0.16}
        color="#7f7f97"
        anchorX="center"
        anchorY="bottom"
      >
        {`${grave.bornYear}–${grave.diedYear} · ${grave.cause}`}
      </Text>

      <mesh
        position={[0, 1.1, 0.3]}
        visible={false}
        onClick={(event) => {
          event.stopPropagation();
          onFlower(grave._id);
        }}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "default")}
      >
        <boxGeometry args={[2, 2.4, 1.4]} />
      </mesh>

      {grave.flowers > 0 && (
        <Text position={[0, 0.3, 0.9]} fontSize={0.22} color="#e0b34d" anchorX="center">
          {`❀ ${grave.flowers}`}
        </Text>
      )}
    </group>
  );
}

export default function Graves() {
  const graves = useQuery(api.graves.list);
  const leaveFlower = useMutation(api.graves.leaveFlower);

  if (!graves) return null;

  const onFlower = (graveId) => leaveFlower({ graveId, sessionId: getSessionId() });

  return graves.map((grave) => <Grave key={grave._id} grave={grave} onFlower={onFlower} />);
}
