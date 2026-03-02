import React from "react";

interface WidgetProps {
  id: string;
  title: string;
  children?: React.ReactNode;
}

export function Widget({ id, title, children }: WidgetProps) {
  return (
    <div id={id} className="relative flex flex-col p-2">
      <div className="flex-1 text-white font-bold drop-shadow-[0_0_2px_rgba(255,255,255,0.5)] pointer-events-none">
        {children || (
          <div className="h-24 flex items-center justify-center opacity-50 italic">
            Empty Widget Config
          </div>
        )}
      </div>
    </div>
  );
}
