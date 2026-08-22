import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


/* =====================================================
   INTERFAZ CUIDADOR
===================================================== */

interface Cuidador {

  id: number;

  nombre: string;

  nid: string;

  telefono: string;

  email: string;

  nacimiento: string;

  especialidad: string;

  licencia: string;

  experiencia: number | null;

  institucion: string;

  turno: string;

  pacientes: number;

  estado: 'active' | 'off';

  dias: string[];

  disponible: boolean;

}


/* =====================================================
   FORMULARIO
===================================================== */

interface FormularioCuidador {

  nombre: string;

  nid: string;

  telefono: string;

  email: string;

  nacimiento: string;

  especialidad: string;

  licencia: string;

  experiencia: number | null;

  institucion: string;

}


/* =====================================================
   ARCHIVOS
===================================================== */

type TipoArchivo =
  | 'cedula'
  | 'tarjeta'
  | 'antecedentes'
  | 'hojaVida';


@Component({

  selector: 'app-cuidador',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './cuidadores.html',

  styleUrl: './cuidadores.css'

})


export class Cuidadores {


  /* =====================================================
     COLORES PARA AVATARES
  ===================================================== */

  readonly avatarPalette: string[] = [

    '#3B5BDB',
    '#4DABF7',
    '#7950F2',
    '#F03E3E',
    '#2F9E44',
    '#E67700',
    '#C2255C'

  ];


  /* =====================================================
     DATOS DE CUIDADORES
  ===================================================== */

  cuidadores: Cuidador[] = [

    {

      id: 1,

      nombre: 'Carlos Ruiz',

      nid: '1001234567',

      telefono: '300 123 4567',

      email: 'carlos.ruiz@email.com',

      nacimiento: '1988-05-12',

      especialidad: 'Aux. Enfermería',

      licencia: 'L-48592',

      experiencia: 8,

      institucion: 'Institución de Salud San José',

      turno: 'Mañana',

      pacientes: 12,

      estado: 'active',

      dias: [
        'Lunes',
        'Martes',
        'Miércoles',
        'Jueves',
        'Viernes'
      ],

      disponible: true

    },


    {

      id: 2,

      nombre: 'Martha Luz',

      nid: '1002345678',

      telefono: '301 234 5678',

      email: 'martha.luz@email.com',

      nacimiento: '1985-08-20',

      especialidad: 'Geriatría Especializada',

      licencia: 'L-31204',

      experiencia: 10,

      institucion: 'Centro Geriátrico Vida',

      turno: 'Tarde',

      pacientes: 8,

      estado: 'active',

      dias: [
        'Lunes',
        'Miércoles',
        'Viernes'
      ],

      disponible: false

    },


    {

      id: 3,

      nombre: 'Laura Paz',

      nid: '1003456789',

      telefono: '302 345 6789',

      email: 'laura.paz@email.com',

      nacimiento: '1990-03-15',

      especialidad: 'Fisioterapia',

      licencia: 'L-60091',

      experiencia: 6,

      institucion: 'Clínica San Rafael',

      turno: 'Mañana',

      pacientes: 10,

      estado: 'active',

      dias: [
        'Lunes',
        'Martes',
        'Jueves',
        'Viernes'
      ],

      disponible: true

    },


    {

      id: 4,

      nombre: 'Ana Reyes',

      nid: '1004567890',

      telefono: '303 456 7890',

      email: 'ana.reyes@email.com',

      nacimiento: '1982-11-02',

      especialidad: 'Cuidados Intensivos',

      licencia: 'L-55500',

      experiencia: 12,

      institucion: 'Hospital Universitario',

      turno: 'Noche',

      pacientes: 6,

      estado: 'off',

      dias: [
        'Sábado',
        'Domingo'
      ],

      disponible: false

    },


    {

      id: 5,

      nombre: 'Juan Vela',

      nid: '1005678901',

      telefono: '304 567 8901',

      email: 'juan.vela@email.com',

      nacimiento: '1987-07-25',

      especialidad: 'Aux. Enfermería',

      licencia: 'L-72100',

      experiencia: 9,

      institucion: 'Clínica San José',

      turno: 'Tarde',

      pacientes: 11,

      estado: 'active',

      dias: [
        'Lunes',
        'Martes',
        'Miércoles',
        'Jueves',
        'Viernes'
      ],

      disponible: true

    }

  ];


  nextId = 6;


  /* =====================================================
     FILTROS Y BÚSQUEDA
  ===================================================== */

  busquedaDocumento = '';

  filtroEstado = '';

  ordenNombre: 'asc' | 'desc' = 'asc';


  /* =====================================================
     CUIDADORES FILTRADOS
  ===================================================== */

  cuidadoresFiltrados: Cuidador[] = [];


  /* =====================================================
     DROPDOWN
  ===================================================== */

  activeDropdown: number | null = null;


