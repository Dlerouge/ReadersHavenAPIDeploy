document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("searchForm");
  const queryInput = document.getElementById("query");
  const resultsEl = document.getElementById("results");
  const statusEl = document.getElementById("status");
  const testBtn = document.getElementById("testApi");

  if (!form || !queryInput || !resultsEl || !statusEl) {
    console.error("Missing required HTML elements.");
    return;
  }

  const setStatus = (msg) => { statusEl.textContent = msg; };

  function truncate(text, max = 180) {
    if (!text) return "";
    return text.length > max ? text.slice(0, max).trim() + "..." : text;
  }

  function bookCard(item) {
    const info = item.volumeInfo || {};
    const title = info.title || "Untitled";
    const authors = (info.authors || []).join(", ") || "Unknown author";
    const desc = truncate(info.description, 200) || "No description available.";
    const thumb = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || "";

    const article = document.createElement("article");
    article.className = "card";

    const img = document.createElement("img");
    img.alt = `Cover of ${title}`;
    img.src = thumb || "https://via.placeholder.com/128x192?text=No+Cover";

    const h3 = document.createElement("h3");
    h3.textContent = title;

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `By: ${authors}`;

    const p = document.createElement("p");
    p.textContent = desc;

    article.append(img, h3, meta, p);
    return article;
  }

  async function searchBooks(q) {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=12`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  }

  async function runSearch(q) {
    resultsEl.innerHTML = "";
    setStatus("Searching...");
    try {
      const data = await searchBooks(q);
      const items = data.items || [];
      if (items.length === 0) {
        setStatus("No results found.");
        return;
      }
      items.forEach(item => resultsEl.appendChild(bookCard(item)));
      setStatus(`Showing results for "${q}"`);
    } catch (err) {
      console.error(err);
      setStatus("Error fetching books.");
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = queryInput.value.trim();
    if (q) runSearch(q);
  });

  if (testBtn) {
    testBtn.addEventListener("click", () => runSearch("cozy"));
  }
});