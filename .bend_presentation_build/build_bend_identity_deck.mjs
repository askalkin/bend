import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const {
  SKILL_DIR,
  TMP_DIR,
  FINAL_PPTX,
  RUNTIME_PYTHON,
  WORKSPACE_DIR,
} = process.env;

if (!path.isAbsolute(SKILL_DIR ?? "") || !path.isAbsolute(TMP_DIR ?? "") || !path.isAbsolute(FINAL_PPTX ?? "")) {
  throw new Error("Set SKILL_DIR, TMP_DIR, and FINAL_PPTX as absolute paths");
}

const workspaceDir = WORKSPACE_DIR || "/Users/alinaskalkina/Documents/ChatGPT/Bend";
const W = 1280;
const H = 720;
const EMU_16_9 = "12192000,6858000";

const C = {
  ink: "#050505",
  paper: "#F7F8F2",
  white: "#FFFFFF",
  deepBlue: "#061847",
  courtBlue: "#168FD8",
  sky: "#82D3F4",
  ball: "#C8FF22",
  graphite: "#2B2F31",
  chrome: "#B9BAB3",
  green: "#0F4B35",
  teal: "#008B95",
  peach: "#F6A178",
  lavender: "#BBA7FF",
  clay: "#E35B2A",
};

const F = {
  heading: "Avenir Next Condensed",
  body: "Avenir Next",
  tech: "DIN Condensed",
  impact: "Arial Black",
};

const sourceNotes = {
  fontResearch: [
    "Font research sources:",
    "Commercial Type Druk: https://commercialtype.com/catalog/druk",
    "Pangram Pangram Monument: https://pangrampangram.com/products/monument",
    "Google Fonts Syncopate: https://fonts.google.com/specimen/Syncopate",
    "Google Fonts Tourney: https://fonts.google.com/specimen/Tourney",
    "Google Fonts Orbitron: https://fonts.google.com/specimen/Orbitron",
    "Google Fonts Gabarito: https://fonts.google.com/specimen/Gabarito",
    "Google Fonts Work Sans: https://fonts.google.com/specimen/Work+Sans",
    "Google Fonts Michroma: https://fonts.google.com/specimen/Michroma",
    "Fonts In Use Challengers: https://fontsinuse.com/uses/60511/challengers-movie-posters-and-collateral",
    "Fonts In Use tennis tag: https://fontsinuse.com/tags/7387/tennis",
    "Make Type Work Fonts for Tennis: https://maketypework.com/fonts-for-tennis/",
    "MyFonts Rockwell: https://www.myfonts.com/collections/rockwell-font-monotype-imaging",
    "Typographica Eurostile Next review: https://typographica.org/typeface-reviews/eurostile-next/",
    "MyFonts Eurostile Next purchase context: https://www.myfonts.com/pages/linotype-eurostile-next/",
  ].join("\n"),
};

const presentation = Presentation.create({ slideSize: { width: W, height: H } });

function abs(rel) {
  return path.join(workspaceDir, rel);
}

async function bytes(rel) {
  return fs.readFile(abs(rel));
}

function addText(slide, text, x, y, w, h, opt = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    position: { left: x, top: y, width: w, height: h, rotation: opt.rotation || 0 },
    fill: "none",
    line: { style: "solid", fill: "transparent", width: 0 },
  });
  shape.text = text;
  shape.text.style = {
    typeface: opt.font || F.body,
    fontSize: opt.size || 24,
    bold: opt.bold ?? false,
    italic: opt.italic ?? false,
    color: opt.color || C.ink,
    alignment: opt.align || "left",
    verticalAlignment: opt.vAlign || "top",
    autoFit: opt.autoFit || "none",
    wrap: opt.wrap || "square",
    insets: opt.insets || { left: 0, top: 0, right: 0, bottom: 0 },
  };
  return shape;
}

function addRect(slide, x, y, w, h, fill, line = "transparent", radius = 0) {
  return slide.shapes.add({
    geometry: "rect",
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: { style: "solid", fill: line, width: line === "transparent" ? 0 : 1.4 },
    borderRadius: radius,
  });
}

function addLine(slide, x, y, w, h, color, width = 1) {
  return slide.shapes.add({
    geometry: "line",
    position: { left: x, top: y, width: w, height: h },
    fill: "none",
    line: { style: "solid", fill: color, width },
  });
}

