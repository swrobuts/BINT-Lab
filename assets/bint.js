/**
 * BINT-Lab · Laufzeit der Lernumgebung
 *
 * Zustaendig fuer:
 *   - Sprachumschaltung DE/EN (merkt sich die Wahl)
 *   - Kopfzeile und Kopierknopf der Codebloecke
 *   - Quiz je Lab aus data/quiz/<lab>.json (Sofortfeedback, zweiter Versuch)
 *   - Checklisten, deren Stand im Browser bleibt
 *   - Fortschrittsanzeige auf der Startseite und je Lab
 *
 * Ohne Framework, ohne Build-Schritt, ohne fremde Server: Die Seite laesst sich
 * unveraendert auf GitHub Pages legen. Die Speicherschluessel ('bi-lang',
 * 'bi-lab-progress', 'bi-lab06-dsgvo') stammen aus der ersten Fassung der
 * Umgebung und bleiben stabil, damit ein Umbau niemandem den Stand loescht.
 */

/* ------------------------------------------------------------------ Sprache */

const SPRACHSCHLUESSEL = 'bi-lang'

export function aktuelleSprache () {
  return document.documentElement.getAttribute('data-lang') === 'en' ? 'en' : 'de'
}

function lese (schluessel) {
  try { return localStorage.getItem(schluessel) } catch { return null }
}
function schreibe (schluessel, wert) {
  try { localStorage.setItem(schluessel, wert); return true } catch { return false }
}

function setzeSprache (lang, { url = true } = {}) {
  document.documentElement.setAttribute('data-lang', lang)
  document.documentElement.setAttribute('lang', lang)
  schreibe(SPRACHSCHLUESSEL, lang)
  document.querySelectorAll('[data-lang-btn]').forEach(b => {
    b.classList.toggle('active', b.dataset.langBtn === lang)
    b.setAttribute('aria-pressed', String(b.dataset.langBtn === lang))
  })
  document.querySelectorAll('a[data-lab-link]').forEach(a => {
    const [ziel, hash] = a.getAttribute('href').split('?')[0].split('#')
    a.setAttribute('href', (lang === 'en' ? ziel + '?lang=en' : ziel) + (hash ? '#' + hash : ''))
  })
  if (url) {
    try {
      const u = new URL(location.href)
      u.searchParams.set('lang', lang)
      history.replaceState(null, '', u)
    } catch { /* file:// oder gesperrt */ }
  }
  document.dispatchEvent(new CustomEvent('bint:sprache', { detail: { lang } }))
}

export function initSprache () {
  const ausUrl = new URLSearchParams(location.search).get('lang')
  const gespeichert = lese(SPRACHSCHLUESSEL)
  setzeSprache(ausUrl === 'en' || ausUrl === 'de' ? ausUrl : (gespeichert === 'en' ? 'en' : 'de'), { url: false })
  document.querySelectorAll('[data-lang-btn]').forEach(b => {
    b.addEventListener('click', () => setzeSprache(b.dataset.langBtn))
  })
}

const txt = (o) => (o == null ? '' : (typeof o === 'string' ? o : (o[aktuelleSprache()] ?? o.de ?? '')))
const menge = (n, formen) => `${n} ${txt(formen)[n === 1 ? 0 : 1]}`

const M = {
  frage: { de: ['Frage', 'Fragen'], en: ['question', 'questions'] },
  lab: { de: ['Lab', 'Labs'], en: ['lab', 'labs'] }
}

