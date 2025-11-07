import { test, expect } from '@playwright/test';
import { login, navigateToOfficers, navigateToAddOfficer } from '../fixtures/auth.fixture';
import { generateUniqueOfficerData, testPersonalDetails, testAddresses } from '../fixtures/test-data';

/**
 * Complete Add New Area Officer Workflow Test
 * Tests the entire 5-step officer creation process with unique data
 */

test.describe('Add New Area Officer - Complete Workflow', () => {

  test.beforeEach(async ({ page }) => {
    // Login before each test
    await login(page);
  });

  test('should successfully create a new area officer with all details', async ({ page }) => {
    // Set longer timeout for this comprehensive test (5-step form + redirect)
    test.setTimeout(90000); // 90 seconds

    // Generate unique data for this test run
    const officerData = generateUniqueOfficerData();
    console.log(`🧪 Testing with unique officer data: ${officerData.email}, ${officerData.phone}`);

    // Navigate to Area Officers page
    await navigateToOfficers(page);

    // Navigate to Add New Officer
    await navigateToAddOfficer(page);

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
    await page.getByRole('textbox', { name: 'Enter First Name' }).fill(officerData.firstName);
    await page.getByRole('textbox', { name: 'Enter Last Name' }).fill(officerData.lastName);
    await page.getByRole('textbox', { name: 'Enter Email Address' }).fill(officerData.email); // ✅ Unique
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
    await page.getByRole('textbox', { name: 'Enter 10-digit Mobile Number' }).fill(officerData.phone); // ✅ Unique
    await page.getByRole('textbox', { name: 'Enter 10-digit Alternate' }).fill(officerData.alternatePhone); // ✅ Unique

    // Emergency contact details
    await page.getByRole('textbox', { name: 'Enter First Name' }).fill('Emergency');
    await page.getByRole('textbox', { name: 'Enter Last Name' }).fill('Contact');

    await page.getByRole('combobox', { name: 'Select Relationship' }).click();
    await page.getByRole('option', { name: 'Brother', exact: true }).click();

    await page.getByRole('textbox', { name: 'Enter 10-digit Emergency' }).fill(officerData.emergencyPhone); // ✅ Unique

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
    await page.locator('input[name="address.localAddress.pincode"]').fill(address.pincode);

    await page.getByRole('combobox', { name: 'Select State/Union Territory' }).first().fill('mah');
    await page.getByRole('option', { name: 'Maharashtra' }).click();

    // Wait for district field to be ready
    await page.waitForTimeout(1000);

    // District is a text input field, not a combobox - use specific locator for local address
    await page.locator('input[name="address.localAddress.district"]').fill('Pune');

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

    // Date of Joining
    await page.locator('input[name="employmentDetails.dateOfJoining"]').fill('2025-10-22');

    // Designation
    await page.getByRole('textbox', { name: 'Enter Designation' }).fill('Area Officer');

    // Wait for areas and managers to load (they load from API)
    console.log('⏳ Waiting for areas and managers to load from API...');

    // Wait longer for API data to load - up to 10 seconds
    await page.waitForTimeout(8000);

    // Find the Assigned Duty Area dropdown - look for the TextField container
    // The dropdown is rendered as a MUI TextField with select
    const dutyAreaContainer = page.locator('div').filter({
      has: page.locator('input[name="employmentDetails.assignedDutyArea"]')
    }).first();

    // Wait for the container to be visible
    await dutyAreaContainer.waitFor({ state: 'visible', timeout: 15000 });

    // Find the clickable div (the actual select trigger)
    const dutyAreaDropdown = dutyAreaContainer.locator('div[role="combobox"]').first();

    // Click to open the dropdown
    console.log('📍 Clicking Assigned Duty Area dropdown...');
    await dutyAreaDropdown.click();

    // Wait for options to appear
    await page.waitForTimeout(1500);

    // Select the first area option that's not the placeholder
    const areaOptions = page.getByRole('option');
    const areaCount = await areaOptions.count();
    console.log(`Found ${areaCount} area options`);

    if (areaCount > 1) {
      // Skip "Select Duty Area" or "Loading" and select first real option
      await areaOptions.nth(1).click();
      console.log('✅ Selected duty area');

      // Wait for the area dropdown to close
      await page.waitForTimeout(1000);
    } else {
      console.log('⚠️ No areas available - skipping (form will show validation error)');
      // Press Escape to close the dropdown
      await page.keyboard.press('Escape');
    }

    // IMPORTANT: Wait for managers API to load for the selected area
    // The frontend filters managers based on selected area, so we need to wait
    console.log('⏳ Waiting for managers to load for selected area...');
    await page.waitForTimeout(3000);

    // Make sure the area dropdown is fully closed by pressing Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Now find the Area Manager dropdown - it's the SECOND combobox on the page
    // First combobox is Assigned Duty Area, second is Area Manager
    console.log('📍 Finding Area Manager dropdown (the second combobox)...');
    const allComboboxes = page.locator('div[role="combobox"]');
    const comboboxCount = await allComboboxes.count();
    console.log(`Found ${comboboxCount} comboboxes on the page`);

    // The Area Manager dropdown should be the second one (index 1)
    const areaManagerDropdown = allComboboxes.nth(1);

    // Verify it's visible before clicking
    await areaManagerDropdown.waitFor({ state: 'visible', timeout: 5000 });

    // Click to open the Area Manager dropdown
    console.log('📍 Clicking Area Manager dropdown (2nd combobox)...');
    await areaManagerDropdown.click();

    // Wait for the manager dropdown to open and options to appear
    await page.waitForTimeout(1500);

    // Get ONLY the options that are currently visible (from manager dropdown)
    // We need to be more specific to avoid getting cached area options
    const managerOptionsInDropdown = page.getByRole('option').filter({ hasText: /.+/ });
    const managerCount = await managerOptionsInDropdown.count();
    console.log(`Found ${managerCount} manager options for selected area`);

    if (managerCount > 1) {
      // Get the text of the first option to verify it's a manager, not an area
      const firstOptionText = await managerOptionsInDropdown.nth(1).textContent();
      console.log(`📋 First manager option text: "${firstOptionText}"`);

      // Skip "Select Area Manager" or "Loading" and select first real option
      await managerOptionsInDropdown.nth(1).click();
      console.log('✅ Selected area manager');

      // Wait for the selection to be applied
      await page.waitForTimeout(1000);

      // Verify the manager was selected by checking if error message disappeared
      const errorStillVisible = await page.getByText('Area Manager is required').isVisible().catch(() => false);
      if (errorStillVisible) {
        console.log('⚠️ Area Manager validation error still showing - retrying selection');
        // Try clicking the dropdown and selecting again
        await areaManagerDropdown.click();
        await page.waitForTimeout(500);
        await managerOptions.nth(1).click();
        await page.waitForTimeout(1000);
      }
    } else {
      console.log('⚠️ No managers available - skipping (form will show validation error)');
      // Press Escape to close the dropdown
      await page.keyboard.press('Escape');
    }

    // Verify we're on step 4
    await expect(page.getByRole('heading', { name: 'EMPLOYMENT DETAILS' })).toBeVisible();

    // Wait longer to ensure form validation completes and form state updates
    await page.waitForTimeout(2000);

    // Check if there are any validation errors before clicking Next
    const hasValidationErrors = await page.getByText('is required').isVisible().catch(() => false);
    if (hasValidationErrors) {
      console.log('⚠️ Validation errors still present, taking screenshot...');
      await page.screenshot({ path: 'validation-error-step4.png', fullPage: true });
      throw new Error('Validation errors preventing Step 5 navigation');
    }

    // Click Next button
    const nextButton = page.getByRole('button', { name: 'Next' });
    await nextButton.waitFor({ state: 'visible', timeout: 5000 });
    await nextButton.click();
    console.log('✅ Step 4 - clicked Next button');

    // Wait for Step 5 heading to appear (indicates successful navigation)
    await page.waitForTimeout(1000);
    const step5Heading = page.getByRole('heading', { name: 'VERIFIED DOCUMENTS' });
    await step5Heading.waitFor({ state: 'visible', timeout: 10000 });
    console.log('✅ Step 5 loaded successfully');

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
    console.log('⏳ Waiting for redirect to officers list...');

    // Wait for URL to change away from /add-officer
    await page.waitForFunction(
      () => !window.location.pathname.includes('/add-officer'),
      { timeout: 30000 }
    ).catch(async () => {
      console.error('❌ Redirect timeout - Still on:', page.url());
      // Take screenshot for debugging
      await page.screenshot({ path: 'test-results/redirect-timeout.png' });
      throw new Error('Failed to redirect from add-officer page');
    });

    console.log('✅ Redirected away from add-officer page');

    // Wait for officers page to load
    await page.waitForLoadState('networkidle');

    // Verify we're on officers list page
    const currentUrl = page.url();
    console.log(`📍 Final URL: ${currentUrl}`);

    if (currentUrl.includes('/officers') && !currentUrl.includes('/add')) {
      // Wait for officers data to load
      await page.waitForTimeout(2000);

      // Successfully redirected to officers list
      await expect(page.getByRole('button', { name: 'Add New Officer' })).toBeVisible({ timeout: 15000 });
      console.log(`✅ Test completed successfully! Officer created: ${officerData.firstName} ${officerData.lastName}`);
    } else {
      throw new Error(`Unexpected URL after redirect: ${currentUrl}`);
    }
  });
});
