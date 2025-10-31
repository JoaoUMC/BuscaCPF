// URL base da API JSON Server
const API = "/api/pessoas";

/* ====== Navegação por abas ====== */
const tabs = document.querySelectorAll("nav button");
const sections = document.querySelectorAll(".tab");

tabs.forEach(btn => {
  btn.addEventListener("click", () => {
    const tab = btn.dataset.tab;
    sections.forEach(s => s.classList.toggle("active", s.id === `tab-${tab}`));
    tabs.forEach(b => b.classList.toggle("active", b === btn));
  });
});

/* ====== Utilitários ====== */
const onlyDigits = (s) => String(s || "").replace(/\D/g, "");
const up = (s) => String(s || "").toUpperCase();

function setMsg(el, text, type = "info") {
  el.textContent = text || "";
  el.dataset.type = type;
}

/* ====== GET (listar/buscar CPF) ====== */
const elCPFBusca = document.getElementById("cpfBusca");
const elFormBusca = document.getElementById("formBusca");
const elBtnTodos = document.getElementById("btnListarTodos");
const elBody = document.querySelector("#tabela tbody");

function renderList(lista) {
  elBody.innerHTML = "";
  lista.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.nome}</td>
      <td>${p.sobrenome}</td>
      <td>${p.email}</td>
      <td>${p.idade}</td>
      <td>${p.telefone}</td>
      <td>${p.rua}</td>
      <td>${p.bairro}</td>
      <td>${p.cidade}</td>
      <td>${p.estado}</td>
      <td>${p.rg}</td>
      <td>${p.cpf ?? ""}</td>
    `;
    elBody.appendChild(tr);
  });
}

async function listAll() {
  const res = await fetch(API);
  const data = await res.json();
  renderList(data);
}

async function searchByCPF(cpf) {
  const res = await fetch(`${API}?cpf=${encodeURIComponent(cpf)}`);
  const data = await res.json();
  renderList(data);
}

elFormBusca.addEventListener("submit", (e) => {
  e.preventDefault();
  const v = onlyDigits(elCPFBusca.value);
  if (!v) return listAll();
  searchByCPF(v);
});
elBtnTodos.addEventListener("click", listAll);
listAll();

/* ====== POST (criar) ====== */
const formPost = document.getElementById("formPost");
const msgPost = document.getElementById("msgPost");

formPost.addEventListener("submit", async (e) => {
  e.preventDefault();
  setMsg(msgPost, "");
  const data = Object.fromEntries(new FormData(formPost).entries());

  data.idade = Number(data.idade);
  data.estado = up(data.estado);
  if (data.cpf) data.cpf = onlyDigits(data.cpf);

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Falha ao criar");
    const novo = await res.json();
    setMsg(msgPost, `Criado com ID ${novo.id}`, "ok");
    formPost.reset();
    listAll();
  } catch (err) {
    setMsg(msgPost, "Erro: " + err.message, "err");
  }
});

/* ====== PUT (buscar+editar) ====== */
const formBuscaPut = document.getElementById("formBuscaPut");
const idBuscaPut = document.getElementById("idBuscaPut");
const cpfBuscaPut = document.getElementById("cpfBuscaPut");
const msgBuscaPut = document.getElementById("msgBuscaPut");
const formPut = document.getElementById("formPut");
const msgPut = document.getElementById("msgPut");

function fillPutForm(p) {
  formPut.elements.id.value = p.id;
  formPut.elements.nome.value = p.nome || "";
  formPut.elements.sobrenome.value = p.sobrenome || "";
  formPut.elements.email.value = p.email || "";
  formPut.elements.idade.value = p.idade ?? "";
  formPut.elements.telefone.value = p.telefone || "";
  formPut.elements.rua.value = p.rua || "";
  formPut.elements.bairro.value = p.bairro || "";
  formPut.elements.cidade.value = p.cidade || "";
  formPut.elements.estado.value = up(p.estado || "");
  formPut.elements.rg.value = p.rg || "";
  formPut.elements.cpf.value = p.cpf || "";
}

formBuscaPut.addEventListener("submit", async (e) => {
  e.preventDefault();
  setMsg(msgBuscaPut, "");
  formPut.hidden = true;

  const id = Number(idBuscaPut.value);
  const cpf = onlyDigits(cpfBuscaPut.value);

  try {
    let pessoa = null;
    if (id) {
      const r = await fetch(`${API}/${id}`);
      if (r.ok) pessoa = await r.json();
    } else if (cpf) {
      const r = await fetch(`${API}?cpf=${encodeURIComponent(cpf)}`);
      const arr = await r.json();
      pessoa = arr[0] || null;
    }

    if (!pessoa) return setMsg(msgBuscaPut, "Registro não encontrado.", "err");
    fillPutForm(pessoa);
    formPut.hidden = false;
  } catch (err) {
    setMsg(msgBuscaPut, "Erro: " + err.message, "err");
  }
});

formPut.addEventListener("submit", async (e) => {
  e.preventDefault();
  setMsg(msgPut, "");
  const data = Object.fromEntries(new FormData(formPut).entries());
  const id = Number(data.id);

  data.idade = Number(data.idade);
  data.estado = up(data.estado);
  if (data.cpf) data.cpf = onlyDigits(data.cpf);

  try {
    const res = await fetch(`${API}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Falha ao atualizar");
    setMsg(msgPut, "Registro atualizado com sucesso.", "ok");
    listAll();
  } catch (err) {
    setMsg(msgPut, "Erro: " + err.message, "err");
  }
});

/* ====== DELETE (por ID ou CPF) ====== */
const formDel = document.getElementById("formDel");
const idDel = document.getElementById("idDel");
const cpfDel = document.getElementById("cpfDel");
const msgDel = document.getElementById("msgDel");

async function getByCPF(cpf) {
  const r = await fetch(`${API}?cpf=${encodeURIComponent(cpf)}`);
  const arr = await r.json();
  return arr[0] || null;
}

formDel.addEventListener("submit", async (e) => {
  e.preventDefault();
  setMsg(msgDel, "");

  let id = Number(idDel.value);
  const cpf = onlyDigits(cpfDel.value);

  try {
    if (!id && cpf) {
      const p = await getByCPF(cpf);
      if (!p) return setMsg(msgDel, "Registro não encontrado pelo CPF.", "err");
      id = p.id;
    }
    if (!id) return setMsg(msgDel, "Informe um ID ou CPF válido.", "err");

    const res = await fetch(`${API}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Falha ao excluir");
    setMsg(msgDel, `Registro ID ${id} excluído.`, "ok");
    formDel.reset();
    listAll();
  } catch (err) {
    setMsg(msgDel, "Erro: " + err.message, "err");
  }
});