const T = {
  kopieren:    { de: 'Kopieren', en: 'Copy' },
  kopiert:     { de: '✓ Kopiert', en: '✓ Copied' },
  kopierFehler:{ de: 'Kopieren fehlgeschlagen. Markieren Sie den Code und kopieren Sie ihn von Hand.', en: 'Copy failed. Select the code and copy it manually.' },
  kind: {
    run:     { de: 'Läuft unverändert', en: 'Runnable as-is' },
    concept: { de: 'Konzept · Platzhalternamen', en: 'Concept · placeholder names' },
    diagram: { de: 'Schema · kein Code', en: 'Schema · not code' }
  },
  frage:       { de: 'Frage', en: 'Question' },
  verstaendnis:{ de: 'Verständnis', en: 'Understanding' },
  richtig:     { de: 'Richtig.', en: 'Correct.' },
  nochNicht:   { de: 'Noch nicht.', en: 'Not yet.' },
  nochNichtText: { de: 'Lesen Sie die Frage noch einmal und versuchen Sie es erneut – oder lassen Sie sich die Lösung zeigen.', en: 'Re-read the question and try again – or reveal the answer.' },
  gezeigt:     { de: 'Lösung eingeblendet.', en: 'Answer shown.' },
  nochmal:     { de: 'Nochmal versuchen', en: 'Try again' },
  loesung:     { de: 'Lösung anzeigen', en: 'Show answer' },
  zuruecksetzen: { de: 'Frage zurücksetzen', en: 'Reset question' },
  versuche:    { de: 'Versuche', en: 'Attempts' },
  richtigeAntwort: { de: 'Richtige Antwort: ', en: 'Correct answer: ' },
  falscheAntwort:  { de: 'Ihre falsche Antwort: ', en: 'Your wrong answer: ' },
  ok:          { de: 'Gelöst', en: 'Solved' },
  geloest:     { de: 'gelöst', en: 'solved' },
  quizFehlt:   { de: 'Das Quiz konnte nicht geladen werden. Öffnen Sie die Seite über einen Webserver oder GitHub Pages, nicht direkt aus dem Dateisystem.', en: 'The quiz could not be loaded. Open the page via a web server or GitHub Pages, not straight from the file system.' },
  stand:       { de: 'Ihr Stand', en: 'Your progress' },
  standHinweis:{ de: 'Gelöste Quizfragen und als erledigt markierte Labs werden nur im Speicher Ihres Browsers vermerkt – kein Konto, kein Server, keine personenbezogenen Daten.', en: 'Solved quiz questions and labs marked as done are noted only in your browser\'s local storage – no account, no server, no personal data.' },
  weiter:      { de: 'Weiter mit', en: 'Continue with' },
  allesGeloest:{ de: 'Alle Quizfragen gelöst.', en: 'All quiz questions solved.' },
  loeschen:    { de: 'Lernfortschritt zurücksetzen', en: 'Reset learning progress' },
  loeschenFrage: { de: 'Den vermerkten Lernfortschritt aller Labs löschen?', en: 'Delete the recorded progress of all labs?' },
  ja:          { de: 'Ja, löschen', en: 'Yes, delete' },
  abbrechen:   { de: 'Abbrechen', en: 'Cancel' },
  geloescht:   { de: 'Der Lernfortschritt ist gelöscht.', en: 'Learning progress has been deleted.' },
  erledigt:    { de: 'Als erledigt markieren', en: 'Mark as done' },
  erledigtJa:  { de: '✓ Erledigt', en: '✓ Done' },
  uebersicht:  { de: '← Zur Übersicht', en: '← Back to overview' },
  uebersichtVor: { de: 'Zur Übersicht →', en: 'Overview →' },
  voraussetzung: { de: 'Voraussetzung', en: 'Prerequisite' },
  danach:      { de: 'Sie können danach', en: 'Afterwards you can' },
  umfang:      { de: 'Umfang', en: 'Scope' },
  checkStand:  { de: 'Stand', en: 'Progress' },
  von:         { de: 'von', en: 'of' },
  checkReset:  { de: 'Checkliste zurücksetzen', en: 'Reset checklist' },
  scroll:      { de: 'Seitlich scrollbar', en: 'Scrolls sideways' }
}

/* --------------------------------------------------------------------- Labs */

/**
 * Reihenfolge, Umfang, Voraussetzung, Kompetenzziel und Zeitrahmen an einer
 * einzigen Stelle. `anzahl` ist die Zahl der Quizfragen in data/quiz/<id>.json;
 * tools/check_labs.py vergleicht beides.
 */
