import React, { useEffect, useState } from "react";
import axios from "axios";
import socketService from "../services/socket";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { FaChartLine } from "react-icons/fa";
import moment from "moment";
import { TARGETS } from "./ExchangeCard";

const ExchangeChart = () => {
  const [chartData, setChartData] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState("ALL");

  useEffect(() => {
    // Function to load chart data
    const loadChartData = () => {
      axios
        .get("https://945346be86a0.ngrok-free.app/api/exchange/history")
        .then((res) => {
          processChartData(res.data);
        })
        .catch((err) => console.error(err));
    };

    // Load initial history data
    loadChartData();

    // Listen for custom event from ExchangeCard
    const handleRefreshChart = () => {
      loadChartData();
    };
    window.addEventListener('refresh-history', handleRefreshChart);

    // Listen for real-time updates via WebSocket
    const handleNewRecord = (newRecord) => {
      const formatted = {
        time: moment(newRecord.savedAt, "DD/MM/YYYY HH:mm:ss").format("HH:mm"),
        fullTime: newRecord.savedAt,
        rate: parseFloat(newRecord.rate),
        pair: `JPY → ${newRecord.targetCurrency}`,
        currency: newRecord.targetCurrency,
      };

      setChartData((prev) => {
        const updated = [...prev, formatted];
        // Keep only last 20 records
        return updated.slice(-20);
      });
    };

    socketService.onNewRecord(handleNewRecord);

    return () => {
      window.removeEventListener('refresh-history', handleRefreshChart);
      socketService.removeListener(handleNewRecord);
    };
  }, []);

  const processChartData = (data) => {
    // Process and format data for chart
    if (!data || !Array.isArray(data) || data.length === 0) {
      setChartData([]);
      return;
    }

    const formatted = data
      .slice(0, 20) // Last 20 records
      .reverse() // Oldest to newest
      .map((item) => ({
        time: moment(item.savedAt, "DD/MM/YYYY HH:mm:ss").format("HH:mm"),
        fullTime: item.savedAt,
        rate: parseFloat(item.rate),
        pair: `JPY → ${item.targetCurrency}`,
        currency: item.targetCurrency,
      }));

    setChartData(formatted);
  };

  // Filter data by selected currency
  const filteredData = chartData.filter(
    (item) => selectedCurrency === "ALL" || item.currency === selectedCurrency
  );

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-time">{payload[0].payload.fullTime}</p>
          <p className="tooltip-pair">{payload[0].payload.pair}</p>
          <p className="tooltip-rate">
            Rate: <strong>{payload[0].value.toLocaleString()}</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card chart-card">
      <div className="card-header">
        <h3>
          <FaChartLine /> Exchange Rate Trend
        </h3>
        <select
          value={selectedCurrency}
          onChange={(e) => setSelectedCurrency(e.target.value)}
          className="currency-filter"
        >
          <option value="ALL">All Currencies</option>
          {TARGETS.map((target) => (
            <option key={target.code} value={target.code}>
              {target.code} - {target.name}
            </option>
          ))}
        </select>
      </div>

      <div className="chart-container">
        {filteredData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filteredData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="time"
                stroke="#6b7280"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="#6b7280"
                style={{ fontSize: "12px" }}
                tickFormatter={(value) => value.toFixed(2)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="rate"
                stroke="#4f46e5"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRate)"
                name="Exchange Rate"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-chart">
            <p>No data available for chart</p>
            <p className="empty-hint">Save some exchange rates to see the trend</p>
          </div>
        )}
      </div>

      {filteredData.length > 0 && (
        <div className="chart-stats">
          <div className="stat-item">
            <span className="stat-label">Highest</span>
            <span className="stat-value">
              {Math.max(...filteredData.map((d) => d.rate)).toFixed(2)}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Lowest</span>
            <span className="stat-value">
              {Math.min(...filteredData.map((d) => d.rate)).toFixed(2)}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Average</span>
            <span className="stat-value">
              {(
                filteredData.reduce((sum, d) => sum + d.rate, 0) /
                filteredData.length
              ).toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExchangeChart;
