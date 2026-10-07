const STORAGE_KEY = "emocoes-em-foco-trabalhos";

let trabalhos = carregarTrabalhos();
let indiceEditando = null;
let indiceRemovendo = null;

const raiz = document.getElementById("conteudo");
const campo = document.getElementById("busca");
const limparBusca = document.getElementById("limparBusca");
const modal = document.getElementById("modal");
const adicionarModal = document.getElementById("adicionarModal");
const formAdicionar = document.getElementById("formAdicionar");
const abrirAdicionar = document.getElementById("abrirAdicionar");
const removerModal = document.getElementById("removerModal");
const confirmarRemocao = document.getElementById("confirmarRemocao");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");
const toastIcon = document.getElementById("toastIcon");
const confettiContainer = document.getElementById("confettiContainer");
let toastTimer = null;

function carregarTrabalhos() {
  try {
    const dados = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

function salvarTrabalhos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trabalhos));
}

function el(tag, cls, text, kids) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined && text !== null) e.textContent = text;
  (kids || []).forEach(k => e.appendChild(k));
  return e;
}

function mostrarToast(mensagem, tipo = "sucesso") {
  if (!toast) return;
  clearTimeout(toastTimer);
  toast.classList.remove("show", "error");
  toastIcon.textContent = tipo === "error" ? "!" : "✓";
  toastMessage.textContent = mensagem;
  if (tipo === "error") toast.classList.add("error");
  requestAnimationFrame(() => toast.classList.add("show"));
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
}

function soltarConfetes() {
  if (!confettiContainer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  confettiContainer.innerHTML = "";
  const formas = ["square", "circle", "diamond"];
  const quantidade = 42;
  for (let i = 0; i < quantidade; i++) {
    const confete = document.createElement("span");
    confete.className = `confetti ${formas[i % formas.length]}`;
    confete.style.left = `${8 + Math.random() * 84}%`;
    confete.style.setProperty("--x", `${(Math.random() - 0.5) * 180}px`);
    confete.style.setProperty("--delay", `${Math.random() * 180}ms`);
    confete.style.setProperty("--duration", `${850 + Math.random() * 750}ms`);
    confete.style.setProperty("--rotate", `${Math.random() * 720 - 360}deg`);
    confettiContainer.appendChild(confete);
  }
  setTimeout(() => { confettiContainer.innerHTML = ""; }, 1900);
}

function abrirTrabalho(t, index = 0) {
  const accent = ["#c4170c", "#d35b18", "#9d3a2f", "#b51f18", "#7f3029", "#d04a3b"][index % 6];
  document.getElementById("modalIcon").textContent = "✦";
  document.getElementById("modalHead").style.setProperty("--modal-accent", accent);
  document.getElementById("modalKicker").textContent = "Trabalho";
  document.getElementById("modalTitulo").textContent = t.titulo;
  document.getElementById("modalDescricao").textContent = t.descricao || "Trabalho cadastrado pela turma.";
  document.getElementById("modalInfo").replaceChildren(
    el("div", "info-item", "", [el("span", "info-label", "Alunos"), el("strong", "", t.integrantes)]),
    el("div", "info-item", "", [el("span", "info-label", "Link"), el("strong", "", t.link ? "Disponível" : "Não informado")])
  );
  const link = document.getElementById("modalLink");
  if (t.link) {
    link.hidden = false;
    link.href = t.link;
  } else {
    link.hidden = true;
  }
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  document.querySelector("#modal .modal-close").focus();
}

function fecharModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function abrirAdicionarModal() {
  indiceEditando = null;
  adicionarModal.classList.remove("edit-mode");
  document.getElementById("adicionarTitulo").textContent = "Adicionar trabalho";
  document.getElementById("formModalKicker").textContent = "Novo trabalho";
  document.getElementById("submitTrabalho").innerHTML = 'Adicionar trabalho <span>→</span>';
  formAdicionar.reset();
  adicionarModal.classList.add("open");
  adicionarModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  setTimeout(() => document.getElementById("novoTitulo").focus(), 50);
}

function abrirEditarModal(index) {
  const t = trabalhos[index];
  if (!t) return;
  indiceEditando = index;
  adicionarModal.classList.add("edit-mode");
  document.getElementById("adicionarTitulo").textContent = "Editar trabalho";
  document.getElementById("formModalKicker").textContent = "Editar cadastro";
  document.getElementById("submitTrabalho").innerHTML = 'Salvar alterações <span>✓</span>';
  document.getElementById("novoTitulo").value = t.titulo || "";
  document.getElementById("novosAlunos").value = t.integrantes || "";
  document.getElementById("novoLink").value = t.link || "";
  adicionarModal.classList.add("open");
  adicionarModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  setTimeout(() => document.getElementById("novoTitulo").focus(), 50);
}

function abrirRemoverModal(index) {
  const t = trabalhos[index];
  if (!t) return;
  indiceRemovendo = index;
  document.getElementById("removerTitulo").textContent = t.titulo || "Trabalho sem título";
  document.getElementById("removerAlunos").textContent = t.integrantes || "Alunos não informados";
  removerModal.classList.add("open");
  removerModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  setTimeout(() => confirmarRemocao.focus(), 50);
}

function fecharRemoverModal() {
  removerModal.classList.remove("open");
  removerModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  indiceRemovendo = null;
}

function removerTrabalho() {
  if (indiceRemovendo === null || !trabalhos[indiceRemovendo]) return;
  trabalhos.splice(indiceRemovendo, 1);
  salvarTrabalhos();
  fecharRemoverModal();
  desenhar();
  mostrarToast("Trabalho removido com sucesso!");
}

function fecharAdicionarModal() {
  adicionarModal.classList.remove("open");
  adicionarModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  indiceEditando = null;
}

document.querySelectorAll("[data-close-modal]").forEach(btn => btn.addEventListener("click", fecharModal));
document.querySelectorAll("[data-close-add]").forEach(btn => btn.addEventListener("click", fecharAdicionarModal));
document.querySelectorAll("[data-close-remove]").forEach(btn => btn.addEventListener("click", fecharRemoverModal));
confirmarRemocao.addEventListener("click", removerTrabalho);
abrirAdicionar.addEventListener("click", abrirAdicionarModal);

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    if (modal.classList.contains("open")) fecharModal();
    if (adicionarModal.classList.contains("open")) fecharAdicionarModal();
    if (removerModal.classList.contains("open")) fecharRemoverModal();
  }
});

