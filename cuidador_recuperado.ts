import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

export interface ITurno {
  nombre: string;
  horario: string;
}

export interface ICuidador {
  id?: number;
  id_usuario?: number;
  nombre?: string;
  nombres?: string;
  apellido?: string;
  apellidos?: string;
  nombreCompleto?: string;
  correo?: string;
  tipoDocumento?: string;
  tipo_documento?: string;
  numeroDocumento?: string;
  numero_documento?: string;
  documento?: string;
  telefono?: string;
  fechaNacimiento?: string;
  edad?: number;
  especialidad?: string;
  licencia?: string;
  experiencia?: number;
  institucion?: string;
  turno?: string;
  pacientes?: number;
  estado?: 'activo' | 'inactivo' | boolean;
  disponible?: boolean;
  diasDisponibles?: string[];
  archivos?: { [clave: string]: File | string };
  id_rol?: number | any;
}

export interface ErroresFormulario {
  nombre?: boolean;
  apellido?: boolean;
  tipoDocumento?: boolean;
  numeroDocumento?: boolean;
  telefono?: boolean;
  correo?: boolean;
  especialidad?: boolean;
  licencia?: boolean;
}

@Component({
  selector: 'app-cuidadores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cuidadores.html',
  styleUrl: './cuidadores.css',
})
export class Cuidadores implements OnInit {
  openModal(arg0: string) {
    throw new Error('Method not implemented.');
  }
  private cdr = inject(ChangeDetectorRef);
  private http = inject(HttpClient);

  // Endpoint de Render
  private apiUrl = 'https://geriapp-web-1.onrender.com/api/usuarios/';

  cuidadores: ICuidador[] = [];
  cuidadoresFiltrados: ICuidador[] = [];

  // Variables enlazadas al HTML para Filtros y Búsqueda
  textoBusqueda = '';
  ordenNombre: 'asc' | 'desc' = 'asc';

  // Métricas para tarjetas de estadísticas
  totalCuidadores = 0;
  cuidadoresActivos = 0;
  cuidadoresDisponibles = 0;

  // Control de Modales
  formularioAbierto = false;
  detalleAbierto = false;
  confirmacionAbierta = false;

  modoFormulario: 'crear' | 'editar' = 'crear';
  idEditando: number | null = null;
  idEliminando: number | null = null;

  cuidadorSeleccionado: ICuidador | null = null;
  guardando = false;

