import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentSymmaryComponent } from './payment-symmary.component';

describe('PaymentSymmaryComponent', () => {
  let component: PaymentSymmaryComponent;
  let fixture: ComponentFixture<PaymentSymmaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentSymmaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentSymmaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
