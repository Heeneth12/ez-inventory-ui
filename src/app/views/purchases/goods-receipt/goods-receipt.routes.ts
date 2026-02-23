import { Routes } from "@angular/router";
import { GoodsReceiptAdapterComponent } from "./goods-receipt-adapter.component";
import { GoodsReceiptComponent } from "./goods-receipt.component";


export const GoodsReceiptRoutes: Routes = [
    {
        path: '',
        component: GoodsReceiptAdapterComponent,
        children: [
            { path: '', component: GoodsReceiptComponent },
            { path: 'create', component: GoodsReceiptComponent },
            { path: 'edit/:id', component: GoodsReceiptComponent },
        ]
    }
];

