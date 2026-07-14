// App Logic & Orchestration
const CLOUD_SYNC_URL = 'https://kvdb.io/WJ2N9Z4cT8eR5xL1pQ7m2a/sf_canon_participants';

class LuckyDrawApp {
  constructor() {
    this.participants = [];
    this.winners = [];
    this.prizes = [
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

    this.currentBatchSize = 1;
    this.isDrawing = false;
    this.particleSphere = null;

    this.loadState();
  }

  init() {
    // Ensure draw button state is clean and ready
    const drawBtn = document.getElementById('drawBtn');
    if (drawBtn) {
      drawBtn.classList.remove('drawing');
      drawBtn.disabled = false;
    }
    this.isDrawing = false;

    // Init 3D Particle Sphere with active stored candidates
    this.particleSphere = new ParticleSphere('particleCanvas');
    this.particleSphere.setCandidates(this.getEligibleParticipants());
    this.particleSphere.animate();

    this.setupUI();
    this.setupEventListeners();
    this.updateStats();
    this.updateActivePrizeDisplay();
    this.startCloudSyncPoller();
  }

  // Real-time Cloud Storage Poller across devices over Internet
  startCloudSyncPoller() {
    const syncCloudData = async () => {
      try {
        const res = await fetch(CLOUD_SYNC_URL);
        if (res.ok) {
          const cloudParticipants = await res.json();
          if (Array.isArray(cloudParticipants) && cloudParticipants.length > 0) {
            let hasNew = false;
            const existingIds = new Set(this.participants.map(p => p.id));
            
            cloudParticipants.forEach(cp => {
              if (cp && cp.id && !existingIds.has(cp.id)) {
                this.participants.push(cp);
                existingIds.add(cp.id);
                hasNew = true;
              }
            });

            if (hasNew) {
              this.saveState();
              this.updateStats();
              this.renderParticipantTable();
              this.particleSphere.setCandidates(this.getEligibleParticipants());
            }
          }
        }
      } catch (e) {
        // Fallback gracefully
      }
    };

    syncCloudData();
    setInterval(syncCloudData, 3000);
  }

  getEligibleParticipants() {
    const winnerIds = new Set(this.winners.map(w => w.id));
    return this.participants.filter(p => !winnerIds.has(p.id));
  }

  setupUI() {
    this.renderPrizeDropdown();
    this.renderParticipantTable();
    this.renderWinnerHistoryTable();
    this.renderPrizeListGrid();
  }

  renderPrizeDropdown() {
    const prizeSelect = document.getElementById('prizeSelect');
    prizeSelect.innerHTML = '';

    if (this.prizes.length === 0) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = '-- ยังไม่มีของรางวัล --';
      prizeSelect.appendChild(opt);
      return;
    }

    this.prizes.forEach(prize => {
      const opt = document.createElement('option');
      opt.value = prize.id;
      opt.textContent = `${prize.name} (${prize.total} รางวัล)`;
      prizeSelect.appendChild(opt);
    });
  }

  updateActivePrizeDisplay() {
    const prizeSelect = document.getElementById('prizeSelect');
    if (!prizeSelect.value || this.prizes.length === 0) {
      document.getElementById('stagePrizeTitle').textContent = 'ยังไม่มีของรางวัลในระบบ';
      document.getElementById('stagePrizeImg').src = 'https://via.placeholder.com/300?text=No+Prize';
      document.getElementById('activeBatchDisplay').textContent = '-';
      return;
    }

    const activePrize = this.prizes.find(p => p.id === prizeSelect.value);
    if (activePrize) {
      document.getElementById('stagePrizeTitle').textContent = activePrize.name;
      document.getElementById('stagePrizeImg').src = activePrize.imgUrl || 'https://via.placeholder.com/300?text=No+Image';

      // Lock current batch size based on active prize configuration
      this.currentBatchSize = activePrize.drawBatch || 1;
      document.getElementById('activeBatchDisplay').textContent = `${this.currentBatchSize} คน`;
    }
  }

