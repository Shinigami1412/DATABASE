import React from "react";
import { useLocation, Link } from "react-router-dom";
import BookSection from "../components/BookSection/BookSection";
import { allBooks } from "../data/books";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchResults() {
  const q = useQuery().get("q") || "";
  const term = q.trim().toLowerCase();

  const matches = term
    ? allBooks.filter(
        (b) =>
          b.title.toLowerCase().includes(term) ||
          b.author.toLowerCase().includes(term)
      )
    : [];

  return (
    <div style={{ maxWidth: 1180, margin: "18px auto", padding: "0 14px" }}>
      <h2>Kết quả tìm kiếm{term ? `: "${q}"` : ""}</h2>

      {term === "" ? (
        <div
          style={{
            padding: 12,
            background: "#fff",
            borderRadius: 8,
            border: "1px solid #f0f0f0",
          }}
        >
          Vui lòng nhập từ khóa tìm kiếm.
        </div>
      ) : matches.length > 0 ? (
        <BookSection title={`Kết quả cho "${q}"`} books={matches} />
      ) : (
        <div
          style={{
            padding: 18,
            background: "#fff",
            borderRadius: 8,
            border: "1px solid #f0f0f0",
          }}
        >
          Không tìm thấy sách
          <div style={{ marginTop: 8 }}>
            <Link to="/">Quay về trang chủ</Link>
          </div>
        </div>
      )}
    </div>
  );
}
