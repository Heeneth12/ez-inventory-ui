import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseReturnFormComponent } from './purchase-return-form.component';

describe('PurchaseReturnFormComponent', () => {
  let component: PurchaseReturnFormComponent;
  let fixture: ComponentFixture<PurchaseReturnFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseReturnFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseReturnFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
