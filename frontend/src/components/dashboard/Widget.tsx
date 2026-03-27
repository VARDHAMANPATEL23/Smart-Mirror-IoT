import React from "react";

interface WidgetProps {
  id: string;
  title: string;
  children?: React.ReactNode;
}

export function Widget({ id, title, children }: WidgetProps) {
  return (
    <div id={id} className="relative flex flex-col p-2 h-full w-full">
      <div className="flex-1 flex flex-col text-white font-bold drop-shadow-[0_0_2px_rgba(255,255,255,0.5)] pointer-events-none h-full w-full">
        {children || (
          <div className="flex-1 flex items-center justify-center opacity-50 italic">
            Empty Widget Config
          </div>
        )}
      </div>
    </div>
  );
}
