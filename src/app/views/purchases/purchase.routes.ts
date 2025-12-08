import { Routes } from '@angular/router';
import { PurchasesOrderRoutes } from './purchase-order/purchase-order.routes';
import { GoodsReceiptRoutes } from './goods-receipt/purchase-return.routes';
import { PurchaseReturnRoutes } from './purchase-returns/purchase-return.routes';


export const PurchasesRoutes: Routes = [
    { path: 'order', children: PurchasesOrderRoutes },
    { path: 'grn', children: GoodsReceiptRoutes },
    { path: 'return', children: PurchaseReturnRoutes },
];
