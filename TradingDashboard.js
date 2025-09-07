import { useState, useEffect } from "react";
import TradingViewChart from "./TradingViewChart";

export default function TradingDashboard() {
  const [analysis, setAnalysis] = useState({});
  const [lastSignals, setLastSignals] = useState({});
  const [selectedSymbol, setSelectedSymbol] = useState("EURUSD");
  const [popup, setPopup] = useState(null);

  const SYMBOLS = {
    EURUSD: "OANDA:EURUSD",
    GBPUSD: "OANDA:GBPUSD",
    BTCUSD: "BINANCE:BTCUSDT",
    GOLD: "OANDA:XAUUSD"
  };

  // 🔔 Different Sounds
  const playAlertSound = (signal) => {
    let soundFile = "/neutral.mp3";

    if (signal === "BUY" || signal === "खरीदें") {
      soundFile = "/buy.mp3";
    } else if (signal === "SELL" || signal === "बेचें") {
      soundFile = "/sell.mp3";
    } else {
      soundFile = "/neutral.mp3";
    }

    const audio = new Audio(soundFile);
    audio.play();
  };

  // 🎤 Speak Hindi
  const speakHindi = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "hi-IN";
    utterance.pitch = 1;
    utterance.rate = 1;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };

  // 📢 Popup
  const showPopup = (symbol, signal) => {
    setPopup({ symbol, signal });
    setTimeout(() => setPopup(null), 7000);
  };

  // 🚦 Check signal changes
  const checkAndSpeakSignals = (data) => {
    Object.keys(SYMBOLS).forEach((sym, i) => {
      const d = data[sym];
      if (!d) return;

      const newSignal = d.trade_signal_hi;
      const oldSignal = lastSignals[sym];

      if (newSignal && newSignal !== oldSignal) {
        setTimeout(() => {
          playAlertSound(newSignal);
          showPopup(sym, newSignal);
          speakHindi(`ध्यान दें, ${sym} का नया संकेत मिला है।`);
        }, i * 15000);

        setTimeout(() => {
          const msg = `सिंबल ${sym}. \nवर्तमान स्थिति ${d.market_condition}. \nकारण: ${d.analysis_reason_hi}. \nसंकेत: ${newSignal}.`;
          speakHindi(msg);
        }, i * 15000 + 5000);
      }
    });

    setLastSignals({
      EURUSD: data.EURUSD?.trade_signal_hi,
      GBPUSD: data.GBPUSD?.trade_signal_hi,
      BTCUSD: data.BTCUSD?.trade_signal_hi,
      GOLD: data.GOLD?.trade_signal_hi
    });
  };

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("http://localhost:8000/analyse");
      const data = await res.json();
      setAnalysis(data);
      checkAndSpeakSignals(data);
    }

    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const symbolData = analysis[selectedSymbol] || {};

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 relative">
      {/* Corner Popup */}
      {popup && (
        <div
          className={`fixed top-6 right-6 px-5 py-3 rounded-xl shadow-xl text-white text-lg font-semibold z-50 transition transform duration-500
            ${popup.signal === "खरीदें" || popup.signal === "BUY" ? "bg-green-600" :
              popup.signal === "बेचें" || popup.signal === "SELL" ? "bg-red-600" :
              "bg-gray-600"
            }`}
        >
          📢 {popup.symbol} → {popup.signal}
        </div>
      )}

      {/* Chart */}
      <div className="p-4 shadow-lg rounded-2xl bg-white">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">📈 Live Trading Chart</h2>
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="p-2 border rounded-lg"
          >
            {Object.keys(SYMBOLS).map((sym) => (
              <option key={sym} value={sym}>{sym}</option>
            ))}
          </select>
        </div>
        <TradingViewChart symbol={SYMBOLS[selectedSymbol]} />
      </div>

      {/* Analysis Info */}
      <div className="p-4 shadow-lg rounded-2xl bg-white flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold mb-3">📝 Analysis</h2>
          <div className="mb-2">
            <b>Market Condition:</b> {symbolData.market_condition || "Loading..."}
          </div>
          <div className="mb-2">
            <b>Signal (Hindi):</b> {symbolData.trade_signal_hi || "Loading..."}
          </div>
          <div className="mb-2">
            <b>Signal (English):</b> {symbolData.trade_signal_en || "Loading..."}
          </div>
          <div className="mb-2">
            <b>Reason (Hindi):</b> {symbolData.analysis_reason_hi || "Loading..."}
          </div>
          <div className="mb-2">
            <b>Reason (English):</b> {symbolData.analysis_reason_en || "Loading..."}
          </div>
        </div>
      </div>
    </div>
  );
}