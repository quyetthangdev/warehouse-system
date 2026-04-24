// warehouse-ui/src/features/export-forms/components/export-form-print-view.tsx
import { exportTypeConfig, exportFormStatusConfig, disposalReasonConfig, formatDate } from '../export-form.utils'
import type { ExportForm } from '../types/export-form.types'

export function buildPrintHtml(form: ExportForm): string {
  const statusCfg = exportFormStatusConfig[form.status]
  const typeCfg = exportTypeConfig[form.exportType]

  const infoRows = [
    `<tr><td><strong>Loại xuất:</strong></td><td>${typeCfg?.label ?? form.exportType}</td></tr>`,
    `<tr><td><strong>Ngày xuất:</strong></td><td>${formatDate(form.exportDate)}</td></tr>`,
    `<tr><td><strong>Người xuất:</strong></td><td>${form.exportedBy}</td></tr>`,
    `<tr><td><strong>Trạng thái:</strong></td><td>${statusCfg.label}</td></tr>`,
    form.recipient
      ? `<tr><td><strong>Người nhận:</strong></td><td>${form.recipient}</td></tr>`
      : '',
    form.approvedBy
      ? `<tr><td><strong>Người phê duyệt:</strong></td><td>${form.approvedBy}</td></tr>`
      : '',
    form.disposalReason
      ? `<tr><td><strong>Lý do hủy:</strong></td><td>${disposalReasonConfig[form.disposalReason]}</td></tr>`
      : '',
    form.disposalReasonText
      ? `<tr><td><strong>Chi tiết lý do:</strong></td><td>${form.disposalReasonText}</td></tr>`
      : '',
    form.destinationWarehouseName
      ? `<tr><td><strong>Kho nhận:</strong></td><td>${form.destinationWarehouseName}</td></tr>`
      : '',
    form.customReason
      ? `<tr><td><strong>Mục đích xuất:</strong></td><td>${form.customReason}</td></tr>`
      : '',
    form.note
      ? `<tr><td colspan="2"><strong>Ghi chú:</strong> ${form.note}</td></tr>`
      : '',
  ].filter(Boolean).join('')

  const itemRows = form.items.map((item, idx) => `
    <tr>
      <td style="text-align:center">${idx + 1}</td>
      <td>${item.materialName}</td>
      <td style="text-align:right">${item.quantity}</td>
      <td>${item.unit}</td>
      <td>${formatDate(item.expiryDate)}</td>
      <td>${item.note ?? ''}</td>
    </tr>
  `).join('')

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>Phiếu xuất kho ${form.code}</title>
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
  <h1>Phiếu xuất kho</h1>
  <p class="code">${form.code}</p>
  <table class="info-table"><tbody>${infoRows}</tbody></table>
  <table class="items-table">
    <thead>
      <tr>
        <th style="width:40px">STT</th>
        <th>Nguyên vật liệu</th>
        <th style="width:80px;text-align:right">Số lượng</th>
        <th style="width:60px">Đơn vị</th>
        <th style="width:90px">Hạn SD</th>
        <th>Ghi chú</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>
  <div class="sign-grid">
    <div class="sign-block">
      <p>Người lập phiếu</p>
      <span class="note">(Ký, ghi rõ họ tên)</span>
      <div class="name">${form.exportedBy}</div>
    </div>
    <div class="sign-block">
      <p>Người nhận</p>
      <span class="note">(Ký, ghi rõ họ tên)</span>
      <div class="name">${form.recipient ?? ''}</div>
    </div>
    <div class="sign-block">
      <p>Người phê duyệt</p>
      <span class="note">(Ký, ghi rõ họ tên)</span>
      <div class="name">${form.approvedBy ?? ''}</div>
    </div>
  </div>
</body>
</html>`
}
