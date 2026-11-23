import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { TransacoesService, Transacao } from '../Services/transacoes-service';
import { GraficoPizza, FatiaGrafico } from '../grafico-pizza/grafico-pizza';

interface Categoria {
  nome: string;
  cor: string;
  tipo: 'receita' | 'despesa' | 'ambos';
}

@Component({
  selector: 'app-transacoes',
  imports: [FormsModule, CurrencyPipe, DatePipe, GraficoPizza],
  templateUrl: './transacoes.html',
  standalone: true,
  styleUrl: './transacoes.css',
  changeDetection: ChangeDetectionStrategy.Eager
})
export class Transacoes implements OnInit {
  private api = inject(TransacoesService);

  categorias: Categoria[] = [
    { nome: 'Salário', cor: '#16a34a', tipo: 'receita' },
    { nome: 'Freelance', cor: '#0d9488', tipo: 'receita' },
    { nome: 'Investimentos', cor: '#2563eb', tipo: 'receita' },
    { nome: 'Alimentação', cor: '#ea580c', tipo: 'despesa' },
    { nome: 'Moradia', cor: '#7c3aed', tipo: 'despesa' },
    { nome: 'Transporte', cor: '#ca8a04', tipo: 'despesa' },
    { nome: 'Saúde', cor: '#dc2626', tipo: 'despesa' },
    { nome: 'Educação', cor: '#0891b2', tipo: 'despesa' },
    { nome: 'Lazer', cor: '#db2777', tipo: 'despesa' },
    { nome: 'Outros', cor: '#64748b', tipo: 'ambos' }
  ];

  transacoes: Transacao[] = [];
  carregando = false;
  salvando = false;
  erro = '';

  descricao = '';
  valor: number | null = null;
  tipo: 'receita' | 'despesa' = 'despesa';
  categoria = '';
  data = this.hoje();
  editandoId: string | null = null;

  filtroCategoria = '';

  totalReceitas = 0;
  totalDespesas = 0;
  saldo = 0;

  tipoGrafico: 'receita' | 'despesa' = 'despesa';
  dadosGrafico: FatiaGrafico[] = [];

  ngOnInit() { this.carregar(); }

  carregar() {
    this.carregando = true;
    this.api.listar().subscribe({
      next: xs => { this.transacoes = xs; this.calcularResumo(); this.carregando = false; },
      error: e => { this.erro = e.message ?? 'Falha ao carregar';
        this.carregando = false; }
    });
  }

  salvar() {
    if (!this.descricao || !this.valor || !this.categoria || !this.data) {
      this.erro = 'Preencha todos os campos';
      return;
    }

    const transacao: Transacao = {
      descricao: this.descricao,
      valor: Number(this.valor),
      tipo: this.tipo,
      categoria: this.categoria,
      data: this.data
    };

    this.salvando = true;
    const requisicao = this.editandoId
      ? this.api.atualizar(this.editandoId, transacao)
      : this.api.criar(transacao);

    requisicao.subscribe({
      next: _ => {
        this.limparForm();
        this.salvando = false; this.erro = ''; this.carregar();
      },
      error: e => { this.erro = e.error?.error ?? 'Falha ao salvar';
        this.salvando = false; }
    });
  }

  editar(t: Transacao) {
    this.editandoId = t._id ?? null;
    this.descricao = t.descricao;
    this.valor = t.valor;
    this.tipo = t.tipo;
    this.categoria = t.categoria;
    this.data = t.data.substring(0, 10);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicao() { this.limparForm(); }

  excluir(t: Transacao) {
    if (!t._id || !confirm(`Excluir "${t.descricao}"?`)) return;
    this.api.excluir(t._id).subscribe({
      next: _ => this.carregar(),
      error: e => this.erro = e.message ?? 'Falha ao excluir'
    });
  }

  get transacoesFiltradas(): Transacao[] {
    if (!this.filtroCategoria) return this.transacoes;
    return this.transacoes.filter(t => t.categoria === this.filtroCategoria);
  }

  categoriasDoTipo(): Categoria[] {
    return this.categorias.filter(c => c.tipo === this.tipo || c.tipo === 'ambos');
  }

  trocarTipo() {
    if (!this.categoriasDoTipo().some(c => c.nome === this.categoria)) this.categoria = '';
  }

  corDaCategoria(nome: string): string {
    return this.categorias.find(c => c.nome === nome)?.cor ?? '#64748b';
  }

  trocarTipoGrafico(tipo: 'receita' | 'despesa') {
    this.tipoGrafico = tipo;
    this.calcularResumo();
  }

  private calcularResumo() {
    this.totalReceitas = this.somar('receita');
    this.totalDespesas = this.somar('despesa');
    this.saldo = this.totalReceitas - this.totalDespesas;

    const totais = new Map<string, number>();
    for (const t of this.transacoes.filter(t => t.tipo === this.tipoGrafico)) {
      totais.set(t.categoria, (totais.get(t.categoria) ?? 0) + t.valor);
    }
    this.dadosGrafico = [...totais.entries()]
      .map(([categoria, total]) => ({ categoria, total, cor: this.corDaCategoria(categoria) }))
      .sort((a, b) => b.total - a.total);
  }

  private somar(tipo: 'receita' | 'despesa'): number {
    return this.transacoes.filter(t => t.tipo === tipo).reduce((soma, t) => soma + t.valor, 0);
  }

  private limparForm() {
    this.descricao = ''; this.valor = null; this.categoria = '';
    this.data = this.hoje(); this.editandoId = null;
  }

  private hoje(): string {
    const d = new Date();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mes}-${dia}`;
  }
}
