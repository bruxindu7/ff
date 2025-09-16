import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const allowedOrigins = [
  'https://www.recargasjogo.com',
];

function isOriginAllowed(request: NextRequest): boolean {
  const referer = request.headers.get('referer');
  if (!referer) return false;
  return allowedOrigins.some((origin) => referer.startsWith(origin));
}

export async function GET(request: NextRequest) {
  if (!isOriginAllowed(request)) {
    return NextResponse.json({ nickname: 'Logado' }, { status: 200 });
  }

  const { searchParams } = new URL(request.url);
  const uid = searchParams.get('uid');

  if (!uid) {
    return NextResponse.json({ nickname: 'Logado' }, { status: 200 });
  }

  try {
    const apiResponse = await fetch(
      `https://freefirefwx-beta.squareweb.app/api/info_player?uid=${uid}&region=br`
    );

    const data = await apiResponse.json();

    if (data.basicInfo && data.basicInfo.nickname) {
      // ✅ Jogador encontrado
      return NextResponse.json({ nickname: data.basicInfo.nickname }, { status: 200 });
    } else {
      // ❌ Jogador não encontrado → ainda responde 200 com Logado
      return NextResponse.json({ nickname: 'Logado' }, { status: 200 });
    }
  } catch (error) {
    console.error('⛔ Erro ao consultar jogador:', error);
    // ⚠️ Mesmo erro retorna 200 com Logado
    return NextResponse.json({ nickname: 'Logado' }, { status: 200 });
  }
}
