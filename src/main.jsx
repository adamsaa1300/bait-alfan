import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { CartProvider } from "./hooks/useCart";
import Store from "./pages/Store";
import ProductPage from "./pages/ProductPage";
import SalePage from "./pages/SalePage";
import CampaignsPage from "./pages/CampaignsPage";
import Dashboard from "./pages/Dashboard/index";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Store />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/sale" element={<SalePage />} />
            <Route path="/campaigns" element={<CampaignsPage />} />
            <Route path="/dashboard/*" element={<Dashboard />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);