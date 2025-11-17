import React from "react";
import { useCart } from "../../context/CartContext";
import { useFavorites } from "../../context/FavoriteContext";
import { Link, useNavigate } from "react-router-dom";
import "./BookSection.css";

export default function BookCard({ book }) {
  const { addItem } = useCart();
  const { isFavorited, toggleFavorite } = useFavorites();
  const navigate = useNavigate();

  const fav = isFavorited(book.id);

  const handleAdd = (e) => {
    e && e.stopPropagation();
    addItem(book);
  };

  const handleBuy = (e) => {
    e && e.stopPropagation();
    try {
      const rawProfile = JSON.parse(
        localStorage.getItem("user_profile") || "null"
      );
      const profile = rawProfile || null;
      if (!profile || !profile.firstName || !profile.lastName) {
        alert("Vui lòng cập nhật thông tin khách hàng trước khi đặt hàng.");
        navigate("/account");
        return;
      }

      const total = Number(book.price || 0);

      const rawOrders = JSON.parse(localStorage.getItem("orders") || "null");
      const arr = Array.isArray(rawOrders) ? rawOrders : [];

      const points = arr.reduce((sum, o) => {
        if (o && o.status === "Đã giao" && typeof o.total === "number") {
          return sum + Math.floor(o.total / 1000);
        }
        return sum;
      }, 0);

      const getTier = (p) => {
        const tiers = [
          { min: 5000, name: "VIP", percent: 10 },
          { min: 3000, name: "Kim cương", percent: 5 },
          { min: 2000, name: "Bạch kim", percent: 3 },
          { min: 1500, name: "Vàng", percent: 2 },
          { min: 1000, name: "Bạc", percent: 1 },
          { min: 500, name: "Đồng", percent: 0.5 },
          { min: 0, name: "Thành viên mới", percent: 0 },
        ];
        for (const t of tiers) if (p >= t.min) return t;
        return { min: 0, name: "Thành viên mới", percent: 0 };
      };

      const tier = getTier(points);
      const tierDiscount = Math.round((total * tier.percent) / 100);
      const finalDiscount = tierDiscount;
      const finalTotal = Math.max(0, total - finalDiscount);
      const finalTotalRounded = Math.ceil(finalTotal / 1000) * 1000;

      const now = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      const id = `ORD-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
        now.getDate()
      )}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(
        now.getSeconds()
      )}`;

      const order = {
        id,
        items: [{ bookId: book.id, qty: 1 }],
        status: "Đã giao",
        createdAt: Date.now(),
        customer: {
          name: profile.firstName + " " + profile.lastName,
          phone: profile.phone,
          email: profile.email,
          address: profile.address || "",
        },
        voucher: null,
        discount: finalDiscount,
        total: finalTotalRounded,
      };

      arr.unshift(order);
      localStorage.setItem("orders", JSON.stringify(arr));

      alert("Đặt hàng thành công — chuyển tới trang đơn hàng.");
      navigate("/account/orders");
    } catch (err) {
      console.error(err);
      alert("Có lỗi khi tạo đơn hàng. Vui lòng thử lại.");
    }
  };

  const handleToggleFav = (e) => {
    e && e.preventDefault();
    e && e.stopPropagation();
    toggleFavorite(book.id);
  };

  return (
    <div className="book-card" role="group" aria-label={book.title}>
      <button
        className={"fav-btn" + (fav ? " favorited" : "")}
        title={fav ? "Bỏ thích" : "Thêm vào yêu thích"}
        onClick={handleToggleFav}
        aria-pressed={fav}
      >
        {fav ? "♥" : "♡"}
      </button>

      <Link
        to={`/book/${book.id}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <div className="book-thumb">
          <img src={book.img} alt={book.title} />
        </div>
        <div className="book-info">
          <h4 className="book-title">{book.title}</h4>
          <p className="book-author">{book.author}</p>
        </div>
      </Link>

      <div className="book-bottom">
        <div className="book-price">
          {(Number(book.price) || 0).toLocaleString()}₫
        </div>
        <div className="btn-group">
          <button
            className="add-btn"
            onClick={handleAdd}
            aria-label={`Thêm ${book.title} vào giỏ`}
          >
            Thêm
          </button>
          <button
            className="buy-btn"
            onClick={handleBuy}
            aria-label={`Mua ${book.title}`}
          >
            Mua
          </button>
        </div>
      </div>
    </div>
  );
}
