// src/features/inventory/mocks/inventory.mock.ts
import type { InventoryItem, InventoryDetail, MovementPoint } from '../types/inventory.types'

export const mockInventoryItems: InventoryItem[] = [
  {
    materialId: 'mat-001',
    materialCode: 'NVL-001',
    materialName: 'Cam tươi',
    category: 'main_ingredient',
    unit: 'kg',
    currentStock: 5,
    stockValue: 150_000,
    minThreshold: 20,
    maxThreshold: 200,
    status: 'low',
    supplierNames: ['Công ty TNHH Rau Quả Tươi'],
    nearExpiryBatchCount: 1,
  },
  {
    materialId: 'mat-002',
    materialCode: 'NVL-002',
    materialName: 'Đường kính trắng',
    category: 'main_ingredient',
    unit: 'kg',
    currentStock: 80,
    stockValue: 1_200_000,
    minThreshold: 30,
    maxThreshold: 150,
    status: 'normal',
    supplierNames: ['Công ty CP Đường Biên Hòa'],
    nearExpiryBatchCount: 0,
  },
  {
    materialId: 'mat-003',
    materialCode: 'NVL-003',
    materialName: 'Sữa tươi không đường',
    category: 'main_ingredient',
    unit: 'l',
    currentStock: 0,
    stockValue: 0,
    minThreshold: 50,
    maxThreshold: 300,
    status: 'out',
    supplierNames: ['Vinamilk'],
    nearExpiryBatchCount: 0,
  },
  {
    materialId: 'mat-004',
    materialCode: 'NVL-004',
    materialName: 'Cà phê Arabica rang xay',
    category: 'main_ingredient',
    unit: 'kg',
    currentStock: 180,
    stockValue: 18_000_000,
    minThreshold: 20,
    maxThreshold: 100,
    status: 'high',
    supplierNames: ['Dalat Farm Coffee', 'Công ty CP Trung Nguyên'],
    nearExpiryBatchCount: 0,
  },
  {
    materialId: 'mat-005',
    materialCode: 'NVL-005',
    materialName: 'Trà xanh Thái Nguyên',
    category: 'main_ingredient',
    unit: 'kg',
    currentStock: 40,
    stockValue: 2_400_000,
    minThreshold: 10,
    maxThreshold: 80,
    status: 'normal',
    supplierNames: ['HTX Chè Thái Nguyên'],
    nearExpiryBatchCount: 0,
  },
  {
    materialId: 'mat-006',
    materialCode: 'NVL-006',
    materialName: 'Ly giấy 500ml',
    category: 'packaging',
    unit: 'cái',
    currentStock: 200,
    stockValue: 400_000,
    minThreshold: 500,
    maxThreshold: 5000,
    status: 'low',
    supplierNames: ['Bao Bì Xanh Co.'],
    nearExpiryBatchCount: 0,
  },
  {
    materialId: 'mat-007',
    materialCode: 'NVL-007',
    materialName: 'Ống hút giấy',
    category: 'packaging',
    unit: 'cái',
    currentStock: 2000,
    stockValue: 200_000,
    minThreshold: 500,
    maxThreshold: 10000,
    status: 'normal',
    supplierNames: ['Bao Bì Xanh Co.'],
    nearExpiryBatchCount: 0,
  },
  {
    materialId: 'mat-008',
    materialCode: 'NVL-008',
    materialName: 'Lá bạc hà',
    category: 'supporting',
    unit: 'kg',
    currentStock: 2,
    stockValue: 60_000,
    minThreshold: 5,
    maxThreshold: 30,
    status: 'low',
    supplierNames: ['Vườn Rau Hữu Cơ Đà Lạt'],
    nearExpiryBatchCount: 2,
  },
]

function makeDateLabel(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().slice(0, 10)
}

function makeMovementChart(): MovementPoint[] {
  let running = 50
  return Array.from({ length: 30 }, (_, i) => {
    const imp = Math.floor(Math.random() * 50)
    const exp = Math.floor(Math.random() * 30)
    running = Math.max(0, running + imp - exp)
    return { date: makeDateLabel(29 - i), import: imp, export: exp, balance: running }
  })
}

export const mockInventoryDetail: InventoryDetail = {
  ...mockInventoryItems[0],
  movementChart: makeMovementChart(),
  transactions: [
    {
      id: 'tx-001',
      date: makeDateLabel(1),
      type: 'import',
      quantity: 30,
      stockBefore: 0,
      stockAfter: 30,
      userName: 'Nguyễn Văn A',
      referenceId: 'PN-2026-001',
      referenceType: 'import',
    },
    {
      id: 'tx-002',
      date: makeDateLabel(2),
      type: 'export',
      quantity: -15,
      stockBefore: 30,
      stockAfter: 15,
      userName: 'Trần Thị B',
      referenceId: 'PX-2026-001',
      referenceType: 'export',
    },
    {
      id: 'tx-003',
      date: makeDateLabel(5),
      type: 'balance',
      quantity: -10,
      stockBefore: 15,
      stockAfter: 5,
      userName: 'Lê Văn C',
      referenceId: 'KK-2026-001',
      referenceType: 'balance',
    },
  ],
  batches: [
    {
      id: 'batch-001',
      batchNumber: 'LOT-20260101',
      quantity: 5,
      mfgDate: '2026-01-01',
      expiryDate: '2026-05-01',
      supplierName: 'Công ty TNHH Rau Quả Tươi',
      importFormId: 'PN-2026-001',
    },
  ],
}
