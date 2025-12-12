import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesReturnformComponent } from './sales-returnform.component';

describe('SalesReturnformComponent', () => {
  let component: SalesReturnformComponent;
  let fixture: ComponentFixture<SalesReturnformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesReturnformComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesReturnformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
