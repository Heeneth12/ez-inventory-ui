import { Routes } from '@angular/router';
import { PurchaseReturnsComponent } from './purchase-returns/purchase-returns.component';
import { GoodsReceiptComponent } from './goods-receipt/goods-receipt.component';
import { PurchasesOrderRoutes } from './purchase-order/purchase-order.routes';


export const PurchasesRoutes: Routes = [
    { path: 'order', children: PurchasesOrderRoutes },
    { path: 'grn', component: GoodsReceiptComponent },
    { path: 'return', component: PurchaseReturnsComponent },

];
