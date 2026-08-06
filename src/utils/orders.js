export function orderStatus(status, t) {
  const labels = {
    pending: t('Pending'),
    processing: t('Processing'),
    shipped: t('Shipped'),
    delivered: t('Delivered'),
    completed: t('Completed'),
    cancelled: t('Cancelled'),
    refunded: t('Refunded'),
  }
  return labels[status] || status
}