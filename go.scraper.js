import { chromium } from "playwright";

/**
 * Scrape GO product
 * @param {string} url - product url
 * @param {string} item_id - normalized id (vd: vinamilk_dua_180mlx4)
 */
export async function scrapeGO({ url, item_id }) {
  const browser = await chromium.launch({
    headless: true, // đổi false nếu muốn debug
  });

  const context = await browser.newContext({
    locale: "vi-VN",
  });

  const page = await context.newPage();

  let apiData = null;

  // 🔎 Listen response từ API thật
  page.on("response", async (response) => {
    const responseUrl = response.url();

    if (responseUrl.includes("order2-productDetailWeb")) {
      try {
        const json = await response.json();

        apiData = json?.message;
      } catch (err) {
        console.log("Error parsing GO API:", err.message);
      }
    }
  });

  try {
    await page.goto(url, { waitUntil: "networkidle" });

    // đợi API call hoàn tất
    await page.waitForTimeout(2000);

    if (!apiData) {
      throw new Error("GO API data not captured");
    }

    const product = apiData;

    // =========================
    // 💰 PRICE LOGIC
    // =========================
    const basePrice = Number(product.price) || 0;
    const promotionPrice = Number(product.promotion_price) || 0;
    const memberPrice = Number(product.member_price) || 0;

    let originalPrice = basePrice;
    let sellPrice = basePrice;

    // nếu có promotion_price và > price hiện tại
    if (promotionPrice > basePrice) {
      originalPrice = promotionPrice;
      sellPrice = basePrice;
    }

    // nếu member price nhỏ hơn
    if (memberPrice > 0 && memberPrice < sellPrice) {
      sellPrice = memberPrice;
    }

    await browser.close();

    return {
      item_id,
      mall: "GO",
      product_id: product.id,
      name: product.name,
      image: product.thumbnail?.[0] ?? null,
      original_price: originalPrice,
      sell_price: sellPrice,
      scraped_at: new Date().toISOString(),
    };
  } catch (error) {
    await browser.close();
    throw error;
  }
}
