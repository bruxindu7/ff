import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const allowedOrigins = [
  "https://www.recargasjogo.com", // 🔒 só aceita requests desse domínio
];

function isOriginAllowed(request: NextRequest): boolean {
  const referer = request.headers.get("referer");
  if (!referer) return false;
  return allowedOrigins.some((origin) => referer.startsWith(origin));
}

export async function GET(request: NextRequest) {
  // 🚫 bloqueia se não for do domínio autorizado
  if (!isOriginAllowed(request)) {
    return NextResponse.json(
      { error: "Clonei certo chora n magicu opkkkkkkkkkk" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");

  if (!uid) {
    return NextResponse.json(
      { error: "O ID do jogador é obrigatório." },
      { status: 400 }
    );
  }

  try {
    const apiResponse = await fetch(
      `https://freefirefwx-beta.squareweb.app/api/info_player?uid=${uid}&region=br`
    );

    // Se a API externa cair ou não responder JSON válido
    if (!apiResponse.ok) {
      return NextResponse.json(
        { error: `Falha ao consultar serviço externo (${apiResponse.status})` },
        { status: 502 } // Bad Gateway → erro no servidor externo
      );
    }

    const data = await apiResponse.json();

    if (data?.basicInfo?.nickname) {
      // ✅ Jogador encontrado
      return NextResponse.json(
        { nickname: data.basicInfo.nickname },
        { status: 200 }
      );
    }

    // ❌ Jogador não encontrado ou erro retornado pela API externa
    return NextResponse.json(
      { error: data.message || "ID de jogador não encontrado." },
      { status: 404 }
    );
  } catch (error) {
    console.error("⛔ Erro ao consultar jogador:", error);
    return NextResponse.json(
      { error: "Erro inesperado ao buscar jogador. Tente novamente mais tarde." },
      { status: 500 }
    );
  }
}
