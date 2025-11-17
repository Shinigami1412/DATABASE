import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const demoUserVouchers = [
  {
    code: "FREESHIP1",
    type: "freeship",
    description: "Miễn phí vận chuyển 1 lần",
    expires: "2025-12-31",
  },
  {
    code: "SALE10",
    type: "percent",
    description: "Giảm 10% cho đơn hàng",
    expires: "2025-12-31",
  },
];

const defaultProfile = {
  firstName: "Đào",
  lastName: "Hải",
  phone: "0362941005",
  email: "haidao201005@gmail.com",
  gender: "male",
  birthday: "2005-10-20",
  address: "Hà Nội, Việt Nam",
};

export default function AccountPage() {
  const navigate = useNavigate();

  // auto-open vouchers if URL contains ?open=vouchers
  useEffect(() => {
    const params = new URLSearchParams(window.location.search || "");
    if (params.get("open") === "vouchers") {
      setShowVouchers(true);
      // remove query param to keep URL clean
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete("open");
        window.history.replaceState({}, "", url.toString());
      } catch {
        // ignore
      }
    }
    // ensure localStorage has user_vouchers so other pages (Cart) can read them
    try {
      const raw = localStorage.getItem("user_vouchers");
      if (!raw) {
        localStorage.setItem("user_vouchers", JSON.stringify(demoUserVouchers));
      }
    } catch {
      /* ignore */
    }
  }, []);
  const normalizeProfile = (p) => {
    if (!p) return p;
    if (p.birthday && typeof p.birthday === "object") {
      const { day = "01", month = "01", year = "1970" } = p.birthday || {};
      const mm = String(month).padStart(2, "0");
      const dd = String(day).padStart(2, "0");
      return { ...p, birthday: `${year}-${mm}-${dd}` };
    }
    return p;
  };

  const [profile, setProfile] = useState(() => {
    try {
      const raw = localStorage.getItem("user_profile");
      if (!raw) return defaultProfile;
      const parsed = JSON.parse(raw);
      return normalizeProfile(parsed) || defaultProfile;
    } catch {
      return defaultProfile;
    }
  });

  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});
  const [showVouchers, setShowVouchers] = useState(false);
  const [userVouchers, setUserVouchers] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("user_vouchers") || "null");
      return Array.isArray(raw) && raw.length ? raw : demoUserVouchers;
    } catch {
      return demoUserVouchers;
    }
  });
  const [copied, setCopied] = useState(null);

  const handleChoose = (v) => {
    try {
      localStorage.setItem("selected_voucher_for_cart", JSON.stringify(v));
    } catch {
      // ignore
    }
    setShowVouchers(false);
    try {
      navigate("/cart");
    } catch {
      // ignore
    }
  };

  const handleCopyCode = async (code) => {
    if (!navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(null), 1400);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const handler = (e) => {
      try {
        if (e.key === "user_profile") {
          const p = JSON.parse(e.newValue);
          setProfile(normalizeProfile(p) || defaultProfile);
        }
        if (e.key === "user_vouchers") {
          const v = JSON.parse(e.newValue || "null");
          setUserVouchers(Array.isArray(v) && v.length ? v : demoUserVouchers);
        }
        if (e.key === "selected_voucher_for_cart") {
          // if selection was made elsewhere, close the vouchers modal here
          setShowVouchers(false);
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const handleChange = (field) => (e) =>
    setProfile((p) => ({ ...p, [field]: e.target.value }));

  const save = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!profile.firstName || String(profile.firstName).trim() === "")
      newErrors.firstName = "Họ là bắt buộc";
    if (!profile.lastName || String(profile.lastName).trim() === "")
      newErrors.lastName = "Tên là bắt buộc";
    if (profile.email && !/^\S+@\S+\.\S+$/.test(profile.email))
      newErrors.email = "Email không hợp lệ";
    if (profile.phone && !/^[0-9+\-()\s]{6,}$/.test(profile.phone))
      newErrors.phone = "SĐT không hợp lệ";
    if (profile.address && String(profile.address).trim().length < 6)
      newErrors.address = "Địa chỉ quá ngắn";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    try {
      localStorage.setItem("user_profile", JSON.stringify(profile));
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch {
      alert("Không thể lưu thay đổi (localStorage bị lỗi)");
    }
  };

  let ordersCount = 0;
  // Load orders and remove any orders that are still "Đang xử lý" to match logic
  const loadAndCleanOrders = () => {
    try {
      const raw = JSON.parse(localStorage.getItem("orders") || "null");
      let arr = Array.isArray(raw) ? raw : [];
      const before = arr.length;
      // Keep orders that are NOT 'Đang xử lý'
      arr = arr.filter((o) => String(o.status || "").trim() !== "Đang xử lý");
      if (arr.length !== before) {
        try {
          localStorage.setItem("orders", JSON.stringify(arr));
        } catch {
          /* ignore */
        }
      }
      return arr;
    } catch {
      return [];
    }
  };

  const orders = loadAndCleanOrders();
  ordersCount = Array.isArray(orders) ? orders.length : 0;

  // Compute accumulated points from delivered orders only
  const points = (Array.isArray(orders) ? orders : []).reduce((sum, o) => {
    if (o && o.status === "Đã giao" && typeof o.total === "number") {
      return sum + Math.floor(o.total / 1000);
    }
    return sum;
  }, 0);

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
    for (const t of tiers) if (points >= t.min) return t;
    return { min: 0, name: "Thành viên mới", percent: 0 };
  };

  const tier = getTier(points);

  // Show clear-orders button only in development (localhost)
  const isDev = (() => {
    try {
      const h = window && window.location && window.location.hostname;
      return h === "localhost" || h === "127.0.0.1";
    } catch {
      return false;
    }
  })();

  const handleClearOrders = () => {
    try {
      if (
        !window.confirm(
          "Xác nhận xóa toàn bộ lịch sử đơn hàng khỏi trình duyệt?"
        )
      ) {
        return;
      }
    } catch {
      // if confirm isn't available for some reason, abort
      return;
    }
    try {
      localStorage.removeItem("orders");
    } catch {
      // ignore storage errors
    }
    try {
      // reload to reflect changes immediately
      window.location.reload();
    } catch {
      // ignore
    }
  };

  return (
    <div style={{ maxWidth: 1180, margin: "18px auto", padding: "12px" }}>
      <div style={{ display: "flex", gap: 18 }}>
        <aside style={{ width: 320 }}>
          <div
            style={{
              background: "#fff",
              padding: 16,
              borderRadius: 8,
              border: "1px solid #eee",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 999,
                  background: "#f5f5f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                }}
              >
                {profile && profile.firstName
                  ? String(profile.firstName)[0].toUpperCase()
                  : "Đ"}
              </div>
              <div>
                <div style={{ fontWeight: 800 }}>
                  {profile.firstName} {profile.lastName}
                </div>
                <div style={{ fontSize: 13, color: "#666" }}>
                  Thành viên: {tier.name}
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              <Link
                to="/account"
                style={{
                  color: "#d81b2a",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Hồ sơ cá nhân
              </Link>
              <Link
                to="/account/change-password"
                style={{ color: "#333", textDecoration: "none" }}
              >
                Thông tin tài khoản
              </Link>
              <Link
                to="/account/orders"
                style={{ color: "#333", textDecoration: "none" }}
              >
                Đơn hàng của tôi
              </Link>
              <Link
                to="/favorites"
                style={{ color: "#333", textDecoration: "none" }}
              >
                Sản phẩm yêu thích
              </Link>
            </div>
          </div>

          {isDev && (
            <div style={{ marginBottom: 12 }}>
              <button
                onClick={handleClearOrders}
                style={{
                  background: "#fff",
                  border: "1px solid #d81b2a",
                  color: "#d81b2a",
                  padding: "8px 12px",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                Xoá lịch sử đơn hàng (dev)
              </button>
            </div>
          )}
        </aside>

        <main style={{ flex: 1 }}>
          <div
            style={{
              background: "#fff",
              padding: 16,
              borderRadius: 8,
              border: "1px solid #eee",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 8,
                    background: "#fafafa",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                  }}
                >
                  🏆
                </div>
                <div>
                  <div
                    style={{ display: "flex", alignItems: "baseline", gap: 10 }}
                  >
                    <div style={{ fontSize: 28, fontWeight: 800 }}>
                      Ưu đãi của bạn
                    </div>
                    <div
                      style={{
                        fontSize: 16,
                        color: "#d81b2a",
                        fontWeight: 800,
                      }}
                    >
                      {tier.percent}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                background: "#fff",
                padding: 14,
                borderRadius: 8,
                border: "1px solid #eee",
              }}
            >
              <div style={{ fontSize: 13, color: "#666" }}>F-Point hiện có</div>
              <div style={{ fontWeight: 800, marginTop: 6 }}>
                {points.toLocaleString()}
              </div>
            </div>
            <div
              role="button"
              onClick={() => setShowVouchers(true)}
              style={{
                background: "#fff",
                padding: 14,
                borderRadius: 8,
                border: "1px solid #eee",
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: 13, color: "#666" }}>Voucher</div>
              <div style={{ fontWeight: 800, marginTop: 6 }}>
                {Array.isArray(userVouchers) ? userVouchers.length : 0} mã
              </div>
            </div>
            <Link
              to="/account/orders"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div
                role="button"
                style={{
                  background: "#fff",
                  padding: 14,
                  borderRadius: 8,
                  border: "1px solid #eee",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 13, color: "#666" }}>Số đơn hàng</div>
                <div style={{ fontWeight: 800, marginTop: 6 }}>
                  {ordersCount} đơn hàng
                </div>
              </div>
            </Link>
          </div>

          <form
            onSubmit={save}
            style={{
              background: "#fff",
              padding: 18,
              borderRadius: 8,
              border: "1px solid #eee",
            }}
          >
            <h3>Hồ sơ cá nhân</h3>
            {saved && (
              <div style={{ color: "#0a6", fontWeight: 700, marginTop: 6 }}>
                Đã lưu
              </div>
            )}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginTop: 12,
              }}
            >
              <div>
                <label style={{ fontSize: 13, color: "#666" }}>Họ*</label>
                <input
                  value={profile.firstName}
                  onChange={handleChange("firstName")}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    marginTop: 6,
                    borderRadius: 6,
                    border: "1px solid #ddd",
                  }}
                />
                {errors.firstName && (
                  <div style={{ color: "#d00", marginTop: 6 }}>
                    {errors.firstName}
                  </div>
                )}
              </div>
              <div>
                <label style={{ fontSize: 13, color: "#666" }}>Tên*</label>
                <input
                  value={profile.lastName}
                  onChange={handleChange("lastName")}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    marginTop: 6,
                    borderRadius: 6,
                    border: "1px solid #ddd",
                  }}
                />
                {errors.lastName && (
                  <div style={{ color: "#d00", marginTop: 6 }}>
                    {errors.lastName}
                  </div>
                )}
              </div>
              <div>
                <label style={{ fontSize: 13, color: "#666" }}>
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={handleChange("phone")}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    marginTop: 6,
                    borderRadius: 6,
                    border: "1px solid #ddd",
                  }}
                />
                {errors.phone && (
                  <div style={{ color: "#d00", marginTop: 6 }}>
                    {errors.phone}
                  </div>
                )}
              </div>
              <div>
                <label style={{ fontSize: 13, color: "#666" }}>Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={handleChange("email")}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    marginTop: 6,
                    borderRadius: 6,
                    border: "1px solid #ddd",
                  }}
                />
                {errors.email && (
                  <div style={{ color: "#d00", marginTop: 6 }}>
                    {errors.email}
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <label style={{ fontSize: 13, color: "#666" }}>Địa chỉ</label>
              <input
                value={profile.address || ""}
                onChange={handleChange("address")}
                placeholder="Số nhà, đường, quận, thành phố"
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  marginTop: 6,
                  borderRadius: 6,
                  border: "1px solid #ddd",
                }}
              />
              {errors.address && (
                <div style={{ color: "#d00", marginTop: 6 }}>
                  {errors.address}
                </div>
              )}
            </div>

            <div
              style={{
                marginTop: 12,
                display: "flex",
                gap: 12,
                alignItems: "center",
              }}
            >
              <div style={{ color: "#666" }}>Giới tính</div>
              <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input
                  type="radio"
                  checked={profile.gender === "male"}
                  onChange={() => setProfile((p) => ({ ...p, gender: "male" }))}
                />{" "}
                Nam
              </label>
              <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input
                  type="radio"
                  checked={profile.gender === "female"}
                  onChange={() =>
                    setProfile((p) => ({ ...p, gender: "female" }))
                  }
                />{" "}
                Nữ
              </label>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ color: "#666", marginBottom: 6 }}>Ngày sinh</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="date"
                  value={profile.birthday || ""}
                  onChange={handleChange("birthday")}
                  style={{
                    padding: "8px",
                    borderRadius: 6,
                    border: "1px solid #ddd",
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <button
                type="submit"
                style={{
                  background: "#d81b2a",
                  color: "#fff",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                Lưu thay đổi
              </button>
            </div>
          </form>

          {showVouchers && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.35)",
                zIndex: 80,
              }}
              onClick={() => setShowVouchers(false)}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: 640,
                  maxWidth: "94%",
                  background: "#fff",
                  padding: 18,
                  borderRadius: 8,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 800 }}>
                    Voucher của bạn
                  </div>
                  <button
                    onClick={() => setShowVouchers(false)}
                    style={{
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      fontSize: 18,
                    }}
                  >
                    ✕
                  </button>
                </div>

                <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                  {Array.isArray(userVouchers) && userVouchers.length > 0 ? (
                    <>
                      <div>
                        <div style={{ fontWeight: 800 }}>Voucher giảm giá</div>
                        <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                          {userVouchers.filter((x) => x.type !== "freeship")
                            .length > 0 ? (
                            userVouchers
                              .filter((x) => x.type !== "freeship")
                              .map((v) => (
                                <div
                                  key={v.code}
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: 12,
                                    border: "1px solid #eee",
                                    borderRadius: 8,
                                  }}
                                >
                                  <div>
                                    <div style={{ fontWeight: 800 }}>
                                      {v.code}
                                    </div>
                                    <div
                                      style={{ fontSize: 13, color: "#666" }}
                                    >
                                      {v.description}
                                    </div>
                                    <div
                                      style={{
                                        fontSize: 12,
                                        color: "#999",
                                        marginTop: 6,
                                      }}
                                    >
                                      Hạn dùng: {v.expires}
                                    </div>
                                  </div>
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: 8,
                                      alignItems: "center",
                                    }}
                                  >
                                    <button
                                      onClick={() => handleCopyCode(v.code)}
                                      style={{
                                        padding: "8px 10px",
                                        borderRadius: 6,
                                        border: "1px solid #ddd",
                                        background: "#fff",
                                        cursor: "pointer",
                                      }}
                                    >
                                      {copied === v.code
                                        ? "Đã sao chép"
                                        : "Sao chép mã"}
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
                      </div>

                      <div>
                        <div style={{ fontWeight: 800, marginTop: 12 }}>
                          Voucher Freeship
                        </div>
                        <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                          {userVouchers.filter((x) => x.type === "freeship")
                            .length > 0 ? (
                            userVouchers
                              .filter((x) => x.type === "freeship")
                              .map((v) => (
                                <div
                                  key={v.code}
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: 12,
                                    border: "1px solid #eee",
                                    borderRadius: 8,
                                  }}
                                >
                                  <div>
                                    <div style={{ fontWeight: 800 }}>
                                      {v.code}{" "}
                                      <span
                                        style={{
                                          fontSize: 12,
                                          color: "#666",
                                          marginLeft: 8,
                                        }}
                                      >
                                        (Freeship)
                                      </span>
                                    </div>
                                    <div
                                      style={{ fontSize: 13, color: "#666" }}
                                    >
                                      {v.description}
                                    </div>
                                    <div
                                      style={{
                                        fontSize: 12,
                                        color: "#999",
                                        marginTop: 6,
                                      }}
                                    >
                                      Hạn dùng: {v.expires}
                                    </div>
                                  </div>
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: 8,
                                      alignItems: "center",
                                    }}
                                  >
                                    <button
                                      onClick={() => handleCopyCode(v.code)}
                                      style={{
                                        padding: "8px 10px",
                                        borderRadius: 6,
                                        border: "1px solid #ddd",
                                        background: "#fff",
                                        cursor: "pointer",
                                      }}
                                    >
                                      {copied === v.code
                                        ? "Đã sao chép"
                                        : "Sao chép mã"}
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
                      </div>
                    </>
                  ) : (
                    <div style={{ color: "#666" }}>
                      Bạn hiện chưa có voucher nào.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
