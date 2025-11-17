// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

import CartPage from "./pages/CartPage";
import BookDetail from "./pages/BookDetail";
import FavoritesPage from "./pages/FavoritesPage";
import AccountPage from "./pages/AccountPage";
import OrdersPage from "./pages/OrdersPage";
import AccountInfo from "./pages/ChangePassword";
import { Routes, Route } from "react-router-dom";
// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App
// src/App.jsx
import React from "react";
import FahasaNavbar from "./components/FahasaNavbar/FahasaNavbar";
import { CartProvider } from "./context/CartContext";
import { FavoriteProvider } from "./context/FavoriteContext";
import HomePage from "./pages/HomePage";
import "./components/BookSection/BookSection.css"; // ensure css loaded

function App() {
  return (
    <FavoriteProvider>
      <CartProvider>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <FahasaNavbar />
                <HomePage />
              </>
            }
          />
          <Route
            path="/cart"
            element={
              <>
                <FahasaNavbar />
                <CartPage />
              </>
            }
          />
          <Route
            path="/favorites"
            element={
              <>
                <FahasaNavbar />
                <FavoritesPage />
              </>
            }
          />
          <Route
            path="/account"
            element={
              <>
                <FahasaNavbar />
                <AccountPage />
              </>
            }
          />
          <Route
            path="/account/change-password"
            element={
              <>
                <FahasaNavbar />
                <AccountInfo />
              </>
            }
          />
          <Route
            path="/account/orders"
            element={
              <>
                <FahasaNavbar />
                <OrdersPage />
              </>
            }
          />
          <Route
            path="/book/:id"
            element={
              <>
                <FahasaNavbar />
                <BookDetail />
              </>
            }
          />
        </Routes>
      </CartProvider>
    </FavoriteProvider>
  );
}

export default App;
