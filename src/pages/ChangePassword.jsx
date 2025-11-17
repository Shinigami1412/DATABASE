import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function readUser() {
  try {
    return JSON.parse(localStorage.getItem("user_profile") || "null") || {};
  } catch {
    return {};
  }
}

function writeUser(user) {
  try {
    localStorage.setItem("user_profile", JSON.stringify(user || {}));
  } catch {
    // ignore
  }
}

const AccountInfo = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => readUser());
  const [editingName, setEditingName] = useState(false);
  const [usernameInput, setUsernameInput] = useState(user.username || "");

  // change password form state
  const [showChangePw, setShowChangePw] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const u = readUser();
    setUser(u);
    setUsernameInput(u.username || "");
  }, []);

  function validatePassword(pw) {
    if (pw.length < 8) return "Mật khẩu phải ít nhất 8 ký tự";
    if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw))
      return "Mật khẩu phải bao gồm chữ và số";
    return null;
  }

  function saveUsername(e) {
    e && e.preventDefault();
    const updated = { ...user, username: usernameInput };
    setUser(updated);
    writeUser(updated);
    setEditingName(false);
    setMessage("Lưu tên đăng nhập thành công");
    setTimeout(() => setMessage(""), 1500);
  }

  function handleChangePassword(e) {
    e.preventDefault();
    setMessage("");
    const stored = user.password;
    if (stored && stored !== currentPassword) {
      setMessage("Mật khẩu hiện tại không đúng");
      return;
    }

    const err = validatePassword(newPassword);
    if (err) {
      setMessage(err);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Xác nhận mật khẩu không khớp");
      return;
    }

    const updated = { ...user, password: newPassword };
    setUser(updated);
    writeUser(updated);
    setMessage("Đổi mật khẩu thành công");
    // hide the form after a moment
    setTimeout(() => {
      setShowChangePw(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("");
      navigate("/account");
    }, 900);
  }

  return (
    <div style={{ padding: 20, maxWidth: 700 }}>
      <h2>Thông tin tài khoản</h2>

      <div style={{ marginTop: 12 }}>
        <strong>Tên đăng nhập:</strong>
        {!editingName ? (
          <span style={{ marginLeft: 8 }}>{user.username || "(chưa đặt)"}</span>
        ) : (
          <form
            onSubmit={saveUsername}
            style={{ display: "inline-block", marginLeft: 8 }}
          >
            <input
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              style={{ marginRight: 8 }}
            />
            <button type="submit">Lưu</button>
            <button
              type="button"
              onClick={() => {
                setEditingName(false);
                setUsernameInput(user.username || "");
              }}
              style={{ marginLeft: 8 }}
            >
              Hủy
            </button>
          </form>
        )}
        {!editingName && (
          <button
            style={{ marginLeft: 12 }}
            onClick={() => setEditingName(true)}
          >
            Chỉnh sửa
          </button>
        )}
      </div>

      <div style={{ marginTop: 12 }}>
        <strong>Mật khẩu:</strong>
        <span style={{ marginLeft: 8 }}>
          {user.password ? "********" : "(chưa đặt)"}
        </span>
        <button
          style={{ marginLeft: 12 }}
          onClick={() => setShowChangePw((s) => !s)}
        >
          {showChangePw ? "Đóng" : "Đổi mật khẩu"}
        </button>
      </div>

      {showChangePw && (
        <div
          style={{
            marginTop: 12,
            border: "1px solid #ddd",
            padding: 12,
            borderRadius: 6,
          }}
        >
          <form onSubmit={handleChangePassword}>
            {user.password ? (
              <div style={{ marginBottom: 8 }}>
                <label style={{ display: "block" }}>Mật khẩu hiện tại</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
            ) : (
              <div style={{ marginBottom: 8, color: "#666" }}>
                <small>
                  Chưa có mật khẩu — chỉ cần nhập mật khẩu mới để thiết lập.
                </small>
              </div>
            )}

            <div style={{ marginBottom: 8 }}>
              <label style={{ display: "block" }}>Mật khẩu mới</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: 8 }}>
              <label style={{ display: "block" }}>Xác nhận mật khẩu</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div>
              <button type="submit">Lưu mật khẩu mới</button>
              <button
                type="button"
                onClick={() => setShowChangePw(false)}
                style={{ marginLeft: 8 }}
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {message && <div style={{ marginTop: 12 }}>{message}</div>}
    </div>
  );
};

export default AccountInfo;
