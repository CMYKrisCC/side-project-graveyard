import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import Graves from "./Graves";
import BuryForm from "./BuryForm";

function Scene() {
  return (
    <>
      <color attach="background" args={["#070710"]} />
      <fog attach="fog" args={["#0d0d1c", 14, 52]} />

      <hemisphereLight args={["#6f7cc4", "#10101c", 0.5]} />
      <directionalLight position={[-12, 18, 6]} intensity={0.9} color="#aebaff" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[160, 160]} />
        <meshStandardMaterial color="#15151f" />
      </mesh>

      <Suspense fallback={null}>
        <Graves />
      </Suspense>

      <OrbitControls
        enablePan={false}
        minDistance={8}
        maxDistance={60}
        maxPolarAngle={Math.PI / 2.15}
        target={[0, 1.6, 0]}
      />
    </>
  );
}

export default function App() {
  const [burying, setBurying] = useState(false);
  const graves = useQuery(api.graves.list);

  return (
    <>
      <Canvas shadows camera={{ position: [0, 6, 21], fov: 45 }} dpr={[1, 2]}>
        <Scene />
      </Canvas>

      <header className="hud">
        <h1>Side Project Graveyard</h1>
        <p>
          {graves === undefined
            ? "opening the gate…"
            : `${graves.length} ${graves.length === 1 ? "project rests" : "projects rest"} here`}
        </p>
      </header>

      <button className="bury-cta" onClick={() => setBurying(true)}>
        Bury a project
      </button>

      {burying && <BuryForm onClose={() => setBurying(false)} />}
    </>
  );
}
