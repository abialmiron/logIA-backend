import { prisma } from "../../shared/prisma";

export type CategoriaParaRuta = {
  id: number;
  categoriaNombre: string;
  categoriaPadreId: number | null;
};

export async function mapaCategoriasParaRuta() {
  const categorias = await prisma.categoria.findMany({
    select: { id: true, categoriaNombre: true, categoriaPadreId: true },
  });
  return new Map(categorias.map((categoria) => [categoria.id, categoria]));
}

export function rutaCategoriaConComas(
  categoriaId: number,
  porId: Map<number, CategoriaParaRuta>,
) {
  const partes: string[] = [];
  let actual = porId.get(categoriaId);

  while (actual) {
    partes.unshift(actual.categoriaNombre);
    actual = actual.categoriaPadreId !== null ? porId.get(actual.categoriaPadreId) : undefined;
  }

  return partes.join(", ");
}
