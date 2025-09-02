import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

const SMILE_URL = "https://www.smile.one/merchant/freefire";

async function getNickname(userId: string, zoneId = "BR") {
const browser = await puppeteer.launch({
  headless: true, // ou false se quiser ver o browser abrindo
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

  const page = await browser.newPage();
  await page.setRequestInterception(true);

  return new Promise(async (resolve, reject) => {
    page.on("request", (req) => req.continue());

    page.on("response", async (res) => {
      if (res.url().includes("/checkrole")) {
        try {
          const data = await res.json();
          await browser.close();
          resolve(data);
        } catch (e) {
          await browser.close();
          reject(e);
        }
      }
    });

    try {
      await page.goto(SMILE_URL, { waitUntil: "networkidle2" });

      await page.type("#uid", userId);

      await page.evaluate(() => {
        document
          .querySelector<HTMLInputElement>("#uid")
          ?.dispatchEvent(new Event("change", { bubbles: true }));
      });
    } catch (e) {
      await browser.close();
      reject(e);
    }
  });
}

export async function POST(req: Request) {
  try {
    const { userId, zoneId } = await req.json();
    const result = await getNickname(userId, zoneId || "BR");
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Erro:", err.message);
    return NextResponse.json(
      { error: "Falha ao buscar nickname" },
      { status: 500 }
    );
  }
}
