import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantFormComponent } from './tenant-form.component';

describe('TenantFormComponent', () => {
  let component: TenantFormComponent;
  let fixture: ComponentFixture<TenantFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenantFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TenantFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
