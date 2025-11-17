import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate, Link } from "react-router-dom";
import "../components/BookSection/BookSection.css";

export default function CartPage() {
  const { cart, removeItem, clearCart, changeQty } = useCart();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedDiscountVoucher, setAppliedDiscountVoucher] = useState(null);
  const [appliedFreeshipVoucher, setAppliedFreeshipVoucher] = useState(null);
  const [showVoucherPicker, setShowVoucherPicker] = useState(false);
  const SHIPPING_FEE = 30000;

  // accept a voucher selected from Account page (via localStorage key)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("selected_voucher_for_cart");
      if (raw) {
        const parsed = JSON.parse(raw);
        const v = normalizeVoucher(parsed);
        if (v && v.type === "freeship") setAppliedFreeshipVoucher(v);
        else setAppliedDiscountVoucher(v);
        localStorage.removeItem("selected_voucher_for_cart");
      }
    } catch {
      // ignore
    }
  }, []);

  const loadUserVouchers = () => {
    try {
      const raw = JSON.parse(localStorage.getItem("user_vouchers") || "null");
      const arr = Array.isArray(raw) && raw.length ? raw : [];
      return arr.map((v) => normalizeVoucher(v));
    } catch {
      return [];
    }
  };

  const normalizeVoucher = (v) => {
    if (!v || typeof v !== "object") return v;
    const out = { ...v };
    if (out.type === "percent") {
      // ensure numeric percent value; try v.value else parse digits from code (SALE10 -> 10)
      const num = Number(out.value);
      if (!num || Number.isNaN(num)) {
        const m = String(out.code || "").match(/(\d+)/);
        out.value = m ? Number(m[1]) : 0;
      } else {
        out.value = num;
      }
    } else if (out.type === "fixed") {
      // ensure numeric fixed value; parse digits from value or code (VND50000 -> 50000)
      const num = Number(out.value);
      if (!num || Number.isNaN(num)) {
        const m = String(out.code || "").match(/(\d+)/);
        out.value = m ? Number(m[1]) : 0;
      } else {
        out.value = num;
      }
    } else {
      // freeship or others: ensure value is numeric or zero
      const num = Number(out.value);
      out.value = !num || Number.isNaN(num) ? 0 : num;
    }
    return out;
  };

  const computeDiscount = (subtotal, voucher) => {
    if (!voucher) return 0;
    const val = Number(voucher.value) || 0;
    if (voucher.type === "percent") {
      return Math.round((subtotal * val) / 100);
    }
    if (voucher.type === "fixed") {
      return Math.min(subtotal, val);
    }
    return 0;
  };

  const getAccumulatedPoints = () => {
    try {
      const raw = JSON.parse(localStorage.getItem("orders") || "null");
      const arr = Array.isArray(raw) ? raw : [];
      return arr.reduce((sum, o) => {
        if (o && o.status === "Đã giao" && typeof o.total === "number") {
          return sum + Math.floor(o.total / 1000);
        }
        return sum;
      }, 0);
    } catch {
      return 0;
    }
  };

  const getTier = (points) => {
    const tiers = [
      { min: 5000, name: "VIP", percent: 10 },
      { min: 3000, name: "Kim cương", percent: 5 },
      { min: 2000, name: "Bạch kim", percent: 3 },
      { min: 1500, name: "Vàng", percent: 2 },
      { min: 1000, name: "Bạc", percent: 1 },
      { min: 500, name: "Đồng", percent: 0.5 },
      { min: 0, name: "Thành viên mới", percent: 0 },
    ];
    for (const t of tiers) {
      if (points >= t.min) return t;
    }
    return { min: 0, name: "Thành viên mới", percent: 0 };
  };

  const applyVoucher = () => {
    const code = (voucherCode || "").trim().toUpperCase();
    if (!code) {
      alert("Vui lòng nhập mã voucher");
      return;
    }
    const found = loadUserVouchers().find((v) => v.code === code);
    if (!found) {
      alert("Mã voucher không hợp lệ");
      return;
    }
    // assign voucher by type: at most one discount-type and one freeship-type
    if (found.type === "freeship") {
      setAppliedFreeshipVoucher(found);
      try {
        localStorage.setItem(
          "selected_voucher_for_cart",
          JSON.stringify(found)
        );
      } catch {
        /* ignore */
      }
    } else {
      setAppliedDiscountVoucher(found);
      try {
        localStorage.setItem(
          "selected_voucher_for_cart",
          JSON.stringify(found)
        );
      } catch {
        /* ignore */
      }
    }
    setVoucherCode("");
  };
  const loadProfile = () => {
    try {
      const raw = JSON.parse(localStorage.getItem("user_profile") || "null");
      return raw || null;
    } catch {
      return null;
    }
  };

  const total = cart.reduce((s, it) => s + (it.price || 0) * (it.qty || 1), 0);

  return (
    <div style={{ maxWidth: 980, margin: "24px auto", padding: "0 14px" }}>
      <h2>Giỏ hàng của bạn</h2>
      {cart.length === 0 ? (
        <div>Chưa có sản phẩm. Hãy thêm một vài cuốn sách.</div>
      ) : (
        <>
          <table
            style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}
          >
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
                <th style={{ padding: "8px 6px" }}>Sản phẩm</th>
                <th style={{ padding: "8px 6px" }}>Số lượng</th>
                <th style={{ padding: "8px 6px" }}>Giá</th>
                <th style={{ padding: "8px 6px" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((it) => (
                <tr key={it.id} style={{ borderBottom: "1px solid #fafafa" }}>
                  <td style={{ padding: "10px 6px" }}>
                    <div
                      style={{ display: "flex", gap: 12, alignItems: "center" }}
                    >
                      <img
                        src={it.img}
                        alt={it.title}
                        style={{
                          width: 56,
                          height: 76,
                          objectFit: "cover",
                          borderRadius: 4,
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: 700 }}>{it.title}</div>
                        <div style={{ color: "#666", fontSize: 13 }}>
                          {it.author}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "10px 6px", verticalAlign: "middle" }}>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <button
                        onClick={() => changeQty(it.id, -1)}
                        aria-label={`Giảm ${it.title}`}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 6,
                          border: "1px solid #eee",
                          background: "white",
                          cursor: "pointer",
                        }}
                      >
                        −
                      </button>
                      <div style={{ minWidth: 28, textAlign: "center" }}>
                        {it.qty || 1}
                      </div>
                      <button
                        onClick={() => changeQty(it.id, 1)}
                        aria-label={`Tăng ${it.title}`}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 6,
                          border: "1px solid #eee",
                          background: "white",
                          cursor: "pointer",
                        }}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "10px 6px",
                      verticalAlign: "middle",
                      color: "#d81b2a",
                      fontWeight: 700,
                    }}
                  >
                    {((it.price || 0) * (it.qty || 1)).toLocaleString()}₫
                  </td>
                  <td style={{ padding: "10px 6px", verticalAlign: "middle" }}>
                    <button
                      onClick={() => removeItem(it.id)}
                      style={{
                        background: "#eee",
                        border: "none",
                        padding: "6px 10px",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 18,
            }}
          >
            <div>
              <button
                onClick={clearCart}
                style={{
                  background: "#f5f5f5",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                Xóa hết
              </button>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                Tổng: {total.toLocaleString()}₫
              </div>
              <div
                style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}
              >
                <button
                  onClick={() => {
                    if (!cart || cart.length === 0) return;
                    setConfirmOpen(true);
                  }}
                  style={{
                    background: "#d81b2a",
                    color: "#fff",
                    border: "none",
                    padding: "10px 14px",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  Đặt hàng
                </button>
              </div>
            </div>
          </div>
          {confirmOpen && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
              }}
            >
              <div
                style={{
                  width: 760,
                  maxWidth: "92%",
                  background: "#fff",
                  borderRadius: 8,
                  padding: 18,
                }}
              >
                <h3>Xác nhận đơn hàng</h3>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <h4>Thông tin sản phẩm</h4>
                    <div style={{ maxHeight: 260, overflow: "auto" }}>
                      {cart.map((it) => (
                        <div
                          key={it.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "8px 0",
                            borderBottom: "1px solid #f3f3f3",
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 700 }}>{it.title}</div>
                            <div style={{ color: "#666", fontSize: 13 }}>
                              {it.author}
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div>x{it.qty || 1}</div>
                            <div style={{ color: "#d81b2a", fontWeight: 700 }}>
                              {(
                                (it.price || 0) * (it.qty || 1)
                              ).toLocaleString()}
                              ₫
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <div style={{ marginBottom: 8 }}>
                        <label style={{ fontSize: 13, color: "#666" }}>
                          Mã voucher (nếu có)
                        </label>
                        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                          <input
                            value={voucherCode}
                            onChange={(e) => setVoucherCode(e.target.value)}
                            placeholder="Nhập mã voucher"
                            style={{
                              flex: 1,
                              padding: "8px",
                              borderRadius: 6,
                              border: "1px solid #ddd",
                            }}
                          />
                          <button
                            onClick={applyVoucher}
                            style={{
                              background: "#fff",
                              border: "1px solid #d81b2a",
                              color: "#d81b2a",
                              padding: "8px 12px",
                              borderRadius: 6,
                              cursor: "pointer",
                            }}
                          >
                            Áp dụng
                          </button>
                          <button
                            onClick={() => setShowVoucherPicker(true)}
                            style={{
                              background: "#d81b2a",
                              border: "none",
                              color: "#fff",
                              padding: "8px 12px",
                              borderRadius: 6,
                              cursor: "pointer",
                              marginLeft: 8,
                            }}
                          >
                            Chọn voucher
                          </button>
                        </div>
                        {(appliedDiscountVoucher || appliedFreeshipVoucher) && (
                          <div
                            style={{
                              marginTop: 8,
                              color: "#0a6",
                              display: "grid",
                              gap: 6,
                            }}
                          >
                            {appliedDiscountVoucher && (
                              <div>
                                Đã áp dụng: {appliedDiscountVoucher.description}
                                <button
                                  onClick={() => {
                                    setAppliedDiscountVoucher(null);
                                    try {
                                      localStorage.removeItem(
                                        "selected_voucher_for_cart"
                                      );
                                    } catch {
                                      /* ignore */
                                    }
                                  }}
                                  style={{
                                    marginLeft: 8,
                                    border: "none",
                                    background: "transparent",
                                    color: "#d81b2a",
                                    cursor: "pointer",
                                  }}
                                >
                                  Bỏ
                                </button>
                              </div>
                            )}
                            {appliedFreeshipVoucher && (
                              <div>
                                Đã áp dụng (Freeship):{" "}
                                {appliedFreeshipVoucher.description}
                                <button
                                  onClick={() => {
                                    setAppliedFreeshipVoucher(null);
                                    try {
                                      localStorage.removeItem(
                                        "selected_voucher_for_cart"
                                      );
                                    } catch {
                                      /* ignore */
                                    }
                                  }}
                                  style={{
                                    marginLeft: 8,
                                    border: "none",
                                    background: "transparent",
                                    color: "#d81b2a",
                                    cursor: "pointer",
                                  }}
                                >
                                  Bỏ
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div
                        style={{
                          textAlign: "right",
                          marginTop: 8,
                          fontWeight: 700,
                        }}
                      >
                        Tạm tính: {total.toLocaleString()}₫
                      </div>
                      {(() => {
                        const points = getAccumulatedPoints();
                        const tier = getTier(points);
                        const tierDiscount = Math.round(
                          (total * tier.percent) / 100
                        );
                        const subtotalAfterTier = Math.max(
                          0,
                          total - tierDiscount
                        );
                        const voucherDiscount = computeDiscount(
                          subtotalAfterTier,
                          appliedDiscountVoucher
                        );
                        const shipping = appliedFreeshipVoucher
                          ? 0
                          : SHIPPING_FEE;
                        const afterDiscount = Math.max(
                          0,
                          subtotalAfterTier - voucherDiscount
                        );
                        const finalRaw = afterDiscount + shipping;
                        const final = Math.ceil(finalRaw / 1000) * 1000;
                        return (
                          <>
                            <div
                              style={{
                                textAlign: "right",
                                marginTop: 6,
                                color: "#666",
                              }}
                            >
                              Giảm theo hạng ({tier.name} - {tier.percent}%): -
                              {tierDiscount.toLocaleString()}₫
                            </div>
                            <div
                              style={{
                                textAlign: "right",
                                marginTop: 6,
                                color: "#666",
                              }}
                            >
                              Giảm voucher: -{voucherDiscount.toLocaleString()}₫
                            </div>
                            <div
                              style={{
                                textAlign: "right",
                                marginTop: 6,
                                color: "#666",
                              }}
                            >
                              Phí ship:{" "}
                              {shipping === 0
                                ? "Miễn phí"
                                : `+${shipping.toLocaleString()}₫`}
                            </div>
                            <div
                              style={{
                                textAlign: "right",
                                marginTop: 8,
                                fontWeight: 900,
                              }}
                            >
                              Thành tiền: {final.toLocaleString()}₫
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <div style={{ width: 320 }}>
                    <h4>Thông tin khách hàng</h4>
                    {(() => {
                      const profile = loadProfile();
                      if (!profile) {
                        return (
                          <div>
                            <div>Chưa có thông tin khách hàng.</div>
                            <div style={{ marginTop: 8 }}>
                              <Link
                                to="/account"
                                onClick={() => setConfirmOpen(false)}
                                style={{ color: "#d81b2a" }}
                              >
                                Cập nhật thông tin
                              </Link>
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div style={{ display: "grid", gap: 6 }}>
                          <div>
                            <strong>
                              {profile.firstName} {profile.lastName}
                            </strong>
                          </div>
                          <div style={{ color: "#666" }}>{profile.phone}</div>
                          <div style={{ color: "#666" }}>{profile.email}</div>
                          {profile.address && (
                            <div style={{ color: "#666" }}>
                              {profile.address}
                            </div>
                          )}
                          <div style={{ marginTop: 8 }}>
                            <Link
                              to="/account"
                              onClick={() => setConfirmOpen(false)}
                              style={{ color: "#d81b2a" }}
                            >
                              Sửa thông tin
                            </Link>
                          </div>
                        </div>
                      );
                    })()}
                    {showVoucherPicker && (
                      <div
                        style={{
                          marginTop: 12,
                          padding: 12,
                          border: "1px dashed #eee",
                          borderRadius: 8,
                          background: "#fafafa",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div style={{ fontWeight: 800 }}>Chọn voucher</div>
                          <button
                            onClick={() => setShowVoucherPicker(false)}
                            style={{
                              border: "none",
                              background: "transparent",
                              cursor: "pointer",
                            }}
                          >
                            ✕
                          </button>
                        </div>
                        <div
                          style={{ marginTop: 10, display: "grid", gap: 10 }}
                        >
                          {(() => {
                            const userV = loadUserVouchers();
                            const discountList = userV.filter(
                              (x) => x.type !== "freeship"
                            );
                            const freeshipList = userV.filter(
                              (x) => x.type === "freeship"
                            );
                            return (
                              <>
                                <div>
                                  <div style={{ fontWeight: 800 }}>
                                    Voucher giảm giá
                                  </div>
                                  {discountList.length > 0 ? (
                                    discountList.map((v) => (
                                      <div
                                        key={v.code}
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          alignItems: "center",
                                          padding: 8,
                                          border: "1px solid #eee",
                                          borderRadius: 8,
                                        }}
                                      >
                                        <div>
                                          <div style={{ fontWeight: 700 }}>
                                            {v.code}
                                          </div>
                                          <div
                                            style={{
                                              fontSize: 13,
                                              color: "#666",
                                            }}
                                          >
                                            {v.description}
                                          </div>
                                        </div>
                                        <div
                                          style={{ display: "flex", gap: 8 }}
                                        >
                                          <button
                                            onClick={() => {
                                              try {
                                                if (
                                                  navigator &&
                                                  navigator.clipboard
                                                )
                                                  navigator.clipboard.writeText(
                                                    v.code
                                                  );
                                              } catch {
                                                /* ignore */
                                              }
                                            }}
                                            style={{
                                              padding: "6px 8px",
                                              borderRadius: 6,
                                            }}
                                          >
                                            Sao chép
                                          </button>
                                          <button
                                            onClick={() => {
                                              setAppliedDiscountVoucher(v);
                                              try {
                                                localStorage.setItem(
                                                  "selected_voucher_for_cart",
                                                  JSON.stringify(v)
                                                );
                                              } catch {
                                                /* ignore */
                                              }
                                              setShowVoucherPicker(false);
                                            }}
                                            style={{
                                              padding: "6px 8px",
                                              background: "#d81b2a",
                                              color: "#fff",
                                              borderRadius: 6,
                                            }}
                                          >
                                            Chọn
                                          </button>
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <div style={{ color: "#666" }}>
                                      Bạn hiện chưa có voucher giảm giá.
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div
                                    style={{ fontWeight: 800, marginTop: 12 }}
                                  >
                                    Voucher Freeship
                                  </div>
                                  {freeshipList.length > 0 ? (
                                    freeshipList.map((v) => (
                                      <div
                                        key={v.code}
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          alignItems: "center",
                                          padding: 8,
                                          border: "1px solid #eee",
                                          borderRadius: 8,
                                        }}
                                      >
                                        <div>
                                          <div
                                            style={{
                                              fontSize: 13,
                                              color: "#666",
                                            }}
                                          >
                                            {v.description}
                                          </div>
                                        </div>
                                        <div
                                          style={{ display: "flex", gap: 8 }}
                                        >
                                          <button
                                            onClick={() => {
                                              try {
                                                if (
                                                  navigator &&
                                                  navigator.clipboard
                                                )
                                                  navigator.clipboard.writeText(
                                                    v.code
                                                  );
                                              } catch {
                                                /* ignore */
                                              }
                                            }}
                                            style={{
                                              padding: "6px 8px",
                                              borderRadius: 6,
                                            }}
                                          >
                                            Sao chép
                                          </button>
                                          <button
                                            onClick={() => {
                                              setAppliedFreeshipVoucher(v);
                                              try {
                                                localStorage.setItem(
                                                  "selected_voucher_for_cart",
                                                  JSON.stringify(v)
                                                );
                                              } catch {
                                                /* ignore */
                                              }
                                              setShowVoucherPicker(false);
                                            }}
                                            style={{
                                              padding: "6px 8px",
                                              background: "#d81b2a",
                                              color: "#fff",
                                              borderRadius: 6,
                                            }}
                                          >
                                            Chọn
                                          </button>
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <div style={{ color: "#666" }}>
                                      Bạn hiện chưa có voucher freeship.
                                    </div>
                                  )}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 8,
                    marginTop: 16,
                  }}
                >
                  <button
                    onClick={() => setConfirmOpen(false)}
                    style={{
                      background: "#f5f5f5",
                      border: "none",
                      padding: "8px 12px",
                      borderRadius: 8,
                      cursor: "pointer",
                    }}
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={() => {
                      if (placing) return;
                      setPlacing(true);
                      // validate profile exists
                      const profile = loadProfile();
                      if (!profile || !profile.firstName || !profile.lastName) {
                        alert(
                          "Vui lòng cập nhật thông tin khách hàng trước khi đặt hàng."
                        );
                        setPlacing(false);
                        return;
                      }
                      // create order
                      const now = new Date();
                      const pad = (n) => String(n).padStart(2, "0");
                      const id = `ORD-${now.getFullYear()}${pad(
                        now.getMonth() + 1
                      )}${pad(now.getDate())}-${pad(now.getHours())}${pad(
                        now.getMinutes()
                      )}${pad(now.getSeconds())}`;
                      const points = getAccumulatedPoints();
                      const tier = getTier(points);
                      const tierDiscount = Math.round(
                        (total * tier.percent) / 100
                      );
                      const subtotalAfterTier = Math.max(
                        0,
                        total - tierDiscount
                      );
                      const voucherDiscount = computeDiscount(
                        subtotalAfterTier,
                        appliedDiscountVoucher
                      );
                      const finalDiscount = tierDiscount + voucherDiscount;
                      const subtotalAfterTierOrder = Math.max(
                        0,
                        total - tierDiscount
                      );
                      const afterDiscountOrder = Math.max(
                        0,
                        subtotalAfterTierOrder - voucherDiscount
                      );
                      const shippingForOrder = appliedFreeshipVoucher
                        ? 0
                        : SHIPPING_FEE;
                      const finalTotalOrder =
                        afterDiscountOrder + shippingForOrder;
                      const finalTotalRounded =
                        Math.ceil(finalTotalOrder / 1000) * 1000;
                      const order = {
                        id,
                        items: cart.map((it) => ({
                          bookId: it.id,
                          qty: it.qty || 1,
                        })),
                        // Orders are created as delivered per requirement
                        status: "Đã giao",
                        // store timestamp (ms) so other tools can sort reliably
                        createdAt: Date.now(),
                        customer: {
                          name: profile.firstName + " " + profile.lastName,
                          phone: profile.phone,
                          email: profile.email,
                          address: profile.address || "",
                        },
                        voucher: {
                          discount: appliedDiscountVoucher
                            ? {
                                code: appliedDiscountVoucher.code,
                                type: appliedDiscountVoucher.type,
                                value: appliedDiscountVoucher.value,
                              }
                            : null,
                          freeship: appliedFreeshipVoucher
                            ? {
                                code: appliedFreeshipVoucher.code,
                                type: appliedFreeshipVoucher.type,
                                value: appliedFreeshipVoucher.value,
                              }
                            : null,
                        },
                        shipping: shippingForOrder,
                        discount: finalDiscount,
                        total: finalTotalRounded,
                      };
                      try {
                        const raw = JSON.parse(
                          localStorage.getItem("orders") || "null"
                        );
                        const arr = Array.isArray(raw) ? raw : [];
                        arr.unshift(order);
                        localStorage.setItem("orders", JSON.stringify(arr));
                      } catch {
                        localStorage.setItem("orders", JSON.stringify([order]));
                      }
                      clearCart();
                      setPlacing(false);
                      setConfirmOpen(false);
                      navigate("/account/orders");
                    }}
                    style={{
                      background: "#d81b2a",
                      color: "#fff",
                      border: "none",
                      padding: "8px 12px",
                      borderRadius: 8,
                      cursor: "pointer",
                    }}
                  >
                    {placing ? "Đang gửi..." : "Xác nhận đặt hàng"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