function addEllipse(slide, x, y, w, h, fill, line = "transparent") {
  return slide.shapes.add({
    geometry: "ellipse",
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: { style: "solid", fill: line, width: line === "transparent" ? 0 : 1.2 },
  });
}

async function addImage(slide, rel, x, y, w, h, opt = {}) {
  return slide.images.add({
    blob: await bytes(rel),
    contentType: "image/png",
    alt: opt.alt || rel,
    fit: opt.fit || "cover",
    crop: opt.crop,
    position: { left: x, top: y, width: w, height: h },
    geometry: opt.geometry || "rect",
    borderRadius: opt.borderRadius || 0,
  });
}

function title(slide, text, inverse = false) {
  addText(slide, text, 64, 46, 760, 78, {
    font: F.heading,
    size: 54,
    bold: true,
    color: inverse ? C.white : C.ink,
  });
}

function kicker(slide, text, inverse = false) {
  addText(slide, text.toUpperCase(), 64, 32, 520, 20, {
    font: F.tech,
    size: 17,
    bold: true,
    color: inverse ? C.ball : C.graphite,
  });
}

function foot(slide, text, inverse = false) {
  addText(slide, text, 64, 676, 1080, 22, {
    font: F.body,
    size: 13,
    bold: false,
    color: inverse ? "#FFFFFF/68" : "#050505/58",
  });
}

function note(slide, text) {
  slide.speakerNotes.textFrame.setText(text);
}

function addWordmark(slide, x, y, size, color = C.ink, font = F.impact, rotation = 0) {
  return addText(slide, "BEND", x, y, size * 3.2, size * 0.9, {
    font,
    size,
    bold: true,
    color,
    rotation,
    autoFit: "shrinkText",
  });
}

function addCourtPulseMark(slide, x, y, scale = 1) {
  const letters = [
    ["B", 0, 36, -5, C.ball],
    ["E", 124, 8, 2, C.white],
    ["N", 264, 24, -1, C.white],
    ["D", 414, 48, 6, C.ball],
  ];
  letters.forEach(([letter, dx, dy, rotation, color]) => {
    addText(slide, letter, x + dx * scale, y + dy * scale, 150 * scale, 130 * scale, {
      font: F.impact,
      size: 120 * scale,
      bold: true,
      color,
      rotation,
      autoFit: "shrinkText",
    });
  });
  addLine(slide, x + 8 * scale, y + 154 * scale, 560 * scale, 42 * scale, C.courtBlue, 4 * scale);
  addLine(slide, x + 8 * scale, y + 162 * scale, 560 * scale, 42 * scale, "#FFFFFF/42", 1.4 * scale);
  addEllipse(slide, x + 490 * scale, y + 132 * scale, 28 * scale, 28 * scale, C.ball);
}

function addNightMatchMark(slide, x, y, scale = 1) {
  addRect(slide, x + 42 * scale, y + 66 * scale, 378 * scale, 42 * scale, "#168FD8/78");
  addRect(slide, x + 154 * scale, y + 44 * scale, 278 * scale, 42 * scale, "#C8FF22/92");
  addText(slide, "BEND", x, y, 650 * scale, 116 * scale, {
    font: F.impact,
    size: 118 * scale,
    bold: true,
    italic: true,
    color: C.white,
    rotation: -2,
    autoFit: "shrinkText",
  });
  addLine(slide, x + 8 * scale, y + 52 * scale, 606 * scale, 0, C.deepBlue, 5 * scale);
  addLine(slide, x + 28 * scale, y + 78 * scale, 560 * scale, 0, C.courtBlue, 4 * scale);
  addLine(slide, x + 54 * scale, y + 102 * scale, 500 * scale, 0, C.ball, 3 * scale);
}

function addAirBounceMark(slide, x, y, scale = 1) {
  addEllipse(slide, x + 130 * scale, y + 4 * scale, 78 * scale, 78 * scale, "#C8FF22/82");
  addEllipse(slide, x + 342 * scale, y + 52 * scale, 52 * scale, 52 * scale, "#F6A178/72");
  const letters = [
    ["B", 0, 36, -6, C.ink],
    ["E", 118, 6, 4, C.courtBlue],
    ["N", 250, 32, -2, C.peach],
    ["D", 386, 12, 5, C.lavender],
  ];
  letters.forEach(([letter, dx, dy, rotation, color]) => {
    addText(slide, letter, x + dx * scale, y + dy * scale, 148 * scale, 130 * scale, {
      font: F.impact,
      size: 116 * scale,
      bold: true,
      color,
      rotation,
      autoFit: "shrinkText",
    });
  });
  addLine(slide, x + 20 * scale, y + 162 * scale, 500 * scale, 0, "#050505/24", 1.4 * scale);
}

