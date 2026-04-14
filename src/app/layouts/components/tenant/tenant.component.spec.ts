import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantComponent } from './tenant.component';

describe('TenantComponent', () => {
  let component: TenantComponent;
  let fixture: ComponentFixture<TenantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TenantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
