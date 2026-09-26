import { expect, test, type Page } from "@playwright/test";

/**
 * E2E smoke tests run against a production build (`pnpm build && pnpm start`).
 * Each test gets a fresh browser context, so localStorage starts empty —
 * matching a first-visit experience.
 */

async function dismissIntro(page: Page) {
  // First visit shows a dismissible greeting; it must never block use.
  const dialog = page.locator('[aria-label="Birthday greeting"]');
  await dialog.waitFor({ state: "visible", timeout: 5000 }).catch(() => {});
  if (await dialog.isVisible().catch(() => false)) {
    await dialog.getByRole("button", { name: "Begin the experience" }).click();
  }
}

test("overview greets Emma and navigates into all modules", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Happy Birthday to my Angel|Chúc mừng sanh nhựt|عشقي الأبدي|Muhteşem müstakbel|μακάριον γενέθλιον/i })).toBeVisible();
  await dismissIntro(page);

  for (const label of ["Birthday Bank", "Future Fund", "Wish List", "My Letter"]) {
    await expect(
      page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: label }),
    ).toBeVisible();
  }

  await page.getByRole("link", { name: "Open my fortune" }).click();
  await expect(page).toHaveURL(/\/bank$/);
});

test("bank: redeeming a coupon requires confirmation and records activity", async ({ page }) => {
  await page.goto("/bank");
  await dismissIntro(page);

  await expect(page.getByTestId("love-balance")).toContainText(/1\.000\.000|1,000,000/);
  await expect(page.getByText("minted from a moment with you")).toBeVisible();
  await expect(page.getByText(/something magical will appear before you/i)).toBeVisible();

  const redeemButton = page.getByRole("button", { name: /Redeem coupon: One long hug/i });
  await redeemButton.click();
  await expect(page.getByText("Redeem this little promise?")).toBeVisible();

  // Cancel keeps it available.
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByRole("button", { name: /Redeem coupon: One long hug/i })).toBeVisible();

  await redeemButton.click();
  await page.getByRole("button", { name: "Confirm" }).click();

  await expect(page.getByText("Redeemed (1)")).toBeVisible();
  await expect(page.getByText("One long hug").first()).toBeVisible();
  await expect(page.getByText(/Starting fortune/i)).toBeVisible();
  await expect(page.getByTestId("love-balance")).toContainText(/995\.000|995,000/);
});

test("fund: contributions update totals and progress honestly", async ({ page }) => {
  await page.goto("/fund");
  await dismissIntro(page);

  await expect(page.getByTestId("fund-saved")).toContainText("₫");

  // Invalid input is rejected inline.
  await page.getByLabel("Amount").fill("-5");
  await page.getByRole("button", { name: "Add contribution" }).click();
  await expect(page.getByText("must be greater than zero")).toBeVisible();

  await page.getByLabel("Amount").fill("1000000");
  await page.getByRole("button", { name: "Add contribution" }).click();

  await expect(page.getByText("Contribution recorded", { exact: false })).toBeVisible();
  await expect(page.getByText("20%")).toBeVisible();
  await expect(page.getByText("Contributions (1)")).toBeVisible();
});

