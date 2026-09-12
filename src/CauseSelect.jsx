import { useEffect, useRef, useState } from "react";
import { CAUSE_GROUPS } from "../convex/causes";
import { ChevronDownIcon } from "./icons";

export default function CauseSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const wrapper = useRef();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event) => {
      if (wrapper.current && !wrapper.current.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="cause" ref={wrapper}>
      <button
        type="button"
        className="cause__trigger"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{value}</span>
        <ChevronDownIcon className={`cause__chevron${open ? " is-open" : ""}`} />
      </button>

      {open && (
        <div className="cause__menu" role="listbox">
          {CAUSE_GROUPS.map((group) => (
            <div className="cause__group" key={group.label}>
              <p className="cause__heading">{group.label}</p>
              {group.causes.map((cause) => (
                <button
                  type="button"
                  key={cause}
                  role="option"
                  aria-selected={cause === value}
                  className={`cause__option${cause === value ? " is-selected" : ""}`}
                  onClick={() => {
                    onChange(cause);
                    setOpen(false);
                  }}
                >
                  {cause}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
