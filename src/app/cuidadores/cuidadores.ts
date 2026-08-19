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

  /* ─────────────────────────────
     DATOS
  ───────────────────────────── */

  avatarPalette = [
    '#3B5BDB',
    '#4DABF7',
    '#7950F2',
    '#F03E3E',
    '#2F9E44',
    '#E67700',
    '#C2255C'
  ];

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


  /* ─────────────────────────────
     DROPDOWN
  ───────────────────────────── */

  activeDropdown: number | null = null;


  /* ─────────────────────────────
     MODAL
  ───────────────────────────── */

  modalAbierto = false;

  modoModal: 'new' | 'edit' = 'new';

  editId: number | null = null;


  /* ─────────────────────────────
     CONFIRMACIÓN
  ───────────────────────────── */

  confirmAbierto = false;

  pendingDeleteId: number | null = null;


  /* ─────────────────────────────
     FORMULARIO
  ───────────────────────────── */

  formulario: FormularioCuidador = this.formularioVacio();

  turnoSeleccionado = '';

  diasSeleccionados: string[] = [];

  guardando = false;

  errores: { [key: string]: boolean } = {};


  /* ─────────────────────────────
     ARCHIVOS
  ───────────────────────────── */

  archivos: {
    cedula: File | null;
    tarjeta: File | null;
    antecedentes: File | null;
    hojaVida: File | null;
  } = {
    cedula: null,
    tarjeta: null,
    antecedentes: null,
    hojaVida: null
  };


  /* ─────────────────────────────
     OPCIONES
  ───────────────────────────── */

  readonly dias = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo'
  ];

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


  /* ─────────────────────────────
     FORMULARIO VACÍO
  ───────────────────────────── */

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


  /* ─────────────────────────────
     ESTADÍSTICAS
  ───────────────────────────── */

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


  /* ─────────────────────────────
     HELPERS
  ───────────────────────────── */

  iniciales(nombre: string): string {

    return nombre
      .trim()
      .split(/\s+/)
      .map(palabra => palabra[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  avatarColor(id: number): string {

    return this.avatarPalette[
      (id - 1) % this.avatarPalette.length
    ];
  }


  /* ─────────────────────────────
     DROPDOWN
  ───────────────────────────── */

  toggleDropdown(
    event: MouseEvent,
    id: number
  ): void {

    event.stopPropagation();

    if (this.activeDropdown === id) {
      this.activeDropdown = null;
    } else {
      this.activeDropdown = id;
    }
  }

  closeDropdown(): void {
    this.activeDropdown = null;
  }


  /* ─────────────────────────────
     MODAL
  ───────────────────────────── */

  openModal(
    mode: 'new' | 'edit',
    id?: number
  ): void {

    this.closeDropdown();

    this.clearForm();

    this.modoModal = mode;

    if (mode === 'edit' && id !== undefined) {

      const cuidador = this.cuidadores.find(
        item => item.id === id
      );

      if (!cuidador) {
        return;
      }

      this.editId = id;

      this.formulario.nombre = cuidador.nombre;
      this.formulario.licencia = cuidador.licencia;
      this.formulario.especialidad = cuidador.especialidad;

      this.turnoSeleccionado = cuidador.turno;

      this.diasSeleccionados = [
        ...cuidador.dias
      ];

    } else {

      this.editId = null;

    }

    this.modalAbierto = true;
  }

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


  /* ─────────────────────────────
     LIMPIAR FORMULARIO
  ───────────────────────────── */

  clearForm(): void {

    this.formulario = this.formularioVacio();

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


  /* ─────────────────────────────
     VALIDACIÓN
  ───────────────────────────── */

  validateForm(): boolean {

    this.errores = {};

    let valido = true;

    const camposRequeridos = [
      'nombre',
      'nid',
      'telefono',
      'email',
      'especialidad',
      'licencia'
    ];

    camposRequeridos.forEach(campo => {

      const valor =
        this.formulario[
          campo as keyof FormularioCuidador
        ];

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


  /* ─────────────────────────────
     GUARDAR
  ───────────────────────────── */

  saveCaregiver(): void {

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
        this.formulario.especialidad ||
        'Sin especialidad';

      const turno =
        this.turnoSeleccionado ||
        'Mañana';

      const dias = [
        ...this.diasSeleccionados
      ];

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

      } else {

        this.cuidadores.push({

          id: this.nextId++,

          nombre,

          especialidad,

          licencia,

          turno,

          pacientes: 0,

          estado: 'active',

          dias

        });
      }

      this.guardando = false;

      setTimeout(() => {

        this.closeModal();

      }, 1500);

    }, 1200);
  }


  /* ─────────────────────────────
     TURNO
  ───────────────────────────── */

  selectTurno(turno: string): void {

    this.turnoSeleccionado = turno;
  }


  /* ─────────────────────────────
     DÍAS
  ───────────────────────────── */

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

  isDaySelected(dia: string): boolean {

    return this.diasSeleccionados.includes(
      dia
    );
  }


  /* ─────────────────────────────
     ARCHIVOS
  ───────────────────────────── */

  handleUpload(
    event: Event,
    tipo:
      | 'cedula'
      | 'tarjeta'
      | 'antecedentes'
      | 'hojaVida'
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
    tipo:
      | 'cedula'
      | 'tarjeta'
      | 'antecedentes'
      | 'hojaVida'
  ): boolean {

    return this.archivos[tipo] !== null;
  }

  nombreArchivo(
    tipo:
      | 'cedula'
      | 'tarjeta'
      | 'antecedentes'
      | 'hojaVida'
  ): string {

    return this.archivos[tipo]?.name || '';
  }


  /* ─────────────────────────────
     ESTADO
  ───────────────────────────── */

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


  /* ─────────────────────────────
     ELIMINAR
  ───────────────────────────── */

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

    if (this.pendingDeleteId === null) {
      return;
    }

    this.cuidadores =
      this.cuidadores.filter(
        cuidador =>
          cuidador.id !== this.pendingDeleteId
      );

    this.closeConfirm();
  }

  nombrePendienteEliminar(): string {

    const cuidador =
      this.cuidadores.find(
        item =>
          item.id === this.pendingDeleteId
      );

    return cuidador
      ? cuidador.nombre
      : '';
  }


  /* ─────────────────────────────
     CANCELAR
  ───────────────────────────── */

  cancelar(): void {
    this.closeModal();
  }
}