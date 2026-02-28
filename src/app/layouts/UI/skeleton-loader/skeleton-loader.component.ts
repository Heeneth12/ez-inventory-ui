import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SkeletonType = 'card' | 'table' | 'list' | 'stats' | 'page' | 'box' | 'profile';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton-loader.component.html',
})
export class SkeletonLoaderComponent {
  @Input() type: SkeletonType = 'card';
  @Input() rows: number = 3;
  @Input() columns: number = 4;

  // NEW: Accepts values like '400px', '100vh', '50%', etc.
  @Input() height: string = '';

  get rowArray(): number[] { return Array(this.rows).fill(0); }
  get colArray(): number[] { return Array(this.columns).fill(0); }
}