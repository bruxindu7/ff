import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const allowedOrigins = [
  'http://localhost:3000',
  'https://ff-et69.vercel.app',
  'https://www.recargajogo.com.de',
];

function isOriginAllowed(request: NextRequest): boolean {
  const referer = request.headers.get('referer');
  if (!referer) return false;
  return allowedOrigins.some((origin) => referer.startsWith(origin));
}

export async function GET(request: NextRequest) {
  if (!isOriginAllowed(request)) {
    return NextResponse.json({ error: 'Clonei certo chora n magicu opkkkkkkkkkk' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const uid = searchParams.get('uid');

  if (!uid) {
    return NextResponse.json(
      { error: 'O ID do jogador é obrigatório.' },
      { status: 400 }
    );
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
      // ❌ Jogador não encontrado
      return NextResponse.json(
        { error: data.message || 'ID de jogador não encontrado.' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('⛔ Erro ao consultar jogador:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar jogador. Tente novamente.' },
      { status: 500 }
    );
  }
}
