export interface paymentsModel {
  id_pago: number;
  id_persona: number;
  identificacion: string;
  comprobante: string;
  tipo_pago: string;
  fecha_pago: Date;
  fecha_presentacion: Date;
  estado: string;
  monto: number;
  moneda: string;
  usuario: string;
  observaciones: string;
  archivo: File | null;
  tipo_movimiento: string;
}
