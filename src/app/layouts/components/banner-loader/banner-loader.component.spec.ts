import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerLoaderComponent } from './banner-loader.component';

describe('BannerLoaderComponent', () => {
  let component: BannerLoaderComponent;
  let fixture: ComponentFixture<BannerLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BannerLoaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BannerLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
