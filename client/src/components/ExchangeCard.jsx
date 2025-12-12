import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSave, FaSyncAlt, FaArrowRight, FaExchangeAlt } from "react-icons/fa";

export const TARGETS = [
  { code: "VND", flag: "🇻🇳", name: "Vietnam Dong" },
  { code: "USD", flag: "🇺🇸", name: "US Dollar" },
  { code: "PHP", flag: "🇵🇭", name: "Philippine Peso" },
  { code: "IDR", flag: "🇮🇩", name: "Indonesian Rupiah" },
  { code: "CAD", flag: "🇨🇦", name: "Canadian Dollar" },
  { code: "SGD", flag: "🇸🇬", name: "Singapore Dollar" },
];

const ExchangeCard = () => {
  const [selectedCurrency, setSelectedCurrency] = useState("VND");
  const [rate, setRate] = useState(null);
  const [amount, setAmount] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchRate = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `https://945346be86a0.ngrok-free.app/api/exchange/rate?target=${selectedCurrency}`
        );
        setRate(res.data.rate);
      } catch (error) {
        console.error("Error fetching rate", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRate();
  }, [selectedCurrency, refreshTrigger]);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleAmountChange = (e) => {
    const val = e.target.value;
    if (val === "" || val >= 0) {
      setAmount(val);
    }
  }
  const handleSave = async () => {
    if (!rate) return;
    setIsSaving(true);
    try {
      // Gọi API save, Socket bên server sẽ tự bắn event update cho HistoryTable
      const response = await axios.post("https://945346be86a0.ngrok-free.app/api/exchange/save", {
        target: selectedCurrency,
        rate: rate,
      });

      // Trigger custom event để HistoryTable reload
      window.dispatchEvent(new CustomEvent('refresh-history', {
        detail: response.data
      }));

      setTimeout(() => setIsSaving(false), 500);
    } catch (error) {
      console.error("Save failed", error);
      setIsSaving(false);
    }
  };

  // Tính toán kết quả
  const convertedAmount = rate ? amount * rate : 0;

  // Helper format tiền tệ (Ví dụ: 1,234,567)
  const formatNumber = (num) => {
    if (!num) return "0";
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
      num
    );
  };

  return (
    <div className="card exchange-card">
      <div className="card-header">
        <h3>Converter</h3>
        <div
          className="live-status-btn"
          onClick={handleRefresh}
          title="Click to update rate"
        >
          <span className={`status-dot ${loading ? "pulsing" : ""}`}>●</span>
          <span className="status-text">Live Rate</span>
          <FaSyncAlt className={`status-icon ${loading ? "spin" : ""}`} />
        </div>
      </div>

      <div className="converter-container">
        {/* INPUT BOX: JPY */}
        <div className="input-group">
          <label>You send (JPY)</label>
          <div className="input-wrapper">
            <input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              className="amount-input"
              placeholder="0"
            />
            <div className="currency-badge">JPY</div>
          </div>
        </div>

        {/* DIVIDER ICON */}
        <div className="divider-icon">
          <div className="line"></div>
          <div className="icon-circle">
            <FaExchangeAlt />
          </div>
          <div className="line"></div>
        </div>

        {/* OUTPUT BOX: TARGET CURRENCY */}
        <div className="input-group">
          <label>You receive ({selectedCurrency})</label>
          <div className="input-wrapper target-wrapper">
            <div className="amount-display">
              {loading ? "..." : formatNumber(convertedAmount)}
            </div>
            <div className="currency-selector">
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
              >
                {TARGETS.map((t) => (
                  <option key={t.code} value={t.code}>
                    {t.code}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* INFO RATE */}
      <div className="rate-info">
        <span className="live-badge">●</span>1 JPY ={" "}
        <strong>{rate ? formatNumber(rate) : "..."}</strong> {selectedCurrency}
      </div>

      <button
        className={`save-btn ${isSaving ? "saving" : ""}`}
        onClick={handleSave}
        disabled={loading || isSaving}
      >
        <FaSave /> {isSaving ? "Saved!" : "Save Rate"}
      </button>
    </div>
  );
};

export default ExchangeCard;
