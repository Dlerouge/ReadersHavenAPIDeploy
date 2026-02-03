const form = document.getElementById("searchForm");
const queryInput = document.getElementById("query");
const resultsEl = document.getElementById("results");
const statusEl = document.getElementById("status");

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
  img.src = thumb || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600'%3E%3Crect width='100%25' height='100%25' fill='%23eee'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='20'%3ENo Cover%3C/text%3E%3C/svg%3E";

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
  const API_KEY = "AIzaSyDG-9s1_rAX-3sf6EJt0Y_AKFgvvnJuPME";
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=12&key=${API_KEY}`;

  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));

  // If Google returns an error payload, show it
  if (!res.ok) {
    const msg = data?.error?.message || `API error: ${res.status}`;
    throw new Error(msg);
  }

  // Extra safety: some errors return 200 but still contain an "error" object
  if (data?.error) {
    throw new Error(data.error.message || "API returned an error.");
  }

  return data;
}


form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const q = queryInput.value.trim();
  if (!q) return;

  resultsEl.innerHTML = "";
  setStatus("Searching…");

  try {
    const data = await searchBooks(q);
    const items = data.items || [];

    if (items.length === 0) {
      setStatus("No results found. Try a different search.");
      return;
    }

    items.forEach((item) => resultsEl.appendChild(bookCard(item)));
    setStatus(`Showing ${items.length} results for “${q}”.`);
  } catch (err) {
    console.error(err);
    setStatus("Something went wrong fetching books. Please try again.");
  }
});