function addColorSwatch(slide, x, y, w, h, color, name, hex, dark = false) {
  addRect(slide, x, y, w, h, color, "transparent");
  addText(slide, name + "\n" + hex, x + 12, y + h - 50, w - 24, 44, {
    font: F.body,
    size: 15,
    bold: true,
    color: dark ? C.white : C.ink,
  });
}

async function slide1() {
  const s = presentation.slides.add();
  s.background.fill = C.deepBlue;
  await addImage(s, "Product-image-reference.png", 604, 0, 676, 720, {
    crop: { left: 0.06, top: 0.03, right: 0.05, bottom: 0.02 },
  });
  addRect(s, 0, 0, 760, 720, "linear(90deg, #061847 0%, #061847/96 72%, #061847/0 100%)");
  kicker(s, "Brand identity proposal", true);
  addText(s, "BEND", 64, 112, 580, 170, { font: F.impact, size: 136, bold: true, color: C.ball });
  addText(s, "Padel and tennis workout supplements", 70, 284, 560, 42, { font: F.body, size: 26, bold: true, color: C.white });
  addText(s, "Selected directions: Court Pulse, Night Match, Air Bounce", 70, 352, 520, 88, { font: F.body, size: 24, bold: true, color: "#FFFFFF/78" });
  addText(s, "September 2026", 70, 626, 320, 30, { font: F.tech, size: 18, bold: true, color: C.ball });
  note(s, "Uses local user-supplied Bend product image as visual reference.");
}

async function slide2() {
  const s = presentation.slides.add();
  s.background.fill = C.paper;
  title(s, "Reference language");
  addText(s, "The folder references create a tight visual territory: court blue, acid tennis yellow, deep night contrast, soft sky color, and physical product materials.", 64, 132, 510, 110, { font: F.body, size: 26, bold: true, color: C.graphite });
  const items = [
    ["Motion", "Blurred athletes, falling balls, repeated arcs, speed trails"],
    ["Geometry", "Court lines, grid divisions, split compositions, precise crops"],
    ["Material", "Chrome, transparent tubes, felt texture, gummy translucency"],
    ["Type", "Condensed weight, extended sport tech, occasional serif nostalgia"],
  ];
  items.forEach(([h, b], i) => {
    const y = 286 + i * 78;
    addText(s, "0" + (i + 1), 64, y, 54, 30, { font: F.tech, size: 23, bold: true, color: C.courtBlue });
    addText(s, h, 128, y - 2, 170, 30, { font: F.heading, size: 31, bold: true, color: C.ink });
    addText(s, b, 300, y, 300, 44, { font: F.body, size: 19, bold: false, color: C.graphite });
  });
  await addImage(s, "image 3313.png", 650, 84, 268, 260, { crop: { left: 0.08, top: 0.03, right: 0.08, bottom: 0.12 } });
  await addImage(s, "image 3315.png", 938, 84, 278, 260, { crop: { left: 0.04, top: 0.05, right: 0.04, bottom: 0.05 } });
  await addImage(s, "image 3309.png", 650, 364, 268, 250, { crop: { left: 0, top: 0.06, right: 0, bottom: 0.02 } });
  await addImage(s, "image 3268.png", 938, 364, 278, 250, { crop: { left: 0.02, top: 0, right: 0.02, bottom: 0 } });
  foot(s, "Local image analysis. Matched patterns are directional, not claims about source ownership.");
  note(s, "All images on this slide are local user-supplied references from the Bend folder.");
}