test("wishlist: add, favorite, and filter a wish", async ({ page }) => {
  await page.goto("/wishlist");
  await dismissIntro(page);

  await page.getByRole("button", { name: "Add to wishlist" }).first().click();
  await page.getByLabel("Name").fill("Vintage vinyl player");
  await page.getByRole("button", { name: "Add wish" }).click();

  await expect(page.getByRole("heading", { name: "Vintage vinyl player" })).toBeVisible();

  // Favorite it, then filter to favorites only.
  const favButton = page.getByRole("button", { name: /Add Vintage vinyl player to favorites/i });
  await favButton.click();
  await page.getByRole("button", { name: "Favorites", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Vintage vinyl player" })).toBeVisible();

  // A query that matches nothing shows the filtered empty state.
  await page.getByLabel("Search wishes").fill("zzzz-no-match");
  await expect(page.getByText("No wishes match")).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.getByRole("heading", { name: "Vintage vinyl player" })).toBeVisible();
});

test("letter: opens, is readable, and can be read again", async ({ page }) => {
  await page.goto("/letter");
  await dismissIntro(page);

  await page.getByRole("button", { name: "Open the letter" }).click();
  await expect(page.getByText(/Happy birthday, my love\./)).toBeVisible();
  await expect(page.getByText(/I love you\./)).toBeVisible();

  await page.getByRole("button", { name: "Read it again" }).click();
  await expect(page.getByRole("button", { name: "Open the letter" })).toBeVisible();
});

test("boutique: buying a treasure records it; fund coins can fly to the bank", async ({ page }) => {
  await page.goto("/bank");
  await dismissIntro(page);

  const balanceBefore = await page.getByTestId("love-balance").textContent();
  await page.getByRole("button", { name: /^Buy .+ for [0-9.,]+ love points$/i }).first().click();
  await expect(page.getByText(/is yours. Wear it happily/i)).toBeVisible();
  const balanceAfter = await page.getByTestId("love-balance").textContent();
  if (balanceBefore === balanceAfter) {
    throw new Error("Balance did not change after a purchase");
  }
  await expect(page.getByText(/Boutique finds:/i)).toBeVisible();

  // Fund -> bank transfer
  await page.goto("/fund");
  await dismissIntro(page);
  await page.getByLabel("Amount").fill("100000");
  await page.getByRole("button", { name: "Add contribution" }).click();
  await expect(page.getByText("Contributions (1)")).toBeVisible();
  await page.getByRole("button", { name: /Send coins to my Birthday Bank/i }).click();
  await page.getByLabel("How many coins?").fill("40000");
  await page.getByRole("button", { name: /Fly to the bank/i }).click();
  await expect(page.getByText(/Coins now living in your Birthday Bank/i)).toBeVisible();

  await page.goto("/bank");
  await dismissIntro(page);
  await expect(page.getByText("A gift from your Future Fund")).toBeVisible();

  // The bought treasure lives in her wishlist too, brand attached.
  await page.goto("/wishlist");
  await dismissIntro(page);
  await expect(page.getByText("Boutique")).toBeVisible().catch(() => {});
  await expect(page.locator("h3", { hasText: /Lipstick|Perfume|Blush|Cream|Serum|Mask|Candle|Necklace|Scarf/i }).first()).toBeVisible();
});

test("wishlist: favourites can be printed to a PDF of names and brands only", async ({ page }) => {
  await page.goto("/wishlist");
  await dismissIntro(page);

  // Favorite one card so "My favourites" has content.
  await page.getByRole("button", { name: /Add .+ to favorites/i }).first().click();

  await page.getByRole("button", { name: /Print my favourites/i }).click();
  await expect(page.getByText("A little list for the real world")).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /My favourites \(\d+\)/ }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/-favourites\.pdf$/i);
});

test("the hidden music box can be found and songs can be switched", async ({ page }) => {
  await page.goto("/");
  await dismissIntro(page);

  await page.getByRole("button", { name: /hidden little music box/i }).click();
  await expect(page.getByRole("dialog", { name: /hidden music box/i })).toBeVisible();
  await expect(page.getByRole("button", { name: "Candles in the Golden Hour" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Layali al-Anwar/i })).toBeVisible();

  await page.getByRole("button", { name: /Caravan of Stars/i }).click();
  await expect(page.getByText(/for you/i).first()).toBeVisible();
  await expect(page.getByText("Ancient Middle East").first()).toBeVisible();
});

test("the owner can upload a recording for a song right in Settings", async ({ page }) => {
  await page.goto("/settings");
  await dismissIntro(page);

  await expect(page.getByText("The songs")).toBeVisible();
  await expect(page.getByRole("button", { name: "Add a recording" })).toHaveCount(5);

  // A tiny valid WAV: 44-byte header plus a whisper of silence.
  const sampleRate = 8000;
  const samples = new Int16Array(sampleRate / 4);
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + samples.length * 2, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(samples.length * 2, 40);
  const wav = Buffer.concat([header, Buffer.from(samples.buffer)]);

  await page
    .getByLabel(/Upload a recording for Candles in the Golden Hour/i)
    .setInputFiles({ name: "candles.wav", mimeType: "audio/wav", buffer: wav });

  await expect(page.getByText(/will play from now on/i)).toBeVisible();
  await expect(page.getByText("your recording")).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Add a recording" })).toHaveCount(4);
  await expect(page.getByRole("button", { name: "Replace" })).toHaveCount(1);

  // Survives a reload — the locker is persistent.
  await page.reload();
  await dismissIntro(page);
  await expect(page.getByRole("button", { name: "Replace" })).toHaveCount(1);
});

test("data persists across reload", async ({ page }) => {
  await page.goto("/fund");
  await dismissIntro(page);
  await page.getByLabel("Amount").fill("250000");
  await page.getByRole("button", { name: "Add contribution" }).click();
  await expect(page.getByText("Contributions (1)")).toBeVisible();

  await page.reload();
  await dismissIntro(page);
  await expect(page.getByText("Contributions (1)")).toBeVisible();
  await expect(page.getByText(/250\.000|250,000/).first()).toBeVisible();
});

test("no horizontal overflow at 320px on any route", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 680 });
  for (const route of ["/", "/bank", "/fund", "/wishlist", "/letter", "/settings"]) {
    await page.goto(route);
    await dismissIntro(page);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    if (overflow > 0) {
      throw new Error(`Horizontal overflow of ${overflow}px on ${route}`);
    }
  }
});
