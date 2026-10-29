# boca privacy policy

boca has no server, collects no analytics and sends nothing to its author.
It talks only to the three public Nostr relays named in its README.

## What leaves your computer

- **The address of the page the side panel shows**, without its
  `#fragment`, sent to each relay to ask for that page's comments. The
  panel asks only while it is open, and asks again when you switch to
  another tab or page with it open. A relay sees the address and your IP
  address, as any website does.
- **A comment you post**, sent to each relay with the page's address, the
  time and your public key. It is public, anyone can read it, and it
  cannot be taken back.

## What stays on your computer

- **Your secret key**, in the extension's local storage. It never leaves
  the browser.
- **The authors you muted.**

## Permissions

- `sidePanel`, to show the panel.
- `tabs`, to read the address of the active tab, so the panel can follow
  you from page to page.
- `storage`, to keep your key and your muted authors.

## Contact

Questions go to the issues of
[github.com/iguigova/boca](https://github.com/iguigova/boca/issues).
