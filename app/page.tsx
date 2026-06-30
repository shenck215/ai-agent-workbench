"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import type { AgentName, AgentOutput, AgentsApiResponse } from "@/lib/types";

type AgentDebugState = Record<AgentName, AgentOutput | null>;

const agentDebugMeta: Record<
  AgentName,
  {
    icon: string;
    label: string;
    accent: string;
    accentSoft: string;
  }
> = {
  bull: {
    icon: "🐂",
    label: "Bull",
    accent: "#16a34a",
    accentSoft: "#dcfce7",
  },
  bear: {
    icon: "🐻",
    label: "Bear",
    accent: "#dc2626",
    accentSoft: "#fee2e2",
  },
  neutral: {
    icon: "⚖",
    label: "Neutral",
    accent: "#2563eb",
    accentSoft: "#dbeafe",
  },
};

export default function Page() {
  const [input, setInput] = useState("AAPL 值不值得长期投资？");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [final, setFinal] = useState<AgentsApiResponse["final"]>(null);
  const [decision, setDecision] = useState<
    AgentsApiResponse["decision"] | null
  >(null);
  const [conflict, setConflict] = useState<
    AgentsApiResponse["conflict"] | null
  >(null);

  const [logs, setLogs] = useState<AgentsApiResponse["logs"]>([]);

  const [agents, setAgents] = useState<AgentDebugState>({
    bull: null,
    bear: null,
    neutral: null,
  });

  const run = async () => {
    setLoading(true);

    setFinal(null);
    setDecision(null);
    setConflict(null);
    setLogs([]);
    setError(null);
    setAgents({
      bull: null,
      bear: null,
      neutral: null,
    });

    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input }),
      });

      if (!res.ok) {
        const errorData = (await res.json().catch(() => null)) as {
          error?: string;
          detail?: string;
        } | null;

        throw new Error(
          errorData?.detail ||
            errorData?.error ||
            `Agent API failed: ${res.status}`,
        );
      }

      const data = (await res.json()) as AgentsApiResponse;

      // =========================
      // core results
      // =========================
      setFinal(data.final);
      setDecision(data.decision);
      setConflict(data.conflict);
      setLogs(data.logs || []);

      setAgents({
        bull: data.bull,
        bear: data.bear,
        neutral: data.neutral,
      });
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Agent request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: 24,
        fontFamily: "Arial",
        width: "100%",
        maxWidth: 1280,
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      {/* ========================= */}
      {/* Header */}
      {/* ========================= */}
      <h2>🧠 AI Agent Decision System</h2>
      <p style={{ color: "#666" }}>
        Multi-Agent + Tool + Confidence + Synth + Logging
      </p>

      {/* ========================= */}
      {/* Input */}
      {/* ========================= */}
      <textarea
        rows={4}
        style={{
          width: "100%",
          marginTop: 10,
          padding: 12,
          borderRadius: 8,
          border: "1px solid #ccc",
        }}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button
        onClick={run}
        disabled={loading}
        style={{
          marginTop: 10,
          padding: "10px 16px",
          background: loading ? "#999" : "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        {loading ? "Running..." : "Run Agents"}
      </button>

      {error && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 8,
            color: "#991b1b",
          }}
        >
          {error}
        </div>
      )}

      {/* ========================= */}
      {/* Decision Result（核心产品层） */}
      {/* ========================= */}
      {decision && (
        <div
          style={{
            marginTop: 20,
            padding: 16,
            background: "#f0f9ff",
            borderRadius: 8,
          }}
        >
          <h3>📊 Decision</h3>
          <div>Score: {decision.score}</div>
          <div>
            Conclusion: <b>{decision.decision}</b>
          </div>
        </div>
      )}

      {/* ========================= */}
      {/* Conflict */}
      {/* ========================= */}
      {conflict && (
        <div
          style={{
            marginTop: 10,
            padding: 12,
            background: "#fff1f2",
            borderRadius: 8,
            color: "#be123c",
          }}
        >
          ⚠ Conflict Level: {conflict.level}
        </div>
      )}

      {/* ========================= */}
      {/* Synth Final（产品主输出） */}
      {/* ========================= */}
      {final && (
        <div
          style={{
            marginTop: 20,
            padding: 16,
            border: "1px solid #ddd",
            borderRadius: 8,
            background: "#fff",
          }}
        >
          <h3>🧠 AI Analysis</h3>
          <pre style={{ whiteSpace: "pre-wrap" }}>{final}</pre>
        </div>
      )}

      {/* ========================= */}
      {/* Agents（折叠式 debug） */}
      {/* ========================= */}
      <details style={debugDetails}>
        <summary style={debugSummary}>
          <span>🧪 Agent Debug</span>
          <span style={debugSummaryHint}>开发者模式</span>
        </summary>

        {(agents.bull || agents.bear || agents.neutral) && (
          <div style={debugGrid}>
            {(["bull", "bear", "neutral"] as const).map((agentName) => {
              const agent = agents[agentName];
              if (!agent) return null;

              return (
                <AgentDebugCard
                  key={agentName}
                  agent={agent}
                  name={agentName}
                />
              );
            })}
          </div>
        )}
      </details>

      {/* ========================= */}
      {/* Logs（核心升级点） */}
      {/* ========================= */}
      <details style={{ marginTop: 20 }}>
        <summary style={{ cursor: "pointer" }}>
          🧠 AI Execution Logs（可回放）
        </summary>

        <div style={{ marginTop: 12 }}>
          {logs.map((l, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              <code>{l.type}</code> —{" "}
              <span style={{ color: "#666" }}>{JSON.stringify(l)}</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

function AgentDebugCard({
  agent,
  name,
}: {
  agent: AgentOutput;
  name: AgentName;
}) {
  const meta = agentDebugMeta[name];
  const confidence = Math.round(agent.confidence * 100);

  return (
    <section style={debugCard}>
      <div style={debugCardHeader}>
        <div style={debugAgentTitle}>
          <span style={{ ...debugAgentIcon, background: meta.accentSoft }}>
            {meta.icon}
          </span>
          <span>{meta.label}</span>
        </div>
        <span
          style={{
            ...debugConfidenceBadge,
            color: meta.accent,
            background: meta.accentSoft,
          }}
        >
          {confidence}%
        </span>
      </div>

      <div style={debugConfidenceTrack}>
        <div
          style={{
            ...debugConfidenceFill,
            width: `${Math.max(0, Math.min(confidence, 100))}%`,
            background: meta.accent,
          }}
        />
      </div>

      <div style={debugFieldStack}>
        <DebugField label="Thought" value={agent.thought} />
        <DebugField label="Tool" value={agent.tool || "none"} mono />
        <DebugField label="Final" value={agent.final} />
      </div>

      <details style={rawDetails}>
        <summary style={rawSummary}>Raw JSON</summary>
        <pre style={rawJson}>{JSON.stringify(agent, null, 2)}</pre>
      </details>
    </section>
  );
}

function DebugField({
  label,
  mono,
  value,
}: {
  label: string;
  mono?: boolean;
  value: string;
}) {
  return (
    <div>
      <div style={debugFieldLabel}>{label}</div>
      <div style={mono ? debugFieldMonoValue : debugFieldValue}>{value}</div>
    </div>
  );
}

const debugDetails: CSSProperties = {
  marginTop: 20,
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  background: "#fff",
  overflow: "hidden",
};

const debugSummary: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  cursor: "pointer",
  padding: "12px 14px",
  fontSize: 15,
  fontWeight: 700,
  borderBottom: "1px solid #e5e7eb",
  background: "#f8fafc",
};

const debugSummaryHint: CSSProperties = {
  color: "#64748b",
  fontSize: 13,
  fontWeight: 500,
};

const debugGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 12,
  padding: 12,
  alignItems: "stretch",
};

const debugCard: CSSProperties = {
  minWidth: 0,
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  padding: 14,
  background: "#ffffff",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
};

const debugCardHeader: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 10,
};

