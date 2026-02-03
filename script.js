document.addEventListener("DOMContentLoaded", () => {
  // Required elements
  const form = document.getElementById("searchForm");
  const queryInput = document.getElementById("query");
  const resultsEl = document.getElementById("results");
  const statusEl = document.getElementById("status");

  // Optional element
  const testBtn = document.getElementById("testApi");

  // Safety check: if any required element is missing, stop and tell you why
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

  function getCoverUrl(coverId) {
    return coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : "";
  }

  function bookCard(doc) {
    const title = doc.title || "Untitled";
    const authors = (doc.author_name || []).join(", ") || "Unknown author";
    const year = doc.first_publish_year ? `• ${doc.first_publish_year}` : "";
    const coverUrl = getCoverUrl(doc.cover_i);

    const article = document.createElement("article");
    article.className = "card";

    const img = document.createElement("img");
    img.alt = `Cover of ${title}`;
    img.src =
      coverUrl ||
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600'%3E%3Crect width='100%25' height='100%25' fill='%23eee'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='20'%3ENo Cover%3C/text%3E%3C/svg%3E";

    const h3 = document.createElement("h3");
    h3.textContent = title;

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `By: ${authors} ${year}`.trim();

    // Optional: short snippet if available
    const snippet =
      (Array.isArray(doc.first_sentence) ? doc.first_sentence.join(" ") : doc.first_sentence) ||
      "";

    const p = document.createElement("p");
    p.textContent = snippet ? truncate(snippet, 200) : "";

    // Only append paragraph if there is content
    article.append(img, h3, meta);
    if (p.textContent) article.appendChild(p);

    return article;
  }

  async function searchBooks(query) {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=12`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    return data;
  }

  async function runSearch(query) {
    resultsEl.innerHTML = "";
    setStatus("Searching…");

    try {
      const data = await searchBooks(query);
      const docs = data.docs || [];

      console.log("Open Library results:", docs);

      if (docs.length === 0) {
        setStatus(`No results found for “${query}”. Try a different search.`);
        return;
      }

      docs.forEach((doc) => resultsEl.appendChild(bookCard(doc)));
      setStatus(`Showing ${docs.length} results for “${query}”.`);
    } catch (err) {
      console.error(err);
      setStatus(`Error: ${err.message}`);
    }
  }

  // Form submit
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
