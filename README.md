# sapkotaganesh.com.np

Personal academic and professional portfolio of Ganesh Sapkota. Static HTML, CSS and vanilla JavaScript, served by GitHub Pages.

## Structure

```
.
├── index.html            Single-page site (content, SEO metadata, JSON-LD)
├── css/style.css         Layout, light and dark themes, components
├── js/main.js            Theme toggle, search palette, photo viewer, filters, scroll spy
├── assets/
│   ├── cv/               Downloadable CV (PDF)
│   ├── icons/            Favicon
│   └── images/
│       ├── profile/      hero-sweater.webp (intro), portrait-sweater.webp (header), bouquet.webp (closing), solar-field-hd.webp
│       ├── workshops/    Workshop photos
│       ├── erasmus/      Thessaloniki photos
│       └── projects/     One folder per project (01.webp, 02.webp, ...)
├── CNAME                 Custom domain for GitHub Pages
├── robots.txt
└── sitemap.xml
```

## Editing

- **Text and projects:** edit `index.html`. Each project is an `<article class="project">`.
- **Add photos to a project:** put `.webp` files in its folder under `assets/images/projects/`, then add an
  `<a href="..." data-lightbox="group-name" data-caption="...">` with an `<img alt="...">` inside the project's `.thumbs` block.
- **Update the CV:** replace `assets/cv/Ganesh_Sapkota_CV.pdf` keeping the same name.
- **After changing CSS or JS:** bump the `?v=` value on the `<link>` and `<script>` tags in `index.html` so browsers and Cloudflare fetch the new files.

## Changing a photo on GitHub

1. Prepare the new photo as WebP (free converter: squoosh.app). Name it exactly like the file you are replacing.
   - Intro photo: `hero-sweater.webp`, portrait orientation about 4:5 (for example 960 x 1200 px).
   - Small portrait: `portrait-sweater.webp`, square (for example 640 x 640 px).
2. On GitHub open `assets/images/profile`, choose Add file, then Upload files, drop the file in and commit to `main`.
   A file with the same name replaces the old one.
3. Wait about a minute, then hard-refresh the site (Ctrl+F5). If the old photo still shows, upload under a new
   name (for example `hero-sweater-2.webp`) and change the file name in `index.html` using the pencil (edit) button.

## Image guidelines

WebP, longest edge 1600 px or less, quality about 80, metadata stripped.