export const LABS = [
  {
    id: 'lab-01', nr: '01', datei: 'lab-01-grundlagen.html', anzahl: 7,
    titel: { de: 'Grundlagen Business Intelligence', en: 'BI foundations' },
    voraussetzung: { de: 'Keine. Dies ist der Anfang.', en: 'None. This is the start.' },
    ziel: { de: 'Sie können erklären, was Business Intelligence von Analytics und Data Science unterscheidet, wie eine BI-Architektur aufgebaut ist, was einen guten KPI ausmacht und welche Werkzeuge der Markt bietet.',
            en: 'You can explain what distinguishes business intelligence from analytics and data science, how a BI architecture is built, what makes a good KPI and which tools the market offers.' },
    dauer: { de: '45–60 Minuten', en: '45–60 minutes' }
  },
  {
    id: 'lab-02', nr: '02', datei: 'lab-02-daten.html', anzahl: 6,
    titel: { de: 'Daten: Quellen, Modelle, Qualität', en: 'Data: sources, models, quality' },
    voraussetzung: { de: 'Lab 01', en: 'Lab 01' },
    ziel: { de: 'Sie können Datenquellen anbinden, Star- und Snowflake-Schema unterscheiden und Qualitätsprobleme mit pandas oder Power Query erkennen und beheben.',
            en: 'You can connect data sources, tell star and snowflake schema apart and detect and fix quality problems with pandas or Power Query.' },
    dauer: { de: '60–75 Minuten', en: '60–75 minutes' }
  },
  {
    id: 'lab-03', nr: '03', datei: 'lab-03-kpis.html', anzahl: 6,
    titel: { de: 'KPIs mit DAX, Tableau und Python', en: 'KPIs with DAX, Tableau and Python' },
    voraussetzung: { de: 'Lab 02, Python mit pandas', en: 'Lab 02, Python with pandas' },
    ziel: { de: 'Sie können Kennzahlen als DAX-Measures, als berechnete Felder in Tableau und in pandas definieren, den Filterkontext erklären und Measures von berechneten Spalten unterscheiden.',
            en: 'You can define KPIs as DAX measures, as calculated fields in Tableau and in pandas, explain the filter context and distinguish measures from calculated columns.' },
    dauer: { de: '60–90 Minuten', en: '60–90 minutes' }
  },
  {
    id: 'lab-04', nr: '04', datei: 'lab-04-dashboards.html', anzahl: 6,
    titel: { de: 'Dashboard-Design und Plotly Dash', en: 'Dashboard design and Plotly Dash' },
    voraussetzung: { de: 'Lab 03, pip install dash plotly pandas', en: 'Lab 03, pip install dash plotly pandas' },
    ziel: { de: 'Sie können ein Dashboard nach Gestaltungsprinzipien entwerfen, Diagramme mit Plotly Express bauen und eine Dash-App mit Callbacks starten und deployen.',
            en: 'You can design a dashboard along design principles, build charts with Plotly Express and start and deploy a Dash app with callbacks.' },
    dauer: { de: '90–120 Minuten', en: '90–120 minutes' }
  },
  {
    id: 'lab-05', nr: '05', datei: 'lab-05-fallstudie.html', anzahl: 6,
    titel: { de: 'Fallstudie: Retail Analytics', en: 'Case study: retail analytics' },
    voraussetzung: { de: 'Lab 04, Power BI Desktop oder Tableau', en: 'Lab 04, Power BI Desktop or Tableau' },
    ziel: { de: 'Sie können den vollständigen BI-Workflow von der Rohdatei bis zum Dashboard durchlaufen – in Power BI, in Tableau und in Python – und die Ansätze begründet vergleichen.',
            en: 'You can run the complete BI workflow from raw file to dashboard – in Power BI, in Tableau and in Python – and compare the approaches with reasons.' },
    dauer: { de: '150–210 Minuten', en: '150–210 minutes' }
  },
  {
    id: 'lab-06', nr: '06', datei: 'lab-06-souveraenitaet.html', anzahl: 6,
    titel: { de: 'Digitale Souveränität und Open-Source-BI', en: 'Digital sovereignty and open-source BI' },
    voraussetzung: { de: 'Lab 05, Docker Desktop', en: 'Lab 05, Docker Desktop' },
    ziel: { de: 'Sie können Lock-in-Risiken benennen, einen Open-Source-BI-Stack mit Docker Compose in Betrieb nehmen und eine Werkzeugwahl datenschutzrechtlich begründen.',
            en: 'You can name lock-in risks, put an open-source BI stack into operation with Docker Compose and justify a tool choice in terms of data protection.' },
    dauer: { de: '120–180 Minuten', en: '120–180 minutes' }
  }
]

export const FRAGEN_GESAMT = LABS.reduce((n, l) => n + l.anzahl, 0)
const labVon = (id) => LABS.find(l => l.id === id)

/* --------------------------------------------------------------- Fortschritt */

const quizSchluessel = (lab) => `bi-quiz:${lab}`
const ERLEDIGT_SCHLUESSEL = 'bi-lab-progress'

function ladeQuizStand (lab) {
  try { const s = JSON.parse(lese(quizSchluessel(lab)) || '{}'); return s && typeof s === 'object' && !Array.isArray(s) ? s : {} } catch { return {} }
}
function merkeQuizStand (lab, id) {
  const s = ladeQuizStand(lab); s[id] = true
  schreibe(quizSchluessel(lab), JSON.stringify(s))
  document.dispatchEvent(new CustomEvent('bint:fortschritt'))
}
function ladeErledigt () {
  try {
    const s = JSON.parse(lese(ERLEDIGT_SCHLUESSEL) || '[]')
    return Array.isArray(s) ? [...new Set(s.filter(x => typeof x === 'string' && /^0[1-6]$/.test(x)))] : []
  } catch { return [] }
}
function setzeErledigt (liste) {
  schreibe(ERLEDIGT_SCHLUESSEL, JSON.stringify(liste))
  document.dispatchEvent(new CustomEvent('bint:fortschritt'))
}
function loescheFortschritt () {
  for (const l of LABS) { try { localStorage.removeItem(quizSchluessel(l.id)) } catch { /* egal */ } }
  setzeErledigt([])
}

