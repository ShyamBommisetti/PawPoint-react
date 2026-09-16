import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StoreProvider } from "@/lib/store";
import LoginPage from "@/pages/Login";
import StorePage from "@/pages/Store";
import CartPage from "@/pages/Cart";
import InventoryPage from "@/pages/Inventory";

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter basename="PawPoint-react">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/store" element={<StorePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}
