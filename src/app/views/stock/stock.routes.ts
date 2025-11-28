import { Routes } from "@angular/router";
import { StockComponent } from "./stock.component";
import { StockLedgerComponent } from "./stock-ledger/stock-ledger.component";



export const stockRoutes: Routes = [
    { path: '', redirectTo: '', pathMatch: 'full' },
    { path: '', component: StockComponent },
    { path: 'ledger', component: StockLedgerComponent }

]