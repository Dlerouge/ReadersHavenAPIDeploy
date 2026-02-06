document.addEventListener("DOMContentLoaded", () => {
  const API_KEY = "AIzaSyBN9Dqx2D_xYmOGDPDSaxQke9joZLlY9w0";

  const form = document.getElementById("searchForm");
  const queryInput = document.getElementById("query");
  const resultsEl = document.getElementById("results");
  const statusEl = document.getElementById("status");
  const testBtn = document.getElementById("testApi");

  if (!form || !queryInput || !resultsEl || !statusEl) {
    console.error("Missing required HTML elements.");
    return;
  }

  function setStatus(msg) {
    statusEl.textContent = msg;
  }

  function truncate(text, max = 180) {
    if (!text) return "";
    return text.length > max ? text.slice(0, max).trim() + "…" : text;
  }

  const NO_COVER =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450'%3E%3Crect width='100%25' height='100%25' fill='%23eee'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999'%3ENo Cover%3C/text%3E%3C/svg%3E";

  function bookCard(item) {
    const info = item.volumeInfo || {};

    const title = info.title || "Untitled";
    const authors = (info.authors || []).join(", ") || "Unknown author";
    const desc = truncate(info.description || "No description available.");

    const thumb =
      info.imageLinks?.thumbnail ||
      info.imageLinks?.smallThumbnail ||
      "";

    const card = document.createElement("article");
    card.className = "card";

    const img = document.createElement("img");
    img.src = thumb || NO_COVER;
    img.alt = title;

    const h3 = document.createElement("h3");
    h3.textContent = title;

    const meta = document.createElement("p");
    meta.textContent = `By: ${authors}`;

    const p = document.createElement("p");
    p.textContent = desc;

    card.append(img, h3, meta, p);
    return card;
  }

  async function searchBooks(query) {
    const params = new URLSearchParams({
      q: query,
      maxResults: "12",
      printType: "books",
      orderBy: "relevance",
      key: API_KEY
    });

    const url = `https://www.googleapis.com/books/v1/volumes?${params}`;

    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error?.message || `HTTP ${res.status}`);
    }

    return data;
  }

  async function runSearch(query) {
    resultsEl.innerHTML = "";
    setStatus("Searching…");

    try {
      const data = await searchBooks(query);
      let items = data.items || [];

      // fallback if no results
      if (items.length === 0) {
        const fallback = await searchBooks(query.split(" ")[0]);
        items = fallback.items || [];
      }

      if (items.length === 0) {
        setStatus(`No results found for "${query}".`);
        return;
      }

      items.forEach((item) => resultsEl.appendChild(bookCard(item)));
      setStatus(`Showing ${items.length} results for "${query}".`);
    } catch (err) {
      console.error(err);
      setStatus("Error: " + err.message);
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = queryInput.value.trim();
    if (!q) return;
    runSearch(q);
  });

  if (testBtn) {
    testBtn.addEventListener("click", () => runSearch("harry potter"));
  }
});
