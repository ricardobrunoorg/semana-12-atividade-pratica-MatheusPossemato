const API_KEY = "aeab10813e0d2b6ef542d06c501006c1"; 
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";
const BACKDROP_BASE = "https://image.tmdb.org/t/p/w1280";

const movieList     = document.getElementById("movie-list");
const loader        = document.getElementById("loader");
const message       = document.getElementById("message");
const searchInput   = document.getElementById("search-input");
const btnSearch     = document.getElementById("btn-search");
const filterBtns    = document.querySelectorAll(".filter-btn");
const modalOverlay  = document.getElementById("modal-overlay");
const modalHeader   = document.getElementById("modal-header");
const modalBody     = document.getElementById("modal-body");
const sectionTitle  = document.getElementById("section-title");

let currentFilter = "popular";

const filterLabels = {
  popular:     ["Filmes", "Populares"],
  now_playing: ["Em", "Cartaz"],
  top_rated:   ["Mais Bem", "Avaliados"],
  upcoming:    ["Em", "Breve"],
};

async function fetchMovies(query = "") {
  const url = query
    ? `${BASE_URL}/search/movie?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}`
    : `${BASE_URL}/movie/${currentFilter}?api_key=${API_KEY}&language=pt-BR`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Erro na requisição: ${response.status}`);
  const data = await response.json();
  return data.results;
}

function createMovieCard(movie) {
  const card = document.createElement("div");
  card.className = "movie-card";

  const year = movie.release_date ? movie.release_date.slice(0, 4) : "—";
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";

  const posterContent = movie.poster_path
    ? `<img class="card-poster" src="${IMG_BASE}${movie.poster_path}" alt="${movie.title}" loading="lazy" />`
    : `<div class="card-poster-placeholder">🎬</div>`;

  card.innerHTML = `
    ${posterContent}
    <div class="card-rating">★ ${rating}</div>
    <div class="card-body">
      <p class="card-title" title="${movie.title}">${movie.title}</p>
      <p class="card-year">${year}</p>
    </div>
  `;

  card.addEventListener("click", () => openModal(movie));
  return card;
}

function renderMovies(movies) {
  movieList.innerHTML = "";

  if (!movies || movies.length === 0) {
    showMessage("Nenhum filme encontrado.");
    return;
  }

  hideMessage();
  movies.forEach((movie, i) => {
    const card = createMovieCard(movie);
    card.style.animationDelay = `${i * 40}ms`;
    movieList.appendChild(card);
  });
}

function showMessage(text) {
  message.textContent = text;
  message.classList.add("visible");
}

function hideMessage() {
  message.classList.remove("visible");
  message.textContent = "";
}

async function init() {
  showLoader();
  try {
    const movies = await fetchMovies();
    renderMovies(movies);
  } catch (err) {
    console.error(err);
    showMessage("Erro ao carregar filmes. Verifique sua chave de API.");
  } finally {
    hideLoader();
  }
}

function showLoader() {
  loader.classList.add("visible");
  movieList.innerHTML = "";
  hideMessage();
}

function hideLoader() {
  loader.classList.remove("visible");
}

async function handleSearch() {
  const query = searchInput.value.trim();
  if (!query) {
    // sem texto: recarrega o filtro atual
    updateSectionTitle(currentFilter);
    init();
    return;
  }

  sectionTitle.innerHTML = `Resultado para <span>"${query}"</span>`;

  filterBtns.forEach(b => b.classList.remove("active"));

  showLoader();
  try {
    const movies = await fetchMovies(query);
    renderMovies(movies);
  } catch (err) {
    console.error(err);
    showMessage("Erro ao buscar filmes.");
  } finally {
    hideLoader();
  }
}

btnSearch.addEventListener("click", handleSearch);

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSearch();
});

filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    searchInput.value = "";
    updateSectionTitle(currentFilter);
    init();
  });
});

function updateSectionTitle(filter) {
  const [a, b] = filterLabels[filter] || ["Filmes", ""];
  sectionTitle.innerHTML = `${a} <span>${b}</span>`;
}

function openModal(movie) {
  const year  = movie.release_date ? movie.release_date.slice(0, 4) : "—";
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";
  const overview = movie.overview || "Sinopse não disponível.";

  const backdropContent = movie.backdrop_path
    ? `<img class="modal-backdrop" src="${BACKDROP_BASE}${movie.backdrop_path}" alt="${movie.title}" />`
    : `<div class="modal-backdrop-placeholder">🎬</div>`;

  modalHeader.innerHTML = `
    ${backdropContent}
    <button class="modal-close" id="btn-close-modal" aria-label="Fechar">✕</button>
  `;

  modalBody.innerHTML = `
    <h2 class="modal-title">${movie.title}</h2>
    <div class="modal-meta">
      <span>📅 ${year}</span>
      <span>⭐ ${rating} / 10</span>
      ${movie.vote_count ? `<span>🗳 ${movie.vote_count.toLocaleString()} votos</span>` : ""}
      ${movie.original_language ? `<span>🌐 ${movie.original_language.toUpperCase()}</span>` : ""}
    </div>
    <p class="modal-overview">${overview}</p>
  `;

  modalOverlay.classList.add("open");
  document.body.style.overflow = "hidden";

  document.getElementById("btn-close-modal").addEventListener("click", closeModal);
}

function closeModal() {
  modalOverlay.classList.remove("open");
  document.body.style.overflow = "";
}

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

init();
 