async function slide3() {
  const s = presentation.slides.add();
  s.background.fill = C.ink;
  title(s, "Selected identity routes", true);
  const routes = [
    ["02", "Court Pulse", "Campaign master route", "image 3323.png", C.ball],
    ["04", "Night Match", "Pre-workout and focus", "image 3309.png", C.ball],
    ["05", "Air Bounce", "Chews and flavor systems", "image 3268.png", C.peach],
  ];
  for (let i = 0; i < routes.length; i++) {
    const [n, name, role, img, accent] = routes[i];
    const x = 64 + i * 400;
    await addImage(s, img, x, 150, 350, 420, { crop: { left: 0.04, top: 0.02, right: 0.04, bottom: 0.02 } });
    addRect(s, x, 150, 350, 420, "linear(180deg, #000000/0 0%, #000000/72 100%)");
    addText(s, n, x + 22, 174, 80, 44, { font: F.tech, size: 34, bold: true, color: accent });
    addText(s, name, x + 22, 414, 290, 58, { font: F.heading, size: 42, bold: true, color: C.white });
    addText(s, role, x + 22, 488, 270, 44, { font: F.body, size: 19, bold: true, color: "#FFFFFF/82" });
  }
  foot(s, "Focus for this revision: build Bend as a typographic system, not a logo plus decoration.", true);
  note(s, "Uses local user-supplied reference images.");
}

async function slide4() {
  const s = presentation.slides.add();
  s.background.fill = C.paper;
  title(s, "Wordmark strategy");
  addText(s, "The name carries the movement", 64, 128, 470, 42, { font: F.body, size: 26, bold: true, color: C.graphite });
  addText(s, "B", 80, 232, 130, 120, { font: F.impact, size: 110, bold: true, color: C.ink, rotation: -5 });
  addText(s, "E", 200, 202, 130, 120, { font: F.impact, size: 110, bold: true, color: C.courtBlue, rotation: 2 });
  addText(s, "N", 323, 222, 150, 120, { font: F.impact, size: 110, bold: true, color: C.ink, rotation: -1 });
  addText(s, "D", 463, 252, 150, 120, { font: F.impact, size: 110, bold: true, color: C.ball, rotation: 6 });
  addLine(s, 76, 342, 510, 58, C.courtBlue, 3);
  addText(s, "A bend can happen through baseline shifts, letter width, skew, echo, outline, or color substitution. The system should keep the word readable at product scale and expressive at campaign scale.", 64, 448, 548, 124, { font: F.body, size: 22, bold: false, color: C.graphite });
  const rules = [
    ["Readable first", "The mark must work on a bottle, cap, sachet, grip tape, and app header."],
    ["Motion from letters", "Use letter modeling before adding balls, arrows, or separate icons."],
    ["One master skeleton", "Court, night, and chew variants should feel like siblings."],
  ];
  rules.forEach(([h, b], i) => {
    const y = 150 + i * 142;
    addText(s, h, 724, y, 420, 36, { font: F.heading, size: 35, bold: true, color: C.ink });
    addText(s, b, 724, y + 42, 420, 72, { font: F.body, size: 20, bold: false, color: C.graphite });
    addLine(s, 724, y + 122, 430, 0, "#050505/18", 1.2);
  });
  note(s, "Logo principles developed from user direction in this turn and local reference image analysis.");
}

async function slide5() {
  const s = presentation.slides.add();
  s.background.fill = C.white;
  title(s, "Logo exploration sheet");
  addText(s, "Nine typographic tests for the word BEND. These are not final vector drawings. They show the movement grammar to develop into a custom wordmark.", 64, 116, 1050, 42, { font: F.body, size: 22, bold: true, color: C.graphite });
  await addImage(s, "bend_proposal_assets/logo_explorations.png", 64, 178, 1152, 470, { fit: "contain" });
  foot(s, "Preferred territory: Court Pulse kinetic baseline as master, with Night Match and Air Bounce as controlled alternates.");
  note(s, "Logo exploration sheet generated locally from editable HTML text and open web font specimens. It is intended as a creative prototype, not a licensed final font file.");
}

async function slide6() {
  const s = presentation.slides.add();
  s.background.fill = C.deepBlue;
  await addImage(s, "image 3323.png", 720, 0, 560, 720, { crop: { left: 0.12, top: 0.02, right: 0.1, bottom: 0.01 } });
  addRect(s, 0, 0, 880, 720, "linear(90deg, #061847 0%, #061847/96 72%, #061847/0 100%)");
  kicker(s, "02", true);
  title(s, "Court Pulse wordmark", true);
  addCourtPulseMark(s, 76, 162, 0.94);
  addText(s, "Role", 64, 430, 130, 28, { font: F.tech, size: 21, bold: true, color: C.ball });
  addText(s, "Main campaign and digital mark. The letters ride a rally arc and create a sporty motion system without a separate tennis icon.", 64, 462, 566, 80, { font: F.body, size: 24, bold: true, color: C.white });
  addText(s, "Use on site hero, launch posters, event courts, hydration packs, and motion graphics.", 64, 568, 560, 54, { font: F.body, size: 20, bold: false, color: "#FFFFFF/74" });
  note(s, "Uses local user-supplied image 3323 and generated logo exploration sheet.");
}

