import { test, expect } from '@playwright/test';
import { login, navigateToGuards, navigateToAddGuard } from '../fixtures/auth.fixture';
import { generateUniqueGuardData, testPersonalDetails, testAddresses } from '../fixtures/test-data';

/**
 * Complete Add New Guard Workflow Test
 * Tests the entire 5-step guard creation process with unique data
 */

test.describe('Add New Guard - Complete Workflow', () => {

  test.beforeEach(async ({ page }) => {
    // Login before each test
    await login(page);
  });

  test('should successfully create a new guard with all details', async ({ page }) => {
    // Set longer timeout for this comprehensive test (5-step form + redirect)
    test.setTimeout(300000); 

    // Generate unique data for this test run
    const guardData = generateUniqueGuardData();
    console.log(`🧪 Testing with unique guard data: ${guardData.email}, ${guardData.phone}`);

    // Navigate to Guards page
    await navigateToGuards(page);

    // Navigate to Add New Guard
    await navigateToAddGuard(page);

    // ====================
    // STEP 1: PERSONAL DETAILS
    // ====================

    // Upload profile photo
    try {
      const fileChooserPromise = page.waitForEvent('filechooser');
      await page.getByText('Add PhotoMax size: 2MB').click();
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles('tests/fixtures/images/test-profile.png');
      console.log('✅ Profile photo uploaded');
    } catch (error) {
      console.log('⚠️ Skipping photo upload');
    }

    // Fill personal information with UNIQUE data
    await page.getByRole('textbox', { name: 'Enter First Name' }).fill(guardData.firstName);
    await page.getByRole('textbox', { name: 'Enter Last Name' }).fill(guardData.lastName);
    await page.getByRole('textbox', { name: 'Enter Email Address' }).fill(guardData.email); // ✅ Unique
    await page.getByPlaceholder('DD/MM/YYYY').fill('2003-10-16');

    // Select dropdowns
    await page.getByRole('combobox', { name: 'Select Sex' }).click();
    await page.getByRole('option', { name: 'Male', exact: true }).click();

    await page.getByRole('combobox', { name: 'Select Blood Group' }).click();
    await page.getByRole('option', { name: 'B+', exact: true }).click();

    // Fill remaining fields
    await page.getByRole('textbox', { name: 'Enter Nationality' }).fill(testPersonalDetails.nationality);
    await page.getByRole('textbox', { name: 'Enter Height' }).fill(testPersonalDetails.height);
    await page.getByRole('textbox', { name: 'Enter Weight (in kg)' }).fill(testPersonalDetails.weight);
    await page.getByRole('textbox', { name: 'Describe Any Distinctive Mark' }).fill(testPersonalDetails.identificationMark);
    await page.getByRole('textbox', { name: 'Enter Father\'s Full Name' }).fill(testPersonalDetails.fatherName);
    await page.getByRole('textbox', { name: 'Enter Mother\'s Full Name' }).fill(testPersonalDetails.motherName);

    await page.getByRole('combobox', { name: 'Select Marital Status' }).click();
    await page.getByRole('option', { name: 'Single' }).click();

    // Verify we're on step 1
    await expect(page.getByRole('heading', { name: 'PERSONAL DETAILS' })).toBeVisible();

    // Move to next step
    await page.getByRole('button', { name: 'Next' }).click();
    console.log('✅ Step 1 completed');

    // ====================
    // STEP 2: CONTACT DETAILS
    // ====================

    // Fill contact details with UNIQUE phone numbers
    await page.getByRole('textbox', { name: 'Enter 10-digit Mobile Number' }).fill(guardData.phone); // ✅ Unique
    await page.getByRole('textbox', { name: 'Enter 10-digit Alternate' }).fill(guardData.alternatePhone); // ✅ Unique

    // Emergency contact details
    await page.getByRole('textbox', { name: 'Enter First Name' }).fill('Emergency');
    await page.getByRole('textbox', { name: 'Enter Last Name' }).fill('Contact');

    await page.getByRole('combobox', { name: 'Select Relationship' }).click();
    await page.getByRole('option', { name: 'Brother', exact: true }).click();

    await page.getByRole('textbox', { name: 'Enter 10-digit Emergency' }).fill(guardData.emergencyPhone); // ✅ Unique

    // Verify we're on step 2
    await expect(page.getByRole('heading', { name: 'CONTACT DETAILS' })).toBeVisible();

    await page.getByRole('button', { name: 'Next' }).click();
    console.log('✅ Step 2 completed');

    // ====================
    // STEP 3: ADDRESS
    // ====================

    const address = testAddresses.pune;

    await page.locator('input[name="address.localAddress.addressLine1"]').fill(address.addressLine1);
    await page.locator('input[name="address.localAddress.addressLine2"]').fill(address.addressLine2);
    await page.locator('input[name="address.localAddress.city"]').fill(address.city);
    await page.getByRole('textbox', { name: 'Enter Pincode' }).fill(address.pincode);

    await page.getByRole('combobox', { name: 'Select State/Union Territory' }).first().fill('mah');
    await page.getByRole('option', { name: 'Maharashtra' }).click();

    await page.getByRole('combobox', { name: 'Select District' }).click();
    await page.getByRole('combobox', { name: 'Select District' }).fill('pun');
    await page.getByRole('option', { name: 'Pune' }).click();

    await page.locator('input[name="address.localAddress.landmark"]').fill(address.landmark);

    // Check "same as permanent address"
    await page.getByText('Tick if permanent address is').click();

    // Verify we're on step 3
    await expect(page.getByRole('heading', { name: 'ADDRESS DETAILS' })).toBeVisible();

    await page.getByRole('button', { name: 'Next' }).click();
    console.log('✅ Step 3 completed');

    // ====================
    // STEP 4: EMPLOYMENT DETAILS
    // ====================

    await page.locator('input[name="employmentDetails.dateOfJoining"]').fill('2025-10-22');

    await page.getByLabel('').nth(3).click();
    await page.getByRole('option', { name: 'Security Guard' }).click();

    await page.locator('.MuiBox-root.css-gdel2o > div:nth-child(2)').first().click();
    await page.getByRole('option', { name: 'Completed' }).click();

    // Verify we're on step 4
    await expect(page.getByRole('heading', { name: 'EMPLOYMENT DETAILS' })).toBeVisible();

    await page.getByRole('button', { name: 'Next' }).click();
    console.log('✅ Step 4 completed');

    // ====================
    // STEP 5: DOCUMENT VERIFICATION
    // ====================

    await page.getByRole('checkbox', { name: 'Aadhaar Card*' }).check();

    // Verify we're on step 5
    await expect(page.getByRole('heading', { name: 'VERIFIED DOCUMENTS' })).toBeVisible();

    // Submit the form
    console.log('📤 Submitting form...');
    await page.getByRole('button', { name: 'Submit', exact: true }).click();

    // ====================
    // FINAL ASSERTIONS
    // ====================

    // Wait for success message to appear first
    const successMessage = page.getByText(/created successfully|redirecting/i);
    await successMessage.waitFor({ state: 'visible', timeout: 10000 })
      .then(() => console.log('✅ Success message appeared'))
      .catch(async () => {
        // Check for error instead
        const errorAlert = await page.getByRole('alert').textContent().catch(() => '');
        throw new Error(`Form submission failed: ${errorAlert || 'Unknown error'}`);
      });

    // Now wait for the redirect (app redirects after 2 seconds, give it 30 seconds total)
    console.log('⏳ Waiting for redirect to guards list...');

    // Wait for URL to change away from /add-guard
    await page.waitForFunction(
      () => !window.location.pathname.includes('/add-guard'),
      { timeout: 30000 }
    ).catch(async () => {
      console.error('❌ Redirect timeout - Still on:', page.url());
      // Take screenshot for debugging
      await page.screenshot({ path: 'test-results/redirect-timeout.png' });
      throw new Error('Failed to redirect from add-guard page');
    });

    console.log('✅ Redirected away from add-guard page');

    // Wait for guards page to load
    await page.waitForLoadState('networkidle');

    // Verify we're on guards list page
    const currentUrl = page.url();
    console.log(`📍 Final URL: ${currentUrl}`);

    if (currentUrl.includes('/guards') && !currentUrl.includes('/add')) {
      // Wait for guards data to load
      await page.waitForTimeout(2000);

      // Successfully redirected to guards list
      await expect(page.getByRole('button', { name: 'Add New Guard' })).toBeVisible({ timeout: 15000 });
      console.log(`✅ Test completed successfully! Guard created: ${guardData.firstName} ${guardData.lastName}`);
    } else {
      throw new Error(`Unexpected URL after redirect: ${currentUrl}`);
    }
  });
});
