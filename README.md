# Farm to Table Tracked (Team FreshTrail)

Static site, flat layout (all files in one folder).

## Run locally
    python3 -m http.server 8000
then open http://localhost:8000 (camera scanning needs https or localhost).

## Deploy on GitHub Pages
1. Create a repo and upload everything in this folder (index.html at the root).
2. Settings > Pages > Deploy from a branch > main / (root) > Save.
3. Your site appears at https://<user>.github.io/<repo>/.

## Custom domain
- Pages > Custom domain: enter your domain.
- DNS: apex domain A records to 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153. For www, a CNAME to <user>.github.io.
- Tick "Enforce HTTPS" once it is available.

## Registration alerts (username, role, time)
Passwords are never sent. Get a free key at web3forms.com for aarav155211@gmail.com and put it in `js/config.js` as `notify.web3formsKey` (or use a Formspree URL).

## Admin page
Open `admin.html`. Change `adminPin` in `js/config.js` first. Set a temporary password for people who forgot theirs.

## Important limitation
Accounts, batches and check-ins live in each browser's localStorage, so the admin list shows only accounts made on that device. The consumer journey works across devices because batch data travels inside the QR link. For true shared data across phones, add a backend such as Supabase.

## Location capture
Wholesaler and mandi check-ins record the phone's GPS location (with the browser's permission) and show it on the journey page as a map link. Needs https (GitHub Pages is fine) or localhost. If permission is denied, the check-in can still be saved without a location.