async function slide7() {
  const s = presentation.slides.add();
  s.background.fill = C.ink;
  await addImage(s, "image 3309.png", 0, 0, 1280, 720, { crop: { left: 0, top: 0, right: 0, bottom: 0 } });
  addRect(s, 0, 0, 1280, 720, "linear(90deg, #000000/92 0%, #061847/72 58%, #000000/15 100%)");
  kicker(s, "04", true);
  title(s, "Night Match wordmark", true);
  addNightMatchMark(s, 64, 170, 0.92);
  addText(s, "Role", 64, 442, 130, 28, { font: F.tech, size: 21, bold: true, color: C.ball });
  addText(s, "Performance route for pre-workout, caffeine, creatine, and focus products. Skew and shadow give the logo speed at black-pack scale.", 64, 474, 620, 88, { font: F.body, size: 24, bold: true, color: C.white });
  addText(s, "Use white or acid on deep blue, black, chrome, and night-court photography.", 64, 586, 556, 50, { font: F.body, size: 20, bold: false, color: "#FFFFFF/74" });
  note(s, "Uses local user-supplied image 3309 and generated logo exploration sheet.");
}

async function slide8() {
  const s = presentation.slides.add();
  s.background.fill = "linear(135deg, #DFF6FF 0%, #FFFFFF 56%, #FFE0D2 100%)";
  await addImage(s, "image 3268.png", 720, 0, 560, 720, { crop: { left: 0.02, top: 0, right: 0.02, bottom: 0 } });
  addRect(s, 0, 0, 920, 720, "linear(90deg, #FFFFFF/96 0%, #FFFFFF/84 72%, #FFFFFF/0 100%)");
  kicker(s, "05");
  title(s, "Air Bounce wordmark");
  addAirBounceMark(s, 76, 174, 0.96);
  addText(s, "Role", 64, 442, 130, 28, { font: F.tech, size: 21, bold: true, color: C.courtBlue });
  addText(s, "Soft product route for chews, gummies, sticks, and flavor-led line extensions. Letters can bounce, change color, and become flavor markers.", 64, 474, 630, 88, { font: F.body, size: 24, bold: true, color: C.graphite });
  addText(s, "Use black master wordmark with controlled color letters on sky, peach, and lavender fields.", 64, 586, 556, 50, { font: F.body, size: 20, bold: false, color: C.graphite });
  note(s, "Uses local user-supplied image 3268 and generated logo exploration sheet.");
}

async function slide9() {
  const s = presentation.slides.add();
  s.background.fill = C.paper;
  title(s, "Logo system");
  addText(s, "The final identity should produce a family of marks from one custom skeleton.", 64, 118, 650, 38, { font: F.body, size: 24, bold: true, color: C.graphite });
  const xs = [64, 458, 852];
  const labels = [
    ["Primary wordmark", "BEND", C.ink, C.white],
    ["Split product lockup", "BE   ND", C.deepBlue, C.ball],
    ["Night outline", "BEND", C.white, C.deepBlue],
    ["Air flavor mark", "BEND", C.ink, "#DFF6FF"],
    ["Small digital mark", "BEND", C.white, C.ink],
    ["Pattern asset", "BEND BEND BEND", C.ball, C.courtBlue],
  ];
  labels.forEach(([label, mark, color, bg], i) => {
    const x = xs[i % 3];
    const y = 184 + Math.floor(i / 3) * 184;
    addRect(s, x, y, 336, 132, bg, "#050505/16");
    addText(s, label, x + 18, y + 14, 290, 24, { font: F.tech, size: 17, bold: true, color: bg === C.deepBlue || bg === C.ink || bg === C.courtBlue ? "#FFFFFF/72" : C.graphite });
    addText(s, mark, x + 18, y + 48, 298, 62, { font: F.impact, size: i === 5 ? 31 : 54, bold: true, color, autoFit: "shrinkText" });
  });
  addText(s, "Build the master logo as custom vector outlines after type purchase or custom drawing. Keep editable type prototypes for web, motion tests, and internal review.", 64, 594, 980, 50, { font: F.body, size: 21, bold: true, color: C.graphite });
  note(s, "Logo system proposal based on user feedback and generated wordmark exploration sheet.");
}

