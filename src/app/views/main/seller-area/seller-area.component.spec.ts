import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SellerAreaComponent } from './seller-area.component';

describe('SellerAreaComponent', () => {
  let component: SellerAreaComponent;
  let fixture: ComponentFixture<SellerAreaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SellerAreaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SellerAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
