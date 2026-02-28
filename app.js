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

  const categoriasExistentes = [...new Set(songs.map(x => x.section))];
  const seccionesFinales = ["Todas", ...categoriasExistentes];

  seccionesFinales.forEach(sec => {
    const d = document.createElement("div");
    d.textContent = sec;

    if (sec === currentSection) {
      d.classList.add("active");
    }

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
    .filter(x =>
      (currentSection === "Todas" || x.section === currentSection) &&
      x.title.toLowerCase().includes(search)
    )
    .sort((a, b) => a.title.localeCompare(b.title))
    .forEach(s => {

      const row = document.createElement("div");
      row.className = "song-row";
      row.textContent = s.title;

      const btn = document.createElement("button");
      btn.textContent = "Añadir";
      btn.className = "song-btn";
      btn.onclick = (e) => {
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
    eye.className = "eye-btn";
    eye.textContent = "👁";
    eye.onclick = () => openSong(s);

    const remove = document.createElement("button");
    remove.className = "remove-btn";
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
// VISOR DE CANCIÓN
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

document.getElementById("closeBtn").onclick = () => {
  document.getElementById("songDialog").close();
};

// ============================
// BUSCADOR
// ============================
document.getElementById("search").addEventListener("input", renderSongs);

// ============================
// DESCARGAR PDF (si ya lo usabas)
// ============================
document.getElementById("downloadBtn").addEventListener("click", () => {
  if (selected.length === 0) {
    alert("Selecciona al menos una canción");
    return;
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  selected.forEach((s, i) => {
    if (i > 0) pdf.addPage();
    pdf.text(s.title, 10, 10);
    pdf.addImage(s.image, "PNG", 10, 20, 180, 250);
  });

  pdf.save("Cancionero-Misa.pdf");
});

// ============================
// DESCARGAR PPT AUTOMÁTICO
// ============================
document.getElementById("downloadPPTBtn").addEventListener("click", downloadPPT);

function downloadPPT() {
  if (selected.length === 0) {
    alert("Selecciona al menos una canción");
    return;
  }

  const pptx = new PptxGenJS();

  pptx.defineSlideMaster({
    title: "MASTER",
    background: { fill: "000000" }
  });

  selected.forEach(song => {
    const slide = pptx.addSlide("MASTER");

    slide.addText(song.title, {
      x: 0.5,
      y: 0.4,
      w: "90%",
      h: 1,
      fontSize: 28,
      bold: true,
      color: "FFFFFF",
      align: "center"
    });

    slide.addImage({
      path: song.image,
      x: 0.5,
      y: 1.6,
      w: "90%",
      h: 4.5
    });
  });

  pptx.writeFile("Cancionero-Misa.pptx");
}
