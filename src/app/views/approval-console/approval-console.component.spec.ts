import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalConsoleComponent } from './approval-console.component';

describe('ApprovalConsoleComponent', () => {
  let component: ApprovalConsoleComponent;
  let fixture: ComponentFixture<ApprovalConsoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprovalConsoleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovalConsoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