  // Colecciones para el Formulario
  turnosDisponibles: ITurno[] = [
    { nombre: 'Diurno', horario: '7:00 a. m. - 7:00 p. m.' },
    { nombre: 'Nocturno', horario: '7:00 p. m. - 7:00 a. m.' },
  ];
  tiposDocumento: string[] = ['CC', 'CE', 'PASAPORTE', 'PEP'];
  diasSemana: string[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  turnoSeleccionado = 'Diurno';
  diasSeleccionados: string[] = [];
  archivosSubidos: { [clave: string]: File } = {};

  formulario: ICuidador = this.formularioInicial();
  errores: ErroresFormulario = {};

  ngOnInit(): void {
    this.cargarCuidadores();
  }

  cargarCuidadores(): void {
    this.http.get<ICuidador[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.cuidadores = data.map((c) => {
          const idReg = c.id_usuario || c.id;
          const nom = c.nombres || c.nombre || '';
          const ape = c.apellidos || c.apellido || '';
          const fullNombre = c.nombreCompleto || `${nom} ${ape}`.trim() || nom;
          const docNum = c.numero_documento || c.numeroDocumento || c.documento || '';
          const docTipo = c.tipo_documento || c.tipoDocumento || 'CC';
          const esActivo = c.estado === true || c.estado === 'activo';

          return {
            ...c,
            id: idReg,
            nombre: nom,
            apellido: ape,
            nombreCompleto: fullNombre,
            tipoDocumento: docTipo,
            numeroDocumento: docNum,
            documento: docNum,
            estado: esActivo ? 'activo' : 'inactivo',
            disponible: c.disponible ?? (esActivo && (!c.pacientes || c.pacientes < 3)),
          };
        });
        this.actualizarMetricas();
        this.filtrarCuidadores();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al obtener cuidadores desde Render:', err);
        this.cdr.detectChanges();
      },
    });
  }

  actualizarMetricas(): void {
    this.totalCuidadores = this.cuidadores.length;
    this.cuidadoresActivos = this.cuidadores.filter((c) => c.estado === 'activo').length;
    this.cuidadoresDisponibles = this.cuidadores.filter((c) => c.disponible).length;
  }

  // --- FILTROS Y BÚSQUEDA ---
  buscarCuidadores(): void {
    this.filtrarCuidadores();
  }

  filtrarCuidadores(): void {
    const busqueda = this.textoBusqueda.trim().toLowerCase();

    this.cuidadoresFiltrados = this.cuidadores.filter((c) => {
      const doc = (c.numeroDocumento || c.documento || '').toLowerCase();
      return doc.includes(busqueda);
    });

    this.aplicarOrdenamiento();
    this.cdr.detectChanges();
  }

  ordenarCuidadores(): void {
    this.ordenNombre = this.ordenNombre === 'asc' ? 'desc' : 'asc';
    this.aplicarOrdenamiento();
    this.cdr.detectChanges();
  }

  aplicarOrdenamiento(): void {
    this.cuidadoresFiltrados.sort((a, b) => {
      const nombreA = (a.nombreCompleto || a.nombre || '').toLowerCase();
      const nombreB = (b.nombreCompleto || b.nombre || '').toLowerCase();
      if (nombreA < nombreB) return this.ordenNombre === 'asc' ? -1 : 1;
      if (nombreA > nombreB) return this.ordenNombre === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // --- CÁLCULO AUTOMÁTICO DE EDAD ---
  calcularEdad(): void {
    if (!this.formulario.fechaNacimiento) {
      this.formulario.edad = undefined;
      return;
    }
    const fechaNac = new Date(this.formulario.fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    this.formulario.edad = edad >= 0 ? edad : 0;
  }

  // --- FORMULARIO & DÍAS & ARCHIVOS ---
  formularioInicial(): ICuidador {
    return {
      nombre: '',
      apellido: '',
      tipoDocumento: 'CC',
      numeroDocumento: '',
      documento: '',
      telefono: '',
      correo: '',
      fechaNacimiento: '',
      edad: undefined,
      especialidad: '',
      licencia: '',
      experiencia: undefined,
      institucion: '',
      turno: 'Diurno',
      pacientes: 0,
      estado: 'activo',
      disponible: true,
    };
  }

  estaSeleccionadoElDia(dia: string): boolean {
    return this.diasSeleccionados.includes(dia);
  }

  cambiarDia(dia: string): void {
    if (this.estaSeleccionadoElDia(dia)) {
      this.diasSeleccionados = this.diasSeleccionados.filter((d) => d !== dia);
    } else {
      this.diasSeleccionados.push(dia);
    }
  }

  seleccionarArchivo(event: Event, tipo: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivosSubidos[tipo] = input.files[0];
    }
  }

  archivoSeleccionado(tipo: string): boolean {
    return !!this.archivosSubidos[tipo];
  }

  obtenerNombreArchivo(tipo: string): string {
    return this.archivosSubidos[tipo]?.name || '';
  }

  tieneError(campo: keyof ErroresFormulario): boolean {
    return !!this.errores[campo];
  }

  validarFormulario(): boolean {
    this.errores = {};
    let valido = true;

    if (!this.formulario.nombre?.trim()) {
      this.errores.nombre = true;
      valido = false;
    }
    if (!this.formulario.apellido?.trim()) {
      this.errores.apellido = true;
      valido = false;
    }
    if (!this.formulario.tipoDocumento?.trim()) {
      this.errores.tipoDocumento = true;
      valido = false;
    }
    if (!this.formulario.numeroDocumento?.trim()) {
      this.errores.numeroDocumento = true;
      valido = false;
    }
    if (!this.formulario.telefono?.trim()) {
      this.errores.telefono = true;
      valido = false;
    }
    if (!this.formulario.correo?.trim()) {
      this.errores.correo = true;
      valido = false;
    }
    if (!this.formulario.especialidad?.trim()) {
      this.errores.especialidad = true;
      valido = false;
    }
    if (!this.formulario.licencia?.trim()) {
      this.errores.licencia = true;
      valido = false;
    }

    return valido;
  }

  abrirFormulario(modo: 'crear' | 'editar', id?: number): void {
    this.formularioAbierto = true;
    this.modoFormulario = modo;
    this.errores = {};

    if (modo === 'crear') {
      this.idEditando = null;
      this.formulario = this.formularioInicial();
      this.turnoSeleccionado = 'Diurno';
      this.diasSeleccionados = [];
      this.archivosSubidos = {};
    } else if (modo === 'editar' && id) {
      const c = this.cuidadores.find((item) => item.id === id);
      if (c) {
        this.idEditando = id;
        this.formulario = { ...c };
        this.turnoSeleccionado = c.turno || 'Diurno';
        this.diasSeleccionados = c.diasDisponibles ? [...c.diasDisponibles] : [];
        this.calcularEdad();
      }
    }
    this.cdr.detectChanges();
  }

  cerrarFormulario(): void {
    if (this.guardando) return;
    this.formularioAbierto = false;
    this.errores = {};
    this.formulario = this.formularioInicial();
    this.idEditando = null;
    this.cdr.detectChanges();
  }

  cerrarFormularioPorOverlay(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cerrarFormulario();
    }
  }

  cancelarFormulario(): void {
    this.cerrarFormulario();
  }

  guardarCuidador(): void {
    if (!this.validarFormulario()) {
      Swal.fire({
        title: 'Atención',
        text: 'Por favor complete todos los campos obligatorios.',
        icon: 'warning',
        confirmButtonColor: '#3B5BDB',
      });
      return;
    }

    this.guardando = true;

    // Objeto estructurado para el backend de Django (API Render)
    const payloadDjango = {
      ...this.formulario,
      nombres: this.formulario.nombre,
      apellidos: this.formulario.apellido,
      tipo_documento: this.formulario.tipoDocumento,
      numero_documento: this.formulario.numeroDocumento,
      estado: this.formulario.estado === 'activo',
      turno: this.turnoSeleccionado,
      diasDisponibles: [...this.diasSeleccionados],
      nombreCompleto: `${this.formulario.nombre} ${this.formulario.apellido}`.trim(),
    };

    const urlEndpoint =
      this.modoFormulario === 'editar' && this.idEditando
        ? `${this.apiUrl}${this.idEditando}/`
        : this.apiUrl;

    const peticion =
      this.modoFormulario === 'editar' && this.idEditando
        ? this.http.put(urlEndpoint, payloadDjango)
        : this.http.post(urlEndpoint, payloadDjango);

    peticion.subscribe({
      next: () => {
        this.guardando = false;
        Swal.fire({
          title: '¡Éxito!',
          text: `Cuidador ${this.modoFormulario === 'crear' ? 'creado' : 'actualizado'} correctamente.`,
          icon: 'success',
          confirmButtonColor: '#3B5BDB',
        });
        this.cerrarFormulario();
        this.cargarCuidadores();
      },
      error: (err) => {
        console.error(err);
        this.guardando = false;
        Swal.fire({
          title: 'Error',
          text: 'No se pudo procesar la solicitud en el servidor.',
          icon: 'error',
          confirmButtonColor: '#3B5BDB',
        });
      },
    });
  }

  // --- MODAL DETALLE ---
  verDetalle(cuidador: ICuidador): void {
    this.cuidadorSeleccionado = cuidador;
    this.detalleAbierto = true;
    this.cdr.detectChanges();
  }

  cerrarDetalle(): void {
    this.detalleAbierto = false;
    this.cuidadorSeleccionado = null;
    this.cdr.detectChanges();
  }

  cerrarDetallePorOverlay(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cerrarDetalle();
    }
  }

  // --- MODAL ELIMINAR ---
  solicitarEliminacion(id?: number): void {
    if (!id) return;
    this.idEliminando = id;
    this.confirmacionAbierta = true;
    this.cdr.detectChanges();
  }

  cerrarConfirmacion(): void {
    this.confirmacionAbierta = false;
    this.idEliminando = null;
    this.cdr.detectChanges();
  }

  confirmarEliminacion(): void {
    if (!this.idEliminando) return;

    this.http.delete(`${this.apiUrl}${this.idEliminando}/`).subscribe({
      next: () => {
        this.cerrarConfirmacion();
        Swal.fire({
          title: 'Eliminado',
          text: 'El registro ha sido eliminado correctamente.',
          icon: 'success',
          confirmButtonColor: '#3B5BDB',
        });
        this.cargarCuidadores();
      },
      error: (err) => {
        console.error(err);
        this.cerrarConfirmacion();
        Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar el registro.',
          icon: 'error',
          confirmButtonColor: '#3B5BDB',
        });
      },
    });
  }

  // --- MÉTODOS DE AYUDA / UI ---
  obtenerIniciales(nombre?: string): string {
    if (!nombre) return 'CU';
    const partes = nombre.trim().split(' ');
    if (partes.length >= 2) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  }

  obtenerColorAvatar(id?: number): string {
    const colores = ['#3B5BDB', '#12B886', '#7950F2', '#FA8C16', '#E83E8C', '#228BE6'];
    return colores[(id || 0) % colores.length];
  }
}