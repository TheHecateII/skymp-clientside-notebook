# RP Book — Immersive In-Game Notebook for SkyMP

A small **client-side SkyrimPlatform** plugin for **SkyMP**. It adds a medieval, Skyrim-style book
that you can use as a personal RP notebook in-game: write pages, give them a title, and flip through
them. Your notes are kept locally on your own machine.

> ⚠️ **Read before using**
>
> - This is a **hacked-together / experimental** plugin. It is not polished or officially supported,
>   it may break, behave unexpectedly, or stop working after an update. Use it at your own risk.
> - **Get permission from the server you play on BEFORE using it.** Even though it is client-side and
>   does not change anything on the server, many RP servers have rules about client mods and add-ons.
>   Ask the staff/admins first.

> **Client-side only.** This plugin is meant to be **injected on the client**. It only reads and
> displays things locally and never sends anything to the server.

---

## Installation (client-side)

Copy `rp_book.js` into your SkyrimPlatform plugins folder **on your client machine**:

```
Steam\steamapps\common\Skyrim Special Edition\Data\Platform\Plugins\rp_book.js
```

SkyrimPlatform loads it automatically. Do **not** put it server-side.

> Don't touch the existing SkyMP files in that folder
> (`skymp5-client.js`, `skymp5-activity.js`, `skymp5-client-settings.txt`).

---

## Controls

| Key | Action |
|-----|--------|
| **F7** | Open / close the book |
| **← / →** | Turn to the previous / next page |
| **Enter** | Grab the cursor to click and type (SkyMP "Set Browser Focus") |
| **Escape** | Release the cursor and go back to the game |

To write: open with `F7`, press **Enter** for the cursor, type in the title/body, then **Escape**
when done. The arrows turn pages only while you are *not* typing.

---

## Notes

- Notes are stored locally in the browser's `localStorage`, with a game-side backup. Whether they
  survive a full game restart depends on the SkyMP browser setup.
- A page-turn sound plays when you flip pages (it may be silent until your first click/keypress, a
  browser autoplay rule).
- `OPEN_ANIM_EVENT` in the file is an optional, experimental hook to play an animation on open —
  unreliable in multiplayer, off by default.