formAdicionar.addEventListener("submit", e => {
  e.preventDefault();
  const titulo = document.getElementById("novoTitulo").value.trim();
  const alunos = document.getElementById("novosAlunos").value.trim();
  const link = document.getElementById("novoLink").value.trim();

  if (!titulo || !alunos) return;

  const estavaEditando = indiceEditando !== null && trabalhos[indiceEditando];

  if (estavaEditando) {
    trabalhos[indiceEditando].titulo = titulo;
    trabalhos[indiceEditando].integrantes = alunos;
    trabalhos[indiceEditando].link = link;
  } else {
    trabalhos.push({
      titulo,
      integrantes: alunos,
      link,
      grupo: `Trabalho ${trabalhos.length + 1}`,
      formato: "Trabalho",
      descricao: "Trabalho cadastrado pela turma."
    });
  }

  salvarTrabalhos();
  formAdicionar.reset();
  fecharAdicionarModal();
  desenhar();
  document.getElementById("trabalhos").scrollIntoView({ behavior: "smooth", block: "start" });

  if (estavaEditando) {
    mostrarToast("Trabalho editado com sucesso!");
  } else {
    mostrarToast("Trabalho adicionado com sucesso!");
    soltarConfetes();
  }
});

function criarAcoes(index) {
  const acoes = el("div", "card-actions");
  const editar = el("button", "edit-btn", "Editar");
  const remover = el("button", "remove-btn", "Remover");
  editar.type = "button";
  remover.type = "button";
  editar.title = "Editar trabalho";
  remover.title = "Remover trabalho";
  editar.addEventListener("click", e => { e.stopPropagation(); abrirEditarModal(index); });
  remover.addEventListener("click", e => { e.stopPropagation(); abrirRemoverModal(index); });
  acoes.append(editar, remover);
  return acoes;
}

function card(t, index) {
  const c = el("article", "card");
  c.style.setProperty("--delay", `${Math.min(index * 55, 330)}ms`);
  c.style.setProperty("--accent", ["#c4170c", "#d35b18", "#9d3a2f", "#b51f18", "#7f3029", "#d04a3b"][index % 6]);
  c.tabIndex = 0;
  c.setAttribute("role", "button");
  c.setAttribute("aria-label", `Abrir detalhes de ${t.titulo}`);
  c.appendChild(el("div", "card-top", "", [el("span", "format-tag", "Trabalho"), el("span", "card-arrow", "↗")]));
  c.appendChild(el("div", "card-icon", "✦"));
  c.appendChild(el("h3", "", t.titulo));
  c.appendChild(el("p", "", t.descricao || "Trabalho cadastrado pela turma."));
  const footer = el("div", "card-footer");
  footer.appendChild(el("span", "group", t.integrantes));
  footer.appendChild(criarAcoes(index));
  c.appendChild(footer);
  c.addEventListener("click", () => abrirTrabalho(t, index));
  c.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrirTrabalho(t, index); } });
  return c;
}

