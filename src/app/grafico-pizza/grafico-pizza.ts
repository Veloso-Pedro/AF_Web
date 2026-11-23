import { Component, Input } from '@angular/core';
import { CurrencyPipe, PercentPipe } from '@angular/common';

export interface FatiaGrafico {
  categoria: string;
  total: number;
  cor: string;
}

@Component({
  selector: 'app-grafico-pizza',
  imports: [CurrencyPipe, PercentPipe],
  templateUrl: './grafico-pizza.html',
  styleUrl: './grafico-pizza.css'
})
export class GraficoPizza {
  @Input() dados: FatiaGrafico[] = [];

  get total(): number {
    return this.dados.reduce((soma, d) => soma + d.total, 0);
  }

  percentual(d: FatiaGrafico): number {
    return this.total ? d.total / this.total : 0;
  }

  inicio(indice: number): number {
    return this.dados.slice(0, indice).reduce((soma, d) => soma + this.percentual(d) * 100, 0);
  }
}
