import { NextResponse } from "next/server";

// 🌐 URL do site central (produção)
const CENTRAL_API = "https://www.eqp.lat/api/buckpay/receiver";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("➡ Webhook recebido no site de venda:", JSON.stringify(body, null, 2));

    // 🔄 Reenvia para o site principal
    const r = await fetch(CENTRAL_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...body,
        sourceSite: process.env.SITE_NAME || "FreefireWh", // marca qual site enviou
      }),
    });

    if (!r.ok) {
      console.error("❌ Erro ao reenviar para central:", await r.text());
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("❌ Erro ao processar webhook:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
