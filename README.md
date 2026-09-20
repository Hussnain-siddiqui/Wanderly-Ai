# Wanderly AI: AI-Style Travel Planner

Web Engineering, Assignment 01 (BSCS, The University of Lahore, Fall 2026).
Multi-page site built with HTML, CSS, Tailwind CSS and Flowbite. No build step needed.

## Folder structure

```
wanderly-ai/
├── index.html              Home
├── src/pages/
│   ├── about.html
│   ├── contact.html
│   ├── signup.html
│   └── signin.html
└── assets/
    ├── css/style.css
    ├── js/main.js          validation, Formspree, planner preview
    ├── js/tailwind-config.js
    └── images/logo.svg
```

## Before you submit

1. **Connect Formspree** (Contact page).
   Create a free form at https://formspree.io, copy its ID, then in `src/pages/contact.html` replace
   `YOUR_FORM_ID` in `action="https://formspree.io/f/YOUR_FORM_ID"`.
   Send one test message so Formspree confirms the form.
2. **Personalize the team section** in `src/pages/about.html` (names and roles are placeholders).
3. **Deploy on GitHub Pages**
   - Create a repo and push everything inside this folder (so `index.html` is at the repo root).
   - Settings > Pages > Source: "Deploy from a branch", branch `main`, folder `/ (root)`.
   - Your live link will be `https://<username>.github.io/<repo>/`. Put it at the top of the PDF report.
4. Push again after every change so the live link matches the latest code.

## Where each rubric item lives

| Requirement | Where |
|---|---|
| Responsive navbar (logo, Home/About/Contact, Sign Up/Sign In), same on all pages | top of every page |
| Footer, same on all pages | bottom of every page |
| Home: hero + 10+ components | `index.html` (each block has a `COMPONENT n` comment) |
| About: 5 components | `src/pages/about.html` (stats, timeline, team, testimonial, accordion) |
| Contact: 5+ Flowbite components, Formspree, validation | `src/pages/contact.html` + `assets/js/main.js` |
| Sign Up: 5+ Tailwind components, "Already have an account? Sign in." | `src/pages/signup.html` |
| Sign In: 5+ Flowbite components, "Don't have an account? Sign up." | `src/pages/signin.html` |

## Notes

- The home-page planner is a browser-only preview with sample logic. It is not connected to a real AI model.
- Sign Up and Sign In are front-end demos: they validate input but do not store accounts.
- Statistics, testimonials, prices and team members are placeholder content.
- Tailwind and Flowbite load from CDNs, so pages need an internet connection.
