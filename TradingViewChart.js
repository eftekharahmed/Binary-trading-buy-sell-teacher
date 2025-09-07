import React, { useEffect, useRef } from "react";

export default function TradingViewChart({ symbol }) {
  const ref = useRef();

  useEffect(() => {
    // load TradingView script if needed
    function loadWidget() {
      if (ref.current && window.TradingView) {
        ref.current.innerHTML = "";
        new window.TradingView.widget({
          autosize: true,
          symbol: symbol,
          interval: "1",
          timezone: "Etc/UTC",
          theme: "light",
          style: "1",
          locale: "en",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          container_id: ref.current.id,
        });
      }
    }

    if (!window.TradingView) {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.onload = loadWidget;
      document.body.appendChild(script);
      return;
    }
    loadWidget();
  }, [symbol]);

  return <div id="tv_chart_container" ref={ref} style={{ height: 400, width: "100%" }} />;
}