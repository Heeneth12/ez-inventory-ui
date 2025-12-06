import { Routes } from '@angular/router';
import { PurchaseOrderComponent } from './purchase-order/purchase-order.component';
import { PurchaseReturnsComponent } from './purchase-returns/purchase-returns.component';
import { GoodsReceiptComponent } from './goods-receipt/goods-receipt.component';


export const PurchasesRoutes: Routes = [
    { path: 'order', component: PurchaseOrderComponent },
    { path: 'grn', component: GoodsReceiptComponent },
    { path: 'return', component: PurchaseReturnsComponent },

];
