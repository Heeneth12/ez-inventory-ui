import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseRequestFormComponent } from './purchase-request-form.component';

describe('PurchaseRequestFormComponent', () => {
  let component: PurchaseRequestFormComponent;
  let fixture: ComponentFixture<PurchaseRequestFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseRequestFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseRequestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
