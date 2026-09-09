import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
export class ElementosPaciente {

formularioAbierto = false;

tipoElemento = '';

abrirFormulario(): void {
this.formularioAbierto = true;
}

cerrarFormulario(): void {
this.formularioAbierto = false;
this.tipoElemento = '';
}

}
