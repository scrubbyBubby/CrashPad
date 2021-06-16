import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';

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

@Component({
  selector: 'app-customization-category',
  templateUrl: './customization-category.component.html',
  styleUrls: ['./customization-category.component.sass']
})
export class CustomizationCategoryComponent implements OnInit {
  @Input() customizationcategoryinfo: CategoryInfo;

  @Output() changedvalue = new EventEmitter();
  @Output() changedfocus = new EventEmitter();

  public name;
  public customizationArray;
  public coverLock: boolean = false;
  public element;
  public customizationCategoryId: String;
  public mainElement: HTMLElement;
  public categoryStyling;
  public verticalCover = false;

  constructor() { }

  ngOnInit() {
    Object.keys(this.customizationcategoryinfo).forEach(prop => {
      this[prop] = this.customizationcategoryinfo[prop];
      if (prop === 'customizationGridArea') {
        console.dir(this[prop]);
      }
    });
    this.customizationCategoryId = `${this.name.split(" ").join("-")}-customization-category`.toLowerCase();
  }

  ngAfterViewInit() {
    this.watchMousePosition();
  }

  handleValueChange(evt, customization) {
    const changedValue = {
      category: this.name,
      customization: customization.name,
      newValue: evt
    };

    this.changedvalue.next(changedValue);
  }

  fadeCover(element, mode: String): void {
    if (this.coverLock) {
      return;
    }

    const coverElement = element.querySelector('.category-cover');
    const opacity: number = (mode === 'in') ? 1 : 0;
    coverElement.style.opacity = opacity;
  }

  handleFocusChange(evt, customization) {
    const changedFocus = {
      category: this.name,
      customization: customization.name,
      focusEvent: evt
    };

    this.coverLock = (evt.focus === 'focus') ? true : false;

    this.changedfocus.next(changedFocus);
  }

  watchMousePosition() {
    const self = this;
    document.addEventListener('mousemove', function(e) {
      const { clientX: x, clientY: y } = e;
      const inside = self.checkMouseInside(x, y);

      const coverElement: HTMLElement = document.querySelector(`#${self.customizationCategoryId} .category-cover`);
      if (inside) {
        coverElement.classList.add('hidden-category-cover');
      } else {
        coverElement.classList.remove('hidden-category-cover');
      }
    });
  }

  checkMouseInside(x, y): boolean {
    const elementId = `#${this.customizationCategoryId}`;
    const element: HTMLElement = document.querySelector(elementId);
    const boundingRect = element.getBoundingClientRect();

    const minX: number = boundingRect.x,
      maxX: number = minX + boundingRect.width,
      minY: number = boundingRect.y,
      maxY: number = minY + boundingRect.height;
    
    const inXRange: boolean = x >= minX && x <= maxX;
    const inYRange: boolean = y >= minY && y <= maxY;

    return inXRange && inYRange;
  }
}
