import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, useGLTF } from "@react-three/drei";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { getSessionId, getTint } from "./session";
import { STALE_AFTER, visitorPosition } from "./movement";
import { activeEmote, emotePose } from "./emotes";

const GHOST = "/models/kenney-graveyard/character-ghost.glb";
const GHOST_SCALE = 1.35;
const HEARTBEAT_MS = 10000;

useGLTF.preload(GHOST);

function Ghost({ visitor, isYou, ownPositionRef, now }) {
  const { scene } = useGLTF(GHOST);
  const group = useRef();
  const body = useRef();
  // Derived from the query rather than set inside the frame loop, so an emote
  // shows the moment the data lands.
  const emote = activeEmote(visitor, now);

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

    const current = activeEmote(visitor, Date.now());
    const pose = emotePose(current, current ? (Date.now() - visitor.emoteAt) / 1000 : 0);

    group.current.position.set(x, 0.35 + bob + pose.lift, z);
    group.current.rotation.y = angle;

    if (body.current) {
      body.current.rotation.z = pose.tilt;
      body.current.rotation.x = pose.pitch;
    }

    if (isYou && ownPositionRef) ownPositionRef.current.set(x, 0, z);
  });

  return (
    <group ref={group}>
      <group ref={body}>
        <primitive object={model} scale={GHOST_SCALE} />
      </group>
      <pointLight color="#9fb4ff" intensity={isYou ? 2.2 : 1.4} distance={4.5} decay={2} />

      {emote && (
        <Html center position={[0, 1.5, 0]} zIndexRange={[12, 0]}>
          <div className="emote-pop">{emote.symbol}</div>
        </Html>
      )}
    </group>
  );
}

export default function Visitors({ moveRef, ownPositionRef, spawn }) {
  const sessionId = getSessionId();
  const visitors = useQuery(api.visitors.list);
  const arrive = useMutation(api.visitors.arrive);
  const move = useMutation(api.visitors.move);
  const depart = useMutation(api.visitors.depart);
  const spawnX = spawn.x;
  const spawnZ = spawn.z;
  // Emotes last a few seconds, so the list needs a clock of its own to expire
  // them and to drop visitors who stopped sending heartbeats.
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 400);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const tint = getTint();
    arrive({ sessionId, x: spawnX, z: spawnZ, tint });

    const beat = setInterval(() => {
      arrive({ sessionId, x: spawnX, z: spawnZ, tint });
    }, HEARTBEAT_MS);

    const leave = () => depart({ sessionId });
    window.addEventListener("pagehide", leave);

    return () => {
      clearInterval(beat);
      window.removeEventListener("pagehide", leave);
      leave();
    };
  }, [arrive, depart, sessionId, spawnX, spawnZ]);

  moveRef.current = (point) => {
    const from = ownPositionRef.current;
    move({ sessionId, fromX: from.x, fromZ: from.z, toX: point.x, toZ: point.z });
  };

  if (!visitors) return null;

  const cutoff = now - STALE_AFTER;

  return visitors
    .filter((visitor) => visitor.lastSeen > cutoff)
    .map((visitor) => (
      <Ghost
        key={visitor.sessionId}
        visitor={visitor}
        isYou={visitor.sessionId === sessionId}
        ownPositionRef={ownPositionRef}
        now={now}
      />
    ));
}
