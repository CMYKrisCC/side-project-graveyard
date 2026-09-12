import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { getSessionId } from "./session";
import { EMOTES } from "./emotes";

export default function EmoteBar({ blocked }) {
  const emote = useMutation(api.visitors.emote);
  const sessionId = getSessionId();

  useEffect(() => {
    if (blocked) return;

    const onKeyDown = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      // Don't fire while someone is naming a project.
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || document.activeElement?.isContentEditable) return;

      const match = EMOTES.find((item) => item.key === event.key.toLowerCase());
      if (match) emote({ sessionId, emote: match.id });
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [blocked, emote, sessionId]);

  return (
    <div className="emote-bar">
      {EMOTES.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => emote({ sessionId, emote: item.id })}
          title={`${item.label} (${item.key.toUpperCase()})`}
        >
          <span aria-hidden="true">{item.symbol}</span>
          <span className="emote-bar__key">{item.key.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );
}
