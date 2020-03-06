import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyPasscodeComponent } from './verify-passcode.component';

describe('VerifyPasscodeComponent', () => {
  let component: VerifyPasscodeComponent;
  let fixture: ComponentFixture<VerifyPasscodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerifyPasscodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyPasscodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
