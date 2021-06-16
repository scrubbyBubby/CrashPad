import { Component, OnInit, Input } from '@angular/core';
import { ElementService } from '../../services/element/element.service';
import { ChecklistService } from '../../services/checklist/checklist.service';
import { FormBuilder } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ChecklistOverlayService } from '../../services/checklist-overlay/checklist-overlay.service';
import { CcViewService } from '../../services/cc-view/cc-view.service';
import { FlowControlService } from '../../services/flow-control/flow-control.service';
import { PadManagerService } from '../../services/pad-manager/pad-manager.service';
import { ToolTipService } from '../../services/tool-tip/tool-tip.service';
import { ContainerService } from '../../services/container/container.service';

interface ChecklistFilter {
  checked: boolean,
  itemObj: Object,
}

function pushToggle(targetArray: Array<string>, item: string, pushTo?:boolean): Array<string> {
  const index = targetArray.indexOf(item);
  if (index != -1) {
    if (pushTo === undefined || pushTo === false) {
      targetArray.splice(index,1);
    }
  } else {
    if (pushTo === undefined || pushTo === true) {
      targetArray.push(item);
    }
  }
  return targetArray;
}

@Component({
  selector: 'app-checklist',
  templateUrl: './checklist.component.html',
  styleUrls: ['./checklist.component.sass']
})
export class ChecklistComponent implements OnInit {
  @Input() uid: string;
  @Input() containerUID: string;
  @Input() draggable: boolean = false;
  @Input() preview: boolean = false;
  @Input() mode: string;
  @Input() overlay: boolean = false;

  public currentRemoveEntry: string;

  public dragging: boolean = false;

  public customID: string;

  public expandedItems: Array<string> = [];

  public expandedItem: string;

  public forms = {
    itemForm: this.fb.group({}),
    noteForm: this.fb.group({}),
    header: this.fb.control(''),
  }

  public overlayText: string;

  public customIDRef = {

  }

  public showControls: boolean = true;

  private listElement;

  public mobile: boolean = false;

  public initialInvisibility = {};

  public toolTips = {
    'useOverlay': "Pin Checklist",
  }

  constructor(
    public elementService: ElementService,
    public ccView: CcViewService,
    public checklistService: ChecklistService,
    public containerService: ContainerService,
    private fb: FormBuilder,
    public checklistOverlayService: ChecklistOverlayService,
    public flowService: FlowControlService,
    public padManager: PadManagerService,
    public toolTipService: ToolTipService,
  ) { }

  ngOnInit(): void {
    if (['customize','utilize'].indexOf(this.mode) === -1) {
      this.mode = undefined;
    }
    let element = this.elementService.elements[this.uid];
    if (element === undefined) {
      this.elementService.createNewElement(this.uid,'checklist');
    }

    const updateChecklists = () => {
      this.checklistService.updateChecklists(this.uid);
      this.customID = `${this.uid}ID`;
      this.generateCustomIDs();
      this.updateForm();
    }

    this.elementService.initializeElement(this.uid, updateChecklists);
    this.contracted = this.elementService.elements[this.uid].contracted;
    this.initialInvisibility = {
      opacity: '0 !important',
    }
  }

  ngAfterViewInit(): void {
    this.listElement = document.getElementById(`${this.uid}-container-items-container`);
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    this.mobile = (vw <= 700) ? true : false;
    if (this.contracted) {
      this.contracted = false;
      this.contractList();
    }
    this.initialInvisibility = {};
  }

  generateCustomIDs(): void {
    const itemList: Array<string> = this.elementService.elements[this.uid].content.itemList;
    let c: number = 0;
    itemList.forEach(name => {
      this.customIDRef[name] = `${(this.overlay) ? `overlay`:``}${this.uid}item${(c > 0) ? `${c}`:``}`;
      c++;
    })
    this.customIDRef['header'] = `${(this.overlay) ? `overlay`:``}${this.uid}header`;
    this.customIDRef['dragDropList'] = `${(this.overlay) ? `overlay`:``}${this.uid}dragDropList`;
  }

  getCustomOverlayID(suffix?: string): string {
    let id: string;
    const getMainID = () => {
      id = `${(this.overlay) ? `overlay`:``}${this.uid}`;
    }

    const appendSuffixToID = () => {
      if (suffix != undefined) {
        const suffixCount: number = this.customIDRef[suffix] || 0;
        id += `${suffix}${(suffixCount > 0) ? suffixCount:``}`;
        this.customIDRef[suffix] = suffixCount + 1;
      }
    }

    getMainID();
    appendSuffixToID();
    return id;
  }

