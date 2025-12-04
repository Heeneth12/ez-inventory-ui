import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { LoaderService } from './loaderService';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  templateUrl: "./loader.component.html",
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent {

  isLoading$: Observable<boolean>;

  constructor(private loaderSvs: LoaderService) {
    this.isLoading$ = this.loaderSvs.isLoading$;
  }
}