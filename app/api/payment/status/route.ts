import { NextResponse } from "next/server";

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

export async function GET() {
  return NextResponse.json({
    status: globalThis.paymentStatus,
    transaction: globalThis.lastTransaction,
  });
}
