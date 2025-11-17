import React from "react";
import { useLocation, Link } from "react-router-dom";
import BookSection from "../components/BookSection/BookSection";
import { allBooks } from "../data/books";

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

export default function HomePage() {
  const q = useQuery().get("q") || "";
  const term = q.trim();
  const category = useQuery().get("category") || "";

  const categories = React.useMemo(() => {
    try {
      const map = (allBooks || []).reduce((acc, b) => {
        const raw = String(b.category || "").trim();
        if (!raw) return acc;
        const key = raw.toLowerCase();
        if (!acc.has(key)) acc.set(key, raw);
        return acc;
      }, new Map());
      return Array.from(map.values()).sort((a, b) => a.localeCompare(b, "vi"));
    } catch {
      return [];
    }
  }, []);

  // If a search term is present show search results
  if (term) {
    const termLower = term.toLowerCase();
    const results = allBooks.filter((b) => {
      return (
        String(b.title).toLowerCase().includes(termLower) ||
        String(b.author).toLowerCase().includes(termLower) ||
        (b.isbn && String(b.isbn).toLowerCase().includes(termLower))
      );
    });

    return (
      <div style={{ maxWidth: 1180, margin: "18px auto", padding: "0 14px" }}>
        <h2>Kết quả tìm kiếm cho “{term}”</h2>
        {results.length === 0 ? (
          <div
            style={{
              padding: 24,
              background: "#fff",
              borderRadius: 8,
              border: "1px solid #eee",
            }}
          >
            <p style={{ fontWeight: 700, marginBottom: 8 }}>
              Không tìm thấy sách
            </p>
            <p>Không có cuốn sách nào khớp với từ khóa của bạn.</p>
            <p>
              <Link to="/">Quay về trang chủ</Link>
            </p>
          </div>
        ) : (
          <BookSection
            title={`Tìm thấy ${results.length} kết quả`}
            books={results}
          />
        )}
      </div>
    );
  }

  // No search term: either show category view or default sections
  if (category) {
    const cats = (allBooks || []).filter(
      (b) =>
        String(b.category || "")
          .trim()
          .toLowerCase() === String(category).trim().toLowerCase()
    );
    return (
      <div style={{ maxWidth: 1180, margin: "18px auto", padding: "0 14px" }}>
        <BookSection title={`Thể loại: ${category}`} books={cats} />
      </div>
    );
  }

  // Default homepage: render a section for each category
  return (
    <>
      <main style={{ padding: 20 }}></main>
      <div style={{ maxWidth: 1180, margin: "18px auto", padding: "0 14px" }}>
        {categories.map((cat) => {
          const books = (allBooks || []).filter(
            (b) =>
              String(b.category || "")
                .trim()
                .toLowerCase() === String(cat).trim().toLowerCase()
          );
          return <BookSection key={cat} title={cat} books={books} />;
        })}
      </div>
    </>
  );
}
