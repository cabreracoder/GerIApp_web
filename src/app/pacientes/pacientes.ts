import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

type PatientStatus = 'stable' | 'critical' | 'observation';

interface Patient {
  id: number;
  name: string;
  doc: string;
  age: number;
  birthDate: string;
  room: string;
  guardian: string;
  guardianRel: string;
  caregiver: string;
  pavilion: string;
  status: PatientStatus;
  phone: string;
  email: string;
  notes: string;
}

interface PatientForm {
  nombre: string;
  documento: string;
  nacimiento: string;
  edad: number | null;
  habitacion: string;
  estado: PatientStatus;
  cuidador: string;
  pabellon: string;
  encargado: string;
  relacion: string;
  telefono: string;
  email: string;
  notas: string;
}

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pacientes.html',
  styleUrl: './pacientes.css'
})
export class Pacientes {

  // Filtros
  searchText = '';
  pavilionFilter = '';
  statusFilter: PatientStatus | '' = '';

  // Paginación
  currentPage = 1;
  pageSize = 8;

  // Modal
  modalOpen = false;
  editingId: number | null = null;
  form: PatientForm = this.createEmptyForm();

  // Capacidad máxima de la instalación para calcular %
  totalCapacity = 50;

  // Lista de Pacientes
  patients: Patient[] = [
    {
      id: 1,
      name: 'Ricardo Mendoza',
      doc: '10.455.672',
      age: 82,
      birthDate: '1944-03-12',
      room: '104',
      guardian: 'Elena Mendoza',
      guardianRel: 'Hija',
      caregiver: 'Enf. Carlos Ruiz',
      pavilion: 'Ala Norte',
      status: 'stable',
      phone: '3124567890',
      email: 'elena.mendoza@mail.com',
      notes: 'Control médico periódico.'
    },
    {
      id: 2,
      name: 'Carmen Torres',
      doc: '31.225.891',
      age: 78,
      birthDate: '1948-06-20',
      room: '108',
      guardian: 'Luis Torres',
      guardianRel: 'Hijo',
      caregiver: 'Dra. Martha Luz',
      pavilion: 'Ala Sur',
      status: 'critical',
      phone: '3119876543',
      email: 'luis.torres@mail.com',
      notes: 'Monitoreo de presión arterial.'
    }
  ];

  // =========================================================
  // GETTERS (PROPIEDADES COMPUTADAS)
  // =========================================================

  get filteredPatients(): Patient[] {
    return this.patients.filter(patient => {
      const matchesPavilion = !this.pavilionFilter || patient.pavilion === this.pavilionFilter;
      const matchesStatus = !this.statusFilter || patient.status === this.statusFilter;
      const matchesSearch = !this.searchText || 
        patient.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
        patient.doc.includes(this.searchText);

      return matchesPavilion && matchesStatus && matchesSearch;
    });
  }

  get paginatedPatients(): Patient[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredPatients.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredPatients.length / this.pageSize) || 1;
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // Métricas
  get totalActive(): number {
    return this.patients.length;
  }

  get occupancy(): number {
    return Math.round((this.patients.length / this.totalCapacity) * 100);
  }

  get stablePatients(): number {
    return this.patients.filter(p => p.status === 'stable').length;
  }

  get criticalPatients(): number {
    return this.patients.filter(p => p.status === 'critical').length;
  }

