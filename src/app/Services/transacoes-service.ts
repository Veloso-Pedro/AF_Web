import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Transacao {
  _id?: string;
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  categoria: string;
  data: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransacoesService {
  private http = inject(HttpClient);
  private base = `http://localhost:3000/transacoes`;

  listar(): Observable<Transacao[]> {
    return this.http.get<Transacao[]>(this.base);
  }
  buscarPorId(id: string): Observable<Transacao> {
    return this.http.get<Transacao>(`${this.base}/${id}`);
  }
  criar(transacao: Transacao): Observable<Transacao> {
    return this.http.post<Transacao>(this.base, transacao);
  }
  atualizar(id: string, transacao: Transacao): Observable<Transacao> {
    return this.http.put<Transacao>(`${this.base}/${id}`, transacao);
  }
  excluir(id: string) {
    return this.http.delete(`${this.base}/${id}`);
  }
}
