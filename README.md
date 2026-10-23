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
│       ├── profile/      Portrait and field photo
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

## Image guidelines

WebP, longest edge 1600 px or less, quality about 80, metadata stripped.
