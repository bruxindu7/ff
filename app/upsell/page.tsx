"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import "./upsell.css"; // 🔥 CSS separado
import { Header } from "@/components/Header";

export default function UpsellPage() {
  const [selected, setSelected] = useState<string[]>(["offer1"]);
  const [checkoutData, setCheckoutData] = useState<any>({});
  const [countdown, setCountdown] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  const items = [
    { id: "offer1", name: "Taxa de Entrega Instantânea", price: 7.9, img: "/cs.jpg" },
  ];

  const total = items
    .filter((i) => selected.includes(i.id))
    .reduce((acc, i) => acc + i.price, 0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setCountdown(300); // 5 minutos

    return () => clearInterval(timer);
  }, []);

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

    const amountCents = Math.round(total * 100);
    const orderId = Date.now().toString();
    const description = `Oferta - Pedido #${orderId}`;

    const payer = {
      name: checkoutData?.name || "",
      email: checkoutData?.email || "",
      phone: checkoutData?.phone || "",
    };

    const checkoutDataToSend = {
      originalPrice: items[0].price,
      totalPrice: total,
      diamonds: items[0].name,
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

      let userId = "Desconhecido";
      if (typeof window !== "undefined") {
        const accountData = localStorage.getItem("accountData");
        if (accountData) {
          try {
            const acc = JSON.parse(accountData);
            if (acc.userId || acc._id) {
              userId = acc.userId || acc._id;
            }
          } catch (e) {
            console.error("Erro ao parsear accountData", e);
          }
        }
      }

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
        userId,
      };

      sessionStorage.setItem("pixCheckout", JSON.stringify(checkoutUpsellPix));

      setTimeout(() => {
        window.location.href = "/buy";
      }, 1500);
    } catch (err) {
      alert("Falha na integração PIX.");
    }
  };

  return (
    <>
      {/* 🔥 Header fora do main */}
      <Header avatarIcon="/ff.webp" />

      <main>
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
            <span>
              {`${Math.floor(countdown / 60)
                .toString()
                .padStart(2, "0")}:${(countdown % 60).toString().padStart(2, "0")}`}
            </span>
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
      </main>
    </>
  );
}