  /* =====================================================
     MODAL
  ===================================================== */

  modalAbierto = false;

  modoModal: 'new' | 'edit' = 'new';

  editId: number | null = null;


  /* =====================================================
     MODAL DETALLE
  ===================================================== */

  detalleAbierto = false;

  cuidadorSeleccionado: Cuidador | null = null;


  /* =====================================================
     CONFIRMACIÓN
  ===================================================== */

  confirmAbierto = false;

  pendingDeleteId: number | null = null;


  /* =====================================================
     FORMULARIO
  ===================================================== */

  formulario: FormularioCuidador =
    this.formularioVacio();

  turnoSeleccionado = '';

  diasSeleccionados: string[] = [];

  guardando = false;

  errores: Record<string, boolean> = {};


  /* =====================================================
     ARCHIVOS
  ===================================================== */

  archivos: Record<TipoArchivo, File | null> = {

    cedula: null,

    tarjeta: null,

    antecedentes: null,

    hojaVida: null

  };


  /* =====================================================
     DÍAS
  ===================================================== */

  readonly dias: string[] = [

    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo'

  ];


  /* =====================================================
     TURNOS
  ===================================================== */

  readonly turnos = [

    {
      nombre: 'Mañana',
      horario: '06:00 – 14:00'
    },

    {
      nombre: 'Tarde',
      horario: '14:00 – 22:00'
    },

    {
      nombre: 'Noche',
      horario: '22:00 – 06:00'
    }

  ];


  /* =====================================================
     CONSTRUCTOR
  ===================================================== */

  constructor() {

    this.cuidadoresFiltrados =
      [...this.cuidadores];

    this.aplicarFiltros();

  }


  /* =====================================================
     FORMULARIO VACÍO
  ===================================================== */

  formularioVacio(): FormularioCuidador {

    return {

      nombre: '',

      nid: '',

      telefono: '',

      email: '',

      nacimiento: '',

      especialidad: '',

      licencia: '',

      experiencia: null,

      institucion: ''

    };

  }


  /* =====================================================
     ESTADÍSTICAS
  ===================================================== */

  get totalCuidadores(): number {

    return this.cuidadores.length;

  }


  get cuidadoresActivos(): number {

    return this.cuidadores.filter(

      cuidador =>
        cuidador.estado === 'active'

    ).length;

  }


  get cuidadoresFueraTurno(): number {

    return this.cuidadores.filter(

      cuidador =>
        cuidador.estado === 'off'

    ).length;

  }


  get cuidadoresDisponibles(): number {

    return this.cuidadores.filter(

      cuidador =>
        cuidador.estado === 'active' &&
        cuidador.disponible

    ).length;

  }


  /* =====================================================
     BÚSQUEDA POR DOCUMENTO
  ===================================================== */

  buscarCuidadores(): void {

    this.aplicarFiltros();

  }


  /* =====================================================
     FILTRAR POR ESTADO
  ===================================================== */

  filtrarCuidadores(): void {

    this.aplicarFiltros();

  }


  /* =====================================================
     ORDENAR
  ===================================================== */

  ordenarCuidadores(): void {

    this.aplicarFiltros();

  }


  /* =====================================================
     APLICAR FILTROS
  ===================================================== */

  private aplicarFiltros(): void {

    let resultado =
      [...this.cuidadores];


    /* =========================
       DOCUMENTO
    ========================= */

    const documento =
      this.busquedaDocumento
        .trim()
        .toLowerCase();


    if (documento) {

      resultado =
        resultado.filter(

          cuidador =>

            cuidador.nid
              .toLowerCase()
              .includes(documento)

        );

    }


    /* =========================
       ESTADO
    ========================= */

    if (this.filtroEstado) {

      resultado =
        resultado.filter(

          cuidador => {

            if (
              this.filtroEstado === 'active'
            ) {

              return cuidador.estado === 'active';

            }

            if (
              this.filtroEstado === 'inactive'
            ) {

              return cuidador.estado === 'off';

            }

            return true;

          }

        );

    }


    /* =========================
       ORDEN ALFABÉTICO
    ========================= */

    resultado.sort(

      (a, b) => {

        const nombreA =
          a.nombre.toLowerCase();

        const nombreB =
          b.nombre.toLowerCase();


        const comparacion =
          nombreA.localeCompare(
            nombreB,
            'es',
            {
              sensitivity: 'base'
            }
          );


        return this.ordenNombre === 'asc'

          ? comparacion

          : -comparacion;

      }

    );


    this.cuidadoresFiltrados =
      resultado;

  }


  /* =====================================================
     AVATARES
  ===================================================== */

  iniciales(nombre: string): string {

    if (!nombre?.trim()) {

      return '??';

    }


    return nombre

      .trim()

      .split(/\s+/)

      .map(
        palabra =>
          palabra.charAt(0)
      )

      .join('')

      .toUpperCase()

      .slice(0, 2);

  }


