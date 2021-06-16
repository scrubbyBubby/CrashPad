import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';

interface FlexInputInfo { 
  name: String, 
  type: String, 
  initialValue: String, 
  typeoptions?
};

interface ButtonInfo {
  text: String,
  action: Function
};

interface ButtonObject {
  submit: ButtonInfo,
  cancel: ButtonInfo,
  close: ButtonInfo
};

interface CategoryInfo {
  name: String,
  customizationArray: FlexInputInfo[]
};

interface CustomizationBoxInfo {
  name: String, 
  boxStyling,
  categoryArray: CategoryInfo[],
  buttonObject: ButtonObject
};

@Component({
  selector: 'app-customization-box',
  templateUrl: './customization-box.component.html',
  styleUrls: ['./customization-box.component.sass']
})
export class CustomizationBoxComponent implements OnInit {
  @Input() customizationboxinfo: CustomizationBoxInfo;
  @Input() headerText: string;
  
  @Output() changedvalue = new EventEmitter();
  @Output() changedfocus = new EventEmitter();

  public name: String;
  public categoryArray: CategoryInfo[];
  public buttonObject: ButtonObject;
  public boxStyling;

  constructor() {
  }

  ngOnInit() {
    Object.keys(this.customizationboxinfo).forEach(prop => {
      this[prop] = this.customizationboxinfo[prop];
    });
  }

  handleValueChange(evt) {
    const changedValue = {
      ...evt,
      box: this.name
    };

    this.changedvalue.next(changedValue);
  }

  handleFocusChange(evt) {
    const changedFocus = {
      ...evt,
      box: this.name
    };

    this.changedfocus.next(changedFocus);
  }
}
