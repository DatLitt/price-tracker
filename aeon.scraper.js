export async function scrapeAEON({ page, url, item_id }) {
  await page.goto(url, { waitUntil: "networkidle" });

  const jsonLdHandles = await page.$$('script[type="application/ld+json"]');

  for (const handle of jsonLdHandles) {
    const text = await handle.textContent();
    if (!text) continue;

    try {
      const data = JSON.parse(text);

      if (data["@type"] === "Product" && data.offers?.price) {
        return {
          item_id,
          mall: "AEON",
          item_name: data.name,
          price: Number(data.offers.price),
          currency: data.offers.priceCurrency || "VND",
          url,
        };
      }
    } catch (e) {
      // ignore invalid json
    }
  }

  throw new Error("AEON JSON-LD not found");
}