  avatarColor(id: number): string {

    const index =

      Math.abs(id - 1) %
      this.avatarPalette.length;


    return this.avatarPalette[index];

  }


  /* =====================================================
     VER DETALLE
  ===================================================== */

  verDetalle(
    cuidador: Cuidador
  ): void {

    this.cuidadorSeleccionado =
      cuidador;

    this.detalleAbierto = true;

  }


  /* =====================================================
     CERRAR DETALLE
  ===================================================== */

  cerrarDetalle(): void {

    this.detalleAbierto = false;

    this.cuidadorSeleccionado = null;

  }


  /* =====================================================
     CERRAR DETALLE POR OVERLAY
  ===================================================== */

  cerrarDetallePorOverlay(
    event: MouseEvent
  ): void {

    if (
      event.target ===
      event.currentTarget
    ) {

      this.cerrarDetalle();

    }

  }


  /* =====================================================
     DROPDOWN
  ===================================================== */

  toggleDropdown(
    event: MouseEvent,
    id: number
  ): void {

    event.stopPropagation();


    this.activeDropdown =

      this.activeDropdown === id

        ? null

        : id;

  }


  closeDropdown(): void {

    this.activeDropdown = null;

  }


  /* =====================================================
     ABRIR MODAL
  ===================================================== */

  openModal(

    mode: 'new' | 'edit',

    id?: number

  ): void {

    this.closeDropdown();

    this.clearForm();

    this.modoModal = mode;


    if (
      mode === 'edit' &&
      id !== undefined
    ) {


      const cuidador =

        this.cuidadores.find(

          item =>
            item.id === id

        );


      if (!cuidador) {

        return;

      }


      this.editId = id;


      this.formulario = {

        ...this.formulario,

        nombre:
          cuidador.nombre,

        nid:
          cuidador.nid,

        telefono:
          cuidador.telefono,

        email:
          cuidador.email,

        nacimiento:
          cuidador.nacimiento,

        especialidad:
          cuidador.especialidad,

        licencia:
          cuidador.licencia,

        experiencia:
          cuidador.experiencia,

        institucion:
          cuidador.institucion

      };


      this.turnoSeleccionado =
        cuidador.turno;


      this.diasSeleccionados =

        [...cuidador.dias];


    }

    else {

      this.editId = null;

    }


    this.modalAbierto = true;

  }


  /* =====================================================
     CERRAR MODAL
  ===================================================== */

  closeModal(): void {

    this.modalAbierto = false;

    this.clearForm();

  }


  cerrarModalPorOverlay(
    event: MouseEvent
  ): void {

    if (
      event.target ===
      event.currentTarget
    ) {

      this.closeModal();

    }

  }


  /* =====================================================
     LIMPIAR FORMULARIO
  ===================================================== */

  clearForm(): void {

    this.formulario =
      this.formularioVacio();


    this.turnoSeleccionado =
      '';


    this.diasSeleccionados =
      [];


    this.errores = {};


    this.guardando =
      false;


    this.archivos = {

      cedula: null,

      tarjeta: null,

      antecedentes: null,

      hojaVida: null

    };

  }


  /* =====================================================
     VALIDACIÓN
  ===================================================== */

  validateForm(): boolean {

    this.errores = {};


    let valido = true;


    const camposRequeridos:

      Array<
        keyof FormularioCuidador
      > = [

        'nombre',

        'nid',

        'telefono',

        'email',

        'especialidad',

        'licencia'

      ];


    camposRequeridos.forEach(

      campo => {

        const valor =
          this.formulario[campo];


        if (

          typeof valor !== 'string' ||

          !valor.trim()

        ) {

          this.errores[campo] =
            true;

          valido = false;

        }

      }

    );


    return valido;

  }


  tieneError(
    campo: string
  ): boolean {

    return this.errores[campo] === true;

  }


  /* =====================================================
     GUARDAR CUIDADOR
  ===================================================== */

