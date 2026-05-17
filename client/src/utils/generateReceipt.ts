import jsPDF from 'jspdf';

export interface ReceiptData {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  menuTitle: string;
  menuCategory: string;
  dietaryPreference: 'veg' | 'non-veg';
  subscriptionType: 'monthly' | 'trial';
  duration?: number;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod?: string;
  paymentId?: string;
  orderDate: string;
  startDate?: string;
  endDate?: string;
  deliveryTime?: string;
}

const TEAL: [number, number, number] = [50, 140, 129];
const TEAL_LIGHT: [number, number, number] = [235, 248, 246];
const DARK: [number, number, number] = [30, 30, 30];
const GRAY: [number, number, number] = [100, 100, 100];

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const row = (
  doc: jsPDF,
  label: string,
  value: string,
  y: number,
  pageWidth: number,
  valueColor?: [number, number, number]
) => {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...GRAY);
  doc.text(label, 18, y);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...(valueColor ?? DARK));
  doc.text(value, pageWidth / 2, y);
};

export const generateReceipt = (data: ReceiptData): void => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const receiptNo = `#${data.orderId.slice(-8).toUpperCase()}`;

  // ── HEADER ──────────────────────────────────────────────────
  doc.setFillColor(...TEAL);
  doc.rect(0, 0, W, 44, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('mamatiffin', 14, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Fresh Homemade Food Delivered Daily', 14, 26);
  doc.text('www.mamatiffin.com', 14, 32);

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('RECEIPT', W - 14, 18, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(receiptNo, W - 14, 26, { align: 'right' });
  doc.text(formatDate(data.orderDate), W - 14, 32, { align: 'right' });

  // ── CUSTOMER DETAILS ────────────────────────────────────────
  let y = 56;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEAL);
  doc.text('CUSTOMER DETAILS', 14, y);
  doc.setDrawColor(...TEAL);
  doc.setLineWidth(0.4);
  doc.line(14, y + 2, W - 14, y + 2);
  y += 10;

  row(doc, 'Name', data.customerName, y, W); y += 8;
  row(doc, 'Phone', data.customerPhone, y, W); y += 8;
  if (data.customerEmail) { row(doc, 'Email', data.customerEmail, y, W); y += 8; }

  // ── ORDER DETAILS ───────────────────────────────────────────
  y += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEAL);
  doc.text('ORDER DETAILS', 14, y);
  doc.line(14, y + 2, W - 14, y + 2);
  y += 10;

  row(doc, 'Menu', data.menuTitle, y, W); y += 8;
  row(doc, 'Category', data.menuCategory, y, W); y += 8;
  row(doc, 'Preference', data.dietaryPreference === 'veg' ? 'Vegetarian' : 'Non-Vegetarian', y, W); y += 8;
  row(doc, 'Plan', data.subscriptionType === 'trial' ? '1-Day Trial' : 'Monthly Subscription', y, W); y += 8;

  if (data.duration) {
    row(doc, 'Duration', `${data.duration} ${data.subscriptionType === 'monthly' ? 'Month(s)' : 'Day(s)'}`, y, W);
    y += 8;
  }
  if (data.startDate) { row(doc, 'Start Date', formatDate(data.startDate), y, W); y += 8; }
  if (data.endDate) { row(doc, 'End Date', formatDate(data.endDate), y, W); y += 8; }
  if (data.deliveryTime) { row(doc, 'Delivery Time', data.deliveryTime, y, W); y += 8; }

  // ── PAYMENT DETAILS ─────────────────────────────────────────
  y += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEAL);
  doc.text('PAYMENT DETAILS', 14, y);
  doc.line(14, y + 2, W - 14, y + 2);
  y += 10;

  if (data.paymentId) { row(doc, 'Payment ID', data.paymentId, y, W); y += 8; }
  if (data.paymentMethod) {
    row(doc, 'Method', data.paymentMethod.replace(/_/g, ' ').toUpperCase(), y, W);
    y += 8;
  }

  const statusColor: [number, number, number] =
    data.paymentStatus === 'success' ? [22, 163, 74] :
    data.paymentStatus === 'failed'  ? [220, 38, 38] :
    [202, 138, 4];
  row(doc, 'Status', data.paymentStatus.toUpperCase(), y, W, statusColor);
  y += 14;

  // ── TOTAL BOX ───────────────────────────────────────────────
  doc.setFillColor(...TEAL_LIGHT);
  doc.setDrawColor(...TEAL);
  doc.setLineWidth(0.8);
  doc.roundedRect(14, y, W - 28, 18, 3, 3, 'FD');

  doc.setTextColor(...DARK);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('TOTAL AMOUNT', 20, y + 11);

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEAL);
  doc.text(`Rs. ${data.totalAmount.toLocaleString('en-IN')}`, W - 20, y + 11, { align: 'right' });

  // ── FOOTER ──────────────────────────────────────────────────
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFillColor(...TEAL);
  doc.rect(0, pageH - 22, W, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Thank you for choosing MamaTiffin!', W / 2, pageH - 13, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('www.mamatiffin.com  |  Fresh food, delivered daily', W / 2, pageH - 6, { align: 'center' });

  doc.save(`MamaTiffin-Receipt-${receiptNo}.pdf`);
};
