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
- **Your public key**, sent to each relay when the panel opens, to fetch
  your mute list.
- **Your mute list**, sent to each relay when you mute or unmute someone.
  It is public: anyone can see whom your key muted.
- **A request to your signer extension**, if you chose one: boca runs a
  small function in the page in the active tab that asks the page's
  `window.nostr` for your public key or a signature. It reads nothing
  else from the page.

## What stays on your computer

- **boca's secret key**, in the extension's local storage. It never leaves
  the browser unless you show it and copy it yourself.
- **The newest copy of your mute list.**

## Permissions

- `sidePanel`, to show the panel.
- `tabs`, to read the address of the active tab, so the panel can follow
  you from page to page.
- `storage`, to keep your key, your choice of signer and your mute list.
- `scripting`, and access to web pages if you choose a signer extension,
  to reach that signer through the page in the active tab. Chrome asks
  for page access only when you choose it.

## Contact

Questions go to the issues of
[github.com/iguigova/boca](https://github.com/iguigova/boca/issues).