/* ------------------------------------------------------------------ Helfer */

const el = (tag, klasse, text) => {
  const n = document.createElement(tag)
  if (klasse) n.className = klasse
  if (text != null) n.textContent = text
  return n
}

async function kopiere (text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) { await navigator.clipboard.writeText(text); return true }
  } catch { /* Berechtigung verweigert - Ersatzweg */ }
  const fokus = document.activeElement
  const feld = document.createElement('textarea')
  feld.value = text; feld.setAttribute('readonly', '')
  feld.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none'
  document.body.appendChild(feld)
  try { feld.select(); return document.execCommand('copy') } catch { return false } finally {
    feld.remove(); if (fokus && fokus.focus) fokus.focus()
  }
}

/* --------------------------------------------------------------- Codebloecke */

/**
 * Markup je Block:
 *   <div class="codeblock" data-kind="run|concept|diagram" data-name="CODE_X" data-title="app.py">
 *     <pre class="code-block" lang="de">…</pre><pre class="code-block" lang="en">…</pre>
 *     <p class="code-note"><span lang="de">…</span><span lang="en">…</span></p>
 *   </div>
 * Ein Block ohne Sprachfassungen traegt nur ein <pre class="code-block">.
 */
function initCodebloecke () {
  const bloecke = [...document.querySelectorAll('.codeblock')]
  for (const block of bloecke) {
    if (block.querySelector('.codeblock-kopf')) continue
    const kopf = el('div', 'codeblock-kopf')
    const kind = block.dataset.kind
    if (block.dataset.title) kopf.append(el('span', 'codeblock-titel', block.dataset.title))
    let tag = null
    if (kind && T.kind[kind]) { tag = el('span', 'code-tag code-tag-' + kind); kopf.append(tag) }
    kopf.append(el('span', 'spacer'))
    const knopf = el('button', 'code-kopieren'); knopf.type = 'button'
    kopf.append(knopf)
    block.prepend(kopf)
    let status = block.querySelector('.code-status')
    if (!status) { status = el('p', 'code-status'); status.setAttribute('role', 'status'); block.append(status) }
    const beschrifte = () => {
      if (tag) tag.textContent = txt(T.kind[kind])
      if (!knopf.classList.contains('ok')) knopf.textContent = txt(T.kopieren)
      status.textContent = ''
    }
    beschrifte()
    document.addEventListener('bint:sprache', beschrifte)
    knopf.addEventListener('click', async () => {
      const pre = [...block.querySelectorAll('pre.code-block')].find(p => !p.getAttribute('lang') || p.getAttribute('lang') === aktuelleSprache())
      const ok = await kopiere(pre ? pre.textContent : '')
      if (ok) {
        knopf.classList.add('ok'); knopf.textContent = txt(T.kopiert); status.textContent = ''
        setTimeout(() => { knopf.classList.remove('ok'); knopf.textContent = txt(T.kopieren) }, 1500)
      } else {
        status.textContent = txt(T.kopierFehler)
      }
    })
  }
}

/* --------------------------------------------------------------------- Quiz */

/**
 * data/quiz/<lab>.json: Liste von
 *   { id, frage: {de,en}, optionen: [{de,en}, …], richtig: <index>, erklaerung: {de,en} }
 */
