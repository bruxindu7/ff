import puppeteer from "puppeteer";
import { NextResponse } from "next/server";

const SMILE_URL = "https://www.smile.one/merchant/freefire";
const ALLOWED_ORIGIN = "https://www.recargasjogo.com";

export async function GET(req: Request) {
  // 🔒 valida se a origem é a permitida
  const referer = req.headers.get("referer") || "";
  const origin = req.headers.get("origin") || "";

  if (!referer.startsWith(ALLOWED_ORIGIN) && origin !== ALLOWED_ORIGIN) {
    return NextResponse.json(
      { error: "Acesso não autorizado" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid");
  const zoneId = searchParams.get("zoneId") || "BR";

  if (!uid) {
    return NextResponse.json(
      { error: "O parâmetro uid é obrigatório." },
      { status: 400 }
    );
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setRequestInterception(true);

    const data = await new Promise<any>((resolve, reject) => {
      page.on("request", (req) => req.continue());

      page.on("response", async (res) => {
        if (res.url().includes("/checkrole")) {
          try {
            const json = await res.json();
            await browser.close();
            resolve(json);
          } catch (err) {
            await browser.close();
            reject(err);
          }
        }
      });

      (async () => {
        await page.goto(SMILE_URL, { waitUntil: "networkidle2" });
        await page.type("#uid", uid);
        await page.evaluate(() => {
          document
            .querySelector<HTMLInputElement>("#uid")
            ?.dispatchEvent(new Event("change", { bubbles: true }));
        });
      })().catch(reject);
    });

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Falha ao buscar nickname" },
      { status: 500 }
    );
  }
}
