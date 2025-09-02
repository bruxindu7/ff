import { NextResponse } from "next/server";

const BUCKPAY_BASE_URL = "https://api.realtechdev.com.br";
const PIX_CREATE_PATH = "/v1/transactions";

export async function POST(req: Request) {
  try {
    const { amount, orderId, description, payer } = await req.json();

    const amountCents = parseInt(amount);

    const payload = {
      external_id: String(orderId),
      payment_method: "pix",
      amount: amountCents,
      buyer: {
        name: payer?.name?.includes(" ")
          ? payer.name
          : `${payer?.name || "Cliente"} Teste`,
        email: payer?.email || "sememail@teste.com",
        document: payer?.document || undefined,
        phone: payer?.phone ? "55" + payer.phone.replace(/\D/g, "") : undefined,
      },
    };

    console.log("➡ Enviando para BuckPay:", payload);
    console.log("➡ Headers:", {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.BUCKPAY_TOKEN}`,
      "User-Agent": "Buckpay API",
    });

    const r = await fetch(BUCKPAY_BASE_URL + PIX_CREATE_PATH, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.BUCKPAY_TOKEN!}`,
        "User-Agent": "Buckpay API",
      },
      body: JSON.stringify(payload),
    });

    const data = await r.json();
    console.log("➡ Resposta BuckPay:", r.status, data);

    if (!r.ok) {
      return NextResponse.json({ error: data }, { status: r.status });
    }

    return NextResponse.json(
      {
        id: data.data.id,
        status: data.data.status,
        brcode: data.data.pix.code,
        qrBase64: data.data.pix.qrcode_base64,
        amount: data.data.total_amount,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("⛔ Erro backend create-pix:", err);
    return NextResponse.json(
      { error: "Falha ao criar cobrança PIX" },
      { status: 500 }
    );
  }
}
