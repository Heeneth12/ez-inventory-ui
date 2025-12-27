import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatGroupComponent } from './stat-group.component';

describe('StatGroupComponent', () => {
  let component: StatGroupComponent;
  let fixture: ComponentFixture<StatGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatGroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
