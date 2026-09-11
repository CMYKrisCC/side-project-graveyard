import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

export default function App() {
  return (
    <>
      <Canvas camera={{ position: [0, 2, 6], fov: 45 }} dpr={[1, 2]}>
        <color attach="background" args={["#0b0b10"]} />
        <fog attach="fog" args={["#0b0b10", 6, 18]} />
        <ambientLight intensity={0.3} />
        <directionalLight position={[3, 6, 2]} intensity={1.2} />

        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[60, 60]} />
          <meshStandardMaterial color="#1a1a22" />
        </mesh>

        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[0.8, 1.2, 0.18]} />
          <meshStandardMaterial color="#8a8a94" />
        </mesh>

        <OrbitControls
          enablePan={false}
          maxPolarAngle={Math.PI / 2.1}
          minDistance={3}
          maxDistance={12}
        />
      </Canvas>
      <div className="title">Side Project Graveyard</div>
    </>
  );
}
