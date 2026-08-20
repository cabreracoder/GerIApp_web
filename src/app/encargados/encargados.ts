import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Encargado {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  fechaIngreso: string;
  ingresoTexto: string;
  cargo: string;
  area: string;
  descripcion: string;
  estado: 'Activo' | 'Inactivo';
  iniciales: string;
}

interface FormularioEncargado {
  nombre: string;
  fechaIngreso: string;
  telefono: string;
  email: string;
  cargo: string;
  area: string;
  descripcion: string;
}

interface ErroresFormulario {
  nombre: boolean;
  telefono: boolean;
  email: boolean;
  cargo: boolean;
  area: boolean;
}

@Component({
  selector: 'app-encargados',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './encargados.html',
  styleUrl: './encargados.css'
})
export class Encargados {

  private cdr = inject(ChangeDetectorRef);

  // =========================================================
  // ENCARGADO PRINCIPAL
  // =========================================================

  encargadoPrincipal: Encargado = {
    id: 1,
    nombre: 'María Rodríguez',
    email: 'm.rodriguez@fundacion.org',
    telefono: '+57 300 555 0001',
    fechaIngreso: '2018-03-01',
    ingresoTexto: 'Desde marzo 2018',
    cargo: 'Director General',
    area: 'Dirección',
    descripcion:
      'Responsable de la gestión integral de la fundación, supervisión de todas las áreas operativas y representación legal ante entidades externas.',
    estado: 'Activo',
    iniciales: 'MR'
  };

  // =========================================================
  // OTROS ENCARGADOS
  // =========================================================

  encargados: Encargado[] = [
    {
      id: 2,
      nombre: 'Carlos Méndez',
      email: 'c.mendez@fundacion.org',
      telefono: '+57 300 555 0002',
      fechaIngreso: '2020-06-15',
      ingresoTexto: 'Desde junio 2020',
      cargo: 'Subdirector',
      area: 'Dirección',
      descripcion:
        'Apoyo a la dirección general y coordinación de las actividades administrativas.',
      estado: 'Activo',
      iniciales: 'CM'
    },
    {
      id: 3,
      nombre: 'Laura Gómez',
      email: 'l.gomez@fundacion.org',
      telefono: '+57 300 555 0003',
      fechaIngreso: '2021-02-10',
      ingresoTexto: 'Desde febrero 2021',
      cargo: 'Coordinador Administrativo',
      area: 'Administración',
      descripcion:
        'Responsable de los procesos administrativos y documentación institucional.',
      estado: 'Activo',
      iniciales: 'LG'
    },
    {
      id: 4,
      nombre: 'Ana López',
      email: 'a.lopez@fundacion.org',
      telefono: '+57 300 555 0004',
      fechaIngreso: '2022-08-20',
      ingresoTexto: 'Desde agosto 2022',
      cargo: 'Coordinador Operativo',
      area: 'Operaciones',
      descripcion:
        'Coordinación de las operaciones diarias de la Fundación Geriátrica.',
      estado: 'Activo',
      iniciales: 'AL'
    }
  ];

  // =========================================================
  // LISTA FILTRADA
  // =========================================================

  encargadosFiltrados: Encargado[] = [...this.encargados];

  // =========================================================
  // BÚSQUEDA
  // =========================================================

  busqueda = '';

  // =========================================================
  // MODAL
  // =========================================================

  modalAbierto = false;
  modoEdicion = false;
  editarPrincipal = false;
  idEditando: number | null = null;

  // =========================================================
  // ESTADO
  // =========================================================

  guardando = false;

  // =========================================================
  // FORMULARIO
  // =========================================================

  formulario: FormularioEncargado = this.formularioInicial();

  // =========================================================
  // ERRORES
  // =========================================================

  errores: ErroresFormulario = {
    nombre: false,
    telefono: false,
    email: false,
    cargo: false,
    area: false
  };

  // =========================================================
  // TOAST
  // =========================================================

  toast: {
    mostrar: boolean;
    mensaje: string;
    tipo: 'ok' | 'del' | 'info';
  } = {
    mostrar: false,
    mensaje: '',
    tipo: 'ok'
  };

  // =========================================================
  // FORMULARIO INICIAL
  // =========================================================

  formularioInicial(): FormularioEncargado {
    return {
      nombre: '',
      fechaIngreso: '',
      telefono: '',
      email: '',
      cargo: '',
      area: '',
      descripcion: ''
    };
  }

  // =========================================================
  // ABRIR MODAL
  // =========================================================

