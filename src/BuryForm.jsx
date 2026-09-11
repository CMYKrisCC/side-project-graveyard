import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { CAUSE_GROUPS, CAUSES } from "../convex/causes";
import { getSessionId } from "./session";
import { ChevronDownIcon, CloseIcon, GravestoneIcon } from "./icons";

const THIS_YEAR = new Date().getFullYear();

export default function BuryForm({ onClose }) {
  const bury = useMutation(api.graves.bury);
  const [name, setName] = useState("");
  const [bornYear, setBornYear] = useState(THIS_YEAR - 1);
  const [diedYear, setDiedYear] = useState(THIS_YEAR);
  const [cause, setCause] = useState(CAUSES[0]);
  const [epitaph, setEpitaph] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      await bury({
        name,
        bornYear: Number(bornYear),
        diedYear: Number(diedYear),
        cause,
        epitaph,
        sessionId: getSessionId(),
      });
      onClose();
    } catch (caught) {
      const message = String(caught?.message ?? caught);
      setError(message.split("Uncaught Error:").pop().split(" at handler")[0].trim());
      setBusy(false);
    }
  };

  return (
    <div className="scrim" onClick={onClose}>
      <form className="panel" onSubmit={submit} onClick={(event) => event.stopPropagation()}>
        <header className="panel__head">
          <h2>
            <GravestoneIcon />
            Laying your project to rest
          </h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </header>

        <label className="field">
          <span className="field__label">
            Project name <em>50 characters max.</em>
          </span>
          <input
            autoFocus
            value={name}
            maxLength={50}
            placeholder="Type here..."
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        <div className="row">
          <label className="field">
            <span className="field__label">Born</span>
            <input
              type="number"
              value={bornYear}
              min={1970}
              max={THIS_YEAR}
              onChange={(event) => setBornYear(event.target.value)}
            />
          </label>
          <label className="field">
            <span className="field__label">Died</span>
            <input
              type="number"
              value={diedYear}
              min={1970}
              max={THIS_YEAR}
              onChange={(event) => setDiedYear(event.target.value)}
            />
          </label>
        </div>

        <label className="field">
          <span className="field__label">Cause of death</span>
          <span className="select">
            <select value={cause} onChange={(event) => setCause(event.target.value)}>
              {CAUSE_GROUPS.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.causes.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <ChevronDownIcon className="select__chevron" />
          </span>
        </label>

        <label className="field">
          <span className="field__label">
            Epitaph <em>(Optional)</em>
          </span>
          <input
            value={epitaph}
            maxLength={80}
            placeholder="Type here..."
            onChange={(event) => setEpitaph(event.target.value)}
          />
        </label>

        {error && <p className="error">{error}</p>}

        <div className="actions">
          <button type="button" className="ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" disabled={busy || name.trim().length === 0}>
            {busy ? "Digging…" : "Bury Your Project"}
          </button>
        </div>
      </form>
    </div>
  );
}
