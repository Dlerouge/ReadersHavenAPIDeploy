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

  // TEMP: make results visible even if CSS is weird
  resultsEl.style.border = "1px dashed #999";
  resultsEl.style.minHeight = "80px";
  resultsEl.style.padding = "8px";

  function setStatus(msg) {
    statusEl.textContent = msg;
  }

  function truncate(text, max = 180) {
    if (!text) return "";
    return text.length > max ? text.slice(0, max).trim() + "…" : text;
  }

  function bookCard(item) {
    const info = item.volumeInfo || {};
    const title = info.title || "Untitled";
    const authors = (info.authors || []).join(", ") || "Unknown author";
    const desc = truncate(info.description, 200) || "No description available.";
    const thumb = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || "";

    const article = document.createElement("article");
    article.className = "card";
    article.style.border = "1px solid #ddd";
    article.style.padding = "10px";
    article.style.borderRadius = "10px";

    const img = document.createElement("img");
    img.alt = `Cover of ${title}`;
    img.src =
      thumb ||
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23eee'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='16'%3ENo Cover%3C/text%3E%3C/svg%3E";
    img.style.width = "100%";
    img.style.maxWidth = "160px";
    img.style.display = "block";

    const h3 = document.createElement("h3");
    h3.textContent = title;

    const meta = document.createElement("div");
    meta.textContent = `By: ${authors}`;

    const p = document.createElement("p");
    p.textContent = desc;

    article.append(img, h3, meta, p);
    return article;
  }

  async function searchBooks(query) {
  const base = `https://www.googleapis.com/books/v1/volumes`;
  const params = new URLSearchParams({
    q: query,                 // keep it simple
    maxResults: "12",
    printType: "books",
    orderBy: "relevance",
    projection: "lite",
    langRestrict: "en"
  });

  const url = `${base}?${params.toString()}`;
  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();

  if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`);
  return data;
}


  async function runSearch(query) {
  resultsEl.innerHTML = "";
  setStatus("Searching…");

  try {
    const data = await searchBooks(query);
    let items = data.items || [];

    // Fallback: broaden the query if Google returns 0 items
    if (items.length === 0) {
      // Try a broader keyword-style query
      const fallbackQuery = query.split(" ").join("+"); // "vampire romance" -> "vampire+romance"
      const fallbackData = await searchBooks(fallbackQuery);
      items = fallbackData.items || [];
    }

    if (items.length === 0) {
      setStatus(`No results found for "${query}". Try a simpler search like "vampire" or "paranormal romance".`);
      resultsEl.textContent = "No books returned from the API.";
      return;
    }

    items.forEach((item) => resultsEl.appendChild(bookCard(item)));
    setStatus(`Showing ${items.length} results for "${query}".`);
  } catch (err) {
    console.error("Search error:", err);
    setStatus(`Error: ${err.message}`);
    resultsEl.textContent = `Error details: ${err.message}`;
  }
}


  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = queryInput.value.trim();
    if (!q) return setStatus("Please type something before searching.");
    runSearch(q);
  });

  if (testBtn) {
    testBtn.addEventListener("click", () => runSearch("harry potter"));
  }
});
