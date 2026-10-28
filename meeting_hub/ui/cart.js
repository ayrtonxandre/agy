/**
 * Cart Basket UI Component
 * 
 * Floating tray where actions, decisions, and topics from any meeting
 * are collected for batch export or follow-up generation.
 */
import { Icons } from './icons.js';

export class CartUI {
  constructor({ container, store }) {
    this.container = container;
    this.store = store;
    this.isOpen = true;
  }

  async render() {
    if (!this.container) return;

    const items = await this.store.getCartItems();
    const hasItems = items.length > 0;

    this.container.style.display = hasItems || this.isOpen ? 'block' : 'none';

    this.container.innerHTML = `
      <header>
        <span style="display: flex; align-items: center; gap: 6px;">
          ${Icons.cart}
          <span>Macro Cart</span>
        </span>
        <span class="badge" style="margin-left: 8px; background: var(--pink-600); color: #fff; border: 0;">
          ${items.length}
        </span>
        <button id="toggleCartBtn" class="btn sm" style="margin-left: auto; color: #fff; border: 0; background: rgba(255,255,255,0.15); padding: 2px 6px;">
          ${this.isOpen ? '–' : '+'}
        </button>
      </header>

      ${this.isOpen ? `
        <div class="list">
          ${hasItems ? items.map(item => `
            <div class="item">
              <span class="kind" style="width: 54px;">${item.kind}</span>
              <span class="tx">
                ${this._escape(item.text)}
                <div class="meta" style="font-size: 11px; color: var(--muted-foreground);">
                  ${this._escape(item.from)}
                </div>
              </span>
              <button class="btn sm remove-cart-item-btn" data-id="${item.id}" title="Remove item">
                ${Icons.trash}
              </button>
            </div>
          `).join('') : `
            <div class="empty">
              Collect actions or decisions from any meeting, then export a recap in one go.
            </div>
          `}
        </div>

        <div class="foot">
          <button class="btn sm" id="copyRecapBtn" ${hasItems ? '' : 'disabled style="opacity: 0.5;"'}>
            Copy recap
          </button>
          <button class="btn sm pink" id="followUpBtn" ${hasItems ? '' : 'disabled style="opacity: 0.5;"'}>
            Follow-up draft
          </button>
        </div>
      ` : ''}
    `;

    this._bindEvents(items);
  }

  _bindEvents(items) {
    // Toggle cart collapse
    const toggleBtn = this.container.querySelector('#toggleCartBtn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        this.isOpen = !this.isOpen;
        this.render();
      });
    }

    // Remove item
    this.container.querySelectorAll('.remove-cart-item-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        await this.store.removeFromCart(id);
        this.render();
      });
    });

    // Copy recap
    const copyBtn = this.container.querySelector('#copyRecapBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const text = this.export('copy', items);
        navigator.clipboard?.writeText(text);
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = 'Copy recap'; }, 1800);
      });
    }

    // Follow-up draft
    const followUpBtn = this.container.querySelector('#followUpBtn');
    if (followUpBtn) {
      followUpBtn.addEventListener('click', () => {
        const text = this.export('followup', items);
        alert('Follow-up draft prepared with selected items:\n\n' + text);
      });
    }
  }

  export(kind, items) {
    return items.map(i => {
      const owner = i.owner ? ` (${i.owner})` : '';
      return `- [${i.kind.toUpperCase()}] ${i.text}${owner} — ${i.from}`;
    }).join('\n');
  }

  _escape(str) {
    return String(str || '').replace(/[&<>"']/g, c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;'
    }[c]));
  }
}
