import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sendOrderToUtmify, formatToUtmifyDate } from "@/lib/utmifyService";
import { UtmifyOrderPayload } from "@/interfaces/utmify";

const BUCKPAY_BASE_URL = "https://api.realtechdev.com.br";

// 🔐 lista de domínios permitidos
const allowedOrigins = [
  "https://www.recargasjogos.skin",
  "http://localhost:3000",
];

// helper para validar a origem
function isOriginAllowed(request: NextRequest): boolean {
  const referer = request.headers.get("referer");
  if (!referer) return false;
  return allowedOrigins.some((origin) => referer.startsWith(origin));
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ external_id: string }> }
) {
  if (!isOriginAllowed(request)) {
    return NextResponse.json(
      { error: "Origem não permitida" },
      { status: 403 }
    );
  }

  try {
    const { external_id } = await context.params;

    const r = await fetch(
      `${BUCKPAY_BASE_URL}/v1/transactions/external_id/${external_id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.BUCKPAY_TOKEN!}`,
          "User-Agent": "Buckpay API", // 🔥 obrigatório
        },
      }
    );

    const data = await r.json();
    console.log("➡ Status BuckPay:", r.status, data);

    if (!r.ok) {
      return NextResponse.json({ error: data }, { status: r.status });
    }

    const status = data.data.status;
    const response = {
      id: data.data.id,
      status,
      amount: data.data.total_amount,
      createdAt: data.data.created_at,
    };

    // 🔹 Se pago → dispara update pro UTMify
    if (status === "paid") {
      try {
        const utmifyPayload: UtmifyOrderPayload = {
          orderId: data.data.id,
          platform: process.env.SITE_NAME || "FreefireJ",
          paymentMethod: "pix",
          status: "approved", // 👈 agora aprovado
          createdAt: formatToUtmifyDate(new Date(data.data.created_at)),
          approvedDate: formatToUtmifyDate(new Date()),
          refundedAt: null,
          customer: {
            name: data.data.buyer?.name,
            email: data.data.buyer?.email,
            phone: data.data.buyer?.phone?.replace(/\D/g, ""),
            document: data.data.buyer?.document,
            country: "BR",
            ip: data.data.buyer?.ip || "127.0.0.1",
          },
          products: [
            {
              id: `prod_${Date.now()}`,
              name: "Recarga Free Fire",
              planId: null,
              planName: null,
              quantity: 1,
              priceInCents: data.data.total_amount,
            },
          ],
          trackingParameters: {
            src: data.data.tracking?.src,
            sck: data.data.tracking?.sck,
            utm_source: data.data.tracking?.utm_source,
            utm_medium: data.data.tracking?.utm_medium,
            utm_campaign: data.data.tracking?.utm_campaign,
            utm_id: data.data.tracking?.utm_id,
            utm_term: data.data.tracking?.utm_term,
            utm_content: data.data.tracking?.utm_content,
          },
          commission: {
            totalPriceInCents: data.data.total_amount,
            gatewayFeeInCents: 0,
            userCommissionInCents: data.data.total_amount,
            currency: "BRL",
          },
          isTest: false,
        };

        await sendOrderToUtmify(utmifyPayload);
        console.log("✅ Atualizado no UTMify como approved:", utmifyPayload.orderId);
      } catch (utmErr) {
        console.error("⛔ Falha ao atualizar UTMify:", utmErr);
      }
    }

    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    console.error("⛔ Erro backend status PIX:", err);
    return NextResponse.json(
      { error: "Falha ao consultar status PIX" },
      { status: 500 }
    );
  }
}
