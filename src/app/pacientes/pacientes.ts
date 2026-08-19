import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Paciente {
  id: string;
  name: string;
  room: string;
  doc: string;
  age: number;
  guardian: string;
  guardianRel: string;
  caregiver: string;
  status: 'stable' | 'critical' | 'observation';
}

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pacientes.html',
  styleUrl: './pacientes.css'
})
export class Pacientes {

  // ==============================
  // VARIABLES
  // ==============================

  patients: Paciente[] = [
    {
      id: 'RM',
      name: 'Ricardo Mendoza S.',
      room: '104 - Ala Norte',
      doc: '10.455.672',
      age: 82,
      guardian: 'Elena Mendoza',
      guardianRel: 'Hija | 312 456 7890',
      caregiver: 'Enf. Carlos Ruiz',
      status: 'stable'
    },
    {
      id: 'BA',
      name: 'Beatriz Arango',
      room: '212 - Ala Este',
      doc: '7.122.908',
      age: 89,
      guardian: 'David Arango',
      guardianRel: 'Nieto | 300 112 2233',
      caregiver: 'Dra. Martha Luz',
      status: 'critical'
    },
    {
      id: 'JG',
      name: 'Jorge Eliécer G.',
      room: '108 - Ala Norte',
      doc: '1.990.233',
      age: 76,
      guardian: 'Sandra Gómez',
      guardianRel: 'Esposa | 315 889 0012',
      caregiver: 'Enf. Carlos Ruiz',
      status: 'stable'
    },
    {
      id: 'ER',
      name: 'Elena Rodriguez',
      room: '104-A',
      doc: '8.234.111',
      age: 74,
      guardian: 'Pedro Rodriguez',
      guardianRel: 'Hijo | 318 900 1122',
      caregiver: 'Enf. Laura Paz',
      status: 'observation'
    },
    {
      id: 'MS',
      name: 'Marta Soto',
      room: '108-C',
      doc: '5.678.900',
      age: 81,
      guardian: 'Camila Soto',
      guardianRel: 'Hija | 310 445 6677',
      caregiver: 'Enf. Ana Reyes',
      status: 'stable'
    },
    {
      id: 'RP',
      name: 'Roberto Peña',
      room: '106 - Ala Sur',
      doc: '3.112.445',
      age: 78,
      guardian: 'Mario Peña',
      guardianRel: 'Hijo | 317 884 2210',
      caregiver: 'Juan Vela',
      status: 'stable'
    },
    {
      id: 'LG',
      name: 'Lucía González',
      room: '201 - Ala Este',
      doc: '6.889.020',
      age: 83,
      guardian: 'Clara González',
      guardianRel: 'Sobrina | 311 334 5599',
      caregiver: 'Dra. Martha Luz',
      status: 'observation'
    },
    {
      id: 'HP',
      name: 'Hernando Paredes',
      room: '109 - Ala Norte',
      doc: '2.774.831',
      age: 91,
      guardian: 'Nora Paredes',
      guardianRel: 'Hija | 320 001 9988',
      caregiver: 'Enf. Ana Reyes',
      status: 'critical'
    }
  ];

  searchText = '';
  statusFilter = '';
  pavilionFilter = '';

  currentPage = 1;
  pageSize = 5;

  editingId: string | null = null;
  modalOpen = false;

  modalTitle = 'Nuevo Paciente';
  saveButtonText = 'Guardar paciente';

  // ==============================
  // FORMULARIO
  // ==============================

  form = {
    nombre: '',
    documento: '',
    nacimiento: '',
    edad: '',
    habitacion: '',
    estado: 'stable' as 'stable' | 'critical' | 'observation',
    cuidador: 'Enf. Carlos Ruiz',
    pabellon: 'Ala Norte - Cuidados Intensivos',
    encargado: '',
    relacion: '',
    telefono: '',
    email: '',
    notas: ''
  };

  // ==============================
  // PACIENTES FILTRADOS
  // ==============================

  get filteredPatients(): Paciente[] {

    let data = [...this.patients];

    const q = this.searchText.trim().toLowerCase();

    if (q.length >= 2) {
      data = data.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.doc.toLowerCase().includes(q)
      );
    }

    if (this.statusFilter) {
      data = data.filter(
        p => p.status === this.statusFilter
      );
    }

    if (this.pavilionFilter) {
      data = data.filter(
        p => p.room.toLowerCase().includes(
          this.pavilionFilter.toLowerCase()
        )
      );
    }

