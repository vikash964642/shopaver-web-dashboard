import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletedSlugs } from './deleted-slugs';

describe('DeletedSlugs', () => {
  let component: DeletedSlugs;
  let fixture: ComponentFixture<DeletedSlugs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeletedSlugs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeletedSlugs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
