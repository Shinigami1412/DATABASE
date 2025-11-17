import React from "react";
import { Link } from "react-router-dom";
import { allBooks } from "../data/books";

function findBook(id) {
  return allBooks.find((b) => b.id === id) || { title: "Sách không xác định" };
}

export default function OrdersPage() {
  // try to read user's orders from localStorage
  let raw = null;
  try {
    raw = JSON.parse(localStorage.getItem("orders") || "null");
  } catch (e) {
    raw = null;
  }
  // Respect user's localStorage orders. If none exist, show an empty list.
  const orders = Array.isArray(raw) ? raw : [];

  if (!orders || orders.length === 0) {
    return (
      <div style={{ maxWidth: 980, margin: "24px auto", padding: "0 14px" }}>
        <h2>Đơn hàng của bạn</h2>
        <p>
          Bạn chưa có đơn hàng nào. <Link to="/">Tiếp tục mua sắm</Link>
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1180, margin: "18px auto", padding: "16px" }}>
      <h2>Đơn hàng của tôi</h2>
      <div style={{ overflowX: "auto", marginTop: 12 }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#fff",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  textAlign: "left",
                  padding: 12,
                  borderBottom: "1px solid #eee",
                }}
              >
                STT
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: 12,
                  borderBottom: "1px solid #eee",
                }}
              >
                Mã đơn hàng
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: 12,
                  borderBottom: "1px solid #eee",
                }}
              >
                Thông tin các loại sách
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: 12,
                  borderBottom: "1px solid #eee",
                }}
              >
                Tổng
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: 12,
                  borderBottom: "1px solid #eee",
                }}
              >
                Trạng thái
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o, idx) => (
              <tr key={o.id} style={{ borderBottom: "1px solid #f3f3f3" }}>
                <td style={{ padding: 12, verticalAlign: "top" }}>{idx + 1}</td>
                <td style={{ padding: 12, verticalAlign: "top" }}>
                  <div style={{ fontWeight: 700 }}>{o.id}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    {typeof o.createdAt === "number"
                      ? new Date(o.createdAt).toLocaleString()
                      : o.createdAt}
                  </div>
                </td>
                <td style={{ padding: 12 }}>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    {o.items.map((it, i) => {
                      const b = findBook(it.bookId);
                      return (
                        <div key={i}>
                          <Link
                            to={`/book/${it.bookId}`}
                            style={{
                              textDecoration: "none",
                              color: "#111",
                              fontWeight: 700,
                            }}
                          >
                            {b.title}
                          </Link>
                          <span style={{ marginLeft: 8, color: "#666" }}>
                            x{it.qty}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </td>
                <td
                  style={{
                    padding: 12,
                    verticalAlign: "top",
                    fontWeight: 700,
                    color: "#d81b2a",
                  }}
                >
                  {(() => {
                    const stored = o.total;
                    if (typeof stored === "number")
                      return stored.toLocaleString() + "₫";
                    try {
                      const calc = (o.items || []).reduce((s, it) => {
                        const b = findBook(it.bookId);
                        const price = typeof b.price === "number" ? b.price : 0;
                        return s + price * (it.qty || 1);
                      }, 0);
                      return calc > 0 ? calc.toLocaleString() + "₫" : "-";
                    } catch {
                      return "-";
                    }
                  })()}
                </td>
                <td style={{ padding: 12, verticalAlign: "top" }}>
                  <div
                    style={{
                      display: "inline-block",
                      padding: "6px 10px",
                      borderRadius: 6,
                      background:
                        o.status === "Đã giao"
                          ? "#e6ffed"
                          : o.status === "Đã hủy"
                          ? "#fff0f0"
                          : "#fff7e6",
                      color: "#333",
                      border: "1px solid #eee",
                    }}
                  >
                    {o.status}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
