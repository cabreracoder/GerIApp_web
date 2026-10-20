
import { createReducer, on, createSelector } from '@ngrx/store';
import {
  iniciarSesion,
  cerrarSesion,
  restaurarSesion,
  actualizarUsuario,
  UsuarioSesion
} from './action';

export interface AuthState {
  usuario: UsuarioSesion | null;
  autenticado: boolean;
}

export interface AppState {
  auth: AuthState;
}

export const estadoInicialAuth: AuthState = {
  usuario: null,
  autenticado: false
};

export const authReducer = createReducer(
  estadoInicialAuth,

  on(iniciarSesion, (_state, { usuario }) => ({
    usuario,
    autenticado: true
  })),

  on(restaurarSesion, (_state, { usuario }) => ({
    usuario,
    autenticado: true
  })),

  on(actualizarUsuario, (state, { usuario }) => ({
    ...state,
    usuario,
    autenticado: state.autenticado
  })),

  on(cerrarSesion, () => ({
    usuario: null,
    autenticado: false
  }))
);

export const selectAuthState = (state: { auth: AuthState }) =>
  state.auth;

export const selectUsuario = createSelector(
  selectAuthState,
  (state) => state.usuario
);

export const selectAutenticado = createSelector(
  selectAuthState,
  (state) => state.autenticado
);
