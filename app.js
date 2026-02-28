// ============================
// ESTADO GLOBAL
// ============================
let songs = [];
let selected = [];
let currentSection = "Todas";

// ============================
// CARGA DE CANCIONES
// ============================
async function loadSongs() {
  const r = await fetch("songs.json");
  songs = await r.json();
  renderSections();
  renderSongs();
}

document.addEventListener("DOMContentLoaded", loadSongs);

// ============================
// SECCIONES
// ============================
function renderSections() {
  const c = document.getElementById("sections");
  c.innerHTML = "";

  const categorias = [...new Set(songs.map(s => s.section))];
  const secciones = ["Todas", ...categorias];

  secciones.forEach(sec => {
    const d = document.createElement("div");
    d.textContent = sec;
    if (sec === currentSection) d.classList.add("active");

    d.onclick = () => {
      currentSection = sec;
      renderSections();
      renderSongs();
    };

    c.appendChild(d);
  });
}

// ============================
// LISTA DE CANCIONES
// ============================
function renderSongs() {
  const c = document.getElementById("songs");
  c.innerHTML = "";
  const search = (document.getElementById("search").value || "").toLowerCase();

  songs
    .filter(s =>
      (currentSection === "Todas" || s.section === currentSection) &&
      s.title.toLowerCase().includes(search)
    )
    .sort((a, b) => a.title.localeCompare(b.title))
    .forEach(song => {
      const row = document.createElement("div");
      row.className = "song-row";
      row.textContent = song.title;

      const btn = document.createElement("button");
      btn.textContent = "Añadir";
      btn.className = "song-btn";
      btn.onclick = e => {
        e.stopPropagation();
        if (!selected.find(s => s.id === song.id)) {
          selected.push(song);
          renderSelected();
        }
      };

      row.appendChild(btn);
      row.onclick = () => openSong(song);
      c.appendChild(row);
    });
}

// ============================
// SELECCIONADAS
// ============================
function renderSelected() {
  const c = document.getElementById("selectedList");
  c.innerHTML = "";

  selected.forEach((song, i) => {
    const row = document.createElement("div");
    row.className = "selected-item";

    const title = document.createElement("div");
    title.textContent = song.title;

    const actions = document.createElement("div");
    actions.className = "action-buttons";

    const eye = document.createElement("button");
    eye.textContent = "👁";
    eye.onclick = () => openSong(song);

    const remove = document.createElement("button");
    remove.textContent = "✕";
    remove.onclick = () => {
      selected.splice(i, 1);
      renderSelected();
    };

    actions.appendChild(eye);
    actions.appendChild(remove);
    row.appendChild(title);
    row.appendChild(actions);
    c.appendChild(row);
  });
}

// ============================
// MODAL DE CANCIÓN
// ============================
function openSong(song) {
  document.getElementById("songTitle").textContent = song.title;
  document.getElementById("songSection").textContent = song.section;

  const body = document.getElementById("songBody");
  body.innerHTML = "";

  const img = document.createElement("img");
  img.src = song.image;
  img.style.width = "100%";
  img.style.background = "black";

  body.appendChild(img);
  document.getElementById("songDialog").showModal();
}

document.getElementById("closeBtn").onclick = () =>
  document.getElementById("songDialog").close();

// ============================
// PPT AUTOMÁTICO (PERFECTO)
// ============================
document
  .getElementById("downloadPPTBtn")
  .addEventListener("click", downloadPPT);

async function downloadPPT() {
  if (selected.length === 0) {
    alert("Selecciona al menos una canción");
    return;
  }

  const pptx = new PptxGenJS();

  pptx.defineSlideMaster({
    title: "MASTER",
    background: { fill: "000000" }
  });

  for (const song of selected) {
    const img = await loadImage(song.image);

    const MAX_HEIGHT = 500;
    const parts = Math.ceil(img.height / MAX_HEIGHT);

    for (let i = 0; i < parts; i++) {
      const slide = pptx.addSlide("MASTER");

      if (i === 0) {
        slide.addText(song.title, {
          x: 0.5,
          y: 0.3,
          w: "90%",
          h: 0.8,
          fontSize: 28,
          bold: true,
          color: "FFFFFF",
          align: "center"
        });
      }

      slide.addImage({
        path: song.image,
        x: 0.5,
        y: 1.2,
        w: "90%",
        h: "80%",
        sizing: {
          type: "contain",
          y: (img.height / parts) * i,
          h: img.height / parts
        }
      });
    }
  }

  pptx.writeFile("Cancionero-Misa.pptx");
}

// ============================
// UTILIDAD IMAGEN
// ============================
function loadImage(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = src;
  });
}
