export function orderStatus(status, t) {
  const labels = {
    pending: t('Pending'),
    confirmed: t('Confirmed'),
    processing: t('Processing'),
    packing: t('Processing'),
    shipped: t('Shipped'),
    ready: t('Shipped'),
    delivered: t('Delivered'),
    completed: t('Delivered'),
    cancelled: t('Cancelled'),
    refunded: t('Refunded'),
  }
  return labels[status] || status
}

// No online gateway is integrated: card and other non-cash methods are
// manual only and stay pending until staff confirms collection/delivery.
export function paymentMethodLabel(method, t) {
  const labels = {
    manual: t('Manual payment'),
    card: t('Card (manual — not an online payment)'),
    bank_transfer: t('Bank transfer (manual — not an online payment)'),
    cash: t('Cash on delivery'),
  }
  return labels[method] || (method ? method[0].toUpperCase() + method.slice(1) : '—')
}

export function paymentStatusLabel(status, t) {
  return status === 'paid' ? t('Paid') : t('Pending')
}