import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-elementos-paciente',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './elementos-paciente.html',
  styleUrl: './elementos-paciente.css'
})
export class ElementosPaciente implements OnInit {

  formularioAbierto = false;
  tipoElemento = '';

  idPaciente: number | null = null;

  constructor(
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.idPaciente = Number(id);

      console.log('ID DEL PACIENTE:', this.idPaciente);
    }
  }

  abrirFormulario(): void {
    this.formularioAbierto = true;
  }

  cerrarFormulario(): void {
    this.formularioAbierto = false;
    this.tipoElemento = '';
  }
}