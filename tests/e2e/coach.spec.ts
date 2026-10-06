import { expect, test } from "@playwright/test";

test("camera setup uses local assets and can release the camera", async ({ page }) => {
  const externalRequests: string[] = [];
  const writeRequests: string[] = [];

  page.on("request", (request) => {
    const url = new URL(request.url());
    if (!["127.0.0.1", "localhost"].includes(url.hostname)) {
      externalRequests.push(request.url());
    }
    if (!["GET", "HEAD"].includes(request.method())) {
      writeRequests.push(request.url());
    }
  });

  await page.goto("/coach");
  await page.getByRole("button", { name: /Squat/ }).click();
  await expect(page.getByRole("heading", { name: "Camera ready when you are" })).toBeVisible();
  await page.getByRole("button", { name: "Enable camera" }).click();

  await expect(page.getByRole("button", { name: "Finish session" })).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByText("Active")).toBeVisible();

  await page.getByRole("button", { name: "Finish session" }).click();
  await expect(page.getByRole("heading", { name: "Camera ready when you are" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Session finished" })).toBeVisible();
  await page.getByRole("button", { name: "Save workout" }).click();
  await expect(page.getByText("Workout saved on this device. View it in Progress.")).toBeVisible();
  await page.goto("/progress");
  await expect(page.getByRole("heading", { name: "Squat · Beta" })).toBeVisible();
  await expect(page.getByText(/Saved on this device only/)).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export workouts" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("alterego-workouts.json");
  await page.getByRole("button", { name: "Delete workout" }).click();
  await page.getByRole("button", { name: "Confirm deletion" }).click();
  await expect(page.getByRole("heading", { name: "No saved workouts yet." })).toBeVisible();
  expect(externalRequests).toEqual([]);
  expect(writeRequests).toEqual([]);
});

test("exercise selection and camera controls are keyboard accessible", async ({ page }) => {
  await page.goto("/coach");
  await page.getByRole("button", { name: /Plank/ }).focus();
  await page.keyboard.press("Enter");

  await expect(page.getByRole("region", { name: "Plank camera setup" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Voice off" })).toHaveAttribute("aria-pressed", "false");
});
