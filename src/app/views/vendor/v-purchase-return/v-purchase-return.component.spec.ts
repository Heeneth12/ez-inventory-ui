import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VPurchaseReturnComponent } from './v-purchase-return.component';

describe('VPurchaseReturnComponent', () => {
  let component: VPurchaseReturnComponent;
  let fixture: ComponentFixture<VPurchaseReturnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VPurchaseReturnComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VPurchaseReturnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
