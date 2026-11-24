import { CommonModule } from '@angular/common';

import { HttpClient } from '@angular/common/http';

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { forkJoin } from 'rxjs';

import Swal from 'sweetalert2';

import { ActivatedRoute } from '@angular/router';



// =========================================================
// ALERTAS GERIAPP - SWEETALERT2
// Diseño institucional unificado para todas las operaciones
// =========================================================

type TonoAlerta = 'azul' | 'verde' | 'rojo';

function escaparHtml(texto: string): string {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function contenidoAlerta(titulo: string, mensaje: string, mostrarCheck = false): string {
  return `
    <div class="geri-alerta">
      <div class="geri-alerta__onda"></div>
      <div class="geri-alerta__contenido">
        <img src="/Logo-GerIApp.png" class="geri-alerta__logo" alt="GeriApp"
             onerror="this.style.display='none'">
        ${mostrarCheck ? '<div class="geri-alerta__check">✓</div>' : ''}
        <h2 class="geri-alerta__titulo">${escaparHtml(titulo)}</h2>
        <p class="geri-alerta__mensaje">${escaparHtml(mensaje)}</p>
      </div>
    </div>
  `;
}

function mostrarAlerta(config: {
  titulo: string;
  mensaje: string;
  tono: TonoAlerta;
  confirmar: string;
  cancelar?: string;
  mostrarCheck?: boolean;
}) {
  return Swal.fire({
    html: contenidoAlerta(config.titulo, config.mensaje, config.mostrarCheck),
    width: 520,
    padding: 0,
    showCancelButton: !!config.cancelar,
    showConfirmButton: true,
    confirmButtonText: config.confirmar,
    cancelButtonText: config.cancelar || 'Cancelar',
    reverseButtons: true,
    buttonsStyling: false,
    allowOutsideClick: false,
    allowEscapeKey: true,
    heightAuto: false,
    scrollbarPadding: false,
    backdrop: 'rgba(33, 37, 41, 0.48)',
    customClass: {
      popup: 'geri-swal-popup',
      htmlContainer: 'geri-swal-html',
      actions: 'geri-swal-actions',
      confirmButton: `geri-swal-btn geri-swal-btn--${config.tono}`,
      cancelButton: 'geri-swal-btn geri-swal-btn--cancelar'
    }
  });
}

function alertaExito(titulo: string, mensaje = 'El registro se actualizó correctamente.') {
  return mostrarAlerta({
    titulo, mensaje, tono: 'verde', confirmar: 'Aceptar', mostrarCheck: true
  });
}

function alertaError(titulo: string, mensaje = 'Ocurrió un error al realizar la operación.') {
  return mostrarAlerta({
    titulo, mensaje, tono: 'rojo', confirmar: 'Aceptar'
  });
}

function alertaAdvertencia(titulo: string, mensaje = 'Revisa la información e inténtalo nuevamente.') {
  return mostrarAlerta({
    titulo, mensaje, tono: 'azul', confirmar: 'Aceptar'
  });
}

// =========================================================
// FIN ALERTAS GERIAPP
// =========================================================

interface Sede {

  id_sede: number;

  nombre: string;

  direccion: string | null;

  telefono: string | null;

  estado: boolean | number | string;

  fecha_registro?: string;

  id_fundacion?: number | null;

}



interface Rol {

  id_rol: number;

  nombre: string;

  descripcion?: string;

  estado?: boolean;

}



interface Usuario {
  id_usuario: number;
  id_sede?: number | null;
  id_rol: number | null | {
    id_rol?: number | null;
    nombre?: string;
  };
  nombres: string;
  apellidos: string;
  correo: string;
  telefono?: string;
  estado: boolean | number | string;
  tipo_documento?: string;
  numero_documento?: string;
  fecha_ingreso?: string | null;
  foto?: string | null;
}



type VistaSuperadministrador =

  | 'resumen'

  | 'sedes'

  | 'administradores';



@Component({

  selector: 'app-superadministrador',

  standalone: true,

  imports: [CommonModule],

  templateUrl: './superadministrador.html',

  styleUrl: './superadministrador.css',

})

export class Superadministrador implements OnInit {

  private readonly apiUrl = 'https://geriapp-backend.onrender.com/api';



  nombreInstitucion = '';

  vistaActiva: VistaSuperadministrador = 'resumen';



  sedes: Sede[] = [];

  administradores: Usuario[] = [];

  usuariosDisponibles: Usuario[] = [];

  roles: Rol[] = [];



  cargandoSedes = false;

  errorSedes = false;



  cargandoAdministradores = false;

  errorAdministradores = false;

  actualizandoEstados = new Set<number>();
  actualizandoSedes = new Set<number>();
  usuariosSinSedeExpandido = false;

  constructor(

    private http: HttpClient,

    private cdr: ChangeDetectorRef,

    private route: ActivatedRoute

  ) { }



  ngOnInit(): void {
    this.cargarNombreInstitucion();
    this.listarSedes();

    // La vista y sus datos se cargan según el fragmento
    // seleccionado desde el menú de navegación.
    this.route.fragment.subscribe((fragmento) => {
      if (fragmento === 'sedes') {
        this.cambiarVista('sedes');
      } else if (fragmento === 'administradores') {
        this.cambiarVista('administradores');
      } else {
        this.cambiarVista('resumen');
      }

      this.cdr.detectChanges();
    });
  }



  cargarNombreInstitucion(): void {

    this.http

      .get<{ nombre_institucion?: string | null }>(

        `${this.apiUrl}/configuracion/institucion/`

      )

      .subscribe({

        next: (respuesta) => {

          this.nombreInstitucion =

            respuesta.nombre_institucion?.trim() ?? '';



          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(

            'Error al cargar el nombre de la institución:',

            error

          );



          this.nombreInstitucion = '';

          this.cdr.detectChanges();

        }

      });

  }



  // ==========================================

  // NAVEGACIÓN

  // ==========================================



  cambiarVista(vista: VistaSuperadministrador): void {
    this.vistaActiva = vista;

    // Actualizamos la información al volver a una sección.
    if (vista === 'sedes') {
      this.listarSedes();
    }

    if (vista === 'administradores' || vista === 'resumen') {
      this.listarAdministradores();
    }
  }



  // ==========================================

  // GESTIÓN DE SEDES

  // ==========================================



  listarSedes(): void {

    this.cargandoSedes = true;

    this.errorSedes = false;



    this.http.get<any>(`${this.apiUrl}/sedes/`).subscribe({

      next: (respuesta) => {

        this.sedes = this.normalizarLista<Sede>(respuesta).sort(

          (a, b) => (a.id_sede ?? 0) - (b.id_sede ?? 0)

        );



        this.cargandoSedes = false;

        this.cdr.detectChanges();

      },

      error: (error) => {

        console.error('Error al consultar las sedes:', error);



        this.sedes = [];

        this.cargandoSedes = false;

        this.errorSedes = true;

        this.cdr.detectChanges();

      },

    });

  }



  crearSede(): void {

    Swal.fire({

      title: 'Registrar sede',

      html: `

        <input id="nombre" class="swal2-input"

          placeholder="Nombre de la sede" maxlength="150">

        <input id="direccion" class="swal2-input"

          placeholder="Dirección">

        <input id="telefono" class="swal2-input"

          placeholder="Teléfono">

        <select id="estado" class="swal2-select">

          <option value="true">Activa</option>

          <option value="false">Inactiva</option>

        </select>

      `,

      showCancelButton: true,

      confirmButtonText: 'Guardar sede',

      cancelButtonText: 'Cancelar',

      confirmButtonColor: '#3B5BDB',

      focusConfirm: false,

      preConfirm: () => {

        const popup = Swal.getPopup();



        const nombre = (

          popup?.querySelector('#nombre') as HTMLInputElement

        ).value.trim();



        const direccion = (

          popup?.querySelector('#direccion') as HTMLInputElement

        ).value.trim();



        const telefono = (

          popup?.querySelector('#telefono') as HTMLInputElement

        ).value.trim();



        const estado = (

          popup?.querySelector('#estado') as HTMLSelectElement

        ).value;



        if (!nombre) {

          Swal.showValidationMessage(

            'El nombre de la sede es obligatorio.'

          );

          return;

        }



        return {

          nombre,

          direccion: direccion || null,

          telefono: telefono || null,

          estado: estado === 'true',

          fecha_registro: new Date().toISOString(),

          id_fundacion: null,

        };

      },

    }).then((resultado) => {

      if (!resultado.isConfirmed || !resultado.value) return;



      this.http.post(`${this.apiUrl}/sedes/`, resultado.value).subscribe({

        next: () => {

          alertaExito('Sede registrada', 'La sede se creó correctamente.')



          this.listarSedes();

        },

        error: (error) => {

          console.error('Error al registrar la sede:', error);



          alertaError('No se pudo registrar la sede', this.obtenerMensajeError(error))

        },

      });

    });

  }



  editarSede(sede: Sede): void {

    Swal.fire({

      title: 'Editar sede',

      html: `

        <input id="nombre" class="swal2-input"

          placeholder="Nombre de la sede"

          value="${this.escaparHtml(sede.nombre ?? '')}"

          maxlength="150">

        <input id="direccion" class="swal2-input"

          placeholder="Dirección"

          value="${this.escaparHtml(sede.direccion ?? '')}">

        <input id="telefono" class="swal2-input"

          placeholder="Teléfono"

          value="${this.escaparHtml(sede.telefono ?? '')}">

        <select id="estado" class="swal2-select">

          <option value="true"

            ${this.esActivo(sede.estado) ? 'selected' : ''}>

            Activa

          </option>

          <option value="false"

            ${!this.esActivo(sede.estado) ? 'selected' : ''}>

            Inactiva

          </option>

        </select>

      `,

      showCancelButton: true,

      confirmButtonText: 'Guardar cambios',

      cancelButtonText: 'Cancelar',

      confirmButtonColor: '#3B5BDB',

      focusConfirm: false,

      preConfirm: () => {

        const popup = Swal.getPopup();



        const nombre = (

          popup?.querySelector('#nombre') as HTMLInputElement

        ).value.trim();



        const direccion = (

          popup?.querySelector('#direccion') as HTMLInputElement

        ).value.trim();



        const telefono = (

          popup?.querySelector('#telefono') as HTMLInputElement

        ).value.trim();



        const estado = (

          popup?.querySelector('#estado') as HTMLSelectElement

        ).value;



        if (!nombre) {

          Swal.showValidationMessage(

            'El nombre de la sede es obligatorio.'

          );

          return;

        }



        return {

          nombre,

          direccion: direccion || null,

          telefono: telefono || null,

          estado: estado === 'true',

        };

      },

    }).then((resultado) => {

      if (!resultado.isConfirmed || !resultado.value) return;



      this.http

        .patch(`${this.apiUrl}/sedes/${sede.id_sede}/`, resultado.value)

        .subscribe({

          next: () => {

            alertaExito('Sede actualizada', 'Los cambios se guardaron correctamente.')



            this.listarSedes();

          },

          error: (error) => {

            console.error('Error al actualizar la sede:', error);



            alertaError('No se pudo actualizar la sede', this.obtenerMensajeError(error))

          },

        });

    });

  }



  // ==========================================

  // GESTIÓN DE ADMINISTRADORES

  // ==========================================



  listarAdministradores(): void {

    this.cargandoAdministradores = true;

    this.errorAdministradores = false;



    forkJoin({

      usuarios: this.http.get<any>(`${this.apiUrl}/usuarios/`),

      roles: this.http.get<any>(`${this.apiUrl}/roles/`),

    }).subscribe({

      next: ({ usuarios, roles }) => {

        const listaUsuarios = this.normalizarLista<Usuario>(usuarios);

        this.usuariosDisponibles = listaUsuarios;

        this.roles = this.normalizarLista<Rol>(roles);



        // Diagnóstico temporal: permite identificar por qué algunos usuarios

        // aparecen como "Sin rol identificado" en la gráfica.

        this.diagnosticarUsuariosSinRol();



        this.administradores = listaUsuarios

          .filter((usuario) => this.esRolAdministrador(usuario))

          .sort((a, b) =>

            `${a.nombres} ${a.apellidos}`.localeCompare(

              `${b.nombres} ${b.apellidos}`

            )

          );



        this.cargandoAdministradores = false;

        this.cdr.detectChanges();

      },

      error: (error) => {

        console.error(

          'Error al consultar los usuarios y sus roles:',

          error

        );



        this.administradores = [];

        this.cargandoAdministradores = false;

        this.errorAdministradores = true;

        this.cdr.detectChanges();

      },

    });

  }



  // ==========================================

  // DIAGNÓSTICO TEMPORAL DE USUARIOS Y ROLES

  // ==========================================



  diagnosticarUsuariosSinRol(): void {

    console.group('DIAGNÓSTICO GERIAPP: USUARIOS Y ROLES');



    // Se muestran únicamente identificadores y datos del rol.

    // No se imprimen nombres, correos, teléfonos ni documentos personales.

    console.log('ROLES DEVUELTOS POR EL BACKEND');

    console.table(

      this.roles.map((rol: any) => ({

        id_rol: rol?.id_rol ?? rol?.id ?? null,

        nombre: rol?.nombre ?? rol?.nombre_rol ?? rol?.rol ?? null,

        estructura_recibida: JSON.stringify(rol)

      }))

    );



    const diagnostico = this.usuariosDisponibles.map((usuario: any) => {

      const rolOriginal = usuario?.id_rol ?? null;

      const idRol =

        typeof rolOriginal === 'object' && rolOriginal !== null

          ? rolOriginal.id_rol ?? rolOriginal.id ?? null

          : rolOriginal;



      const nombreRolAnidado =

        typeof rolOriginal === 'object' && rolOriginal !== null

          ? rolOriginal.nombre ?? rolOriginal.nombre_rol ?? rolOriginal.rol ?? null

          : null;



      const rolPorId = this.roles.find((rol: any) =>

        idRol !== null && idRol !== undefined &&

        Number(rol?.id_rol ?? rol?.id) === Number(idRol)

      );



      const nombreRol =

        nombreRolAnidado ??

        (rolPorId as any)?.nombre ??

        (rolPorId as any)?.nombre_rol ??

        (rolPorId as any)?.rol ??

        null;



      return {

        id_usuario: usuario?.id_usuario ?? usuario?.id ?? null,

        id_rol_recibido: idRol,

        nombre_rol_recibido: nombreRol,

        rol_encontrado_por_id: Boolean(rolPorId),

        rol_original: typeof rolOriginal === 'object'

          ? JSON.stringify(rolOriginal)

          : String(rolOriginal ?? 'NULL')

      };

    });



    console.log('USUARIOS Y RELACIÓN CON SUS ROLES');

    console.table(diagnostico);



    const sinRol = diagnostico.filter((item) =>

      !item.rol_encontrado_por_id && !item.nombre_rol_recibido

    );



    console.log('RESUMEN DEL DIAGNÓSTICO');

    console.table({

      usuarios_recibidos: this.usuariosDisponibles.length,

      roles_recibidos: this.roles.length,

      usuarios_sin_rol_identificado: sinRol.length

    });



    if (sinRol.length > 0) {

      console.warn('Usuarios sin relación de rol reconocible:', sinRol);

    }



    console.groupEnd();

  }



  // ==========================================

  // ESTADÍSTICAS DEL DASHBOARD

  // ==========================================



  // Cantidad de administradores asignados a una sede

  // según el periodo seleccionado.

  administradoresDeSede(sede: Sede): number {

    return this.usuariosParaAnalisis.filter(

      (usuario) =>

        Number(usuario.id_sede) === Number(sede.id_sede) &&

        this.esRolAdministrador(usuario)

    ).length;

  }



  // Mayor cantidad de administradores entre las sedes.

  get maximoAdministradoresPorSede(): number {

    if (this.sedes.length === 0) {

      return 0;

    }



    const cantidades = this.sedes.map(

      (sede) => this.administradoresDeSede(sede)

    );



    return Math.max(...cantidades, 0);

  }



  // Cantidad de sedes que se encuentran activas.

  get sedesActivas(): number {

    return this.sedes.filter((sede) => this.esActivo(sede.estado)).length;

  }



  // Porcentaje de administradores dentro del periodo seleccionado.

  get porcentajeAdministradores(): number {

    const usuarios = this.usuariosParaAnalisis;

    if (usuarios.length === 0) return 0;



    const cantidad = usuarios.filter(

      (usuario) => this.esRolAdministrador(usuario)

    ).length;



    return (cantidad / usuarios.length) * 100;

  }



  // Usuarios activos e inactivos agrupados por sede dentro del periodo.

  get estadisticasUsuariosPorSede(): Array<{

    sede: Sede;

    activos: number;

    inactivos: number;

    total: number;

  }> {

    return this.sedes.map((sede) => {

      const usuariosSede = this.usuariosParaAnalisis.filter(

        (usuario) =>

          Number(usuario.id_sede) === Number(sede.id_sede)

      );



      const activos = usuariosSede.filter(

        (usuario) => this.esActivo(usuario.estado)

      ).length;

      const inactivos = usuariosSede.length - activos;



      return { sede, activos, inactivos, total: usuariosSede.length };

    });

  }



  get maximoUsuariosPorSede(): number {

    return Math.max(...this.estadisticasUsuariosPorSede.map((item) => item.total), 0);

  }

  // Usuarios sin sede, excluyendo al Superadministrador.
  get usuariosSinSede(): Usuario[] {
    return this.usuariosParaAnalisis.filter(
      (usuario) =>
        !this.esRolSuperadministrador(usuario) &&
        !this.tieneSedeAsignada(usuario) &&
        !this.tieneRolAsignado(usuario)
    );
  }

  // Usuarios que ya tienen sede, pero todavía no tienen rol.
  get usuariosPendientesDeRol(): Usuario[] {
    return this.usuariosParaAnalisis.filter(
      (usuario) =>
        !this.tieneRolAsignado(usuario) &&
        this.tieneSedeAsignada(usuario)
    );
  }

  // Verifica si el usuario tiene un rol.
  private tieneRolAsignado(usuario: Usuario): boolean {
    const rol = usuario.id_rol;

    if (rol === null || rol === undefined) {
      return false;
    }

    if (typeof rol === 'object') {
      return (
        rol.id_rol !== null && rol.id_rol !== undefined
      ) || Boolean(rol.nombre);
    }

    return true;
  }

  // Verifica si el usuario tiene una sede.
  private tieneSedeAsignada(usuario: Usuario): boolean {
    return (
      usuario.id_sede !== null &&
      usuario.id_sede !== undefined
    );
  }

  // Distribución de usuarios por los roles que realmente devuelve /roles/.

  // La cuenta de Superadministrador se excluye de la distribución operativa.

  // Si hay usuarios cuyo rol no coincide con /roles/, se muestran aparte para

  // que la diferencia sea visible y no se atribuya a un rol inventado.

  get usuariosPorRol(): Array<{

    id: number;

    nombre: string;

    cantidad: number;

    porcentaje: number;

    color: string;

  }> {

    const colores = ['#1C2F86', '#315EDB', '#3B5BDB', '#3999ED', '#80BFF2', '#B9D6FA'];



    const rolesOperativos = this.roles.filter(

      (rol) => !this.normalizarTexto(rol.nombre).includes('superadministrador')

    );



    const total = this.totalUsuariosOperativos;



    const distribucion = rolesOperativos.map((rol, indice) => {

      const cantidad = this.usuariosParaAnalisis.filter((usuario) => {

        if (
          this.esRolSuperadministrador(usuario) ||
          !this.tieneSedeAsignada(usuario)
        ) {
          return false;
        }



        const idRol =

          typeof usuario.id_rol === 'object' && usuario.id_rol !== null

            ? usuario.id_rol.id_rol

            : usuario.id_rol;



        const coincidePorId = Number(idRol) === Number(rol.id_rol);

        const coincidePorNombre =

          this.normalizarTexto(this.nombreRol(usuario)) ===

          this.normalizarTexto(rol.nombre);



        return coincidePorId || coincidePorNombre;

      }).length;



      return {

        id: rol.id_rol,

        nombre: rol.nombre,

        cantidad,

        porcentaje: total > 0 ? (cantidad / total) * 100 : 0,

        color: colores[indice % colores.length],

      };

    });



    const usuariosClasificados = distribucion.reduce(
      (suma, rol) => suma + rol.cantidad,
      0
    );

    const cantidadSinSede = this.usuariosSinSede.length;
    const cantidadPendienteRol = this.usuariosPendientesDeRol.length;

    const sinRolIdentificado = Math.max(
      0,
      total -
        usuariosClasificados -
        cantidadSinSede -
        cantidadPendienteRol
    );

    // Usuarios que todavía necesitan una sede.
    if (cantidadSinSede > 0) {
      distribucion.push({
        id: -1,
        nombre: 'Sin sede',
        cantidad: cantidadSinSede,
        porcentaje: total > 0
          ? (cantidadSinSede / total) * 100
          : 0,
        color: '#B9D6FA',
      });
    }

    // Usuarios que ya tienen sede y esperan asignación de rol.
    if (cantidadPendienteRol > 0) {
      distribucion.push({
        id: -2,
        nombre: 'Pendiente de rol',
        cantidad: cantidadPendienteRol,
        porcentaje: total > 0
          ? (cantidadPendienteRol / total) * 100
          : 0,
        color: '#80BFF2',
      });
    }

    // Casos cuyo rol no coincide con los roles registrados.
    if (sinRolIdentificado > 0) {
      distribucion.push({
        id: -3,
        nombre: 'Rol no identificado',
        cantidad: sinRolIdentificado,
        porcentaje: total > 0
          ? (sinRolIdentificado / total) * 100
          : 0,
        color: '#A8B8D5',
      });
    }

    return distribucion.filter((rol) => rol.cantidad > 0);
  }



  // Total de usuarios operativos dentro del periodo.

  // Excluye únicamente al Superadministrador.

  get totalUsuariosOperativos(): number {

    return this.usuariosParaAnalisis.filter(

      (usuario) => !this.esRolSuperadministrador(usuario)

    ).length;

  }



  // Gradiente de la gráfica de dona calculado con los porcentajes anteriores.

  get gradienteRoles(): string {

    const datos = this.usuariosPorRol;



    if (datos.length === 0) {

      return '#e8edf5';

    }



    let acumulado = 0;



    const segmentos = datos.map((rol) => {

      const inicio = acumulado;

      acumulado += rol.porcentaje;

      return `${rol.color} ${inicio}% ${acumulado}%`;

    });



    return `conic-gradient(${segmentos.join(', ')})`;

  }



  // Registros agrupados por mes dentro del periodo seleccionado.

  // Si no hay filtro aplicado, muestra los últimos seis meses.

  get tendenciaRegistros(): Array<{

    clave: string;

    etiqueta: string;

    cantidad: number;

    x: number;

    y: number;

  }> {

    const hoy = new Date();

    const fechaInicial = this.fechaInicioAplicada

      ? new Date(`${this.fechaInicioAplicada}T00:00:00`)

      : new Date(hoy.getFullYear(), hoy.getMonth() - 5, 1);

    const fechaFinal = this.fechaFinAplicada

      ? new Date(`${this.fechaFinAplicada}T00:00:00`)

      : hoy;



    const meses: Array<{

      clave: string;

      etiqueta: string;

      cantidad: number;

      x: number;

      y: number;

    }> = [];



    const cursor = new Date(fechaInicial.getFullYear(), fechaInicial.getMonth(), 1);

    const limite = new Date(fechaFinal.getFullYear(), fechaFinal.getMonth(), 1);



    while (cursor <= limite && meses.length < 120) {

      const clave = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;

      const etiqueta = new Intl.DateTimeFormat('es-CO', { month: 'short' })

        .format(cursor).replace('.', '');

      const cantidad = this.usuariosParaAnalisis.filter(

        (usuario) =>

          typeof usuario.fecha_ingreso === 'string' &&

          usuario.fecha_ingreso.slice(0, 7) === clave

      ).length;



      meses.push({

        clave,

        etiqueta: etiqueta.charAt(0).toUpperCase() + etiqueta.slice(1),

        cantidad,

        x: 0,

        y: 180,

      });

      cursor.setMonth(cursor.getMonth() + 1);

    }



    const maximo = Math.max(...meses.map((mes) => mes.cantidad), 1);

    return meses.map((mes, indice) => ({

      ...mes,

      x: meses.length === 1 ? 300 : 30 + indice * (540 / (meses.length - 1)),

      y: 180 - (mes.cantidad / maximo) * 145,

    }));

  }



  get puntosTendencia(): string {

    return this.tendenciaRegistros.map((punto) => `${punto.x},${punto.y}`).join(' ');

  }



  get areaTendencia(): string {

    const puntos = this.tendenciaRegistros;

    if (puntos.length === 0) return '';

    return `30,190 ${puntos.map((punto) => `${punto.x},${punto.y}`).join(' ')} 570,190`;

  }



  get hayRegistrosEnTendencia(): boolean {

    return this.tendenciaRegistros.some((mes) => mes.cantidad > 0);

  }



  crearAdministrador(): void {

    const rolAdministrador = this.obtenerRolAdministrador();



    if (!rolAdministrador) {

      alertaError('Rol no encontrado', 'No se encontró el rol Administrador en el sistema.')

      return;

    }



    Swal.fire({

      title: 'Registrar administrador',

      html: `

      <input id="nombres" class="swal2-input"

        placeholder="Nombres" maxlength="100">



      <input id="apellidos" class="swal2-input"

        placeholder="Apellidos" maxlength="100">



      <input id="correo" type="email" class="swal2-input"

        placeholder="Correo electrónico">



      <select id="tipo_documento" class="swal2-select">

        <option value="">Tipo de documento</option>

        <option value="CC">Cédula de ciudadanía</option>

        <option value="CE">Cédula de extranjería</option>

        <option value="TI">Tarjeta de identidad</option>

        <option value="Pasaporte">Pasaporte</option>

      </select>



      <input id="numero_documento" class="swal2-input"

        placeholder="Número de documento">



      <input id="telefono" class="swal2-input"

        placeholder="Teléfono">



      <input id="contrasena" type="password" class="swal2-input"

        placeholder="Contraseña (mínimo 8 caracteres)">

    `,

      showCancelButton: true,

      confirmButtonText: 'Crear administrador',

      cancelButtonText: 'Cancelar',

      confirmButtonColor: '#3B5BDB',

      focusConfirm: false,



      preConfirm: () => {

        const popup = Swal.getPopup();



        const nombres = (

          popup?.querySelector('#nombres') as HTMLInputElement

        ).value.trim();



        const apellidos = (

          popup?.querySelector('#apellidos') as HTMLInputElement

        ).value.trim();



        const correo = (

          popup?.querySelector('#correo') as HTMLInputElement

        ).value.trim();



        const tipo_documento = (

          popup?.querySelector('#tipo_documento') as HTMLSelectElement

        ).value;



        const numero_documento = (

          popup?.querySelector('#numero_documento') as HTMLInputElement

        ).value.trim();



        const telefono = (

          popup?.querySelector('#telefono') as HTMLInputElement

        ).value.trim();



        const contrasena = (

          popup?.querySelector('#contrasena') as HTMLInputElement

        ).value;



        if (

          !nombres ||

          !apellidos ||

          !correo ||

          !tipo_documento ||

          !numero_documento ||

          !contrasena

        ) {

          Swal.showValidationMessage(

            'Completa todos los campos obligatorios.'

          );

          return;

        }



        const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;



        if (!formatoCorreo.test(correo)) {

          Swal.showValidationMessage(

            'Ingresa un correo electrónico válido.'

          );

          return;

        }



        if (contrasena.length < 8) {

          Swal.showValidationMessage(

            'La contraseña debe tener al menos 8 caracteres.'

          );

          return;

        }



        return {

          nombres,

          apellidos,

          correo,

          tipo_documento,

          numero_documento,

          telefono: telefono || null,

          contrasena

        };

      }

    }).then(resultado => {

      if (!resultado.isConfirmed || !resultado.value) {

        return;

      }



      // Ruta corregida según core/urls.py.

      this.http.post<any>(

        `${this.apiUrl}/usuarios/registro/`,

        resultado.value

      ).subscribe({

        next: respuesta => {

          const idUsuario = respuesta?.usuario?.id_usuario;



          if (!idUsuario) {

            console.error(

              'El registro respondió sin id_usuario:',

              respuesta

            );



            alertaAdvertencia('Usuario registrado', 'El servidor respondió sin el identificador del usuario. ' +

              'Verifica el registro antes de volver a intentarlo.')



            this.listarAdministradores();

            return;

          }



          // Asigna el rol Administrador al usuario recién creado.

          this.http.patch(

            `${this.apiUrl}/usuarios/${idUsuario}/`,

            {

              id_rol: rolAdministrador.id_rol

            }

          ).subscribe({

            next: () => {

              alertaExito('Administrador registrado', `${resultado.value.nombres} ` +

                `${resultado.value.apellidos} fue registrado correctamente.`)



              this.listarAdministradores();

            },



            error: error => {

              console.error(

                'El usuario se creó, pero no se pudo asignar el rol:',

                error

              );



              alertaAdvertencia('Asignación de rol pendiente', 'El usuario fue creado, pero no se pudo confirmar ' +

                'la asignación del rol Administrador. No vuelvas a ' +

                'registrarlo; verifica el usuario y su rol en el backend.')



              this.listarAdministradores();

            }

          });

        },



        error: error => {

          console.error(

            'Error al registrar el administrador:',

            error

          );



          alertaError('No se pudo registrar el administrador', this.obtenerMensajeError(error))

        }

      });

    });

  }



  // ==========================================

  // FILTRO DE PERIODO DEL DASHBOARD

  // ==========================================



  fechaInicioSeleccionada = '';

  fechaFinSeleccionada = '';



  fechaInicioAplicada: string | null = null;

  fechaFinAplicada: string | null = null;



  // Usuarios incluidos en el periodo consultado.

  get usuariosParaAnalisis(): Usuario[] {

    if (!this.fechaInicioAplicada && !this.fechaFinAplicada) {

      return this.usuariosDisponibles;

    }



    return this.usuariosDisponibles.filter((usuario) => {

      if (!usuario.fecha_ingreso) return false;



      const fecha = String(usuario.fecha_ingreso).slice(0, 10);



      if (this.fechaInicioAplicada && fecha < this.fechaInicioAplicada) {

        return false;

      }



      if (this.fechaFinAplicada && fecha > this.fechaFinAplicada) {

        return false;

      }



      return true;

    });

  }



  // Aplicar búsqueda del periodo.

  aplicarFiltroPeriodo(): void {



    const inicio = this.fechaInicioSeleccionada;

    const fin = this.fechaFinSeleccionada;



    if (!inicio && !fin) {

      this.fechaInicioAplicada = null;

      this.fechaFinAplicada = null;

      this.cdr.detectChanges();

      return;

    }



    if (!inicio || !fin) {

      alertaAdvertencia('Periodo incompleto', 'Selecciona la fecha inicial y la fecha final.')

      return;

    }



    if (inicio > fin) {

      alertaAdvertencia('Fechas incorrectas', 'La fecha inicial no puede ser posterior a la fecha final.')

      return;

    }



    this.fechaInicioAplicada = inicio;

    this.fechaFinAplicada = fin;



    this.cdr.detectChanges();

  }



  editarAdministrador(usuario: Usuario): void {

    Swal.fire({

      title: 'Editar administrador',

      html: `

      <input id="nombres" class="swal2-input"

        placeholder="Nombres"

        value="${this.escaparHtml(usuario.nombres ?? '')}">



      <input id="apellidos" class="swal2-input"

        placeholder="Apellidos"

        value="${this.escaparHtml(usuario.apellidos ?? '')}">



      <input id="correo" type="email" class="swal2-input"

        placeholder="Correo electrónico"

        value="${this.escaparHtml(usuario.correo ?? '')}">



      <input id="telefono" class="swal2-input"

        placeholder="Teléfono"

        value="${this.escaparHtml(usuario.telefono ?? '')}">



      <label for="estado">Estado</label>

      <select id="estado" class="swal2-select">

        <option

          value="true"

          ${this.esActivo(usuario.estado) ? 'selected' : ''}

        >

          Activo

        </option>

        <option

          value="false"

          ${!this.esActivo(usuario.estado) ? 'selected' : ''}

        >

          Inactivo

        </option>

      </select>

    `,

      showCancelButton: true,

      confirmButtonText: 'Guardar cambios',

      cancelButtonText: 'Cancelar',

      confirmButtonColor: '#3B5BDB',

      focusConfirm: false,



      preConfirm: () => {

        const popup = Swal.getPopup();



        const nombres = (

          popup?.querySelector('#nombres') as HTMLInputElement

        ).value.trim();



        const apellidos = (

          popup?.querySelector('#apellidos') as HTMLInputElement

        ).value.trim();



        const correo = (

          popup?.querySelector('#correo') as HTMLInputElement

        ).value.trim();



        const telefono = (

          popup?.querySelector('#telefono') as HTMLInputElement

        ).value.trim();



        const estado = (

          popup?.querySelector('#estado') as HTMLSelectElement

        ).value;



        if (!nombres || !apellidos || !correo) {

          Swal.showValidationMessage(

            'Nombres, apellidos y correo son obligatorios.'

          );

          return;

        }



        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {

          Swal.showValidationMessage(

            'Ingresa un correo electrónico válido.'

          );

          return;

        }



        return {

          nombres,

          apellidos,

          correo,

          telefono: telefono || null,

          estado: estado === 'true'

        };

      }

    }).then(resultado => {

      if (!resultado.isConfirmed || !resultado.value) {

        return;

      }



      this.http.patch(

        `${this.apiUrl}/usuarios/${usuario.id_usuario}/`,

        resultado.value

      ).subscribe({

        next: () => {

          alertaExito('Administrador actualizado', 'Los cambios se guardaron correctamente.')



          this.listarAdministradores();

        },

        error: error => {

          console.error(

            'Error al editar el administrador:',

            error

          );



          alertaError('No se pudieron guardar los cambios', this.obtenerMensajeError(error))

        }

      });

    });

  }



  // ==========================================

  // ASIGNAR ROL ADMINISTRADOR

  // ==========================================



  asignarAdministrador(): void {

    const rolAdministrador = this.obtenerRolAdministrador();



    if (!rolAdministrador) {

      alertaError('Rol no encontrado', 'No se encontró el rol Administrador en el sistema.')

      return;

    }



    // Obtener usuarios que todavía no sean administradores.

    const usuariosElegibles = this.usuariosDisponibles

      .filter(

        (usuario) =>

          !this.esRolAdministrador(usuario) &&

          !this.esRolSuperadministrador(usuario)

      )

      .sort((a, b) =>

        `${a.nombres} ${a.apellidos}`.localeCompare(

          `${b.nombres} ${b.apellidos}`

        )

      );



    if (usuariosElegibles.length === 0) {

      alertaAdvertencia('No hay usuarios disponibles', 'No se encontraron usuarios a los que se pueda asignar este rol.')

      return;

    }



    // Obtener únicamente las sedes activas.

    const sedesActivas = this.sedes.filter(

      (sede) => this.esActivo(sede.estado)

    );



    if (sedesActivas.length === 0) {

      alertaAdvertencia('No hay sedes activas', 'Registra o activa una sede antes de asignar un administrador.')

      return;

    }



    // Preparar las opciones de usuarios.

    const opcionesUsuarios: Record<string, string> = {};



    usuariosElegibles.forEach((usuario) => {

      opcionesUsuarios[String(usuario.id_usuario)] =

        `${usuario.nombres} ${usuario.apellidos} — ${usuario.correo}`;

    });



    // Primer paso: seleccionar el usuario.

    Swal.fire({

      title: 'Asignar administrador',

      text: 'Selecciona el usuario que recibirá este rol.',

      input: 'select',

      inputOptions: opcionesUsuarios,

      inputPlaceholder: 'Selecciona un usuario',

      showCancelButton: true,

      confirmButtonText: 'Continuar',

      cancelButtonText: 'Cancelar',

      confirmButtonColor: '#3B5BDB',

      inputValidator: (valor) => {

        if (!valor) {

          return 'Debes seleccionar un usuario.';

        }



        return null;

      },

    }).then((resultadoUsuario) => {

      if (!resultadoUsuario.isConfirmed || !resultadoUsuario.value) {

        return;

      }



      const idUsuario = Number(resultadoUsuario.value);



      const usuarioSeleccionado = usuariosElegibles.find(

        (usuario) => usuario.id_usuario === idUsuario

      );



      if (!usuarioSeleccionado) {

        return;

      }



      // Segundo paso: seleccionar la sede.

      const opcionesSedes: Record<string, string> = {};



      sedesActivas.forEach((sede) => {

        opcionesSedes[String(sede.id_sede)] = sede.nombre;

      });



      Swal.fire({

        title: 'Seleccionar sede',

        text:

          `Selecciona la sede que administrará ` +

          `${usuarioSeleccionado.nombres} ${usuarioSeleccionado.apellidos}.`,

        input: 'select',

        inputOptions: opcionesSedes,

        inputPlaceholder: 'Selecciona una sede activa',

        showCancelButton: true,

        confirmButtonText: 'Continuar',

        cancelButtonText: 'Cancelar',

        confirmButtonColor: '#3B5BDB',

        inputValidator: (valor) => {

          if (!valor) {

            return 'Debes seleccionar una sede.';

          }



          return null;

        },

      }).then((resultadoSede) => {

        if (!resultadoSede.isConfirmed || !resultadoSede.value) {

          return;

        }



        const idSede = Number(resultadoSede.value);



        const sedeSeleccionada = sedesActivas.find(

          (sede) => sede.id_sede === idSede

        );



        if (!sedeSeleccionada) {

          alertaError('Sede no válida', 'No se encontró la sede seleccionada entre las sedes activas.')

          return;

        }



        // Tercer paso: confirmar usuario, rol y sede.

        mostrarAlerta({
          titulo: '¿Confirmar asignación?',
          mensaje: `Se asignará el rol Administrador a ` +

            `${usuarioSeleccionado.nombres} ${usuarioSeleccionado.apellidos} ` +

            `para la sede ${sedeSeleccionada.nombre}.`,
          tono: 'azul',
          confirmar: 'Sí, asignar',
          cancelar: 'Cancelar'
        }).then((confirmacion) => {

          if (!confirmacion.isConfirmed) {

            return;

          }



          // Cuarto paso: actualizar el rol y la sede en un solo PATCH.

          this.http

            .patch(

              `${this.apiUrl}/usuarios/${idUsuario}/`,

              {

                id_rol: rolAdministrador.id_rol,

                id_sede: idSede,

              }

            )

            .subscribe({

              next: () => {

                alertaExito('Administrador asignado', `${usuarioSeleccionado.nombres} ` +

                  `${usuarioSeleccionado.apellidos} ahora tiene el rol ` +

                  `Administrador en la sede ${sedeSeleccionada.nombre}.`)



                this.listarAdministradores();

                this.listarSedes();

              },

              error: (error) => {

                console.error(

                  'Error al asignar el rol y la sede:',

                  error

                );



                alertaError('No se pudo completar la asignación', this.obtenerMensajeError(error))

              },

            });

        });

      });

    });

  }



  cambiarEstadoAdministrador(

    usuario: Usuario,

    nuevoEstado: string

  ): void {



    const estadoAnterior = usuario.estado;

    const estadoNuevo = nuevoEstado === 'true';



    if (this.esActivo(estadoAnterior) === estadoNuevo) {

      return;

    }



    this.actualizandoEstados.add(usuario.id_usuario);

    this.cdr.detectChanges();



    this.http.patch(

      `${this.apiUrl}/usuarios/${usuario.id_usuario}/`,

      {

        estado: estadoNuevo

      }

    ).subscribe({



      next: () => {



        usuario.estado = estadoNuevo;



        this.actualizandoEstados.delete(usuario.id_usuario);



        this.cdr.detectChanges();



        alertaExito('Estado actualizado correctamente')



      },



      error: (error) => {



        console.error(

          'Error al actualizar el estado:',

          error

        );



        usuario.estado = estadoAnterior;



        this.actualizandoEstados.delete(usuario.id_usuario);



        this.cdr.detectChanges();



        alertaError('No se pudo actualizar el estado', this.obtenerMensajeError(error))



      }



    });



  }



  cambiarSedeAdministrador(

    usuario: Usuario,

    nuevaSede: string

  ): void {



    const sedeAnterior = usuario.id_sede ?? null;

    const idSedeNuevo = Number(nuevaSede);



    if (!nuevaSede || sedeAnterior === idSedeNuevo) {

      return;

    }



    const sedeSeleccionada = this.sedes.find(

      sede => sede.id_sede === idSedeNuevo

    );



    if (!sedeSeleccionada || !this.esActivo(sedeSeleccionada.estado)) {

      alertaAdvertencia('Sede no disponible', 'Solo puedes asignar sedes activas.')

      return;

    }



    this.actualizandoSedes.add(usuario.id_usuario);

    this.cdr.detectChanges();



    this.http.patch(

      `${this.apiUrl}/usuarios/${usuario.id_usuario}/`,

      {

        id_sede: idSedeNuevo

      }

    ).subscribe({



      next: () => {



        usuario.id_sede = idSedeNuevo;



        this.actualizandoSedes.delete(usuario.id_usuario);

        this.cdr.detectChanges();



        alertaExito('Sede actualizada correctamente')



      },



      error: (error) => {



        console.error('Error al actualizar la sede:', error);



        usuario.id_sede = sedeAnterior;



        this.actualizandoSedes.delete(usuario.id_usuario);

        this.cdr.detectChanges();



        alertaError('No se pudo actualizar la sede', this.obtenerMensajeError(error))



      }



    });

  }



  async asignarSedeAdministrador(usuario: Usuario): Promise<void> {

    const sedesActivas = this.sedes.filter(

      (sede) => this.esActivo(sede.estado)

    );



    if (sedesActivas.length === 0) {

      await alertaAdvertencia('Sin sedes disponibles', 'No hay sedes activas para asignar.')

      return;

    }



    const opcionesSedes: Record<string, string> = {};



    sedesActivas.forEach((sede) => {

      opcionesSedes[String(sede.id_sede)] = sede.nombre;

    });



    const resultado = await Swal.fire({

      title: 'Asignar sede',

      text: `Selecciona la sede para ${usuario.nombres} ${usuario.apellidos}.`,

      input: 'select',

      inputOptions: opcionesSedes,

      inputValue: usuario.id_sede

        ? String(usuario.id_sede)

        : '',

      inputPlaceholder: 'Selecciona una sede',

      showCancelButton: true,

      confirmButtonText: 'Guardar',

      cancelButtonText: 'Cancelar',

      confirmButtonColor: '#3B5BDB',

      inputValidator: (valor) => {

        if (!valor) {

          return 'Debes seleccionar una sede.';

        }

        return null;

      },

    });



    if (!resultado.isConfirmed || !resultado.value) {

      return;

    }



    const idSede = Number(resultado.value);



    this.http

      .patch(

        `${this.apiUrl}/usuarios/${usuario.id_usuario}/`,

        { id_sede: idSede }

      )

      .subscribe({

        next: async () => {

          await alertaExito('Sede actualizada', 'La sede del administrador se actualizó correctamente.')



          this.listarAdministradores();

        },

        error: (error) => {

          alertaError('No se pudo actualizar', this.obtenerMensajeError(error))

        },

      });

  }



  nombreSede(idSede: number | null | undefined): string {

    if (idSede === null || idSede === undefined) {

      return 'Sin sede asignada';

    }



    const sede = this.sedes.find(

      (item) => item.id_sede === Number(idSede)

    );



    return sede?.nombre ?? 'Sede no encontrada';

  }



  nombreRol(usuario: Usuario): string {

    if (

      typeof usuario.id_rol === 'object' &&

      usuario.id_rol !== null

    ) {

      if (usuario.id_rol.nombre) {

        return usuario.id_rol.nombre;

      }



      const idRol = usuario.id_rol.id_rol;



      return (

        this.roles.find((rol) => rol.id_rol === idRol)?.nombre ??

        'Rol no identificado'

      );

    }



    return (

      this.roles.find((rol) => rol.id_rol === usuario.id_rol)?.nombre ??

      'Rol no identificado'

    );

  }



  private esRolAdministrador(usuario: Usuario): boolean {

    return (

      this.normalizarTexto(this.nombreRol(usuario)) === 'administrador'

    );

  }



  private esRolSuperadministrador(usuario: Usuario): boolean {

    return this.normalizarTexto(this.nombreRol(usuario))

      .includes('superadministrador');

  }



  private obtenerRolAdministrador(): Rol | undefined {

    return this.roles.find(

      (rol) => this.normalizarTexto(rol.nombre) === 'administrador'

    );

  }



  // ==========================================

  // UTILIDADES

  // ==========================================



  esActivo(estado: unknown): boolean {

    return (

      estado === true ||

      estado === 1 ||

      estado === '1' ||

      estado === 'true' ||

      estado === 'activo'

    );

  }



  private normalizarTexto(valor: string): string {

    return valor

      .normalize('NFD')

      .replace(/[\u0300-\u036f]/g, '')

      .trim()

      .toLowerCase();

  }



  private normalizarLista<T>(respuesta: any): T[] {

    if (Array.isArray(respuesta)) {

      return respuesta;

    }



    if (Array.isArray(respuesta?.results)) {

      return respuesta.results;

    }



    return [];

  }



  private obtenerMensajeError(error: any): string {

    const detalle =
      error?.error?.error ??
      error?.error?.detail;



    if (typeof detalle === 'string') {

      return detalle;

    }



    if (typeof error?.error === 'string') {

      return error.error;

    }



    return 'Verifica los datos enviados y la respuesta del servidor.';

  }



  private escaparHtml(valor: string): string {

    return valor.replace(/[&<>"']/g, (caracter) => {

      const entidades: Record<string, string> = {

        '&': '&amp;',

        '<': '&lt;',

        '>': '&gt;',

        '"': '&quot;',

        "'": '&#39;',

      };



      return entidades[caracter];

    });

  }

}