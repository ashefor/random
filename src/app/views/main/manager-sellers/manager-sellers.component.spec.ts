import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerSellersComponent } from './manager-sellers.component';

describe('ManagerSellersComponent', () => {
  let component: ManagerSellersComponent;
  let fixture: ComponentFixture<ManagerSellersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManagerSellersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagerSellersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