  openModal(
    modo: 'new' | 'editPrincipal' | 'edit',
    encargado?: Encargado
  ): void {
    this.modalAbierto = true;
    this.modoEdicion = modo !== 'new';
    this.editarPrincipal = modo === 'editPrincipal';
    this.idEditando = null;

    this.limpiarErrores();

    if (modo === 'new') {
      this.formulario = this.formularioInicial();
      return;
    }

    if (modo === 'editPrincipal') {
      this.formulario = {
        nombre: this.encargadoPrincipal.nombre,
        fechaIngreso: this.encargadoPrincipal.fechaIngreso,
        telefono: this.encargadoPrincipal.telefono,
        email: this.encargadoPrincipal.email,
        cargo: this.encargadoPrincipal.cargo,
        area: this.encargadoPrincipal.area,
        descripcion: this.encargadoPrincipal.descripcion
      };
      return;
    }

    if (modo === 'edit' && encargado) {
      this.idEditando = encargado.id;
      this.formulario = {
        nombre: encargado.nombre,
        fechaIngreso: encargado.fechaIngreso,
        telefono: encargado.telefono,
        email: encargado.email,
        cargo: encargado.cargo,
        area: encargado.area,
        descripcion: encargado.descripcion
      };
    }
  }

  // =========================================================
  // CERRAR MODAL
  // =========================================================

  closeModal(): void {
    if (this.guardando) {
      return;
    }

    this.modalAbierto = false;
    this.limpiarErrores();
    this.formulario = this.formularioInicial();
    this.modoEdicion = false;
    this.editarPrincipal = false;
    this.idEditando = null;
  }

  // =========================================================
  // CERRAR AL HACER CLICK EN FONDO
  // =========================================================