function baueFrage (fr, nr, ctx) {
  const box = el('section', 'uebung'); box.id = fr.id; box.dataset.typ = 'quiz'
  const kopf = el('div', 'uebung-kopf')
  kopf.append(el('span', 'uebung-id', fr.id))
  const titel = el('span', 'uebung-titel'); kopf.append(titel)
  const typ = el('span', 'uebung-typ'); kopf.append(typ)
  const okMarke = el('span', 'uebung-ok'); okMarke.hidden = true; kopf.append(okMarke)
  box.append(kopf)
  const koerper = el('div', 'uebung-koerper'); box.append(koerper)
  const frageText = el('p', 'frage-text'); koerper.append(frageText)
  const ul = el('ul', 'optionen'); koerper.append(ul)
  const knoepfe = fr.optionen.map((o, j) => {
    const li = el('li'); const b = el('button'); b.type = 'button'
    const mark = el('span', 'mark'); mark.setAttribute('aria-hidden', 'true')
    const sr = el('span', 'sr-only'); const text = el('span')
    b.append(mark, sr, text); li.append(b); ul.append(li)
    b.addEventListener('click', () => waehle(j))
    return { b, mark, sr, text }
  })
  const statusZiel = el('div', 'uebung-status'); statusZiel.setAttribute('role', 'status'); statusZiel.setAttribute('aria-live', 'polite'); koerper.append(statusZiel)
  const aktionen = el('div', 'uebung-aktionen'); koerper.append(aktionen)

  let gewaehlt = null; let gezeigt = false; let versuche = 0
  let geloest = !!ladeQuizStand(ctx.lab)[fr.id]

  const male = () => {
    titel.textContent = `${txt(T.frage)} ${nr}`
    typ.textContent = txt(T.verstaendnis)
    okMarke.textContent = txt(T.ok); okMarke.hidden = !geloest
    frageText.textContent = txt(fr.frage)
    knoepfe.forEach(({ b, mark, sr, text }, j) => {
      text.textContent = txt(fr.optionen[j])
      b.disabled = gezeigt
      b.classList.toggle('richtig', gezeigt && j === fr.richtig)
      b.classList.toggle('falsch', gewaehlt === j && j !== fr.richtig)
      mark.textContent = gezeigt && j === fr.richtig ? '✓' : (gewaehlt === j && j !== fr.richtig ? '✗' : '')
      sr.textContent = gezeigt && j === fr.richtig ? txt(T.richtigeAntwort) : (gewaehlt === j && j !== fr.richtig ? txt(T.falscheAntwort) : '')
    })
    statusZiel.replaceChildren(); aktionen.replaceChildren()
    const falsch = gewaehlt !== null && gewaehlt !== fr.richtig
    if (falsch && !gezeigt) {
      const line = el('div', 'line fail'); line.append(el('strong', null, txt(T.nochNicht)), el('span', null, txt(T.nochNichtText))); statusZiel.append(line)
      const nochmal = el('button', 'btn-sm', txt(T.nochmal)); nochmal.type = 'button'
      nochmal.addEventListener('click', () => { gewaehlt = null; male() })
      const zeigen = el('button', 'btn-sm', txt(T.loesung)); zeigen.type = 'button'
      zeigen.addEventListener('click', () => { gezeigt = true; male() })
      aktionen.append(nochmal, zeigen, el('span', 'versuche', `${txt(T.versuche)}: ${versuche}`))
    }
    if (gezeigt) {
      const richtigGetroffen = gewaehlt === fr.richtig
      const line = el('div', 'line ' + (richtigGetroffen ? 'ok' : 'note'))
      line.append(el('strong', null, richtigGetroffen ? txt(T.richtig) : txt(T.gezeigt)))
      if (fr.erklaerung) line.append(el('span', null, txt(fr.erklaerung)))
      statusZiel.append(line)
      const reset = el('button', 'btn-sm', txt(T.zuruecksetzen)); reset.type = 'button'
      reset.addEventListener('click', () => { gewaehlt = null; gezeigt = false; versuche = 0; male() })
      aktionen.append(reset)
      if (versuche > 1) aktionen.append(el('span', 'versuche', `${txt(T.versuche)}: ${versuche}`))
    }
  }
  const waehle = (j) => {
    if (gezeigt) return
    gewaehlt = j; versuche++
    if (j === fr.richtig) { gezeigt = true; if (!geloest) { geloest = true; merkeQuizStand(ctx.lab, fr.id) } }
    male()
  }
  male()
  document.addEventListener('bint:sprache', male)
  return box
}

async function initQuiz (lab, basis) {
  const platz = document.querySelector('[data-quiz]')
  if (!platz) return
  let fragen = []
  try {
    const r = await fetch(`${basis}/data/quiz/${lab}.json`)
    if (!r.ok) throw new Error(`data/quiz/${lab}.json fehlt (${r.status})`)
    fragen = await r.json()
  } catch (e) {
    console.error(e)
    const hinweis = el('div', 'warn-box'); const p = el('p'); hinweis.append(p)
    const setze = () => { p.textContent = txt(T.quizFehlt) }
    setze(); document.addEventListener('bint:sprache', setze)
    platz.replaceWith(hinweis)
    return
  }
  const ziel = el('div', 'quiz')
  fragen.forEach((fr, i) => ziel.append(baueFrage(fr, i + 1, { lab })))
  platz.replaceWith(ziel)
  if (location.hash) { const z = document.querySelector(location.hash); if (z) setTimeout(() => z.scrollIntoView({ block: 'start' }), 80) }
}

/* --------------------------------------------------------------- Checkliste */

/**
 * <div class="checkliste" data-checkliste="bi-lab06-dsgvo"><ul><li>…</li></ul></div>
 * Jeder Listenpunkt wird abhakbar; der Stand bleibt unter dem genannten Schluessel.
 */
