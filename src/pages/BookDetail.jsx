import React from "react";
import { useParams, Link } from "react-router-dom";
import { allBooks } from "../data/books";
import { useCart } from "../context/CartContext";

export default function BookDetail() {
  const { id } = useParams();
  const bookId = Number(id);
  const book = allBooks.find((b) => b.id === bookId);
  const { addItem } = useCart();

  if (!book) {
    return (
      <div style={{ maxWidth: 980, margin: "24px auto", padding: "0 14px" }}>
        <h2>Không tìm thấy sách</h2>
        <p>Không có thông tin cho sách này.</p>
        <p>
          <Link to="/">Quay về trang chủ</Link>
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1180, margin: "18px auto", padding: "16px" }}>
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        {/* Left: images */}
        <div style={{ width: 360 }}>
          <div
            style={{
              border: "1px solid #eee",
              padding: 12,
              borderRadius: 8,
              background: "#fff",
            }}
          >
            <img
              src={book.img}
              alt={book.title}
              style={{ width: "100%", borderRadius: 6 }}
            />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <img
              src={book.img}
              alt="thumb"
              style={{
                width: 72,
                height: 100,
                objectFit: "cover",
                borderRadius: 6,
                border: "1px solid #f0f0f0",
              }}
            />
            <img
              src={book.img}
              alt="thumb"
              style={{
                width: 72,
                height: 100,
                objectFit: "cover",
                borderRadius: 6,
                border: "1px solid #f0f0f0",
              }}
            />
            <img
              src={book.img}
              alt="thumb"
              style={{
                width: 72,
                height: 100,
                objectFit: "cover",
                borderRadius: 6,
                border: "1px solid #f0f0f0",
              }}
            />
          </div>
        </div>

        {/* Right: details */}
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0 }}>{book.title}</h1>
          <div style={{ color: "#666", margin: "6px 0 12px 0" }}>
            {book.author}
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <div style={{ fontSize: 26, color: "#d81b2a", fontWeight: 800 }}>
              {book.price.toLocaleString()}₫
            </div>
            <div
              style={{
                padding: "6px 8px",
                background: "#f6f6f6",
                borderRadius: 6,
                fontSize: 13,
              }}
            >
              Còn hàng
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
            <button
              onClick={() => addItem(book)}
              style={{
                background: "#d81b2a",
                color: "#fff",
                border: "none",
                padding: "10px 16px",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Thêm vào giỏ
            </button>
            <button
              style={{
                background: "#fff",
                border: "1px solid #d81b2a",
                color: "#d81b2a",
                padding: "10px 16px",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Mua ngay
            </button>
          </div>

          <div style={{ marginTop: 8, marginBottom: 18 }}>
            <strong>Mô tả sản phẩm</strong>
            <p style={{ color: "#333" }}>{book.description}</p>
          </div>

          <div
            style={{
              marginTop: 12,
              borderTop: "1px solid #f0f0f0",
              paddingTop: 12,
            }}
          >
            <h4>Thông tin chi tiết</h4>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td style={{ padding: "6px 8px", width: 160, color: "#666" }}>
                    Nhà xuất bản
                  </td>
                  <td style={{ padding: "6px 8px" }}>{book.publisher}</td>
                </tr>
                <tr>
                  <td style={{ padding: "6px 8px", color: "#666" }}>
                    Số trang
                  </td>
                  <td style={{ padding: "6px 8px" }}>{book.pages}</td>
                </tr>
                <tr>
                  <td style={{ padding: "6px 8px", color: "#666" }}>
                    Ngôn ngữ
                  </td>
                  <td style={{ padding: "6px 8px" }}>{book.language}</td>
                </tr>
                <tr>
                  <td style={{ padding: "6px 8px", color: "#666" }}>ISBN</td>
                  <td style={{ padding: "6px 8px" }}>{book.isbn}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Related: simple placeholder */}
      <div style={{ marginTop: 28 }}>
        <h3>Sản phẩm liên quan</h3>
        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          {/* We show a few sample cards using the book's image/title */}
          {allBooks
            .filter((b) => b.id !== book.id)
            .slice(0, 4)
            .map((b) => (
              <div
                key={b.id}
                style={{
                  width: 160,
                  background: "#fff",
                  borderRadius: 8,
                  padding: 8,
                  border: "1px solid #f0f0f0",
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
                      height: 180,
                      objectFit: "cover",
                      borderRadius: 6,
                    }}
                  />
                  <div style={{ fontSize: 13, fontWeight: 700, marginTop: 8 }}>
                    {b.title}
                  </div>
                </Link>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
