import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingInstructionsComponent } from './billing-instructions.component';

describe('BillingInstructionsComponent', () => {
  let component: BillingInstructionsComponent;
  let fixture: ComponentFixture<BillingInstructionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BillingInstructionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillingInstructionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
