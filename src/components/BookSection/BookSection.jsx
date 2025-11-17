// src/components/BookSection/BookSection.jsx
import React, { useRef } from "react";
import BookCard from "./BookCard";
import "./BookSection.css";

/*
  Component BookSection:
   - title: tên thể loại
   - books: mảng sách
*/

export default function BookSection({ title = "Thể loại", books = [] }) {
  const railRef = useRef(null);

  const scrollBy = (dir = "right") => {
    const rail = railRef.current;
    if (!rail) return;
    const amount = Math.floor(rail.clientWidth * 0.8); // cuộn 80% width
    rail.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
  };

  // optional: support drag-to-scroll
  let isDown = false;
  let startX;
  let scrollLeft;
  const onMouseDown = (e) => {
    isDown = true;
    railRef.current.classList.add("dragging");
    startX = e.pageX - railRef.current.offsetLeft;
    scrollLeft = railRef.current.scrollLeft;
  };
  const onMouseLeave = () => {
    isDown = false;
    if (railRef.current) railRef.current.classList.remove("dragging");
  };
  const onMouseUp = () => {
    isDown = false;
    if (railRef.current) railRef.current.classList.remove("dragging");
  };
  const onMouseMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - railRef.current.offsetLeft;
    const walk = (x - startX) * 1; // multiplier
    railRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <section className="book-section">
      <div className="bs-header">
        <h3>{title}</h3>
        <div className="bs-controls">
          <button aria-label="Prev" className="bs-arrow" onClick={() => scrollBy("left")}>‹</button>
          <button aria-label="Next" className="bs-arrow" onClick={() => scrollBy("right")}>›</button>
        </div>
      </div>

      <div
        className="book-rail"
        ref={railRef}
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
      >
        {books.map((b) => (
          <BookCard key={b.id} book={b} />
        ))}
      </div>
    </section>
  );
}
