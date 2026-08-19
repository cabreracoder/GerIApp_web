import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Cuidador {
  id: number;
  nombre: string;
  especialidad: string;
  licencia: string;
  turno: string;
  pacientes: number;
  estado: 'active' | 'off';
  dias: string[];
}

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
      especialidad: 'Aux. Enfermería',
      licencia: 'L-48592',
      turno: 'Mañana',
      pacientes: 12,
      estado: 'active',
      dias: [
        'Lunes',
        'Martes',
        'Miércoles',
        'Jueves',
        'Viernes'
      ]
    },

    {
      id: 2,
      nombre: 'Martha Luz',
      especialidad: 'Geriatría Especializada',
      licencia: 'L-31204',
      turno: 'Tarde',
      pacientes: 8,
      estado: 'active',
      dias: [
        'Lunes',
        'Miércoles',
        'Viernes'
      ]
    },

    {
      id: 3,
      nombre: 'Laura Paz',
      especialidad: 'Fisioterapia',
      licencia: 'L-60091',
      turno: 'Mañana',
      pacientes: 10,
      estado: 'active',
      dias: [
        'Lunes',
        'Martes',
        'Jueves',
        'Viernes'
      ]
    },

    {
      id: 4,
      nombre: 'Ana Reyes',
      especialidad: 'Cuidados Intensivos',
      licencia: 'L-55500',
      turno: 'Noche',
      pacientes: 6,
      estado: 'off',
      dias: [
        'Sábado',
        'Domingo'
      ]
    },

    {
      id: 5,
      nombre: 'Juan Vela',
      especialidad: 'Aux. Enfermería',
      licencia: 'L-72100',
      turno: 'Tarde',
      pacientes: 11,
      estado: 'active',
      dias: [
        'Lunes',
        'Martes',
        'Miércoles',
        'Jueves',
        'Viernes'
      ]
    }

  ];

  nextId = 6;


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
     CONFIRMACIÓN
  ===================================================== */

  confirmAbierto = false;

  pendingDeleteId: number | null = null;


  /* =====================================================
     FORMULARIO
  ===================================================== */

  formulario: FormularioCuidador = this.formularioVacio();

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
      cuidador => cuidador.estado === 'active'
    ).length;

  }


  get cuidadoresFueraTurno(): number {

    return this.cuidadores.filter(
      cuidador => cuidador.estado === 'off'
    ).length;

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
      .map(palabra => palabra.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);

  }


  avatarColor(id: number): string {

    const index =
      Math.abs(id - 1) % this.avatarPalette.length;

    return this.avatarPalette[index];

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

    if (mode === 'edit' && id !== undefined) {

      const cuidador =
        this.cuidadores.find(
          item => item.id === id
        );

      if (!cuidador) {
        return;
      }

      this.editId = id;

      this.formulario = {
        ...this.formulario,
        nombre: cuidador.nombre,
        especialidad: cuidador.especialidad,
        licencia: cuidador.licencia
      };

      this.turnoSeleccionado =
        cuidador.turno;

      this.diasSeleccionados = [
        ...cuidador.dias
      ];

    } else {

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
      event.target === event.currentTarget
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

    this.turnoSeleccionado = '';

    this.diasSeleccionados = [];

    this.errores = {};

    this.guardando = false;

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
      Array<keyof FormularioCuidador> = [
        'nombre',
        'nid',
        'telefono',
        'email',
        'especialidad',
        'licencia'
      ];

    camposRequeridos.forEach(campo => {

      const valor =
        this.formulario[campo];

      if (
        typeof valor !== 'string' ||
        !valor.trim()
      ) {

        this.errores[campo] = true;

        valido = false;

      }

    });

    return valido;

  }


  tieneError(campo: string): boolean {

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
        this.formulario.especialidad.trim() ||
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

      if (this.editId !== null) {

        const index =
          this.cuidadores.findIndex(
            cuidador =>
              cuidador.id === this.editId
          );

        if (index !== -1) {

          this.cuidadores[index] = {
            ...this.cuidadores[index],
            nombre,
            especialidad,
            licencia,
            turno,
            dias
          };

        }

      }

      /* =========================
         NUEVO
      ========================= */

      else {

        const nuevoCuidador: Cuidador = {

          id: this.nextId++,

          nombre,

          especialidad,

          licencia,

          turno,

          pacientes: 0,

          estado: 'active',

          dias

        };

        this.cuidadores.push(
          nuevoCuidador
        );

      }

      this.guardando = false;

      this.closeModal();

    }, 700);

  }


  /* =====================================================
     TURNOS
  ===================================================== */

  selectTurno(turno: string): void {

    this.turnoSeleccionado = turno;

  }


  /* =====================================================
     DÍAS
  ===================================================== */

  toggleDay(dia: string): void {

    if (
      this.diasSeleccionados.includes(dia)
    ) {

      this.diasSeleccionados =
        this.diasSeleccionados.filter(
          item => item !== dia
        );

    } else {

      this.diasSeleccionados.push(dia);

    }

  }


  isDaySelected(
    dia: string
  ): boolean {

    return this.diasSeleccionados.includes(
      dia
    );

  }


  /* =====================================================
     ARCHIVOS
  ===================================================== */

  handleUpload(
    event: Event,
    tipo: TipoArchivo
  ): void {

    const input =
      event.target as HTMLInputElement;

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

    return this.archivos[tipo]?.name ?? '';

  }


  /* =====================================================
     CAMBIAR ESTADO
  ===================================================== */

  toggleStatus(id: number): void {

    const cuidador =
      this.cuidadores.find(
        item => item.id === id
      );

    if (!cuidador) {
      return;
    }

    cuidador.estado =
      cuidador.estado === 'active'
        ? 'off'
        : 'active';

    this.closeDropdown();

  }


  /* =====================================================
     ELIMINAR
  ===================================================== */

  confirmDelete(id: number): void {

    this.closeDropdown();

    this.pendingDeleteId = id;

    this.confirmAbierto = true;

  }


  closeConfirm(): void {

    this.confirmAbierto = false;

    this.pendingDeleteId = null;

  }


  deleteCaregiver(): void {

    if (
      this.pendingDeleteId === null
    ) {
      return;
    }

    this.cuidadores =
      this.cuidadores.filter(
        cuidador =>
          cuidador.id !==
          this.pendingDeleteId
      );

    this.closeConfirm();

  }


  nombrePendienteEliminar(): string {

    if (
      this.pendingDeleteId === null
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