import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { getSessionId, getTint } from "./session";
import { STALE_AFTER, visitorPosition } from "./movement";

const GHOST = "/models/kenney-graveyard/character-ghost.glb";
const GHOST_SCALE = 1.35;
const SPAWN = { x: 0, z: 3 };
const HEARTBEAT_MS = 10000;

useGLTF.preload(GHOST);

function Ghost({ visitor, isYou, ownPositionRef }) {
  const { scene } = useGLTF(GHOST);
  const group = useRef();

  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((node) => {
      if (!node.isMesh) return;
      node.material = node.material.clone();
      node.material.color.setHSL(visitor.tint / 360, isYou ? 0.15 : 0.4, isYou ? 0.9 : 0.72);
      node.material.transparent = true;
      node.material.opacity = isYou ? 0.95 : 0.8;
    });
    return clone;
  }, [scene, visitor.tint, isYou]);

  useFrame(({ clock }) => {
    if (!group.current) return;

    const { x, z, angle, walking } = visitorPosition(visitor, Date.now());
    const bob = Math.sin(clock.elapsedTime * (walking ? 6 : 2)) * (walking ? 0.09 : 0.05);

    group.current.position.set(x, 0.35 + bob, z);
    group.current.rotation.y = angle;

    if (isYou && ownPositionRef) ownPositionRef.current.set(x, 0, z);
  });

  return (
    <group ref={group}>
      <primitive object={model} scale={GHOST_SCALE} />
      <pointLight color="#9fb4ff" intensity={isYou ? 2.2 : 1.4} distance={4.5} decay={2} />
    </group>
  );
}

export default function Visitors({ moveRef, ownPositionRef }) {
  const sessionId = getSessionId();
  const visitors = useQuery(api.visitors.list);
  const arrive = useMutation(api.visitors.arrive);
  const move = useMutation(api.visitors.move);
  const depart = useMutation(api.visitors.depart);

  useEffect(() => {
    const tint = getTint();
    arrive({ sessionId, x: SPAWN.x, z: SPAWN.z, tint });

    const beat = setInterval(() => {
      arrive({ sessionId, x: SPAWN.x, z: SPAWN.z, tint });
    }, HEARTBEAT_MS);

    const leave = () => depart({ sessionId });
    window.addEventListener("pagehide", leave);

    return () => {
      clearInterval(beat);
      window.removeEventListener("pagehide", leave);
      leave();
    };
  }, [arrive, depart, sessionId]);

  moveRef.current = (point) => {
    const from = ownPositionRef.current;
    move({ sessionId, fromX: from.x, fromZ: from.z, toX: point.x, toZ: point.z });
  };

  if (!visitors) return null;

  const cutoff = Date.now() - STALE_AFTER;

  return visitors
    .filter((visitor) => visitor.lastSeen > cutoff)
    .map((visitor) => (
      <Ghost
        key={visitor.sessionId}
        visitor={visitor}
        isYou={visitor.sessionId === sessionId}
        ownPositionRef={ownPositionRef}
      />
    ));
}
