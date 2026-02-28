let songs = [];
let selected = [];
let currentSection = "Todas";

// ============================
// CARGAR CANCIONES
// ============================
async function loadSongs() {
  const r = await fetch("songs.json");
  songs = await r.json();
  renderSections();
  renderSongs();
}
loadSongs();

// ============================
// SECCIONES
// ============================
function renderSections() {
  const c = document.getElementById("sections");
  c.innerHTML = "";

  const categorias = [...new Set(songs.map(s => s.section))];
  const final = ["Todas", ...categorias];

  final.forEach(sec => {
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
    .forEach(s => {
      const row = document.createElement("div");
      row.className = "song-row";
      row.textContent = s.title;

      const btn = document.createElement("button");
      btn.textContent = "Añadir";
      btn.className = "song-btn";
      btn.onclick = e => {
        e.stopPropagation();
        if (!selected.find(x => x.id === s.id)) {
          selected.push(s);
          renderSelected();
        }
      };

      row.appendChild(btn);
      row.onclick = () => openSong(s);
      c.appendChild(row);
    });
}

// ============================
// SELECCIONADAS
// ============================
function renderSelected() {
  const c = document.getElementById("selectedList");
  c.innerHTML = "";

  selected.forEach((s, i) => {
    const row = document.createElement("div");
    row.className = "selected-item";

    const title = document.createElement("div");
    title.textContent = s.title;

    const actions = document.createElement("div");
    actions.className = "action-buttons";

    const eye = document.createElement("button");
    eye.textContent = "👁";
    eye.onclick = () => openSong(s);

    const remove = document.createElement("button");
    remove.textContent = "X";
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
// VISOR
// ============================
function openSong(song) {
  document.getElementById("songTitle").textContent = song.title;
  document.getElementById("songSection").textContent = song.section;

  const body = document.getElementById("songBody");
  body.innerHTML = "";

  const img = document.createElement("img");
  img.src = song.image;
  img.style.width = "100%";
  body.appendChild(img);

  document.getElementById("songDialog").showModal();
}

document.getElementById("closeBtn").onclick = () =>
  document.getElementById("songDialog").close();

document.getElementById("search").addEventListener("input", renderSongs);

// ============================
// DESCARGAR PPT CON DIVISIÓN
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
    await addSongSlides(pptx, song);
  }

  pptx.writeFile("Cancionero-Misa.pptx");
}

// ============================
// CREA SLIDES SEGÚN ALTURA
// ============================
function addSongSlides(pptx, song) {
  return new Promise(resolve => {
    const img = new Image();
    img.src = song.image;

    img.onload = () => {
      const h = img.height;
      let parts = 1;

      if (h > 2000) parts = 3;
      else if (h > 1200) parts = 2;

      for (let i = 0; i < parts; i++) {
        const slide = pptx.addSlide("MASTER");

        slide.addText(song.title, {
          x: 0.5,
          y: 0.3,
          w: "90%",
          fontSize: 26,
          bold: true,
          color: "FFFFFF",
          align: "center"
        });

        slide.addImage({
          path: song.image,
          x: 0.5,
          y: 1.3,
          w: "90%",
          h: 4.8,
          sizing: {
            type: "crop",
            y: (img.height / parts) * i,
            h: img.height / parts
          }
        });
      }

      resolve();
    };
  });
}
