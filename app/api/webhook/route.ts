import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const transactions: Record<string, any> = {}; // memória (reinicia a cada deploy)

// 🔐 lista de domínios permitidos
const allowedOrigins = [
  "https://www.recargajogo.best",
  "http://localhost:3000",
];

// helper para validar origem
function isOriginAllowed(request: NextRequest): boolean {
  const referer = request.headers.get("referer");
  if (!referer) return false;
  return allowedOrigins.some((origin) => referer.startsWith(origin));
}

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

// Consulta o status de uma transação (🔒 protegido por origem)
export async function GET(req: NextRequest) {
  if (!isOriginAllowed(req)) {
    return NextResponse.json({ error: "Clonou errado kk" }, { status: 403 });
  }

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