async function slide10() {
  const s = presentation.slides.add();
  s.background.fill = C.white;
  title(s, "Reference typography findings");
  await addImage(s, "image 3315.png", 64, 126, 250, 380, { crop: { left: 0.02, top: 0.03, right: 0.02, bottom: 0.03 } });
  await addImage(s, "image 3313.png", 334, 126, 250, 380, { crop: { left: 0.1, top: 0.04, right: 0.08, bottom: 0.1 } });
  await addImage(s, "image 3323.png", 604, 126, 250, 380, { crop: { left: 0.04, top: 0.02, right: 0.04, bottom: 0.02 } });
  const findings = [
    ["Challengers", "Fonts In Use identifies Rockwell for the movie poster system and Microgramma Bold Extended for the IMAX logo."],
    ["The Grid references", "Modern grotesk territory: Helvetica, Neue Haas, Work Sans, and similar neutral families. Exact font not confirmed from the image alone."],
    ["Play Beyond Limits", "Extended techno-sport territory: Eurostile, Microgramma, Syncopate, Orbitron, and related square sans families."],
    ["Bend product mockup", "Closest production direction is a heavy condensed or compact grotesk, then customized into a wordmark."],
  ];
  findings.forEach(([h, b], i) => {
    const y = 126 + i * 124;
    addText(s, h, 900, y, 300, 30, { font: F.heading, size: 27, bold: true, color: C.ink });
    addText(s, b, 900, y + 34, 318, 78, { font: F.body, size: 16, bold: false, color: C.graphite });
  });
  foot(s, "Font matches are a mix of cited identifications and visual similarity. Exact commercial use requires licensing checks.");
  note(s, sourceNotes.fontResearch + "\nLocal reference images used for visual comparison.");
}

async function slide11() {
  const s = presentation.slides.add();
  s.background.fill = C.paper;
  title(s, "Paid font candidates");
  addText(s, "These are purchase candidates for final logo development and campaign typography. Screenshots are included for evaluation, not as licensed font use.", 64, 112, 990, 44, { font: F.body, size: 21, bold: true, color: C.graphite });
  const imgs = [
    ["Druk", "bend_proposal_assets/font_screens/druk.png", "Core condensed power for product wordmark"],
    ["Monument", "bend_proposal_assets/font_screens/monument.png", "Wide display family for Court Pulse"],
    ["Eurostile Next", "bend_proposal_assets/font_screens/eurostile_typographica.png", "Square sport-tech logic for Night Match"],
    ["Rockwell", "bend_proposal_assets/font_screens/challengers_fontsinuse.png", "Reference-context serif, useful only as accent"],
  ];
  for (let i = 0; i < imgs.length; i++) {
    const [name, rel, cap] = imgs[i];
    const x = 64 + (i % 2) * 590;
    const y = 174 + Math.floor(i / 2) * 238;
    await addImage(s, rel, x, y, 530, 164, { fit: "cover", crop: i === 0 ? { left: 0, top: 0, right: 0, bottom: 0.12 } : undefined });
    addText(s, name, x, y + 174, 240, 28, { font: F.heading, size: 29, bold: true, color: C.ink });
    addText(s, cap, x, y + 204, 500, 30, { font: F.body, size: 17, bold: true, color: C.graphite });
  }
  note(s, sourceNotes.fontResearch);
}

async function slide12() {
  const s = presentation.slides.add();
  s.background.fill = C.white;
  title(s, "Open test fonts");
  addText(s, "Use these free/open candidates for prototyping and motion studies while the paid logo typeface is chosen.", 64, 112, 1000, 36, { font: F.body, size: 22, bold: true, color: C.graphite });
  await addImage(s, "bend_proposal_assets/font_specimens.png", 64, 164, 728, 420, { fit: "contain" });
  const picks = [
    ["Court Pulse", "Syncopate first, Michroma as a Eurostile-adjacent test"],
    ["Night Match", "Orbitron for angular speed, Tourney for stencil moments"],
    ["Air Bounce", "Gabarito for flavor-led softness"],
    ["System copy", "Work Sans as a reference-adjacent neutral grotesk"],
  ];
  picks.forEach(([h, b], i) => {
    const y = 176 + i * 96;
    addText(s, h, 840, y, 300, 32, { font: F.heading, size: 31, bold: true, color: C.ink });
    addText(s, b, 840, y + 36, 340, 44, { font: F.body, size: 19, bold: false, color: C.graphite });
  });
  foot(s, "These fonts are for prototypes. Final Bend wordmark should become custom outlines.");
  note(s, sourceNotes.fontResearch + "\nOpen font specimen board rendered locally using Google Fonts CSS.");
}

