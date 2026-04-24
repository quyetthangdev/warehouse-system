import {
  balanceTypeConfig,
  balanceFormStatusConfig,
  discrepancyReasonConfig,
  formatDate,
} from '../balance-form.utils'
import type { BalanceForm } from '../types/balance-form.types'

function esc(s: string | null | undefined): string {
  return (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function buildPrintHtml(form: BalanceForm): string {
  const statusCfg = balanceFormStatusConfig[form.status]

  const itemRows = form.items.map((item, idx) => `
    <tr>
      <td style="text-align:center">${idx + 1}</td>
      <td>${esc(item.materialName)}</td>
      <td>${esc(item.unit)}</td>
      <td style="text-align:right">${item.systemQuantity}</td>
      <td style="text-align:right">${item.actualQuantity ?? ''}</td>
      <td style="text-align:right">${item.discrepancy !== null ? (item.discrepancy > 0 ? '+' : '') + item.discrepancy : ''}</td>
      <td style="text-align:right">${item.discrepancyPercent !== null ? (item.discrepancyPercent > 0 ? '+' : '') + item.discrepancyPercent.toFixed(1) + '%' : ''}</td>
      <td>${esc(item.reason ? discrepancyReasonConfig[item.reason] : '')}</td>
      <td>${esc(item.note)}</td>
    </tr>
  `).join('')

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>Phiếu kiểm kho ${esc(form.code)}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; padding: 24px; color: #000; }
    h1 { text-align: center; font-size: 18px; text-transform: uppercase; margin-bottom: 4px; }
    .code { text-align: center; font-size: 14px; font-weight: bold; margin-bottom: 20px; }
    .info-table { width: 100%; margin-bottom: 20px; border-collapse: collapse; }
    .info-table td { padding: 3px 8px; width: 50%; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
    .items-table th, .items-table td { border: 1px solid #888; padding: 5px 8px; }
    .items-table th { background: #f0f0f0; font-weight: bold; }
    .sign-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; text-align: center; margin-top: 40px; }
    .sign-block p { margin: 0 0 4px; font-weight: bold; }
    .sign-block .note { font-size: 11px; color: #555; }
    .sign-block .name { margin-top: 60px; border-top: 1px solid #888; padding-top: 4px; }
    @media print { @page { margin: 20mm; } }
  </style>
</head>
<body>
  <h1>Biên bản kiểm kho</h1>
  <p class="code">${esc(form.code)}</p>
  <table class="info-table">
    <tbody>
      <tr><td><strong>Loại kiểm:</strong></td><td>${esc(balanceTypeConfig[form.balanceType])}</td></tr>
      <tr><td><strong>Phạm vi:</strong></td><td>${form.scope === 'full' ? 'Toàn bộ kho' : 'Một phần'}</td></tr>
      <tr><td><strong>Ngày kiểm:</strong></td><td>${esc(formatDate(form.balanceDate))}</td></tr>
      <tr><td><strong>Trạng thái:</strong></td><td>${esc(statusCfg.label)}</td></tr>
      <tr><td><strong>Người tạo:</strong></td><td>${esc(form.createdBy)}</td></tr>
      <tr><td><strong>Người kiểm:</strong></td><td>${esc(form.inspectors.join(', '))}</td></tr>
      ${form.note ? `<tr><td colspan="2"><strong>Ghi chú:</strong> ${esc(form.note)}</td></tr>` : ''}
    </tbody>
  </table>
  <table class="items-table">
    <thead>
      <tr>
        <th style="width:36px">STT</th>
        <th>Nguyên vật liệu</th>
        <th style="width:50px">ĐVT</th>
        <th style="width:70px;text-align:right">Sổ sách</th>
        <th style="width:70px;text-align:right">Thực tế</th>
        <th style="width:60px;text-align:right">CL</th>
        <th style="width:60px;text-align:right">%</th>
        <th style="width:120px">Nguyên nhân</th>
        <th>Ghi chú</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>
  <div class="sign-grid">
    <div class="sign-block">
      <p>Người lập phiếu</p>
      <span class="note">(Ký, ghi rõ họ tên)</span>
      <div class="name">${esc(form.createdBy)}</div>
    </div>
    <div class="sign-block">
      <p>Người kiểm kho</p>
      <span class="note">(Ký, ghi rõ họ tên)</span>
      <div class="name">${form.inspectors.map(esc).join('<br/>')}</div>
    </div>
    <div class="sign-block">
      <p>Người phê duyệt</p>
      <span class="note">(Ký, ghi rõ họ tên)</span>
      <div class="name">${esc(form.completedBy)}</div>
    </div>
  </div>
</body>
</html>`
}
