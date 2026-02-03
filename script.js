document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ script.js loaded (Google Books, no API key)");

  // Required elements
  const form = document.getElementById("searchForm");
  const queryInput = document.getElementById("query");
  const resultsEl = document.getElementById("results");
  const statusEl = document.getElementById("status");

  // Optional element
  const testBtn = document.getElementById("testApi");

  if (!form || !queryInput || !resultsEl || !statusEl) {
    console.error("Missing required HTML elements. Need: searchForm, query, results, status");
    return;
  }

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

    const thumb =
      info.imageLinks?.thumbnail ||
      info.imageLinks?.smallThumbnail ||
      "";

    const article = document.createElement("article");
    article.className = "card";

    const img = document.createElement("img");
    img.alt = `Cover of ${title}`;
    img.src =
      thumb ||
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600'%3E%3Crect width='100%25' height='100%25' fill='%23eee'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='20'%3ENo Cover%3C/text%3E%3C/svg%3E";

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

  async function searchBooks(query) {
    // Google Books works WITHOUT an API key for basic search.
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
      query
    )}&maxResults=12`;

    const res = await fetch(url, { cache: "no-store" });

    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error("Response was not valid JSON.");
    }

    if (!res.ok) {
      throw new Error(data?.error?.message || `HTTP ${res.status}`);
    }

    return data; // { items: [...] }
  }

  async function runSearch(query) {
    resultsEl.innerHTML = "";
    setStatus("Searching…");

    try {
      const data = await searchBooks(query);
      const items = data.items || [];

      console.log("Google Books items:", items);

      if (items.length === 0) {
        setStatus(`No results found for “${query}”. Try a different search.`);
        return;
      }

      items.forEach((item) => resultsEl.appendChild(bookCard(item)));
      setStatus(`Showing ${items.length} results for “${query}”.`);
    } catch (err) {
      console.error(err);
      setStatus(`Error: ${err.message}`);
    }
  }

  // Search on submit
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = queryInput.value.trim();

    if (!q) {
      setStatus("Please type something before searching.");
      return;
    }

    runSearch(q);
  });

  // Optional test button
  if (testBtn) {
    testBtn.addEventListener("click", () => runSearch("cozy"));
  }
});
