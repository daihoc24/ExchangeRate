import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSave, FaSyncAlt, FaArrowRight } from "react-icons/fa";

const TARGETS = [
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
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchRate = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `https://api.exchangerate-api.com/v4/latest/JPY`
      );
      const currentRate = res.data.rates[selectedCurrency];
      setRate(currentRate);
    } catch (error) {
      console.error("Error fetching rate", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRate();
  }, [selectedCurrency]);

  const handleSave = async () => {
    if (!rate) return;
    setIsSaving(true);
    try {
      // Gọi API save, Socket bên server sẽ tự bắn event update cho HistoryTable
      await axios.post("http://localhost:5000/api/save", {
        pair: `JPY -> ${selectedCurrency}`,
        rate: rate,
      });
      // Giả lập delay 1 xíu cho mượt
      setTimeout(() => setIsSaving(false), 500);
    } catch (error) {
      console.error("Save failed", error);
      setIsSaving(false);
    }
  };

  return (
    <div className="card exchange-card">
      <div className="card-header">
        <h3>Converter</h3>
        <button onClick={fetchRate} className="icon-btn" title="Refresh Rate">
          <FaSyncAlt className={loading ? "spin" : ""} />
        </button>
      </div>

      <div className="conversion-row">
        <div className="currency-box">
          <span className="code">JPY</span>
        </div>

        <FaArrowRight className="arrow-icon" />

        <div className="currency-select-wrapper">
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="currency-select"
          >
            {TARGETS.map((t) => (
              <option key={t.code} value={t.code}>
                {t.code} - {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rate-display">
        <span className="label">Current Rate</span>
        <h2 className="rate-value">
          {loading
            ? "Fetching..."
            : `1 JPY = ${new Intl.NumberFormat().format(
                rate
              )} ${selectedCurrency}`}
        </h2>
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
