// src/components/FahasaNavbar/SearchBar.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchBar() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    const term = q.trim();
    // Navigate to home with query param so results render on homepage
    navigate(`/?q=${encodeURIComponent(term)}`);
  };

  return (
    <form className="faha-search" onSubmit={submit}>
      <input
        type="text"
        placeholder="Tìm kiếm sách, tác giả, ISBN, nhà xuất bản..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Tìm kiếm"
      />
      <select className="cat-select" aria-label="Danh mục">
        <option value="all">Tất cả</option>
        <option value="books">Sách</option>
        <option value="gifts">Quà tặng</option>
      </select>
      <button className="search-btn" type="submit">
        Tìm kiếm
      </button>
    </form>
  );
}
