import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { getSessionId } from "./session";
import { audio } from "./audio";
import { candleLife, hoursLeft } from "./candles";
import { memorialFor } from "./memorials";
import { copyGraveUrl } from "./deepLink";
import { CloseIcon } from "./icons";

export default function GravePanel({ grave, onClose, onTravel }) {
  const leaveFlower = useMutation(api.graves.leaveFlower);
  const lightCandle = useMutation(api.graves.lightCandle);
  const [note, setNote] = useState("");

  const life = candleLife(grave.candleLitAt);
  const remaining = hoursLeft(grave.candleLitAt);

  const onFlower = async () => {
    const result = await leaveFlower({ graveId: grave._id, sessionId: getSessionId() });
    if (result?.added) {
      audio.chime();
      setNote("You left a flower.");
    } else {
      setNote("You've already left a flower here.");
    }
  };

  const onCandle = async () => {
    await lightCandle({ graveId: grave._id });
    audio.chime();
    setNote(life > 0 ? "You topped up the candle." : "You relit the candle.");
  };

  const onCopy = async () => {
    const ok = await copyGraveUrl(grave._id);
    setNote(ok ? "Link copied." : "Copy failed — select the URL bar instead.");
  };

  return (
    <aside className="grave-panel">
      <button type="button" className="icon-btn grave-panel__close" onClick={onClose} aria-label="Close">
        <CloseIcon />
      </button>

      <p className="grave-panel__memorial">{memorialFor(grave.plot)}</p>
      <h2 className="grave-panel__name">{grave.name}</h2>
      <p className="grave-panel__meta">
        {grave.cause} · {grave.bornYear}–{grave.diedYear}
      </p>

      {grave.epitaph && <p className="grave-panel__epitaph">“{grave.epitaph}”</p>}

      <p className="grave-panel__state">
        <span>❀ {grave.flowers}</span>
        <span className={life > 0 ? "is-lit" : "is-dark"}>
          {life > 0 ? `Candle burning · ${remaining}h left` : "The candle has gone out"}
        </span>
      </p>

      <div className="grave-panel__actions">
        <button type="button" onClick={onFlower}>
          Leave a flower
        </button>
        <button type="button" className="ghost" onClick={onCandle}>
          {life > 0 ? "Tend the candle" : "Relight the candle"}
        </button>
        <button type="button" className="ghost" onClick={() => onTravel(grave)}>
          Walk here
        </button>
        <button type="button" className="ghost" onClick={onCopy}>
          Copy link
        </button>
      </div>

      {note && <p className="grave-panel__note">{note}</p>}
    </aside>
  );
}