  preCheck(item: string, note: boolean = false): void {
    if (note) {
      document.getElementById(`${this.uid}-${item}-note`).innerText = document.getElementById(`${this.uid}-${item}-note`).innerText.trim();
    } else {
      document.getElementById(`${this.uid}-${item}-text`).innerText = document.getElementById(`${this.uid}-${item}-text`).innerText.trim();
    }

    if (this.expandedItem != item) {
      this.toggleExpansion(item);
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      this.elementService.elements[this.uid].customization['content:itemObj'][event.item.data].completed = !this.elementService.elements[this.uid].customization['content:itemObj'][event.item.data].completed;
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
    }
    this.elementService.saveElements();
    return;
  }

  fillValues(): void {
    const element = this.elementService.elements[this.uid];
    const itemList = element.content.itemList;
    const itemObj = element.content.itemObj;
    let id: string, el;
    itemList.forEach(item => {
      id = `${this.uid}-${item}`;
      el = document.getElementById(`${id}-text`);
      el.innerText = itemObj[item].text;
      el = document.getElementById(`${id}-note`);
      el.innerText = itemObj[item].note;
    })
  }

  updateForm(strict: boolean = true): void {
    const customization = this.elementService.elements[this.uid].customization;
    const content = this.elementService.typeParse(this.uid,'content',customization,false);
    const itemObj = content.itemObj;
    const itemList: Array<string> = content.itemList;
    const formList: Array<string> = Object.keys(this.forms.itemForm.value);

    const addNewItemsToForm = () => {
      const addList: Array<string> = itemList.filter(item => formList.indexOf(item) === -1);
      addList.forEach(item => {
        this.forms.itemForm.addControl(item,this.fb.control(itemObj[item].text));
        this.forms.noteForm.addControl(item,this.fb.control(itemObj[item].note || ''));
      });
    }

    const removeMissingItemsFromForm = () => {
      const removeList: Array<string> = formList.filter(item => itemList.indexOf(item) === -1);
      if (strict) {removeList.forEach(item => {
        this.forms.itemForm.removeControl(item);
        this.forms.noteForm.removeControl(item);
      })};
    }

    const updateValuesOfForm = () => {
      const headerText: string = content.title;
      this.forms.header.setValue(headerText);

      const setList: Array<string> = itemList.filter(item => formList.indexOf(item) != -1);
      let patch = {}, notePatch = {};
      setList.forEach(item => {
        patch[item] = itemObj[item].text;
        notePatch[item] = itemObj[item].note || '';
      });
      this.forms.itemForm.patchValue(patch);
      this.forms.noteForm.patchValue(notePatch);
    }

    const updateChecklists = () => {
      this.checklistService.updateChecklists(this.uid);
    }

    addNewItemsToForm();
    removeMissingItemsFromForm();
    updateValuesOfForm();
    updateChecklists();
  }

  check(item: string, state?: boolean): void {
    console.log(`Checking ${item}`);
    const ignoreIfPreview: boolean = (this.preview) ? true : false;

    if (ignoreIfPreview) {return};
    
    const updateItemObj = () => {
      console.log(`Customization on check is ${JSON.stringify(this.elementService.elements[this.uid].customization)}`);
      const oldCompletionState: boolean = this.elementService.elements[this.uid].customization['content:itemObj'][item].completed;
      const newState: boolean = (state === undefined) ? !oldCompletionState : state;
      console.log(`Old completion state was ${oldCompletionState} and new completion state is ${newState}`);
      this.elementService.elements[this.uid].customization['content:itemObj'][item].completed = newState;
      console.log(`Item Object is now ${JSON.stringify(this.elementService.elements[this.uid].customization['content:itemObj'][item])}`);
    }

    const updateChecklistsAndSave = () => {
      this.checklistService.updateChecklists(this.uid);
      this.elementService.saveElements();
    }

    updateItemObj();
    updateChecklistsAndSave();
  }

  getCustomID(item: string): string {
    return `${item}${this.customID}`;
  }

  postText(item: string): void {
    const text: string = this.forms.itemForm.value[item].trim();
    this.checklistService.postText(this.uid,item,text);
  }

