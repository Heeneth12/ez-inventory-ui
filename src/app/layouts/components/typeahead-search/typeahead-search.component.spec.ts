import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeaheadSearchComponent } from './typeahead-search.component';

describe('TypeaheadSearchComponent', () => {
  let component: TypeaheadSearchComponent<any>;
  let fixture: ComponentFixture<TypeaheadSearchComponent<any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeaheadSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeaheadSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
