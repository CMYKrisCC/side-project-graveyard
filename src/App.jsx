import { Suspense, useRef, useState } from "react";
import { Vector3 } from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sparkles, Stars } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import Graves from "./Graves";
import Scenery from "./Scenery";
import Visitors from "./Visitors";
import BuryForm from "./BuryForm";

function FollowCamera({ controls, ownPositionRef }) {
  useFrame(() => {
    if (!controls.current) return;
    controls.current.target.lerp(
      { x: ownPositionRef.current.x, y: 1.4, z: ownPositionRef.current.z },
      0.06
    );
    controls.current.update();
  });

  return null;
}

function Scene({ moveRef, ownPositionRef }) {
  const controls = useRef();

  return (
    <>
      <color attach="background" args={["#05050c"]} />
      <fog attach="fog" args={["#0b0b18", 18, 64]} />

      <hemisphereLight args={["#5b6bb0", "#0a0a12", 0.35]} />
      <directionalLight
        position={[-22, 30, 12]}
        intensity={0.75}
        color="#b9c6ff"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-34}
        shadow-camera-right={34}
        shadow-camera-top={34}
        shadow-camera-bottom={-34}
      />

      <Stars radius={120} depth={40} count={1400} factor={3} fade speed={0.4} />
      <mesh position={[-38, 34, -46]}>
        <sphereGeometry args={[3.4, 24, 24]} />
        <meshBasicMaterial color="#e9ecff" />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onClick={(event) => {
          event.stopPropagation();
          moveRef.current(event.point);
        }}
      >
        <circleGeometry args={[160, 64]} />
        <meshStandardMaterial color="#14141f" roughness={1} />
      </mesh>

      <Sparkles count={70} scale={[46, 7, 46]} position={[0, 3, 0]} size={2.4} speed={0.3} color="#aab6ff" />

      <Suspense fallback={null}>
        <Scenery />
        <Graves />
        <Visitors moveRef={moveRef} ownPositionRef={ownPositionRef} />
      </Suspense>

      <OrbitControls
        ref={controls}
        enablePan={false}
        minDistance={7}
        maxDistance={54}
        maxPolarAngle={Math.PI / 2.15}
      />
      <FollowCamera controls={controls} ownPositionRef={ownPositionRef} />

      <EffectComposer>
        <Bloom intensity={0.7} luminanceThreshold={0.45} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.24} darkness={0.82} />
      </EffectComposer>
    </>
  );
}

export default function App() {
  const [burying, setBurying] = useState(false);
  const graves = useQuery(api.graves.list);
  const moveRef = useRef(() => {});
  const ownPositionRef = useRef(new Vector3(0, 0, 3));

  return (
    <>
      <Canvas shadows camera={{ position: [0, 7, 22], fov: 45 }} dpr={[1, 1.75]}>
        <Scene moveRef={moveRef} ownPositionRef={ownPositionRef} />
      </Canvas>

      <header className="hud">
        <h1>Side Project Graveyard</h1>
        <p>
          {graves === undefined
            ? "opening the gate…"
            : `${graves.length} ${graves.length === 1 ? "project rests" : "projects rest"} here`}
        </p>
      </header>

      <p className="hint-bar">Click the ground to walk · click a grave to leave a flower</p>

      <button className="bury-cta" onClick={() => setBurying(true)}>
        Bury a project
      </button>

      {burying && <BuryForm onClose={() => setBurying(false)} />}
    </>
  );
}
