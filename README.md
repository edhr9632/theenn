# Education News Network — Next.js

The site has been converted from static HTML to **Next.js 15** (App Router) with your **8-color palette**:

| Token | Hex | Use |
|-------|-----|-----|
| Deep Navy | `#1A4099` | Header, footer, headlines |
| Royal Blue | `#3669B4` | Primary buttons, links |
| Vibrant Cyan | `#2ABCF3` | Accents, tags, live labels |
| Steel Blue | `#5691CC` | Gradients, secondary UI |
| Sky Blue | `#7CD3F3` | Highlights |
| Periwinkle | `#A6B5D4` | Muted footer text |
| Cool Gray | `#DDE3EA` | Page background |
| Charcoal | `#3A3A3A` | Body text |

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Pages

- `/` — Home (featured story, latest coverage, panel discussions)
- `/news` — Daily news listing
- `/news/[slug]` — Article detail (content left, categories/ads right)
- `/weekly-news`, `/trending-news`, `/press-release`
- `/events`, `/events/speakers`, `/events/sponsors`
- `/about`, `/contact`

## Legacy files

Original HTML/CSS is in `legacy/` for reference.

## Assets

Place logo at `public/images/Enn_logo1.png`.
