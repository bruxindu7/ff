"use client";


import { useEffect } from "react";
import Image from "next/image";
import "./styles.css";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast"; // 🔥 importa o hook

export default function Home() {
  const router = useRouter(); // funciona no App Router
    const { showToast, Toasts } = useToast(); // 
    function showSocialModal() {
    document.getElementById("socialOverlay")?.classList.add("show");
    document.getElementById("socialModal")?.classList.add("show");
  }
  useEffect(() => {
    
    // ==========================
    // Carrossel automático
    // ==========================
    const track = document.querySelector(".carousel-track") as HTMLElement;
    const slides = document.querySelectorAll(".carousel-slide");
    const dots = document.querySelectorAll(".carousel-indicators .dot");
    let index = 0;
    const totalSlides = slides.length;

    function showSlide(i: number) {
      if (!track) return;
      index = (i + totalSlides) % totalSlides; // loop infinito
      track.style.transform = `translateX(-${index * 100}%)`;

      dots.forEach((d, idx) =>
        d.classList.toggle("active", idx === index)
      );
    }

    // autoplay
    const interval = setInterval(() => {
      showSlide(index + 1);
    }, 4000); // muda a cada 4s

    // botões manuais
    document
      .querySelector(".carousel-btn.next")
      ?.addEventListener("click", () => showSlide(index + 1));
    document
      .querySelector(".carousel-btn.prev")
      ?.addEventListener("click", () => showSlide(index - 1));

    // dots manuais
    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => showSlide(i));
    });

    return () => clearInterval(interval);
   }, []);

  // 🔥 Novo useEffect só para input e botão login
  useEffect(() => {
    const inputPlayer = document.getElementById("playerId") as HTMLInputElement;
    const btnLogin = document.querySelector(".btn-login") as HTMLButtonElement;

    if (!inputPlayer || !btnLogin) return;

    // começa desabilitado
    btnLogin.disabled = true;

    inputPlayer.addEventListener("input", () => {
      // só aceita números
      inputPlayer.value = inputPlayer.value.replace(/\D/g, "");

      // ativa botão apenas se tiver número
      btnLogin.disabled = inputPlayer.value.length === 0;
    });
  }, []);

  useEffect(() => {
    
    // ==========================
    // Variáveis globais
    // ==========================
    let selectedPrice: string | null = null;
    let selectedBase: string | null = null;
    let selectedBonus: string | null = null;
    let selectedPayment: boolean | null = null;

    // ==========================
    // Verificação do botão checkout
    // ==========================
    function checkCheckoutReady() {
      const btn = document.getElementById("checkoutBtn") as HTMLButtonElement;
      if (selectedPrice && selectedPayment) {
        btn?.classList.add("enabled");
        btn?.removeAttribute("disabled");
      } else {
        btn?.classList.remove("enabled");
        btn?.setAttribute("disabled", "true");
      }
    }

// ==========================
// Seleção dos valores normais
// ==========================
document.querySelectorAll(".value").forEach((button) => {
  button.addEventListener("click", () => {
    selectedPrice = (button as HTMLElement).dataset.price || null;
    selectedBase = button.textContent?.trim() || null;
    selectedBonus = (button as HTMLElement).dataset.bonus || null;

    document.querySelectorAll(".plan").forEach((p) => p.classList.remove("selected"));
    document.querySelectorAll(".value").forEach((b) => b.classList.remove("selected"));
    button.classList.add("selected");

    // ========= Métodos de pagamento =========
    document.querySelectorAll<HTMLElement>(".pay-info").forEach((info) => {
      info.innerHTML = `
        <div style="font-weight:600; color:#111">R$ ${selectedPrice}</div>
        <div style="font-size:13px; color:#FF7A00; display:flex; align-items:center; gap:4px;">
          + <span style="font-weight:600;">Bônus</span>
          <img src="point.webp" style="width:16px; vertical-align:middle">
          ${selectedBonus}
        </div>
      `;
    });

    // ========= Checkout inferior =========
    document.getElementById("checkoutBonus")!.innerHTML = `
      <span style="display:flex; align-items:center; gap:6px; font-size:15px; color:#FF7A00;">
        ${selectedBase} + ${selectedBonus}
        <img src="point.webp" style="width:18px; vertical-align:middle">
      </span>
    `;

    document.getElementById("checkoutPrice")!.innerHTML = `Total: R$ ${selectedPrice}`;
    (document.getElementById("checkoutBar") as HTMLElement).style.display = "flex";

    checkCheckoutReady();
  });
});
// ==========================
// Seleção dos planos especiais
// ==========================
document.querySelectorAll(".plan").forEach((button) => {
  button.addEventListener("click", () => {
    selectedPrice = (button as HTMLElement).dataset.price || null;
    selectedBase = (button as HTMLElement).dataset.base || null;
    selectedBonus = (button as HTMLElement).dataset.bonus || null;

    const isSpecial = (button as HTMLElement).dataset.special === "true";
    const productName = button.querySelector(".plan-title")?.textContent?.trim() || "";

    document.querySelectorAll(".value").forEach((v) => v.classList.remove("selected"));
    document.querySelectorAll(".plan").forEach((p) => p.classList.remove("selected"));
    button.classList.add("selected");

    // Atualiza métodos de pagamento
    document.querySelectorAll<HTMLElement>(".pay-info").forEach((info) => {
      if (isSpecial) {
        // Só mostra preço centralizado
        info.innerHTML = `
          <div style="font-weight:600; color:#111; margin-bottom:10px; text-align:center;">
            R$ ${selectedPrice}
          </div>
        `;
      } else {
        // Mostra preço + bônus normal
        info.innerHTML = `
          <div style="font-weight:600; color:#111; margin-bottom:2px;">R$ ${selectedPrice}</div>
          <div style="font-size:13px; color:#FFA700; display:flex; align-items:center; gap:4px; justify-content:center;">
            <img src="point.webp" style="width:14px;vertical-align:middle">
            ${selectedBase} + ${selectedBonus}
          </div>
        `;
      }
    });

    // Atualiza checkout inferior
    if (isSpecial) {
      // Mostra só o nome do produto e o preço
      document.getElementById("checkoutBonus")!.innerHTML = `
        <span style="display:flex; flex-direction:column; gap:4px; font-size:15px; color:#111; text-align:center;">
          <span style="font-weight:600;">${productName}</span>
        </span>
      `;
    } else {
      // Mantém base + bônus + diamante
      document.getElementById("checkoutBonus")!.innerHTML = `
        <span style="display:flex; align-items:center; gap:6px; font-size:15px; color:#111;">
          <img src="point.webp" style="width:18px; height:18px; vertical-align:middle;">
          ${selectedBase} + ${selectedBonus}
        </span>
      `;
    }

    // Sempre mostra o preço total
    document.getElementById("checkoutPrice")!.innerHTML = `Total: R$ ${selectedPrice}`;
    (document.getElementById("checkoutBar") as HTMLElement).style.display = "flex";

    checkCheckoutReady();
  });
});

    // ==========================
    // Seleção dos métodos de pagamento
    // ==========================
    document.querySelectorAll(".pay").forEach((pay) => {
      pay.addEventListener("click", () => {
        document.querySelectorAll(".pay").forEach((p) => p.classList.remove("selected"));
        pay.classList.add("selected");
        selectedPayment = true;
        checkCheckoutReady();
      });
    });

    // ==========================
    // Botão checkout
    // ==========================
const btnCheckout = document.getElementById("checkoutBtn");
btnCheckout?.addEventListener("click", () => {
  if (!localStorage.getItem("accountData")) {
    showToast("error", "Erro", "Você deve fazer login para continuar.");
    return;
  }


  if (selectedPrice && selectedPayment) {
    const payment = document.querySelector(".pay.selected img")?.getAttribute("alt");
    const user = (document.querySelector(".input") as HTMLInputElement)?.value || "Logado";

    const checkoutData = { price: selectedPrice, base: selectedBase, bonus: selectedBonus, payment, user };
    sessionStorage.setItem("checkoutData", JSON.stringify(checkoutData));

    router.push("/checkout");
  }
});


    // ==========================
    // Login com API
    // ==========================
async function doLogin() {
  const btnLogin = document.querySelector(".btn-login") as HTMLButtonElement;
  const userId = (document.getElementById("playerId") as HTMLInputElement).value.trim();
  if (!userId) return alert("Digite um ID!");

  // salva estado original
  const originalText = btnLogin.textContent;
  const originalBg = btnLogin.style.background || "#e11d48";

  // muda estado do botão
  btnLogin.textContent = "Aguarde...";
  btnLogin.style.background = "#f87171"; // 🔥 vermelho claro (igual o da sua imagem)
  btnLogin.disabled = true;
try {
  const res = await fetch(`/api/check?uid=${encodeURIComponent(userId)}&zoneId=BR`, {
    method: "GET",
  });

  const data = await res.json();

  if (res.ok && data.nickname) {
    // ✅ sucesso
    localStorage.setItem("accountData", JSON.stringify({ userId, nickname: data.nickname }));
    showAccount(data.nickname, userId);

    // esconde mensagem de erro se login funcionar
    const errorEl = document.getElementById("loginError") as HTMLElement;
    if (errorEl) errorEl.style.display = "none";
  } else {
    // ❌ mostra erro se não encontrar
    const errorEl = document.getElementById("loginError") as HTMLElement;
    if (errorEl) {
      errorEl.textContent = data.error || "ID de jogador não encontrado.";
      errorEl.style.display = "block";
    }

    // restaura botão
    btnLogin.textContent = originalText || "Login";
    btnLogin.style.background = originalBg;
    btnLogin.disabled = false;
  }
} catch (err) {
  console.error(err);

  // ⚠️ erro de conexão
  const errorEl = document.getElementById("loginError") as HTMLElement;
  if (errorEl) {
    errorEl.textContent = "Falha ao conectar à API!";
    errorEl.style.display = "block";
  }

  // restaura botão
  btnLogin.textContent = originalText || "Login";
  btnLogin.style.background = originalBg;
  btnLogin.disabled = false;
}
}

    function showAccount(nickname: string, userId: string) {
      (document.getElementById("login-card") as HTMLElement).style.display = "none";
      (document.getElementById("account-card") as HTMLElement).style.display = "block";
      (document.getElementById("nickname") as HTMLElement).textContent = "Usuário " + nickname;
      (document.getElementById("userid") as HTMLElement).textContent = "ID do jogador: " + userId;
    }

   function logout() {
  localStorage.removeItem("accountData");

  // mostra card de login
  (document.getElementById("login-card") as HTMLElement).style.display = "block";
  (document.getElementById("account-card") as HTMLElement).style.display = "none";

  // limpa campos
  (document.getElementById("playerId") as HTMLInputElement).value = "";
  (document.getElementById("nickname") as HTMLElement).textContent = "";
  (document.getElementById("userid") as HTMLElement).textContent = "";

  // 🔥 restaura botão de login
  const btnLogin = document.querySelector(".btn-login") as HTMLButtonElement;
  if (btnLogin) {
    btnLogin.textContent = "Login";
    btnLogin.style.background = "#ef4444"; // cor original
    btnLogin.disabled = true; // volta a desabilitar até digitar de novo
  }
}

    // ==========================
    // Modal Logout
    // ==========================
    function showLogoutModal() {
      document.getElementById("logoutOverlay")?.classList.add("show");
      document.getElementById("logoutModal")?.classList.add("show");
    }
    function closeLogoutModal() {
      document.getElementById("logoutOverlay")?.classList.remove("show");
      document.getElementById("logoutModal")?.classList.remove("show");
    }
    function confirmLogout() {
      closeLogoutModal();
      logout();
    }
    document.getElementById("logoutOverlay")?.addEventListener("click", closeLogoutModal);

    // ==========================
    // Modal Recompensa
    // ==========================
    function showRewardModal() {
      document.getElementById("rewardOverlay")?.classList.add("show");
      document.getElementById("rewardModal")?.classList.add("show");
    }
    function closeRewardModal() {
      document.getElementById("rewardOverlay")?.classList.remove("show");
      document.getElementById("rewardModal")?.classList.remove("show");
    }
    document.getElementById("rewardOverlay")?.addEventListener("click", closeRewardModal);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeRewardModal();
    });
    document.querySelector(".btn-resgatar")?.addEventListener("click", showRewardModal);

    // ==========================
    // Restaurar sessão
    // ==========================
    const savedAccount = localStorage.getItem("accountData");
    if (savedAccount) {
      const acc = JSON.parse(savedAccount);
      showAccount(acc.nickname, acc.userId);
    }

    // Vincula login
    document.querySelector(".btn-login")?.addEventListener("click", doLogin);
    document.querySelector(".btn.danger")?.addEventListener("click", confirmLogout);
  }, []);

  return (
    <>
      <main>
      {/* HEADER */}
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
            <Image src="/ff.webp" alt="Perfil" width={40} height={40} className="rounded-full object-cover" />
          </div>
        </div>
      </header>

      {/* CARROSSEL */}
      <div className="carousel-wrapper">
        <div className="carousel">
          <div className="carousel-track">
            <div className="carousel-slide"><Image src="/1.webp" alt="Banner 1" width={900} height={300} /></div>
            <div className="carousel-slide"><Image src="/2.webp" alt="Banner 2" width={900} height={300} /></div>
            <div className="carousel-slide"><Image src="/3.webp" alt="Banner 3" width={900} height={300} /></div>
          </div>

          <button className="carousel-btn prev">&#10094;</button>
          <button className="carousel-btn next">&#10095;</button>

          <div className="carousel-indicators">
            <span className="dot active"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>
      </div>

{/* SELEÇÃO DE JOGOS */}
<section className="games">
  <div className="container games-wrap">
    <h3>Seleção de jogos</h3>
    <div className="app-grid">
      <button className="app selected" aria-label="Free Fire">
        <span className="app-icon">
          <Image 
            src="/icon.webp" 
            alt="Free Fire" 
            fill 
            quality={100} 
            className="object-cover rounded-[16px]" 
          />
        </span>
        <span className="app-name">Free Fire</span>
      </button>

      <button className="app" aria-label="Delta Force">
        <span className="app-icon">
          <Image 
            src="/delta.webp" 
            alt="Delta Force" 
            fill 
            quality={100} 
            className="object-cover rounded-[16px]" 
          />
        </span>
        <span className="app-name">Delta Force</span>
      </button>
    </div>
  </div>
</section>


         {/* HERO */}
      <section className="hero">
        <div className="container">
          <div className="hero-card" style={{ backgroundImage: "url('/FF-f997537d.jpg')" }}>
            <div className="hero-content">
<Image src="/icon.webp" alt="Free Fire" width={72} height={72} className="hero-icon" />
              <div>
                <h3 className="hero-title">Free Fire</h3>
                <div className="hero-meta">
                  <span className="secure">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 3l7 4v5c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V7l7-4z"></path>
                      <path d="M9 12l2 2 4-4"></path>
                    </svg>
                    Pagamento 100% Seguro
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
{/* CONTEÚDO PRINCIPAL */}
<div className="container grid">

  {/* ITEM GRÁTIS */}
  <section
    className="promo-item"
    style={{
      backgroundImage:
        "url('https://cdn-gop.garenanow.com/gop/mshop/www/live/assets/freefire-freeitem-bg-light-3457641a.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}
  >
    <div className="promo-inner">
      <div className="promo-text">
        <strong>Item Grátis</strong>
        <span>Resgate aqui seus itens exclusivos grátis</span>
        <button className="btn-resgatar">Resgatar</button>
      </div>
      <div className="promo-icon">
        <Image src="/arma.png" alt="Pacote de Armas" width={80} height={80} />
        <div className="icon-label">Pacote de Armas</div>
      </div>
    </div>
  </section>

  {/* LOGIN CARD */}
  <section className="login-card" id="login-card">
    <div className="step">
      <span className="step-badge">1</span>
      <h4>Login</h4>
    </div>
    <label className="login-label">
      ID do jogador <span className="tooltip">?</span>
    </label>
<div className="login-row">
  <input 
    id="playerId" 
    className="input" 
    placeholder="Insira o ID de jogador aqui" 
    aria-label="ID do jogador" 
  />
  <button className="btn-login" disabled>Login</button>
</div>

{/* 🔥 Mensagem de erro (começa escondida) */}
<p id="loginError" className="login-error" style={{ display: "none" }}>
  ID de jogador não encontrado.
</p>

    <div className="socials" style={{ marginTop: "15px" }}>
      <span className="social-label">Ou entre com sua conta de jogo</span>
<div className="social-buttons">
  <a
    className="social"
    onClick={(e) => {
      e.preventDefault();
      showSocialModal();
    }}
  >
    <img
      src="https://cdn-gop.garenanow.com/gop/mshop/www/live/assets/ic-fb-485c92b0.svg"
      alt="Facebook"
    />
  </a>

  <a
    className="social"
    onClick={(e) => {
      e.preventDefault();
      showSocialModal();
    }}
  >
    <img
      src="https://cdn-gop.garenanow.com/gop/mshop/www/live/assets/ic-google-d2ceaa95.svg"
      alt="Google"
    />
  </a>

  <a
    className="social"
    onClick={(e) => {
      e.preventDefault();
      showSocialModal();
    }}
  >
    <img
      src="https://cdn-gop.garenanow.com/gop/mshop/www/live/assets/ic-twitter-92527e61.svg"
      alt="X"
    />
  </a>

  <a
    className="social"
    onClick={(e) => {
      e.preventDefault();
      showSocialModal();
    }}
  >
    <img
      src="https://cdn-gop.garenanow.com/gop/mshop/www/live/assets/ic-vk-abadf989.svg"
      alt="VK"
    />
  </a>
</div>


    </div>
  </section>

  {/* CONTA CARD */}
  <section className="login-card" id="account-card" style={{ display: "none", position: "relative" }}>
    <div className="step">
      <span className="step-badge">1</span>
      <h4>Conta</h4>
    <a
  href="#"
  onClick={(e) => {
    e.preventDefault();
    document.getElementById("logoutOverlay")?.classList.add("show");
    document.getElementById("logoutModal")?.classList.add("show");
  }}
  style={{
    color: "red",
    fontWeight: 500,
    textDecoration: "none",
    position: "absolute",
    top: "12px",
    right: "16px",
    fontSize: "14px",
    cursor: "pointer",
  }}
>
  ⇄ Sair
</a>

    </div>
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px", background: "#f5f5f5", padding: "10px", borderRadius: "6px" }}>
      <Image id="avatar" src="/ff.webp" alt="Avatar" width={40} height={40} className="rounded-full object-cover" />
      <div>
        <strong id="nickname" style={{ fontSize: "15px", color: "#111", fontWeight: 500 }}></strong>
        <span id="userid" style={{ fontSize: "13px", color: "#666", display: "block" }}></span>
      </div>
    </div>
  </section>

  {/* VALORES E OFERTAS */}
  <section className="card pad">
    <div className="step">
      <span className="step-badge">2</span>
      <h4>Valor de Recarga</h4>
    </div>
    <div className="values">
      <button className="value" data-price="6,00" data-bonus="100">
        <Image src="/point.webp" alt="Pontos" width={18} height={18} className="value-icon" /> 100
      </button>
      <button className="value" data-price="7,50" data-bonus="310">
        <Image src="/point.webp" alt="Pontos" width={18} height={18} className="value-icon" /> 310
      </button>
      <button className="value" data-price="9,90" data-bonus="520">
        <Image src="/point.webp" alt="Pontos" width={18} height={18} className="value-icon" /> 520
      </button>
      <button className="value" data-price="14,90" data-bonus="1.060">
        <Image src="/point.webp" alt="Pontos" width={18} height={18} className="value-icon" /> 1.060
      </button>
      <button className="value" data-price="19,90" data-bonus="2.180">
        <Image src="/point.webp" alt="Pontos" width={18} height={18} className="value-icon" /> 2.180
      </button>
      <button className="value" data-price="37,80" data-bonus="5.600">
        <Image src="/point.webp" alt="Pontos" width={18} height={18} className="value-icon" /> 5.600
      </button>
      <button className="value" data-price="87,80" data-bonus="15.600">
        <Image src="/point.webp" alt="Pontos" width={18} height={18} className="value-icon" /> 15.600
      </button>
    </div>
<h5 className="section-title">Ofertas especiais</h5>
<div className="offers">
  <button className="plan" data-price="19,99" data-base="1.000" data-bonus="300" data-special="true">
    <span className="plan-img">
      <span className="plan-img-inner">
        <Image 
          src="/semanal.webp" 
          alt="Assinatura semanal" 
          fill
          quality={100}
          className="object-contain rounded-md"
        />
      </span>
    </span>
    <div className="plan-title">Assinatura Semanal</div>
  </button>

  <button className="plan" data-price="32,90" data-base="2.000" data-bonus="600" data-special="true">
    <span className="plan-img">
      <span className="plan-img-inner">
        <Image 
          src="/mensal.webp" 
          alt="Assinatura mensal" 
          fill
          quality={100}
          className="object-contain rounded-md"
        />
      </span>
    </span>
    <div className="plan-title">Assinatura Mensal</div>
  </button>

  <button className="plan" data-price="16,90" data-base="Passe Booyah Premium Plus" data-special="true">
    <span className="plan-img">
      <span className="plan-img-inner">
        <Image 
          src="/premiumplus.png" 
          alt="Passe Booyah Premium Plus" 
          fill
          quality={100}
          className="object-contain rounded-md"
        />
      </span>
    </span>
    <div className="plan-title">Passe Booyah Premium Plus</div>
  </button>

  <button className="plan" data-price="7,49" data-base="Trilha da Evolução - 3 dias" data-special="true">
    <span className="plan-img">
      <span className="plan-img-inner">
        <Image 
          src="/3days.png" 
          alt="Trilha da Evolução 3d" 
          fill
          quality={100}
          className="object-contain rounded-md"
        />
      </span>
    </span>
    <div className="plan-title">Trilha da Evolução - 3 dias</div>
  </button>

  <button className="plan" data-price="12,09" data-base="Trilha da Evolução - 7 dias"data-special="true">
    <span className="plan-img">
      <span className="plan-img-inner">
        <Image 
          src="/7days.png" 
          alt="Trilha da Evolução - 7 dias" 
          fill
          quality={100}
          className="object-contain rounded-md"
        />
      </span>
    </span>
    <div className="plan-title">Trilha da Evolução - 7 dias</div>
  </button>

  <button className="plan" data-price="19,99" data-base="Trilha da Evolução - 30 dias" data-special="true">
    <span className="plan-img">
      <span className="plan-img-inner">
        <Image 
          src="/30days.png" 
          alt="Trilha da Evolução - 30 dias" 
          fill
          quality={100}
          className="object-contain rounded-md"
        />
      </span>
    </span>
    <div className="plan-title">Trilha da Evolução - 30 dias</div>
  </button>

  <button className="plan" data-price="99,90" data-base="Semanal Econômica" data-special="true">
    <span className="plan-img">
      <span className="plan-img-inner">
        <Image 
          src="/wlite.png" 
          alt="Semanal Econômica" 
          fill
          quality={100}
          className="object-contain rounded-md"
        />
      </span>
    </span>
    <div className="plan-title">Semanal Econômica</div>
  </button>

  <button className="plan" data-price="34,90" data-base="1.000" data-bonus="Passe Booyah" data-special="true">
    <span className="plan-img">
      <span className="plan-img-inner">
        <Image 
          src="/booyah.webp" 
          alt="Passe Booyah" 
          fill
          quality={100}
          className="object-contain rounded-md"
        />
      </span>
    </span>
    <div className="plan-title">Passe Booyah</div>
  </button>
</div>



  </section>

  {/* MÉTODOS DE PAGAMENTO */}
  <section className="card pad">
    <div className="step">
      <span className="step-badge">3</span>
      <h4>Método de pagamento</h4>
    </div>
    <div className="payments">
      {[
        { src: "/pix_boa_mb.webp", alt: "Pix" },
        { src: "/creditcard_mb.webp", alt: "Cartão" },
        { src: "/picpay_mb.webp", alt: "PicPay" },
        { src: "/br_nupay_mb.webp", alt: "nUPay" },
        { src: "/mx_mercado_mb.webp", alt: "Mercado Pago" },
      ].map((p) => (
        <div className="pay" key={p.alt}>
          <Image src={p.src} alt={p.alt} width={90} height={50} />
          <div className="pay-info"></div>
          <span className="promo">
            <Image src="/point.webp" alt="" width={12} height={12} /> PROMO
          </span>
        </div>
      ))}
    </div>

    {/* CHECKOUT BAR */}
    <section className="checkout-bar" id="checkoutBar">
      <div className="checkout-group">
        <div className="checkout-info">
          <span id="checkoutBonus"></span>
          <span id="checkoutPrice"></span>
        </div>
        <button id="checkoutBtn" disabled>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            width="18"
            height="18"
            style={{ marginRight: "6px" }}
          >
            <path d="M12 3l7 4v5c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V7l7-4z"></path>
            <path d="M9 12l2 2 4-4"></path>
          </svg>
          Compre agora
        </button>
      </div>
    </section>
  </section>
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
{/* MODAL LOGOUT */}
<div id="logoutOverlay" className="modal-overlay" aria-hidden="true"></div>
<div
  id="logoutModal"
  className="modal"
  role="dialog"
  aria-modal="true"
  aria-labelledby="logoutTitle"
  aria-describedby="logoutDesc"
>
  <h3 id="logoutTitle" className="modal-title">
    Não é sua conta?
  </h3>
  <p id="logoutDesc" className="modal-desc">
    Por favor, saia e faça login com sua outra conta
  </p>
  <div className="modal-actions">
    {/* Cancelar */}
    <button
      className="btn ghost"
      onClick={() => {
        document.getElementById("logoutOverlay")?.classList.remove("show");
        document.getElementById("logoutModal")?.classList.remove("show");
      }}
    >
      Cancelar
    </button>

    {/* Sair */}
    <button
      className="btn danger"
      onClick={() => {
        // Fecha modal
        document.getElementById("logoutOverlay")?.classList.remove("show");
        document.getElementById("logoutModal")?.classList.remove("show");

        // Faz logout
        localStorage.removeItem("accountData");
        (document.getElementById("login-card") as HTMLElement).style.display =
          "block";
        (document.getElementById("account-card") as HTMLElement).style.display =
          "none";
        (document.getElementById("playerId") as HTMLInputElement).value = "";
        (document.getElementById("nickname") as HTMLElement).textContent = "";
        (document.getElementById("userid") as HTMLElement).textContent = "";
      }}
    >
      Sair
    </button>
  </div>
</div>
{/* MODAL REWARD */}
<div
  id="rewardOverlay"
  className="modal-overlay"
  onClick={() => {
    document.getElementById("rewardOverlay")?.classList.remove("show");
    document.getElementById("rewardModal")?.classList.remove("show");
  }}
></div>

<div id="rewardModal" className="modal" role="dialog" aria-modal="true">
  <div style={{ textAlign: "center" }}>
    
    {/* Ícone SVG de presente */}
    <div 
      style={{ 
        marginBottom: "12px", 
        color: "#e11d48", 
        display: "flex", 
        justifyContent: "center" 
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="44"
        height="44"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-gift"
      >
        <rect x="3" y="8" width="18" height="4" rx="1"></rect>
        <path d="M12 8v13"></path>
        <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path>
        <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"></path>
      </svg>
    </div>

    <h3 className="modal-title">Quase lá para o seu Item Grátis!</h3>
    <p className="modal-desc">
      Finalize sua compra para ganhar o <strong>Pacote de Armas</strong>.
    </p>

    <div className="modal-actions" style={{ justifyContent: "center" }}>
      <button
        className="btn danger"
        onClick={() => {
          document.getElementById("rewardOverlay")?.classList.remove("show");
          document.getElementById("rewardModal")?.classList.remove("show");
        }}
      >
        OK
      </button>
    </div>
  </div>
</div>

{/* 🚀 MOVER O SOCIAL PARA FORA */}
<div
  id="socialOverlay"
  className="modal-overlay"
  onClick={() => {
    document.getElementById("socialOverlay")?.classList.remove("show");
    document.getElementById("socialModal")?.classList.remove("show");
  }}
></div>

<div id="socialModal" className="modal" role="dialog" aria-modal="true">
  <div style={{ textAlign: "center" }}>
    <h3 style={{ margin: "0 0 10px", fontSize: "18px", fontWeight: 700 }}>
      Serviço indisponível
    </h3>
    <p style={{ fontSize: "14px", color: "#444", marginBottom: "20px" }}>
      Use seu ID do jogo para entrar.
    </p>

    <div className="modal-actions">
      <button
        className="btn danger"
        onClick={() => {
          document.getElementById("socialOverlay")?.classList.remove("show");
          document.getElementById("socialModal")?.classList.remove("show");
        }}
      >
        OK
      </button>
    </div>
  </div>
</div>
  </main>

      <Toasts />
    </>
  );
}
