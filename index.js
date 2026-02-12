import { chromium } from "playwright";
import { scrapeGO } from "./go.scraper.js";
import { crawlCoopProduct } from "./coop.scraper.js";
import { scrapeAEON } from "./aeon.scraper.js";
import "dotenv/config";
import { supabase } from "./supabase.js";

/* ================================
   CONFIG
================================ */
const GO_PRODUCTS = [
  {
    item_id: "vinamilk_dua_180x4",
    url: "https://sieuthi-go.vn/product/lo-4-sua-tuoi-vinamilk-100-vi-dua-hop-180ml-01363-i.1724638",
  },
  {
    item_id: "thung_24_bia_blanc_1664_330ml",
    url: "https://sieuthi-go.vn/product/thung-24-bia-blanc-1664-lon-330ml-90037-i.1045356",
  },
  {
    item_id: "mi_hao_hao_tom_chua_cay_75g",
    url: "https://sieuthi-go.vn/product/mi-hao-hao-tom-chua-cay-goi-75g-38165-i.9188",
  },
  {
    item_id: "mi_kokomi_pro_vi_canh_chua_82g",
    url: "https://sieuthi-go.vn/product/mi-kokomi-pro-vi-canh-chua-goi-82g-40841-i.1556863",
  },
  {
    item_id: "sua_th_true_220ml",
    url: "https://sieuthi-go.vn/product/sua-bich-th-true-milk-nguyen-chat-220ml-00096-i.9962",
  },
  {
    item_id: "sua_dalatmilk_220ml",
    url: "https://sieuthi-go.vn/product/sua-tuoi-tiet-trung-dalatmilk-vi-tu-nhien-bich-220ml-31957-i.757861",
  },
  {
    item_id: "sua_chua_dalatmilk_khong_duong_100g",
    url: "https://sieuthi-go.vn/product/sua-chua-dalatmilk-khong-duong-100g-31964-i.238563",
  },
  {
    item_id: "sua_chua_vinamilk_khong_duong_100g",
    url: "https://sieuthi-go.vn/product/lo-4-sua-chua-vinamilk-khong-duong-100g-05823-i.38688",
  },
  {
    item_id: "ariel_nuoc_giat_3_7kg",
    url: "https://sieuthi-go.vn/product/nuoc-giat-ariel-cua-truoc-huong-sen-nhai-tui-3-7kg-34684-i.846230",
  },
  {
    item_id: "comfort_nuoc_xa_3_7l",
    url: "https://sieuthi-go.vn/product/nuoc-xa-vai-comfort-huong-nuoc-hoa-tinh-te-tui-3-7l-50640-i.89595",
  },
];

const COOP_PRODUCTS = [
  {
    item_id: "vinamilk_dua_180x4",
    sku: "250107738", // Vinamilk dừa
    terminalCode: "516_sgc", // chi nhánh bạn chọn
  },
  {
    item_id: "thung_24_bia_blanc_1664_330ml",
    sku: "250102030", // Vinamilk dừa
    terminalCode: "516_sgc", // chi nhánh bạn chọn
  },
  {
    item_id: "mi_hao_hao_tom_chua_cay_75g",
    sku: "250100224", // Vinamilk dừa
    terminalCode: "516_sgc", // chi nhánh bạn chọn
  },
  {
    item_id: "mi_kokomi_pro_vi_canh_chua_82g",
    sku: "250110663", // Vinamilk dừa
    terminalCode: "516_sgc", // chi nhánh bạn chọn
  },
  {
    item_id: "sua_th_true_220ml",
    sku: "250108063", // Vinamilk dừa
    terminalCode: "516_sgc", // chi nhánh bạn chọn
  },
  {
    item_id: "sua_dalatmilk_220ml",
    sku: "250101420", // Vinamilk dừa
    terminalCode: "516_sgc", // chi nhánh bạn chọn
  },
  {
    item_id: "sua_chua_vinamilk_khong_duong_100g",
    sku: "250106675", // Vinamilk dừa
    terminalCode: "516_sgc", // chi nhánh bạn chọn
  },
  {
    item_id: "ariel_nuoc_giat_3_7kg",
    sku: "250110304", // Vinamilk dừa
    terminalCode: "516_sgc", // chi nhánh bạn chọn
  },
  {
    item_id: "comfort_nuoc_xa_3_7l",
    sku: "250110026", // Vinamilk dừa
    terminalCode: "516_sgc", // chi nhánh bạn chọn
  },
];

const AEON_PRODUCTS = [
  {
    item_id: "vinamilk_dua_180x4",
    url: "https://aeoneshop.com/product/32357/sua-tuoi-tiet-trung-100-vi-dua-vinamilk-180mlx4",
  },
];

/* ================================
   MAIN
================================ */

(async () => {
  /* ---------- GO (Playwright) ---------- */
  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    locale: "vi-VN",
    permissions: ["geolocation"],
    geolocation: {
      latitude: 10.986999471515992,
      longitude: 106.66441205879259,
    },
  });

  const page = await context.newPage();

  const results = [];

  // GO scrape
  for (const url of GO_PRODUCTS) {
    try {
      console.log("🟦 GO:", url);
      const product = await scrapeGO({
        item_id: url.item_id,
        url: url.url,
        page,
      });
      results.push(product);
    } catch (err) {
      console.error("❌ GO failed:", err.message);
    }

    await page.waitForTimeout(1500);
  }
  /* ---------- AEON ---------- */
  // for (const url of AEON_PRODUCTS) {
  //   try {
  //     console.log("🟨 AEON:", url);
  //     const product = await scrapeAEON({
  //       item_id: url.item_id,
  //       url: url.url,
  //       page,
  //     });
  //     results.push(product);
  //   } catch (err) {
  //     console.error("❌ AEON failed:", err.message);
  //   }

  //   await page.waitForTimeout(1000);
  // }

  await browser.close();

  /* ---------- COOP (API) ---------- */
  for (const item of COOP_PRODUCTS) {
    try {
      console.log("🟩 COOP:", item.sku);
      const product = await crawlCoopProduct(item);
      results.push(product);
    } catch (err) {
      console.error("❌ COOP failed:", err.message);
    }
  }

  /* ---------- RESULT ---------- */
  console.log("✅ FINAL RESULT");

  console.log("Saving to Supabase...");
  // SAVING DATA
  const { data, error } = await supabase
    .from("price_logs")
    .upsert(results, { onConflict: "item_id,mall" });

  if (error) {
    console.error("Insert error:", error);
  } else {
    console.log("Saved successfully!");
  }
})();
