# boca

*You talk, therefore I am.*

Comments on any web page, in a Chrome side panel. There is no boca server
and no account: comments live on public Nostr relays, and anyone with a
Nostr client can read and answer them.

## How it works

Click the boca button and the side panel opens beside the page. It shows
the comments on that page and follows you as you switch tabs.

- **A page** is its URL, normalized and without the `#fragment`, as
  [NIP-73](https://github.com/nostr-protocol/nips/blob/master/73.md)
  names web content.
- **A comment** is a [NIP-22](https://github.com/nostr-protocol/nips/blob/master/22.md)
  event of kind 1111. Its root is the page, an `I` tag of kind `web`. A
  reply also names the comment it answers. Other clients that write NIP-22
  web comments show up in boca, and boca's show up in them.
- **The relays** are `nos.lol`, `relay.primal.net` and `offchain.pub`
  (`RELAYS` in `src/panel.js`). A page's comments are asked for from all
  three when the panel shows the page, and a comment is sent to all three.
  The panel says which relays did not answer.
- **Your key** is made in the browser the first time the panel opens and
  stays in the extension's local storage. It signs your comments, and its
  first eight hex digits are the name others see. Under **Your key** you
  can show it as an `nsec` to keep a copy, or paste an `nsec` (or 64 hex
  digits) to post as another key.
- **A signer extension** you already use can sign
  instead ([NIP-07](https://github.com/nostr-protocol/nips/blob/master/07.md)).
  A signer offers `window.nostr` only to web pages, so boca asks it through
  the page in the active tab. Choosing it asks Chrome for access to web
  pages, and everything the signer returns is checked before it is used.
- **Muting** an author hides their comments. The mute list is your
  [NIP-51](https://github.com/nostr-protocol/nips/blob/master/51.md) list,
  kind 10000, saved to the relays, so it follows your key to other devices
  and other Nostr clients. A change keeps the hashtags, words and private
  items other clients put in the list.

What leaves your computer, and what does not, is stated in
[PRIVACY.md](PRIVACY.md).

## Install

Build it and load it unpacked:

```sh
npm ci
npm run build
```

Then open `chrome://extensions`, turn on Developer mode, choose
**Load unpacked** and pick the `dist` folder. Chrome 123 or later, for the
CSS `light-dark()` that brand.css's colours use.

## Edges

- A comment cannot be edited or deleted once a relay has it.
- boca's key lives only in this browser profile. Removing the extension or
  clearing its storage makes a new key and a new name, unless you kept the
  `nsec`.
- A signer extension is reached through the page in the active tab, so it
  works only on pages where that signer runs.
- A relay keeps what it chooses. Comments can disappear if every relay
  drops them.
- Comments are plain text, as NIP-22 requires: links are not clickable and
  markup shows as typed.
- Names are key digits, not profiles.

## Develop

```sh
npm test          # the suite, failing below 100% line coverage of src/
npm run build     # dist/: the bundle, static/, ../brand.css and ../brand.js
npm run package   # boca.zip, for the Chrome Web Store
```

The build copies `../brand.css`, the base style of every page I make, and
`../brand.js`, the theme switch beside it. On my machine each is a symlink
into the `iguigova.github.io` clone; anywhere else, fetch them first, as CI
does: `curl -fsS https://iguigova.github.io/brand.css -o ../brand.css`, and
the same for `brand.js`.

The code is plain ES modules in `src/`. The runtime dependencies are
`@noble/curves` and `@noble/hashes`, for the Schnorr signatures and the
sha256 ids, and `@scure/base`, for `nsec` and `npub`.

The icon is public domain, from publicdomainvectors.org.

## Licence

MIT. See [LICENSE](LICENSE).
