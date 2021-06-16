import { Injectable } from '@angular/core';
import { ElementService } from '../element/element.service';

@Injectable({
  providedIn: 'root'
})
export class FlowControlService {

  constructor(
    private elementService: ElementService,
  ) { }

  private colWidth: number = 450;
  private gapWidth: number = 20; //This value needs to match the gap width of the pad viewer
  private leftMargin: number = 30; //This value needs to match the left margin of the first pad column
  private colNumber: number;
  
  public colArray: Array<string> = [];

  private idRef = {
    'masterContainer': 'main-pad-view-container',
  }

  private maxColumns: number = 4;

  private lookupTableSettings = {
    colWidth: undefined,
    gapWidth: undefined,
  };
  private columnNumberLookupTable = {};

  public columnScrollStates = {};

  public top10UI: Array<string> = [];
  public after10: Array<string> = [];
  public displayUIList: Array<string> = [];

  generateLookupTable(): void {
    let newTable: boolean;
    const checkCurrentTable = () => {
      newTable = (this.colWidth != this.lookupTableSettings.colWidth || this.gapWidth != this.lookupTableSettings.gapWidth) ?
        true : false;
    }

    const updateLookupTableSettings = () => {
      const newLookupTableSettings = {
        colWidth: this.colWidth,
        gapWidth: this.gapWidth,
      }
      this.lookupTableSettings = newLookupTableSettings;
    }

    const updateLookupTable = () => {
      const newLookupTable = {};
      for (var i = 1; i <= this.maxColumns; i++) {
        newLookupTable[String(i)] = (this.colWidth * i) + (this.gapWidth * (i + 1));
      }
      this.columnNumberLookupTable = newLookupTable;
    }

    checkCurrentTable();
    if (!newTable) {return};
    updateLookupTableSettings();
    updateLookupTable();
  }

  setColWidth(newValue: number) {
    this.colWidth = newValue;
    this.generateLookupTable();
  }

  getColWidth(): number {
    return this.colWidth;
  }

  setGapWidth(newValue: number) {
    this.gapWidth = newValue;
    this.generateLookupTable();
  }

  getGapWidth(): number {
    return this.gapWidth;
  }

  calculateColNumber(): number {
    const viewWidth: number = document.getElementById(this.idRef['masterContainer']).offsetWidth;
    let newColArray: Array<string> = [];
    let bestCols: number;
    for (var i = 1; i <= this.maxColumns; i++) {
      const lookupWidth: number = this.columnNumberLookupTable[String(i)];
      if (lookupWidth <= viewWidth) {
        bestCols = i;
        newColArray.push(String(i));
      } else {
        break;
      }
    }
    this.colNumber = bestCols;
    return bestCols;
  }

  genericCalculateColNumber(): number {
    const masterContainer = document.getElementById(this.idRef['masterContainer']);
    const viewWidth: number = masterContainer.offsetWidth;
    const children = masterContainer.children;
    let newColArray: Array<string> = [];
    let rollingWidth: number = this.leftMargin; 
    let bestCols: number = 0;
    for (var i = 0; i<children.length; i++) {
      const child = children[i];
      const childWidth = child.clientWidth;
      const testWidth = rollingWidth + childWidth + this.gapWidth;
      if (testWidth >= viewWidth) {
        break;
      } else {
        bestCols = i + 1;
        rollingWidth = testWidth;
      }
    }
    bestCols = (bestCols === 0) ? 1 : bestCols;
    return bestCols;
  }

  findScrollIndex(id: string, horizontal: boolean = false, scroll?: number, initialMargin?: number): number {
    const element = document.getElementById(id);
    const children = element.children;

    let index: number = 0;
    const protocols = {
      'vertical': () => {
        const scrollHeight = element.scrollHeight;
        const offsetHeight = element.offsetHeight;
        const scrollTop = (scroll != undefined) ? scroll : element.scrollTop;

        const maxScroll: boolean = (offsetHeight + scrollTop == scrollHeight) ? true : false;

        if (maxScroll) {
          index = children.length - this.genericCalculateColNumber();
        } else {
          let testTop = (initialMargin != undefined) ? initialMargin : 0;
  
          for (var i = 0; i < children.length; i++) {
            const child = children[i];
            const childHeight = child.clientHeight;
            testTop += childHeight + this.gapWidth;
            if (Math.abs(testTop - scrollTop) < 50) {
              break;
            } else {
              index++;
            }
          }
        }
      },
      'horizontal': () => {
        const scrollWidth = element.scrollWidth;
        const offsetWidth = element.offsetWidth;
        const scrollLeft = (scroll != undefined) ? scroll : element.scrollLeft;
        //console.log(`Scroll width is ${scrollWidth} and scroll left is ${scrollLeft}`);

        const maxScroll: boolean = (offsetWidth + scrollLeft == scrollWidth) ? true : false;

        //console.log(`MaxScroll is true`);
        if (maxScroll) {
          index = children.length - this.genericCalculateColNumber();
          //console.log(`There are ${children.length} children and viewable cols are ${this.genericCalculateColNumber()}`);
        } else {
          let testLeft = (initialMargin != undefined) ? initialMargin : 0;
          
          //console.log(`Testing ${children.length} children.`);
          for (var i = 0; i < children.length; i++) {
            const child = children[i];
            const childWidth = child.clientWidth;
            //console.log(`Width of child ${i} is ${childWidth}`);
            testLeft += childWidth + this.gapWidth;
            if (Math.abs(testLeft - scrollLeft) < 50) {
              index++;
              break;
            } else if (testLeft - scrollLeft > 200) {
              break;
            } else {
              index++;
            }
          }
        }
      },
    };

    const protocol: string = (horizontal) ? 'horizontal' : 'vertical';
    protocols[protocol]();

    return index;
  }