async function slide13() {
  const s = presentation.slides.add();
  s.background.fill = C.paper;
  title(s, "Color system");
  addText(s, "Three selected routes can share one core palette while each keeps a clear product role.", 64, 112, 820, 38, { font: F.body, size: 22, bold: true, color: C.graphite });
  addText(s, "02 Court Pulse", 64, 174, 320, 34, { font: F.heading, size: 34, bold: true, color: C.ink });
  addColorSwatch(s, 64, 222, 168, 110, C.deepBlue, "Deep Blue", "#061847", true);
  addColorSwatch(s, 244, 222, 168, 110, C.courtBlue, "Court Blue", "#168FD8");
  addColorSwatch(s, 424, 222, 168, 110, C.ball, "Ball Acid", "#C8FF22");
  addText(s, "04 Night Match", 64, 376, 320, 34, { font: F.heading, size: 34, bold: true, color: C.ink });
  addColorSwatch(s, 64, 424, 168, 110, C.ink, "Black Court", "#050505", true);
  addColorSwatch(s, 244, 424, 168, 110, C.deepBlue, "Night Navy", "#061847", true);
  addColorSwatch(s, 424, 424, 168, 110, C.chrome, "Chrome", "#B9BAB3");
  addText(s, "05 Air Bounce", 704, 174, 320, 34, { font: F.heading, size: 34, bold: true, color: C.ink });
  addColorSwatch(s, 704, 222, 168, 110, "#DFF6FF", "Sky Foam", "#DFF6FF");
  addColorSwatch(s, 884, 222, 168, 110, C.peach, "Peach", "#F6A178");
  addColorSwatch(s, 1064, 222, 168, 110, C.lavender, "Lavender", "#BBA7FF");
  addText(s, "Usage rules", 704, 386, 320, 34, { font: F.heading, size: 34, bold: true, color: C.ink });
  addText(s, "Court Pulse: blue first, acid second.\nNight Match: black and navy first, acid as the hit.\nAir Bounce: white/sky first, flavor colors only on selected letters or packs.", 704, 432, 430, 116, { font: F.body, size: 21, bold: true, color: C.graphite });
  note(s, "Color directions derived from local reference image palette extraction and user-selected routes 02, 04, and 05.");
}

async function slide14() {
  const s = presentation.slides.add();
  s.background.fill = C.white;
  title(s, "Graphic system");
  await addImage(s, "image 3308.png", 736, 72, 416, 416, { crop: { left: 0.02, top: 0.02, right: 0.02, bottom: 0.02 } });
  addRect(s, 700, 44, 520, 520, "linear(90deg, #FFFFFF/86 0%, #FFFFFF/18 100%)");
  const rows = [
    ["Court geometry", "Use lines as structure: dividers, score cells, ingredient grids, and motion paths."],
    ["Felt and chrome", "Pair soft ball texture with hard bottle materials for product credibility."],
    ["Letter motion", "Animate or vary the wordmark baseline, width, skew, and echo by product line."],
    ["Micro formula labels", "Use compact ingredient labels as a contrast to large emotional typography."],
  ];
  rows.forEach(([h, b], i) => {
    const y = 148 + i * 112;
    addText(s, "0" + (i + 1), 64, y, 52, 28, { font: F.tech, size: 23, bold: true, color: C.courtBlue });
    addText(s, h, 124, y - 4, 360, 34, { font: F.heading, size: 34, bold: true, color: C.ink });
    addText(s, b, 124, y + 34, 520, 52, { font: F.body, size: 20, bold: false, color: C.graphite });
  });
  foot(s, "Avoid generic gym-supplement tropes. The product should feel like court-performance equipment.");
  note(s, "Uses local user-supplied image 3308 as a motion and repetition reference.");
}

