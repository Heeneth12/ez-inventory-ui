import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockLedgerComponent } from './stock-ledger.component';

describe('StockLedgerComponent', () => {
  let component: StockLedgerComponent;
  let fixture: ComponentFixture<StockLedgerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockLedgerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockLedgerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