const debugAgentTitle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  minWidth: 0,
  fontSize: 14,
  fontWeight: 700,
};

const debugAgentIcon: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 28,
  height: 28,
  borderRadius: 6,
  flex: "0 0 auto",
};

const debugConfidenceBadge: CSSProperties = {
  flex: "0 0 auto",
  borderRadius: 999,
  padding: "4px 8px",
  fontSize: 12,
  fontWeight: 700,
};

const debugConfidenceTrack: CSSProperties = {
  height: 6,
  borderRadius: 999,
  background: "#e5e7eb",
  overflow: "hidden",
  marginBottom: 14,
};

const debugConfidenceFill: CSSProperties = {
  height: "100%",
  borderRadius: 999,
};

const debugFieldStack: CSSProperties = {
  display: "grid",
  gap: 12,
};

const debugFieldLabel: CSSProperties = {
  marginBottom: 5,
  color: "#64748b",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 0,
  textTransform: "uppercase",
};

const debugFieldValue: CSSProperties = {
  color: "#1f2937",
  fontSize: 13,
  lineHeight: 1.65,
  overflowWrap: "anywhere",
  wordBreak: "break-word",
};

const debugFieldMonoValue: CSSProperties = {
  ...debugFieldValue,
  display: "inline-block",
  maxWidth: "100%",
  borderRadius: 6,
  padding: "3px 7px",
  background: "#f1f5f9",
  color: "#334155",
  fontFamily: "var(--font-mono)",
  fontSize: 12,
};

const rawDetails: CSSProperties = {
  marginTop: 14,
  borderTop: "1px solid #e5e7eb",
  paddingTop: 10,
};

const rawSummary: CSSProperties = {
  cursor: "pointer",
  color: "#64748b",
  fontSize: 12,
  fontWeight: 700,
};

const rawJson: CSSProperties = {
  margin: "10px 0 0",
  maxHeight: 220,
  overflow: "auto",
  borderRadius: 8,
  padding: 10,
  background: "#0f172a",
  color: "#e2e8f0",
  fontFamily: "var(--font-mono)",
  fontSize: 12,
  lineHeight: 1.55,
  whiteSpace: "pre-wrap",
  overflowWrap: "anywhere",
};