    return data;
  }

  // ==============================
  // PAGINACIÓN
  // ==============================

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(this.filteredPatients.length / this.pageSize)
    );
  }

  get paginatedPatients(): Paciente[] {

    const start =
      (this.currentPage - 1) * this.pageSize;

    return this.filteredPatients.slice(
      start,
      start + this.pageSize
    );
  }

  get firstShown(): number {

    if (this.filteredPatients.length === 0) {
      return 0;
    }

    return ((this.currentPage - 1) * this.pageSize) + 1;
  }

  get lastShown(): number {

    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredPatients.length
    );
  }

  changePage(page: number): void {

    if (page < 1 || page > this.totalPages) {
      return;
    }

    this.currentPage = page;
  }

  // ==============================
  // FILTROS
  // ==============================

  filterTable(): void {
    this.currentPage = 1;
  }

  // ==============================
  // MODAL
  // ==============================

  openModal(
    mode: 'new' | 'edit',
    id?: string
  ): void {

    this.editingId = id || null;

    this.clearForm();

    if (mode === 'edit' && id) {

      const patient =
        this.patients.find(p => p.id === id);

      if (!patient) {
        return;
      }

      this.modalTitle = 'Editar Paciente';
      this.saveButtonText = 'Guardar cambios';

      this.form.nombre = patient.name;
      this.form.documento = patient.doc;
      this.form.edad = patient.age.toString();
      this.form.habitacion = patient.room;
      this.form.estado = patient.status;
      this.form.cuidador = patient.caregiver;
      this.form.encargado = patient.guardian;

      const relation =
        patient.guardianRel.split('|');

      this.form.relacion =
        relation[0]?.trim() || '';

      this.form.telefono =
        relation[1]?.trim() || '';

    } else {

      this.modalTitle = 'Nuevo Paciente';
      this.saveButtonText = 'Guardar paciente';
    }

    this.modalOpen = true;
  }

  closeModal(): void {

    this.modalOpen = false;
    this.editingId = null;
  }

  closeOnBackdrop(event: MouseEvent): void {

    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  // ==============================
  // LIMPIAR FORMULARIO
  // ==============================

  clearForm(): void {

    this.form = {
      nombre: '',
      documento: '',
      nacimiento: '',
      edad: '',
      habitacion: '',
      estado: 'stable',
      cuidador: 'Enf. Carlos Ruiz',
      pabellon: 'Ala Norte - Cuidados Intensivos',
      encargado: '',
      relacion: '',
      telefono: '',
      email: '',
      notas: ''
    };
  }

  // ==============================
  // GUARDAR PACIENTE
  // ==============================

  savePatient(): void {

    const nombre =
      this.form.nombre.trim();

    const documento =
      this.form.documento.trim();

    if (!nombre || !documento) {

      alert(
        'El nombre y documento son obligatorios.'
      );

      return;
    }

    const initials =
      nombre
        .split(' ')
        .slice(0, 2)
        .map(word => word[0])
        .join('')
        .toUpperCase();

    if (this.editingId) {

      this.patients =
        this.patients.map(p => {

          if (p.id !== this.editingId) {
            return p;
          }

          return {
            ...p,
            name: nombre,
            doc: documento,
            age:
              parseInt(this.form.edad) ||
              p.age,

            room:
              this.form.habitacion ||
              p.room,

            status:
              this.form.estado,

            caregiver:
              this.form.cuidador,

            guardian:
              this.form.encargado ||
              p.guardian,

            guardianRel:
              `${this.form.relacion} | ${this.form.telefono}`
          };
        });

    } else {

      const newPatient: Paciente = {

        id: initials,

        name: nombre,

        doc: documento,

        age:
          parseInt(this.form.edad) || 0,

        room:
          this.form.habitacion || '—',

        status:
          this.form.estado,

        caregiver:
          this.form.cuidador,

        guardian:
          this.form.encargado || '—',

        guardianRel:
          `${this.form.relacion} | ${this.form.telefono}`
      };

      this.patients.push(newPatient);
    }

    this.closeModal();
    this.filterTable();
  }

  // ==============================
  // ELIMINAR
  // ==============================

  deletePatient(id: string): void {

    const confirmed =
      confirm(
        '¿Eliminar este paciente del sistema?'
      );

    if (!confirmed) {
      return;
    }

    this.patients =
      this.patients.filter(
        p => p.id !== id
      );

    if (
      this.currentPage >
      this.totalPages
    ) {
      this.currentPage =
        this.totalPages;
    }
  }

  // ==============================
  // SUSPENDER / ACTIVAR
  // ==============================

  toggleStatus(id: string): void {

    this.patients =
      this.patients.map(p => {

        if (p.id !== id) {
          return p;
        }

        return {
          ...p,
          status:
            p.status === 'stable'
              ? 'observation'
              : 'stable'
        };
      });
  }

  // ==============================
  // ESTADO
  // ==============================

  getStatusText(
    status: Paciente['status']
  ): string {

    switch (status) {

      case 'stable':
        return 'ESTABLE';

      case 'critical':
        return 'CRÍTICO';

      case 'observation':
        return 'OBSERVACIÓN';

      default:
        return '';
    }
  }

  getAvatarColor(
    status: Paciente['status']
  ): string {

    switch (status) {

      case 'critical':
        return '#DC3545';

      case 'observation':
        return '#4DABF7';

      default:
        return '#3B5BDB';
    }
  }

  // ==============================
  // NÚMERO DE PACIENTES
  // ==============================

  get activePatients(): number {

    return this.patients.length;
  }

  get stablePatients(): number {

    return this.patients.filter(
      p => p.status === 'stable'
    ).length;
  }

  get criticalPatients(): number {

    return this.patients.filter(
      p => p.status === 'critical'
    ).length;
  }
}