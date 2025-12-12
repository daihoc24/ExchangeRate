import React from "react";
import Header from "./components/Header";
import ExchangeCard from "./components/ExchangeCard";
import HistoryTable from "./components/HistoryTable";
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
          <HistoryTable />
        </div>
      </main>
    </div>
  );
}

export default App;