  postNote(item: string): void {
    const text: string = this.forms.noteForm.value[item].trim();
    this.checklistService.postNote(this.uid,item,text);
  }

  postHeader(): void {
    const text: string = this.forms.header.value.trim();
    this.checklistService.postHeader(this.uid,text);
  }

  showRemoveEntry(item: string, state: boolean = true): void {
    if (state) {
      this.currentRemoveEntry = item;
    } else if (this.currentRemoveEntry === item) {
      this.currentRemoveEntry = undefined;
    }
  }
  
  addItem(uid: string, scroll: boolean = true): void {
    const itemTag: string = this.checklistService.addItem(uid);
    this.updateForm();
    
    
    const scrollElement = this.listElement;
    console.log(`Total scrollHeight of scrollElement is ${scrollElement.scrollHeight}`);
    if (this.contracted === true) {
      this.contractList();
    }
    this.elementService.setMode('customize');
    const self = this;
    setTimeout(() => {
      const element = document.getElementById(`${uid}-container-items`);
      const children = element.children;
      let scrollTarget: number = 0;
      for (var i = 0; i < children.length - 1; i++) {
        const child = document.getElementById(children[i].id);
        const offsetHeight = child.offsetHeight;
        console.log(`Adding scrollTarget of ${scrollTarget} to offsetHeight of ${offsetHeight}`);
        scrollTarget += offsetHeight;
      }
      //scrollElement.scrollTop = scrollTarget;
      const titleId: string = `${self.uid}-${itemTag}-text`;
      console.log(`TitleID: ${titleId}`);
      const itemTitleElement = document.getElementById(titleId);
      itemTitleElement.focus();
    },150);
  }

  removeItem(item: string): void {
    this.checklistService.removeItem(this.uid,item);
    this.updateForm();
  }

  toggleExpansion(item: string): void {
    /*
    const expansionNotAllowed: boolean = 
      ((this.elementService.mode === 'customize' && !this.overlay) || this.forms.noteForm.value[item] === '') 
      ? true : false;
    if (expansionNotAllowed) {return};
    */
    const closingItem: boolean = (this.expandedItem === item) ? true : false;
    const scrollingList: boolean = (!closingItem && item != undefined) ? true : false;

    console.log(`Closing item ${closingItem} | Scrolling List ${scrollingList}`);
    this.expandedItem = undefined;

    const element = document.getElementById(this.customIDRef[item]);
    console.log(`Element does ${(element === undefined || element === null) ? 'not ':''}exist.`);

    const scrollListElement = function(self, elem, item, containerUID) { 
      return () => {
        console.log(`Beginning scrolling...`);
        const scrollTarget = elem.offsetTop - 30;

        console.log(`Scroll target is ${scrollTarget}`);
        const listElement = self.listElement;
        console.log(`List element does ${(listElement === undefined || listElement === null) ? 'not ':''}exist.`);
        listElement.scrollTop = scrollTarget;
        if (self.contracted) {
          self.contracted = false;
          setTimeout(() => {
            self.contractList();
          },50)
        }
      }
    }(this, element, item, this.uid);

    if (scrollingList) {
      console.log(`Scrolling list...`);
      this.expandedItem = (this.expandedItem === item) ? undefined : item;
      setTimeout(() => {
        console.log(`Timeout finished...`);
        //scrollListElement();
      },100)
    } else {
      this.expandedItem = (closingItem) ? undefined : item;
      if (this.contracted) {
        const self = this;
        setTimeout(() => {
          self.contracted = false;
          self.contractList();
        },50)
      }
    }


    pushToggle(this.expandedItems,item);
  }

  setOverlayText(value: string): void {
    this.overlayText = value;
  }

  revealControls(state?: boolean): void {
    state = (state === undefined) ? !this.showControls : state;
    this.showControls = state;
    console.log(`After setting state ${state} showControls are ${this.showControls}`);
  }

  setDragging(state: boolean) {
    console.log(`Setting dragging to ${state}`);
    this.dragging = state;
    if (state === false) {
      this.listElement.style.scrollBehavior = 'auto';
    } else {
      this.listElement.style.scrollBehavior = 'smooth';
    }
  }
  
