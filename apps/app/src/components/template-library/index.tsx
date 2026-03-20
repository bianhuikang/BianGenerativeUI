"use client";

import { useAgent } from "@copilotkit/react-core/v2";
import { TemplateCard } from "./template-card";

interface TemplateLibraryProps {
  open: boolean;
  onClose: () => void;
  onSendPrompt: (text: string) => void;
}

interface Template {
  id: string;
  name: string;
  description: string;
  html: string;
  data_description: string;
  version: number;
}

export function TemplateLibrary({ open, onClose, onSendPrompt }: TemplateLibraryProps) {
  const { agent } = useAgent();
  const templates: Template[] = agent.state?.templates || [];

  const handleApply = (id: string, name: string) => {
    onSendPrompt(`Apply the "${name}" template (id: ${id}) to my new data`);
    onClose();
  };

  const handleDelete = (id: string) => {
    agent.setState({
      templates: templates.filter((t) => t.id !== id),
    });
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(2px)" }}
          onClick={onClose}
        />
      )}

      {/* Drawer panel */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col transition-transform duration-300 ease-in-out"
        style={{
          width: 380,
          maxWidth: "90vw",
          transform: open ? "translateX(0)" : "translateX(100%)",
          background: "var(--surface-primary, #fff)",
          borderLeft: "1px solid var(--color-border-glass, rgba(0,0,0,0.1))",
          boxShadow: open ? "-8px 0 30px rgba(0,0,0,0.1)" : "none",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{
            borderBottom: "1px solid var(--color-border-glass, rgba(0,0,0,0.1))",
          }}
        >
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-secondary, #666)" }}>
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
            </svg>
            <h2
              className="text-base font-semibold"
              style={{ color: "var(--text-primary, #1a1a1a)" }}
            >
              Templates
            </h2>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                background: "var(--color-background-secondary, #f5f5f5)",
                color: "var(--text-secondary, #666)",
              }}
            >
              {templates.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors duration-150"
            style={{ color: "var(--text-secondary, #666)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-tertiary, #999)", opacity: 0.5 }}>
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
              </svg>
              <p
                className="text-sm font-medium"
                style={{ color: "var(--text-secondary, #666)" }}
              >
                No templates yet
              </p>
              <p
                className="text-xs"
                style={{ color: "var(--text-tertiary, #999)" }}
              >
                Hover over a widget and click &quot;Save as Template&quot; to save it for reuse.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {templates.map((t) => (
                <TemplateCard
                  key={t.id}
                  id={t.id}
                  name={t.name}
                  description={t.description}
                  html={t.html}
                  dataDescription={t.data_description}
                  version={t.version}
                  onApply={handleApply}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
