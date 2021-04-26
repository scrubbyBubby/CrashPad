import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { CcViewService } from './cc-view.service';
import { ElementService } from './element.service';
import { FlowControlService } from './flow-control.service';
import { UtilityService } from './utility.service';
import { FormControl } from '@angular/forms'; 
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { ContainerService } from './container.service';

interface ItemObj {
  ui: string,
  title: string,
  rank?: number,
}

@Injectable({
  providedIn: 'root'
})
export class PadManagerService {

  public tabs = {
    'all': 'All',
    'top10': 'Top 10',
  }

  public tabList: Array<string>;

  public padNavigatorTab: string = "all";

  private allPads: Array<string> = [];

  private testList: Array<string> = [];
  private oldTestList: Array<string> = [
    'Work',
    'School',
    'Home',
    'Pizza',
    'Tunes',
    'Youtube',
    'Chilling',
    'Coding',
    'Sports',
    'Knitting',
    'Soccer',
    'Sushi',
    'Articles',
    'Flat Earth',
    'Round Earth',
    'Concave Earth',
    'Dune Buggy',
    'Bugs Bunny',
    'Bun Baking',
    'Baking Recipes',
    'Christmas',
  ];

  public testContainers = {};

  public forms = this.fb.group({
    search: [''],
  })

  public displayTitles: Array<string> = [];

  public mode: string = 'navigator';
  private allowedModes: Array<string> = [
    'navigator','projector',
  ]

  public selectedUI: string = '';

  public selectedHeader: string = undefined;
  public selectedHeaderStyles = {};
  private noSelectedHeaders = undefined;

  public hoveredButton: string;
  public buttonStyles = {};


  constructor(
    public ccView: CcViewService,
    public elementService: ElementService,
    public flowService: FlowControlService,
    private utility: UtilityService,
    private fb: FormBuilder,
  ) {
    this.tabList = Object.keys(this.tabs);
    let newTestList: Array<string> = [];
    this.testList.forEach(t => {
      newTestList = this.utility.pushAlphabetical(newTestList,t);
    })
    this.testList = newTestList;
    this.createDisplayListContainers();
  }

  createFullPadList() {
    const padUIs: Array<string> = Object.keys(this.elementService.elements).filter(ui => {
      const elementType: string = this.elementService.elements[ui].elementType;
      return (ui === 'masterContainer' || elementType != 'container') ? false : true;
    });
    this.allPads = padUIs;
  }

  setMode(mode: string) {
    if (this.allowedModes.indexOf(mode) != -1) {
      this.mode = mode;
    }
  }

  clearSelectedHeaderStyles(ui): void {
    setTimeout(() => {
      this.selectHeader();
    }, 500);
  }

  selectHeader(selectedHeaderTag?: string): void {
    const oldTag: string = this.selectedHeader;
    if (oldTag != undefined) {
      this.selectedHeaderStyles[oldTag] = 'textTag';
    }
    if (selectedHeaderTag != undefined) {
      this.selectedHeaderStyles[selectedHeaderTag] = 'reverseTextTag';
    }
    this.selectedHeader = selectedHeaderTag;
  }

  selectPad(ui: string) {
    console.log(`Selecting pad ${ui}`);
    const element = this.elementService.elements[ui];
    const rank = element.top10Rank;
    if (rank != undefined) {
      console.log(`Moving main index to ${rank+1}`);
      this.flowService.moveScrollToIndex('main-pad-view-container',rank+1,true);
      console.log(`Selecting header for ${ui}`);
      this.selectHeader(ui);
    } else {
      const element = this.elementService.elements[ui];
      this.selectedUI = (element != undefined && element.elementType === 'container') ? ui : this.selectedUI;
      if (this.selectedUI != '') {
        this.setMode('projector');
      }
    }
  }

  clearPadSelection() {
    this.setMode('navigator');
    this.selectedUI = '';
  }

  managePads() {
    this.flowService.moveScrollToIndex('main-pad-view-container', 0, true);
    this.selectHeader('padManager');
  }

  createPad(ui?: string, customize: boolean = true, event?) {
    ui = (ui === undefined) ? this.elementService.generateUID() : ui;
    this.ccView.forceCancelDelete();
    console.log(`Creating new pad with UI ${ui} and customization set to ${customize}`);
    const clientX = document.getElementById('main-pad-view-container').offsetWidth-100;
    this.ccView.createNewElement('container',customize, ui, 'masterContainer',{clientX: clientX, clientY: 220});
    if (customize) {
      this.elementService.setMode('customize');
    }
    
    const top10Full: boolean = (this.flowService.top10UI.length >= 10) ? true : false;
    const protocol: string = top10Full ? 'padNavigator' : 'mainView';

    const protocols = {
      'padNavigator': () => {
        this.flowService.after10.push(ui);
        this.flowService.assembleDisplayList();
        this.managePads();
      },
      'mainView': () => {
        const rank = this.flowService.top10UI.length;
        this.elementService.elements[ui].top10Rank = rank;
        this.flowService.top10UI.push(ui);
        this.flowService.assembleDisplayList();
      },
    }

    protocols[protocol]();
    if (customize) {
      console.log(`Selecting pad ${ui}`);
      setTimeout(() => {
        this.selectPad(ui);
      },100)
    }

    console.log(`Finished creating pad...`);
    return ui;
  }

  setPadNavigatorTab(tabName: string): void {
    if (this.tabs[tabName] != undefined) {
      this.padNavigatorTab = tabName;
      this.flowService.assembleDisplayList();
    }
  }

