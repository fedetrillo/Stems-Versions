// Stems & Versions: the pure part. Which group a channel belongs to, the built-in versions, what a
// version asks of each channel, and the file names. No LUNA calls here.

(function (root) {
  // Groups, in the order they are shown. 'bus' is for aux buses and folders: they stay on in every
  // built-in version, because a muted track sends nothing to them anyway.
  const GROUPS = ['drums', 'bass', 'music', 'lead', 'bv', 'fx', 'bus'];

  // Guessing a track's group from its name (several languages). Order matters: backing vocals
  // before lead vocals, since "backing vocal" also says "vocal".
  const RULES = [
    ['bv', /\b(bv|bvs|bgv|bgvs|backing|backs?|coros?|cor|choir|ch(oe|œ)urs?|harm(ony|onies)?|dbl|double|dobles?|ad.?libs?|chorus vox|voces? de fondo)\b/i],
    ['lead', /\b(lead|ld|lv|main ?vox|vox|vocals?|voz|veu|voix|voce|stimme|gesang|voice|singer|cantante|rap|verse vox)\b/i],
    ['drums', /\b(kick|kik|bd|bassdrum|snare|snr|sn|sd|toms?|tom ?\d|hh|hats?|hi.?hats?|oh|ohs|overheads?|rooms?|amb|drums?|kit|perc|percussion|percusi[oó]n|cymbals?|ride|crash|clap|claps|bombo|caja|platos|bater[ií]a|shaker|tamb(ourine)?|conga|bongo|cajon|caj[oó]n|loop)\b/i],
    ['bass', /\b(bass|bajo|baix|basse|basso|bassline|sub|808|contrabajo|upright)\b/i],
    ['fx', /\b(fx|sfx|riser|risers|sweep|impact|hit|whoosh|noise|efectos?|ambience|atmo)\b/i],
  ];
  const INSTR = /\b(gtrs?|guitars?|guitarra|guitare|chitarra|gitarre|synths?|keys|piano|organ|[oó]rgano|strings|cuerdas|brass|sax|horns?|violin|cello|pad|pads|pluck|arp|bells?)\b/i;
  // Names are matched as words; separators like _ - . become spaces, and digits are split off.
  const words = (name) => String(name ?? '').replace(/[_\-.]+/g, ' ').replace(/([a-z])(\d)/gi, '$1 $2');
  function groupOf(name, isBus = false) {
    if (isBus) return 'bus';
    const w = words(name);
    // "Lead guitar", "Synth lead": an instrument named in it means it is not a voice.
    const instrument = INSTR.test(w);
    for (const [g, re] of RULES) if (!(instrument && (g === 'lead' || g === 'bv')) && re.test(w)) return g;
    return 'music';
  }

  const ALL_OFF = (keep) => Object.fromEntries(GROUPS.map((g) => [g, g === 'bus' || keep.includes(g) ? 'on' : 'off']));
  // The ten versions every session starts with. `groups` says what each group does; a cell the
  // user clicks is kept in `cells` and wins over its group.
  const BUILTINS = [
    { id: 'mix', groups: {} },
    { id: 'inst', groups: { lead: 'off', bv: 'off' } },
    { id: 'acap', groups: ALL_OFF(['lead', 'bv']) },
    { id: 'tv', groups: { lead: 'off' } },
    { id: 'up', groups: { lead: 1 } },
    { id: 'down', groups: { lead: -1 } },
    { id: 'sDrums', groups: ALL_OFF(['drums']) },
    { id: 'sBass', groups: ALL_OFF(['bass']) },
    { id: 'sMusic', groups: ALL_OFF(['music', 'fx']) },
    { id: 'sVox', groups: ALL_OFF(['lead', 'bv']) },
  ];
  const defaults = () => BUILTINS.map((b) => ({ id: b.id, builtin: true, on: true, groups: { ...b.groups }, cells: {} }));

  // What `version` does to a channel: 'on', 'off', or a number of dB to add.
  function stateOf(version, row) {
    const c = version.cells?.[row.id];
    if (c !== undefined) return c;
    return version.groups?.[row.group] ?? 'on';
  }
  // The next state for a click: on <-> off; with Alt, on -> +1 -> -1 -> on.
  function nextState(cur, alt) {
    if (!alt) return cur === 'off' ? 'on' : 'off';
    if (cur === 'off' || cur === 'on') return 1;
    if (cur > 0) return -1;
    return 'on';
  }
  function setCell(version, row, value) {
    const byGroup = version.groups?.[row.group] ?? 'on';
    if (value === byGroup) delete version.cells[row.id];
    else version.cells[row.id] = value;
  }

  // What to write for one version: per channel, its mute and its trim, from how it was before.
  // A channel muted in the mix stays muted; solos are all cleared so mutes decide what plays.
  function plan(version, rows, orig) {
    const out = [];
    for (const row of rows) {
      const o = orig[row.id];
      if (!o) continue;
      const st = stateOf(version, row);
      const mute = o.m || st === 'off';
      const trim = typeof st === 'number' && o.t !== null ? o.t + st : o.t;
      out.push({ id: row.id, mute, solo: false, trim });
    }
    return out;
  }

  // A file name LUNA can write: no path separators or characters Windows refuses.
  const safe = (s) => String(s ?? '').replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').trim().slice(0, 120) || 'Untitled';
  const fileName = (song, version) => safe(`${song} - ${version}`);

  // How many channels sound in `version` (for the header tooltip).
  const sounding = (version, rows, orig) => rows.filter((r) => !orig?.[r.id]?.m && stateOf(version, r) !== 'off').length;

  root.SVLogic = { GROUPS, BUILTINS, defaults, groupOf, stateOf, nextState, setCell, plan, fileName, safe, sounding };
})(typeof window !== 'undefined' ? window : globalThis);
