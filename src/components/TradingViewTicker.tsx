import { useEffect, useRef } from "react";

export const TradingViewTicker = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: "BINANCE:BTCUSDT", title: "Bitcoin" },
        { proName: "BINANCE:ETHUSDT", title: "Ethereum" },
        { proName: "BINANCE:XRPUSDT", title: "XRP" },
        { proName: "BINANCE:BNBUSDT", title: "BNB" },
        { proName: "BINANCE:SOLUSDT", title: "Solana" },
        { proName: "BINANCE:USDCUSDT", title: "USDC" },
        { proName: "BINANCE:DOGEUSDT", title: "Dogecoin" },
        { proName: "BINANCE:TRXUSDT", title: "TRON" },
        { proName: "BINANCE:ADAUSDT", title: "Cardano" },
        { proName: "BINANCE:HYPEUSDT", title: "Hyperliquid" },
        { proName: "BINANCE:LINKUSDT", title: "Chainlink" },
        { proName: "BINANCE:ETHFIUSDT", title: "Etherna USDe" },
        { proName: "BINANCE:XLMUSDT", title: "Stellar" },
        { proName: "BINANCE:AVAXUSDT", title: "Avalanche" },
        { proName: "BINANCE:SUIUSDT", title: "Sui" },
        { proName: "BINANCE:BCHUSDT", title: "Bitcoin Cash" },
        { proName: "BINANCE:HBARUSDT", title: "Hedera" },
        { proName: "BINANCE:LTCUSDT", title: "Litecoin" },
        { proName: "BINANCE:PYUSDUSDT", title: "PayPal USD" },
      ],
      showSymbolLogo: true,
      colorTheme: "dark",
      isTransparent: true,
      displayMode: "adaptive",
      locale: "en"
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, []);

  return (
    <div className="w-full bg-background border-y border-border">
      <div className="tradingview-widget-container" ref={containerRef}>
        <div className="tradingview-widget-container__widget"></div>
      </div>
    </div>
  );
};
