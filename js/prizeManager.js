// Prize & Participant UI Helper Module
class PrizeManager {
  static defaultPrizes() {
    return [
      {
        id: 'grand',
        name: '🏆 Grand Prize: Autonomous Electric Scooter',
        total: 1,
        drawBatch: 1,
        imgUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300&auto=format&fit=crop'
      },
      {
        id: 'gold',
        name: '🥇 Gold Prize: Cyber Deck Tablet Gen-X',
        total: 3,
        drawBatch: 1,
        imgUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&auto=format&fit=crop'
      },
      {
        id: 'silver',
        name: '🥈 Silver Prize: Smart Factory Smart Watch',
        total: 5,
        drawBatch: 5,
        imgUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop'
      },
      {
        id: 'special',
        name: '🎁 Special Prize: Noise-Canceling HUD Headphones',
        total: 10,
        drawBatch: 10,
        imgUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop'
      }
    ];
  }

  static renderDropdown(prizes, prizeSelectEl) {
    if (!prizeSelectEl) return;
    prizeSelectEl.innerHTML = '';

    if (!prizes || prizes.length === 0) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = '-- ยังไม่มีของรางวัล --';
      prizeSelectEl.appendChild(opt);
      return;
    }

    prizes.forEach(prize => {
      const opt = document.createElement('option');
      opt.value = prize.id;
      opt.textContent = `${prize.name} (${prize.total} รางวัล)`;
      prizeSelectEl.appendChild(opt);
    });
  }

  static renderGrid(prizes, gridEl, onDeleteClick) {
    if (!gridEl) return;
    gridEl.innerHTML = '';

    if (!prizes || prizes.length === 0) {
      gridEl.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 30px;">ยังไม่มีของรางวัลในระบบ (โปรดกดเพิ่มของรางวัลด้านบน)</div>`;
      return;
    }

    prizes.forEach(prize => {
      const item = document.createElement('div');
      item.className = 'prize-card-item';
      item.innerHTML = `
        <img class="prize-card-img" src="${prize.imgUrl || 'https://via.placeholder.com/60'}" alt="Prize">
        <div class="prize-card-details">
          <div class="prize-card-title">${prize.name}</div>
          <div class="prize-card-count">รวม ${prize.total} รางวัล (สุ่มรอบละ ${prize.drawBatch || 1} คน)</div>
        </div>
        <button class="table-del-btn" title="ลบรางวัลนี้">
          <i class="fas fa-trash-alt"></i>
        </button>
      `;
      item.querySelector('.table-del-btn').addEventListener('click', () => onDeleteClick(prize.id));
      gridEl.appendChild(item);
    });
  }
}

window.PrizeManager = PrizeManager;
