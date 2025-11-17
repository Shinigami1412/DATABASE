// src/components/FahasaNavbar/MegaMenu.jsx
import React from "react";

/*
  Một mega menu đơn giản. Bạn có thể mở rộng nội dung theo variant.
  Đây là nội dung tĩnh demo, thay bằng data động khi cần.
*/
export default function MegaMenu({ variant = "default" }) {
  const common = (
    <div className="mega-inner">
      <div className="col">
        <h4>Hot</h4>
        <ul>
          <li>Sách bán chạy</li>
          <li>Sách giảm giá</li>
          <li>Tủ sách thiếu nhi</li>
        </ul>
      </div>

      <div className="col">
        <h4>Thể loại</h4>
        <ul>
          <li>Văn học</li>
          <li>Kinh tế</li>
          <li>Giáo trình</li>
          <li>Truyện tranh</li>
        </ul>
      </div>

      <div className="col">
        <h4>Nhà xuất bản</h4>
        <ul>
          <li>NXB Kim Đồng</li>
          <li>NXB Trẻ</li>
          <li>NXB Giáo dục</li>
        </ul>
      </div>

      <div className="col promo">
        <div className="promo-card">
          <img src="/banner-placeholder-1.jpg" alt="promo" />
          <div className="promo-text">Ưu đãi 20% cho đơn đầu</div>
        </div>
      </div>
    </div>
  );

  // Tuỳ variant có thể trả nội dung khác
  if (variant === "sachmoi") {
    return <div className="mega-wrap">{common}</div>;
  }
  if (variant === "theloai") {
    return <div className="mega-wrap">{common}</div>;
  }
  return <div className="mega-wrap">{common}</div>;
}