  findScroll(id: string, horizontal: boolean = false, index?: number, initialMargin?: number): number {
    const element = document.getElementById(id);
    if (element === undefined || element === null) {return};
    const children = element.children;

    let scroll: number;
    const protocols = {
      'vertical': () => {
        if (index === undefined) {
          const scrollTop = element.scrollTop;
          scroll = scrollTop;
        } else {
          scroll = (initialMargin != undefined) ? initialMargin : 0;
          const childCount = (index != undefined) ? index : children.length;
          for (var i = 0; i < childCount; i++) {
            const child = children[i];
            const childHeight = child.clientHeight;
            scroll += childHeight + this.gapWidth;
          }
        }

        //scroll = (scroll + element.offsetHeight > element.scrollHeight) ? (element.scrollHeight - element.offsetHeight) : scroll;
      },
      'horizontal': () => {
        if (index === undefined) {
          const scrollLeft = element.scrollLeft;
          scroll = scrollLeft;
        } else {
          scroll = (initialMargin != undefined) ? initialMargin : 0;
          const childCount = (index != undefined) ? index : children.length;
          //console.log(`There are ${children.length} children in this scroll element. Moving to index ${index}`);
          for (var i = 0; i < childCount; i++) {
            const child = children[i];
            const childWidth = child.clientWidth;
            //console.log(`Child ${i} is ${childWidth} plus a ${this.gapWidth} gap...`);
            scroll += childWidth + this.gapWidth;
            //console.log(`Cumulative scroll is now ${scroll}`);
          }
        }
        
        //scroll = (scroll + element.offsetWidth > element.scrollWidth) ? (element.scrollWidth - element.offsetWidth) : scroll;
      },
    }

    const protocol: string = (horizontal) ? 'horizontal' : 'vertical';
    protocols[protocol]();

    return scroll;
  }

  moveScrollToIndex(id: string, index, horizontal: boolean = false, softTarget: boolean = false) {
    //console.log(`Moving ${id} to ${index}`);
    const element = document.getElementById(id);
    if (element === undefined || element === null) {return};

    const protocols = {
      'target': () => {
        console.log(`Moving ${id} to ${index}...`);
        let scrollTarget = this.findScroll(id, horizontal, index);
        if (softTarget) {
          const maxScrollTarget = (horizontal) ?
            element.scrollWidth - element.offsetWidth : 
            element.scrollHeight - element.offsetHeight;
          console.log(`Scroll target is ${scrollTarget} and max scroll target is ${maxScrollTarget}`);
          let newIndex = index;
          while (scrollTarget > maxScrollTarget) {
            console.log(`Scroll target is over max.`);
            newIndex--;
            console.log(`Trying index ${newIndex}`);
            if (newIndex >= 0) {
              scrollTarget = this.findScroll(id, horizontal, newIndex);
            } else {
              scrollTarget = this.findScroll(id, horizontal, 0);
            }
          }
        }
        //console.log(`Scrolling element with id ${id} to target ${scrollTarget}`);
        if (horizontal) {
          element.scrollLeft = scrollTarget;
        } else {
          element.scrollTop = scrollTarget;
        }
      },
      'max': () => {
        const maxIndex: number = element.children.length - 1;
        this.moveScrollToIndex(id, maxIndex, horizontal);
      },
    }

    const protocol = (index === 'max') ? 'max' : 'target';
    protocols[protocol]();
  }

