import { Injectable } from '@angular/core';
import { ChecklistService } from '../checklist/checklist.service';
import { ElementService } from '../element/element.service';
import { PadManagerService } from '../pad-manager/pad-manager.service';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class ChecklistOverlayService {

  public overlayUI: string;
  public expanded: boolean = false;
  public open: boolean = undefined;

  //old Target 'checklistOverlayContent'
  private expansionBoxId: string = "new-checklist-overlay-content";

  public checklists = {

  }

  constructor(
    private elementService: ElementService,
    private checklistService: ChecklistService,
    private storage: StorageService,
  ) {
    const int = setInterval(() => {
      if (this.elementService.elements != undefined && Object.keys(this.elementService.elements).length > 0) {
        clearInterval(int);
        this.loadOverlayUI();
      }
    },100)
  }

  saveOverlayUI(force: boolean = false): void {
    if (this.overlayUI != undefined || force) {
      const saveUI: string = (this.overlayUI === undefined) ? '' : this.overlayUI;
      setTimeout(() => {
        this.storage.setValue('pinnedChecklistUI', saveUI, 'local');
      }, 500)
    }
  }

  loadOverlayUI(force: boolean = false): void {
    if (this.overlayUI === undefined || force) {
      let loadUI: string = this.storage.getValue('pinnedChecklistUI', 'local');
      loadUI = (loadUI === undefined || loadUI === null) ? '' : loadUI;
      console.log(`Setting overlay to loaded value.`);
      this.setOverlayUI(loadUI, false);
    }
  }

  setOverlayUI(ui?: string, open: boolean = false): void {
    ui = (ui === '') ? undefined : ui;
    console.log(`Setting overlay UI to ${ui}...`);

    let uiUpdated: boolean = false;

    const uiAlreadySet: boolean = (this.overlayUI === ui) ? true : false;

    const setOverlayUI = () => {
      const protocols = {
        'unsetUI': () => {
          if (this.overlayUI != undefined) {uiUpdated = true};
          this.overlayUI = undefined;
        },
        'setUI': () => {
          const element = this.elementService.elements[ui];
          if (element === undefined) {return};
          const elementIsChecklist: boolean = (element.elementType === 'checklist') ? true : false;
          const uncompletedItems: Array<string> = element.content.itemList.filter(item => {
            return !element.content.itemObj[item].completed;
          });
          const checklistNotFinished: boolean = (uncompletedItems.length > 0) ? true : false;
          if (elementIsChecklist && checklistNotFinished) {
            if (this.overlayUI != ui) {uiUpdated = true};
            this.overlayUI = ui;
          }
        },
      };

      const protocol: string = (ui === undefined) ? 'unsetUI' : 'setUI';
      console.log(`Protocol is ${protocol}`);
      protocols[protocol]();
      this.saveOverlayUI();
    }

    const setExpansionAndOpen = () => {
      if (uiUpdated) {
        const newExpanded: boolean = false;
        const newOpen: boolean = (ui === undefined) ? false : true;
        const openFunction: Function = function(opened,self) {
          return () => {
            self.setExpanded(newExpanded);
            if (open) {self.setOpen(newOpen)};
          }
        }(open,this);
        setTimeout(openFunction,100);
      }
    }
    
    if (uiAlreadySet && ui != undefined) {
      this.setExpanded(false);
      this.setOpen(true);
    } else {
      setOverlayUI();
      setExpansionAndOpen();
    }
    console.log(`Expansion is now ${this.expanded}`);
  }

  setOpen(value?: boolean): boolean {
    const newOpen: boolean = (value === undefined) ? !this.open : value;
    if (!(this.open === undefined && newOpen === false)) {
      this.open = newOpen;
      console.log(`Setting checklist overlay open to ${newOpen}`);
    }
    return newOpen;
  }

  setExpanded(value?: boolean): boolean {
    console.log(`Setting expanded with ChecklistOverlayService to ${(value === undefined) ? 'undefined':value}. OverlayUI is ${this.overlayUI}`);
    const overlayExists: boolean = (this.overlayUI != undefined) ? true : false;
    console.log(`Overlay ${overlayExists ? 'does ':'does not '}exist.`);
    if (!overlayExists) {return null};
    
    const newExpanded: boolean = (value === undefined) ? !this.expanded : value;
    console.log(`New expanded will be ${newExpanded} and old expanded was ${this.expanded}`);
    this.expanded = newExpanded;
    const protocols = {
      'restrict': () => {
        this.newExpand();
      },
      'unrestrict': () => {
        document.getElementById(this.expansionBoxId).style.maxHeight = '3000px';
      },
    }
    
    const protocol: string = (newExpanded) ? 'unrestrict' : 'restrict';
    protocols[protocol]();
    return newExpanded;
  }

  updateChecklists(checklistUI: string): void {
    const element = this.elementService.elements[checklistUI];
    const elementIsChecklist: boolean = (element.elementType === 'checklist') ? true : false;
    
    let checked: Array<string> = [], unchecked: Array<string> = [];
    const assembleNewCheckedAndUncheckedLists = () => {
      const checklist: Array<string> = element.content.itemList;
      const checklistObj = element.content.itemObj;
      checklist.forEach(name => {
        if (checklistObj[name]) {
          checked.push(name);
        } else {
          unchecked.push(name);
        }
      })
    }

    const publishNewCheckedAndUncheckedLists = () => {
      this.checklists[checklistUI] = {
        checked: checked,
        unchecked: unchecked,
      }
    }

    if (!elementIsChecklist) {return};
    assembleNewCheckedAndUncheckedLists();
    publishNewCheckedAndUncheckedLists();
  }

  adjustExpansion(): void {
    let overlayIsUndefined: boolean = (this.overlayUI === undefined) ? true : false;

    const checkIfChecklistIsFinished = () => {
      const checklistIsFinished: boolean = (this.checklistService.checklists[this.overlayUI].unchecked.length === 0) ? true : false;
      if (checklistIsFinished) {
        this.setOverlayUI(undefined);
        overlayIsUndefined = true;
      }
    }

    const reduceOverlayIfNotExpanded = () => {
      if (!this.expanded && !overlayIsUndefined) {
        this.newExpand();
      }
    }

    //Is this delay necessary?
    setTimeout(() => {
      checkIfChecklistIsFinished();
      reduceOverlayIfNotExpanded();
    },20);
  }

  newExpand(): void {
    let targetHeight: string;
    const getTargetHeight = () => {
      const headerID: string = `overlay${this.overlayUI}header`;
      const headerElement = document.getElementById(headerID) || {scrollHeight: 0};
  
      const firstItemID: string = `overlay${this.overlayUI}item`;
      const firstItemElement = document.getElementById(firstItemID) || {scrollHeight: 0};
      
      targetHeight = `${headerElement.scrollHeight + firstItemElement.scrollHeight + 15}px`;
    }

    const setTargetHeight = () => {
      const element = document.getElementById(this.expansionBoxId);
      element.style.maxHeight = targetHeight;
    }

    const scrollChecklistToTop = () => {
      const dragDropListID: string = `overlay${this.overlayUI}dragDropList`;
      const dragDropList = document.getElementById(dragDropListID);
      dragDropList.scrollTop = 0;
    }

    getTargetHeight();
    setTargetHeight();
    scrollChecklistToTop();
  }
}
