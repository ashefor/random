import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SupliasComponent } from './suplias.component';

describe('SupliasComponent', () => {
  let component: SupliasComponent;
  let fixture: ComponentFixture<SupliasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SupliasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupliasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
