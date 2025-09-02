import { NextResponse } from "next/server";

const BUCKPAY_BASE_URL = "https://api.realtechdev.com.br";

export async function GET(
  _req: Request,
  { params }: { params: { external_id: string } }
) {
  try {
    const { external_id } = params;

    const r = await fetch(
      `${BUCKPAY_BASE_URL}/v1/transactions/external_id/${external_id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.BUCKPAY_TOKEN!}`,
        },
      }
    );

    const data = await r.json();

    if (!r.ok) {
      return NextResponse.json({ error: data }, { status: r.status });
    }

    return NextResponse.json(
      {
        id: data.data.id,
        status: data.data.status,
        amount: data.data.total_amount,
        createdAt: data.data.created_at,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("⛔ Erro backend status PIX:", err);
    return NextResponse.json(
      { error: "Falha ao consultar status PIX" },
      { status: 500 }
    );
  }
}
