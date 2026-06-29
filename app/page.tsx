"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import type { AgentName, AgentOutput, AgentsApiResponse } from "@/lib/types";

type AgentDebugState = Record<AgentName, AgentOutput | null>;

export default function Page() {
  const [input, setInput] = useState("AAPL 值不值得长期投资？");

  const [loading, setLoading] = useState(false);

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
        throw new Error(`Agent API failed: ${res.status}`);
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
      <details style={{ marginTop: 20 }}>
        <summary style={{ cursor: "pointer" }}>
          🧪 Agent Debug（开发者模式）
        </summary>

        {(agents.bull || agents.bear || agents.neutral) && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 12,
              marginTop: 12,
            }}
          >
            {agents.bull && (
              <div style={box}>
                <h4>🐂 Bull</h4>
                <pre>{JSON.stringify(agents.bull, null, 2)}</pre>
              </div>
            )}

            {agents.bear && (
              <div style={box}>
                <h4>🐻 Bear</h4>
                <pre>{JSON.stringify(agents.bear, null, 2)}</pre>
              </div>
            )}

            {agents.neutral && (
              <div style={box}>
                <h4>⚖ Neutral</h4>
                <pre>{JSON.stringify(agents.neutral, null, 2)}</pre>
              </div>
            )}
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

const box: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 10,
  background: "#fafafa",
  fontSize: 12,
};
