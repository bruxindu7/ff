import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sendOrderToUtmify, formatToUtmifyDate } from "@/lib/utmifyService";
import { UtmifyOrderPayload } from "@/interfaces/utmify";

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
    const { amount, orderId, payer, utms } = await req.json();

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
        ref: process.env.SITE_NAME || "FreefireJ", // identifica o site
        src: utms?.src || null,
        sck: utms?.sck || null,
        utm_source: utms?.utm_source || null,
        utm_medium: utms?.utm_medium || null,
        utm_campaign: utms?.utm_campaign || null,
        utm_id: utms?.utm_id || null,
        utm_term: utms?.utm_term || null,
        utm_content: utms?.utm_content || null,
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

    // 🔹 Envia também para o UTMify como pending
    try {
      const utmifyPayload: UtmifyOrderPayload = {
        orderId: data.data.id,
        platform: process.env.SITE_NAME || "FreefireJ",
        paymentMethod: "pix",
        status: "waiting_payment", // 👈 pendente
        createdAt: formatToUtmifyDate(new Date()),
        approvedDate: null,
        refundedAt: null,
        customer: {
          name: payload.buyer.name,
          email: payload.buyer.email,
phone: payload.buyer.phone ? payload.buyer.phone.replace(/\D/g, "") : undefined,
document: payload.buyer.document ? payload.buyer.document.replace(/\D/g, "") : undefined,
          country: "BR",
          ip: req.headers.get("x-forwarded-for") ?? "127.0.0.1",
        },
        products: [
          {
            id: `prod_${Date.now()}`,
            name: "Recarga Free Fire",
            planId: null,
            planName: null,
            quantity: 1,
            priceInCents: amountCents,
          },
        ],
        trackingParameters: {
          src: payload.tracking.src,
          sck: payload.tracking.sck,
          utm_source: payload.tracking.utm_source,
          utm_medium: payload.tracking.utm_medium,
          utm_campaign: payload.tracking.utm_campaign,
          utm_id: payload.tracking.utm_id,
          utm_term: payload.tracking.utm_term,
          utm_content: payload.tracking.utm_content,
        },
        commission: {
          totalPriceInCents: amountCents,
          gatewayFeeInCents: 0,
          userCommissionInCents: amountCents,
          currency: "BRL",
        },
        isTest: false,
      };

      await sendOrderToUtmify(utmifyPayload);
      console.log("✅ Pedido PENDING enviado pro UTMify:", utmifyPayload.orderId);
    } catch (utmErr) {
      console.error("⛔ Falha ao enviar pedido pro UTMify:", utmErr);
    }

    return NextResponse.json(
      {
        id: data.data.id,
        externalId: payload.external_id,
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
