// Stems & Versions: a table of the session's channels against the versions to deliver (mix,
// instrumental, a cappella, TV mix, vocal up and down, stems), and an export that renders each
// one in turn with LUNA's own export, putting mutes, solos and trims back afterwards.
// The pure part (groups, versions, plans, names) lives in logic.js.

(() => {
  const $ = (id) => document.getElementById(id);
  const L = window.SVLogic;
  const VERSION = '1.0.2';
  const KEY = 'com.fedetrillo.stemsversions.';
  const store = {
    get: (k) => { try { return JSON.parse(localStorage.getItem(KEY + k)); } catch { return null; } },
    set: (k, v) => { try { if (v === null) localStorage.removeItem(KEY + k); else localStorage.setItem(KEY + k, JSON.stringify(v)); } catch { /* not fatal */ } },
  };

  const I18N = {
    en: {
      dest: "Save to", dSession: "Session export folder", dChoose: "Choose folder…", nOf: "{n} of {m}", all: "All", none: "None",
      _name: 'English',
      song: 'Song', range: 'Range', rSong: 'Whole song', rSel: 'Selection', rMarkers: 'Markers', tail: 'Tail', render: 'Render', offline: 'Offline', realtime: 'Real time', end: 'End',
      matrix: 'Versions · what plays in each', mHint: 'Click: plays / muted · Alt-click: +1 / −1 dB', channel: 'Channel · group',
      newVersion: 'New version', newName: 'Version {n}', delete: 'Delete', include: 'Click to include or leave out of the export; double-click to rename',
      g_drums: 'Drums', g_bass: 'Bass', g_music: 'Music', g_lead: 'Lead vocal', g_bv: 'Backing vocals', g_fx: 'FX', g_bus: 'Bus',
      v_mix: 'Mix', v_inst: 'Instrumental', v_acap: 'A cappella', v_tv: 'TV mix', v_up: 'Vocal +1 dB', v_down: 'Vocal −1 dB', v_sDrums: 'Stem Drums', v_sBass: 'Stem Bass', v_sMusic: 'Stem Music', v_sVox: 'Stem Vocals',
      mutedTip: 'Muted in your mix: it stays muted in every version',
      queue: 'To export', nVersions: '{n} versions', wait: 'waiting', done: 'done', failed: 'failed', skipped: 'stopped',
      about: "Groups are guessed from the names and you can change them. When the export ends, mutes, solos and trims are back as they were.",
      go: 'Export {n} versions', go1: 'Export 1 version', stop: 'Stop', restore: 'Restore session', reveal: 'Open folder',
      exporting: 'Exporting “{v}” ({i} of {n})…', allDone: '{n} versions exported', stopped: 'Export stopped; the session is as it was', restored: 'Mutes, solos and trims are back as they were',
      noSel: 'Select a range on the timeline first', noRange: 'Nothing to export in this range', noVersions: 'Turn on at least one version', pending: 'An export was interrupted: press Restore session to put the mix back',
      error: 'Error: {e}', waiting: 'Waiting for LUNA…', noSession: 'Open a session in LUNA.', report: 'Report copied',
      dark: 'Dark', grey: 'Grey', color: 'Colour', cYellow: 'Yellow', cOrange: 'Orange', cRed: 'Red', cGreen: 'Green', cBlue: 'Blue', cPink: 'Pink', cPurple: 'Purple',
    },
    es: {
      dest: "Guardar en", dSession: "Carpeta de la sesión", dChoose: "Elegir carpeta…", nOf: "{n} de {m}", all: "Todas", none: "Ninguna",
      _name: 'Español',
      song: 'Canción', range: 'Rango', rSong: 'Canción entera', rSel: 'Selección', rMarkers: 'Marcadores', tail: 'Cola', render: 'Render', offline: 'Offline', realtime: 'Tiempo real', end: 'Final',
      matrix: 'Versiones · qué suena en cada una', mHint: 'Clic: suena / silenciada · Alt-clic: +1 / −1 dB', channel: 'Canal · grupo',
      newVersion: 'Nueva versión', newName: 'Versión {n}', delete: 'Borrar', include: 'Clic para incluirla o dejarla fuera de la exportación; doble clic para renombrar',
      g_drums: 'Batería', g_bass: 'Bajo', g_music: 'Música', g_lead: 'Voz principal', g_bv: 'Coros', g_fx: 'FX', g_bus: 'Bus',
      v_mix: 'Mezcla', v_inst: 'Instrumental', v_acap: 'A cappella', v_tv: 'TV mix', v_up: 'Voz +1 dB', v_down: 'Voz −1 dB', v_sDrums: 'Stem Batería', v_sBass: 'Stem Bajo', v_sMusic: 'Stem Música', v_sVox: 'Stem Voces',
      mutedTip: 'Silenciado en tu mezcla: sigue silenciado en todas las versiones',
      queue: 'A exportar', nVersions: '{n} versiones', wait: 'en espera', done: 'hecho', failed: 'error', skipped: 'detenido',
      about: "Los grupos se adivinan por el nombre y puedes cambiarlos. Al terminar, mutes, solos y trims vuelven a estar como estaban.",
      go: 'Exportar {n} versiones', go1: 'Exportar 1 versión', stop: 'Detener', restore: 'Restaurar sesión', reveal: 'Abrir carpeta',
      exporting: 'Exportando «{v}» ({i} de {n})…', allDone: '{n} versiones exportadas', stopped: 'Exportación detenida; la sesión está como estaba', restored: 'Mutes, solos y trims vuelven a estar como estaban',
      noSel: 'Selecciona antes un rango en la línea de tiempo', noRange: 'No hay nada que exportar en este rango', noVersions: 'Activa al menos una versión', pending: 'Una exportación se cortó: pulsa Restaurar sesión para dejar la mezcla como estaba',
      error: 'Error: {e}', waiting: 'Esperando a LUNA…', noSession: 'Abre una sesión en LUNA.', report: 'Informe copiado',
      dark: 'Oscuro', grey: 'Gris', color: 'Color', cYellow: 'Amarillo', cOrange: 'Naranja', cRed: 'Rojo', cGreen: 'Verde', cBlue: 'Azul', cPink: 'Rosa', cPurple: 'Morado',
    },
  };

  Object.assign(I18N, {"ca": { "dest": "Desar a", "dSession": "Carpeta de la sessió", "dChoose": "Triar carpeta…", "nOf": "{n} de {m}", "all": "Totes", "none": "Cap","_name": "Català", "song": "Cançó", "range": "Rang", "rSong": "Cançó sencera", "rSel": "Selecció", "rMarkers": "Marcadors", "tail": "Cua", "render": "Render", "offline": "Offline", "realtime": "Temps real", "end": "Final", "matrix": "Versions · què sona a cadascuna", "mHint": "Clic: sona / silenciada · Alt-clic: +1 / −1 dB", "channel": "Canal · grup", "newVersion": "Nova versió", "newName": "Versió {n}", "delete": "Esborrar", "include": "Clic per incloure-la o deixar-la fora de l’exportació; doble clic per canviar-ne el nom", "g_drums": "Bateria", "g_bass": "Baix", "g_music": "Música", "g_lead": "Veu principal", "g_bv": "Cors", "g_fx": "FX", "g_bus": "Bus", "v_mix": "Mescla", "v_inst": "Instrumental", "v_acap": "A cappella", "v_tv": "TV mix", "v_up": "Veu +1 dB", "v_down": "Veu −1 dB", "v_sDrums": "Stem Bateria", "v_sBass": "Stem Baix", "v_sMusic": "Stem Música", "v_sVox": "Stem Veus", "mutedTip": "Silenciat a la teva mescla: continua silenciat a totes les versions", "queue": "A exportar", "nVersions": "{n} versions", "wait": "en espera", "done": "fet", "failed": "error", "skipped": "aturat", "about": "Els grups s’endevinen pel nom i els pots canviar. En acabar, mutes, solos i trims tornen a estar com estaven.", "go": "Exportar {n} versions", "go1": "Exportar 1 versió", "stop": "Aturar", "restore": "Restaurar sessió", "reveal": "Obrir carpeta", "exporting": "Exportant «{v}» ({i} de {n})…", "allDone": "{n} versions exportades", "stopped": "Exportació aturada; la sessió és com era", "restored": "Mutes, solos i trims tornen a estar com estaven", "noSel": "Selecciona abans un rang a la línia de temps", "noRange": "No hi ha res a exportar en aquest rang", "noVersions": "Activa almenys una versió", "pending": "Una exportació es va tallar: prem Restaurar sessió per deixar la mescla com era", "error": "Error: {e}", "waiting": "Esperant LUNA…", "noSession": "Obre una sessió a LUNA.", "report": "Informe copiat", "dark": "Fosc", "grey": "Gris", "color": "Color", "cYellow": "Groc", "cOrange": "Taronja", "cRed": "Vermell", "cGreen": "Verd", "cBlue": "Blau", "cPink": "Rosa", "cPurple": "Morat"}, "fr": { "dest": "Enregistrer dans", "dSession": "Dossier de la session", "dChoose": "Choisir un dossier…", "nOf": "{n} sur {m}", "all": "Toutes", "none": "Aucune","_name": "Français", "song": "Morceau", "range": "Plage", "rSong": "Morceau entier", "rSel": "Sélection", "rMarkers": "Marqueurs", "tail": "Queue", "render": "Rendu", "offline": "Hors ligne", "realtime": "Temps réel", "end": "Fin", "matrix": "Versions · ce qui joue dans chacune", "mHint": "Clic : joue / muet · Alt-clic : +1 / −1 dB", "channel": "Canal · groupe", "newVersion": "Nouvelle version", "newName": "Version {n}", "delete": "Supprimer", "include": "Clic pour l’inclure ou l’exclure de l’export ; double-clic pour la renommer", "g_drums": "Batterie", "g_bass": "Basse", "g_music": "Musique", "g_lead": "Voix lead", "g_bv": "Chœurs", "g_fx": "FX", "g_bus": "Bus", "v_mix": "Mix", "v_inst": "Instrumental", "v_acap": "A cappella", "v_tv": "TV mix", "v_up": "Voix +1 dB", "v_down": "Voix −1 dB", "v_sDrums": "Stem Batterie", "v_sBass": "Stem Basse", "v_sMusic": "Stem Musique", "v_sVox": "Stem Voix", "mutedTip": "Muet dans votre mix : il reste muet dans toutes les versions", "queue": "À exporter", "nVersions": "{n} versions", "wait": "en attente", "done": "terminé", "failed": "erreur", "skipped": "arrêté", "about": "Les groupes sont devinés d’après les noms et vous pouvez les changer. À la fin, mutes, solos et trims reviennent comme avant.", "go": "Exporter {n} versions", "go1": "Exporter 1 version", "stop": "Arrêter", "restore": "Restaurer la session", "reveal": "Ouvrir le dossier", "exporting": "Export de « {v} » ({i} sur {n})…", "allDone": "{n} versions exportées", "stopped": "Export arrêté ; la session est comme avant", "restored": "Mutes, solos et trims sont revenus comme avant", "noSel": "Sélectionnez d’abord une plage sur la timeline", "noRange": "Rien à exporter dans cette plage", "noVersions": "Activez au moins une version", "pending": "Un export a été interrompu : appuyez sur Restaurer la session pour remettre le mix", "error": "Erreur : {e}", "waiting": "En attente de LUNA…", "noSession": "Ouvrez une session dans LUNA.", "report": "Rapport copié", "dark": "Sombre", "grey": "Gris", "color": "Couleur", "cYellow": "Jaune", "cOrange": "Orange", "cRed": "Rouge", "cGreen": "Vert", "cBlue": "Bleu", "cPink": "Rose", "cPurple": "Violet"}, "de": { "dest": "Speichern in", "dSession": "Session-Ordner", "dChoose": "Ordner wählen…", "nOf": "{n} von {m}", "all": "Alle", "none": "Keine","_name": "Deutsch", "song": "Song", "range": "Bereich", "rSong": "Ganzer Song", "rSel": "Auswahl", "rMarkers": "Marker", "tail": "Ausklang", "render": "Render", "offline": "Offline", "realtime": "Echtzeit", "end": "Ende", "matrix": "Versionen · was in jeder spielt", "mHint": "Klick: spielt / stumm · Alt-Klick: +1 / −1 dB", "channel": "Kanal · Gruppe", "newVersion": "Neue Version", "newName": "Version {n}", "delete": "Löschen", "include": "Klick: in den Export aufnehmen oder auslassen; Doppelklick: umbenennen", "g_drums": "Drums", "g_bass": "Bass", "g_music": "Musik", "g_lead": "Leadgesang", "g_bv": "Chöre", "g_fx": "FX", "g_bus": "Bus", "v_mix": "Mix", "v_inst": "Instrumental", "v_acap": "A cappella", "v_tv": "TV-Mix", "v_up": "Gesang +1 dB", "v_down": "Gesang −1 dB", "v_sDrums": "Stem Drums", "v_sBass": "Stem Bass", "v_sMusic": "Stem Musik", "v_sVox": "Stem Gesang", "mutedTip": "In deinem Mix stumm: bleibt in allen Versionen stumm", "queue": "Exportieren", "nVersions": "{n} Versionen", "wait": "wartet", "done": "fertig", "failed": "Fehler", "skipped": "gestoppt", "about": "Die Gruppen werden aus den Namen erraten und lassen sich ändern. Danach sind Mutes, Solos und Trims wieder wie vorher.", "go": "{n} Versionen exportieren", "go1": "1 Version exportieren", "stop": "Stoppen", "restore": "Session wiederherstellen", "reveal": "Ordner öffnen", "exporting": "Exportiere „{v}“ ({i} von {n})…", "allDone": "{n} Versionen exportiert", "stopped": "Export gestoppt; die Session ist wie vorher", "restored": "Mutes, Solos und Trims sind wieder wie vorher", "noSel": "Wähle zuerst einen Bereich in der Timeline", "noRange": "In diesem Bereich gibt es nichts zu exportieren", "noVersions": "Schalte mindestens eine Version ein", "pending": "Ein Export wurde unterbrochen: Session wiederherstellen stellt den Mix zurück", "error": "Fehler: {e}", "waiting": "Warte auf LUNA…", "noSession": "Öffne eine Session in LUNA.", "report": "Bericht kopiert", "dark": "Dunkel", "grey": "Grau", "color": "Farbe", "cYellow": "Gelb", "cOrange": "Orange", "cRed": "Rot", "cGreen": "Grün", "cBlue": "Blau", "cPink": "Pink", "cPurple": "Lila"}, "it": { "dest": "Salva in", "dSession": "Cartella della sessione", "dChoose": "Scegli cartella…", "nOf": "{n} di {m}", "all": "Tutte", "none": "Nessuna","_name": "Italiano", "song": "Brano", "range": "Intervallo", "rSong": "Brano intero", "rSel": "Selezione", "rMarkers": "Marker", "tail": "Coda", "render": "Render", "offline": "Offline", "realtime": "Tempo reale", "end": "Fine", "matrix": "Versioni · cosa suona in ognuna", "mHint": "Clic: suona / muto · Alt-clic: +1 / −1 dB", "channel": "Canale · gruppo", "newVersion": "Nuova versione", "newName": "Versione {n}", "delete": "Elimina", "include": "Clic per includerla o escluderla dall’esportazione; doppio clic per rinominarla", "g_drums": "Batteria", "g_bass": "Basso", "g_music": "Musica", "g_lead": "Voce solista", "g_bv": "Cori", "g_fx": "FX", "g_bus": "Bus", "v_mix": "Mix", "v_inst": "Strumentale", "v_acap": "A cappella", "v_tv": "TV mix", "v_up": "Voce +1 dB", "v_down": "Voce −1 dB", "v_sDrums": "Stem Batteria", "v_sBass": "Stem Basso", "v_sMusic": "Stem Musica", "v_sVox": "Stem Voci", "mutedTip": "Muto nel tuo mix: resta muto in tutte le versioni", "queue": "Da esportare", "nVersions": "{n} versioni", "wait": "in attesa", "done": "fatto", "failed": "errore", "skipped": "fermato", "about": "I gruppi si deducono dai nomi e puoi cambiarli. Alla fine, mute, solo e trim tornano come prima.", "go": "Esporta {n} versioni", "go1": "Esporta 1 versione", "stop": "Ferma", "restore": "Ripristina sessione", "reveal": "Apri cartella", "exporting": "Esportazione di «{v}» ({i} di {n})…", "allDone": "{n} versioni esportate", "stopped": "Esportazione fermata; la sessione è com’era", "restored": "Mute, solo e trim sono tornati come prima", "noSel": "Seleziona prima un intervallo sulla timeline", "noRange": "Niente da esportare in questo intervallo", "noVersions": "Attiva almeno una versione", "pending": "Un’esportazione si è interrotta: premi Ripristina sessione per rimettere il mix", "error": "Errore: {e}", "waiting": "In attesa di LUNA…", "noSession": "Apri una sessione in LUNA.", "report": "Rapporto copiato", "dark": "Scuro", "grey": "Grigio", "color": "Colore", "cYellow": "Giallo", "cOrange": "Arancione", "cRed": "Rosso", "cGreen": "Verde", "cBlue": "Blu", "cPink": "Rosa", "cPurple": "Viola"}, "pt": { "dest": "Guardar em", "dSession": "Pasta da sessão", "dChoose": "Escolher pasta…", "nOf": "{n} de {m}", "all": "Todas", "none": "Nenhuma","_name": "Português", "song": "Canção", "range": "Intervalo", "rSong": "Canção inteira", "rSel": "Seleção", "rMarkers": "Marcadores", "tail": "Cauda", "render": "Render", "offline": "Offline", "realtime": "Tempo real", "end": "Fim", "matrix": "Versões · o que toca em cada uma", "mHint": "Clique: toca / silenciada · Alt-clique: +1 / −1 dB", "channel": "Canal · grupo", "newVersion": "Nova versão", "newName": "Versão {n}", "delete": "Apagar", "include": "Clique para a incluir ou deixar fora da exportação; duplo clique para mudar o nome", "g_drums": "Bateria", "g_bass": "Baixo", "g_music": "Música", "g_lead": "Voz principal", "g_bv": "Coros", "g_fx": "FX", "g_bus": "Bus", "v_mix": "Mistura", "v_inst": "Instrumental", "v_acap": "A cappella", "v_tv": "TV mix", "v_up": "Voz +1 dB", "v_down": "Voz −1 dB", "v_sDrums": "Stem Bateria", "v_sBass": "Stem Baixo", "v_sMusic": "Stem Música", "v_sVox": "Stem Vozes", "mutedTip": "Silenciado na tua mistura: continua silenciado em todas as versões", "queue": "A exportar", "nVersions": "{n} versões", "wait": "em espera", "done": "feito", "failed": "erro", "skipped": "parado", "about": "Os grupos são adivinhados pelo nome e podes mudá-los. No fim, mutes, solos e trims voltam a estar como estavam.", "go": "Exportar {n} versões", "go1": "Exportar 1 versão", "stop": "Parar", "restore": "Restaurar sessão", "reveal": "Abrir pasta", "exporting": "A exportar «{v}» ({i} de {n})…", "allDone": "{n} versões exportadas", "stopped": "Exportação parada; a sessão está como estava", "restored": "Mutes, solos e trims voltaram a estar como estavam", "noSel": "Seleciona primeiro um intervalo na timeline", "noRange": "Não há nada para exportar neste intervalo", "noVersions": "Ativa pelo menos uma versão", "pending": "Uma exportação foi interrompida: carrega em Restaurar sessão para repor a mistura", "error": "Erro: {e}", "waiting": "À espera do LUNA…", "noSession": "Abre uma sessão no LUNA.", "report": "Relatório copiado", "dark": "Escuro", "grey": "Cinzento", "color": "Cor", "cYellow": "Amarelo", "cOrange": "Laranja", "cRed": "Vermelho", "cGreen": "Verde", "cBlue": "Azul", "cPink": "Rosa", "cPurple": "Roxo"}});

  let lang = store.get('lang') ?? (() => { for (const l of navigator.languages ?? [navigator.language]) { const c = String(l || '').slice(0, 2).toLowerCase(); if (I18N[c]) return c; } return 'en'; })();
  if (!I18N[lang]) lang = 'en';
  const t = (k, v = {}) => String(I18N[lang]?.[k] ?? I18N.en[k] ?? k).replace(/\{(\w+)\}/g, (m, x) => (x in v ? String(v[x]) : m));
  const COLORS = ['yellow', 'orange', 'red', 'green', 'blue', 'pink', 'purple'];

  // The guide: its texts, in every language.
  for (const [c, v] of Object.entries({"en": {"help": "Quick guide", "helpBtn": "Guide", "tNext": "Next", "tBack": "Back", "tSkip": "Skip", "tDone": "Got it", "langT": "Choose your language", "langX": "The guide and the whole window will use it. You can change it later here, at the top right.", "zt": "Always at hand", "z": "Open this guide again whenever you need it with the Guide button.", "q1t": "What to export", "q1": "Name the song for the file names, choose the range (whole song, a selection or between two markers), how much tail to leave and whether to render offline or in real time.", "q2t": "What plays in each version", "q2": "One row per channel, grouped by name; one column per version. Click a cell to make it play or mute, Alt-click for +1 / −1 dB. Click a version name to leave it out, double-click to rename it, and + adds your own.", "q3t": "Pick the versions", "q3": "Tick the versions you want this time, or use All and None. While exporting, each one shows how it is going.", "q4t": "Export", "q4": "Choose where the files go (the session folder or any folder) and press Export. When it finishes, your mutes, solos and trims are back as they were; if an export is cut off, Restore session puts them back."}, "es": {"help": "Guía rápida", "helpBtn": "Guía", "tNext": "Siguiente", "tBack": "Atrás", "tSkip": "Saltar", "tDone": "Entendido", "langT": "Elige tu idioma", "langX": "La guía y toda la ventana lo usarán. Puedes cambiarlo luego aquí, arriba a la derecha.", "zt": "Siempre a mano", "z": "Vuelve a esta guía cuando la necesites con el botón Guía.", "q1t": "Qué exportar", "q1": "Pon el nombre de la canción para los archivos, elige el rango (canción entera, una selección o entre dos marcadores), cuánta cola dejar y si renderizar offline o en tiempo real.", "q2t": "Qué suena en cada versión", "q2": "Una fila por canal, agrupados por nombre; una columna por versión. Clic en una casilla para que suene o se silencie, Alt-clic para +1 / −1 dB. Clic en el nombre de una versión para dejarla fuera, doble clic para renombrarla, y + añade las tuyas.", "q3t": "Elige las versiones", "q3": "Marca las versiones que quieres esta vez, o usa Todas y Ninguna. Mientras exporta, cada una muestra cómo va.", "q4t": "Exporta", "q4": "Elige dónde van los archivos (la carpeta de la sesión o la que quieras) y pulsa Exportar. Al acabar, tus mutes, solos y trims vuelven a estar como estaban; si una exportación se corta, Restaurar sesión los deja como estaban."}, "ca": {"help": "Guia ràpida", "helpBtn": "Guia", "tNext": "Següent", "tBack": "Enrere", "tSkip": "Saltar", "tDone": "Entesos", "langT": "Tria el teu idioma", "langX": "La guia i tota la finestra el faran servir. El pots canviar després aquí, a dalt a la dreta.", "zt": "Sempre a mà", "z": "Torna a aquesta guia quan la necessitis amb el botó Guia.", "q1t": "Què exportar", "q1": "Posa el nom de la cançó per als fitxers, tria el rang (cançó sencera, una selecció o entre dos marcadors), quanta cua deixar i si renderitzar offline o en temps real.", "q2t": "Què sona a cada versió", "q2": "Una fila per canal, agrupats pel nom; una columna per versió. Clic en una casella perquè soni o se silenciï, Alt-clic per +1 / −1 dB. Clic al nom d’una versió per deixar-la fora, doble clic per canviar-ne el nom, i + n’afegeix de teves.", "q3t": "Tria les versions", "q3": "Marca les versions que vols aquesta vegada, o fes servir Totes i Cap. Mentre exporta, cadascuna mostra com va.", "q4t": "Exporta", "q4": "Tria on van els fitxers (la carpeta de la sessió o la que vulguis) i prem Exportar. En acabar, els teus mutes, solos i trims tornen a estar com estaven; si una exportació es talla, Restaurar sessió els deixa com eren."}, "fr": {"help": "Guide rapide", "helpBtn": "Guide", "tNext": "Suivant", "tBack": "Retour", "tSkip": "Passer", "tDone": "Compris", "langT": "Choisissez votre langue", "langX": "Le guide et toute la fenêtre l’utiliseront. Vous pourrez la changer ici, en haut à droite.", "zt": "Toujours à portée", "z": "Rouvrez ce guide quand vous voulez avec le bouton Guide.", "q1t": "Quoi exporter", "q1": "Donnez le nom du morceau pour les fichiers, choisissez la plage (morceau entier, une sélection ou entre deux marqueurs), la queue à laisser et le rendu hors ligne ou en temps réel.", "q2t": "Ce qui joue dans chaque version", "q2": "Une ligne par canal, groupés d’après leur nom ; une colonne par version. Cliquez une case pour la faire jouer ou la couper, Alt-clic pour +1 / −1 dB. Cliquez le nom d’une version pour l’exclure, double-cliquez pour la renommer, et + ajoute les vôtres.", "q3t": "Choisissez les versions", "q3": "Cochez les versions voulues cette fois, ou utilisez Toutes et Aucune. Pendant l’export, chacune montre où elle en est.", "q4t": "Exportez", "q4": "Choisissez où vont les fichiers (le dossier de la session ou un autre) et appuyez sur Exporter. À la fin, vos mutes, solos et trims reviennent comme avant ; si un export est interrompu, Restaurer la session les remet."}, "de": {"help": "Kurzanleitung", "helpBtn": "Anleitung", "tNext": "Weiter", "tBack": "Zurück", "tSkip": "Überspringen", "tDone": "Verstanden", "langT": "Wähle deine Sprache", "langX": "Die Anleitung und das ganze Fenster verwenden sie. Du kannst sie später hier oben rechts ändern.", "zt": "Immer zur Hand", "z": "Öffne diese Anleitung jederzeit wieder mit dem Button Anleitung.", "q1t": "Was exportiert wird", "q1": "Gib den Songnamen für die Dateinamen ein, wähle den Bereich (ganzer Song, eine Auswahl oder zwischen zwei Markern), wie viel Ausklang bleibt und ob offline oder in Echtzeit gerendert wird.", "q2t": "Was in jeder Version spielt", "q2": "Eine Zeile pro Kanal, nach Namen gruppiert; eine Spalte pro Version. Klick auf ein Feld: spielt oder stumm, Alt-Klick: +1 / −1 dB. Klick auf einen Versionsnamen lässt sie aus, Doppelklick benennt sie um, und + fügt eigene hinzu.", "q3t": "Versionen wählen", "q3": "Hake die Versionen an, die du diesmal brauchst, oder nimm Alle und Keine. Beim Export zeigt jede, wie es läuft.", "q4t": "Exportieren", "q4": "Wähle, wohin die Dateien kommen (Session-Ordner oder ein beliebiger Ordner), und drücke Exportieren. Danach sind Mutes, Solos und Trims wieder wie vorher; bricht ein Export ab, stellt Session wiederherstellen sie zurück."}, "it": {"help": "Guida rapida", "helpBtn": "Guida", "tNext": "Avanti", "tBack": "Indietro", "tSkip": "Salta", "tDone": "Capito", "langT": "Scegli la tua lingua", "langX": "La guida e tutta la finestra la useranno. Puoi cambiarla poi qui, in alto a destra.", "zt": "Sempre a portata di mano", "z": "Riapri questa guida quando ti serve con il pulsante Guida.", "q1t": "Cosa esportare", "q1": "Scrivi il nome del brano per i file, scegli l’intervallo (brano intero, una selezione o tra due marker), quanta coda lasciare e se renderizzare offline o in tempo reale.", "q2t": "Cosa suona in ogni versione", "q2": "Una riga per canale, raggruppati per nome; una colonna per versione. Clic su una casella per farla suonare o silenziarla, Alt-clic per +1 / −1 dB. Clic sul nome di una versione per escluderla, doppio clic per rinominarla, e + aggiunge le tue.", "q3t": "Scegli le versioni", "q3": "Spunta le versioni che ti servono questa volta, o usa Tutte e Nessuna. Durante l’esportazione ognuna mostra come procede.", "q4t": "Esporta", "q4": "Scegli dove vanno i file (la cartella della sessione o quella che vuoi) e premi Esporta. Alla fine mute, solo e trim tornano come prima; se un’esportazione si interrompe, Ripristina sessione li rimette."}, "pt": {"help": "Guia rápido", "helpBtn": "Guia", "tNext": "Seguinte", "tBack": "Voltar", "tSkip": "Saltar", "tDone": "Percebi", "langT": "Escolhe o teu idioma", "langX": "O guia e toda a janela vão usá-lo. Podes mudá-lo depois aqui, em cima à direita.", "zt": "Sempre à mão", "z": "Volta a este guia quando precisares com o botão Guia.", "q1t": "O que exportar", "q1": "Escreve o nome da canção para os ficheiros, escolhe o intervalo (canção inteira, uma seleção ou entre dois marcadores), quanta cauda deixar e se renderizar offline ou em tempo real.", "q2t": "O que toca em cada versão", "q2": "Uma linha por canal, agrupados pelo nome; uma coluna por versão. Clica numa casa para tocar ou silenciar, Alt-clique para +1 / −1 dB. Clica no nome de uma versão para a deixar de fora, duplo clique para mudar o nome, e + acrescenta as tuas.", "q3t": "Escolhe as versões", "q3": "Marca as versões que queres desta vez, ou usa Todas e Nenhuma. Durante a exportação, cada uma mostra como vai.", "q4t": "Exporta", "q4": "Escolhe para onde vão os ficheiros (a pasta da sessão ou outra) e carrega em Exportar. No fim, mutes, solos e trims voltam a estar como estavam; se uma exportação for interrompida, Restaurar sessão repõe-nos."}})) Object.assign(I18N[c], v);
  let tour = null;
  let theme = store.get('theme') === 'grey' ? 'grey' : 'dark';
  let color = COLORS.includes(store.get('color')) ? store.get('color') : 'blue';
  let statusTimer;
  const say = (key, vars = {}, kind = '', ms = 0) => { clearTimeout(statusTimer); $('status').textContent = key ? t(key, vars) : ''; $('status').className = `status ${kind}`; if (ms) statusTimer = setTimeout(() => say(null), ms); };
  const log = [];
  const note = (what, extra = {}) => { log.push({ t: new Date().toISOString().slice(11, 23), what, ...extra }); if (log.length > 200) log.shift(); };
  const errText = (e) => String(e?.message || e);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const cssColor = (argb) => (typeof argb === 'number' ? `#${(argb & 0xffffff).toString(16).padStart(6, '0')}` : null);

  const opts = { range: 'song', tail: 2, render: 'offline', mkFrom: 0, mkTo: -1, dest: 'session', folder: '', ...(store.get('opts') ?? {}) };
  const saveOpts = () => store.set('opts', opts);

  // Set by build() for the open session.
  let app = null;

  function seg(el, items, cur, onPick) {
    el.replaceChildren(...items.map(([v, label]) => {
      const b = Object.assign(document.createElement('button'), { textContent: label });
      b.classList.toggle('on', v === cur);
      b.onclick = () => onPick(v);
      return b;
    }));
    return el;
  }
  const baseName = (p) => String(p).split(/[\\/]/).filter(Boolean).pop() || p;
  // The destination: the session's export folder (LUNA's own export), or a folder you choose (the
  // main bus is bounced straight into it). Choosing a folder again always asks.
  async function pickDest(v) {
    if (v === 'session') { opts.dest = 'session'; saveOpts(); paintStatic(); return; }
    if (!luna?.gui) return;
    try {
      const [folder] = await luna.gui.chooseFolders({ title: t('dChoose'), defaultPath: opts.folder || undefined });
      if (folder) { opts.folder = folder; opts.dest = 'folder'; saveOpts(); }
    } catch (e) { say('error', { e: errText(e) }, 'bad', 6000); }
    paintStatic();
  }
  const closeColors = () => { $('colorMenu').hidden = true; $('colorBtn').classList.remove('open'); };

  function paintStatic() {
    document.documentElement.lang = lang;
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.color = color;
    $('ver').textContent = `v${VERSION}`;
    $('lang').replaceChildren(...Object.keys(I18N).map((c) => Object.assign(document.createElement('option'), { value: c, textContent: I18N[c]._name })));
    $('lang').value = lang;
    for (const [id, name] of [['tDark', 'dark'], ['tGrey', 'grey']]) { $(id).classList.toggle('on', theme === name); $(id).title = t(name); }
    $('colorBtn').title = t('color'); $('help').title = t('help'); { const q = document.createElement('b'); q.textContent = '?'; const sp = document.createElement('span'); sp.textContent = t('helpBtn'); $('help').replaceChildren(q, sp); }
    $('colorMenu').replaceChildren(...COLORS.map((c) => {
      const b = document.createElement('button');
      b.className = c === color ? 'on' : '';
      b.innerHTML = `<i class="sw" data-color="${c}" data-theme="${theme}"></i><span></span><svg viewBox="0 0 12 12"><path d="M2.5 6.5L5 9L9.5 3.5"/></svg>`;
      b.querySelector('span').textContent = t(`c${c[0].toUpperCase()}${c.slice(1)}`);
      b.onclick = () => { color = c; store.set('color', c); closeColors(); paintStatic(); };
      return b;
    }));
    $('songLbl').textContent = t('song'); $('rangeLbl').textContent = t('range'); $('tailLbl').textContent = t('tail'); $('renderLbl').textContent = t('render');
    seg($('range'), [['song', t('rSong')], ['sel', t('rSel')], ['markers', t('rMarkers')]], opts.range, (v) => { opts.range = v; saveOpts(); paintStatic(); });
    seg($('tail'), [[0, '0 s'], [2, '2 s'], [4, '4 s'], [8, '8 s']], opts.tail, (v) => { opts.tail = v; saveOpts(); paintStatic(); });
    seg($('render'), [['offline', t('offline')], ['realtime', t('realtime')]], opts.render, (v) => { opts.render = v; saveOpts(); paintStatic(); });
    $('destLbl').textContent = t('dest');
    seg($('dest'), [['session', t('dSession')], ['folder', opts.folder ? baseName(opts.folder) : t('dChoose')]], opts.dest, (v) => void pickDest(v));
    const db = $('dest').lastChild; if (db) db.title = opts.folder || t('dChoose');
    $('tailBox').hidden = opts.range === 'sel';
    $('mk').hidden = opts.range !== 'markers';
    $('mTitle').textContent = t('matrix'); $('mHint').textContent = t('mHint');
    $('qTitle').textContent = t('queue');
    $('about').textContent = t('about');
    $('restore').textContent = t('restore'); $('reveal').textContent = t('reveal');
    app?.paint();
  }
  $('lang').onchange = () => { lang = $('lang').value; store.set('lang', lang); paintStatic(); };
  for (const b of [$('tDark'), $('tGrey')]) b.onclick = () => { theme = b.dataset.t; store.set('theme', theme); paintStatic(); };
  $('colorBtn').onclick = (ev) => { ev.stopPropagation(); const open = $('colorMenu').hidden; $('colorMenu').hidden = !open; $('colorBtn').classList.toggle('open', open); };
  document.addEventListener('mousedown', (ev) => { if (!ev.target.closest?.('.colors')) closeColors(); });
  paintStatic();

  let luna, built;
  async function build() {
    const s = luna.sessions.current();
    if (s === built) return;
    built = s;
    app = null;
    if (!s) { say('noSession'); return; }
    await s.ready();
    if (s !== built) return;
    await s.musical.ready().catch(() => undefined);
    say(null);
    const ctx = s.context, tl = s.musical.timeline, TPB = Luna.TICKS_PER_BEAT;
    const skey = (k) => `${s.id}.${k}`;
    let versions = store.get(skey('versions')) ?? L.defaults();
    const groupFix = store.get(skey('groups')) ?? {};
    const saveVersions = () => store.set(skey('versions'), versions);
    let running = null;   // { stop: boolean, render }
    let lastFile = null;
    const status = new Map();   // version id -> { st, info }

    // ---- Channels ------------------------------------------------------------------------------
    const isRow = (ch) => {
      if (ch instanceof Luna.Track) return !['click', 'count_in'].includes(ch.trackType.value);
      if (ch instanceof Luna.Bus) return !ch.isMaster && String(ch.busType.value ?? 'aux') === 'aux';
      return false;
    };
    const channels = () => (s.channelsInOrder ?? [...s.tracks.items, ...s.buses.items]).filter(isRow);
    const muteOf = (ch) => (ch.main?.controls?.byId?.('mute') ? ch.mute : undefined);
    const soloOf = (ch) => (ch.main?.controls?.byId?.('solo') ? ch.solo : undefined);
    const trimOf = (ch) => ch.main?.controls?.byId?.('gain_trim') ?? null;
    let rows = [];
    function readRows() {
      rows = channels().map((ch) => {
        const bus = ch instanceof Luna.Bus;
        const name = ch.name.value ?? ch.id;
        return { id: ch.id, ch, name, bus, color: cssColor(ch.color.value), group: groupFix[ch.id] ?? L.groupOf(name, bus) };
      });
    }
    async function loadRows() {
      readRows();
      await Promise.all(rows.map((r) => Promise.all([r.ch.loadStrip?.(), r.ch.controls?.load?.()]).catch(() => undefined)));
    }
    // How every channel is now: mute, solo, and trim in dB.
    function capture() {
      const o = {};
      for (const r of rows) {
        const tr = trimOf(r.ch);
        o[r.id] = { m: !!muteOf(r.ch)?.on, s: !!soloOf(r.ch)?.on, t: tr && Number.isFinite(Number(tr.real.value)) ? Number(tr.real.value) : null };
      }
      return o;
    }
    let orig = {};

    // Write mutes, solos and trims; only what differs. One undo step.
    async function applyStates(list, label) {
      const byId = new Map(rows.map((r) => [r.id, r]));
      const writes = [];
      for (const w of list) {
        const r = byId.get(w.id);
        if (!r) continue;
        const m = muteOf(r.ch), so = soloOf(r.ch), tr = trimOf(r.ch);
        if (m && m.on !== w.mute) writes.push(() => m.real.set(w.mute));
        if (so && so.on !== w.solo) writes.push(() => so.real.set(w.solo));
        if (tr && w.trim !== null && w.trim !== undefined && Math.abs(Number(tr.real.value) - w.trim) > 0.01) {
          const tp = tr.taper.value;
          if (tp) writes.push(() => tr.normalized.set(tp.toNormalized(Math.max(tp.minDb, Math.min(tp.maxDb, w.trim)))));
        }
      }
      if (!writes.length) return 0;
      const run = async () => { await Promise.all(writes.map((f) => f())); };
      if (s.transaction) await s.transaction(label, run).catch(async (e) => { note('transaction', { e: errText(e) }); await run(); });
      else await run();
      return writes.length;
    }
    const restoreList = (o) => Object.entries(o).map(([id, v]) => ({ id, mute: v.m, solo: v.s, trim: v.t }));
    async function restore(o) {
      await applyStates(restoreList(o), 'Stems & Versions: restore');
      store.set(skey('pending'), null);
      paintButtons();
    }

    // ---- Range -----------------------------------------------------------------------------------
    async function songSpan() {
      let a = Infinity, b = 0;
      for (const r of rows) {
        if (r.bus) continue;
        const lane = s.playlistFor?.(r.ch);
        if (!lane) continue;
        await lane.clips.load().catch(() => undefined);
        for (const c of lane.clips.items) { a = Math.min(a, c.start.value); b = Math.max(b, c.stop.value); }
      }
      if (!(b > a)) return null;
      return { a, b };
    }
    const withTail = (tick) => (opts.tail ? tl.tickAtSeconds(tl.seconds(tick) + opts.tail) : tick);
    const startOfBar = (tick) => { try { return tl.tickAtBar(tl.barBeat(tick).bar); } catch { return tick; } };
    async function spanFor() {
      if (opts.range === 'sel') {
        const A = ctx.selectionStart.value, B = ctx.selectionStop.value;
        if (!(typeof A === 'number' && typeof B === 'number' && B > A)) return { err: 'noSel' };
        return { startTick: A, stopTick: B };
      }
      const song = await songSpan();
      if (opts.range === 'markers') {
        const ms = s.markers.sorted;
        const from = ms[opts.mkFrom]?.location.value ?? 0;
        const to = opts.mkTo >= 0 && ms[opts.mkTo] ? ms[opts.mkTo].location.value : (song ? withTail(song.b) : null);
        if (!(to > from)) return { err: 'noRange' };
        return { startTick: from, stopTick: opts.mkTo >= 0 ? to : to };
      }
      if (!song) return { err: 'noRange' };
      return { startTick: Math.max(0, startOfBar(song.a)), stopTick: withTail(song.b) };
    }
    function paintMarkers() {
      const ms = s.markers.sorted;
      const opt = (v, txt) => Object.assign(document.createElement('option'), { value: String(v), textContent: txt });
      const label = (m, i) => `${m.name.value || `#${i + 1}`} · ${Luna.formatBarBeat ? Luna.formatBarBeat(m.barBeat.value) : ''}`;
      $('mkFrom').replaceChildren(...ms.map((m, i) => opt(i, label(m, i))));
      $('mkTo').replaceChildren(...ms.map((m, i) => opt(i, label(m, i))), opt(-1, t('end')));
      if (opts.mkFrom >= ms.length) opts.mkFrom = 0;
      if (opts.mkTo >= ms.length) opts.mkTo = -1;
      $('mkFrom').value = String(opts.mkFrom); $('mkTo').value = String(opts.mkTo);
    }
    $('mkFrom').onchange = () => { opts.mkFrom = Number($('mkFrom').value); saveOpts(); };
    $('mkTo').onchange = () => { opts.mkTo = Number($('mkTo').value); saveOpts(); };

    // ---- The table ---------------------------------------------------------------------------
    const vName = (v) => (v.builtin ? t(`v_${v.id}`) : v.name);
    const enabled = () => versions.filter((v) => v.on);
    function symbol(st) {
      if (st === 'off') return '<i class="d"></i>';
      if (st === 'on') return '<i class="d on"></i>';
      return `<b class="gn">${st > 0 ? '+' : '−'}${Math.abs(st)}</b>`;
    }
    function startRename(th, v) {
      const inp = Object.assign(document.createElement('input'), { value: vName(v), maxLength: 40, spellcheck: false });
      th.style.position = 'relative';
      th.append(inp); inp.focus(); inp.select();
      const done = (ok) => {
        if (ok && inp.value.trim()) { v.name = inp.value.trim(); if (v.builtin) { v.builtin = false; } saveVersions(); }
        paint();
      };
      inp.onkeydown = (e) => { e.stopPropagation(); if (e.key === 'Enter') done(true); if (e.key === 'Escape') done(false); };
      inp.onblur = () => done(true);
      inp.onclick = (e) => e.stopPropagation();
    }
    function paintGrid() {
      const tb = $('grid');
      tb.replaceChildren();
      const hr = document.createElement('tr');
      hr.append(Object.assign(document.createElement('th'), { className: 'cap', textContent: t('channel') }));
      for (const v of versions) {
        const th = document.createElement('th');
        th.className = `v${v.on ? '' : ' off'}`;
        th.title = `${vName(v)} — ${t('include')}`;
        const sp = Object.assign(document.createElement('span'), { className: 'vl', textContent: vName(v) });
        th.append(sp);
        if (!v.builtin) {
          const x = Object.assign(document.createElement('button'), { className: 'x', textContent: '✕', title: t('delete') });
          x.onclick = (e) => { e.stopPropagation(); if (running) return; versions = versions.filter((y) => y !== v); saveVersions(); paint(); };
          th.append(x);
        }
        let clickT;
        th.onclick = () => { if (running) return; clearTimeout(clickT); clickT = setTimeout(() => { v.on = !v.on; saveVersions(); paint(); }, 220); };
        th.ondblclick = () => { if (running) return; clearTimeout(clickT); startRename(th, v); };
        hr.append(th);
      }
      const plus = document.createElement('th'); plus.className = 'plus';
      const pb = Object.assign(document.createElement('button'), { textContent: '+', title: t('newVersion') });
      pb.onclick = () => {
        if (running) return;
        const n = versions.filter((v) => !v.builtin).length + 1;
        const v = { id: `c${Date.now().toString(36)}`, builtin: false, on: true, name: t('newName', { n }), groups: {}, cells: {} };
        versions.push(v); saveVersions(); paint();
        const ths = [...$('grid').querySelectorAll('th.v')];
        const th = ths[ths.length - 1];
        th?.scrollIntoView({ inline: 'end', block: 'nearest' });
        if (th) startRename(th, v);
      };
      plus.append(pb); hr.append(plus);
      tb.append(hr);
      for (const r of rows) {
        const o = orig[r.id] ?? {};
        const tr = document.createElement('tr');
        if (o.m) tr.className = 'muted';
        const tn = document.createElement('td'); tn.className = 'tn';
        const inn = document.createElement('div'); inn.className = 'in';
        const chip = document.createElement('i'); chip.className = 'chip'; if (r.color) chip.style.background = r.color;
        const nm = Object.assign(document.createElement('span'), { className: 'nm', textContent: r.name, title: r.name });
        inn.append(chip, nm);
        if (o.m) inn.append(Object.assign(document.createElement('span'), { className: 'mb', textContent: 'M', title: t('mutedTip') }));
        const sel = document.createElement('select');
        sel.replaceChildren(...L.GROUPS.map((g) => Object.assign(document.createElement('option'), { value: g, textContent: t(`g_${g}`) })));
        sel.value = r.group;
        sel.onchange = () => { r.group = sel.value; groupFix[r.id] = sel.value; store.set(skey('groups'), groupFix); paint(); };
        inn.append(sel);
        tn.append(inn); tr.append(tn);
        for (const v of versions) {
          const td = document.createElement('td');
          td.className = `c${v.on ? '' : ' off-col'}`;
          td.innerHTML = symbol(L.stateOf(v, r));
          td.onclick = (e) => {
            if (running) return;
            L.setCell(v, r, L.nextState(L.stateOf(v, r), e.altKey));
            saveVersions(); paint();
          };
          tr.append(td);
        }
        tr.append(document.createElement('td'));
        tb.append(tr);
      }
    }
    // The versions to export: tick the ones you want; during an export each shows how it went.
    function paintQueue() {
      const list = enabled();
      $('qAll').textContent = t('all'); $('qNone').textContent = t('none');
      $('qAll').disabled = $('qNone').disabled = !!running;
      $('qlist').replaceChildren(...versions.map((v) => {
        const st = status.get(v.id);
        const d = document.createElement('label');
        d.className = `q ${v.on ? '' : 'skip'} ${st ? st.st : ''}`;
        d.innerHTML = '<input type="checkbox"><span class="qi"></span><b></b><span class="qs"></span>';
        const cb = d.querySelector('input');
        cb.checked = v.on; cb.disabled = !!running;
        cb.onchange = () => { v.on = cb.checked; saveVersions(); paint(); };
        d.querySelector('b').textContent = vName(v);
        d.querySelector('.qs').textContent = st ? (st.info || (st.st === 'wait' ? t('wait') : t(st.st === 'fail' ? 'failed' : st.st))) : '';
        return d;
      }));
    }
    $('qAll').onclick = () => { if (running) return; for (const v of versions) v.on = true; saveVersions(); paint(); };
    $('qNone').onclick = () => { if (running) return; for (const v of versions) v.on = false; saveVersions(); paint(); };
    function paintButtons() {
      const n = enabled().length;
      const go = $('go');
      go.classList.toggle('stop', !!running);
      go.textContent = running ? t('stop') : n === 1 ? t('go1') : t('go', { n });
      go.disabled = !running && n === 0;
      $('restore').disabled = !!running || !store.get(skey('pending'));
      $('reveal').disabled = !(lastFile || (opts.dest === 'folder' && opts.folder)) || !!running;
    }
    function paint() { paintGrid(); paintQueue(); paintButtons(); paintMarkers(); }

    // ---- Export ----------------------------------------------------------------------------------
    async function waitRender(render, seconds) {
      const limit = Date.now() + seconds * 1000;
      const tick = setInterval(() => { const p = render.progress?.value; if (typeof p === 'number') $('prog').style.width = `${Math.round(p * 100)}%`; }, 250);
      try {
        await render.done(Math.max(5000, limit - Date.now()));
        return 'done';
      } catch (e) {
        const msg = errText(e);
        if (/removed/i.test(msg)) return 'done';   // a quick offline render can vanish once written
        if (running?.stop) return 'stopped';
        throw e;
      } finally { clearInterval(tick); }
    }
    async function exportAll() {
      const list = enabled();
      if (!list.length) { say('noVersions', {}, 'bad', 4000); return; }
      await loadRows();
      orig = capture();
      const span = await spanFor();
      if (span.err) { say(span.err, {}, 'bad', 5000); paint(); return; }
      const song = L.safe($('song').value || s.name?.value || 'Song');
      store.set(skey('song'), $('song').value);
      store.set(skey('pending'), orig);
      running = { stop: false, render: null };
      status.clear();
      for (const v of list) status.set(v.id, { st: 'wait', info: '' });
      paint();
      const secs = Math.max(1, tl.seconds(span.stopTick) - tl.seconds(span.startTick));
      note('export', { span, secs, versions: list.map((v) => v.id), render: opts.render, dest: opts.dest, folder: opts.folder });
      let ok = 0;
      try {
        for (let i = 0; i < list.length; i++) {
          const v = list[i];
          if (running.stop) { status.set(v.id, { st: 'skipped', info: '' }); continue; }
          status.set(v.id, { st: 'run', info: '0 %' }); paintQueue();
          say('exporting', { v: vName(v), i: i + 1, n: list.length });
          $('prog').style.width = '0%';
          const t0 = Date.now();
          try {
            await applyStates(L.plan(v, rows, orig), `Stems & Versions: ${vName(v)}`);
            await sleep(400);
            let render, file;
            if (opts.dest === 'folder' && opts.folder) {
              const master = s.buses.items.find((b) => b.isMaster);
              if (!master) throw new Error('no main bus');
              file = Luna.joinPath(opts.folder, `${L.fileName(song, vName(v))}.wav`);
              ({ render } = await s.bounce({ channelUids: [master.id], outputPaths: [file], range: span, realTime: opts.render === 'realtime', recordPoint: 'post_pan' }));
            } else {
              ({ render, file } = await s.exportMain({ name: L.fileName(song, vName(v)), range: span, realTime: opts.render === 'realtime' }));
            }
            running.render = render;
            if (file) lastFile = file;
            const iv = setInterval(() => { const p = render.progress?.value; if (typeof p === 'number') { status.set(v.id, { st: 'run', info: `${Math.round(p * 100)} %` }); paintQueue(); } }, 500);
            let res;
            try { res = await waitRender(render, (opts.render === 'realtime' ? secs * 1.5 : secs) + (window.__svTimeout ?? 120)); } finally { clearInterval(iv); }
            note('rendered', { v: v.id, file, res, ms: Date.now() - t0 });
            const el = Math.round((Date.now() - t0) / 1000);
            status.set(v.id, res === 'done' ? { st: 'done', info: `${Math.floor(el / 60)}:${String(el % 60).padStart(2, '0')}` } : { st: 'skipped', info: '' });
            if (res === 'done') ok++;
          } catch (e) {
            note('failed', { v: v.id, e: errText(e) });
            status.set(v.id, { st: 'fail', info: '' });
            if (running.stop) continue;
            say('error', { e: errText(e) }, 'bad', 8000);
          }
          $('prog').style.width = '100%';
          paintQueue();
        }
      } finally {
        const stopped = running.stop;
        running = null;
        try { await restore(orig); } catch (e) { note('restore failed', { e: errText(e) }); say('pending', {}, 'bad', 10000); paint(); return; }
        paint();
        if (stopped) say('stopped', {}, 'ok', 6000);
        else if (ok) say('allDone', { n: ok }, 'ok', 8000);
      }
    }
    $('go').onclick = async () => {
      if (running) { running.stop = true; try { await running.render?.abort(); } catch { /* already over */ } return; }
      try { await exportAll(); } catch (e) { note('export failed', { e: errText(e) }); say('error', { e: errText(e) }, 'bad', 8000); running = null; paint(); }
    };
    $('restore').onclick = async () => {
      const o = store.get(skey('pending'));
      if (!o) return;
      try { await loadRows(); await restore(o); orig = capture(); paint(); say('restored', {}, 'ok', 5000); } catch (e) { say('error', { e: errText(e) }, 'bad', 8000); }
    };
    $('reveal').onclick = () => { const p = lastFile || (opts.dest === 'folder' ? opts.folder : null); if (p) luna.gui?.revealPath?.(p).catch((e) => say('error', { e: errText(e) }, 'bad', 6000)); };

    // Alt-click the version: a short report for support.
    $('ver').onclick = async (ev) => {
      if (!ev.altKey) return;
      const span = await spanFor().catch((e) => ({ err: errText(e) }));
      const text = JSON.stringify({ version: VERSION, luna: luna.version?.value ?? null, session: s.name?.value, opts, span,
        rows: rows.map((r) => ({ name: r.name, group: r.group, bus: r.bus, trim: !!trimOf(r.ch), mute: !!muteOf(r.ch), orig: orig[r.id] })),
        versions: versions.map((v) => ({ id: v.id, on: v.on, name: v.builtin ? undefined : v.name, cells: Object.keys(v.cells).length })),
        pending: !!store.get(skey('pending')), lastFile, log: log.slice(-40) }, null, 2);
      try { if (await AddOnCopy(text)) say('report', {}, 'ok', 5000); } catch { console.log(text); }
    };

    $('song').value = store.get(skey('song')) ?? s.name?.value ?? '';
    $('song').onkeydown = (e) => e.stopPropagation();
    $('song').onchange = () => store.set(skey('song'), $('song').value);
    $('song').placeholder = s.name?.value ?? '';

    app = { paint };
    await loadRows();
    orig = capture();
    paint();
    tour ??= window.AddOnTour?.attach({
      button: $('help'), key: `${KEY}tourSeen`,
      labels: () => ({ next: t('tNext'), back: t('tBack'), skip: t('tSkip'), done: t('tDone') }),
      language: {
        sel: '#lang',
        list: () => Object.keys(I18N).map((c) => [c, I18N[c]._name]),
        current: () => lang,
        set: (c) => { lang = c; store.set('lang', c); paintStatic(); },
        title: () => t('langT'), text: () => t('langX'),
      },
      steps: () => [
        { sel: '.bar', title: () => t('q1t'), text: () => t('q1') },
        { sel: '#matrix', title: () => t('q2t'), text: () => t('q2') },
        { sel: '#queue', title: () => t('q3t'), text: () => t('q3') },
        { sel: '.actions', title: () => t('q4t'), text: () => t('q4') },
        { sel: '#help', title: () => t('zt'), text: () => t('z') },
      ],
    });
    if (store.get(skey('pending'))) say('pending', {}, 'bad', 10000);
    let timer;
    const later = () => { clearTimeout(timer); timer = setTimeout(async () => { if (running) return; await loadRows(); orig = capture(); paint(); }, 300); };
    for (const c of [s.tracks, s.buses, s.markers]) { try { c.onChange?.(later); } catch { /* not observable */ } }
    window.addEventListener('focus', later);
  }

  (async () => {
    for (;;) {
      try { luna = await Luna.connect(); break; }
      catch { say('waiting'); await sleep(1500); }
    }
    Luna.bindShortcuts(luna, { onError: () => undefined });
    await luna.sessions.ready();
    luna.sessions.focused.onChange(() => void build());
    await build();
  })();
})();
