import { useMemo } from "react";
import { Clone, Text, useGLTF } from "@react-three/drei";
import { wasDrag } from "./pointer";

const model = (name) => `/models/kenney-graveyard/${name}.glb`;
const PARTS = ["crypt-large", "crypt-large-roof", "crypt-large-door", "fire-basket"];

PARTS.forEach((name) => useGLTF.preload(model(name)));

const MANROPE = "/fonts/Manrope-Regular.ttf";
const CINZEL = "/fonts/Cinzel-Bold.ttf";

const SCALE = 3;
const DEPTH = 26;
// crypt-large is 1.0 tall and 2.4 deep before scaling; the roof stacks on top
// and the front face is the +z side, which is the side visitors arrive from.
const BODY_HEIGHT = 1 * SCALE;
const FRONT = 1.2 * SCALE;

export default function Mausoleum({ graves, onSelect, onTravel }) {
  const { scene: body } = useGLTF(model("crypt-large"));
  const { scene: roof } = useGLTF(model("crypt-large-roof"));
  const { scene: door } = useGLTF(model("crypt-large-door"));
  const { scene: brazier } = useGLTF(model("fire-basket"));

  const honoured = useMemo(() => {
    if (!graves) return [];
    return [...graves]
      .filter((grave) => grave.flowers > 0)
      .sort((a, b) => b.flowers - a.flowers)
      .slice(0, 3);
  }, [graves]);

  return (
    <group position={[0, 0, -DEPTH]}>
      {/* An approach path, so the walk out here reads as intentional. */}
      <mesh position={[0, 0.02, 9]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3, 20]} />
        <meshStandardMaterial color="#21212e" roughness={1} />
      </mesh>

      <Clone object={body} scale={SCALE} />
      <group position={[0, BODY_HEIGHT, 0]}>
        <Clone object={roof} scale={SCALE} />
      </group>
      <group position={[-0.9, 0, FRONT + 0.05]}>
        <Clone object={door} scale={SCALE} />
      </group>

      {[-3.1, 3.1].map((x) => (
        <group key={x} position={[x, 0, FRONT + 0.6]}>
          <Clone object={brazier} scale={2} />
          <mesh position={[0, 1.1, 0]}>
            <sphereGeometry args={[0.22, 12, 12]} />
            <meshBasicMaterial color="#ffb268" />
          </mesh>
          <pointLight position={[0, 1.3, 0]} color="#ff9d4d" intensity={12} distance={16} decay={2} />
        </group>
      ))}

      <Text
        position={[0, 4.9, FRONT + 0.2]}
        font={MANROPE}
        fontSize={0.3}
        letterSpacing={0.24}
        color="#d8c79a"
        anchorX="center"
      >
        THE MOST MOURNED
      </Text>

      {honoured.length === 0 ? (
        <Text
          position={[0, 4.1, FRONT + 0.2]}
          font={MANROPE}
          fontSize={0.26}
          color="#8a89a6"
          anchorX="center"
          maxWidth={7}
          textAlign="center"
        >
          No one has been mourned yet. Leave a flower and someone will lie here.
        </Text>
      ) : (
        honoured.map((grave, index) => (
          <group key={grave._id} position={[0, 4.2 - index * 0.75, FRONT + 0.2]}>
            <Text
              font={CINZEL}
              fontSize={0.34}
              color="#f4eedc"
              anchorX="center"
              maxWidth={7.5}
              textAlign="center"
              onClick={(event) => {
                event.stopPropagation();
                if (wasDrag(event)) return;
                onSelect(grave._id);
                onTravel(grave);
              }}
              onPointerOver={() => (document.body.style.cursor = "pointer")}
              onPointerOut={() => (document.body.style.cursor = "default")}
            >
              {`${grave.name}`}
            </Text>
            <Text
              position={[0, -0.28, 0]}
              font={MANROPE}
              fontSize={0.19}
              color="#e0b34d"
              anchorX="center"
            >
              {`❀ ${grave.flowers}`}
            </Text>
          </group>
        ))
      )}
    </group>
  );
}
