// src/lib/utmifyService.ts
export async function sendOrderToUtmify(payload: any) {
  try {
    const res = await fetch("https://api.utmify.com.br/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.UTMIFY_API_KEY!}`, // 🔑 coloca tua chave no .env
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("⛔ Erro UTMify:", res.status, data);
      throw new Error(data.error || "Falha ao enviar pedido para UTMify");
    }

    return data;
  } catch (err) {
    console.error("⛔ Erro sendOrderToUtmify:", err);
    throw err;
  }
}

// helper para datas no formato aceito pela UTMify (ISO sem milissegundos)
export function formatToUtmifyDate(date: Date) {
  return date.toISOString().split(".")[0] + "Z";
}
