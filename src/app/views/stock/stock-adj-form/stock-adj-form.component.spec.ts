import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockAdjFormComponent } from './stock-adj-form.component';

describe('StockAdjFormComponent', () => {
  let component: StockAdjFormComponent;
  let fixture: ComponentFixture<StockAdjFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockAdjFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockAdjFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
