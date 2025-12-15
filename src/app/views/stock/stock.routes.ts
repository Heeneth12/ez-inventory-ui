import { Routes } from "@angular/router";
import { StockComponent } from "./stock.component";
import { StockLedgerComponent } from "./stock-ledger/stock-ledger.component";
import { StockAdapterComponent } from "./stock-adapter.component";
import { StockAdjustmentComponent } from "./stock-adjustment/stock-adjustment.component";
import { StockAdjFormComponent } from "./stock-adj-form/stock-adj-form.component";

export const stockRoutes: Routes = [
    {
        path: '',
        component: StockAdapterComponent,
        children: [
            { path: '', component: StockComponent },
            { path: 'ledger', component: StockLedgerComponent },
            { path: 'adjustment', component: StockAdjustmentComponent },
        ]
    },
    {
        path: 'adjustment/create', component: StockAdjFormComponent
    }
];