let prods = [
  {name: "test", desc: "Funny product", price: 1000000000000},
];

// TODO:
// 1. Registrar producto -> Registrar un nuevo producto. POST para productos
// 2. Actualizar producto -> Modificar productos existentes. PUT para productos
// 3. Gestionar depósitos -> Registrar y modificar datos de los depósitos. POST & PUT para depósitos
// 4. Generar requerimientos de reposición -> Generar req. rep automáticamente. Ejecutar registor en la DB cuando stock llege a un número límite.
// 5. Gestionar ingreso de stock -> Actualizar stocks, incrementar numerito
// 6. Gestionar egreso de stock -> Actualizar stocks, decrementar numerito
// 7. Transferir stock entre depósitos -> Actualizar stocks, incrementar numerito en un lado decrementar en otro
// 8. Consultar disponibilidad de stock -> GET para los stocks
// 9. Generar requerimientos de reposición -> Duplicado del 4. Ignorar

// Endpoints
export async function GET(req: Request) {
  return Response.json(prods[0]);
}
export async function POST(req: Request) {
  return Response.error();
}
export async function PUT(req: Request) {
  return Response.error();
}
export async function DELETE(req: Request) {
  return Response.error();
}
