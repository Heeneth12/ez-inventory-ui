import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewOrdersHeaderComponent } from './new-orders-header.component';

describe('NewOrdersHeaderComponent', () => {
  let component: NewOrdersHeaderComponent;
  let fixture: ComponentFixture<NewOrdersHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewOrdersHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewOrdersHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
