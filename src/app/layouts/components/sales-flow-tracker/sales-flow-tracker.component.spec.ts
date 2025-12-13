import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesFlowTrackerComponent } from './sales-flow-tracker.component';

describe('SalesFlowTrackerComponent', () => {
  let component: SalesFlowTrackerComponent;
  let fixture: ComponentFixture<SalesFlowTrackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesFlowTrackerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesFlowTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
