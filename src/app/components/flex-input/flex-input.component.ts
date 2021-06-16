import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';

@Component({
  selector: 'app-flex-input',
  templateUrl: './flex-input.component.html',
  styleUrls: ['./flex-input.component.sass']
})
export class FlexInputComponent implements OnInit {
  @Input() flexinputinfo: { name: String, type: String, initialValue: String, typeOptions };

  @Output() newvalue = new EventEmitter();
  @Output() focuschild = new EventEmitter();

  public storedValue: String;
  public name;
  public type;
  public initialValue;
  public typeOptions = {};

  constructor() { }

  ngOnInit() {
    Object.keys(this.flexinputinfo).forEach(prop => {
      this[prop] = this.flexinputinfo[prop];
      console.log(prop, this[prop]);
    });

    this.storedValue = this.flexinputinfo.initialValue;
  }

  setNewValue(evt): void {
    const typeCallbacks: { text: Function, color: Function, dropdown: Function } = {
      text: (evt) => {
        
      },
      color: (evt) => {
        this.storedValue = evt.target.value;
      },
      dropdown: (evt) => {
        
      }
    };

    typeCallbacks[`${this.type}`](evt);

    this.newvalue.next(evt.target.value);
  }

  handleFocus(state, inputType) {
    const focus = (state) ? "focus" : "blur";

    const focusChildObject = {
      type: this.type,
      focus,
      inputType
    };

    this.focuschild.next(focusChildObject);
  };

  transform(): void {
    this.newvalue.next('Test succeeded!');
  }
}
