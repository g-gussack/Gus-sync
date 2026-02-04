import { closeWindow, maximizeWindow, minimizeWindow } from "@/actions/window";
import { type ReactNode } from "react";

interface DragWindowRegionProps {
  title?: ReactNode;
}

export default function DragWindowRegion({ title }: DragWindowRegionProps) {
  return (
    <div className="flex w-full items-stretch justify-between">
      <div className="draglayer w-full">
        {title && (
          <div className="flex flex-1 p-2 text-xs whitespace-nowrap text-white/60 select-none">
            {title}
          </div>
        )}
      </div>
      <WindowButtons />
    </div>
  );
}

function WindowButtons() {
  return (
    <div className="flex items-center pr-1 text-white/20">
      <button
        title="Minimize"
        type="button"
        className="w-8 h-8 flex items-center justify-center hover:bg-white/5 hover:text-white/30"
        onClick={minimizeWindow}
      >
        <svg
          aria-hidden="true"
          role="img"
          width="10"
          height="10"
          viewBox="0 0 12 12"
        >
          <rect fill="currentColor" width="10" height="1" x="1" y="6"></rect>
        </svg>
      </button>
      <button
        title="Maximize"
        type="button"
        className="w-8 h-8 flex items-center justify-center hover:bg-white/5 hover:text-white/30"
        onClick={maximizeWindow}
      >
        <svg
          aria-hidden="true"
          role="img"
          width="10"
          height="10"
          viewBox="0 0 12 12"
        >
          <rect
            width="9"
            height="9"
            x="1.5"
            y="1.5"
            fill="none"
            stroke="currentColor"
          ></rect>
        </svg>
      </button>
      <button
        type="button"
        title="Close"
        className="w-8 h-8 flex items-center justify-center hover:bg-white/5 hover:text-white/30"
        onClick={closeWindow}
      >
        <svg
          aria-hidden="true"
          role="img"
          width="10"
          height="10"
          viewBox="0 0 12 12"
        >
          <polygon
            fill="currentColor"
            fillRule="evenodd"
            points="11 1.576 6.583 6 11 10.424 10.424 11 6 6.583 1.576 11 1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1"
          ></polygon>
        </svg>
      </button>
    </div>
  );
}
