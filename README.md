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
  first eight hex digits are the name others see.
- **Muting** an author hides their comments in your panel. The list stays
  on your computer.

What leaves your computer, and what does not, is stated in
[PRIVACY.md](PRIVACY.md).

## Install

Build it and load it unpacked:

```sh
npm ci
npm run build
```

Then open `chrome://extensions`, turn on Developer mode, choose
**Load unpacked** and pick the `dist` folder. Chrome 120 or later.

## Edges

- A comment cannot be edited or deleted once a relay has it.
- The key lives only in this browser profile. Removing the extension or
  clearing its storage makes a new key and a new name.
- A relay keeps what it chooses. Comments can disappear if every relay
  drops them.
- Comments are plain text, as NIP-22 requires: links are not clickable and
  markup shows as typed.
- Names are key digits, not profiles.

## Develop

```sh
npm test          # the suite, failing below 100% line coverage of src/
npm run build     # dist/: the bundle, static/ and the published brand.css
npm run package   # boca.zip, for the Chrome Web Store
```

The code is plain ES modules in `src/`. The only runtime dependencies are
`@noble/curves` and `@noble/hashes`, for the Schnorr signatures and the
sha256 ids.

## Licence

MIT. See [LICENSE](LICENSE).
