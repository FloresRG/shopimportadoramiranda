import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface VentaResponse {
  success: boolean;
  message: string;
  venta: {
    id: number;
    fecha: string;
    nombre_cliente: string;
    ci: string;
    costo_total: number;
    tipo_pago: string;
    garantia: string;
    descuento: number;
    estado: string;
  };
}

export const generarYDescargarPDF = (data: VentaResponse['venta']) => {
  const doc = new jsPDF();

  // Título
  doc.setFontSize(20);
  doc.text('Importadora Miranda', 105, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.text('Nota de Reserva', 105, 30, { align: 'center' });

  // Información del cliente
  doc.setFontSize(10);
  doc.text(`ID Reserva: #${data.id}`, 14, 45);
  doc.text(`Fecha: ${new Date(data.fecha).toLocaleString('es-BO')}`, 14, 52);
  doc.text(`Cliente: ${data.nombre_cliente}`, 14, 59);
  doc.text(`CI: ${data.ci}`, 14, 66);

  // Tabla de resumen
  (doc as any).autoTable({
    startY: 75,
    head: [['Concepto', 'Valor']],
    body: [
      ['Estado', data.estado],
      ['Tipo de Pago', data.tipo_pago],
      ['Garantía', data.garantia],
      ['Descuento', `Bs. ${data.descuento.toFixed(2)}`],
      ['Total', `Bs. ${data.costo_total.toFixed(2)}`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [30, 30, 30] },
    styles: { fontSize: 10, cellPadding: 5 },
  });

  // Pie de página
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.text('Gracias por su compra', 105, finalY, { align: 'center' });

  // Descargar
  doc.save(`reserva-${data.id}.pdf`);
};