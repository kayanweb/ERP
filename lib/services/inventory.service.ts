/**
 * Inventory Service
 */
import { inventoryRepo, inventoryTransactionRepo } from '@/lib/repositories'
import type { InventoryRecord, InventoryTransactionRecord } from '@/lib/repositories'

export type { InventoryRecord, InventoryTransactionRecord }

export async function getAllInventory(): Promise<InventoryRecord[]> {
  return inventoryRepo().getAll()
}

export async function getInventoryById(id: string): Promise<InventoryRecord | undefined> {
  return inventoryRepo().getById(id)
}

export async function getInventoryByDepartment(departmentId: string): Promise<InventoryRecord[]> {
  return inventoryRepo().getByDepartment(departmentId)
}

export async function getLowStockItems(): Promise<InventoryRecord[]> {
  return inventoryRepo().getLowStock()
}

export async function createInventory(
  item: Omit<InventoryRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<InventoryRecord> {
  return inventoryRepo().create(item)
}

export async function updateInventory(
  id: string,
  updates: Partial<InventoryRecord>
): Promise<InventoryRecord | undefined> {
  return inventoryRepo().update(id, updates)
}

export async function deleteInventory(id: string): Promise<void> {
  return inventoryRepo().delete(id)
}

export async function addStock(
  id: string,
  quantity: number,
  performedById: string,
  performedByName: string,
  reason?: string,
  referenceNumber?: string
): Promise<InventoryRecord | undefined> {
  const item = await inventoryRepo().getById(id)
  if (!item) return undefined
  
  const newStock = item.currentStock + quantity
  
  // Record transaction
  await inventoryTransactionRepo().create({
    inventoryId: id,
    inventoryName: item.name,
    type: 'in',
    quantity,
    previousStock: item.currentStock,
    newStock,
    reason,
    referenceNumber,
    performedById,
    performedByName,
  })
  
  // Update inventory
  return inventoryRepo().update(id, {
    currentStock: newStock,
    lastRestocked: new Date().toISOString(),
  })
}

export async function removeStock(
  id: string,
  quantity: number,
  performedById: string,
  performedByName: string,
  reason?: string,
  referenceNumber?: string
): Promise<InventoryRecord | undefined> {
  const item = await inventoryRepo().getById(id)
  if (!item) return undefined
  
  const newStock = Math.max(0, item.currentStock - quantity)
  
  // Record transaction
  await inventoryTransactionRepo().create({
    inventoryId: id,
    inventoryName: item.name,
    type: 'out',
    quantity,
    previousStock: item.currentStock,
    newStock,
    reason,
    referenceNumber,
    performedById,
    performedByName,
  })
  
  // Update inventory
  return inventoryRepo().update(id, { currentStock: newStock })
}

export async function adjustStock(
  id: string,
  newQuantity: number,
  performedById: string,
  performedByName: string,
  reason?: string
): Promise<InventoryRecord | undefined> {
  const item = await inventoryRepo().getById(id)
  if (!item) return undefined
  
  // Record transaction
  await inventoryTransactionRepo().create({
    inventoryId: id,
    inventoryName: item.name,
    type: 'adjustment',
    quantity: newQuantity - item.currentStock,
    previousStock: item.currentStock,
    newStock: newQuantity,
    reason,
    performedById,
    performedByName,
  })
  
  // Update inventory
  return inventoryRepo().update(id, { currentStock: newQuantity })
}

export async function markExpired(
  id: string,
  quantity: number,
  performedById: string,
  performedByName: string
): Promise<InventoryRecord | undefined> {
  const item = await inventoryRepo().getById(id)
  if (!item) return undefined
  
  const newStock = Math.max(0, item.currentStock - quantity)
  
  // Record transaction
  await inventoryTransactionRepo().create({
    inventoryId: id,
    inventoryName: item.name,
    type: 'expired',
    quantity,
    previousStock: item.currentStock,
    newStock,
    reason: 'Item expired',
    performedById,
    performedByName,
  })
  
  // Update inventory
  return inventoryRepo().update(id, { currentStock: newStock })
}

export async function getTransactionHistory(inventoryId: string): Promise<InventoryTransactionRecord[]> {
  return inventoryTransactionRepo().getByInventory(inventoryId)
}

export async function getAllTransactions(): Promise<InventoryTransactionRecord[]> {
  return inventoryTransactionRepo().getAll()
}

export function getStockStatus(item: InventoryRecord): {
  status: 'ok' | 'low' | 'critical' | 'out'
  color: string
  label: string
  labelAr: string
} {
  if (item.currentStock === 0) {
    return { status: 'out', color: 'red', label: 'Out of Stock', labelAr: 'نفذ المخزون' }
  }
  if (item.currentStock <= item.minStock) {
    return { status: 'critical', color: 'red', label: 'Critical', labelAr: 'حرج' }
  }
  if (item.currentStock <= item.reorderPoint) {
    return { status: 'low', color: 'yellow', label: 'Low Stock', labelAr: 'مخزون منخفض' }
  }
  return { status: 'ok', color: 'green', label: 'In Stock', labelAr: 'متوفر' }
}

export async function getInventoryStats(departmentId?: string): Promise<{
  totalItems: number
  lowStock: number
  critical: number
  outOfStock: number
  totalValue: number
}> {
  const items = departmentId
    ? await inventoryRepo().getByDepartment(departmentId)
    : await inventoryRepo().getAll()
  
  return {
    totalItems: items.length,
    lowStock: items.filter(i => i.currentStock <= i.reorderPoint && i.currentStock > i.minStock).length,
    critical: items.filter(i => i.currentStock <= i.minStock && i.currentStock > 0).length,
    outOfStock: items.filter(i => i.currentStock === 0).length,
    totalValue: items.reduce((sum, i) => sum + (i.currentStock * (i.unitPrice || 0)), 0),
  }
}

export async function getExpiringItems(days: number): Promise<InventoryRecord[]> {
  const all = await inventoryRepo().getAll()
  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + days)
  const futureDateStr = futureDate.toISOString().split('T')[0]
  
  return all.filter(item => 
    item.expiryDate && 
    item.expiryDate <= futureDateStr &&
    item.currentStock > 0
  )
}
