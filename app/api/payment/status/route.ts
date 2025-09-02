import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 🔐 lista de domínios permitidos
const allowedOrigins = [
  "http://localhost:3000",
  "https://ff-et69.vercel.app",
  "https://www.recargajogo.com.de",
];

// helper para validar origem
function isOriginAllowed(request: NextRequest): boolean {
  const referer = request.headers.get("referer");
  if (!referer) return false;
  return allowedOrigins.some((origin) => referer.startsWith(origin));
}

// 🔥 Estendendo a tipagem do NodeJS.Global para aceitar nossas variáveis
declare global {
  // Para Next.js/Node.js
  // eslint-disable-next-line no-var
  var paymentStatus: string | undefined;
  // eslint-disable-next-line no-var
  var lastTransaction: any | null | undefined;
}

// Inicializa só uma vez (quando ainda não existem)
if (!globalThis.paymentStatus) globalThis.paymentStatus = "pending";
if (!globalThis.lastTransaction) globalThis.lastTransaction = null;

export async function GET(request: NextRequest) {
  if (!isOriginAllowed(request)) {
    return NextResponse.json({ error: "Clonei certo magicu op kkkkkkkkkkk" }, { status: 403 });
  }

  return NextResponse.json({
    status: globalThis.paymentStatus,
    transaction: globalThis.lastTransaction,
  });
}