function initChecklisten () {
  for (const box of document.querySelectorAll('[data-checkliste]')) {
    const schluessel = box.dataset.checkliste
    const ul = box.querySelector('ul'); if (!ul) continue
    const punkte = [...ul.children]
    let stand = []
    try { const s = JSON.parse(lese(schluessel) || 'null'); stand = Array.isArray(s) ? s.map(Boolean) : [] } catch { stand = [] }
    while (stand.length < punkte.length) stand.push(false)
    const kopf = el('div', 'checkliste-kopf')
    const standText = el('span', 'checkliste-stand')
    const balken = el('div', 'balken'); balken.append(el('i'))
    balken.setAttribute('role', 'progressbar'); balken.setAttribute('aria-valuemin', '0'); balken.setAttribute('aria-valuemax', String(punkte.length))
    kopf.append(standText, balken)
    box.prepend(kopf)
    const aktionen = el('div', 'uebung-aktionen'); box.append(aktionen)
    const reset = el('button', 'btn-sm'); reset.type = 'button'
    reset.addEventListener('click', () => { stand = stand.map(() => false); speichere() })
    aktionen.append(reset)
    const eingaben = punkte.map((li, i) => {
      const label = el('label'); const inp = el('input'); inp.type = 'checkbox'; inp.checked = stand[i]
      const span = el('span'); while (li.firstChild) span.append(li.firstChild)
      label.append(inp, span); li.append(label)
      inp.addEventListener('change', () => { stand[i] = inp.checked; speichere() })
      return inp
    })
    const male = () => {
      const n = stand.filter(Boolean).length
      standText.textContent = `${txt(T.checkStand)}: ${n} ${txt(T.von)} ${punkte.length}`
      balken.querySelector('i').style.width = Math.round(n / punkte.length * 100) + '%'
      balken.classList.toggle('voll', n === punkte.length)
      balken.setAttribute('aria-valuenow', String(n))
      eingaben.forEach((inp, i) => { inp.checked = stand[i] })
      reset.textContent = txt(T.checkReset); reset.hidden = n === 0
    }
    const speichere = () => { schreibe(schluessel, JSON.stringify(stand)); male() }
    male()
    document.addEventListener('bint:sprache', male)
  }
}

/* ---------------------------------------------------------- Seitenbausteine */

function initTitelUndAlt () {
  const titelDe = document.title
  const meta = document.querySelector('meta[name="bint:titel-en"]')
  const titelEn = meta ? meta.getAttribute('content') : null
  const bilder = [...document.querySelectorAll('img[data-alt-en]')].map(img => ({ img, de: img.getAttribute('alt'), en: img.getAttribute('data-alt-en') }))
  const setzen = () => {
    const en = aktuelleSprache() === 'en'
    if (titelEn) document.title = en ? titelEn : titelDe
    for (const b of bilder) b.img.setAttribute('alt', en ? b.en : b.de)
  }
  document.addEventListener('bint:sprache', setzen)
  setzen()
}

function baueEinordnung (labId) {
  const lab = labVon(labId)
  const kopf = document.querySelector('.lab-header')
  if (!lab || !kopf) return
  const dl = el('dl', 'lab-einordnung')
  const felder = () => [
    [T.voraussetzung, txt(lab.voraussetzung)],
    [T.danach, txt(lab.ziel)],
    [T.umfang, `${menge(lab.anzahl, M.frage)} · ${txt(lab.dauer)}`]
  ]
  const fuellen = () => {
    dl.replaceChildren()
    for (const [t, w] of felder()) { const z = el('div'); z.append(el('dt', null, txt(t)), el('dd', null, w)); dl.append(z) }
  }
  fuellen()
  document.addEventListener('bint:sprache', fuellen)
  kopf.append(dl)
}

function initSeitennavigation () {
  const links = [...document.querySelectorAll('.sidebar-link[href^="#"]')]
  const abschnitte = links.map(a => ({ link: a, ziel: document.getElementById(a.getAttribute('href').slice(1)) })).filter(e => e.ziel)
  if (!abschnitte.length) return
  const LESEKANTE = 120
  const aktualisieren = () => {
    const amEnde = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
    let treffer = amEnde ? abschnitte[abschnitte.length - 1] : abschnitte[0]
    if (!amEnde) for (const e of abschnitte) if (e.ziel.getBoundingClientRect().top <= LESEKANTE) treffer = e
    for (const e of abschnitte) e.link.classList.toggle('active', e === treffer)
  }
  let geplant = false
  addEventListener('scroll', () => { if (geplant) return; geplant = true; requestAnimationFrame(() => { geplant = false; aktualisieren() }) }, { passive: true })
  addEventListener('resize', aktualisieren, { passive: true })
  aktualisieren()
}

