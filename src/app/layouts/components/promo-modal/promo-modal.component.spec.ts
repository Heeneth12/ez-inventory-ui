import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromoModalComponent } from './promo-modal.component';

describe('PromoModalComponent', () => {
  let component: PromoModalComponent;
  let fixture: ComponentFixture<PromoModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromoModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
