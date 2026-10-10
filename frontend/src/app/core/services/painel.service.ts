import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../api';
import { Resumo } from '../models/modelos';

@Injectable({ providedIn: 'root' })
export class PainelService {
  private readonly http = inject(HttpClient);

  resumo(): Observable<Resumo> {
    return this.http.get<Resumo>(`${API_URL}/painel/resumo`);
  }
}