function baueLabNavigation (labId) {
  const i = LABS.findIndex(l => l.id === labId)
  const nav = document.querySelector('.nav-bottom')
  if (i < 0 || !nav) return
  const fuellen = () => {
    nav.replaceChildren()
    const zurueck = i > 0 ? LABS[i - 1] : null; const weiter = i < LABS.length - 1 ? LABS[i + 1] : null
    const a1 = el('a', 'btn', zurueck ? `← Lab ${zurueck.nr} · ${txt(zurueck.titel)}` : txt(T.uebersicht))
    a1.href = zurueck ? zurueck.datei : 'index.html'
    const a2 = el('a', 'btn solid', weiter ? `Lab ${weiter.nr} · ${txt(weiter.titel)} →` : txt(T.uebersichtVor))
    a2.href = weiter ? weiter.datei : 'index.html'
    if (aktuelleSprache() === 'en') { a1.href += '?lang=en'; a2.href += '?lang=en' }
    nav.append(a1, a2)
  }
  fuellen()
  document.addEventListener('bint:sprache', fuellen)
}

/* Ein seitlich scrollbarer Kasten sieht aus wie ein abgeschnittener Kasten,
   solange nichts darauf hinweist. */
function markiereScrollbereiche () {
  const kaesten = [...document.querySelectorAll('.table-scroll')]
  if (!kaesten.length) return
  const pruefen = () => {
    for (const k of kaesten) {
      const breiter = k.scrollWidth > k.clientWidth + 2
      let hinweis = k.nextElementSibling && k.nextElementSibling.classList.contains('scrollhinweis') ? k.nextElementSibling : null
      if (breiter) {
        k.setAttribute('data-scrollbar', '')
        if (!hinweis) { hinweis = el('p', 'scrollhinweis'); k.after(hinweis) }
        hinweis.textContent = txt(T.scroll)
      } else { k.removeAttribute('data-scrollbar'); if (hinweis) hinweis.remove() }
    }
  }
  pruefen()
  addEventListener('resize', pruefen, { passive: true })
  document.addEventListener('bint:sprache', pruefen)
}

/* --------------------------------------------------------------- Startseite */

function karteFortschritt () {
  const karten = LABS.map(l => ({ l, karte: document.querySelector(`.lab-card[data-lab="${l.id}"]`) })).filter(e => e.karte)
  const fuellen = () => {
    const erledigt = ladeErledigt()
    for (const { l, karte } of karten) {
      const geloest = Object.keys(ladeQuizStand(l.id)).filter(id => id.startsWith('B' + l.nr)).length
      let block = karte.querySelector('.lab-fortschritt')
      if (!block) {
        block = el('div', 'lab-fortschritt')
        const balken = el('div', 'balken'); balken.append(el('i'))
        block.append(el('span'), balken)
        const link = karte.querySelector('.lab-card-link')
        if (link) link.after(block); else karte.append(block)
      }
      block.querySelector('span').textContent = `${geloest} / ${menge(l.anzahl, M.frage)} ${txt(T.geloest)}`
      const balken = block.querySelector('.balken')
      balken.classList.toggle('voll', geloest === l.anzahl)
      balken.querySelector('i').style.width = Math.round(geloest / l.anzahl * 100) + '%'
      let knopf = karte.querySelector('.lab-erledigt')
      if (!knopf) {
        knopf = el('button', 'lab-erledigt'); knopf.type = 'button'
        knopf.addEventListener('click', () => {
          const jetzt = ladeErledigt()
          setzeErledigt(jetzt.includes(l.nr) ? jetzt.filter(n => n !== l.nr) : [...jetzt, l.nr])
        })
        block.after(knopf)
      }
      const fertig = erledigt.includes(l.nr)
      knopf.textContent = fertig ? txt(T.erledigtJa) : txt(T.erledigt)
      knopf.classList.toggle('is-done', fertig); knopf.setAttribute('aria-pressed', String(fertig))
      karte.classList.toggle('erledigt', fertig)
      const nummer = karte.querySelector('.lab-num')
      let haken = nummer && nummer.querySelector('.lab-haken')
      const voll = fertig || geloest === l.anzahl
      if (voll && nummer && !haken) { haken = el('span', 'lab-haken', '✓'); haken.setAttribute('aria-hidden', 'true'); nummer.append(haken) } else if (!voll && haken) haken.remove()
    }
  }
  fuellen()
  document.addEventListener('bint:sprache', fuellen)
  document.addEventListener('bint:fortschritt', fuellen)
}

