"use client";

import { useState } from "react";

type ExpandableTextProps = {
  text?: string;
  className?: string;
};

export function ExpandableText({ text, className = "" }: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);

  if (!text) {
    return null;
  }

  const shouldClamp = text.length > 170;

  return (
    <div className={className}>
      <p className={`${shouldClamp && !expanded ? "line-clamp-3" : ""}`}>{text}</p>
      {shouldClamp ? (
        <button type="button" onClick={() => setExpanded((current) => !current)} className="mt-2 text-sm underline underline-offset-4">
          {expanded ? "Show less" : "Show more"}
        </button>
      ) : null}
    </div>
  );
}
