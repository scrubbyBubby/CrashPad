import { Component, OnInit, Input } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

import { ElementService } from '../element.service';
import { ContainerService } from '../container.service';
import { CcViewService } from '../cc-view.service';
import { FlowControlService } from '../flow-control.service';
import { PadManagerService } from '../pad-manager.service';
import { ChecklistOverlayService } from '../checklist-overlay.service';
import { ToolTipService } from '../tool-tip.service';

@Component({
  selector: 'app-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.sass']
})
export class ContainerComponent implements OnInit {
  @Input() uid: string;
  @Input() containerUID: string;
  @Input() mainView: boolean = false;
  @Input() connectedTo: any = [];
  @Input() preview: boolean = false;
  @Input() mode: string;
  @Input() customContent;
  @Input() mainPad: boolean = false;

  public containerIconText: string;
  public addElementText: string;

  public uiList: Array<string>;

  public orientation: string = "vertical";

  private maxPads: number = 10;

  public showControls: boolean = true;

  public padNavTestList: Array<string> = [];

  public hoveredPad: string = undefined;

  public hoverStyles = {};

  public firstPad: boolean = false;

  public headerSelected: boolean = false;
  public firstOpen: boolean = true;

  public listElement;
  public mobile: boolean = false;

  public toolTips = {
    'mainMenu': 'Main Menu',
    'managePads': 'Pad Navigator',
    'createPad': "Add Pad",
    'moveLeft': 'Move Pads Left',
    'moveRight': 'Move Pads Right',
    'pinnedChecklist': 'Open Pinned Checklist'
  }

  constructor(
    public elementService: ElementService,
    public ccView: CcViewService,
    private containerService: ContainerService,
    public flowService: FlowControlService,
    public padManager: PadManagerService,
    public checklistOverlayService: ChecklistOverlayService,
    public toolTipService: ToolTipService,
  ) { }

  ngOnInit(): void {
    window.onresize = () => {
      const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
      this.mobile = (vw <= 700) ? true : false;
      console.log(`Mobile is ${this.mobile}`);
    };
    let element = this.elementService.elements[this.uid];
    if (element === undefined) {
      this.elementService.createNewElement(this.uid,'container');
    }

    this.elementService.initializeElement(this.uid);

    if (this.mainView) {
      this.orientation = 'horizontal';
      setTimeout(() => {
        this.flowService.assembleScrollStates();
      },100)
    };
    this.assembleUIList();
    this.assembleTextListForPadNavigator();
    if (this.firstOpen && this.uid === 'masterContainer') {
      setTimeout(() => {
        const containerElement = document.getElementById('main-pad-view-container');
        containerElement.style.opacity = "0";
        containerElement.style.scrollBehavior = 'auto';
        this.flowService.moveScrollToIndex('main-pad-view-container',1,true, true);
        containerElement.style.scrollBehavior = 'smooth';
        containerElement.style.opacity = "1";
      }, 500)
    }
    this.firstPad = true;
    this.firstOpen = false;
  }

  ngAfterViewInit(): void {
    this.listElement = document.getElementById(`${this.uid}-container`);
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    this.mobile = (vw <= 700) ? true : false;
  }

  setSelectedHeader(state: boolean): void {
    this.headerSelected = state;
  }

  setHoveredPad(ui?: string) {
    const oldUI: string = this.hoveredPad;
    this.hoveredPad = undefined;
    this.getHoveredStyle(oldUI);
    this.hoveredPad = ui;
    this.getHoveredStyle(ui);
  }

  getHoveredStyle(ui: string) {
    const hovered: boolean = (this.hoveredPad === ui) ? true : false;
    console.log(`UI ${ui} is ${hovered ? '':'not '}hovered.`);
    const style = hovered ? this.elementService.elements[this.uid].parsedCustomization.reverseTextTag :
      this.elementService.elements[this.uid].parsedCustomization.textTag;
    this.hoverStyles[ui] = style;
  }

  setNavigatorMode(mode: string): void {
    this.padManager.setPadNavigatorTab(mode);
  }

  assembleTextListForPadNavigator(): void {
    const newPadNavTestList: Array<string> = [];
    for (var i = 0; i < 30; i++) {
      newPadNavTestList.push(`${i+1}`);
    }
    this.padNavTestList = newPadNavTestList;
  }

  assembleUIList(): void {
    const pullUIListFromElementService = () => {
      const elementUIs: Array<string> = this.elementService.elements[this.uid].parsedCustomization.content.elementUIs || [];
      this.uiList = elementUIs;
      this.containerService.uiLists[this.uid] = this.uiList;
    }

    pullUIListFromElementService();
  }

  getCustomContent() {
    return Object.assign({},this.elementService.elements[this.uid].parsedCustomization.content,this.customContent);
  }

  setAddElementText(text: string): void {
    this.addElementText = text;
  }

