import { faker } from "@faker-js/faker";
import { Page } from "@playwright/test";

export interface ClientData {
  name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
}

export function generateRandomClientData() {
  const companyName = faker.company.name();
  const clientName = `${companyName} Ltd`;
  const phoneNumber = "+91" + faker.string.numeric(10);
  const email = faker.internet.email().toLowerCase();

  return {
    clientName,
    clientLogo: "./tests/assets/logo.jpg",
    addressLine1: faker.location.buildingNumber(),
    addressLine2: faker.location.street(),
    city: faker.location.city(),
    district: "Bamboo Flat District",
    pinCode: "123456",
    state: "Andaman and Nicobar Islands",
    designation: "Manager",
    phoneNumber,
    mail: email,
  };
}

export async function createClient(
  page,
  clientName,
  clientLogo,
  addressLine1,
  addressLine2,
  city,
  district,
  pinCode,
  state,
  designation,
  phoneNumber,
  mail
) {
  await page.getByRole("button", { name: "Clients" }).click();
  await page.getByRole("button", { name: "Add New Client" }).click();
  await page.getByRole("textbox", { name: "Enter Client's Full Name" }).click();
  await page.getByRole("textbox", { name: "Enter Client's Full Name" }).fill(clientName);
  await page.locator('input[type="file"]').setInputFiles(clientLogo);
  await page.getByRole("textbox", { name: "Enter Flat no./House No./" }).click();
  await page.getByRole("textbox", { name: "Enter Flat no./House No./" }).fill(addressLine1);
  await page.getByRole("textbox", { name: "Enter Flat no./House No./" }).press("Tab");
  await page.getByRole("textbox", { name: "Enter Street Name/ Road /Lane" }).fill(addressLine2);
  await page.getByRole("textbox", { name: "Enter Street Name/ Road /Lane" }).press("Tab");
  await page.getByRole("combobox", { name: "Select State" }).click();
  await page.getByRole("option", { name: state }).click();
  await page.getByText("Select City").click();
  await page.getByRole("option", { name: "Bamboo Flat" }).click();
  await page.getByRole("textbox", { name: "Enter District Name" }).click();
  await page.getByRole("textbox", { name: "Enter District Name" }).fill(district);
  await page.getByRole("textbox", { name: "Enter Pin Code" }).click();
  await page.getByRole("textbox", { name: "Enter Pin Code" }).fill(pinCode);
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("textbox", { name: "Enter Full Name" }).click();
  await page.getByRole("textbox", { name: "Enter Full Name" }).fill(clientName);
  await page.getByRole("textbox", { name: "Enter Designation" }).click();
  await page.getByRole("textbox", { name: "Enter Designation" }).fill(designation);
  await page.getByRole("textbox", { name: "Enter Designation" }).press("Tab");
  await page.getByRole("textbox", { name: "Enter Phone Number" }).fill(phoneNumber);
  await page.getByRole("textbox", { name: "Enter Email Address" }).click();
  await page.getByRole("textbox", { name: "Enter Email Address" }).fill(mail);
  await page.getByRole("button", { name: "Submit", exact: true }).click();
  await page.getByRole("button", { name: "DO IT LATER" }).click();
}

export async function extractClientDataFromTable(page: Page): Promise<ClientData[]> {
  await page.waitForSelector(".MuiDataGrid-virtualScrollerRenderZone", { timeout: 10000 });
  const clientData: ClientData[] = [];

  try {
    console.log("Extracting data from MUI DataGrid...");

    // Find all data grid rows
    const dataGridRows = await page.locator(".MuiDataGrid-row").all();
    console.log(`Found ${dataGridRows.length} data grid rows`);

    for (const row of dataGridRows) {
      try {
        // Extract client ID (for reference, not used in output)
        const idCell = row.locator('[data-field="id"]');
        await idCell.textContent(); // Read but don't store since not used

        // Extract client name
        const nameCell = row.locator('[data-field="clientName"]');
        const clientName = (await nameCell.textContent()) || "";

        // Extract main office (address)
        const officeCell = row.locator('[data-field="mainOffice"]');
        const mainOffice = (await officeCell.textContent()) || "";

        // Extract total sites
        const sitesCell = row.locator('[data-field="totalSites"]');
        const totalSites = (await sitesCell.textContent()) || "";

        // Extract total guards
        const guardsCell = row.locator('[data-field="totalGuards"]');
        const totalGuards = (await guardsCell.textContent()) || "";

        // Only add if we have a client name
        if (clientName.trim()) {
          clientData.push({
            name: clientName.trim(),
            email: "",
            phone: "",
            address: mainOffice.trim(),
            status: `Sites: ${totalSites.trim()}, Guards: ${totalGuards.trim()}`,
          });
        }
      } catch (error) {
        console.log("Error extracting row data:", error);
      }
    }

    console.log(`Extracted ${clientData.length} clients from MUI DataGrid`);
    return clientData;
  } catch (error) {
    console.log("Error in extractClientDataFromTable:", error);
    return [];
  }
}

export async function getPaginationInfo(page: Page) {
  const pageButtons = await page
    .locator("button")
    .filter({ hasText: /^[1-9]$/ })
    .all();

  let currentPage = 1;
  const totalPages = pageButtons.length;

  // Find the current active page
  for (const button of pageButtons) {
    try {
      const ariaCurrent = await button.getAttribute("aria-current");
      const className = await button.getAttribute("class");
      const isActive =
        ariaCurrent === "page" ||
        (className && className.includes("active")) ||
        (className && className.includes("selected"));

      if (isActive) {
        const text = await button.textContent();
        if (text && !isNaN(parseInt(text))) {
          currentPage = parseInt(text);
          break;
        }
      }
    } catch {
      // Continue to next button
    }
  }

  // If no active page found, try to detect from the visible state
  if (currentPage === 1 && totalPages > 1) {
    for (const button of pageButtons) {
      try {
        const text = await button.textContent();
        const isVisible = await button.isVisible();
        if (text && !isNaN(parseInt(text)) && isVisible) {
          // Check if this button looks like it's the current page
          const buttonText = text.trim();
          if (buttonText === "1") {
            currentPage = 1;
            break;
          }
        }
      } catch {
        // Continue to next button
      }
    }
  }

  return {
    currentPage: currentPage,
    totalPages: totalPages,
  };
}

export async function validatePaginationControls(page: Page) {
  try {
    const pageButtons = await page
      .locator("button")
      .filter({ hasText: /^[1-9]$/ })
      .all();

    if (pageButtons.length > 0) {
      console.log(`Found ${pageButtons.length} page buttons`);
      return true;
    }
  } catch {
    // Continue
  }

  // Look for the "Show X Rows" dropdown
  try {
    const showRowsElement = await page.getByText(/Show\d+\s*Rows/).first();
    const isVisible = await showRowsElement.isVisible({ timeout: 2000 });
    if (isVisible) {
      console.log("Found 'Show X Rows' pagination control");
      return true;
    }
  } catch {
    // Continue
  }

  // Look for navigation arrows
  try {
    const navButtons = await page.locator("button").filter({ hasText: /^$/ }).all();
    if (navButtons.length >= 2) {
      console.log(`Found ${navButtons.length} navigation buttons`);
      return true;
    }
  } catch {
    // Continue
  }

  console.log("No pagination controls found");
  return false;
}

export async function navigateToPage(page: Page, pageNumber: number) {
  await page.getByRole("button", { name: pageNumber.toString(), exact: true }).click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);
}
