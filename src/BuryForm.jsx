import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { CAUSES } from "../convex/causes";
import { getSessionId } from "./session";

const THIS_YEAR = new Date().getFullYear();

export default function BuryForm({ onClose }) {
  const bury = useMutation(api.graves.bury);
  const [name, setName] = useState("");
  const [bornYear, setBornYear] = useState(THIS_YEAR);
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
        <h2>Bury a project</h2>

        <label>
          Name
          <input
            autoFocus
            value={name}
            maxLength={40}
            placeholder="Portfolio v3"
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        <div className="row">
          <label>
            Born
            <input
              type="number"
              value={bornYear}
              min={1970}
              max={THIS_YEAR}
              onChange={(event) => setBornYear(event.target.value)}
            />
          </label>
          <label>
            Died
            <input
              type="number"
              value={diedYear}
              min={1970}
              max={THIS_YEAR}
              onChange={(event) => setDiedYear(event.target.value)}
            />
          </label>
        </div>

        <label>
          Cause of death
          <select value={cause} onChange={(event) => setCause(event.target.value)}>
            {CAUSES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          Epitaph <span className="hint">optional</span>
          <input
            value={epitaph}
            maxLength={80}
            placeholder="the grid was never right"
            onChange={(event) => setEpitaph(event.target.value)}
          />
        </label>

        {error && <p className="error">{error}</p>}

        <div className="actions">
          <button type="button" className="ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" disabled={busy || name.trim().length === 0}>
            {busy ? "Digging…" : "Bury it"}
          </button>
        </div>
      </form>
    </div>
  );
}