  public scrollInt: number;
  public scrollingProtocol: string = 'none';
  scroll(scrollingProtocol: string = 'none') {
    console.log(`Setting scrolling protocol to ${scrollingProtocol}`);
    this.scrollingProtocol = scrollingProtocol;

    const scrollingProtocolRef = {
      'up': -5,
      'down': 5,
      'none': 0,
    }

    const startScrollInt = () => {
      if (this.scrollInt === undefined) {
        this.listElement.style.scrollBehavior = 'auto';
        this.scrollInt = setInterval(() => {
          this.listElement.scrollTop = this.listElement.scrollTop + scrollingProtocolRef[this.scrollingProtocol];
        },13)
      }
    }

    const stopScrollInt = () => {
      if (this.scrollInt != undefined) {
        clearInterval(this.scrollInt);
        this.scrollInt = undefined;
        this.listElement.style.scrollBehavior = 'smooth';
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
    if (this.dragging) {
      protocols[protocol]();
    }
  }

  public contracted: boolean = false;

  contractList(): void {
    const viewId: string = `${this.uid}-container-items-container`;
    const viewElement = document.getElementById(viewId);

    const wrapperId: string = `${this.customIDRef['dragDropList']}`;
    const wrapperElement = document.getElementById(wrapperId);

    const protocols = {
      'contract': () => {
        const containerId = `${this.uid}-container-items`;
        const containerElement = document.getElementById(containerId);
    
        const firstItem = containerElement.firstElementChild;
        if (firstItem != undefined && firstItem != null) {
          const newMaxHeight = firstItem['offsetHeight'] + 50;
          wrapperElement.style.maxHeight = `${newMaxHeight}px`;
          viewElement.style.maxHeight = `${newMaxHeight}px`;
          viewElement.style.overflowY = "hidden";
          console.log(`Max height is now ${newMaxHeight}`);
        }
      },
      'expand': () => {
        console.log(`Expanding and removing attributes`)
        wrapperElement.style.maxHeight = "";
        viewElement.style.maxHeight = "";
        viewElement.style.overflowY = "";
      },
    }

    if (this.elementService.mode === 'customize') {return};
    const protocol = (this.contracted) ? 'expand' : 'contract';
    protocols[protocol]();
    this.contracted = (this.contracted) ? false : true;
    this.elementService.elements[this.uid].contracted = this.contracted;
    this.elementService.saveElements();
  }

  public hoverContracted: boolean = false;

  hoverContract(newState?: boolean) {
    newState = (newState === undefined) ? !this.hoverContracted : newState;
    this.hoverContracted = newState;
  }

  public hoveredArrow: string = undefined;
  public hoverArrow(hoverTarget?: string): void {
    this.hoveredArrow = hoverTarget;
  }
  
  selectElementContents(el) {
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  checkReturn(event, item: string, currentIsNote: boolean = false) {
    const keyCode = event.key;
    if (keyCode === 'Enter') {
      this.nextFocusPoint(item, currentIsNote);
      return false;
    }
  }

  nextFocusPoint(item: string, currentIsNote: boolean = false) {
    const self = this;
    const itemList = this.checklistService.checklists[this.uid].unchecked;
    const containerElement = document.getElementById(`${this.uid}-container-items`);
    const scrollTarget = containerElement.scrollTop;
    console.log(`ScrollTarget initially is ${scrollTarget}`);
    
    const protocols = {
      'nextItem': () => {
        const subProtocols = {
          'addItem': () => {
            this.addItem(this.uid);
          },
          'focusNextItem': () => {
            const focusId = `${this.uid}-${item}-text`;
            console.log(`Focusing element with id ${focusId}`);
            document.getElementById(focusId).focus();
          },
        }

        const subProtocol: string = itemList.indexOf(item) >= itemList.length - 1 ? 'addItem' : 'focusNextItem';
        subProtocols[subProtocol]();
      },
      'focusNote': () => {
        if (this.expandedItem != undefined && this.expandedItem != item) {
          this.toggleExpansion(this.expandedItem);
        }
        setTimeout(() => {
          if (self.expandedItem != item) {
            self.toggleExpansion(item);
          }
        },75)
        const focusId = `${this.uid}-${item}-note`;
        console.log(`Focusing element with id ${focusId}`);
        setTimeout(() => {
          document.getElementById(focusId).focus();
        },150)
      }
    }

    const protocol: string = (currentIsNote) ? 'nextItem' : 'focusNote';
    protocols[protocol]();
  }
}
