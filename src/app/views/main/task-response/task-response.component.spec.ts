import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskResponseComponent } from './task-response.component';

describe('TaskResponseComponent', () => {
  let component: TaskResponseComponent;
  let fixture: ComponentFixture<TaskResponseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskResponseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskResponseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
