"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import "./pix.css";
import { useToast } from "@/hooks/useToast";

export default function PixPage() {
  const { showToast, Toasts } = useToast();
  const [pixData, setPixData] = useState<any>(null);
  const [countdown, setCountdown] = useState("15:00");

  useEffect(() => {
    const saved = sessionStorage.getItem("pixCheckout");
    if (!saved) {
      showToast("error", "Sessão expirada", "Volte ao checkout e tente novamente.");
      window.location.href = "/checkout";
      return;
    }

    const data = JSON.parse(saved);

    if (!data.createdAt) {
      data.createdAt = Date.now();
      sessionStorage.setItem("pixCheckout", JSON.stringify(data));
    }

    setPixData(data);

    const DURATION = 15 * 60 * 1000;
    function atualizarContador() {
      const agora = Date.now();
      const expiraEm = Number(data.createdAt) + DURATION;
      const restante = Math.floor((expiraEm - agora) / 1000);

      if (restante <= 0) {
        setCountdown("00:00");
        showToast("error", "Tempo expirado", "Seu pedido foi cancelado.");
        sessionStorage.removeItem("pixCheckout");
        window.location.href = "/";
        return;
      }

      const min = String(Math.floor(restante / 60)).padStart(2, "0");
      const sec = String(restante % 60).padStart(2, "0");
      setCountdown(`${min}:${sec}`);
    }

    atualizarContador();
    const interval = setInterval(atualizarContador, 1000);

    const statusInterval = setInterval(async () => {
      try {
        if (!data.transactionId) return;

        const r = await fetch(`/api/webhook?id=${data.transactionId}`);
        const json = await r.json();

        if (json.status && json.status === "paid") {
          showToast("success", "Pagamento aprovado!", "Redirecionando...");
          clearInterval(statusInterval);

          // 🚀 Dispara conversão do Google Ads
          const priceNumber = parseFloat(String(data.totalAmount || data.price).replace(",", ".")) || 0;
          if (typeof window !== "undefined" && (window as any).gtag) {
            (window as any).gtag("event", "conversion", {
              send_to: "AW-17475419419/kZsRCKDJmpYbEJv69oxB", // seu ID
              value: priceNumber,
              currency: "BRL",
            });
          }

          // Escolhe upsell aleatória
          const upsellPages = ["/upsell", "/upsell-2", "/upsell-3"];
          const randomPage = upsellPages[Math.floor(Math.random() * upsellPages.length)];
          window.location.href = randomPage;
        }

        if (json.status === "not_found") {
          console.log("Transação ainda não registrada no backend");
        }
      } catch (err) {
        console.error("Erro ao verificar status:", err);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(statusInterval);
    };
  }, []);

  function copiarCodigo() {
    if (!pixData?.brcode) {
      showToast("error", "Erro!", "Não foi possível copiar o código Pix.");
      return;
    }

    navigator.clipboard
      .writeText(pixData.brcode)
      .then(() => {
        showToast("success", "Copiado!", "O código Pix foi copiado para a área de transferência.");
      })
      .catch(() => {
        showToast("error", "Erro!", "Falha ao acessar a área de transferência.");
      });
  }

  if (!pixData) return null;

  const isUpsell = pixData.type === "upsell";
  const baseNum = isUpsell ? 0 : parseInt(String(pixData.base).replace(/\D/g, "")) || 0;
  const bonusNum = isUpsell ? 0 : parseInt(String(pixData.bonus).replace(/\D/g, "")) || 0;
  const total = isUpsell ? pixData.total : baseNum + bonusNum;

  sessionStorage.setItem("pixCheckout", JSON.stringify({
    ...pixData,
    totalAmount: total
  }));

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

        {/* PIX */}
        <div className="checkout">
          <div className="banner">
            <Image src="/FF-f997537d.jpg" alt="Banner Free Fire" width={920} height={300} />
            <button className="back-btn" onClick={() => { window.location.href = "/checkout"; }}>
              <span className="icon">❮</span> Voltar
            </button>
          </div>

          <div className="game-header">
            <Image src="/icon.webp" alt="Free Fire" width={90} height={90} className="game-icon" />
            <h2>Free Fire</h2>
          </div>

          <div className="summary">
            <p>
              <span>Total</span>
              <span>
                <img src="/point.webp" className="icon" />
                {isUpsell ? `Ofertas - R$ ${total.toFixed(2).replace(".", ",")}` : total}
              </span>
            </p>

            <div className="bonus-box">
              <p>
                <span>Preço Original</span>
                <span>
                  <img src="/point.webp" className="icon" />
                  {isUpsell ? "N/A" : pixData.base}
                </span>
              </p>
              <p>
                <span>+ Bônus Geral</span>
                <span>
                  <img src="/point.webp" className="icon" />
                  {isUpsell ? "N/A" : pixData.bonus}
                </span>
              </p>
            </div>

            <p className="info-text">
              {isUpsell
                ? "Esta oferta exclusiva de skins será liberada após a confirmação do pagamento."
                : "Os diamantes são válidos apenas para a região do Brasil e serão creditados diretamente na conta de jogo."}
            </p>

            <hr style={{ margin: "14px 0", border: "none", borderTop: "1px solid var(--line)" }} />

            <div className="summary-details">
              <p>
                <span>Preço</span>
                <strong>R$ {isUpsell ? total.toFixed(2).replace(".", ",") : pixData.price}</strong>
              </p>
              <p>
                <span>Método de pagamento</span>
                <strong>{pixData.payment || "Pix"}</strong>
              </p>
              {!isUpsell && (
                <p>
                  <span>Nome do Jogador</span>
                  <strong>{pixData.user}</strong>
                </p>
              )}
            </div>

            <hr className="divider" />

            {/* Status */}
            <div className="status-box">
              <div className="status-header">
                <span>Aguardando pagamento</span>
              </div>
              <div className="status-text">
                Você tem <span>{countdown}</span> para pagar.
              </div>
            </div>

            {/* PIX */}
            <div className="pix-box">
              <h3>Pague com Pix</h3>
              <div className="qrcode">
                {pixData.qrBase64 && (
                  <img
                    id="qrcodeImg"
                    src={`data:image/png;base64,${pixData.qrBase64}`}
                    alt="QR Code PIX"
                  />
                )}
              </div>
              <p className="company">REAL TECH DIGITAL LTDA</p>
              <p className="cnpj">CNPJ: 54.228.163/0001-53</p>
            </div>

            <div className="pix-code">{pixData.brcode}</div>

            <button className="btn-copy" onClick={copiarCodigo}>
              Copiar Código
            </button>

            {/* Instruções (mantidas SEM alteração no design) */}
            <div className="instructions">
              <p>
                <strong>Para realizar o pagamento siga os passos abaixo:</strong>
              </p>
              <ol>
                <li>1. Abra o app ou o site da sua instituição financeira e selecione o Pix.</li>
                <li>2. Utilize as informações acima para realizar o pagamento.</li>
                <li>3. Revise as informações e pronto!</li>
              </ol>
              <p>Seu pedido está sendo processado pelo nosso parceiro BuckPay.</p>
              <p>
                {isUpsell
                  ? "Você receberá suas skins após a confirmação do pagamento."
                  : "Você receberá seus diamantes após recebermos a confirmação do pagamento."}
              </p>
              <p>Em caso de dúvidas entre em contato com o suporte.</p>
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
