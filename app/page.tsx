"use client";

import { useState } from "react";

export default function Page() {
  const [input, setInput] = useState("");

  const [bull, setBull] = useState("");
  const [bear, setBear] = useState("");
  const [neutral, setNeutral] = useState("");
  const [tool, setTool] = useState("");
  const [final, setFinal] = useState("");

  const run = async () => {
    setBull("");
    setBear("");
    setNeutral("");
    setTool("");
    setFinal("");

    const res = await fetch("/api/agents", {
      method: "POST",
      body: JSON.stringify({ input }),
    });

    const data = await res.json();

    setBull(data.bull);
    setBear(data.bear);
    setNeutral(data.neutral);
    setTool(data.tool);
    setFinal(data.final);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Multi-Agent AI System (Step 2)</h2>

      <textarea
        rows={4}
        style={{ width: "100%" }}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button onClick={run} style={{ marginTop: 10 }}>
        Run Agents
      </button>

      {tool && (
        <div style={{ marginTop: 10, color: "orange" }}>
          🔧 Tool Result: {tool}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 10,
          marginTop: 20,
        }}
      >
        <div>
          <h3>🐂 Bull</h3>
          <pre>{bull}</pre>
        </div>

        <div>
          <h3>🐻 Bear</h3>
          <pre>{bear}</pre>
        </div>

        <div>
          <h3>⚖️ Neutral</h3>
          <pre>{neutral}</pre>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <h3>🧠 Final Decision</h3>
        <pre>{final}</pre>
      </div>
    </div>
  );
}
