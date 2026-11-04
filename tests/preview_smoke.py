"""Run with python3 tests/preview_smoke.py; requires Playwright and Chromium."""
from pathlib import Path
from playwright.sync_api import sync_playwright

html = (Path(__file__).resolve().parents[1] / 'index.html').read_text()
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    page = browser.new_page(viewport={'width': 390, 'height': 844})
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('console', lambda message: errors.append(message.text) if message.type == 'error' else None)
    # Match previews which permit JavaScript but deliberately block form submission.
    page.set_content('<iframe id="preview" sandbox="allow-scripts" style="width:100%;height:1000px"></iframe>')
    page.locator('#preview').evaluate('(el, html) => el.srcdoc = html', html)
    frame = page.frame_locator('#preview')
    frame.locator('.coin').first.wait_for()
    field = frame.locator('#starting-coins')
    apply = frame.get_by_role('button', name='Apply & restart')
    field.fill('17')
    apply.click()
    assert frame.locator('#count').inner_text() == '17'
    assert frame.locator('.coin').count() == 17
    assert '17 coins' in frame.locator('#coin-setting-feedback').inner_text()
    frame.locator('#take').click()
    field.fill('22')
    field.press('Enter')
    page.wait_for_timeout(850)
    assert frame.locator('#count').inner_text() == '22'
    assert frame.locator('#history li').count() == 0
    assert 'Beth can force' in frame.locator('#strategy-content').text_content()
    field.fill('0')
    apply.click()
    assert frame.locator('#count').inner_text() == '22'
    assert field.get_attribute('aria-invalid') == 'true'
    field.fill('17')
    apply.click()
    frame.locator('#restart').click()
    assert frame.locator('#count').inner_text() == '17'
    limit = frame.locator('#max-take')
    limit.fill('3')
    apply.click()
    assert frame.locator('#choices button').count() == 3
    assert '1–3' in frame.locator('#range-label').inner_text()
    assert frame.locator('#rule-max').inner_text() == '3'
    frame.locator('#hint').click()
    assert 'multiple of 4' in frame.locator('#hint-text').inner_text()
    frame.locator('#choices button').nth(2).click()
    frame.locator('#take').click()
    page.wait_for_timeout(850)
    assert frame.locator('#count').inner_text() == '12'
    frame.locator('[data-mode=local]').click()
    assert frame.locator('#choices button').count() == 3
    limit.fill('0')
    apply.click()
    assert limit.get_attribute('aria-invalid') == 'true'
    assert frame.locator('#choices button').count() == 3
    field.fill('100')
    limit.fill('50')
    limit.press('Enter')
    assert frame.locator('#custom-amount-row').is_visible()
    amount = frame.locator('#custom-amount')
    amount.fill('51')
    assert frame.locator('#take').is_disabled()
    amount.fill('50')
    frame.locator('#take').click()
    assert frame.locator('#count').inner_text() == '50'
    amount.fill('50')
    frame.locator('#take').click()
    assert 'Beth wins' in frame.locator('#turn-label').inner_text()
    assert frame.locator('#take').is_disabled()
    assert not errors, errors
    browser.close()
print('PASS: sandboxed preview: 100 → 17, click, Enter, computer cancellation, validation, restart; no browser errors')
