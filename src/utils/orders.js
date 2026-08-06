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