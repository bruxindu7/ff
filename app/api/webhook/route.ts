import { NextResponse } from "next/server";

const transactions: Record<string, any> = {}; // memória (reinicia a cada deploy)

// Webhook chamado pelo BuckPay
export async function POST(req: Request) {
  const body = await req.json();
  const data = body.data || {};
  const id = data.id;

  if (id) {
    transactions[id] = data; // Salva a transação por ID
    console.log("Transação salva:", transactions[id]);
  }

  return NextResponse.json({ ok: true });
}

// Consulta o status de uma transação
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id && transactions[id]) {
    return NextResponse.json({
      status: transactions[id].status,
      transaction: transactions[id],
    });
  }

  return NextResponse.json({ status: "not_found" });
}