  setContainerIconText(text: string): void {
    const textIsUndefined: boolean = (text === undefined) ? true : false;
    const waitingElementIsUndefined: boolean = (this.elementService.waitingElement === undefined) ? true : false;
    const thisElementIsWaitingElement: boolean = (this.elementService.waitingElement == this.uid) ? true : false;
    const thisElementIsWaitingContainer: boolean = (this.elementService.waitingContainer === this.uid) ? true : false;

    if (textIsUndefined || (!waitingElementIsUndefined && !thisElementIsWaitingElement && !thisElementIsWaitingContainer)) {
      this.containerIconText = text;
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      const ui: string = this.elementService.elements[this.uid].customization['content:elementUIs'][event.previousIndex];
      this.elementService.elements[this.uid].customization['content:elementUIs'].splice(event.previousIndex,1);
      const newIndex = (event.previousIndex < event.currentIndex) ? event.currentIndex - 1 : event.currentIndex;
      this.elementService.elements[this.uid].customization['content:elementUIs'].splice(newIndex, 0, ui);
      const customization = this.elementService.elements[this.uid].customization;
      this.elementService.fullParse(this.uid,customization,true);
      //moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    }
    //this.elementService.elements[this.uid].parsedCustomization.content.elementUIs = this.uiList.slice();
    this.elementService.saveElements();
    return;
  }

  navigatorDrop(event: CdkDragDrop<string[]>) {
    const previousIndex = event.previousIndex;
    const newIndex = event.currentIndex;
    const ui: string = this.flowService.displayUIList[previousIndex];
    let top10: Array<string> = this.flowService.top10UI.slice();

    const protocols = {
      'moveWithinTop10': () => {
        const subProtocols = {
          'shiftUp': () => {
            for (var i = previousIndex; i<newIndex; i++) {
              const topUI: string = top10[i];
              this.elementService.elements[topUI].top10Rank = i;
            }
          },
          'shiftDown': () => {
            for (var i = newIndex; i<previousIndex; i++) {
              const topUI: string = top10[i];
              this.elementService.elements[topUI].top10Rank = i + 1;
            }
          },
        }
        const subProtocol: string = (previousIndex < newIndex) ? 'shiftUp' : 'shiftDown';
        this.elementService.elements[ui].top10Rank = newIndex;
        subProtocols[subProtocol]();
      },
      'moveIntoTop10': () => {
        console.log(`Moving ${ui} to index ${newIndex} in top10`);
        top10.splice(newIndex,0,ui);
        top10.forEach((topUI, i) => {
          if (i < 10) {
            this.elementService.elements[topUI].top10Rank = i;
          } else {
            delete this.elementService.elements[topUI].top10Rank;
          }
        })
      },
      'moveFromTop10': () => {
        delete this.elementService.elements[ui].top10Rank;
        top10.splice(previousIndex,1);
        const newTop: string = this.flowService.after10.splice(0,1)[0];
        top10.push(newTop);
        for (var i = previousIndex; i<top10.length; i++) {
          const topUI: string = top10[i];
          this.elementService.elements[topUI].top10Rank = i;
        }
      },
      'default': () => {
        
      },
    }

    console.log(`Previous index was ${previousIndex} and new index is ${newIndex}.`); 

    const protocol: string = 
      (previousIndex < 10 && newIndex < 10) ? 'moveWithinTop10' : 
      (previousIndex >= 10 && newIndex < 10) ? 'moveIntoTop10' : 
      (previousIndex < 10 && newIndex >= 10) ? 'moveFromTop10' : 'default';

    console.log(`Running protocol ${protocol}`);
    
    protocols[protocol]();
    this.flowService.assembleDisplayList(true);
    //Still need to add code to detect if this is a top 10 move. If so we need to remove the bottom element and recalculate the list for alphebetization purposes.
  }

  mainDrop(event: CdkDragDrop<string[]>): void {
    console.log(`Dropping from index ${event.previousIndex} in ${JSON.stringify(event.previousContainer.data)}`);
    console.log(`To index ${event.currentIndex} in ${JSON.stringify(event.container.data)}`);
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
    }
    const customization = this.elementService.elements[this.uid].customization;
    this.elementService.fullParse(this.uid,customization,true);
    this.elementService.saveElements();
    return;
  }

  moveWaitingElementTo(uid: string): void {
    const waitingElement = this.elementService.waitingElement;
    const waitingContainer = this.elementService.waitingContainer;
    const moved: boolean = this.elementService.moveWaitingElementTo(uid);
    if (moved) {
      const index = this.containerService.uiLists[waitingContainer].indexOf(waitingElement);
      const waitingElementIsInWaitingContainer: boolean = (index != -1) ? true : false;
      if (waitingElementIsInWaitingContainer) {
        console.log(`Number of items in waiting container before move ${this.containerService.uiLists[waitingContainer].length}`);
        this.containerService.uiLists[waitingContainer] = this.containerService.uiLists[waitingContainer].filter(ui => {(ui != waitingElement)});
        console.log(`Number of items in waiting container after move ${this.containerService.uiLists[waitingContainer].length}`);
        this.containerService.uiLists[uid].push(waitingElement);
      }
    }
  }

