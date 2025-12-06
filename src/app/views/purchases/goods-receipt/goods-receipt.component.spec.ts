import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoodsReceiptComponent } from './goods-receipt.component';

describe('GoodsReceiptComponent', () => {
  let component: GoodsReceiptComponent;
  let fixture: ComponentFixture<GoodsReceiptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoodsReceiptComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoodsReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
