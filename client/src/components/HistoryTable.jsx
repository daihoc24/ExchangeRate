import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import socket from "../services/socket"; // Import socket singleton
import { FaHistory, FaClock } from "react-icons/fa";

const HistoryTable = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/history")
      .then((res) => setHistory(res.data))
      .catch((err) => console.error(err));

    socket.on("new-record", (newRecord) => {
      setHistory((prev) => [newRecord, ...prev]);
    });

    return () => {
      socket.off("new-record");
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
              <tr key={item._id} className={index === 0 ? "new-row" : ""}>
                <td className="time-cell">
                  {moment(item.timestamp).fromNow()}
                </td>
                <td className="pair-cell">{item.pair}</td>
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