  postHeader(): void {
    const id: string = `${this.uid}-title`;
    const text: string = document.getElementById(id).innerText;
    this.containerService.postHeader(this.uid,text);
  }

  makeArray(a: Array<string>): Array<string> {
    const newArray: Array<string> = [];
    for (var i = 0; i<a.length; i++) {
      const arrayVal = a[i];
      if (arrayVal === undefined || i >= this.maxPads) {
        break;
      }
      newArray.push(arrayVal);
    }
    return newArray;
  }

  revealControls(state?: boolean): void {
    state = (state === undefined) ? !this.showControls : state;
    this.showControls = state;
    console.log(`After setting state ${state} showControls are ${this.showControls}`);
  }

  closeOtherMenusIfMobile(toggling?: string): void {
    if (this.mobile) {
      if (toggling != 'mainMenu') {
        this.containerService.setMainMenu(false);
      }
      if (toggling != 'overlay') {
        this.checklistOverlayService.setOpen(false);
      }
    }
  }

  public draggings = {};
  setDragging(state: boolean, targetId: string) {

    const timestep: number = 13;
    const totalScrollTime: number = 13;
    const proportion = timestep * 1.0 / totalScrollTime;

    const maxScroll = 1000;

    const proportionalScrollDown = ((false) ? (this.listElement.scrollWidth - this.listElement.offsetWidth) : (this.listElement.scrollHeight - this.listElement.offsetHeight)) * (proportion);
    const proportionalScrollUp = proportionalScrollDown * -1;
    const scrollUp = Math.max(-1 * maxScroll, proportionalScrollUp);
    const scrollDown = Math.min(maxScroll, proportionalScrollDown);
    console.log(`Derived scrollUp is ${scrollUp} and scrollDown is ${scrollDown}`);
    console.log(`Setting dragging to ${state} for ${targetId}`);
    this.draggings[targetId] = state;
  }
  
  public scrollInts = {};
  public scrollingProtocols = {};
  scroll(scrollingProtocol: string = 'none', targetId: string, horizontal: boolean = false) {
    console.log(`Setting scrolling protocol to ${scrollingProtocol}`);
    this.scrollingProtocols[targetId] = scrollingProtocol;
    const listElement = document.getElementById(targetId);

    const timestep: number = 13;
    const totalScrollTime: number = 13;
    const proportion = timestep * 1.0 / totalScrollTime;

    const maxScroll = 1000;

    const proportionalScrollDown = ((horizontal) ? (listElement.scrollWidth - listElement.offsetWidth) : (listElement.scrollHeight - listElement.offsetHeight)) * (proportion);
    const proportionalScrollUp = proportionalScrollDown * -1;
    const scrollUp = Math.max(-1 * maxScroll, proportionalScrollUp);
    const scrollDown = Math.min(maxScroll, proportionalScrollDown);

    console.log(`ScrollMag ${scrollDown}`);

    const scrollingProtocolRef = {
      'up': scrollUp,
      'down': scrollDown,
      'none': 0,
    }

    const startScrollInt = () => {
      if (this.scrollInts[targetId] === undefined) {
        listElement.style.scrollBehavior = 'auto';
        let intFunction;
        if (!horizontal) {
          intFunction = () => {
            listElement.scrollTop = listElement.scrollTop + scrollingProtocolRef[this.scrollingProtocols[targetId]];
          }
        } else {
          intFunction = () => {
            listElement.scrollLeft = listElement.scrollLeft + scrollingProtocolRef[this.scrollingProtocols[targetId]];
          }
        }
        this.scrollInts[targetId] = setInterval(intFunction,timestep)
      }
    }

    const stopScrollInt = () => {
      if (this.scrollInts[targetId] != undefined) {
        clearInterval(this.scrollInts[targetId]);
        this.scrollInts[targetId] = undefined;
        listElement.style.scrollBehavior = 'smooth';
      }
    }

    const protocols = {
      'scroll': () => {
        startScrollInt();
      },
      'stopScroll': () => {
        stopScrollInt();
      },
    }

    const protocol = (scrollingProtocol === 'up' || scrollingProtocol === 'down') ? 'scroll' : 'stopScroll';
    if (this.draggings[targetId]) {
      console.log(`Dragging is live so we are executing protocol ${protocol}`);
      protocols[protocol]();
    }
  }

  getMobile() {
    console.log(`Providing mobile as ${this.mobile}`);
    return this.mobile;
  }
  
  selectElementContents(el) {
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
}
