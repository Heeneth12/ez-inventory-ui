import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesReturnsComponent } from './sales-returns.component';

describe('SalesReturnsComponent', () => {
  let component: SalesReturnsComponent;
  let fixture: ComponentFixture<SalesReturnsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesReturnsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesReturnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
