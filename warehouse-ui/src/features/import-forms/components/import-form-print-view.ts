import { importFormStatusConfig, formatDate } from '../import-form.utils'
import type { ImportForm } from '../types/import-form.types'

function esc(s: string | null | undefined): string {
  return (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function fmtVnd(n: number): string {
  return new Intl.NumberFormat('vi-VN').format(n) + ' đ'
}

export function buildPrintHtml(form: ImportForm): string {
  const statusCfg = importFormStatusConfig[form.status]

  const itemRows = form.items.map((item, idx) => {
    const lineTotal = (item.unitPrice ?? 0) * item.quantity
    return `
    <tr>
      <td style="text-align:center">${idx + 1}</td>
      <td>${esc(item.materialName)}</td>
      <td>${esc(item.unit)}</td>
      <td style="text-align:right">${item.quantity}</td>
      <td style="text-align:right">${item.unitPrice != null ? fmtVnd(item.unitPrice) : ''}</td>
      <td style="text-align:right">${fmtVnd(lineTotal)}</td>
      <td>${esc(item.batchNumber)}</td>
      <td>${item.mfgDate ? formatDate(item.mfgDate) : ''}</td>
      <td>${item.expiryDate ? formatDate(item.expiryDate) : ''}</td>
      <td>${esc(item.note)}</td>
    </tr>`
  }).join('')

  const totalValue = form.totalValue ?? form.items.reduce((s, i) => s + (i.unitPrice ?? 0) * i.quantity, 0)

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>Phiếu nhập kho ${esc(form.code)}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; padding: 24px; color: #000; }
    h1 { text-align: center; font-size: 18px; text-transform: uppercase; margin-bottom: 4px; }
    .code { text-align: center; font-size: 14px; font-weight: bold; margin-bottom: 20px; }
    .info-table { width: 100%; margin-bottom: 20px; border-collapse: collapse; }
    .info-table td { padding: 3px 8px; width: 50%; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
    .items-table th, .items-table td { border: 1px solid #888; padding: 5px 8px; }
    .items-table th { background: #f0f0f0; font-weight: bold; }
    .total-row { text-align: right; font-weight: bold; font-size: 13px; margin-bottom: 32px; }
    .sign-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; text-align: center; margin-top: 40px; }
    .sign-block p { margin: 0 0 4px; font-weight: bold; }
    .sign-block .note { font-size: 11px; color: #555; }
    .sign-block .name { margin-top: 60px; border-top: 1px solid #888; padding-top: 4px; }
    @media print { @page { margin: 20mm; } }
  </style>
</head>
<body>
  <h1>Phiếu nhập kho</h1>
  <p class="code">${esc(form.code)}</p>
  <table class="info-table">
    <tbody>
      <tr><td><strong>Nhà cung cấp:</strong></td><td>${esc(form.supplierName)}</td></tr>
      <tr><td><strong>Kho nhập:</strong></td><td>${esc(form.warehouseName)}</td></tr>
      <tr><td><strong>Ngày nhập:</strong></td><td>${esc(formatDate(form.importDate))}</td></tr>
      <tr><td><strong>Số PO:</strong></td><td>${esc(form.poNumber)}</td></tr>
      <tr><td><strong>Số hóa đơn:</strong></td><td>${esc(form.invoiceNumber)}</td></tr>
      <tr><td><strong>Loại nhập:</strong></td><td>${esc(form.importType)}</td></tr>
      <tr><td><strong>Trạng thái:</strong></td><td>${esc(statusCfg.label)}</td></tr>
      <tr><td><strong>Người tạo:</strong></td><td>${esc(form.createdBy)}</td></tr>
      ${form.approvedBy ? `<tr><td><strong>Người phê duyệt:</strong></td><td>${esc(form.approvedBy)}</td></tr>` : ''}
      ${form.note ? `<tr><td colspan="2"><strong>Ghi chú:</strong> ${esc(form.note)}</td></tr>` : ''}
    </tbody>
  </table>
  <table class="items-table">
    <thead>
      <tr>
        <th style="width:36px">STT</th>
        <th>Nguyên vật liệu</th>
        <th style="width:50px">ĐVT</th>
        <th style="width:70px;text-align:right">SL nhập</th>
        <th style="width:100px;text-align:right">Đơn giá</th>
        <th style="width:110px;text-align:right">Thành tiền</th>
        <th style="width:80px">Số lô</th>
        <th style="width:80px">Ngày SX</th>
        <th style="width:80px">Hạn SD</th>
        <th>Ghi chú</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>
  <div class="total-row">Tổng giá trị: ${fmtVnd(totalValue)}</div>
  <div class="sign-grid">
    <div class="sign-block">
      <p>Người lập phiếu</p>
      <span class="note">(Ký, ghi rõ họ tên)</span>
      <div class="name">${esc(form.createdBy)}</div>
    </div>
    <div class="sign-block">
      <p>Thủ kho</p>
      <span class="note">(Ký, ghi rõ họ tên)</span>
      <div class="name"></div>
    </div>
    <div class="sign-block">
      <p>Người phê duyệt</p>
      <span class="note">(Ký, ghi rõ họ tên)</span>
      <div class="name">${esc(form.approvedBy)}</div>
    </div>
  </div>
</body>
</html>`
}
