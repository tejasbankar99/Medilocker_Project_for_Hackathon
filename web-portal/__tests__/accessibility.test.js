const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

describe('Web Portal: Accessibility & WCAG Compliance Tests', () => {
  it('ensures root layout defines english language tag', () => {
    const layoutPath = path.join(__dirname, '../app/layout.tsx');
    const content = fs.readFileSync(layoutPath, 'utf8');
    assert.match(content, /<html\s+lang=["']en["']/);
  });

  it('ensures login form fields have matching htmlFor and id bindings', () => {
    const loginPath = path.join(__dirname, '../app/login/page.tsx');
    const content = fs.readFileSync(loginPath, 'utf8');
    assert.match(content, /htmlFor=["']email["']/);
    assert.match(content, /id=["']email["']/);
    assert.match(content, /htmlFor=["']password["']/);
    assert.match(content, /id=["']password["']/);
  });

  it('ensures login form includes accessible skip link', () => {
    const loginPath = path.join(__dirname, '../app/login/page.tsx');
    const content = fs.readFileSync(loginPath, 'utf8');
    assert.match(content, /className=["']skip-link["']/);
  });

  it('ensures register form fields have matching labels and accessible ids', () => {
    const regPath = path.join(__dirname, '../app/register/page.tsx');
    const content = fs.readFileSync(regPath, 'utf8');
    assert.match(content, /htmlFor=["']reg-fullname["']/);
    assert.match(content, /id=["']reg-fullname["']/);
    assert.match(content, /htmlFor=["']reg-email["']/);
    assert.match(content, /id=["']reg-email["']/);
    assert.match(content, /htmlFor=["']reg-password["']/);
    assert.match(content, /id=["']reg-password["']/);
  });

  it('ensures sidebar navigation provides aria-current on active links', () => {
    const sidebarPath = path.join(__dirname, '../components/Sidebar.tsx');
    const content = fs.readFileSync(sidebarPath, 'utf8');
    assert.match(content, /aria-current=/);
    assert.match(content, /aria-label=/);
  });

  it('ensures globals.css includes screen-reader utilities and focus rings', () => {
    const cssPath = path.join(__dirname, '../app/globals.css');
    const content = fs.readFileSync(cssPath, 'utf8');
    assert.match(content, /:focus-visible/);
    assert.match(content, /\.sr-only/);
    assert.match(content, /\.skip-link/);
  });
});
