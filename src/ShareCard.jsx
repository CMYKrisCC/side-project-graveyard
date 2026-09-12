import { useState } from "react";
import { copyGraveUrl, graveUrl } from "./deepLink";
import { CloseIcon, GravestoneIcon } from "./icons";

export default function ShareCard({ graveId, onClose }) {
  const [copied, setCopied] = useState(false);
  const url = graveUrl(graveId);

  const copy = async () => {
    const ok = await copyGraveUrl(graveId);
    setCopied(ok);
    if (!ok) return;
    setTimeout(() => setCopied(false), 2400);
  };

  return (
    <div className="scrim" onClick={onClose}>
      <div className="panel" onClick={(event) => event.stopPropagation()}>
        <header className="panel__head">
          <h2>
            <GravestoneIcon />
            It rests here now
          </h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </header>

        <p className="panel__body">
          A bell rang for everyone in the graveyard. Send this link and it drops them at the
          headstone.
        </p>

        <div className="share">
          <input readOnly value={url} onFocus={(event) => event.target.select()} />
          <button type="button" onClick={copy}>
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <div className="actions">
          <button type="button" onClick={onClose}>
            Visit the grave
          </button>
        </div>
      </div>
    </div>
  );
}