  movePads(direction: string): void {
    //console.log(`Moving pads`);
    const scrollIndex = this.findScrollIndex('main-pad-view-container', true);
    const visibleColumns = this.genericCalculateColNumber();

    const element = document.getElementById('main-pad-view-container');

    let newIndex: number;
    const protocols = {
      'left': () => {
        newIndex = scrollIndex - visibleColumns;
        newIndex = (newIndex < 0) ? 0 : newIndex;
      },
      'right': () => {
        newIndex = scrollIndex + visibleColumns;
        newIndex = (newIndex > element.children.length - 1) ? element.children.length - 1 : newIndex;
      },
    }

    const protocol: string = direction;
    //console.log(`Moving pads ${protocol}`);
    //console.log(`Scroll index is ${scrollIndex}`);
    protocols[protocol]();
    //console.log(`About to move container to index ${newIndex}`);
    this.moveScrollToIndex('main-pad-view-container', newIndex, true);
  }

  assembleScrollStates(): void {
    const colArray: Array<string> = this.elementService.elements['masterContainer'].parsedCustomization.content['elementUIs'].slice();
    //console.log(`Columns to assemble states for ${JSON.stringify(colArray)}`);
    colArray.forEach(ui => {
      //console.log(`Assembling initial state for ${ui}`);
      const mockEvent = {
        currentTarget : document.getElementById(`${ui}-container`),
      }
      this.checkScroll(mockEvent, ui);
    })
    
    const mockMainEvent = {
      currentTarget: document.getElementById(`main-pad-view-container`),
    };
    this.checkScroll(mockMainEvent, 'main-pad-view', true);
  }

  checkScroll(e, ui, horizontal: boolean = false) {
    let minScroll: boolean = true, maxScroll: boolean = false;
    const protocols = {
      'vertical': () => {
        const scrollHeight = e.currentTarget.scrollHeight;
        const scrollTop = e.currentTarget.scrollTop;
        const offsetHeight = e.currentTarget.offsetHeight;

        //console.log(`ScrollTop: ${scrollTop} | scrollHeight: ${scrollHeight} | offsetHeight: ${offsetHeight}`);
        
        minScroll = (scrollTop <= 0) ? true : false;
        maxScroll = (scrollHeight - scrollTop == offsetHeight) ? true : false;
      },
      'horizontal': () => {
        const scrollWidth = e.currentTarget.scrollWidth;
        const scrollLeft = e.currentTarget.scrollLeft;
        const offsetWidth = e.currentTarget.offsetWidth;

        //console.log(`scrollLeft: ${scrollLeft} | scrollWidth: ${scrollWidth} | offsetWidth: ${offsetWidth}`);
        
        minScroll = (scrollLeft <= 0) ? true : false;
        maxScroll = (offsetWidth + scrollLeft == scrollWidth) ? true : false;
      },
    }

    //console.log(`Checking scroll for ${ui}`);
    if (e.currentTarget != undefined && e.currentTarget != null) {
      const protocol: string = (horizontal) ? 'horizontal' : 'vertical';
      protocols[protocol]();
    } 


    //console.log(`For ${ui} minScroll is ${minScroll} and maxScroll is ${maxScroll}`);

    this.columnScrollStates[ui] = {
      minScroll: minScroll,
      maxScroll: maxScroll,
    }


    
    
  }

  assembleDisplayList(publish: boolean = true) {
    let top10UI: Array<string> = [];
    const rankObj = {};
    let after10UI: Array<string> = [];
    //console.log(`All Pads ${JSON.stringify(this.elementService.elements['masterContainer'].content.elementUIs)}`);
    const allPadUIs: Array<string> = this.elementService.elements['masterContainer'].content.elementUIs.filter(ui=>(ui != 'masterContainer' && this.elementService.elements[ui].elementType === 'container'));
    allPadUIs.forEach(ui => {
      const element = this.elementService.elements[ui];
      const rank = element.top10Rank;
      if (rank != undefined) {
        //console.log(`Ranking ${ui} with rank ${rank}`);
        const lastUI: number = top10UI.length - 1;
        const pushed: boolean = top10UI.some((topUI, i) => {
          const topRank = rankObj[topUI];
          if (topRank > rank) {
            top10UI.splice(i, 0, ui);
            return true;
          } else if (i >= lastUI) {
            top10UI.push();
          }
        })
        if (!pushed) {
          top10UI.push(ui);
        }
        rankObj[ui] = rank;
      } else {
        after10UI.push(ui);
      }
    })
    after10UI = this.elementService.alphabetizedListByElementContentProperty(after10UI, 'title');

    if (top10UI.length < 10) {
      //console.log(`Assembling a top 10 because one did not exist...`);
      while (top10UI.length < 10) {
        const ui: string = after10UI[0];
        if (ui === undefined) {break};
        const rank: number = top10UI.length;
        top10UI.push(ui);
        this.elementService.elements[ui].top10Rank = rank;
        after10UI.splice(0,1);
      }
    }

    const newList = top10UI.concat(after10UI);
    if (publish) {
      this.top10UI = top10UI;
      this.after10 = after10UI;
      
      this.displayUIList = newList;
    }
    return newList;
  }
}