  setupEventListeners() {
    // Draw Button Trigger
    document.getElementById('drawBtn').addEventListener('click', () => this.executeDraw());

    // Prize Select Listener
    document.getElementById('prizeSelect').addEventListener('change', () => this.updateActivePrizeDisplay());

    // Sound Toggle Button
    const soundBtn = document.getElementById('soundToggleBtn');
    soundBtn.addEventListener('click', () => {
      const isEnabled = window.soundEngine.toggleSound();
      soundBtn.innerHTML = isEnabled ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
      soundBtn.style.color = isEnabled ? 'var(--cyan-primary)' : 'var(--text-muted)';
    });

    // Fullscreen Stage Toggle
    document.getElementById('fullscreenBtn').addEventListener('click', () => this.toggleFullscreen());

    // QR Registration Trigger
    document.getElementById('qrBtn').addEventListener('click', () => this.openQRModal());
    document.getElementById('copyUrlBtn').addEventListener('click', () => {
      const urlInput = document.getElementById('qrRegUrlInput');
      urlInput.select();
      navigator.clipboard.writeText(urlInput.value);
      alert('📋 คัดลอกลิงก์หน้าลงทะเบียนเรียบร้อยแล้ว!');
    });

    // Modals Handlers
    document.getElementById('prizesBtn').addEventListener('click', () => this.openModal('prizeModal'));
    document.getElementById('manageBtn').addEventListener('click', () => this.openModal('manageModal'));
    document.getElementById('historyBtn').addEventListener('click', () => this.openModal('historyModal'));
    
    document.querySelectorAll('.close-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
        if (modal) modal.classList.remove('active');
      });
    });

    // Add Prize Form
    document.getElementById('addPrizeForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAddPrize();
    });

    // Clear All Prizes Button
    document.getElementById('clearAllPrizesBtn').addEventListener('click', () => {
      if (confirm('⚠️ คุณต้องการลบของรางวัลทั้งหมดในระบบหรือไม่?')) {
        this.prizes = [];
        this.saveState();
        this.renderPrizeDropdown();
        this.renderPrizeListGrid();
        this.updateActivePrizeDisplay();
        alert('🗑️ ลบรายการของรางวัลทั้งหมดเรียบร้อยแล้ว');
      }
    });

    // CSV File Upload / Dropzone
    const dropzone = document.getElementById('fileDropzone');
    const fileInput = document.getElementById('csvFileInput');

    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files.length) this.handleCSVImport(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length) this.handleCSVImport(e.target.files[0]);
    });

    // Clear All Participants Button
    document.getElementById('clearAllParticipantsBtn').addEventListener('click', () => {
      if (confirm('⚠️ คุณต้องการลบรายชื่อผู้เข้าร่วมงานทั้งหมดหรือไม่?')) {
        this.participants = [];
        this.winners = [];
        this.saveState();
        this.updateStats();
        this.renderParticipantTable();
        this.renderWinnerHistoryTable();
        this.particleSphere.setCandidates([]);
        // Clear cloud storage as well
        fetch(CLOUD_SYNC_URL, { method: 'POST', body: JSON.stringify([]) }).catch(e=>{});
        alert('🗑️ ลบรายชื่อผู้เข้าร่วมงานทั้งหมดเรียบร้อยแล้ว');
      }
    });

    // Reset Winners Button
    document.getElementById('resetWinnersBtn').addEventListener('click', () => {
      if (confirm('คุณต้องการรีเซ็ตประวัติผู้โชคดีทั้งหมดหรือไม่?')) {
        this.winners = [];
        this.saveState();
        this.updateStats();
        this.renderWinnerHistoryTable();
        this.particleSphere.setCandidates(this.getEligibleParticipants());
      }
    });

    document.getElementById('exportCsvBtn').addEventListener('click', () => this.exportWinnersCSV());

    // Live Sync on LocalStorage change from attendee register.html or other tab
    window.addEventListener('storage', () => {
      this.loadState();
      this.updateStats();
      this.renderParticipantTable();
      this.renderWinnerHistoryTable();
      this.renderPrizeDropdown();
      this.renderPrizeListGrid();
      this.updateActivePrizeDisplay();
      this.particleSphere.setCandidates(this.getEligibleParticipants());
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !this.isDrawing) {
        e.preventDefault();
        this.executeDraw();
      } else if (e.code === 'KeyF') {
        this.toggleFullscreen();
      } else if (e.code === 'KeyM') {
        soundBtn.click();
      } else if (e.code === 'Escape') {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
      }
    });
  }

  handleAddPrize() {
    const name = document.getElementById('newPrizeName').value.trim();
    const count = parseInt(document.getElementById('newPrizeCount').value) || 1;
    const batch = parseInt(document.getElementById('newPrizeBatch').value) || 1;
    const imgUrlInput = document.getElementById('newPrizeImgUrl').value.trim();
    const fileInput = document.getElementById('newPrizeImgFile');

    if (!name) return;

    const processNewPrize = (finalImgUrl) => {
      const newPrize = {
        id: `prize-${Date.now()}`,
        name: name,
        total: count,
        drawBatch: batch,
        imgUrl: finalImgUrl || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300&auto=format&fit=crop'
      };

      this.prizes.push(newPrize);
      this.saveState();
      this.renderPrizeDropdown();
      this.renderPrizeListGrid();
      this.updateActivePrizeDisplay();

      // Reset form
      document.getElementById('addPrizeForm').reset();
      alert('✅ เพิ่มของรางวัลสำเร็จเรียบร้อยแล้ว!');
    };

    if (fileInput.files.length > 0) {
      const reader = new FileReader();
      reader.onload = (e) => processNewPrize(e.target.result);
      reader.readAsDataURL(fileInput.files[0]);
    } else {
      processNewPrize(imgUrlInput);
    }
  }

  deletePrize(prizeId) {
    if (confirm('คุณต้องการลบของรางวัลนี้หรือไม่?')) {
      this.prizes = this.prizes.filter(p => p.id !== prizeId);
      this.saveState();
      this.renderPrizeDropdown();
      this.renderPrizeListGrid();
      this.updateActivePrizeDisplay();
    }
  }

  deleteParticipant(participantId) {
    this.participants = this.participants.filter(p => p.id !== participantId);
    this.winners = this.winners.filter(w => w.id !== participantId);
    this.saveState();
    this.updateStats();
    this.renderParticipantTable();
    this.renderWinnerHistoryTable();
    this.particleSphere.setCandidates(this.getEligibleParticipants());

    // Update cloud storage list
    fetch(CLOUD_SYNC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.participants)
    }).catch(e=>{});
  }

  openQRModal() {
    const qrcodeBox = document.getElementById('qrcodeBox');
    const urlInput = document.getElementById('qrRegUrlInput');
    
    // Robust, foolproof URL resolution for GitHub Pages repository subdirectories
    let regUrl;
    if (window.location.origin && window.location.pathname) {
      let path = window.location.pathname;
      if (path.endsWith('.html') || path.endsWith('.htm')) {
        path = path.substring(0, path.lastIndexOf('/'));
      }
      if (!path.endsWith('/')) path += '/';
      regUrl = window.location.origin + path + 'register.html';
    } else {
      regUrl = window.location.href.replace(/index\.html.*$/, '').replace(/\/$/, '') + '/register.html';
    }

    urlInput.value = regUrl;
    qrcodeBox.innerHTML = '';

    try {
      if (typeof QRCode !== 'undefined') {
        new QRCode(qrcodeBox, {
          text: regUrl,
          width: 200,
          height: 200,
          colorDark: "#070a12",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.H
        });
      } else {
        qrcodeBox.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(regUrl)}" alt="QR Code" width="200" height="200">`;
      }
    } catch (e) {
      qrcodeBox.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(regUrl)}" alt="QR Code" width="200" height="200">`;
    }

    this.openModal('qrModal');
  }

  executeDraw() {
    const drawBtn = document.getElementById('drawBtn');

    // Safety Check 1: Must have prizes
    if (this.prizes.length === 0) {
      alert('⚠️ ยังไม่มีของรางวัลในระบบ กรุณากดเพิ่มของรางวัล (ปุ่มของขวัญสีเขียวด้านบน) ก่อนเริ่มจับรางวัล');
      this.resetDrawButtonState();
      return;
    }

    // Safety Check 2: Must have eligible candidates
    const eligible = this.getEligibleParticipants();
    if (eligible.length === 0) {
      alert('⚠️ ไม่พบรายชื่อผู้เข้าร่วมในระบบ กรุณาสแกน QR Code หรือนำเข้าไฟล์ CSV รายชื่อผู้เข้าร่วมก่อนเริ่มจับรางวัล');
      this.resetDrawButtonState();
      return;
    }

    if (this.isDrawing) return;

    try {
      const drawCount = Math.min(this.currentBatchSize, eligible.length);
      this.isDrawing = true;

      drawBtn.classList.add('drawing');
      drawBtn.disabled = true;

      // Sound FX: Start spin tension charging sound track
      window.soundEngine.playSpinStart(2.5);

      // Accelerate particle sphere spin
      this.particleSphere.startSpin();

      // Sound tick interval during high-speed rotation
      const tickInterval = setInterval(() => {
        window.soundEngine.playTick();
      }, 120);

      setTimeout(() => {
        clearInterval(tickInterval);

        const selectedPrizeId = document.getElementById('prizeSelect').value;
        const prizeInfo = this.prizes.find(p => p.id === selectedPrizeId);

        const currentWinners = [];
        const tempPool = [...eligible];

        for (let i = 0; i < drawCount; i++) {
          const randomIndex = Math.floor(Math.random() * tempPool.length);
          const winner = tempPool.splice(randomIndex, 1)[0];
          
          const winnerRecord = {
            ...winner,
            prizeName: prizeInfo ? prizeInfo.name : 'รางวัลพิเศษ',
            prizeImg: prizeInfo ? prizeInfo.imgUrl : '',
            drawnAt: new Date().toLocaleTimeString('th-TH')
          };

          currentWinners.push(winnerRecord);
          this.winners.unshift(winnerRecord);
        }

        // Stop particle spin and trigger shockwave collapse
        this.particleSphere.stopSpinAndExplode(() => {
          window.soundEngine.playRevealExplosion();

          setTimeout(() => {
            window.soundEngine.playVictoryFanfare();
            this.displayWinnersModal(currentWinners, prizeInfo);
            this.triggerConfetti();

            this.saveState();
            this.updateStats();
            this.renderWinnerHistoryTable();
            this.particleSphere.setCandidates(this.getEligibleParticipants());

            this.resetDrawButtonState();

          }, 300);
        });

      }, 2500);

    } catch (e) {
      console.error(e);
      this.resetDrawButtonState();
    }
  }

  resetDrawButtonState() {
    const drawBtn = document.getElementById('drawBtn');
    if (drawBtn) {
      drawBtn.classList.remove('drawing');
      drawBtn.disabled = false;
    }
    this.isDrawing = false;
  }

  displayWinnersModal(newWinners, prizeInfo) {
    const winnerGrid = document.getElementById('winnerRevealGrid');
    const winnerPrizeTitle = document.getElementById('winnerPrizeTitle');
    const winnerPrizeImg = document.getElementById('winnerPrizeImg');

    winnerPrizeTitle.textContent = newWinners[0].prizeName;
    if (prizeInfo && prizeInfo.imgUrl) {
      winnerPrizeImg.src = prizeInfo.imgUrl;
      winnerPrizeImg.style.display = 'block';
    } else {
      winnerPrizeImg.style.display = 'none';
    }

    winnerGrid.innerHTML = '';

    newWinners.forEach((winner, index) => {
      const card = document.createElement('div');
      card.className = 'winner-card';
      card.style.animationDelay = `${index * 0.15}s`;

      const initial = winner.name.charAt(0);

      card.innerHTML = `
        <div class="winner-avatar">${initial}</div>
        <div class="winner-name">${winner.name}</div>
        <div class="winner-dept"><i class="fas fa-building"></i> ${winner.dept || 'Smart Factory Member'}</div>
        <div class="winner-id">ID: ${winner.id}</div>
      `;
      winnerGrid.appendChild(card);
    });

    this.openModal('winnerModal');
  }

  triggerConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confettiCount = 140;
    const pieces = [];
    const colors = ['#00f3ff', '#ff9e00', '#00ff88', '#ff0055', '#ffffff'];

    for (let i = 0; i < confettiCount; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 4 + 3,
        rot: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 8
      });
    }

    let frames = 0;
    const renderConfetti = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vRot;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      frames++;
      if (frames < 180) {
        requestAnimationFrame(renderConfetti);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    renderConfetti();
  }

  handleCSVImport(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(line => line.trim() !== '');
      const imported = [];

      lines.forEach((line, idx) => {
        const parts = line.split(',').map(p => p.trim());
        if (parts.length >= 1 && parts[0]) {
          imported.push({
            id: parts[1] || `ID-${1000 + idx}`,
            name: parts[0],
            dept: parts[2] || 'Smart Factory'
          });
        }
      });

      if (imported.length > 0) {
        this.participants = imported;
        this.winners = [];
        this.saveState();
        this.updateStats();
        this.renderParticipantTable();
        this.renderWinnerHistoryTable();
        this.particleSphere.setCandidates(this.getEligibleParticipants());

        // Sync CSV import to cloud
        fetch(CLOUD_SYNC_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.participants)
        }).catch(e=>{});

        alert(`✅ นำเข้าข้อมูลสำเร็จเรียบร้อย! ทั้งหมด ${imported.length} รายชื่อ`);
      } else {
        alert('⚠️ ไม่พบข้อมูลรายชื่อในไฟล์ที่เลือก');
      }
    };
    reader.readAsText(file);
  }

  exportWinnersCSV() {
    if (this.winners.length === 0) {
      alert('ยังไม่มีข้อมูลผู้โชคดีสำหรับส่งออก');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';
    csvContent += 'รหัส,ชื่อ-นามสกุล,บริษัท/หน่วยงาน,รางวัลที่ได้รับ,เวลาสุ่ม\n';

    this.winners.forEach(w => {
      csvContent += `"${w.id}","${w.name}","${w.dept}","${w.prizeName}","${w.drawnAt}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smart_factory_winners_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  renderParticipantTable() {
    const tbody = document.getElementById('participantTableBody');
    tbody.innerHTML = '';

    if (this.participants.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:25px;">ยังไม่มีข้อมูลรายชื่อผู้เข้าร่วม (โปรดสแกน QR Code หรือนำเข้าไฟล์ CSV)</td></tr>`;
      return;
    }

    const winnerIds = new Set(this.winners.map(w => w.id));

    this.participants.forEach((p, idx) => {
      const isWinner = winnerIds.has(p.id);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td><code>${p.id}</code></td>
        <td><strong>${p.name}</strong></td>
        <td>${p.dept || '-'}</td>
        <td>
          <span style="color: ${isWinner ? 'var(--amber-warning)' : 'var(--green-active)'}; font-weight: bold;">
            ${isWinner ? '🏆 ได้รับรางวัลแล้ว' : '✅ พร้อมสุ่ม'}
          </span>
        </td>
        <td style="text-align: center;">
          <button class="table-del-btn" onclick="window.app.deleteParticipant('${p.id}')" title="ลบรายชื่อนี้">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  renderPrizeListGrid() {
    const grid = document.getElementById('prizeListGrid');
    grid.innerHTML = '';

    if (this.prizes.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 30px;">ยังไม่มีของรางวัลในระบบ (โปรดกดเพิ่มของรางวัลด้านบน)</div>`;
      return;
    }

    this.prizes.forEach(prize => {
      const item = document.createElement('div');
      item.className = 'prize-card-item';
      item.innerHTML = `
        <img class="prize-card-img" src="${prize.imgUrl || 'https://via.placeholder.com/60'}" alt="Prize">
        <div class="prize-card-details">
          <div class="prize-card-title">${prize.name}</div>
          <div class="prize-card-count">รวม ${prize.total} รางวัล (สุ่มรอบละ ${prize.drawBatch || 1} คน)</div>
        </div>
        <button class="table-del-btn" onclick="window.app.deletePrize('${prize.id}')" title="ลบรางวัลนี้">
          <i class="fas fa-trash-alt"></i>
        </button>
      `;
      grid.appendChild(item);
    });
  }

  renderWinnerHistoryTable() {
    const tbody = document.getElementById('winnerHistoryTableBody');
    tbody.innerHTML = '';

    this.winners.forEach((w, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${this.winners.length - idx}</td>
        <td><code>${w.id}</code></td>
        <td><strong>${w.name}</strong></td>
        <td>${w.dept || '-'}</td>
        <td style="color: var(--amber-warning); font-weight: 700;">${w.prizeName}</td>
        <td>${w.drawnAt}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  updateStats() {
    const eligibleCount = this.getEligibleParticipants().length;
    document.getElementById('totalParticipantsCount').textContent = this.participants.length;
    document.getElementById('eligibleCount').textContent = eligibleCount;
    document.getElementById('totalWinnersCount').textContent = this.winners.length;
  }

  openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }

  saveState() {
    localStorage.setItem('sf_participants', JSON.stringify(this.participants));
    localStorage.setItem('sf_winners', JSON.stringify(this.winners));
    localStorage.setItem('sf_prizes', JSON.stringify(this.prizes));
  }

  loadState() {
    const savedP = localStorage.getItem('sf_participants');
    const savedW = localStorage.getItem('sf_winners');
    const savedPrizes = localStorage.getItem('sf_prizes');

    if (savedP !== null) {
      let parsed = JSON.parse(savedP);
      parsed = parsed.filter(p => !p.id || !p.id.startsWith('SF-10'));
      this.participants = parsed;
      localStorage.setItem('sf_participants', JSON.stringify(this.participants));
    } else {
      this.participants = [];
      localStorage.setItem('sf_participants', JSON.stringify([]));
    }

    if (savedW !== null) {
      let parsedW = JSON.parse(savedW);
      parsedW = parsedW.filter(w => !w.id || !w.id.startsWith('SF-10'));
      this.winners = parsedW;
      localStorage.setItem('sf_winners', JSON.stringify(this.winners));
    }

    if (savedPrizes !== null) {
      this.prizes = JSON.parse(savedPrizes);
    } else {
      this.saveState();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new LuckyDrawApp();
  window.app.init();
});
