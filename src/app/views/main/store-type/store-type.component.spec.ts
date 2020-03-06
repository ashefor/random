import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreTypeComponent } from './store-type.component';

describe('StoreTypeComponent', () => {
  let component: StoreTypeComponent;
  let fixture: ComponentFixture<StoreTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
