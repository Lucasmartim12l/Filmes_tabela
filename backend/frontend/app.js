// ==========================================================
// Funções compartilhadas pelas três páginas
// ==========================================================

// Endereço do servidor (server.js). Troque aqui se mudar a porta.
const API_URL = "http://localhost:3067"

// ---------- Comunicação com a API ----------

async function requisicao(caminho, opcoes = {}) {
  const controle = new AbortController()
  // O server.js não responde quando o MySQL dá erro, então sem limite
  // a página ficaria esperando para sempre.
  const limite = setTimeout(() => controle.abort(), 8000)

  try {
    const resposta = await fetch(API_URL + caminho, {
      ...opcoes,
      headers: opcoes.body ? { "Content-Type": "application/json" } : undefined,
      signal: controle.signal,
    })

    if (!resposta.ok) {
      throw new Error(`O servidor respondeu com erro ${resposta.status}. Tente de novo.`)
    }

    return await resposta.json()
  } catch (erro) {
    if (erro.name === "AbortError") {
      throw new Error("O servidor demorou demais para responder. Confira o banco de dados e tente de novo.")
    }
    if (erro instanceof TypeError) {
      throw new Error(`Não foi possível conectar ao servidor. Confira se ele está rodando em ${API_URL}.`)
    }
    throw erro
  } finally {
    clearTimeout(limite)
  }
}

const filmesApi = {
  listar: () => requisicao("/"),

  criar: (filme) => requisicao("/create", { method: "POST", body: JSON.stringify(filme) }),

  // A rota PUT do servidor usa outros nomes de campo:
  // title, gender, duration e ageRating.
  atualizar: (id, filme) =>
    requisicao(`/update/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(filme) }),

  apagar: (id) => requisicao(`/delete/${encodeURIComponent(id)}`, { method: "DELETE" }),
}

// ---------- Classificação indicativa ----------

// Devolve a faixa de cor (L, 10, 12, 14, 16 ou 18) para uma idade qualquer.
function faixaEtaria(idade) {
  const n = Number(idade)
  if (!Number.isFinite(n) || n <= 0) return "L"
  if (n <= 10) return "10"
  if (n <= 12) return "12"
  if (n <= 14) return "14"
  if (n <= 16) return "16"
  return "18"
}

function atualizarSelo(selo, idade) {
  const vazio = idade === "" || idade === null || idade === undefined
  const n = Number(idade)

  if (vazio || !Number.isFinite(n) || n < 0) {
    selo.dataset.faixa = "sem"
    selo.textContent = "?"
    selo.setAttribute("aria-label", "Classificação indicativa não informada")
    return
  }

  selo.dataset.faixa = faixaEtaria(n)
  selo.textContent = n === 0 ? "L" : String(n)
  selo.setAttribute("aria-label", n === 0 ? "Classificação indicativa: livre" : `Classificação indicativa: ${n} anos`)
}

function criarSelo(idade) {
  const selo = document.createElement("span")
  selo.className = "selo"
  selo.setAttribute("role", "img")
  atualizarSelo(selo, idade)
  return selo
}

// Liga o campo de idade ao selo de prévia e aos botões de faixa rápida.
// Devolve uma função para atualizar tudo depois de preencher o campo por código.
function iniciarClassificacao(form) {
  const campo = form.elements.classific_et
  const previa = form.querySelector("#previa")
  const faixas = form.querySelectorAll(".faixa")

  function atualizar() {
    atualizarSelo(previa, campo.value)
    faixas.forEach((botao) => {
      const ativo = campo.value !== "" && Number(campo.value) === Number(botao.dataset.idade)
      botao.setAttribute("aria-pressed", String(ativo))
    })
  }

  campo.addEventListener("input", atualizar)

  faixas.forEach((botao) => {
    botao.addEventListener("click", () => {
      campo.value = botao.dataset.idade
      atualizar()
      campo.focus()
    })
  })

  atualizar()
  return atualizar
}

// ---------- Formulário ----------

// Lê o formulário no formato que a rota POST /create espera.
function lerFormulario(form) {
  return {
    nome: form.elements.nome.value.trim(),
    genero: form.elements.genero.value.trim(),
    duracao: Number(form.elements.duracao.value),
    classific_et: Number(form.elements.classific_et.value),
  }
}

// ---------- Formatação ----------

function formatarDuracao(minutos) {
  const n = Number(minutos)
  if (!Number.isFinite(n) || n <= 0) return "Sem duração"

  const horas = Math.floor(n / 60)
  const resto = n % 60

  if (horas === 0) return `${resto} min`
  return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`
}

// ---------- Elementos reutilizáveis ----------

let temporizadorAviso

function mostrarAviso(texto, tipo) {
  const aviso = document.getElementById("aviso")
  aviso.textContent = texto
  aviso.classList.toggle("aviso--erro", tipo === "erro")
  aviso.classList.add("visivel")

  clearTimeout(temporizadorAviso)
  temporizadorAviso = setTimeout(() => aviso.classList.remove("visivel"), 4000)
}

function criarBotao(texto, classe, aoClicar) {
  const botao = document.createElement("button")
  botao.type = "button"
  botao.className = classe
  botao.textContent = texto
  botao.addEventListener("click", aoClicar)
  return botao
}

function criarLink(texto, href, classe) {
  const link = document.createElement("a")
  link.className = classe
  link.href = href
  link.textContent = texto
  return link
}

// Bloco de mensagem para carregando, lista vazia e erros.
function criarEstado(titulo, texto, acao) {
  const bloco = document.createElement("div")
  bloco.className = "estado"

  if (titulo) {
    const h2 = document.createElement("h2")
    h2.textContent = titulo
    bloco.append(h2)
  }

  const p = document.createElement("p")
  p.textContent = texto
  bloco.append(p)

  if (acao) bloco.append(acao)
  return bloco
}
