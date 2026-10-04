export type AccesoPermitido = {
  id: string;
  accesoPadre: string | null;
  accesoOrden: number | null;
  accesoDescripcion: string | null;
};

export type UsuarioSesion = {
  id: number;
  usuarioNombre: string;
  usuarioMail: string;
};

export type Sesion = {
  token: string;
  usuario: UsuarioSesion;
  accesos: AccesoPermitido[];
};

export type Perfil = {
  usuario: UsuarioSesion;
  accesos: AccesoPermitido[];
};
