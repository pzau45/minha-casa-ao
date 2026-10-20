/**
 * Format currency in Angolan Kwanzas (AOA / Kz)
 * e.g., 250000 -> "250.000 Kz"
 */
export function formatKz(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 Kz';
  
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  // Format with thousand separators
  const parts = absAmount.toFixed(2).split('.');
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const decPart = parts[1];

  // If decimal part is '00', we can omit it for cleaner display in Kz
  const formatted = decPart === '00' ? `${intPart} Kz` : `${intPart},${decPart} Kz`;
  
  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Format dates into friendly Angolan Portuguese format
 */
export function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const month = parts[1];
      const day = parts[2].split('T')[0];
      return `${day}/${month}/${year}`;
    }
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-AO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatShortDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length >= 3) {
      const day = parts[2].split('T')[0];
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const mIdx = parseInt(parts[1], 10) - 1;
      return `${day} ${monthNames[mIdx] || parts[1]}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

/**
 * Days remaining or overdue
 */
export function getDaysRemaining(targetDateStr: string): { days: number; isOverdue: boolean; label: string } {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(targetDateStr);
  target.setHours(0, 0, 0, 0);
  
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return { days: Math.abs(diffDays), isOverdue: true, label: `Atrasado ${Math.abs(diffDays)}d` };
  } else if (diffDays === 0) {
    return { days: 0, isOverdue: false, label: 'Vence hoje' };
  } else if (diffDays === 1) {
    return { days: 1, isOverdue: false, label: 'Vence amanhã' };
  } else {
    return { days: diffDays, isOverdue: false, label: `${diffDays} dias restantes` };
  }
}

/**
 * Generate a short unique ID
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}