  createDisplayListContainers(): void {
    const int = setInterval(() => {
      if (this.elementService.elements != undefined && this.elementService.elementTypes['container'] != undefined) {
        clearInterval(int);
        const newTestList = [];
        this.testList.forEach(test => {
          console.log(`Testing ${test}`);
          const ui = test.split("").map((c,i)=>{return (i===0)?c.toLowerCase():c}).join("").split(" ").join("");
          console.log(`Testing if ${ui} needs to be created.`);
          if (this.elementService.elements[ui] === undefined) {
            console.log(`${ui} is being created.`);
            this.createPad(ui, false);
            this.elementService.elements[ui].customization['content:title'] = test;
            this.elementService.fullParse(ui, this.elementService.elements[ui].customization, true);
          }
          newTestList.push(ui);
        })
        this.testList = newTestList;
        this.flowService.assembleDisplayList();
      }
    }, 50)
  }

  oldAssembleDisplayList(publish: boolean = true): Array<string> {
    const protocols = {
      'all': () => {
        const newList: Array<string> = [];
        this.testList.forEach(ui => {
          newList.push(ui);
        })
        if (publish) {
          this.flowService.displayUIList = newList;
        }
        return newList;
      },
      'top10': () => {
        const newList: Array<string> = this.flowService.top10UI.slice();
        this.testList.some(ui => {
          if (newList.length >= 10) {
            return true;
          } else {
            newList.push(ui);
          }
        })
        if (publish) {
          newList.forEach((ui,i) => {
            this.elementService.elements[ui].top10Rank = i;
          })
          this.flowService.displayUIList = newList;
          this.flowService.top10UI = newList;
        }
        return newList;
      }
    }

    const protocol: string = this.padNavigatorTab;
    const newList = protocols[protocol]();
    if (publish) {
      this.filterDisplayListBySearch(this.forms.value.search);
    }
    return newList;
  }

  filterDisplayListBySearch(search: string, publish: boolean = true, customUIList?: Array<string>): Array<string> {
    //console.log(`Filtering display list by ${search}`);
    search = search.toLowerCase();
    const currentList = (customUIList === undefined) ? this.flowService.displayUIList : customUIList;
    const newList: Array<string> = currentList.filter(ui => this.elementService.elements[ui].parsedCustomization.content.title.toLowerCase().indexOf(search) != -1);
    //console.log(`NewList is ${JSON.stringify(newList)}`);
    if (publish) {
      this.flowService.displayUIList = newList;
    }
    return newList;
  }

  alphabetizedListByElementContentProperty(array: Array<string>, prop: string): Array<string> {
    const newAlphabetizedList: Array<string> = [];
    let newAlphabetizedPropertyList: Array<string> = [];
    array.forEach(ui => {
      const property = this.elementService.elements[ui].parsedCustomization.content[prop];
      const alphaObj = this.utility.pushAlphaAndLocate(newAlphabetizedPropertyList, property, true);
      newAlphabetizedPropertyList = alphaObj.array;
      newAlphabetizedList.splice(alphaObj.location, 0, ui);
    })
    return newAlphabetizedList;
  }

  setSearchText(text: string): void {
    const element = document.getElementById('pad-navigator-search-input-div');
    element.innerText = text.trim();
    const mockEvent = {
      currentTarget: {
        innerText: text
      }
    }
    this.newSearchText(mockEvent);
  }
  
  newSearchText(event) {
    //console.log(`Event does ${event === undefined ? 'not' :''}exist`);
    //console.log(`Current Target does ${event.currentTarget === undefined ? 'not ':''}exist.`);
    //console.log(`InnerText does ${event.currentTarget.innerText === undefined ? 'not ':''}exist.`);
    //console.log(`Searching for ${event.currentTarget.innerText}`);
    const searchText: string = event.currentTarget.innerText.trim();
    const newUIList: Array<string> = this.flowService.assembleDisplayList(false);
    const newFilteredList: Array<string> = (searchText === '') ? newUIList : this.filterDisplayListBySearch(searchText, false, newUIList);
    const newAlphabetizedList = this.alphabetizedListByElementContentProperty(newFilteredList,'title');
    this.flowService.displayUIList = newAlphabetizedList;
  }

  setTop10(ui: string, state?: boolean, target?: number) {
    const maxTop: number = 10;
    let rank: number = this.elementService.elements[ui].top10Rank;
    rank = (rank === undefined || rank >= maxTop) ? -1 : rank;
    state = (state != undefined) ? state :
      (rank === -1) ? true : false;
    if (state && rank === -1) {
      if (target === undefined) {
        const top10Full: boolean = (this.flowService.top10UI.length >= maxTop) ? true : false;
        if (top10Full) {
          const oldLast: string = this.flowService.top10UI[maxTop-1];
          this.flowService.top10UI.splice(maxTop-1,1);
          delete this.elementService.elements[oldLast].rank;
        }
        this.elementService.elements[ui].rank = this.flowService.top10UI.length;
        this.flowService.top10UI.push(ui);
      } else {
        this.flowService.top10UI.splice(target, 0, ui);
        const newTop10: Array<string> = [];
        for (var i = target; i < this.flowService.top10UI.length; i++) {
          const ui = this.flowService.top10UI[i];
          if (i < 10) {
            newTop10.push(ui);
            this.elementService.elements[ui].rank = i;
          } else {
            delete this.elementService.elements[ui].rank;
          }
        }
        this.flowService.top10UI = newTop10;
        this.setTop10Target(ui, target);
      }
    } else if (!state && rank != -1) {
      this.flowService.top10UI.splice(rank, 1);
      delete this.elementService.elements[ui].rank;
    } else if (state && target != undefined && rank != target) {
      this.setTop10Target(ui, target);
    }
  }

  setTop10Target(ui: string, target: number) {
    const rank: number = this.elementService.elements[ui].rank;
    if (rank != -1) {
      this.setTop10(ui, true, target);
    } else {
      this.setTop10(ui, true, target);
    }
  }
}