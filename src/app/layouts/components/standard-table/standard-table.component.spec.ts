import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StandardTableComponent } from './standard-table.component';

describe('StandardTableComponent', () => {
  let component: StandardTableComponent;
  let fixture: ComponentFixture<StandardTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StandardTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StandardTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
