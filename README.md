# ALOG Legacy Foundation website

One-page website for ALOG Legacy Foundation (Ghana). Plain HTML, CSS and JavaScript with no build step, ready for GitHub Pages.

## Files

```
index.html            the page
assets/css/style.css  all styles (colours and fonts are at the top in :root)
assets/js/main.js     mobile menu, donation picker, contact form, gallery arrows
assets/img/           logo files and placeholder photos
```

## Publish on GitHub Pages

1. Create a new repository (for example `alog-legacy-foundation`) and upload everything in this folder, keeping the folder structure.
2. In the repository, open **Settings > Pages**, set **Source** to "Deploy from a branch", choose `main` and `/ (root)`, then save.
3. After a minute the site is live at `https://<your-username>.github.io/alog-legacy-foundation/`.

## How donations and messages work

There is no payment backend yet. The donation picker and the contact form both open WhatsApp to **055 847 2722** with a pre-filled message (amount, frequency, program, or the visitor's note). To change the number, edit `WHATSAPP_NUMBER` at the top of `assets/js/main.js` (international format, no `+`).

## Placeholders to replace before launch

Search `index.html` for `PLACEHOLDER` and `TODO`:

- **Cause figures**: raised and goal amounts on the three cause cards (also update `--p`, the % label and `aria-valuenow`).
- **Impact numbers**: children supported, partner schools, families, volunteers.
- **Testimonials**: quotes, names and roles.
- **Events**: dates, times and places.
- **News stories**: headlines, dates and text.
- **Address**: currently "Accra, Ghana".
- **MoMo / bank details**: add in the donate band once confirmed.
- **Photos**: all photos are placeholders from Unsplash (see `CREDITS.md`). Replace with the foundation's own photos using the same file names to keep the layout.

Confirm 055 847 2722 is on WhatsApp.
