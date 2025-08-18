import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Upload from './components/Upload/Upload';
import ReceiptData from './components/ReceiptItems/ReceiptDisplay';
import HomePage from './components/HomePage/HomePage';
import SplitSummary from './components/Split Summary/SplitSummary';
import AssignItems from './components/AssignItems/AssignItems';

function App() {
  const [receiptInfo, setReceiptInfo] = useState([]);

  const handleScanComplete = (data) => {
    setReceiptInfo(data);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/upload"
          element={<Upload onScanComplete={handleScanComplete} />}
        />
        <Route
          path="/receipt"
          element={<ReceiptData data={receiptInfo} />}
        />
          <Route path="/splitsummary" element={<SplitSummary />} />
          <Route path="/assignitems" element={<AssignItems />} />


      </Routes>
    </BrowserRouter>
  );
}

export default App;
