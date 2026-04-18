# moraezip

A quiet room on the internet. Static HTML + Decap CMS for writing.

## Write a new post

Go to `https://morae.zip/admin/` → log in → add an entry in the Posts list → Publish.

The change is committed to this repo automatically, and Netlify rebuilds the site in ~30s.

## Local preview

```sh
python3 -m http.server 8765
# open http://localhost:8765
```

## Structure

- `posts.json` — all notes + archives (edited via `/admin/`)
- `posts.js` — fetches `posts.json` at runtime, converts markdown → HTML
- `*.html` — static pages
- `admin/` — Decap CMS (only visible after Netlify Identity login)
- `images/` — static images; `images/uploads/` is where Decap puts new uploads
