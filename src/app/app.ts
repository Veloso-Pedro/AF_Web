import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Transacoes } from './transacoes/transacoes';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [Transacoes],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