  cerrarAlClickarFondo(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  // =========================================================
  // VALIDAR
  // =========================================================

  validarFormulario(): boolean {
    this.limpiarErrores();
    let valido = true;

    if (!this.formulario.nombre.trim()) {
      this.errores.nombre = true;
      valido = false;
    }

    if (!this.formulario.telefono.trim()) {
      this.errores.telefono = true;
      valido = false;
    }

    if (!this.formulario.email.trim()) {
      this.errores.email = true;
      valido = false;
    }

    if (!this.formulario.cargo) {
      this.errores.cargo = true;
      valido = false;
    }

    if (!this.formulario.area) {
      this.errores.area = true;
      valido = false;
    }

    return valido;
  }

  // =========================================================
  // LIMPIAR ERRORES
  // =========================================================

  limpiarErrores(): void {
    this.errores = {
      nombre: false,
      telefono: false,
      email: false,
      cargo: false,
      area: false
    };
  }

  // =========================================================
  // GUARDAR
  // =========================================================

  saveEncargado(): void {
    if (this.guardando) {
      return;
    }

    if (!this.validarFormulario()) {
      this.mostrarToast(
        'Completa los campos obligatorios.',
        'info'
      );
      return;
    }

    this.guardando = true;

    setTimeout(() => {
      // EDITAR PRINCIPAL
      if (this.editarPrincipal) {
        this.encargadoPrincipal = {
          ...this.encargadoPrincipal,
          nombre: this.formulario.nombre.trim(),
          fechaIngreso: this.formulario.fechaIngreso,
          telefono: this.formulario.telefono.trim(),
          email: this.formulario.email.trim(),
          cargo: this.formulario.cargo,
          area: this.formulario.area,
          descripcion: this.formulario.descripcion.trim(),
          iniciales: this.generarIniciales(this.formulario.nombre),
          ingresoTexto: this.formatearFechaIngreso(this.formulario.fechaIngreso)
        };

        this.guardando = false;
        this.closeModal();
        this.mostrarToast(
          'Encargado principal actualizado correctamente.',
          'ok'
        );
        this.cdr.detectChanges();
        return;
      }

      // EDITAR OTRO
      if (this.idEditando !== null) {
        const indice = this.encargados.findIndex(
          item => item.id === this.idEditando
        );

        if (indice !== -1) {
          const anterior = this.encargados[indice];

          this.encargados[indice] = {
            ...anterior,
            nombre: this.formulario.nombre.trim(),
            fechaIngreso: this.formulario.fechaIngreso,
            telefono: this.formulario.telefono.trim(),
            email: this.formulario.email.trim(),
            cargo: this.formulario.cargo,
            area: this.formulario.area,
            descripcion: this.formulario.descripcion.trim(),
            iniciales: this.generarIniciales(this.formulario.nombre),
            ingresoTexto: this.formatearFechaIngreso(this.formulario.fechaIngreso)
          };

          this.encargados = [...this.encargados];
          this.filtrarEncargados();
        }

        this.guardando = false;
        this.closeModal();
        this.mostrarToast(
          'Encargado actualizado correctamente.',
          'ok'
        );
        this.cdr.detectChanges();
        return;
      }

      // NUEVO ENCARGADO
      const nuevoEncargado: Encargado = {
        id: this.obtenerNuevoId(),
        nombre: this.formulario.nombre.trim(),
        email: this.formulario.email.trim(),
        telefono: this.formulario.telefono.trim(),
        fechaIngreso: this.formulario.fechaIngreso,
        ingresoTexto: this.formatearFechaIngreso(this.formulario.fechaIngreso),
        cargo: this.formulario.cargo,
        area: this.formulario.area,
        descripcion: this.formulario.descripcion.trim(),
        estado: 'Activo',
        iniciales: this.generarIniciales(this.formulario.nombre)
      };

      this.encargados = [...this.encargados, nuevoEncargado];
      this.filtrarEncargados();

      this.guardando = false;
      this.closeModal();
      this.mostrarToast(
        'Encargado creado correctamente.',
        'ok'
      );
      this.cdr.detectChanges();

    }, 700);
  }

  // =========================================================
  // NUEVO ID
  // =========================================================

  obtenerNuevoId(): number {
    if (this.encargados.length === 0) {
      return 1;
    }

    return Math.max(
      ...this.encargados.map(
        item => item.id
      )
    ) + 1;
  }

  // =========================================================
  // INICIALES
  // =========================================================

  generarIniciales(nombre: string): string {
    const partes = nombre
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (partes.length === 0) {
      return 'NA';
    }

    if (partes.length === 1) {
      return partes[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      partes[0][0] +
      partes[partes.length - 1][0]
    ).toUpperCase();
  }

  // =========================================================
  // FECHA
  // =========================================================

  formatearFechaIngreso(fecha: string): string {
    if (!fecha) {
      return 'Fecha no registrada';
    }

    const fechaObj = new Date(`${fecha}T00:00:00`);

    if (Number.isNaN(fechaObj.getTime())) {
      return 'Fecha no registrada';
    }

    const meses = [
      'enero', 'febrero', 'marzo', 'abril',
      'mayo', 'junio', 'julio', 'agosto',
      'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    return `Desde ${meses[fechaObj.getMonth()]} ${fechaObj.getFullYear()}`;
  }

  // =========================================================
  // CAMBIAR ESTADO
  // =========================================================

  cambiarEstado(encargado: Encargado): void {
    encargado.estado =
      encargado.estado === 'Activo'
        ? 'Inactivo'
        : 'Activo';

    this.encargados = [...this.encargados];
    this.filtrarEncargados();

    this.mostrarToast(
      encargado.estado === 'Activo'
        ? 'Encargado activado.'
        : 'Encargado desactivado.',
      'info'
    );
  }

  // =========================================================
  // ELIMINAR
  // =========================================================

  eliminarEncargado(id: number): void {
    const confirmar = window.confirm(
      '¿Está seguro de eliminar este encargado?'
    );

    if (!confirmar) {
      return;
    }

    this.encargados = this.encargados.filter(
      item => item.id !== id
    );

    this.filtrarEncargados();

    this.mostrarToast(
      'Encargado eliminado correctamente.',
      'del'
    );
  }

  // =========================================================
  // FILTRAR
  // =========================================================

  filtrarEncargados(): void {
    const termino = this.busqueda
      .trim()
      .toLowerCase();

    if (!termino) {
      this.encargadosFiltrados = [...this.encargados];
      return;
    }

    this.encargadosFiltrados = this.encargados.filter(
      encargado =>
        encargado.nombre.toLowerCase().includes(termino) ||
        encargado.email.toLowerCase().includes(termino) ||
        encargado.cargo.toLowerCase().includes(termino) ||
        encargado.area.toLowerCase().includes(termino) ||
        encargado.telefono.toLowerCase().includes(termino)
    );
  }

  // =========================================================
  // TOAST
  // =========================================================

  mostrarToast(
    mensaje: string,
    tipo: 'ok' | 'del' | 'info'
  ): void {
    this.toast = {
      mostrar: true,
      mensaje,
      tipo
    };

    this.cdr.detectChanges();

    setTimeout(() => {
      this.toast.mostrar = false;
      this.cdr.detectChanges();
    }, 3000);
  }
}