async function baueGesamtfortschritt (ziel, basis) {
  const panel = el('div', 'fortschritt-panel')
  let stand = 0
  const fuellen = async () => {
    const lauf = ++stand
    panel.replaceChildren()
    const gesamt = LABS.reduce((n, l) => n + Object.keys(ladeQuizStand(l.id)).filter(id => id.startsWith('B' + l.nr)).length, 0)
    const erledigt = ladeErledigt()
    const kopf = el('div', 'fortschritt-kopf')
    kopf.append(el('span', 'fortschritt-titel', txt(T.stand)))
    const zahl = el('span', 'fortschritt-zahl', `${gesamt} / ${FRAGEN_GESAMT} `)
    zahl.append(el('small', null, `${txt(M.frage)[1]} ${txt(T.geloest)} · ${erledigt.length} / ${LABS.length} ${txt(M.lab)[1]} ${aktuelleSprache() === 'en' ? 'done' : 'erledigt'}`))
    kopf.append(zahl)
    panel.append(kopf)
    const balken = el('div', 'balken'); balken.append(el('i')); balken.querySelector('i').style.width = Math.round(gesamt / FRAGEN_GESAMT * 100) + '%'
    balken.classList.toggle('voll', gesamt === FRAGEN_GESAMT)
    balken.setAttribute('role', 'progressbar'); balken.setAttribute('aria-valuenow', String(gesamt)); balken.setAttribute('aria-valuemin', '0'); balken.setAttribute('aria-valuemax', String(FRAGEN_GESAMT))
    panel.append(balken)
    panel.append(el('p', 'fortschritt-hinweis', txt(T.standHinweis)))
    const aktionen = el('div', 'fortschritt-aktionen')
    const naechstes = LABS.find(l => Object.keys(ladeQuizStand(l.id)).filter(id => id.startsWith('B' + l.nr)).length < l.anzahl)
    if (naechstes) {
      let anker = ''
      try {
        const r = await fetch(`${basis}/data/quiz/${naechstes.id}.json`)
        if (r.ok) { const fr = await r.json(); const f = ladeQuizStand(naechstes.id); const offen = fr.find(u => !f[u.id]); if (offen) anker = '#' + offen.id }
      } catch { /* egal */ }
      if (lauf !== stand) return
      const a = el('a', 'btn solid', `${txt(T.weiter)} Lab ${naechstes.nr}${anker ? ' · ' + txt(T.frage) + ' ' + anker.slice(1) : ''}`)
      a.href = naechstes.datei + (aktuelleSprache() === 'en' ? '?lang=en' : '') + anker
      aktionen.append(a)
    } else aktionen.append(el('span', null, txt(T.allesGeloest)))
    aktionen.append(el('span', 'spacer'))
    const reset = el('button', 'btn-sm gefahr', txt(T.loeschen)); reset.type = 'button'
    reset.hidden = gesamt === 0 && erledigt.length === 0
    reset.addEventListener('click', () => {
      if (panel.querySelector('.fortschritt-frage')) return
      const frage = el('div', 'fortschritt-frage'); frage.setAttribute('role', 'alertdialog')
      frage.append(el('span', null, txt(T.loeschenFrage)))
      const reihe = el('div', 'fortschritt-aktionen')
      const ja = el('button', 'btn-sm gefahr', txt(T.ja)); ja.type = 'button'
      ja.addEventListener('click', () => { loescheFortschritt() })
      const nein = el('button', 'btn-sm', txt(T.abbrechen)); nein.type = 'button'
      nein.addEventListener('click', () => frage.remove())
      reihe.append(ja, nein); frage.append(reihe); panel.append(frage); ja.focus()
    })
    aktionen.append(reset)
    panel.append(aktionen)
  }
  await fuellen()
  document.addEventListener('bint:sprache', fuellen)
  document.addEventListener('bint:fortschritt', fuellen)
  ziel.replaceWith(panel)
}

function fuelleKennzahlen () {
  for (const z of document.querySelectorAll('[data-stat="fragen"]')) z.textContent = String(FRAGEN_GESAMT)
  for (const z of document.querySelectorAll('[data-stat="labs"]')) z.textContent = String(LABS.length)
}

/* ----------------------------------------------------------------- Einstieg */

export async function starteUebersicht ({ basis = '.' } = {}) {
  initSprache()
  initTitelUndAlt()
  fuelleKennzahlen()
  karteFortschritt()
  const standPlatz = document.querySelector('[data-fortschritt]')
  if (standPlatz) await baueGesamtfortschritt(standPlatz, basis)
}

export async function starteLab ({ lab, basis = '.' }) {
  initSprache()
  initTitelUndAlt()
  baueEinordnung(lab)
  initSeitennavigation()
  baueLabNavigation(lab)
  initCodebloecke()
  initChecklisten()
  markiereScrollbereiche()
  await initQuiz(lab, basis)
}
