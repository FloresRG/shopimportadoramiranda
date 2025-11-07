// src/components/ReservaConfirmada.tsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { toast } from "sonner";

type ConfirmedItem = {
  id: number;
  nombre: string;
  precio: number;
  foto: string;
  cantidad: number;
};

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

const imageUrlToBase64 = (url: string): Promise<string> => {
  return fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    });
};

const ReservaConfirmada = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [items, setItems] = useState<ConfirmedItem[]>([]);
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [ci, setCi] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [ventaIdModal, setVentaIdModal] = useState<number | null>(null);

  useEffect(() => {
    const state = location.state as { items: ConfirmedItem[] } | null;
    if (!state?.items || state.items.length === 0) {
      navigate("/Reserva", { replace: true });
      return;
    }
    setItems(state.items);
  }, [location.state, navigate]);

  const getTotalPrice = () =>
    items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

  const generarPDF = async (venta: VentaResponse["venta"]) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [80, 200],
    });

    const margin = 5;
    const pageWidth = 80;
    const centerX = pageWidth / 2;
    let currentY = 10;

    let logoBase64: string | null = null;
    try {
      logoBase64 = await imageUrlToBase64("/logo.png");
    } catch (err) {
      console.warn("No se pudo cargar el logo:", err);
    }

    // Barra superior
    doc.setFillColor(30, 60, 120);
    doc.rect(0, 0, pageWidth, 8, "F");
    currentY += 6;

    // Logo
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, "PNG", centerX - 15, currentY, 30, 15);
        currentY += 20;
      } catch (e) {
        console.warn("Error al insertar logo:", e);
        doc.setFontSize(12);
        doc.setTextColor(30, 60, 120);
        doc.text("Importadora Miranda", centerX, currentY + 4, { align: "center" });
        currentY += 10;
      }
    } else {
      doc.setFontSize(12);
      doc.setTextColor(30, 60, 120);
      doc.text("Importadora Miranda", centerX, currentY + 4, { align: "center" });
      currentY += 10;
    }

    doc.setTextColor(0, 0, 0);

    // ✅ ID de la venta debajo del logo
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(`#${venta.id}`, centerX, currentY, { align: "center" });
    currentY += 12;

    // ✅ Mensaje adicional
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Con este código recoja su reserva.", centerX, currentY, { align: "center" });
    currentY += 12;

    // Datos del cliente
    doc.text(`Cliente: ${venta.nombre_cliente}`, margin, currentY);
    currentY += 6;
    doc.text(`CI: ${venta.ci}`, margin, currentY);
    currentY += 6;
    doc.text(`Total: Bs. ${venta.costo_total.toFixed(2)}`, margin, currentY);
    currentY += 10;

    doc.setDrawColor(200, 200, 200);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 8;

    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 60, 120);
    doc.text("✅ Productos reservados", margin, currentY);
    currentY += 8;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    const productosAMostrar = items.slice(0, 8);
    productosAMostrar.forEach((item) => {
      const nombreCorto = item.nombre.length > 28 ? item.nombre.substring(0, 27) + "…" : item.nombre;
      doc.text(`• ${nombreCorto}`, margin, currentY);
      currentY += 5;
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.text(`  x${item.cantidad} · Bs. ${item.precio.toFixed(2)}`, margin, currentY);
      currentY += 7;
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
    });

    currentY += 6;
    doc.setTextColor(200, 40, 40);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    const lines = doc.splitTextToSize(
      "¡Atención! Este producto puede agotarse si no retira en tienda pronto. Válido solo por efectivo. No se aceptan pagos por QR.",
      pageWidth - 2 * margin
    );
    doc.text(lines, margin, currentY);
    currentY += lines.length * 5 + 8;

    doc.save(`reserva-${venta.id}.pdf`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreCompleto.trim() || !ci.trim()) {
      toast.error("Por favor complete todos los campos.");
      return;
    }

    setIsSubmitting(true);

    const productos = items.map((item) => ({
      id: item.id,
      cantidad: item.cantidad,
      precio: item.precio,
    }));

    const body = {
      nombre_cliente: nombreCompleto.trim(),
      costo_total: getTotalPrice(),
      productos: JSON.stringify(productos),
      id_sucursal: 1,
      ci: ci.trim(),
      tipo_pago: "Efectivo",
      garantia: "sin garantia",
      descuento: 0,
      id_user: 1,
      pagado: getTotalPrice(),
      pagado_qr: null,
    };

    try {
      const response = await fetch("http://192.168.1.213:8000/api/ventas/moderno", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result: VentaResponse = await response.json();

      if (response.ok && result.success && result.venta) {
        toast.success("¡Reserva registrada con éxito!", {
          description: "Se ha descargado su comprobante.",
          duration: 5000,
        });

        await generarPDF(result.venta);

        // ✅ Mostrar modal en lugar de redirigir inmediatamente
        setVentaIdModal(result.venta.id);
        setShowSuccessModal(true);
      } else {
        toast.error("Error al registrar la venta", {
          description: result.message || "Intente nuevamente.",
        });
      }
    } catch (err) {
      toast.error("Error de conexión", {
        description: "Verifique su red e intente nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate("/Reserva"); // o la ruta que desees
  };

  if (items.length === 0) return null;

  return (
    <div className="p-4 pt-40 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-black mb-2 text-center">¡Reserva Confirmada!</h1>
      <p className="text-gray-700 text-center mb-2">
        Gracias por tu reserva. Aquí está el resumen:
      </p>

      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 p-4 border rounded-lg shadow-sm"
          >
            {item.foto ? (
              <img
                src={item.foto}
                alt={item.nombre}
                className="w-16 h-16 object-cover rounded"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                📦
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-black">{item.nombre}</h3>
              <p className="text-gray-600">Bs. {item.precio.toFixed(2)}</p>
            </div>
            <div className="text-lg font-bold">x{item.cantidad}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 text-right">
        <p className="text-xl font-bold text-black">
          Total: Bs. {getTotalPrice().toFixed(2)}
        </p>
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-800 font-medium">
          Complete sus datos y verifique su información para confirmar su reserva
        </p>
      </div>

      <div className="mt-4 p-6 bg-gray-50 rounded-lg border">
        <h2 className="text-xl font-bold text-black mb-4 text-center">Completar Venta</h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
          <div>
            <label htmlFor="nombre" className="block text-black font-medium mb-1">
              Nombre completo
            </label>
            <input
              id="nombre"
              type="text"
              required
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black text-black"
              placeholder="Ej: Juan Pérez"
            />
          </div>
          <div>
            <label htmlFor="ci" className="block text-black font-medium mb-1">
              Carnet de Identidad (CI)
            </label>
            <input
              id="ci"
              type="text"
              required
              value={ci}
              onChange={(e) => setCi(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black text-black"
              placeholder="Ej: 1234567"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2.5 px-4 rounded-lg text-white font-medium transition flex items-center justify-center ${
              isSubmitting
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-black hover:bg-gray-800"
            }`}
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Confirmando...
              </>
            ) : (
              "Confirmar Reserva"
            )}
          </button>
        </form>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => navigate("/Reserva")}
          className="px-6 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition"
        >
          Volver a Productos
        </button>
      </div>

      {/* ✅ Modal de éxito */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full text-center">
            <h2 className="text-xl font-bold text-black mb-2">Recogida de reserva</h2>
            <p className="text-gray-700 mb-4">Su recogida de reserva con el código:</p>
            <div className="text-3xl font-bold text-black mb-6">#{ventaIdModal}</div>
            <button
              onClick={handleModalClose}
              className="w-full py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservaConfirmada;