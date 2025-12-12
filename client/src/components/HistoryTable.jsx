import { useEffect, useState } from "react";
import axios from "axios";
import socketService from "../services/socket"; // Import socket service
import { FaHistory, FaClock } from "react-icons/fa";

const HistoryTable = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Function to load history
    const loadHistory = () => {
      axios
        .get("https://945346be86a0.ngrok-free.app/api/exchange/history")
        .then((res) => {
          if (res.data && Array.isArray(res.data)) {
            setHistory(res.data);
          } else {
            setHistory([]);
          }
        })
        .catch((err) => {
          console.error("Error loading history:", err);
          setHistory([]);
        });
    };

    // 1. Load dữ liệu ban đầu
    loadHistory();

    // 2. Lắng nghe custom event từ ExchangeCard
    const handleRefreshHistory = () => {
      loadHistory();
    };
    window.addEventListener('refresh-history', handleRefreshHistory);

    // 3. Lắng nghe sự kiện realtime qua WebSocket
    const handleNewRecord = (newRecord) => {
      setHistory((prev) => [newRecord, ...prev]);
    };

    socketService.onNewRecord(handleNewRecord);

    // Cleanup khi component unmount
    return () => {
      window.removeEventListener('refresh-history', handleRefreshHistory);
      socketService.removeListener(handleNewRecord);
    };
  }, []);

  return (
    <div className="card history-card">
      <div className="card-header">
        <h3>
          <FaHistory /> Shared History
        </h3>
        <span className="live-badge">● Live</span>
      </div>

      <div className="table-container">
        <table className="styled-table">
          <thead>
            <tr>
              <th>
                <FaClock /> Time Saved
              </th>
              <th>Currency</th>
              <th>Exchange Rate</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, index) => (
              <tr key={item.id} className={index === 0 ? "new-row" : ""}>
                <td className="time-cell">
                  {item.savedAt}
                </td>
                <td className="pair-cell">JPY → {item.targetCurrency}</td>
                <td className="rate-cell">
                  {new Intl.NumberFormat().format(item.rate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {history.length === 0 && (
          <p className="empty-state">No history recorded yet.</p>
        )}
      </div>
    </div>
  );
};

export default HistoryTable;
