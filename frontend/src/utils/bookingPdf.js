import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateBookingPDF = (booking, options = {}) => {
  if (!booking) return;

  const companyName = options.companyName || 'Car Rental';

  // Normalize fields
  const bookingId = booking.id || booking._id || 'N/A';
  const status = (booking.status || '').toString();
  const statusUpper = status.toUpperCase() || 'N/A';
  const paymentStatus = booking.paymentStatus || 'Pending';
  const paymentMethod = booking.paymentMethod || 'N/A';

  const startDate =
    booking.startDate instanceof Date
      ? booking.startDate.toLocaleDateString()
      : booking.startDate
      ? new Date(booking.startDate).toLocaleDateString()
      : 'N/A';

  const endDate =
    booking.endDate instanceof Date
      ? booking.endDate.toLocaleDateString()
      : booking.endDate
      ? new Date(booking.endDate).toLocaleDateString()
      : 'N/A';

  // Derive days and pricing
  let days = booking.days || booking.totalDays;
  const totalAmount = booking.totalPrice || booking.total || 0;
  const dailyRateSource =
    booking.dailyRate ||
    booking.car?.price ||
    (days && totalAmount ? totalAmount / days : null);

  if (!days && booking.startDate && booking.endDate) {
    const s = new Date(booking.startDate);
    const e = new Date(booking.endDate);
    const diff = Math.round((e - s) / (1000 * 60 * 60 * 24));
    days = diff || 1;
  }

  const dailyRate = dailyRateSource || 0;

  const customerName =
    booking.customerName ||
    booking.customer?.name ||
    'N/A';
  const customerContact =
    booking.customer?.email || booking.customer?.phone
      ? `${booking.customer?.email || ''}${booking.customer?.email && booking.customer?.phone ? ' | ' : ''}${booking.customer?.phone || ''}`
      : 'N/A';

  const ownerName =
    booking.ownerName ||
    booking.owner?.name ||
    'N/A';
  const ownerContact =
    booking.owner?.email || booking.owner?.phone
      ? `${booking.owner?.email || ''}${booking.owner?.email && booking.owner?.phone ? ' | ' : ''}${booking.owner?.phone || ''}`
      : 'N/A';

  const carName =
    booking.carName ||
    booking.car?.name ||
    'N/A';
  const carType = booking.car?.type || 'N/A';
  const plateNumber = booking.car?.plateNumber || 'N/A';

  const generatedAt = new Date().toLocaleString();

  const doc = new jsPDF('p', 'mm', 'a4');

  // Top header bar
  doc.setFillColor(33, 150, 243);
  doc.rect(0, 0, 210, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text(companyName, 14, 18);

  // Reset text color
  doc.setTextColor(0, 0, 0);

  // Title and status badge
  let cursorY = 45;
  doc.setFontSize(16);
  doc.text('Booking Confirmation', 14, cursorY);

  // Status badge color mapping
  const statusColors = {
    CONFIRMED: { r: 46, g: 204, b: 113 },
    COMPLETED: { r: 46, g: 204, b: 113 },
    PENDING: { r: 241, g: 196, b: 15 },
    CANCELLED: { r: 231, g: 76, b: 60 },
    REJECTED: { r: 231, g: 76, b: 60 }
  };

  const badgeColor =
    statusColors[statusUpper] || { r: 149, g: 165, b: 166 };

  const badgeX = 14;
  const badgeY = cursorY + 6;
  const badgeWidth = 35 + statusUpper.length * 1.5;
  const badgeHeight = 7;

  doc.setFillColor(badgeColor.r, badgeColor.g, badgeColor.b);
  doc.setTextColor(255, 255, 255);
  doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 2, 2, 'F');
  doc.setFontSize(10);
  doc.text(statusUpper, badgeX + 3, badgeY + 4.5);

  doc.setTextColor(0, 0, 0);

  // Meta info (generated date & booking id)
  doc.setFontSize(10);
  doc.text(`Generated: ${generatedAt}`, 14, badgeY + 12);
  doc.text(`Booking ID: ${bookingId}`, 14, badgeY + 18);

  // Start tables below header
  cursorY = badgeY + 24;

  const sectionHeaderColor = [33, 150, 243];
  const sectionHeaderStyle = {
    fillColor: sectionHeaderColor,
    textColor: [255, 255, 255],
    halign: 'left',
    fontStyle: 'bold'
  };

  const tableBodyStyle = {
    fontSize: 10,
    cellPadding: 3
  };

  // Booking Details section
  autoTable(doc, {
    startY: cursorY,
    head: [['Booking Details', '']],
    body: [
      ['Status', statusUpper],
      ['Start Date', startDate],
      ['End Date', endDate],
      ['Duration (days)', days != null ? String(days) : 'N/A'],
      ['Payment Method', paymentMethod],
      ['Payment Status', paymentStatus]
    ],
    theme: 'grid',
    headStyles: {
      ...sectionHeaderStyle,
      fontSize: 11
    },
    bodyStyles: {
      ...tableBodyStyle
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 120 }
    }
  });

  cursorY = doc.lastAutoTable.finalY + 6;

  // Car & Parties section
  autoTable(doc, {
    startY: cursorY,
    head: [['Car & Parties', '']],
    body: [
      ['Car', carName],
      ['Car Type', carType],
      ['Plate Number', plateNumber],
      ['Owner', ownerName],
      ['Owner Contact', ownerContact],
      ['Customer', customerName],
      ['Customer Contact', customerContact]
    ],
    theme: 'grid',
    headStyles: {
      ...sectionHeaderStyle,
      fontSize: 11
    },
    bodyStyles: {
      ...tableBodyStyle
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 120 }
    }
  });

  cursorY = doc.lastAutoTable.finalY + 6;

  // Pricing Summary section
  autoTable(doc, {
    startY: cursorY,
    head: [['Pricing Summary', '']],
    body: [
      ['Daily Rate', `₹${dailyRate.toFixed(2)}`],
      ['Days', days != null ? String(days) : 'N/A'],
      ['Subtotal', `₹${(dailyRate * (days || 0)).toFixed(2)}`],
      ['Taxes/Fees', '-'],
      ['Total', `₹${Number(totalAmount || 0).toFixed(2)}`]
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [46, 204, 113],
      textColor: [255, 255, 255],
      halign: 'left',
      fontStyle: 'bold',
      fontSize: 11
    },
    bodyStyles: {
      ...tableBodyStyle
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 120 }
    }
  });

  cursorY = doc.lastAutoTable.finalY + 12;

  // Footer note
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(
    `${companyName} - Thank you for choosing us`,
    14,
    Math.min(cursorY, 285)
  );

  // Page footer
  doc.text(
    `Page 1 of 1`,
    180,
    295,
    { align: 'right' }
  );

  doc.save(`booking-${bookingId}.pdf`);
};