  get firstShown(): number {
    if (this.filteredPatients.length === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get lastShown(): number {
    const calculatedLast = this.currentPage * this.pageSize;
    return calculatedLast > this.filteredPatients.length 
      ? this.filteredPatients.length 
      : calculatedLast;
  }

  get modalTitle(): string {
    return this.editingId ? 'Editar Paciente' : 'Nuevo Paciente';
  }

  get saveButtonText(): string {
    return this.editingId ? 'Actualizar' : 'Guardar';
  }

  // =========================================================
  // MÉTODOS DE TABLA Y PAGINACIÓN
  // =========================================================

  filterTable(): void {
    this.currentPage = 1;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getAvatarColor(status: PatientStatus): string {
    switch (status) {
      case 'stable': return '#dcfce7';
      case 'critical': return '#fee2e2';
      case 'observation': return '#fef3c7';
      default: return '#e2e8f0';
    }
  }

  toggleStatus(id: number): void {
    const patient = this.patients.find(p => p.id === id);
    if (!patient) return;

    const states: PatientStatus[] = ['stable', 'observation', 'critical'];
    const nextIndex = (states.indexOf(patient.status) + 1) % states.length;
    patient.status = states[nextIndex];
  }

  deletePatient(id: number): void {
    if (confirm('¿Está seguro de eliminar este paciente?')) {
      this.patients = this.patients.filter(p => p.id !== id);
      if (this.paginatedPatients.length === 0 && this.currentPage > 1) {
        this.currentPage--;
      }
    }
  }

  // =========================================================
  // MÉTODOS DE MODAL Y FORMULARIO
  // =========================================================

  openModal(mode: 'new' | 'edit', id?: number): void {
    if (mode === 'edit' && id) {
      const patient = this.patients.find(p => p.id === id);
      if (patient) {
        this.editingId = id;
        this.form = {
          nombre: patient.name,
          documento: patient.doc,
          nacimiento: patient.birthDate,
          edad: patient.age,
          habitacion: patient.room,
          estado: patient.status,
          cuidador: patient.caregiver,
          pabellon: patient.pavilion,
          encargado: patient.guardian,
          relacion: patient.guardianRel,
          telefono: patient.phone,
          email: patient.email,
          notas: patient.notes
        };
      }
    } else {
      this.editingId = null;
      this.form = this.createEmptyForm();
    }
    this.modalOpen = true;
  }

  closeModal(): void {
    this.modalOpen = false;
    this.editingId = null;
    this.form = this.createEmptyForm();
  }

  closeOnBackdrop(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('overlay')) {
      this.closeModal();
    }
  }

  savePatient(): void {
    if (!this.form.nombre || !this.form.documento) {
      alert('Por favor complete al menos el nombre y el documento.');
      return;
    }

    if (this.editingId) {
      const index = this.patients.findIndex(p => p.id === this.editingId);
      if (index !== -1) {
        this.patients[index] = {
          ...this.patients[index],
          name: this.form.nombre,
          doc: this.form.documento,
          birthDate: this.form.nacimiento,
          age: Number(this.form.edad) || 0,
          room: this.form.habitacion,
          status: this.form.estado,
          caregiver: this.form.cuidador,
          pavilion: this.form.pabellon,
          guardian: this.form.encargado,
          guardianRel: this.form.relacion,
          phone: this.form.telefono,
          email: this.form.email,
          notes: this.form.notas
        };
      }
    } else {
      const newPatient: Patient = {
        id: Date.now(),
        name: this.form.nombre,
        doc: this.form.documento,
        birthDate: this.form.nacimiento,
        age: Number(this.form.edad) || 0,
        room: this.form.habitacion,
        status: this.form.estado || 'stable',
        caregiver: this.form.cuidador || 'Enf. Carlos Ruiz',
        pavilion: this.form.pabellon || 'Ala Norte',
        guardian: this.form.encargado,
        guardianRel: this.form.relacion,
        phone: this.form.telefono,
        email: this.form.email,
        notes: this.form.notas
      };
      this.patients.unshift(newPatient);
    }

    this.closeModal();
  }

  private createEmptyForm(): PatientForm {
    return {
      nombre: '',
      documento: '',
      nacimiento: '',
      edad: null,
      habitacion: '',
      estado: 'stable',
      cuidador: 'Enf. Carlos Ruiz',
      pabellon: 'Ala Norte',
      encargado: '',
      relacion: '',
      telefono: '',
      email: '',
      notas: ''
    };
  }
}