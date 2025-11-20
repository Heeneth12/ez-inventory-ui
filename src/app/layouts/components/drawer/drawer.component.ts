import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DrawerService } from './drawerService';

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './drawer.component.html',
  styleUrl: './drawer.component.css'
})
export class DrawerComponent {

  isOpen$!: Observable<boolean>;
  content$!: Observable<any>;
  title$!: Observable<string>;

  widthClass: string = 'w-full max-w-md';

  constructor(private drawer: DrawerService) { }

  ngOnInit() {
    this.isOpen$ = this.drawer.drawerState$;
    this.content$ = this.drawer.drawerContent$;
    this.title$ = this.drawer.drawerTitle$;
  }

  close() {
    this.drawer.close();
  }
}
