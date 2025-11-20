// src/components/FahasaNavbar/FahasaNavbar.jsx
import React, { useState, useMemo } from "react";
import { useCart } from "../../context/CartContext";
import { useFavorites } from "../../context/FavoriteContext";
import { Link } from "react-router-dom";
import SearchBar from "./SearchBar";
import MobileDrawer from "./MobileDrawer";
import "./FahasaNavbar.css";
import { allBooks } from "../../data/books";
import logo from "../../assets/logo.png";

export default function FahasaNavbar() {
  const [openDrawer, setOpenDrawer] = useState(false);
  const { cart } = useCart();
  const { favorites } = useFavorites();

  const [openCats, setOpenCats] = useState(false);

  const categories = useMemo(() => {
    try {
      // Normalize categories to avoid duplicates due to casing/whitespace
      const map = (allBooks || []).reduce((acc, b) => {
        const raw = String(b.category || "").trim();
        if (!raw) return acc;
        const key = raw.toLowerCase();
        if (!acc.has(key)) acc.set(key, raw);
        return acc;
      }, new Map());
      // Return sorted display names
      return Array.from(map.values()).sort((a, b) => a.localeCompare(b, "vi"));
    } catch {
      return [];
    }
  }, []);

  // removed buy button; keep function removed

  // 🌍 Danh sách địa điểm nổi bật ở Việt Nam
  const locations = [
    "TP. Hồ Chí Minh",
    "Hà Nội",
    "Đà Nẵng",
    "Hải Phòng",
    "Cần Thơ",
    "Nha Trang",
    "Đà Lạt",
    "Huế",
    "Biên Hòa",
    "Vũng Tàu",
  ];

  const [selectedLocation, setSelectedLocation] = useState(locations[0]);
  const [openLoc, setOpenLoc] = useState(false);

  const handleSelect = (city) => {
    setSelectedLocation(city);
    setOpenLoc(false);
  };

  return (
    <header className="fahasa-header">
      {/* top promo */}
      <div className="faha-topbar">
        <div className="container">
          <span>
            Miễn phí giao hàng cho đơn hàng trên 300K • Hotline: 1900 636 548
          </span>
        </div>
      </div>

      {/* main nav */}
      <div className="faha-main container">
        <div className="left">
          <button
            className="mobile-hamburger"
            aria-label="Mở menu"
            onClick={() => setOpenDrawer(true)}
          >
            ☰
          </button>

          <div className="logo">
            <Link to="/" aria-label="Trang chủ">
              <img src={logo} alt="Fahasa - BookStore" />
            </Link>
          </div>

          {/* desktop categories nav removed — compact categories button used instead */}
        </div>

        <div className="center">
          <div className="cats-button-wrap">
            <button
              className="cats-button"
              aria-label="Danh mục sách"
              onClick={() => setOpenCats((s) => !s)}
            >
              <span className="bar" />
              <span className="bar" />
              <span className="bar" />
            </button>
            {openCats && (
              <ul className="cats-dropdown">
                {categories.map((c) => (
                  <li key={c} className="cats-row">
                    <span
                      className="cats-name"
                      onClick={() => {
                        setOpenCats(false);
                        window.location.href = `/?category=${encodeURIComponent(
                          c
                        )}`;
                      }}
                    >
                      {c}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <SearchBar />
        </div>

        <div className="right">
          {/* ⬇️ Location dropdown */}
          <div className="location" onClick={() => setOpenLoc(!openLoc)}>
            {selectedLocation} ▾
            {openLoc && (
              <ul className="loc-dropdown">
                {locations.map((loc) => (
                  <li key={loc} onClick={() => handleSelect(loc)}>
                    {loc}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Link
            to="/favorites"
            className="icon-btn"
            style={{ textDecoration: "none" }}
            aria-label="Yêu thích"
          >
            🔖 <span className="small">Yêu thích</span>
            <span style={{ marginLeft: 6, fontWeight: 700, color: "#d81b2a" }}>
              {favorites.length}
            </span>
          </Link>
          <Link
            to="/account"
            className="icon-btn"
            style={{ textDecoration: "none" }}
            aria-label="Tài khoản"
          >
            👤 <span className="small">Tài khoản</span>
          </Link>
          <Link
            to="/cart"
            className="cart-btn"
            aria-label="Giỏ hàng"
            style={{ textDecoration: "none" }}
          >
            🛒{" "}
            <span className="cart-count">
              {cart.reduce((s, it) => s + (it.qty || 1), 0)}
            </span>
          </Link>
        </div>
      </div>

      {openDrawer && <MobileDrawer onClose={() => setOpenDrawer(false)} />}
    </header>
  );
}
