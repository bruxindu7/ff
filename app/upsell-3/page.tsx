"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import "./upsell.css"; // 🔥 CSS separado

export default function UpsellPage() {
  const [selected, setSelected] = useState<string[]>(["offer1"]); // Skin já pré-selecionada
  const [checkoutData, setCheckoutData] = useState<any>({});
  const [countdown, setCountdown] = useState(0); // Adicionando contador
  const [isExpired, setIsExpired] = useState(false); // Verifica se a oferta expirou

  // 🔥 Itens do upsell
  const items = [
    { id: "offer1", name: "Influencer Beta", price: 67.80, img: "/status-premium-banner.webp" }, // Ajuste a imagem para a sua
  ];

  const total = items
    .filter((i) => selected.includes(i.id))
    .reduce((acc, i) => acc + i.price, 0);

  // Atualiza a contagem regressiva a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          setIsExpired(true); // Define como expirado
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Definindo o tempo inicial (exemplo: 10 minutos)
    setCountdown(300); // 10 minutos em segundos

    return () => clearInterval(timer); // Limpeza do intervalo
  }, []);

  // ✅ Carregar dados do checkout salvos no sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedData = sessionStorage.getItem("checkoutData");
      if (storedData) {
        setCheckoutData(JSON.parse(storedData));
      }
    }
  }, []);

  const handlePayment = async () => {
    if (total <= 0) {
      alert("Selecione a oferta!");
      return;
    }

    const amountCents = Math.round(total * 100); // ✅ só o valor das skins
    const orderId = Date.now().toString();
    const description = `Oferta - Pedido #${orderId}`; // ✅ descrição clara

    const payer = {
      name: checkoutData?.name || "",
      email: checkoutData?.email || "",
      phone: checkoutData?.phone || "",
    };

    // Preparando as informações do checkout para enviar para o "buy"
    const checkoutDataToSend = {
      originalPrice: items[0].price, // Preço Original (se necessário)
      totalPrice: total, // Total (preço com a oferta)
      offerName: items[0].name, // Nome da oferta
    };

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountCents, orderId, description, payer }),
      });

      const data = await response.json();

      if (!response.ok || !data.id) {
        alert("Erro ao gerar pagamento.");
        return;
      }

      // ✅ Salvar só os dados novos do upsell
      const checkoutUpsellPix = {
        type: "upsell",
        items: items.filter((i) => selected.includes(i.id)), // guarda quais ofertas
        total,
        transactionId: data.id,
        brcode: data.brcode,
        qrBase64: data.qrBase64,
        createdAt: Date.now(),
        payer,
        ...checkoutDataToSend, // Incluindo as informações de preço e nome da oferta
      };

      sessionStorage.setItem("pixCheckout", JSON.stringify(checkoutUpsellPix));

      // Redireciona para a página de pagamento
      setTimeout(() => {
        window.location.href = "/buy";
      }, 1500);
    } catch (err) {
      alert("Falha na integração de pagamento.");
    }
  };

  return (
    <main>
      {/* 🔥 HEADER igual ao checkout */}
      <header>
        <div className="container nav">
          <div className="brand">
            <div className="brand-text">
              <Image src="/image.png" alt="Logo" width={100} height={40} />
              <span className="divider"></span>
              <span>Canal Oficial de Recarga</span>
            </div>
          </div>
          <div className="profile" title="Perfil">
            <Image src="/ff.webp" alt="Perfil" width={40} height={40} className="rounded-full object-cover" />
          </div>
        </div>
      </header>

      <div className="checkout">
<h4>
  OFERTA EXCLUSIVA <span className="highlight-text">SE TORNE UM INFLUENCIADOR</span>
</h4>
        <p className="subtext">
          Eleve sua conta para o próximo nível virando o mais novo influencer e receba benefícios exclusivos.
        </p>


        <div className="offer-container">
          {items.map((item) => (
            <div key={item.id} className="offer-item">
              <div className="offer-left">
                <Image src={item.img} alt={item.name} width={400} height={400} quality={100} />
                <div className="offer-info">
                  <h3>{item.name}</h3>
                  <span>R$ {item.price.toFixed(2).replace(".", ",")}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Botão de pagar */}
        <button className="btn-submit" onClick={handlePayment}>
          SIM, EU QUERO!
        </button>

        {/* Botão "não quero" */}
        <a href="/" className="no-thanks">
          Não, obrigado.
        </a>
        
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
  );
}
