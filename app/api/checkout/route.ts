import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BUCKPAY_BASE_URL = "https://api.realtechdev.com.br";
const PIX_CREATE_PATH = "/v1/transactions";

// 🔐 lista de domínios permitidos
const allowedOrigins = [
  "https://www.recargasjogos.skin",
    "http://localhost:3000",
];

// helper para validar origem
function isOriginAllowed(request: NextRequest): boolean {
  const referer = request.headers.get("referer");
  if (!referer) return false;
  return allowedOrigins.some((origin) => referer.startsWith(origin));
}

export async function POST(req: NextRequest) {
  if (!isOriginAllowed(req)) {
    return NextResponse.json(
      { error: "Clonei certo chora n magicu opkkkkkkkkkk" },
      { status: 403 }
    );
  }

  try {
    const { amount, orderId, payer } = await req.json();

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
        phone: payer?.phone
          ? "55" + payer.phone.replace(/\D/g, "")
          : undefined,
      },
      tracking: {
        ref: process.env.SITE_NAME || "FreefireJ", // ✅ identifica o site
        src: null,
        sck: null,
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
        utm_id: null,
        utm_term: null,
        utm_content: null,
      },
    };

    console.log("➡ Enviando para BuckPay:", payload);

    const r = await fetch(BUCKPAY_BASE_URL + PIX_CREATE_PATH, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.BUCKPAY_TOKEN!}`,
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
    externalId: payload.external_id, // 🔥 devolve o mesmo external_id que você criou
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
