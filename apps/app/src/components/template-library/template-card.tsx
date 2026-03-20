"use client";

import { useRef, useEffect, useState } from "react";

interface TemplateCardProps {
  id: string;
  name: string;
  description: string;
  html: string;
  dataDescription: string;
  version: number;
  onApply: (id: string, name: string) => void;
  onDelete: (id: string, name: string) => void;
}

export function TemplateCard({
  id,
  name,
  description,
  html,
  dataDescription,
  version,
  onApply,
  onDelete,
}: TemplateCardProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [previewReady, setPreviewReady] = useState(false);

  useEffect(() => {
    if (!iframeRef.current || !html) return;
    const doc = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
* { box-sizing: border-box; margin: 0; }
body { font-family: system-ui, sans-serif; font-size: 16px; color: #1a1a1a; background: #fff; transform-origin: top left; overflow: hidden; }
@media (prefers-color-scheme: dark) { body { color: #e8e6de; background: #1a1a18; } }
</style></head><body><div id="content">${html}</div></body></html>`;
    iframeRef.current.srcdoc = doc;
    const timer = setTimeout(() => setPreviewReady(true), 500);
    return () => clearTimeout(timer);
  }, [html]);

  return (
    <div
      className="rounded-xl overflow-hidden flex flex-col"
      style={{
        border: "1px solid var(--color-border-glass, rgba(0,0,0,0.1))",
        background: "var(--surface-primary, #fff)",
      }}
    >
      {/* Preview */}
      <div
        className="relative overflow-hidden"
        style={{ height: 140, background: "var(--color-background-secondary, #f7f6f3)" }}
      >
        <iframe
          ref={iframeRef}
          sandbox="allow-same-origin"
          className="border-0 w-[300%] h-[300%] origin-top-left"
          style={{
            transform: "scale(0.333)",
            pointerEvents: "none",
            opacity: previewReady ? 1 : 0,
            transition: "opacity 300ms",
          }}
          title={`Preview: ${name}`}
        />
        {/* Version badge */}
        <span
          className="absolute top-2 right-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
          style={{
            background: "var(--color-background-info, #E6F1FB)",
            color: "var(--color-text-info, #185FA5)",
          }}
        >
          v{version}
        </span>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 p-3 flex-1">
        <h3
          className="text-sm font-semibold truncate"
          style={{ color: "var(--text-primary, #1a1a1a)" }}
        >
          {name}
        </h3>
        <p
          className="text-xs line-clamp-2"
          style={{ color: "var(--text-secondary, #666)" }}
        >
          {description}
        </p>
        {dataDescription && (
          <p
            className="text-[10px] mt-1 truncate"
            style={{ color: "var(--text-tertiary, #999)" }}
          >
            Data: {dataDescription}
          </p>
        )}
      </div>

      {/* Actions */}
      <div
        className="flex gap-2 p-3 pt-0"
      >
        <button
          onClick={() => onApply(id, name)}
          className="flex-1 text-xs font-medium py-1.5 rounded-lg transition-all duration-150 hover:scale-[1.02] text-white"
          style={{
            background: "linear-gradient(135deg, var(--color-lilac-dark, #6366f1), var(--color-mint-dark, #10b981))",
          }}
        >
          Apply
        </button>
        <button
          onClick={() => onDelete(id, name)}
          className="text-xs px-3 py-1.5 rounded-lg transition-colors duration-150"
          style={{
            border: "1px solid var(--color-border-tertiary, rgba(0,0,0,0.1))",
            color: "var(--color-text-danger, #A32D2D)",
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
