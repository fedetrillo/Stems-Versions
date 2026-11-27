# Changelog

## 1.0.2 — 2026-11-26

- **Fixed on Windows:** LUNA on Windows sizes the page to the window's outer size, title bar and frame included, so the bottom 39 px and the right 16 px were hidden. The page now leaves that space out on Windows, so everything at the bottom and right edges shows in full.
  the part you can see, so the controls at the bottom were hidden. The page now fits itself to
  the window size LUNA reports; nothing changes where the two match.
- **Report copy:** Alt-click on the version now always says in the status bar that the report was copied. Where the system clipboard is blocked (seen on some Windows set-ups) it uses a fallback, and if that fails too it shows the report selected so you can copy it by hand.

## 1.0.1 — 2026-11-25

- A short getting-started guide: the first time it opens it asks for your language, then walks
  you through the window in it. The **Guide** button brings it back.

## 1.0.0 — 2026-11-25

- First release: a table of channels against versions, and one export that renders them all with
  LUNA's own export.
- Ten versions ready (Mix, Instrumental, A cappella, TV mix, Vocal ±1 dB, stems of Drums, Bass,
  Music and Vocals) and your own with **+**.
- Click a cell to mute or unmute, Alt-click for +1 / −1 dB (on the channel's trim).
- Groups guessed from channel names in several languages, changeable per channel.
- Tick which versions to export (All / None).
- Save to the session's export folder or to a folder you choose.
- Whole song with tail, selection, or marker to marker; offline or real time; progress, Stop and
  Open folder.
- Mutes, solos and trims put back after the export; Restore session after an interruption.
- Dark and grey themes, seven colours, 7 languages, Alt-click the version for a support report.
