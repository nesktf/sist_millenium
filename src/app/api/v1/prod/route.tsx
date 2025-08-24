let prods = [
  {name: "test", desc: "Funny product", price: 1000000000000},
];

// Endpoints
// Consultar productos
export async function GET(req: Request) {
  return Response.json(prods[0]);
}
// Registrar producto
export async function POST(req: Request) {
  return Response.error();
}
// Modificar producto
export async function PUT(req: Request) {
  return Response.error();
}
// Eliminar producto
export async function DELETE(req: Request) {
  return Response.error();
}
