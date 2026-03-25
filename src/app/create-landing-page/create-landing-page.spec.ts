import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateLandingPage } from './create-landing-page';

describe('CreateLandingPage', () => {
  let component: CreateLandingPage;
  let fixture: ComponentFixture<CreateLandingPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateLandingPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateLandingPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
