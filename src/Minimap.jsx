import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { plotPosition } from "./layout";
import { STALE_AFTER, visitorPosition } from "./movement";
import { candleLife, isFresh } from "./candles";
import { getSessionId } from "./session";

const VIEW = 100;
const EDGE = 47;

export default function Minimap({ graves, ownPositionRef, onTravel, selectedId, yardRadius }) {
  const toMap = (x, z) => ({
    cx: VIEW / 2 + (x / (yardRadius + 1)) * EDGE,
    cy: VIEW / 2 + (z / (yardRadius + 1)) * EDGE,
  });

  const visitors = useQuery(api.visitors.list);
  const sessionId = getSessionId();
  const [tick, setTick] = useState(0);

  // Ghost and camera positions live in refs so they don't re-render the scene;
  // the map samples them a few times a second instead.
  useEffect(() => {
    const id = setInterval(() => setTick((value) => value + 1), 140);
    return () => clearInterval(id);
  }, []);

  const now = Date.now();
  const me = toMap(ownPositionRef.current.x, ownPositionRef.current.z);

  return (
    <div className="minimap" aria-hidden="true" data-tick={tick}>
      <svg viewBox={`0 0 ${VIEW} ${VIEW}`}>
        <circle className="minimap__ground" cx={VIEW / 2} cy={VIEW / 2} r={EDGE + 2} />

        {[6.5, 11.5, 16.5, 21.5].filter((radius) => radius < yardRadius).map((radius) => (
          <circle
            key={radius}
            className="minimap__path"
            cx={VIEW / 2}
            cy={VIEW / 2}
            r={(radius / (yardRadius + 1)) * EDGE}
          />
        ))}

        {(graves ?? []).map((grave) => {
          const { x, z } = plotPosition(grave.plot);
          const { cx, cy } = toMap(x, z);
          const life = candleLife(grave.candleLitAt, now);
          const fresh = isFresh(grave.buriedAt, now);

          return (
            <circle
              key={grave._id}
              cx={cx}
              cy={cy}
              r={grave._id === selectedId ? 2.6 : fresh ? 2.2 : 1.7}
              className={`minimap__grave${life > 0 ? " is-lit" : ""}${fresh ? " is-fresh" : ""}${
                grave._id === selectedId ? " is-selected" : ""
              }`}
              onClick={() => onTravel({ x, z })}
            />
          );
        })}

        {(visitors ?? [])
          .filter((visitor) => visitor.lastSeen > now - STALE_AFTER)
          .filter((visitor) => visitor.sessionId !== sessionId)
          .map((visitor) => {
            const { x, z } = visitorPosition(visitor, now);
            const { cx, cy } = toMap(x, z);
            return <circle key={visitor.sessionId} className="minimap__ghost" cx={cx} cy={cy} r={1.9} />;
          })}

        <circle className="minimap__me" cx={me.cx} cy={me.cy} r={2.4} />
      </svg>
    </div>
  );
}