  saveCaregiver(): void {

    if (this.guardando) {

      return;

    }


    if (!this.validateForm()) {

      return;

    }


    this.guardando = true;


    setTimeout(() => {


      const nombre =
        this.formulario.nombre.trim();


      const licencia =
        this.formulario.licencia.trim();


      const especialidad =

        this.formulario.especialidad
          .trim() ||

        'Sin especialidad';


      const turno =

        this.turnoSeleccionado ||

        'Mañana';


      const dias = [

        ...this.diasSeleccionados

      ];


      /* =========================
         EDITAR
      ========================= */

      if (
        this.editId !== null
      ) {


        const index =

          this.cuidadores.findIndex(

            cuidador =>

              cuidador.id ===
              this.editId

          );


        if (index !== -1) {


          this.cuidadores[index] = {

            ...this.cuidadores[index],

            nombre,

            nid:
              this.formulario.nid.trim(),

            telefono:
              this.formulario.telefono.trim(),

            email:
              this.formulario.email.trim(),

            nacimiento:
              this.formulario.nacimiento,

            especialidad,

            licencia,

            experiencia:
              this.formulario.experiencia,

            institucion:
              this.formulario.institucion.trim(),

            turno,

            dias

          };

        }

      }


      /* =========================
         NUEVO
      ========================= */

      else {


        const nuevoCuidador:
          Cuidador = {


          id:
            this.nextId++,


          nombre,


          nid:
            this.formulario.nid.trim(),


          telefono:
            this.formulario.telefono.trim(),


          email:
            this.formulario.email.trim(),


          nacimiento:
            this.formulario.nacimiento,


          especialidad,


          licencia,


          experiencia:
            this.formulario.experiencia,


          institucion:
            this.formulario.institucion.trim(),


          turno,


          pacientes: 0,


          estado: 'active',


          dias,


          disponible: true

        };


        this.cuidadores.push(

          nuevoCuidador

        );

      }


      this.aplicarFiltros();


      this.guardando = false;


      this.closeModal();


    }, 700);

  }


  /* =====================================================
     TURNOS
  ===================================================== */

  selectTurno(
    turno: string
  ): void {

    this.turnoSeleccionado =
      turno;

  }


  /* =====================================================
     DÍAS
  ===================================================== */

  toggleDay(
    dia: string
  ): void {


    if (
      this.diasSeleccionados
        .includes(dia)
    ) {


      this.diasSeleccionados =

        this.diasSeleccionados
          .filter(
            item =>
              item !== dia
          );


    }

    else {


      this.diasSeleccionados.push(
        dia
      );

    }

  }


  isDaySelected(
    dia: string
  ): boolean {

    return this.diasSeleccionados
      .includes(dia);

  }


  /* =====================================================
     ARCHIVOS
  ===================================================== */

  handleUpload(

    event: Event,

    tipo: TipoArchivo

  ): void {


    const input =

      event.target as
      HTMLInputElement;


    if (

      input.files &&

      input.files.length > 0

    ) {


      this.archivos[tipo] =
        input.files[0];

    }

  }


  archivoSeleccionado(
    tipo: TipoArchivo
  ): boolean {

    return this.archivos[tipo] !== null;

  }


  nombreArchivo(
    tipo: TipoArchivo
  ): string {

    return (

      this.archivos[tipo]?.name
      ?? ''

    );

  }


  /* =====================================================
     CAMBIAR ESTADO
  ===================================================== */

  toggleStatus(
    id: number
  ): void {


    const cuidador =

      this.cuidadores.find(

        item =>
          item.id === id

      );


    if (!cuidador) {

      return;

    }


    cuidador.estado =

      cuidador.estado === 'active'

        ? 'off'

        : 'active';


    /*
      Si pasa a inactivo,
      automáticamente deja de estar
      disponible para asignaciones.
    */

    if (
      cuidador.estado === 'off'
    ) {

      cuidador.disponible = false;

    }


    this.aplicarFiltros();


    this.closeDropdown();

  }


  /* =====================================================
     CAMBIAR DISPONIBILIDAD
  ===================================================== */

  toggleDisponibilidad(
    id: number
  ): void {


    const cuidador =

      this.cuidadores.find(

        item =>
          item.id === id

      );


    if (!cuidador) {

      return;

    }


    /*
      Un cuidador inactivo no puede
      quedar disponible.
    */

    if (
      cuidador.estado === 'off'
    ) {

      cuidador.disponible = false;

      return;

    }


    cuidador.disponible =
      !cuidador.disponible;


    this.aplicarFiltros();

  }


  /* =====================================================
     ELIMINAR
  ===================================================== */

  confirmDelete(
    id: number
  ): void {


    this.closeDropdown();


    this.pendingDeleteId =
      id;


    this.confirmAbierto =
      true;

  }


  closeConfirm(): void {

    this.confirmAbierto =
      false;


    this.pendingDeleteId =
      null;

  }


  deleteCaregiver(): void {


    if (
      this.pendingDeleteId ===
      null
    ) {

      return;

    }


    this.cuidadores =

      this.cuidadores.filter(

        cuidador =>

          cuidador.id !==
          this.pendingDeleteId

      );


    this.aplicarFiltros();


    this.closeConfirm();

  }


  nombrePendienteEliminar(): string {


    if (
      this.pendingDeleteId ===
      null
    ) {

      return '';

    }


    const cuidador =

      this.cuidadores.find(

        item =>

          item.id ===
          this.pendingDeleteId

      );


    return cuidador?.nombre ?? '';

  }


  /* =====================================================
     CANCELAR
  ===================================================== */

  cancelar(): void {

    this.closeModal();

  }

}