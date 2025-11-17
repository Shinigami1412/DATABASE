// src/components/FahasaNavbar/MobileDrawer.jsx
import React from "react";

export default function MobileDrawer({ onClose }) {
  return (
    <div className="md-overlay" onClick={onClose}>
      <aside className="md-drawer" onClick={(e) => e.stopPropagation()}>
        <button className="md-close" onClick={onClose}>
          ✕
        </button>

        <div className="md-section">
          <h3>Danh mục</h3>
          <ul>
            <li>Sách mới</li>
            <li>Thể loại</li>
            <li>Nhà sách</li>
            <li>Sách học</li>
            <li>Quà tặng</li>
          </ul>
        </div>

        <div className="md-section">
          <h3>Tài khoản</h3>
          <ul>
            <li>Đăng nhập</li>
            <li>Đơn hàng của tôi</li>
            <li>Yêu thích</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