async function slide15() {
  const s = presentation.slides.add();
  s.background.fill = C.paper;
  title(s, "Web page examples");
  addText(s, "Three prototype page directions show how the logo and type system can flex across digital product surfaces.", 64, 112, 940, 38, { font: F.body, size: 22, bold: true, color: C.graphite });
  await addImage(s, "bend_proposal_assets/web_mockups.png", 64, 166, 1152, 450, { fit: "contain" });
  foot(s, "Page examples use local reference photography and open-font prototypes.");
  note(s, "Web mockup sheet generated locally using local reference images and open Google font prototypes.");
}

async function slide16() {
  const s = presentation.slides.add();
  s.background.fill = C.deepBlue;
  title(s, "Development plan", true);
  addText(s, "Recommended next step: develop a custom Bend wordmark from the Court Pulse master skeleton, then derive Night Match and Air Bounce alternates from the same drawing.", 64, 128, 1020, 80, { font: F.body, size: 27, bold: true, color: C.white });
  const steps = [
    ["1", "Choose font base", "Shortlist Druk, Monument, Eurostile/Microgramma territory, and the open prototypes."],
    ["2", "Draw custom BEND", "Model the baseline bend, counters, and D curve as owned vector lettering."],
    ["3", "Test real assets", "Apply the mark to bottle, sachet, web hero, social motion, stickers, and court signage."],
    ["4", "Lock guidelines", "Finalize color ratios, typography rules, logo clearspace, export set, and licensing."],
  ];
  steps.forEach(([n, h, b], i) => {
    const x = 64 + i * 294;
    addText(s, n, x, 280, 44, 52, { font: F.heading, size: 48, bold: true, color: C.ball });
    addText(s, h, x, 352, 238, 38, { font: F.heading, size: 30, bold: true, color: C.white });
    addText(s, b, x, 402, 235, 108, { font: F.body, size: 19, bold: false, color: "#FFFFFF/74" });
  });
  addText(s, "BEND", 826, 566, 350, 80, { font: F.impact, size: 70, bold: true, color: C.ball });
  note(s, "Development plan based on user feedback and the revised brand proposal content.");
}

await fs.mkdir(TMP_DIR, { recursive: true });
await fs.mkdir(path.dirname(FINAL_PPTX), { recursive: true });

await slide1();
await slide2();
await slide3();
await slide4();
await slide5();
await slide6();
await slide7();
await slide8();
await slide9();
await slide10();
await slide11();
await slide12();
await slide13();
await slide14();
await slide15();
await slide16();

const { finalizePresentation } = await import(pathToFileURL(
  path.join(SKILL_DIR, "container_tools/artifact_tool_utils.mjs"),
).href);

const candidatePath = path.join(TMP_DIR, "bend_identity_candidate.pptx");
await (await PresentationFile.exportPptx(presentation)).save(candidatePath);

const requirements = {
  explicitTotalSlideCount: 16,
  requiredNativeTableOwnerSlides: [],
  requiredNativeChartOwnerSlides: [],
};

const fontPolicy = {
  basis: "design",
  families: [F.heading, F.body, F.tech, F.impact],
};

await finalizePresentation({
  ...requirements,
  workspaceDir,
  candidatePath,
  finalPath: FINAL_PPTX,
  pythonExecutable: RUNTIME_PYTHON,
  integrityValidatorPath: path.join(SKILL_DIR, "container_tools/inspect_presentation_package_integrity.py"),
  layoutValidatorPath: path.join(SKILL_DIR, "container_tools/inspect_presentation_layout_geometry.py"),
  layoutArgs: [
    "--expected-slide-size-emu", EMU_16_9,
    "--validate-bullet-geometry",
    "--validate-heading-fit",
  ],
  requiredNativeTableOwnerSlides: [],
  fontPolicy,
  verifyArtifactToolImport: true,
  receiptPath: path.join(TMP_DIR, `${path.basename(FINAL_PPTX)}.validation.json`),
});

const montage = await presentation.export({ format: "webp", montage: true, scale: 1 });
await fs.writeFile(path.join(TMP_DIR, "bend_identity_montage.webp"), new Uint8Array(await montage.arrayBuffer()));

for (let i = 0; i < presentation.slides.length; i += 1) {
  const slide = presentation.slides.get(i);
  const preview = await presentation.export({ slide, format: "png", scale: 1 });
  await fs.writeFile(path.join(TMP_DIR, `slide-${String(i + 1).padStart(2, "0")}.png`), new Uint8Array(await preview.arrayBuffer()));
}

console.log(FINAL_PPTX);
