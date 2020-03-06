import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManufacturerPartyComponent } from './manufacturer-party.component';

describe('ManufacturerPartyComponent', () => {
  let component: ManufacturerPartyComponent;
  let fixture: ComponentFixture<ManufacturerPartyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManufacturerPartyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManufacturerPartyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
