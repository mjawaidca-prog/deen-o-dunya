# Privacy Policy Deployment Notes

Generated: 2026-06-07
App: Deen o Dunya Planner

## Canonical Source

Canonical privacy policy source found in the repo: `privacy.html`.

The Google Play launch package includes `privacy-policy-github-pages.html`, which preserves the policy wording from `privacy.html` and adds only non-substantive HTML structure/styling for public hosting.

## Recommended Public URL

Use a public, unauthenticated HTTPS URL for Google Play Console.

If GitHub Pages is enabled for this repository, candidate URLs may be:

- If Pages serves the repository root: `https://mjawaidca-prog.github.io/deen-o-dunya/privacy.html`
- If Pages serves the `docs/` folder: `https://mjawaidca-prog.github.io/deen-o-dunya/release/google-play/privacy-policy-github-pages.html`

These URLs must be tested in a browser before pasting into Play Console. Do not assume GitHub Pages is enabled until the URL loads publicly.

## Deployment Checklist

- [ ] Confirm which GitHub Pages source is enabled: repository root or `docs/` folder.
- [ ] Publish the canonical policy page from that source.
- [ ] Open the public URL without being signed into GitHub.
- [ ] Confirm the public page text matches the repo policy wording.
- [ ] Paste the public HTTPS URL into Play Console.
- [ ] Confirm the in-app privacy link still opens `privacy.html` in the Android release build.

## Privacy Text Handling Rule

Do not rewrite, shorten, expand, paraphrase, or alter the actual policy text unless the developer explicitly approves a new canonical policy version.
