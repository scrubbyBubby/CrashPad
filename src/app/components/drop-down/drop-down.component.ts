import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ElementService } from '../../services/element/element.service';

@Component({
  selector: 'app-drop-down',
  templateUrl: './drop-down.component.html',
  styleUrls: ['./drop-down.component.sass']
})
export class DropDownComponent implements OnInit {
  @Input() listItems: Array<string> = [];
  @Input() choiceType: string = 'none';
  @Input() placeholder: string = '(none)';
  @Input() maxHeight: number = 230;
  @Input() maxViewable: number = 10;
  @Input() open: boolean = false;
  @Input() choice: string;
  @Input() backgroundColor: string = "#FFFFFF";
  @Input() color: string = "#000000";
  @Input() emptyValue: string = "(none)";

  @Output() ddOpen = new EventEmitter<boolean>();
  @Output() ddChoice = new EventEmitter<string>();

  public choiceListStyling = {};
  private defaultChoiceListStyling = {};
  public mainListStyling = {};
  public choiceStyling = {};
  public flip: boolean = false;

  constructor(
      public elementService: ElementService,
  ) {
  }

  ngOnInit(): void {
    //console.log(`List Items: ${this.listItems.length}`);
    this.choice = (this.choice === undefined) ? this.placeholder : this.choice;
    this.maxViewable = (this.maxViewable < 5) ? 5 : this.maxViewable;
    const maxHeight = (this.maxHeight < (this.maxViewable * 23)) ? this.maxHeight : (this.maxViewable * 23) - 1;
    this.choiceListStyling = {
      maxHeight: `${maxHeight}px`,
      opacity: 0,
      position: 'absolute',
    };
    this.defaultChoiceListStyling = Object.assign({}, this.choiceListStyling);
    this.mainListStyling = {
      background: this.backgroundColor,
      color: this.color,
    };
  }

  setListOpen(state?: boolean, event?): void {
    console.log(`Checking clearance to open`);
    console.log(`Setting list open!`);
    const newState: boolean = (state === undefined) ? !this.open : state;
    if (!newState) {

      /*
      this.choiceListStyling['opacity'] = 0;
      this.choiceListStyling['order'] = 0;
      this.mainListStyling['top'] = `0px`;
      this.choiceStyling = {};
      */
    }
    this.flip = false;
    if (newState) {
      const callbackFunction = function(self,elem, state) {
        return () => {
          self.checkClearanceToOpen(elem, state);
        }
      }(this, event.currentTarget, newState);
      setTimeout(() => {
        callbackFunction();
      },50)
    } else {
      //this.choiceListStyling = Object.assign({}, this.defaultChoiceListStyling);
      this.open = newState;
      this.ddOpen.emit(newState);
    }
  }

  checkClearanceToOpen(element, newState: boolean): void {
    const dropElement = element.getBoundingClientRect();

    const clientY = dropElement.y;

    let height: number = 0;
    console.log(`Element has ${element.childNodes.length} children.`);
    for (var i = 0; i<element.childNodes.length; i++) {
      const thisHeight = element.childNodes[i].offsetHeight;
      console.log(`Height of child ${i} is ${thisHeight}`);
      height += thisHeight;
    }
    const maxY: number = height + clientY;

    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

    console.log(`Y: ${clientY} | Height: ${dropElement.height}`);
    console.log(`MaxY is ${maxY} | vh is ${vh}`);

    const flip: boolean = (maxY + 10 >= vh) ? true : false;
    console.log(`Setting flip to ${flip}`);
    this.flip = flip;

    /*
    this.choiceListStyling['order'] = (flip) ? -1 : 0;
    this.mainListStyling['top'] = (flip) ? `-${dropElement.height - 26}px` : `0px`;
    if (flip) {
      console.log(`Flipping so adjusting borders`);
      this.choiceStyling['border'] = `none !important`
    };
    */
    
    setTimeout(() => {
      this.choiceListStyling['opacity'] = (newState) ? '1' : '0';
      this.choiceListStyling['position'] = (newState) ? 'static' : 'absolute';
      this.open = newState;
      this.ddOpen.emit(newState);
    },10)
  }

  selectItem(item: string): void {
    const choiceAllowed: boolean = (this.listItems.indexOf(item) != -1) ? true : false;
    if (choiceAllowed) {
      this.choice = item;
      this.ddChoice.emit(item);
    }
  }
}
