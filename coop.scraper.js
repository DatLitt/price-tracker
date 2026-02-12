/**
 * Crawl price from Co.opmart (via Teko API)
 * @param {Object} params
 * @param {string} params.sku - Product SKU (from network tab)
 * @param {string} params.terminalCode - Store code (eg: 516_sgc)
 */
export async function crawlCoopProduct({ sku, terminalCode, item_id }) {
  const url = `https://discovery.tekoapis.com/api/v1/product?sku=${sku}&location=&terminalCode=${terminalCode}`;

  try {
    const res = await fetch(url, {
      headers: {
        accept: "application/json",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();

    const product = data?.result?.product;
    if (!product) {
      throw new Error("Product data not found");
    }

    const priceInfo = product.prices?.[0];
    const originalPrice = Number(priceInfo?.supplierRetailPrice);
    const sellPrice = Number(priceInfo?.latestPrice);

    return {
      item_id,
      mall: "coopmart",
      product_id: product.productInfo.sku,
      name: product.productInfo.name,
      image: product.productInfo.imageUrl,
      original_price: originalPrice,
      sell_price: sellPrice,
      scraped_at: new Date().toISOString(),
    };
  } catch (err) {
    console.error("COOP SCRAPE ERROR:", err.message);
    return null;
  }
}
