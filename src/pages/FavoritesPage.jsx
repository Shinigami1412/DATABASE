import React, { useState } from "react";
import { Link } from "react-router-dom";
import { allBooks } from "../data/books";
import { useFavorites } from "../context/FavoriteContext";
import { useCart } from "../context/CartContext";

export default function FavoritesPage() {
  const { favorites, removeFavorite, clearFavorites } = useFavorites();
  const { addItem } = useCart();
  const [msg, setMsg] = useState(null);

  const favBooks = allBooks.filter((b) => favorites.includes(b.id));

  const handleAddToCart = (b) => {
    addItem(b);
    setMsg(`Đã thêm “${b.title}” vào giỏ`);
    setTimeout(() => setMsg(null), 1600);
  };

  if (favBooks.length === 0) {
    return (
      <div style={{ maxWidth: 980, margin: "24px auto", padding: "0 14px" }}>
        <h2>Không có sản phẩm yêu thích</h2>
        <p>
          Bạn chưa thêm sản phẩm nào vào danh sách yêu thích.{" "}
          <Link to="/">Tiếp tục mua sắm</Link>
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1180, margin: "18px auto", padding: "16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Sản phẩm yêu thích ({favBooks.length})</h2>
        <div>
          <button
            onClick={() => clearFavorites()}
            style={{
              background: "#fff",
              border: "1px solid #ddd",
              padding: "8px 10px",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Xóa tất cả
          </button>
        </div>
      </div>

      {msg && (
        <div style={{ marginTop: 8, color: "#0a6", fontWeight: 700 }}>
          {msg}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
          gap: 12,
          marginTop: 12,
        }}
      >
        {favBooks.map((b) => (
          <div
            key={b.id}
            style={{
              border: "1px solid #eee",
              borderRadius: 8,
              padding: 12,
              background: "#fff",
            }}
          >
            <Link
              to={`/book/${b.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <img
                src={b.img}
                alt={b.title}
                style={{
                  width: "100%",
                  height: 220,
                  objectFit: "cover",
                  borderRadius: 6,
                }}
              />
              <div style={{ fontWeight: 700, marginTop: 8 }}>{b.title}</div>
              <div style={{ color: "#666", fontSize: 13 }}>{b.author}</div>
            </Link>
            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 10,
                alignItems: "center",
              }}
            >
              <button
                onClick={() => handleAddToCart(b)}
                style={{
                  background: "#d81b2a",
                  color: "#fff",
                  border: "none",
                  padding: "8px 10px",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                Thêm vào giỏ
              </button>
              <button
                onClick={() => removeFavorite(b.id)}
                style={{
                  background: "#fff",
                  border: "1px solid #ddd",
                  padding: "8px 10px",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