function destaque(t, index) {
  const c = el("article", "destaque");
  c.style.setProperty("--accent", "#c4170c");
  c.appendChild(el("div", "featured-glow"));
  c.appendChild(el("div", "featured-icon", "✦"));
  c.appendChild(el("div", "featured-content", "", [
    el("span", "featured-label", "Trabalho em destaque"),
    el("h2", "", t.titulo),
    el("p", "", t.descricao || "Trabalho cadastrado pela turma."),
    el("div", "featured-meta", "", [el("span", "", t.integrantes)])
  ]));
  const featuredActions = el("div", "featured-actions");
  const btn = el("button", "featured-button", "Ver detalhes →");
  btn.type = "button";
  btn.addEventListener("click", e => { e.stopPropagation(); abrirTrabalho(t, index); });
  featuredActions.appendChild(btn);
  featuredActions.appendChild(criarAcoes(index));
  c.appendChild(featuredActions);
  return c;
}

function tile(t, index) {
  const accents = ["#b51f18", "#7f3029"];
  const c = el("article", "tile");
  c.style.setProperty("--accent", accents[index % accents.length]);
  c.tabIndex = 0;
  c.setAttribute("role", "button");
  c.appendChild(el("div", "tile-icon", index === 0 ? "◈" : "✧"));
  c.appendChild(el("div", "tile-content", "", [el("span", "format-tag light", "Trabalho"), el("h3", "", t.titulo), el("p", "", t.integrantes)]));
  c.appendChild(el("span", "tile-arrow", "→"));
  c.addEventListener("click", () => abrirTrabalho(t, index + 1));
  c.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrirTrabalho(t, index + 1); } });
  return c;
}

function listaFiltrada() {
  const q = campo.value.trim().toLowerCase();
  return trabalhos.filter(t => !q || Object.values(t).join(" ").toLowerCase().includes(q));
}

function estadoVazio() {
  return el("div", "vazio", "", [
    el("div", "empty-icon", "＋"),
    el("h3", "", "Nenhum trabalho adicionado ainda"),
    el("p", "", "Clique em “Adicionar trabalho” para cadastrar o primeiro trabalho da turma."),
    (() => { const b = el("button", "empty-add-btn", "＋ Adicionar primeiro trabalho"); b.type = "button"; b.addEventListener("click", abrirAdicionarModal); return b; })()
  ]);
}

function desenhar() {
  const lista = listaFiltrada();
  raiz.replaceChildren();
  document.getElementById("statsMini").textContent = `${trabalhos.length} ${trabalhos.length === 1 ? "trabalho" : "trabalhos"} cadastrado${trabalhos.length === 1 ? "" : "s"}`;

  if (campo.value.trim()) {
    raiz.appendChild(el("div", "results-head", "", [el("h2", "secao-title", `${lista.length} ${lista.length === 1 ? "resultado" : "resultados"}`), el("span", "results-filter", "Pesquisa") ]));
    if (lista.length) raiz.appendChild(el("div", "grid", "", lista.map((t, i) => card(t, i))));
    else raiz.appendChild(el("div", "vazio", "", [el("div", "empty-icon", "⌕"), el("h3", "", "Nada encontrado"), el("p", "", "Tente outra palavra ou pesquise pelo nome dos alunos ou trabalho.")]));
    return;
  }

  if (!trabalhos.length) {
    raiz.appendChild(estadoVazio());
    return;
  }

  const [a, ...resto] = trabalhos;

  // O primeiro trabalho recebe destaque, mas todos os demais trabalhos
  // cadastrados continuam visíveis em cards logo abaixo.
  if (a) {
    raiz.appendChild(el("div", "portal", "", [destaque(a, 0)]));
  }

  if (resto.length) {
    raiz.appendChild(el("div", "section-heading", "", [
      el("div", "", "", [
        el("span", "section-label", "Trabalhos cadastrados"),
        el("h2", "secao-title", "Todos os outros trabalhos")
      ]),
      el("span", "section-count", `${resto.length} ${resto.length === 1 ? "disponível" : "disponíveis"}`)
    ]));
    raiz.appendChild(el("div", "grid", "", resto.map((t, i) => card(t, i + 1))));
  }
}

campo.addEventListener("input", desenhar);
limparBusca.addEventListener("click", () => { campo.value = ""; desenhar(); campo.focus(); });
desenhar();
