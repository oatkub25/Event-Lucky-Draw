// Dynamically Inject System Modals to DOM
(function injectModals() {
  const modalContainer = document.createElement('div');
  modalContainer.id = 'dynamicModalContainer';
  modalContainer.innerHTML = `
    <!-- QR Code Modal -->
    <div id="qrModal" class="modal-overlay">
      <div class="cyber-modal" style="max-width: 520px; text-align: center;">
        <div class="modal-header">
          <div class="modal-title"><i class="fas fa-qrcode" style="color: var(--amber-warning);"></i> QR Code ลงทะเบียนรับรางวัล</div>
          <button class="close-btn">&times;</button>
        </div>
        <div class="modal-body" style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
          <p style="color: var(--text-main); font-size: 1rem;">สแกนเพื่อกรอกข้อมูล <strong>ชื่อ / นามสกุล / ชื่อบริษัท</strong></p>
          <div id="qrcodeBox" style="background: #fff; padding: 18px; border-radius: 12px; box-shadow: 0 0 25px var(--cyan-primary);"></div>
          <div style="width: 100%; display: flex; flex-direction: column; gap: 10px;">
            <input type="text" id="qrRegUrlInput" class="cyber-input" readonly style="text-align: center; font-size: 0.85rem;">
            <div style="display: flex; gap: 10px; justify-content: center;">
              <button class="cyber-btn" id="copyUrlBtn"><i class="fas fa-copy"></i> คัดลอกลิงก์</button>
              <a href="register.html" target="_blank" class="cyber-btn" style="text-decoration: none;"><i class="fas fa-external-link-alt"></i> เปิดหน้าลงทะเบียน</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Prize Management Modal -->
    <div id="prizeModal" class="modal-overlay">
      <div class="cyber-modal" style="max-width: 800px;">
        <div class="modal-header">
          <div class="modal-title"><i class="fas fa-gifts" style="color: var(--green-active);"></i> จัดการของรางวัล</div>
          <button class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <form id="addPrizeForm" style="display: flex; flex-direction: column; gap: 15px; background: rgba(0,243,255,0.03); padding: 20px; border-radius: 10px; border: 1px solid var(--border-cyan);">
            <h4 style="font-family: var(--font-title); color: var(--cyan-primary);">+ เพิ่มของรางวัลใหม่</h4>
            <div style="display: flex; gap: 15px; flex-wrap: wrap;">
              <input type="text" id="newPrizeName" class="cyber-input" placeholder="ชื่อของรางวัล (เช่น กล้อง Canon EOS R50)" required style="flex: 2; min-width: 200px;">
              <input type="number" id="newPrizeCount" class="cyber-input" placeholder="จำนวนรางวัล" min="1" value="1" required style="flex: 1; min-width: 110px;">
              <input type="number" id="newPrizeBatch" class="cyber-input" placeholder="สุ่มรอบละ" min="1" value="1" required style="flex: 1; min-width: 110px;">
            </div>
            <div style="display: flex; gap: 15px; align-items: center;">
              <input type="file" id="newPrizeImgFile" accept="image/*" class="cyber-input" style="flex: 1;">
              <span style="color: var(--text-muted); font-size: 0.85rem;">หรือวางลิงก์รูปภาพ:</span>
              <input type="url" id="newPrizeImgUrl" class="cyber-input" placeholder="https://..." style="flex: 1;">
            </div>
            <button type="submit" class="cyber-btn" style="align-self: flex-end;"><i class="fas fa-plus"></i> เพิ่มของรางวัล</button>
          </form>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 25px;">
            <h4 style="font-family: var(--font-title); color: var(--amber-warning);">รายการของรางวัลทั้งหมด</h4>
            <button id="clearAllPrizesBtn" class="cyber-btn danger"><i class="fas fa-trash-alt"></i> ลบของรางวัลทั้งหมด</button>
          </div>
          <div id="prizeListGrid" class="prize-list-grid"></div>
        </div>
      </div>
    </div>

    <!-- Winner Reveal Modal -->
    <div id="winnerModal" class="modal-overlay">
      <div class="cyber-modal">
        <div class="modal-header">
          <div class="modal-title"><i class="fas fa-trophy" style="color: var(--amber-warning);"></i> ยินดีด้วยกับผู้โชคดี!</div>
          <button class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="winner-stage-banner">
            <img id="winnerPrizeImg" class="winner-prize-img" src="" alt="Prize">
            <div class="winner-prize-title" id="winnerPrizeTitle">รางวัลใหญ่ GRAND PRIZE</div>
            <div class="winner-subtitle">CANON LUCKY WINNERS</div>
          </div>
          <div id="winnerRevealGrid" class="winner-grid"></div>
        </div>
      </div>
    </div>

    <!-- Participant Management Modal -->
    <div id="manageModal" class="modal-overlay">
      <div class="cyber-modal">
        <div class="modal-header">
          <div class="modal-title"><i class="fas fa-users-cog"></i> จัดการรายชื่อผู้เข้าร่วมงาน</div>
          <button class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div style="display: flex; gap: 15px; margin-bottom: 20px; align-items: stretch;">
            <div class="file-dropzone" id="fileDropzone" style="flex: 1; margin-bottom: 0;">
              <i class="fas fa-file-csv" style="font-size: 2rem; color: var(--cyan-primary); margin-bottom: 5px;"></i>
              <p style="font-size: 1rem; font-weight: 600;">คลิกหรือลากไฟล์ CSV/Excel เพื่อนำเข้ารายชื่อ</p>
              <input type="file" id="csvFileInput" accept=".csv, .txt" style="display: none;">
            </div>
            <button id="clearAllParticipantsBtn" class="cyber-btn danger" style="padding: 0 20px;"><i class="fas fa-trash-alt"></i> ลบรายชื่อทั้งหมด</button>
          </div>
          <div class="table-container">
            <table class="cyber-table">
              <thead>
                <tr><th>#</th><th>รหัส</th><th>ชื่อ-นามสกุล</th><th>แผนก/บริษัท</th><th>สถานะ</th><th style="text-align: center;">จัดการ</th></tr>
              </thead>
              <tbody id="participantTableBody"></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Winner History Modal -->
    <div id="historyModal" class="modal-overlay">
      <div class="cyber-modal">
        <div class="modal-header">
          <div class="modal-title"><i class="fas fa-history"></i> รายชื่อผู้ได้รับรางวัลทั้งหมด</div>
          <button class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="table-container">
            <table class="cyber-table">
              <thead>
                <tr><th>ลำดับ</th><th>รหัส</th><th>ชื่อ-นามสกุล</th><th>แผนก/บริษัท</th><th>รางวัลที่ได้รับ</th><th>เวลา</th></tr>
              </thead>
              <tbody id="winnerHistoryTableBody"></tbody>
            </table>
          </div>
          <div class="actions-row">
            <button id="resetWinnersBtn" class="cyber-btn danger"><i class="fas fa-rotate-right"></i> รีเซ็ตสิทธิ์ผู้โชคดีทั้งหมด</button>
            <button id="exportCsvBtn" class="cyber-btn"><i class="fas fa-download"></i> ดาวน์โหลดผลรางวัล (CSV)</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modalContainer);
})();
