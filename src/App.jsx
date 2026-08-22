import React, { useState, useRef, useEffect } from "react";

const SUPABASE_URL = "https://gbtqoqcvcgxueienqusn.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_XdmBMicSzJZoXzBbxUnjQw_Bd5DX1wD";
const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

const ORANGE = "#E9642B";
const DARK_BLUE = "#0F2140";

export default function App() {
  const [stage, setStage] = useState("scan-order"); // scan-order | scan-packer | done | error
  const [orderInput, setOrderInput] = useState("");
  const [packerInput, setPackerInput] = useState("");
  const [orderNo, setOrderNo] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [stage]);

  function reset() {
    setStage("scan-order");
    setOrderInput("");
    setPackerInput("");
    setOrderNo(null);
    setResult(null);
    setError("");
  }

  function onOrderSubmit(e) {
    e.preventDefault();
    const val = orderInput.trim();
    if (!val) return;
    setOrderNo(val);
    setOrderInput("");
    setStage("scan-packer");
    setError("");
  }

  async function onPackerSubmit(e) {
    e.preventDefault();
    const val = packerInput.trim();
    if (!val) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`${FUNCTIONS_URL}/pack-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ orderNo, packerNumber: val }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error || "Xatolik yuz berdi");
        setPackerInput("");
        return;
      }
      setResult(json);
      setStage("done");
      setTimeout(reset, 2500);
    } catch (e) {
      setError("Tarmoq xatoligi");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: DARK_BLUE, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 460, background: "#fff", borderRadius: 20, padding: 32, textAlign: "center" }}>
        <div style={{ fontWeight: 900, fontStyle: "italic", fontSize: 22, letterSpacing: 1, marginBottom: 6 }}>MARBA</div>
        <div style={{ fontSize: 12, letterSpacing: 3, color: "#8a887e", fontWeight: 700, marginBottom: 30 }}>YIG'UV STANSIYASI</div>

        {stage === "scan-order" && (
          <>
            <div style={{ fontSize: 46, marginBottom: 10 }}>📦</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Buyurtma qog'ozini skanerlang</div>
            <form onSubmit={onOrderSubmit}>
              <input
                ref={inputRef}
                autoFocus
                value={orderInput}
                onChange={(e) => setOrderInput(e.target.value)}
                style={inputStyle}
                placeholder="Buyurtma raqami..."
              />
            </form>
          </>
        )}

        {stage === "scan-packer" && (
          <>
            <div style={{ fontSize: 46, marginBottom: 10 }}>🙋</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Buyurtma #{orderNo}</div>
            <div style={{ fontSize: 13.5, color: "#8a887e", marginBottom: 20 }}>Yig'uvchi raqamingizni kiriting</div>
            <form onSubmit={onPackerSubmit}>
              <input
                ref={inputRef}
                autoFocus
                value={packerInput}
                onChange={(e) => setPackerInput(e.target.value)}
                style={inputStyle}
                placeholder="Masalan: 4"
                disabled={busy}
              />
            </form>
            {error && <div style={{ color: "#c0392b", fontSize: 13.5, marginTop: 12, fontWeight: 600 }}>{error}</div>}
            <button onClick={reset} style={{ marginTop: 20, background: "transparent", border: "none", color: "#8a887e", fontSize: 13, cursor: "pointer" }}>← Bekor qilish</button>
          </>
        )}

        {stage === "done" && result && (
          <>
            <div style={{ fontSize: 54, marginBottom: 10 }}>✅</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#2c7a4b", marginBottom: 6 }}>{result.packerName} yig'di</div>
            <div style={{ fontSize: 13.5, color: "#8a887e" }}>Buyurtma #{orderNo}{result.customerName ? ` — ${result.customerName}` : ""}</div>
          </>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "16px 14px",
  fontSize: 22,
  textAlign: "center",
  border: `2px solid #d8d6cc`,
  borderRadius: 12,
  outline: "none",
  fontWeight: 700,
  letterSpacing: 1,
};
