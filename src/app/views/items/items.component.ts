import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../layouts/UI/card/card.component';
import { TableComponent } from '../../layouts/UI/table/table.component';
import { ButtonComponent } from '../../layouts/UI/button/button.component';
import { LucideAngularModule, Plus, Edit, Trash2, Search, Filter } from 'lucide-angular';
import { ItemModel } from './models/Item.model';
import { ItemService } from './item.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [CommonModule, CardComponent, TableComponent, ButtonComponent, LucideAngularModule],
  templateUrl: './items.component.html',
  styleUrl: './items.component.css'
})
export class ItemsComponent implements OnInit {

  columns = ['Name', 'SKU', 'Type', 'Category', 'Price', 'Stock/Duration', 'Status', 'Actions'];
  listList: ItemModel[] = [];

  page: number = 1;
  size: number = 10;

  constructor(private itemService: ItemService, private router: Router) {
  }

  ngOnInit(): void {
    this.getAllItems();
  }

  getAllItems() {
    this.itemService.getAllItems(
      this.page,
      this.size,
      (res: any) => {
        this.listList = res.data;
      },
      (err: any) => {
        console.log(err);
      });
  }

  createItem() {
    this.router.navigate(['/items/add']);
  }

  updateItem(itemId: number) {
    this.router.navigate(['/items/edit', itemId]);
  }


  readonly Plus = Plus;
  readonly Edit = Edit;
  readonly Trash2 = Trash2;
  readonly Search = Search;
  readonly Filter = Filter;
}
