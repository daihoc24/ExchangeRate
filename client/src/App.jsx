import React from "react";
import Header from "./components/Header";
import ExchangeCard from "./components/ExchangeCard";
import HistoryTable from "./components/HistoryTable";
import ExchangeChart from "./components/ExchangeChart";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <div className="left-panel">
          <ExchangeCard />
        </div>
        <div className="right-panel">
          <ExchangeChart />
        </div>
      </main>
      <div className="full-width-section">
        <HistoryTable />
      </div>
    </div>
  );
}

export default App;
