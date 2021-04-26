import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ElementService } from './element.service';
import { LinkService } from './link.service';
import { MultilinkService } from './multilink.service';
import { ContainerService } from './container.service';
import { NoteService } from './note.service';
import { ChecklistService } from './checklist.service';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { FlowControlService } from './flow-control.service';
import { ChecklistOverlayService } from './checklist-overlay.service';
import { __assign } from 'tslib';
import { PadManagerService } from './pad-manager.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

/*

*****************************************************************************************************************************
Known problems

Resolved

Unresolved
  -->Customization box does not open
  -->Template Editor does not open
  -->Theme Editor does not open
  -->Theme Editor should be a custom box, but the same size as the customization box (While editing a theme, updates are shown in real time using special parsing contexts)
  -->Tutorial is not up to date and does not cover everything it should

  Priority
    -->With a theme already assigned, adding new stylings like maxWidth and minWidth don't work.
      Some stylings also seem to disappear from the customizationList

  Secondary
    -->Scrolling off of the templateManager scrolls the background

*****************************************************************************************************************************

Feature To-Do List
-->Find out what Sean means when he says border introductions mess with pageflow (More questions in Preferences 3)
-->Add font differences between different Themes

Completed

Uncompleted

Stretch Features
-->Add option to switch between structured, flex box type flow (single column, or multiple rows) and free form placement where items are just at a specific coordinate in the mainView
-->Dragging items to the top of a container should scroll the container up
-->Add the ability to combine elements in novel ways.
    (The new button should act as a combinator. Combining an element with a container places it in the container, however
    if you were to combine a link with another link, it would create a multilink of the two. If you were to combine a note with a note, it would create a single note with the text concatenated.
    if you were to combine a checklist with another checklist, you would create a single list with all of the tasks in the checklist. When combining, the element that is being combined with should take precedence.
    So if a multilink were combined with another multilink, it would use the display text of the first, but the link targets from all of them. Optionally, I could concatenate the two display texts with an ampersaand inbetween.)
-->The checklist within notes should have some way to customize the checkbox elements
    (preProcessed CCView Forms that are smart about where they send styling, allowing things like 'checkbox:padding = "10px"' being interpreted as applying
      this styling to the checkbox element. Different objects are wired to different parts of the element and everything remains customizable)
-->Notes should also allow the user to set reminders, however I don't know how this implementation would work
-->Save Repositioning of elements and containers upon switching to utilize
-->Elements should have a method of allowing hover customizations (this may prove to be more difficult that expected)
    This might be achieved through event listeners, but there may also be a solution in ngStyle
-->Allow disabling of element customizations that would prevent any customizations on that element that are not default
-->Create Expanding Container Element that when clicked reveals childElements in the same way as a container,
    but expands to take up the whole screen, acting as a main view until it is closed out

*****************************************************************************************************************************

*/

interface ElementInfo {
  ui: string,
  customization: object,
  content: object,
  elementType: string,
  customizationList: Array<string>,
  contentList: Array<string>,
  template?: string,
}

function sPush(array: Array<any>, value: any, pushTo: boolean = true) {
  const index = array.indexOf(value);
  if (pushTo) {
    if (index === -1) {
      array.push(value);
    }
  } else {
    if (index != -1) {
      array.splice(index,1);
    }
  }
}

function combineArrays(array1: Array<string>, array2: Array<string>): Array<string> {
  let returnArray = array1.slice();
  let key: string, index: number;
  for (var i = 0; i<array2.length; i++) {
    key = array2[i];
    index = array1.indexOf(key);
    if (index === -1) {
      returnArray.push(key);
    }
  }
  return returnArray;
}

interface TemplateInfo {
  templateName: string,
  styling: object,
  stylingBackup: object,
  ui: string,
  disabled: object,
}

interface ThemeInfo {
  themeName: string,
  ui: string,
  stylingTemplates: object,
  disabledTypes: object,
  stylingBackups?: object,
}

interface Button {
  action: Function,
  text?: string,
}

interface ButtonControl {
  disabledButtons: Array<string>,
  innerButton1?: Button,
  innerButton2?: Button,
  outerButton1?: Button,
  outerButton2?: Button,
  topRightCancelButton: Button,
}

interface Projection {
  'customizationUI'?: string,
  'customization'?,
  'templateUI'?: string,
  'templateCustomization'?,
  'templateStrict'?: boolean,
  'themeUI'?: string,
  'themeCustomization'?,
  'themeOverride'?: boolean,
  'themeStrict'?: boolean,
  'overrides'?,
  'disabled'?,
}

interface NewProjection {
  'elementProjection': ElementDirectProjection | ElementReferenceProjection,
  'templateProjection': TemplateDirectProjection | TemplateReferenceProjection,
  'themeProjection': ThemeDirectProjection | ThemeReferenceProjection,
}

interface ElementDirectProjection {
  'customization',
  'overrides',
  'disabled',
}

interface ElementReferenceProjection {
  'ui': string,
}

interface TemplateDirectProjection {
  'ui': string,
  'styling',
  'strict': boolean,
  'disabled',
}

interface TemplateReferenceProjection {
  'ui': string,
  'strict': boolean,
}

interface ThemeDirectProjection {
  'ui': string,
  'stylingTemplates',
  'strict': boolean,
  'themeOverride': boolean,
  'disabled',
}

interface ThemeReferenceProjection {
  'ui': string,
  'strict': boolean,
  'themeOverride': boolean,
}

@Injectable({
  providedIn: 'root'
})
export class CcViewService {

  public mainView: boolean = false;

  public mode: string;
  public mainState: boolean;
  public disabled = {
    'content': false,
    'customization': false,
  }

  public ccViewUI: string;
  private ccViewElementType: string;

  public template: string;

  public forms = {
    memory: undefined,
    templateOverride: false,
    defaultTemplate: true,
    newThemeEditor: this.fb.group({
      'name': [''],
      'ui': [''],
      'background': [''],
      'checklist': [''],
      'container': [''],
      'link': [''],
      'multilink': [''],
      'note': [''],
    }),
    newThemeEditorDisabled: {
      'background': false,
      'checklist': false,
      'container': false,
      'link': false,
      'multilink': false,
      'note': false,
    },
    convertedCustomization: this.fb.group({
      'template:uid': [''],
      'template:name': [''],
      'font:size': [''],
      'font:family': [''],
      'font:color': [''],
      'font:style': [''],
      'border:width': [''],
      'border:style': [''],
      'border:color': [''],
      'border:radius': [''],
      'background:color': [''],
      'background:image': [''],
      'shadow:inset': [''],
      'shadow:xOffset': [''],
      'shadow:yOffset': [''],
      'shadow:blur': [''],
      'shadow:spread': [''],
      'shadow:color': [''],
      'checkbox:icon': [''],
      'checkbox:color': [''],
      'listItems:size': [''],
      'listItems:fontColor': [''],
      'listItems:background': [''],
      'listItems:borderWidth': [''],
      'listItems:borderStyle': [''],
      'listItems:borderColor': [''],
    }),
    templateEditUI: undefined,
    themeEditUI: undefined,
    templateElements: [],
    customizationList: [],
    contentsList: [],
    disabledMemory: undefined,
    newOverrides: {},
    newOverrideGroups: {},
    templateValues: {},
    templateValueGroups: {},
    newDisabled: {},
    newTheme: {
      info: <ThemeInfo>{},
      elementTypeList: ['link','multilink','container','note','checklist'],
    },
    newNames: this.fb.group({
      theme: [''],
      template: [''],
    })
  }

  public visualizationOptions = {
    'strict': false,
    'off': false,
  }

  public visualizationMode: string = 'normal';

  public themeVisualizationOptions = {
    'strict': false,
    'off': false,
  }

  public themeVisualizationMode: string = 'normal';

  public parentUI: string;

  public elementAwaitingDeletion: string;
  
  public deleteOnCancel: string = '';
  public deleteTemplateOnCancel: string = '';
  public deleteThemeOnCancel: string = '';

  private viewOrder: Array<string> = [
  ];

  private viewsEnabled: object = {
    'elementType': false,
    'templateEdit': false,
    'customization': false,
    'content': false,
    'themeEdit': false,
    'newCustomization': false,
    'confirmDelete': false,
  }

  private customizationMemory = {};

  public awaitingRemoval: string;
  public awaitingRemovalTimeoutId: number;
  private removeStylingDelay: number = 1500;

  private templateManagerReturn: Array<string>;
  public locationStyling = {
    transform: 'translate3d(0px, 0px, 0px)',
    opacity: '0',
  }

  public indicators = {
    template: "(template)",
    override: "(override)",
    noTemplate: "(none)",
  }

  public focus = {
    group: undefined,
    subGroup: undefined,
  }

  private patchMemory = {};

  constructor(
    private fb: FormBuilder,
    private elementService: ElementService,
    public linkService: LinkService,
    public multilinkService: MultilinkService,
    public containerService: ContainerService,
    public noteService: NoteService,
    public checklistService: ChecklistService,
    public flowService: FlowControlService,
    public checklistOverlayService: ChecklistOverlayService,
  ) { }

  public mobile: boolean = false;

  getViewWidth(): number {
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    return vw;
  }

  public customizationMinimized: boolean = false;
  minimizeCustomization(newState?: boolean): void {
    const vw = this.getViewWidth();
    if (vw <= 700) {
      newState = (newState === undefined) ? !this.customizationMinimized : newState;
      this.customizationMinimized = newState;
    }
  }

  checkMobile(): void {
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
     this.mobile = (vw <= 700) ? true : false;
  }

  enableMode(mode: string, enable?: boolean, ui?: string, parentUI?: string, event?): void {
    //console.log(`Setting mode ${mode} to ${enable || 'toggle'}`);
    const modeExists: boolean = (this.viewsEnabled[mode] != undefined);
    const modeIsNewCustomization: boolean = (mode === 'newCustomization') ? true : false;
    const settingMode: boolean = (enable === true || (enable === undefined && this.mode === mode)) ? true : false;
    const modeIsOnNoCrossList: boolean = ['templateEdit', 'themeEdit', 'newCustomization'].indexOf(this.mode) != -1 ? true : false;
    const modeAllowed: boolean = ((modeIsNewCustomization && settingMode) && modeIsOnNoCrossList) ? false : true;

    //console.log(`mode = ${mode} | enable = ${enable} | this.mode = ${this.mode}`);
    //console.log(`modeIsNewCustomization = ${modeIsNewCustomization} | settingMode = ${settingMode} | modeIsOnNoCrossList = ${modeIsOnNoCrossList}`);
    //console.log(`Enabling mode ${mode} as ${enable} is ${modeAllowed ? '':'not '}allowed.`);
    const updateViewsEnabled = () => {
      enable = (enable === undefined) ? !this.viewsEnabled[mode] : enable;
      this.viewsEnabled = Object.assign({}, this.viewsEnabled, {[mode]: enable});
    }

    let newViewOrder: Array<string>;
    const assembleNewViewOrder = () => {
      newViewOrder = this.viewOrder.slice();
      const index: number = newViewOrder.indexOf(mode);
      if (index != -1) {
        newViewOrder.splice(index,1);
      }
      if (enable) {
        newViewOrder.unshift(mode);
      }
    }
    
    let newMode: string;
    const getMode = () => {
      this.viewOrder = newViewOrder;
      if (this.viewOrder.length === 0) {
        this.enableMain(false);
        return;
      };
      this.viewOrder.some(name => {
          if (this.viewsEnabled[name] === true) {
            newMode = name;
            return true;
          }
        }
      );
    }

    const setModeAndNewViewOrder = () => {
      if (newMode != undefined) {
        this.minimizeCustomization(false);
        this.setMode(newMode);
        this.enableMain(true,ui,parentUI);
      } else {
        this.enableMain(false);
      }
    }

    const setLocationStyling = (newMode, clientX, clientY) => {
      console.log(`Setting location styling... newMode ${newMode}`);
      const padding = {
        x: 50,
        y: 50,
      };
      const flipWidth: number = this.flowService.getColWidth();
      console.log(`Setting location styling for newMode ${newMode}`);
      if (!this.mobile && newMode != undefined && ['newCustomization','templateEdit','themeEdit', 'elementType'].indexOf(newMode) != -1) {
        console.log(`NewMode is a valid mode`)
        const customizationBoxElement = document.getElementById((newMode != 'elementType') ? 'customization-box' : 'element-type-box');
        let posX: number = 60, posY: number = -17;
        if (newMode === 'elementType') {posX += 30};
        const windowWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        const windowHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
        if (windowWidth > 700 && (this.mode != 'elementType' || newMode != 'newCustomization')) {
          posX += event.clientX;
          posY += event.clientY;
          console.log(`CustomizationBoxElement ${customizationBoxElement === undefined} | ${customizationBoxElement === null}`);
          if (customizationBoxElement != undefined && customizationBoxElement != null) {
            const customizeBoxWidth = customizationBoxElement.offsetWidth;
            const customizeBoxHeight = customizationBoxElement.offsetHeight;
            console.log(`CB Width: ${customizeBoxWidth} | CB Height: ${customizeBoxHeight} | Window Width: ${windowWidth} | Window Height: ${windowHeight}`);
            const overflowRight: boolean = (posX + customizeBoxWidth + padding.x > windowWidth) ? true : false;
            const overflowBottom: boolean = (posY + customizeBoxHeight + padding.y > windowHeight) ? true : false;
            posX = (overflowRight) ? posX - (2 * flipWidth) + 100 - (2 * padding.x) : posX;
            posY = (overflowBottom) ? windowHeight - customizeBoxHeight - padding.y : posY;
          }
        } else {
          posX = 0;
          posY = 0;
        }
        this.locationStyling = {
          'transform': `translate3d(${posX}px, ${posY}px, 0px)`,
          'opacity': '0',
        }
        //console.log(`Enable is ${enable}`);
        if (enable) {
          //console.log(`Starting the setVisible loop...`);
          const setVisible = function(self) {
            return () => {
              //console.log(`Checking int...`);
              if (customizationBoxElement.style.transform == `translate3d(${posX}px, ${posY}px, 0px)`) {
                clearInterval(int);
                self.locationStyling.opacity = '1';
              }
            }
          }(this);
          const int = setInterval(() => {
            setVisible();
          },50)
        }
      } else if (this.mobile) {
        this.locationStyling = {
          'transform': `translate3d(0px,  0px, 0px)`,
          'opacity': '1',
        }
      }
    }

    if (!modeExists || !modeAllowed) {return};
    updateViewsEnabled();
    assembleNewViewOrder();
    getMode();
    setModeAndNewViewOrder();
    if (event != undefined) {
      const timeoutFunction = function(newMode, event) {
        return () => {
          setLocationStyling(newMode, event.clientX, event.clientY);
        }
      }(newMode, event);

      setTimeout(() => {
        timeoutFunction();
      },10)
    } else {
      this.locationStyling.opacity = '1';
    }
  }

  forceCancelDelete() {
    if (this.deleteOnCancel != '' && this.elementService.elements[this.deleteOnCancel] != undefined) {
      //console.log(`Deleting ${this.deleteOnCancel}`);
      this.elementService.deleteElement(this.deleteOnCancel,true, this.parentUI);
      this.deleteOnCancel = '';
    }
  }

  public linkCount: number;
  addContentToMultilink(): void {
    const content = Object.keys(this.forms.convertedCustomization.value).filter(style => style.split(":")[0] === 'content').map(style => style.split(":")[1]);
    const usedLinkTags: Array<number> = [];
    let linkCount: number = 0, newLinkTag: number = 1;
    content.forEach(style => {
      if (style.indexOf('link') === 0) {
        const linkTag = Number(style.substring(4));
        usedLinkTags.push(linkTag);
        linkCount++;
        while (usedLinkTags.indexOf(newLinkTag) != -1) {
          newLinkTag++;
        }
      }
    })
    if (linkCount >= 4) {return};
    this.forms.convertedCustomization.addControl(`content:text${newLinkTag}`,this.fb.control(''));
    this.forms.convertedCustomization.addControl(`content:link${newLinkTag}`,this.fb.control(''));
    this.forms.contentsList.push(`text${newLinkTag}`);
    this.forms.contentsList.push(`link${newLinkTag}`);
    //console.log(`Contentslist after these additions is ${JSON.stringify(this.forms.contentsList)}`);  
    this.linkCount = linkCount;
  }

  enableMain(state: boolean = true, ui?: string, parentUI?: string): void {
    if (this.mainState != state) {
      const protocols = {
        'on': () => {
          //console.log(`Checking UI... it is ${ui === undefined ? '':'not '}undefined.`);
          if (ui != undefined) {
            this.parentUI = parentUI;
            this.newPullCCViewInfo(ui);
          }
          this.mainState = true;
        },
        'off': () => {
          this.setFocus('all',undefined);
          if (this.ccViewUI === this.deleteOnCancel) {
            this.elementService.deleteElement(this.deleteOnCancel,true, this.parentUI);
          }
          if (this.forms.templateEditUI === this.deleteTemplateOnCancel) {
            this.elementService.removeTemplate(this.deleteTemplateOnCancel, true);
          }
          if (this.forms.themeEditUI === this.deleteThemeOnCancel) {
            this.elementService.removeTheme(this.deleteThemeOnCancel, true);
          }
          this.deleteOnCancel = '';
          this.deleteTemplateOnCancel = '';
          this.deleteThemeOnCancel = '';
          this.newClearCCViewInfo();
          this.viewOrder = [];
          this.returnToTemplateManager();
          this.clearTemplateManagerReturn();
          this.mainState = false;
          this.ccViewUI = undefined;
          this.mode = undefined;
        },
      }

      const protocol: string = (state) ? 'on' : 'off';
      //console.log(`EnableMain is firing and protocol is ${protocol}`);
      protocols[protocol]();
    }
  }

  savePatchMemory(memoryTag: string): void {
    this.patchMemory[memoryTag] = this.forms.convertedCustomization.value;
  }

  loadPatchMemory(memoryTag: string, del: boolean = false): void {
    const patch = this.patchMemory[memoryTag];
    if (patch != undefined) {
      this.forms.convertedCustomization.patchValue(this.patchMemory[memoryTag]);
      if (del) {delete this.patchMemory[memoryTag]};
    }
  }
  
  closeCCView(): void {
    this.revertAllCustomization();
    if (this.deleteOnCancel != '') {
      const topIndex: number = this.flowService.top10UI.indexOf(this.deleteOnCancel);
      if (topIndex != -1) {
        this.flowService.top10UI.splice(topIndex,1);
      }
      const afterIndex: number = this.flowService.after10.indexOf(this.deleteOnCancel);
      if (afterIndex != -1) {
        this.flowService.after10.splice(afterIndex,1);
      }
      const displayIndex: number = this.flowService.displayUIList.indexOf(this.deleteOnCancel);
      if (displayIndex != -1) {
        this.flowService.displayUIList.splice(displayIndex, 1);
      }
      this.elementService.deleteElement(this.deleteOnCancel, true, this.parentUI);
      this.deleteOnCancel = '';
    }
    this.templateManagerReturn = undefined;
    this.enableMode(this.mode, false);
  }

  revertAllCustomization(): void {
    const protocols = {
      'templateEdit': () => {
        if (this.forms.templateElements.length > 0) {
          this.forms.templateElements.forEach(ui => {
            this.revertElementCustomization(ui);
          })
          this.forms.templateElements = [];
        }
      },
      'themeEdit': () => {
        const elementUIs: Array<string> = Object.keys(this.elementService.elements);
        elementUIs.forEach(ui => {
          this.revertElementCustomization(ui);
        })
      },
      'newCustomization': () => {
        if (this.elementService.elements[this.ccViewUI].elementType === 'container') {
          this.revertThemeCustomization();
        } else {
          this.revertElementCustomization(this.ccViewUI);
        }
      }
    }

    const protocol: string = this.mode;
    //console.log(`Protocol is ${protocol}`);
    protocols[protocol]();
  }

  setVisualizationMode(mode: string, state?: boolean): void {
    const protocols = {
      'templateEdit': () => {
        const getNewState = () => {
          state = (state != undefined) ? state :
            !this.visualizationOptions[mode];
        }
    
        const setNewState = () => {
          this.visualizationOptions[mode] = state;
          this.visualizationMode = (this.visualizationOptions.off) ? 'off' : 
            (this.visualizationOptions.strict) ? 'strict' : 'normal';
          this.updateCustomizationFromForm();
        }
    
        getNewState();
        setNewState();
      },
      'themeEdit': () => {
        const getNewState = () => {
          state = (state != undefined) ? state :
            !this.themeVisualizationOptions[mode];
        }
    
        const setNewState = () => {
          this.themeVisualizationOptions[mode] = state;
          this.themeVisualizationMode = (this.themeVisualizationOptions.off) ? 'off' : 
            (this.themeVisualizationOptions.strict) ? 'strict' : 'normal';
          this.updateCustomizationFromForm();
        }
    
        getNewState();
        setNewState();
      },
    }

    const protocol: string = this.mode;
    protocols[protocol]();
  }

  setFocus(target: string, group: string): void {
    const protocols = {
      'all': () => {
        const focusList: Array<string> = Object.keys(this.focus);
        focusList.forEach(name => {
          this.focus[name] = group;
        })
      },
      'one': () => {
        const subString = (this.focus.subGroup != undefined) ? this.focus.subGroup.substring(0,group.length) : '';
        if (target === 'group' && subString != '' && subString != group) {
          this.focus.subGroup = undefined;
        }
        this.focus[target] = group;
      }
    }

    const protocol: string = (target === 'all') ? 'all' : 'one';
    protocols[protocol]();
  }

  setMode(mode: string): void {
    const allowedModes: Array<string> = ['customization','content','elementType','confirmDelete','templateEdit','themeEdit','newCustomization'];
    if (allowedModes.indexOf(mode) != -1) {
      this.mode = mode;
      if (['newCustomization','templateEdit','themeEdit'].indexOf(mode) != -1) {
        this.containerService.setMainMenu(false);
        this.checklistOverlayService.setOpen(false);
        this.containerService.holdHoveredElement();
      }
    }
  }

  deleteElement(uid: string, confirmed: boolean = false, containerUID?: string,): void {
    const protocols = {
      'unconfirmed': () => {
        this.elementAwaitingDeletion = uid;
        const options = {
          'Cancel': () => {
            this.enableMode('confirmDelete',false);
          },
          'Delete': () => {
            this.deleteElement(uid,true,containerUID);
          }
        }
        const message: string = 'Are you sure you want to delete this element?';
        const header: string = 'Deleting Element';
        this.elementService.confirmWithOptions(
          message,
          options,
          header,
          `24px`,
          `300px`,
        )
      },
      'confirmed': () => {
        const parentUI: string = (containerUID === undefined) ? this.parentUI : containerUID;
        let rank = this.elementService.elements[uid].top10Rank;
        const top10: boolean = (rank === undefined) ? false : true;
        const listName: string = (top10) ? 'top10UI' : 'after10';
        const index: number = this.flowService[listName].indexOf(uid);
        this.flowService[listName].splice(index,1);
        const mainIndex: number = this.flowService.displayUIList.indexOf(uid);
        this.flowService.displayUIList.splice(mainIndex,1);
        //console.log(`Deleted from flow service. Handing off deletion to element Service.`);
        if (uid === this.ccViewUI) {
          this.closeCCView();
        }
        this.elementService.deleteElement(uid,true,parentUI);
      },
    }

    const protocol: string = (confirmed) ? 'confirmed' : 'unconfirmed';
    //console.log(`Deleting element with UID ${uid} with protocol ${protocol}`);
    //if (this.mode === 'newCustomization' && this.ccViewUI === uid) {return};
    protocols[protocol]();
  }

  generalSubmission(optionalState?: boolean): void {
    let result: boolean = true;
    if (this.mode === 'templateEdit') {
      result = this.newSaveAsTemplate(true, false);
    } else if (this.mode === 'themeEdit') {
      //console.log(`Submitting theme info with optionalState ${optionalState}`);
      let themeUI: string;
      if (optionalState === true) {
        themeUI = this.forms.newThemeEditor.value.ui;
        //console.log(`Retreived themeUI is ${themeUI}`);
      }
      if (optionalState === true) {
        //console.log(`Applying the theme but with confirmation required.`);
        result = false;
        const promiseResult = this.elementService.applyTheme(themeUI, false, false);
        promiseResult.then((value) => {
          if (value) {
            this.newSubmitThemeInfo();
            this.enableMode(this.mode, false);
          }
        })
      }
    } else {
      this.newSubmitCCViewInfo();
    }
    //console.log(`Turning off ${this.mode} mode`);
    //console.log(`Result is ${result}`);
    if (result) {
      this.enableMode(this.mode,false);
    }
  }

  getTemplateValue(name: string): string {
    //console.log(`Getting template value for ${name}`);
    const templateUID : string = this.forms.convertedCustomization['template:uid'];
    if (name === 'template:uid') {
      return templateUID;
    }
    
    let value = '';
    if (templateUID != undefined && templateUID != '') {
      const template = this.elementService.templates[templateUID];
      value = template.styling[name];
    }
    return value;
  }

  getFormValue(name: string): string {
    return this.forms.convertedCustomization.value[name];
  }

  updateCustomizationFromForm(): void {
    const protocols = {
      'newCustomization': () => {
        this.projectCCViewToElement();
        //setTimeout(() => {
          //const customization = this.forms.convertedCustomization.value;
          //this.elementService.fullParse(this.ccViewUI,customization,true);
        //},20); 
      },
      'templateEdit': () => {
        this.projectCCViewToTemplate();
        //this.updateAffectedElements();
      },
      'themeEdit': () => {
        //console.log(`Projecting CCView to Theme`);
        this.projectCCViewToTheme();
        //this.updateThemePreview();
      },
    }

    const protocol: string = this.mode;
    protocols[protocol]();
  }

  updateThemePreview(): void {
    const strict = (this.themeVisualizationMode === 'strict') ? true : false;
    const off = (this.themeVisualizationMode === 'off') ? true : false;
    if (!off) {
      setTimeout(() => {
        const editorValues = this.forms.newThemeEditor.value;
        const disabledValues = this.forms.newThemeEditorDisabled;
        const elementTypes: Array<string> = ['background','checklist','container','link','multilink','note'];
        const stylingTemplates = {};
        elementTypes.forEach(type => {
          const templateUI: string = editorValues[type];
          const template = this.elementService.templates[templateUI] || {styling:{}};
          stylingTemplates[type] = template.styling;
        });

        const applyTemplate = (ui: string, templateStyling) => {
          const element = this.elementService.elements[ui];
          const oldCustomizationKeys: Array<string> = Object.keys(element.customization);
          const newCustomization = {};
          oldCustomizationKeys.forEach(name => {
            if (element.overrides === undefined || element.overrides[name] != true || strict) {
              newCustomization[name] = templateStyling[name] || element.customization[name];
            } else {
              newCustomization[name] = element.customization[name];
            }
          })
          const contentKeys: Array<string> = Object.keys(element.content);
          contentKeys.forEach(name => {
            newCustomization[`content:${name}`] = element.content[name];
          })
          this.elementService.fullParse(ui, newCustomization, true);
        }

        if (!disabledValues['background']) {
          applyTemplate('masterContainer', stylingTemplates['background']);
        }

        const padUIs: Array<string> = this.elementService.elements['masterContainer'].content.elementUIs.slice();
        padUIs.forEach(ui => {
          const element = this.elementService.elements[ui];
          const subTheme: boolean = (element.parsedCustomization.content.theme != '' && element.parsedCustomization.content.theme != editorValues.ui)
          const subStylingTemplates = (subTheme) ? this.elementService.themes[element.parsedCustomization.content.theme].stylingTemplates : stylingTemplates;
          const subDisabledValues = (subTheme) ? this.elementService.themes[element.parsedCustomization.content.theme].disabledTypes : disabledValues;
          //console.log(`Updating view for element ${ui}`);
          //console.log(`Comparing theme ${element.theme} with '' or ${editorValues.ui}`);
          if (element.parsedCustomization.content.theme === '' || element.parsedCustomization.content.theme === editorValues.ui) {
            //console.log(`Element is the right theme!`);
            if (!subDisabledValues['container']) {
              //console.log(`Pad styling is not disabled.`);
              const templateStyling = subStylingTemplates['container'];
              //console.log(`Applying to element ${ui} templateStyling ${JSON.stringify(templateStyling)}`);
              applyTemplate(ui, templateStyling);
            }
            
            const childElementUIs: Array<string> = element.parsedCustomization.content.elementUIs;
            childElementUIs.forEach(childUI => {
              const child = this.elementService.elements[childUI];
              const childType: string = child.elementType;
              if (!subDisabledValues[childType]) {
                const childStyling = subStylingTemplates[childType];
                applyTemplate(childUI, childStyling);
              } else {
                this.revertElementCustomization(ui);
              }
            })
          }
        })
      }, 20)
    } else {
      const elementUIs: Array<string> = Object.keys(this.elementService.elements);
      elementUIs.forEach(ui => {this.revertElementCustomization(ui)});
    }
  }

  addNewOverride(overrideName: string, update: boolean = true, event?, dropDown: boolean = false): void {
    //Problem here with setting template
    const protocols = {
      'newCustomization': () => {
        let templateValue: string;
        const getTemplateValue = () => {
          templateValue = this.getTemplateValue(overrideName);
        }
    
        let value: string;
        const getValue = () => {
          value = this.getFormValue(overrideName);
        }

        const checkEventValue = () => {
          if (event != undefined && event != null) {
            value = dropDown ? event : event.target.value;
            this.forms.convertedCustomization.patchValue({
              [overrideName]: value,
            })
          }
        }
    
        const updateOverrides = () => {
          const state: boolean = true;
          //console.log(`New state is ${state}`);
          const convertedCustomizationValue = this.forms.convertedCustomization.value;
          const themeUID: string = convertedCustomizationValue['theme:uid'];
          const templateUID: string = convertedCustomizationValue['template:uid'];
          console.log(`Checking for template with UID`)
          let newOverrides = Object.assign({}, this.forms.newOverrides, {[overrideName]: state});
          this.forms.newOverrides = newOverrides;
          const strict = (this.visualizationMode === 'strict') ? true : false;
          const off = (this.visualizationMode === 'off') ? true : false;
          this.updateOverrideGroups();
          this.setNewCustomizationTemplate();
        }
    
        const updateCustomization = () => {
          this.updateCustomizationFromForm();
        }
    
        //getTemplateValue();
        //getValue();
        checkEventValue();
        updateOverrides();
        if (update) {updateCustomization()};
      },
      'templateEdit': () => {
        let value: string;
        const checkEventValue = () => {
          if (event != undefined && event != null) {
            value = event;
            this.forms.convertedCustomization.patchValue({
              [overrideName]: value,
            })
          }
        }
        
        checkEventValue();
        this.updateAffectedElements();
      },
      'themeEdit': () => {
        let value: string;
        const checkEventValue = () => {
          if (event != undefined && event != null) {
            value = event;
            this.forms.newThemeEditor.patchValue({
              [overrideName]: value,
            })
          }
        }
        
        checkEventValue();
        this.updateThemePreview();
      }
    }

    const protocol: string = this.mode;
    console.log(`Updating styling with protocol ${protocol}`);
    protocols[protocol]();

    //Convert to protocol function
  }

  updateAffectedElements(): void {
    const strict = (this.visualizationMode === 'strict') ? true : false;
    const off = (this.visualizationMode === 'off') ? true : false;
    if (!off) {
      setTimeout(() => {
        const templateStyling = this.forms.convertedCustomization.value;
        const updateElement = (ui) => {
          const element = this.elementService.elements[ui];
          const newCustomization = {};
          Object.keys(element.customization).forEach(name => {
            if (element.overrides[name] != true || strict) {
              newCustomization[name] = templateStyling[name] || element.customization[name];
            } else {
              newCustomization[name] = element.customization[name];
            }
          })
          Object.keys(element.content).forEach(name => {
            newCustomization[`content:${name}`] = element.content[name];
          })
          this.elementService.fullParse(ui, newCustomization, true);
        }
        //console.log(`Updating elements ${JSON.stringify(this.forms.templateElements)}`);
        this.forms.templateElements.forEach(ui => {updateElement(ui)});
      },20)
    } else {
      this.forms.templateElements.forEach(ui => {
        this.revertElementCustomization(ui);
      })
    }
  }

  revertNewOverride(overrideName: string) {
    const element = this.elementService.elements[this.ccViewUI];

    const patch = {};
    const createRevertPatch = () => {
      if (overrideName === 'template:uid') {
        const subThemeUI = this.forms.convertedCustomization.value['content:theme'];
        const subTheme = this.elementService.themes[subThemeUI];
        let subTemplate: string;
        if (subTheme === undefined) {
          const mainTheme = this.elementService.themes[this.elementService.currentTheme];
          if (mainTheme != undefined) {
            subTemplate = mainTheme.stylingTemplates[this.ccViewElementType];
          } else {
            subTemplate = '';
          }
        } else {
          subTemplate = subTheme.stylingTemplates[this.ccViewElementType];
        }
        patch[overrideName] = subTemplate;
        this.setNewCCViewTemplate({currentTarget: {value: subTemplate}});
      } else if (overrideName === 'content:theme') {
        const masterTheme = this.elementService.themes[this.elementService.currentTheme];
        if (masterTheme != undefined) {
          patch[overrideName] = this.elementService.currentTheme;
          this.setNewCCViewTheme({currentTarget: {value: this.elementService.currentTheme}},0);
        } else {
          patch[overrideName] = '';
          this.setNewCCViewTheme({currentTarget: {value: ''}},0);
        }
        //console.log(`Reverting an override for content:theme`);
      } else {
        const parentElement = this.elementService.elements[this.parentUI];
        let containerValue, defaultValue;
        console.log(`ParentElement type is ${parentElement.elementType}`);
        if (parentElement.elementType === 'container') {
          containerValue = parentElement.customization[overrideName];
        } else {
          defaultValue = this.elementService.elementTypes[element.elementType].template.styling[overrideName]; 
        }
        const templateUI: string = this.forms.convertedCustomization.value['template:uid'];
        const template = this.elementService.templates[templateUI];
        const templateValue = (template != undefined) ? template.styling[overrideName] :
          (containerValue != undefined) ? containerValue : defaultValue;
        console.log(`templateValue: ${templateValue} | containerValue: ${containerValue} | defaultValue: ${defaultValue}`)
        console.log(`Reverting ${overrideName} to ${templateValue}`);
        patch[overrideName] = templateValue;
      }
      const templateUI = this.forms.convertedCustomization.value['template:uid'];
      const template = this.elementService.templates[templateUI] || {styling: {}};
      const overrides = this.forms.newOverrides;
      overrides[overrideName] = false;
      const disabled = this.forms.newDisabled;
      this.getNewTemplateGroups(template.styling, overrides, disabled);
    }

    const updateValue = () => {
      Object.keys(patch).forEach(key => {
        //console.log(`Patching: ${key} = ${patch[key]}`);
      })
      this.forms.convertedCustomization.patchValue(patch);
    }

    const removeOverride = () => {
      const newOverrides = Object.assign({}, this.forms.newOverrides);
      delete newOverrides[overrideName];
      this.forms.newOverrides = newOverrides;
      this.updateOverrideGroups();
      //this.setNewCustomizationTemplate();
    }

    const updateCustomization = () => {
      this.updateCustomizationFromForm();
    }

    createRevertPatch();
    updateValue();
    removeOverride();
    updateCustomization();
  }

  setTemplateManagerReturn(target: Array<string> | string): void {
    target = (typeof target === 'string') ? [target]:target;
    if (this.templateManagerReturn === undefined) {
      this.templateManagerReturn = target;
    }
  }

  clearTemplateManagerReturn(): void {
    this.templateManagerReturn = undefined;
  }

  returnToTemplateManager(): void {
    (this.templateManagerReturn || []).reverse().forEach(name => {
      this.elementService.enableMode(name,true);
    })
  }

  newPullCCViewInfo(ui: string): void {
    //console.log(`Pulling info for element with UI ${ui}`);
    const element = this.elementService.elements[ui];
    //console.log(`Initial element customization ------------------------------------------------`);
    Object.keys(element.customization).forEach(style => {
      //console.log(`${style} = ${element.customization[style]}`);
    })
    if (element === undefined) {return};
    const elementType: string = element.elementType;
    const defaultInfo = this.elementService.elementTypes[elementType].defaultInfo.template.styling;
    const templateUI: string = element.template;

    let patch = {};
    const prepareForm = () => {
      this.forms.templateOverride = element.templateOverride || false;
      this.forms.defaultTemplate = element.defaultTemplate || false;
      this.ccViewUI = ui;
      this.ccViewElementType = element.elementType;
      this.forms.contentsList = element.contentList.slice();
      const defaultControlList = Object.assign({}, element.customization);
      //console.log(`Default control list for ${this.ccViewUI}`);
      //Object.keys(defaultControlList).forEach(style => console.log(`${style} = ${defaultControlList[style]}`)); 
      console.log(`Element content is ${JSON.stringify(element.content)}`);
      Object.keys(element.content).forEach(name => {
        console.log(`Setting content for ${name} to ${element.content[name]}`);
        defaultControlList[`content:${name}`] = element.content[name];
      })
      if (defaultControlList['template:uid'] === undefined) {
        defaultControlList['template:uid'] = (defaultControlList['template:template'] === undefined) ? '' : defaultControlList['template:template'];
      }
      defaultControlList['template:name'] = this.elementService.templates[defaultControlList['template:uid']]?.templateName || '';
      defaultControlList['content:theme'] = this.elementService.elements[ui].customization['content:theme'] || '';
      //console.log(`Default value for 'content:theme' is ${defaultControlList['content:theme'] === undefined ? '' : 'not '}undefined.`);
      delete defaultControlList['template:template'];
      const controlList: Array<string> = Object.keys(defaultControlList);
      console.log(`ControlList is ${JSON.stringify(controlList)}`);
      controlList.forEach(name => {
        if (name === 'template:uid') {console.log(`template:uid exists`)}
        else if (name === 'template:template') {console.log(`tempalte:template exists`)};
        const exists: boolean = this.forms.convertedCustomization.contains(name);
        if (!exists) {
          this.forms.convertedCustomization.addControl(name,this.fb.control(defaultControlList[name]));
        } else {
          patch[name] = defaultControlList[name] || defaultInfo[name];
        }
        console.log(`${name} was set to ${defaultControlList[name] || defaultInfo[name]}`);
      })
    }

    const setTemplateChoice = () => {
      let choice = (element.defaultTemplate) ? '(default)' : element.template;
      choice = (choice === undefined) ? '' : choice;
      this.template = choice;
      patch['template:uid'] = choice;
    }

    const publishAndSetOverridesAndDisabled = () => {
      //console.log(`Patch before post is ${JSON.stringify(patch)}`);
      this.forms.convertedCustomization.patchValue(patch);
      Object.keys(element.overrides || {}).forEach(name => {
        //console.log(`Override for ${name} is ${element.overrides[name]}`);
      });
      this.forms.newOverrides = Object.assign({}, element.overrides);
      if (this.forms.newOverrides['content:theme'] === undefined) {
        this.forms.newOverrides['content:theme'] = false;
      } else {
        //console.log(`Initial override for 'content:theme' is ${this.forms.newOverrides['content:theme']}`);
      }
      this.forms.newDisabled = Object.assign({}, element.disabled);
      this.updateOverrideGroups();
      //this.setNewCustomizationTemplate();
    }

    //console.log(`Preparing Form...`);
    prepareForm();
    //console.log(`Setting Template Choice...`);
    setTemplateChoice();
    //console.log(`Publishing and Finishing...`);
    publishAndSetOverridesAndDisabled();
    //console.log(`Pull has completed successfully...`);
  }

  newClearCCViewInfo(): void {
    const value = this.forms.convertedCustomization.value;
    const stylingNames: Array<string> = Object.keys(value);
    const patch = {};
    stylingNames.forEach(name => {
      patch[name] = undefined;
    })
    
    this.revertElementCustomization();
    setTimeout(() => {
      this.forms.convertedCustomization.patchValue(patch);
      this.forms.templateEditUI = undefined;
      this.forms.newOverrides = {};
      this.forms.newOverrideGroups = {};
    }, 20)
  }

  revertElementCustomization(ui?: string): void {
    ui = ui || this.ccViewUI;
    const element = this.elementService.elements[ui];
    if (element != undefined) {
      const customization = this.elementService.elements[ui].customization;
      this.elementService.fullParse(ui,customization,true);
    }
  }

  updateOverrideGroups(): void {
    const overrides: Array<string> = Object.keys(this.forms.newOverrides);
    const newOverrideGroups = {};
    overrides.forEach(name => {
      const target: string = name.split(":")[0];
      if (newOverrideGroups[target] === undefined) {
        newOverrideGroups[target] = [];
      }
      newOverrideGroups[target].push('');
    })
    this.forms.newOverrideGroups = newOverrideGroups;
  }

  newSubmitCCViewInfo(): void {
    let overrides, disabled;
    const getOverridesAndDisabled = () => {
      overrides = Object.assign({},this.forms.newOverrides);
      disabled = Object.assign({}, this.forms.newDisabled);
    };

    const element = this.elementService.elements[this.ccViewUI];
    const parentElement = this.elementService.elements[this.parentUI];
    let customizationBackup, content, customization = JSON.parse(JSON.stringify(element.customization));
    const parseConvertedCustomization = () => {
      customizationBackup = this.forms.convertedCustomization.value;
      Object.keys(customizationBackup)
        .filter(name => !disabled[name] && name.split(":")[0] != 'template') 
        .forEach(name => {
          const content: boolean = (name.split(":")[0] === 'content') ? true : false;
          const templateUID = customizationBackup['template:uid'];
          const template = this.elementService.templates[templateUID];
          const templateSet: boolean = (template != undefined) ? true : false;
          const themeUID = customizationBackup['template:uid'];
          const theme = this.elementService.templates[templateUID];
          const themeSet: boolean = (theme != undefined) ? true : false;
          if (overrides[name] || element.elementType === 'container' || content || templateSet || themeSet) {
            customization[name] = customizationBackup[name];
            console.log(`${name} set to ${customizationBackup[name]}.`);
          } else {
            customization[name] = parentElement.customization[name];
            console.log(`${name} set to ${parentElement.customization[name]}.`);
          }
        })
      content = this.elementService.parseContent(customization);
      console.log(`Assembled content is ${JSON.stringify(content)}`);
      console.log(`About to assign content...`);
      console.log(`Disabled list ${JSON.stringify(Object.keys(disabled).filter(style => disabled[style]))}`);
      console.log(`Override list ${JSON.stringify(Object.keys(overrides).filter(style => overrides[style]))}`);
      Object.keys(content).forEach(style=>console.log(`${style} = ${typeof content[style] === 'string' ? content[style] : JSON.stringify(content[style])}`));
    }

    const setElementData = () => {
      if (element != undefined) {
        //console.log(`Element is not undefined`);
        this.elementService.elements[this.ccViewUI].template = (customizationBackup['template:uid'] === '') ? undefined : this.forms.convertedCustomization.value['template:uid'];
        this.elementService.elements[this.ccViewUI].customization = Object.assign({}, customization);
        this.elementService.elements[this.ccViewUI].customizationBackup = Object.assign({}, customizationBackup);
        this.elementService.elements[this.ccViewUI].content = content;
        this.elementService.elements[this.ccViewUI].contentsList = this.forms.contentsList.slice();
        this.elementService.elements[this.ccViewUI].overrides = overrides;
        this.elementService.elements[this.ccViewUI].disabled = disabled;
        this.elementService.elements[this.ccViewUI].templateOverride = this.forms.templateOverride;
        this.elementService.elements[this.ccViewUI].defaultTemplate = this.forms.defaultTemplate;
        this.elementService.fullParse(this.ccViewUI, customization, true);
      } else {
        //console.log(`Element is undefined`);
      }
    }

    const setChildElementData = () => {
      if (content.theme != undefined && content.theme != '') {
        const themeTemplates = this.elementService.themes[content.theme].stylingTemplates;
        const childElements: Array<string> = content.elementUIs || [];
        //console.log(`ChildElements: ${JSON.stringify(childElements)}`);
        childElements.forEach(ui => {
          const element = this.elementService.elements[ui];
          const elementType: string = element.elementType;
          const templateUI = themeTemplates[elementType];
          this.elementService.setTemplate(ui, templateUI, true, true);
        })
      } else if (content.theme != undefined && content.theme === '') {
        const mainThemeUI: string = this.elementService.currentTheme;
        const mainTheme = this.elementService.themes[mainThemeUI];
        let themeTemplates = {};
        if (mainTheme != undefined) {
          themeTemplates = mainTheme.stylingTemplates;
        }
        const childElements: Array<string> = content.elementUIs || [];
         childElements.forEach(childUI => {
          const child = this.elementService.elements[childUI];
          const childType = child.elementType;
          const templateUI = themeTemplates[childType];
          if (child.templateOverride !== true) {
            if (templateUI != undefined) {
              this.elementService.setTemplate(childUI, templateUI, true, true);
            } else {
              this.elementService.setContainerAsTemplate(childUI, this.ccViewUI, true);
            }
          }
        })

      }
    };

    const updatePadManagerDisplayList = () => {
      this.flowService.assembleDisplayList();
    }

    //console.log(`Initial customization snapshot of convertedCustomization -------------------------------------`);
    Object.keys(this.forms.convertedCustomization.value).forEach(style => {
      //console.log(`${style} = ${this.forms.convertedCustomization.value[style]}`);
    })
    //console.log(`------------------------------------------------------------------------------------------------`);
    getOverridesAndDisabled();
    parseConvertedCustomization();
    //console.log(`Customization snapshot after turning parsing convertedCustomization -------------------------------------`);
    Object.keys(customization).forEach(style => {
      //console.log(`${style} = ${customization[style]}`);
    })
    //console.log(`------------------------------------------------------------------------------------------------`);
    setElementData();
    setChildElementData();
    updatePadManagerDisplayList();
    this.elementService.saveElements();
    this.deleteOnCancel = '';
    //console.log(`Customization snapshot before turning off newCustomization -------------------------------------`);
    Object.keys(this.elementService.elements[this.ccViewUI].customization).forEach(style => {
      //console.log(`${style} = ${this.elementService.elements[this.ccViewUI].customization[style]}`)
    })
    //console.log(`------------------------------------------------------------------------------------------------`);
    //console.log(`Parsed Customization snapshot before turning off newCustomization -------------------------------------`);
    Object.keys(this.elementService.elements[this.ccViewUI].parsedCustomization.main).forEach(style => {
      //console.log(`${style} = ${this.elementService.elements[this.ccViewUI].parsedCustomization.main[style]}`)
    })
    //console.log(`------------------------------------------------------------------------------------------------`);
    this.enableMode('newCustomization',false);
  }

  revertThemeCustomization(): void {
    const revertContainer = () => {
      this.restoreFromCustomizationMemory(this.ccViewUI);
    };

    const revertContainerElements = () => {
      const affectedElements: Array<string> = this.elementService.elements[this.ccViewUI].customization['content:elementUIs'];
      affectedElements.forEach(ui => {
        this.restoreFromCustomizationMemory(ui);
      })
    };

    revertContainer();
    revertContainerElements();
  }

  storeCustomizationMemory(ui, customization, overrides, disabled, template, templateStrict: boolean = false) {
    if (this.customizationMemory[ui] === undefined) {
      this.customizationMemory[ui] = {
        customization: customization, 
        overrides: overrides,
        disabled: disabled,
        template: template,
        templateStrict: templateStrict,
      }
    }
  }

  restoreFromCustomizationMemory(ui: string): void {
    const memory = this.customizationMemory[ui];
    if (memory != undefined) {
      //console.log(`Restoring element ${ui} from memory template ${memory.template}`);
      const template = this.elementService.templates[memory.template];
      const templateStyling = (template === undefined) ? {} : template.styling;
      const elementStyling = memory.customization;
      const overrides = memory.overrides;
      const disabled = memory.disabled;
      const strict: boolean = memory.templaateStrict;
      const oldCustomization = this.elementService.assembleCustomization(
        templateStyling,
        elementStyling,
        overrides,
        disabled,
        strict,
      );
      this.elementService.fullParse(ui, oldCustomization, true);
      delete this.customizationMemory[ui];
    }
  }

  setNewCCViewTemplate(event, wait: number = 100) {
    const templateUI: string = event.currentTarget.value;
    setTimeout(() => {
      const element = this.elementService.elements[this.ccViewUI];
      const parentElement = this.elementService.elements[this.parentUI];
      const elementType = element.elementType;
      let template = this.elementService.templates[templateUI];
      template = (templateUI === '(default)') ? 
        this.elementService.elementTypes[elementType].defaultInfo.template : 
        this.elementService.templates[templateUI] || {styling: parentElement.customization};
      const overrides = this.forms.newOverrides || {};
      const customization = this.forms.convertedCustomization.value;
      const overlayCustomization = Object.assign({}, template.styling);
      overlayCustomization['template:uid'] = templateUI;
      const newCustomization = {};
      const protocols ={
        'override': (name) => {
          newCustomization[name] = customization[name];
        },
        'default': (name) => {
          if (overlayCustomization[name] != undefined) {
            newCustomization[name] = overlayCustomization[name]
          } else {
            protocols['override'](name);
          }
        },
      }
  
      let customizationList = Object.keys(customization);
  
      customizationList.forEach(name => {
        const protocol: string = (overrides[name] === true) ? 'override' : 'default';
        protocols[protocol](name);
      })
  
      this.forms.convertedCustomization.patchValue(newCustomization);
      this.projectCCViewToElement();
    },wait);
  }

  setNewCCViewTheme(event,wait: number = 100) {
    const themeUI: string = event.currentTarget.value;
    setTimeout(() => {
      const customization = this.forms.convertedCustomization.value;
      const element = this.elementService.elements[this.ccViewUI];
      const elementType = element.elementType;
      const theme = this.elementService.themes[themeUI];
      const overrides = this.forms.newOverrides || {};
      
      let templateUI = customization['template:uid'];
      let template = this.elementService.templates[templateUI];
      if (template === undefined || overrides['template:uid'] !== true) {
        if (theme === undefined) {
          const mainTheme = this.elementService.themes[this.elementService.currentTheme];
          if (mainTheme === undefined) {
            templateUI === '(default)';
          } else {
            templateUI = mainTheme.stylingTemplates[elementType];
          }
        } else {
          templateUI = theme.stylingTemplates[elementType];
        }
      }
      const mockEvent = {currentTarget: {value: templateUI}};
      this.setNewCCViewTemplate(mockEvent,0);
    }, wait)
  }

  projectCCViewToElement(wait: number = 100): void {
    setTimeout(() => {
      const visualizationOff: boolean = (this.visualizationMode === 'off') ? true : false;
      const element = this.elementService[this.ccViewUI];
      const customization = (visualizationOff) ? element.customization : this.forms.convertedCustomization.value;
      const templateUI: string = customization['template:uid'];
      const templateStrict: boolean = false;
      const themeUI: string = customization['content:theme'];
      const themeStrict: boolean = false;
      const overrides = (visualizationOff) ? element.overrides || {} : this.forms.newOverrides || {};
      const disabled = (visualizationOff) ? element.disabled || {} : this.forms.newDisabled || {};
      const themeOverride: boolean = true;

      const elementProjection: ElementDirectProjection = {
        customization: customization,
        overrides: overrides,
        disabled: disabled,
      }

      const templateProjection: TemplateReferenceProjection = {
        ui: templateUI,
        strict: templateStrict,
      } 

      const themeProjection: ThemeReferenceProjection = {
        ui: themeUI,
        strict: themeStrict,
        themeOverride: themeOverride,
      }

      const newProjection: NewProjection = {
        'elementProjection': elementProjection,
        'templateProjection': templateProjection,
        'themeProjection': themeProjection,
      }
  
      const ui: string = this.ccViewUI;
      this.elementService.newProjectToElement(ui, newProjection, 'element');
    },wait);
  }

  projectCCViewToTemplate(wait: number = 100): void {
    setTimeout(() => {
      const visualizationOff: boolean = (this.visualizationMode === 'off') ? true : false;
      const visualizationStrict: boolean = (this.visualizationMode === 'strict') ? true : false;
      const convertedCustomization = this.forms.convertedCustomization.value;
      const affectedElements = this.forms.templateElements;
      affectedElements.forEach(ui => {
        const element = this.elementService.elements[ui];
        const template = this.elementService.templates[element.template];
        const elementProjection: ElementReferenceProjection = {
          ui: ui,
        };

        const templateProjection: TemplateDirectProjection = {
          ui: (visualizationOff) ? element.template : convertedCustomization['template:uid'],
          styling: (!visualizationOff) ? convertedCustomization :
            (template === undefined) ? {} : template.styling,
          disabled: (visualizationOff) ? template.disabled : this.forms.newDisabled,
          strict: (visualizationOff) ? template.templateStrict : visualizationStrict,
        };

        const themeProjection: ThemeReferenceProjection = {
          ui: element.theme,
          strict: false,
          themeOverride: false,
        }

        const newProjection: NewProjection = {
          elementProjection: elementProjection,
          templateProjection: templateProjection,
          themeProjection: themeProjection,
        };

        this.elementService.newProjectToElement(ui, newProjection,'template');
      })
    }, wait);
  }

  projectCCViewToTheme(wait: number = 100): void {
    setTimeout(() => {
      const visualizationOff: boolean = (this.themeVisualizationMode === 'off') ? true : false;
      const visualizationStrict: boolean = (this.themeVisualizationMode === 'strict') ? true : false;
      const masterUI: string = 'masterContainer';
      const masterElement = this.elementService.elements[masterUI];
      const elementProjection: ElementReferenceProjection = {
        ui: masterUI,
      };

      const templateProjection: TemplateDirectProjection = {
        ui: '',
        styling: {},
        disabled: {},
        strict: false,
      };

      const themeInfo = this.forms.newThemeEditor.value;
      const theme = this.elementService.themes[themeInfo.ui];

      //console.log(`Visualization is ${visualizationOff ? '':'not '}off.`);
      const currentThemeUI: string = this.elementService.currentTheme;
      const currentTheme = this.elementService.themes[currentThemeUI] || {stylingTemplates:{},disabledTypes:{},strict:false};
      const themeProjection: ThemeDirectProjection = {
        ui: (visualizationOff) ? currentThemeUI : themeInfo.ui,
        stylingTemplates: (visualizationOff) ? currentTheme.stylingTemplates : 
          (theme === undefined) ? this.forms.newThemeEditor.value : themeInfo,
        strict: (visualizationOff) ? currentTheme.strict : 
          (theme === undefined) ? theme.strict : visualizationStrict,
        themeOverride: false,
        disabled: (visualizationOff) ? currentTheme.disabledTypes : 
          (theme === undefined) ? theme.disabledTypes : this.forms.newThemeEditorDisabled,
      }

      //console.log(`UI of themeProjection is ${themeProjection.ui}`);
      //console.log(`Strict is ${themeProjection.strict}`);
      Object.keys(themeProjection.stylingTemplates).forEach(type=>console.log(`${type} = ${themeProjection.stylingTemplates[type]}`));

      const newProjection: NewProjection = {
        elementProjection: elementProjection,
        templateProjection: templateProjection,
        themeProjection: themeProjection,
      }
 
      //console.log(`Keys for disabled ${JSON.stringify(Object.keys(themeProjection.disabled))}`);
      //console.log(`Disabled values are ${JSON.stringify(Object.keys(themeProjection.disabled).filter(key => themeProjection.disabled[key] === true))}`);
      //console.log(`Projecting theme with styling templates...`);Object.keys(newProjection.themeProjection['stylingTemplates']).forEach(type => //console.log(`${type}: ${newProjection.themeProjection['stylingTemplates'][type]}`));

      this.elementService.newProjectToElement('masterContainer',newProjection,'theme');
    }, wait);
  }

  setPreviewTemplate(ui: string, customInfo, wait: boolean = false) {
    const element = this.elementService.elements[ui];

    //console.log(`Setting preview template for ${ui}`);
    if (customInfo.templateStyling != undefined) {
      //console.log(`Styling of this new template is...`);
      const allCustomizations: Array<string> = Object.keys(customInfo.templateStyling);
      Object.keys(element.customization).forEach(name => {
        if (allCustomizations.indexOf(name) === -1) {
          allCustomizations.push(name);
        }
      })
      allCustomizations.forEach(name => {
        //console.log(`Comparing values of ${name}: Element ${element.customization[name] || '*undefined*'} | Template ${customInfo.templateStyling[name] || '*undefined*'}`);
        //console.log(`This customization is ${customInfo.overrides[name] === true ? '' : 'not '}overridden.`);
      })
    }

    const elementStyling = (customInfo?.customization === undefined) ? element.customization : customInfo.customization;

    let templateStyling;
    if (customInfo.templateUI != undefined) {
      const templateUI = customInfo.templateUI;
      const template = (templateUI === '(default)') ? 
        this.elementService.elementTypes[element.elementType].defaultInfo.template : 
        this.elementService.templates[templateUI];
      templateStyling = (template === undefined) ? {} : template.styling;
    } else {
      templateStyling = customInfo.templateStyling;
    }

    const overrides = (customInfo.overrides === undefined) ? element.overrides : customInfo.overrides;
    const disabled = (customInfo.disabled === undefined) ? element.disabled : customInfo.disabled;
    
    const newCustomization = this.elementService.assembleCustomization(
      templateStyling,
      elementStyling,
      overrides || {},
      disabled || {},
      false
    );
    
    Object.keys(newCustomization).forEach(name => {
      const firstTag = name.split(":")[0];
      if (firstTag === 'content' || firstTag === 'template') {
        delete newCustomization[name];
      }
    })
    
    //console.log(`Final customization is...`);
    Object.keys(newCustomization).forEach(name => {
      //console.log(`The value of ${name} is ${newCustomization[name]}`);
    })
    const elementService = this.elementService;

    const callbackFunc = function(ui, newCustomization, publish, elementService) {
      return () => {
        elementService.fullParse(ui, newCustomization, publish);
      }
    }(ui, newCustomization, true, elementService);

    if (!wait) {
      callbackFunc();
    }
    return {
      newCustomization: newCustomization,
      callbackFunc: callbackFunc,
    }
  }

  setNewCustomizationTheme(event): void {
    const element = this.elementService.elements[this.ccViewUI];
    const themeUI = event.currentTarget.value;
    const protocol = (themeUI === '') ? 'unsetTheme' : 'setTheme';

    let themeExists: boolean, theme;
    const getTheme = () => {
      theme = this.elementService.themes[themeUI];
      themeExists = (theme != undefined) ? true : false;
    }

    const storeCurrentCustomization = () => {
      const customization = this.forms.convertedCustomization.value;
      const template = customization['template:uid'];
      if (this.customizationMemory['convertedCustomization'] === undefined) {
        this.customizationMemory['convertedCustomization'] = Object.assign({}, customization);
      }
      //console.log(`Storing element ${this.ccViewUI} with template ${template}`);
      this.storeCustomizationMemory(this.ccViewUI, customization, this.forms.newOverrides, this.forms.newDisabled, template);
      const containerUIs: Array<string> = element.parsedCustomization.content['elementUIs'].slice();
      containerUIs.forEach(ui => {
        const element = this.elementService.elements[ui];
        //console.log(`Storing element ${ui} with template ${element.template}`);
        this.storeCustomizationMemory(ui, element.customization, element.overrides, element.disabled, element.template);
      })
    }

    const restoreCurrentCustomization = () => {
      //console.log(`Restoring current Customization`);
      const mainContainer: boolean = (this.ccViewUI === 'masterContainer') ? true : false;
      let defaultTheme;
      if (mainContainer) {
        defaultTheme = this.elementService.getDefaultTheme();
      } else {
        defaultTheme = {};
        const themeUI = this.elementService.currentTheme;
        const theme = this.elementService.themes[themeUI];
        Object.keys(theme.stylingTemplates).forEach(type => {
          defaultTheme[type] = this.elementService.templates[theme.stylingTemplates[type]].styling;
        })
      }

      const restoreMainContainer = () => {
        const masterContainer = this.elementService.elements['masterContainer'];
        const overrides = this.forms.newOverrides;
        const disabled = this.forms.newDisabled;
        const customization = this.forms.convertedCustomization.value;
        const templateUI = customization['template:uid'];
        const template = this.elementService.templates[templateUI];
        const templateStyling = (template != undefined) ? template.styling : defaultTheme.container;
        this.forms.convertedCustomization.patchValue({
          'template:uid': '',
          'content:theme': '',
        })
        templateStyling['template:uid'] = '';
        const previewSetInfo = this.setPreviewTemplate('masterContainer', {
          templateStyling: templateStyling,
          customization: customization,
          overrides: overrides,
          disabled: disabled,
        }, true);
        this.forms.convertedCustomization.patchValue(previewSetInfo.newCustomization);
        previewSetInfo.callbackFunc();

        const padUIs: Array<string> = masterContainer.parsedCustomization.content.elementUIs;
        padUIs.forEach(padUI => {
          restorePadContainer(padUI);
        })
      }

      const restorePadContainer = (ui) => {
        //console.log(`Restoring pad ${ui}`);
        const element = this.elementService.elements[ui];
        const subTheme = this.elementService.themes[element.theme];
        const subThemeUIs = {};
        let subThemeTemplates = (subTheme === undefined) ? undefined : {};
        if (subThemeTemplates != undefined) {
          Object.keys(subTheme.stylingTemplates).forEach(type => {
            subThemeTemplates[type] = this.elementService.templates[subTheme.stylingTemplates[type]].styling;
            subThemeUIs[type] = subTheme.stylingTemplates[type];
          });
        } else {
          subThemeTemplates = defaultTheme;
        }
        let elementStyling, overrides, disabled, customization, templateStyling;
        if (!mainContainer) {
          //console.log(`This pad is the base of customization`);
          overrides = this.forms.newOverrides;
          disabled = this.forms.newDisabled;
          customization = this.forms.convertedCustomization.value;
          const templateUI = customization['template:uid'];
          const template = this.elementService.templates[templateUI];
          templateStyling = (overrides['template:uid'] === true) ? template.styling : defaultTheme.container;
          //console.log(`Template styling is ${overrides['template:uid'] === true ? '' : 'not '}overridden`);
          //console.log(`The styling retrieved is...`);
          Object.keys(templateStyling).forEach(name => {
            //console.log(`Styling for ${name} is ${templateStyling[name]}`);
          })
          this.forms.convertedCustomization.patchValue({
            'template:uid': subThemeUIs['container'] || '',
            'content:theme': '',
          })
          templateStyling['template:uid'] = '';
        } else {
          overrides = element.overrides;
          disabled = element.disabled;
          customization = element.customization;
          const templateUI: string = element.template;
          const template = this.elementService.templates[templateUI] || {styling: {}};
          templateStyling = (overrides['template:uid']) ? template.styling : subThemeTemplates['container'];
          this.forms.convertedCustomization.patchValue({
            'template:uid': subThemeUIs['container'] || '',
          })
          templateStyling['template:uid'] = subThemeUIs['container'] || '';
        }
        const setPreviewInfo = this.setPreviewTemplate(ui, {
          templateStyling: templateStyling,
          customization: elementStyling,
          overrides: overrides,
          disabled: disabled,
        }, !mainContainer);
        if (!mainContainer) {
          this.forms.convertedCustomization.patchValue(setPreviewInfo.newCustomization);
          setPreviewInfo.callbackFunc();
        }

        const childUIs: Array<string> = element.parsedCustomization.content.elementUIs;
        childUIs.forEach(childUI => {
          restorePadChild(childUI,subThemeTemplates, subThemeUIs);
        })
      }

      const restorePadChild = (ui, themeTemplates, themeTemplateUIs) => {
        const element = this.elementService.elements[ui];
        const elementStyling = element.customization;
        const overrides = element.overrides;
        const disabled = element.disabled;
        const templateUI: string = element.template;
        const template = this.elementService.templates[templateUI] || {styling: {}};
        const templateStyling = (element.templateOverride === true) ? template.styling : themeTemplates[element.elementType];
        templateStyling['template:uid'] = themeTemplateUIs;
        this.setPreviewTemplate(ui, {
          templateStyling: templateStyling,
          customization: elementStyling, 
          overrides: overrides,
          disabled: disabled,
        });
      }

      const protocols = {
        'main': () => {
          restoreMainContainer();
        },
        'pad': () => {
          restorePadContainer(this.ccViewUI);
        },
      }

      const protocol: string = (mainContainer) ? 'main' : 'pad';
      protocols[protocol]();
    };

    let overrides, disabled;
    const getOverridesAndDisabled = () => {
      overrides = this.forms.newOverrides;
      disabled = this.forms.newDisabled;
    }

    let patch, templateValues = {}, templateValueGroups = {};
    const updateCustomizations = () => {
      if (themeExists) {
        const updateContainerCustomization = (themeTemplates) => {
          if (overrides['template:uid'] !== true) {
            this.setNewCustomizationTemplate(themeTemplates['container']);
          }
        }

        const updateChildrenCustomizations = (themeTemplates) => {
          let affectedUIs: Array<string> = element.parsedCustomization.content['elementUIs'].slice();
          const getOldCustomization = (ui: string) => {
            const element = this.elementService.elements[ui];
            
            const oldCustomization = (element.lastCustomization != undefined) ? 
              JSON.parse(JSON.stringify(element.lastCustomization)) :
              JSON.parse(JSON.stringify(element.customization));
  
            return oldCustomization;
          }
  
          const assembleNewCustomization = (ui: string, oldCustomization) => {
            const element = this.elementService.elements[ui];
            const elementType = element.elementType;
            const elementOverrides = (element.overrides != undefined) ? element.overrides : {};
            const elementDisabled = (element.disabled != undefined) ? element.disabled : {};
            const themeTemplate = themeTemplates[elementType];
            const templateStyling = this.elementService.templates[themeTemplate].styling;
            
            const newCustomization = this.elementService.assembleCustomization(
              templateStyling,
              oldCustomization,
              elementOverrides,
              elementDisabled,
              false,
            )

            newCustomization['template:uid'] = themeTemplate;
  
            return newCustomization;
          }
  
          const postNewCustomization = (ui: string, newCustomization) => {
            this.elementService.fullParse(ui, newCustomization, true);
          }
  
          affectedUIs.forEach(ui => {
            if (this.elementService.elements[ui].templateOverride !== true) {
              const oldCustomization = getOldCustomization(ui);
              const newCustomization = assembleNewCustomization(ui,oldCustomization);
              postNewCustomization(ui,newCustomization);
            }
          })
        }
        
        const themeTemplates = theme.stylingTemplates;
        updateContainerCustomization(themeTemplates);
        updateChildrenCustomizations(themeTemplates);
      }
    }

    const protocols = {
      'setTheme': () => {
        //storeCurrentCustomization();
        setTimeout(() => {
          getTheme();
          getOverridesAndDisabled();
          updateCustomizations();
        },100);
      },
      'unsetTheme': () => {
        setTimeout(() => {
          restoreCurrentCustomization();
        }, 100);
      },
    }

    protocols[protocol]();
  }

  getNewTemplateGroups(templateStyling, overrides, disabled, publish: boolean = true) {
    let templateValues = {}, templateValueGroups = {};
    Object.keys(templateStyling)
      .filter(name => !(disabled[name] || overrides[name]))
      .forEach(name => {
        const templateValue = templateStyling[name];
        templateValues[name] = true;
        if (templateValue != '') {
          const groupName = name.split(":")[0];
          if (templateValueGroups[groupName] === undefined) {
            templateValueGroups[groupName] = [];
          }
          templateValueGroups[groupName].push('');
        }
      })
    if (publish) {
      this.forms.templateValues = templateValues;
      this.forms.templateValueGroups = templateValueGroups;
    }
    return {
      templateValues: templateValues,
      templateValueGroups: templateValueGroups,
    }
  }

  setNewCustomizationTemplate(templateUI?: string): void {
    //console.log(`Setting customization box to template ${templateUI}`);
    let templateExists: boolean, template;
    const getTemplate = () => {
      templateUI = (templateUI != undefined) ? templateUI : this.forms.convertedCustomization.value['template:uid'];
      //console.log(`Template UI is ${templateUI}`);
      template = this.elementService.templates[templateUI];
      templateExists = (template != undefined) ? true : false;
      template = (!templateExists) ? {styling: {}} : template;
    }

    let overrides, disabled;
    const getOverridesAndDisabled = () => {
      overrides = this.forms.newOverrides;
      disabled = this.forms.newDisabled;
    }

    let patch, templateValues = {}, templateValueGroups = {};
    const getNewStylingAndTemplateGroups = () => {
      const newTemplateValueInfo = this.getNewTemplateGroups(template.styling, overrides, disabled, false);
      //console.log(`New template value info is ${JSON.stringify(newTemplateValueInfo)}`);
      templateValues = newTemplateValueInfo.templateValues;
      templateValueGroups = newTemplateValueInfo.templateValueGroups;
      if (templateExists) {
        patch = {
          'template:name': this.elementService.templates[templateUI].templateName,
          'template:uid': templateUI,
        };
        const templateStyling = template.styling;
        Object.keys(templateStyling)
          .filter(name => !(disabled[name] || overrides[name]))
          .forEach(name => {
            const templateValue = templateStyling[name];
            templateValues[name] = true;
            if (templateValue != '') {
              patch[name] = templateValue;
              const groupName = name.split(":")[0];
              if (templateValueGroups[groupName] === undefined) {
                templateValueGroups[groupName] = [];
              }
              templateValueGroups[groupName].push('');
            }
          })
      }
    }

    let newCustomization;
    const postNewInfo = () => {
      //console.log(`Pushing patch...`);
      if (patch != undefined) {
        //Object.keys(patch).forEach(style => //console.log(`${style} = ${patch[style]}`));
        //console.log(`Patching value to convertedCustomization`);
        this.forms.convertedCustomization.patchValue(patch);
        newCustomization = Object.assign({}, this.forms.convertedCustomization.value);
        //console.log(`Final Values ${JSON.stringify(this.forms.convertedCustomization.value)}`);
      }
      this.forms.templateValues = templateValues;
      this.forms.templateValueGroups = templateValueGroups;
    }

    const updateCustomization = () => {
      const customizationUpdate = function(self) {
        return () => {
          //console.log(`NewCustomization -----------------------------------------------------`);
          //Object.keys(customization).forEach(name=>console.log(`${name} = ${customization[name]}`));
          self.elementService.fullParse(self.ccViewUI,newCustomization,true);
        }
      }(this);
      setTimeout(() => {
        customizationUpdate();
      },100);
    }

    setTimeout(() => {
      console.log(`Template does ${templateExists ? '':'not '}exist.`);
      getTemplate();
      getOverridesAndDisabled();
      getNewStylingAndTemplateGroups();
      postNewInfo();
      if (newCustomization != undefined) {updateCustomization()};
    },50)
  }

  editAsTemplate() {
    const value = this.forms.convertedCustomization.value;
    //console.log(`UI of template to edit ${value['template:uid']}`);
    //console.log(`TemplateName is ${value['template:name']}`);
    this.savePatchMemory(this.mode);
    this.editTemplate(value['template:uid']);
    this.loadPatchMemory('newCustomization',false);
  }

  createNewTemplate(returnTarget?: string): void {
    const newUID: string = this.elementService.createNewTemplate();
    this.deleteTemplateOnCancel = newUID;
    if (returnTarget != undefined) {
      this.templateManagerReturn = [returnTarget];
    }
    this.editTemplate(newUID);
  }

  newSaveAsTemplate(confirmed: boolean = false, fromElement: boolean = true): boolean {
    let result: boolean = true;
    const templateElements: Array<string> = this.forms.templateElements.slice();

    const protocols = {
      unconfirmed: () => {
        let template, templateExists: boolean;
        const getTemplate = () => {
          const templateUID: string = this.forms.convertedCustomization.value['template:uid'];
          template = this.elementService.templates[templateUID];
          templateExists = (template != undefined) ? true : false;
        }

        const textOptions = {};
        const getTextOptions = () => {
          const nameText: string = (templateExists) ? `Override Name` : `Name`;
          const nameRequired: boolean = true;
          const nameInitial = (templateExists) ? template.templateName : ``;
          textOptions[`name`] = {
            text: nameText,
            required: nameRequired,
            initial: nameInitial,
          }
        }

        let options, confirmText: string;
        const prepareAndDisplayConfirmOptions = () => {
          confirmText = `Are you sure you want to ${(templateExists) ? `override the template with name ${template.templateName}` : `save this template?`}`;
          options = {
            'Cancel': () => {this.elementService.enableMode(`confirmWithOptions`, false)},
            'Save': () => {this.newSaveAsTemplate(true);this.elementService.enableMode(`confirmWithOptions`, false)},
          }
          this.elementService.confirmWithTextOptions(
            confirmText,
            textOptions,
            options,
          )
        }

        getTemplate();
        getTextOptions();
        prepareAndDisplayConfirmOptions();
      },
      confirmed: () => {
        const value = this.forms.convertedCustomization.value;
        const disabled = this.forms.newDisabled || {};
        const updateProtocol: string = (fromElement) ? 'fromElement' : 'fromTemplate';

        let templateName: string, templateUID: string, templateNameAllowed: boolean;
        const getTemplateName = () => {
          if (this.mode === 'templateEdit') {
            templateName = this.forms.convertedCustomization.value['template:name'];
          } else {
            templateName = this.elementService.forms.textConfirmations.value['name'];
          }
          templateUID = (this.mode === 'newCustomization') ? value['template:uid'] : this.forms.templateEditUI;
          templateNameAllowed = this.elementService.checkTemplateName(templateUID, templateName);
        }

        const styling = {}, stylingBackup = value;
        const getStylingAndStylingBackup = () => {
          //console.log(`Checking through ${JSON.stringify(Object.keys(value))}`);
          //console.log(`Undisabled ones are ${JSON.stringify(Object.keys(value).filter(name => !disabled[name]))}`)
          Object.keys(value)
            .filter(name => !disabled[name])
            .forEach(name => {
              styling[name] = value[name];
            });
        }

        let templateInfo;
        const assembleTemplateInfo = () => {
          if (this.mode === 'newCustomization') {templateUID = value['template:uid']}
          else if (this.mode === 'templateEdit') {templateUID = this.forms.templateEditUI};
          if (templateUID === undefined || templateUID === '') {
            templateUID = this.elementService.generateUID();
          }
          templateInfo = {
            ui: templateUID,
            templateName: templateName,
            styling: styling,
            stylingBackup: stylingBackup,
            disabled: disabled,
          }
          //console.log(`TemplateStyling on save is ${JSON.stringify(templateInfo.styling)}`);
          //console.log(`TemplateStylingBackup on save is ${JSON.stringify(templateInfo.stylingBackup)}`);
        }

        const updateProtocols = {
          'fromElement': () => {
            this.elementService.createTemplate(templateName, templateInfo, templateUID);

            const updateElementOverridesAndTemplate = () => {
              this.forms.convertedCustomization.patchValue({
                'template:uid': templateUID,
              });
              this.forms.newOverrides = {};
              this.updateOverrideGroups();
              this.setNewCustomizationTemplate();
            }

            updateElementOverridesAndTemplate();
          },
          'fromTemplate': () => {
            const updateTemplateAndAffectedElements = () => {
              this.elementService.updateTemplate(templateUID, templateInfo, templateElements);
            }

            const clearTemplateElements = () => {
              this.deleteTemplateOnCancel = '';
              this.forms.templateElements = [];
            }

            updateTemplateAndAffectedElements();
            clearTemplateElements();
          },
        }

        getTemplateName();
        if (templateName === '') {result = false; return;};
        getStylingAndStylingBackup();
        assembleTemplateInfo();
        
        //console.log(`Updating with protocol ${updateProtocol}`);
        updateProtocols[updateProtocol]();
      },
    }

    const protocol: string = (confirmed) ? 'confirmed' : 'unconfirmed';
    protocols[protocol]();
    return result;
  }

  getNewCustomization() {
    const value = this.forms.convertedCustomization.value;
    const newInfo = {};
    Object.keys(value)
      .filter(name => value[name] != undefined && value[name] != '')
      .forEach(name => {
        newInfo[name] = value[name];
      })
    const parseList: Array<string> = ['font','border','background','shadow',];
    //console.log(`Getting new customization...`);
    const parsedObject = this.elementService.specialParse(parseList,newInfo);
    return parsedObject;
  }

  getCustomStyling(uid: string,baseStyling,overlay) {
    let elementIsEditing: boolean;
    const checkIfElementIsEditing = () => {
      elementIsEditing = (this.ccViewUI === uid) ? true : false;
    }

    let newStyling;
    const overlayCustomStylingOverElementCustomization = () => {
      newStyling = Object.assign({},baseStyling);
      if (elementIsEditing) {
        newStyling = Object.assign(newStyling,this.getNewCustomization());
      }
      if (overlay) {
        newStyling['border:radius'] = '0';
      }
    }

    checkIfElementIsEditing();
    overlayCustomStylingOverElementCustomization();
    return newStyling;
  }

  editTemplate(ui: string): void {
    //console.log(`Editing ${ui} with name ${this.elementService.templates[ui]}`);
    let template = this.elementService.templates[ui];
    if (template != undefined) {
      this.forms.newNames.patchValue({
        template: template.templateName,
      })
      
      const newAffectedElements: Array<string>  = [];
      const getAffectedElements = () => {
        const elements = this.elementService.elements;
        Object.keys(elements).forEach(elementUI => {
          const element = elements[elementUI];
          //console.log(`Checking element ${element.template} against ${ui}`);
          if (element.template === ui) {
            newAffectedElements.push(elementUI);
          }
        })
      }

      getAffectedElements();
      this.forms.templateElements = newAffectedElements;

      //console.log(`Template Elements are ${JSON.stringify(this.forms.templateElements)}`);

      const newConvertedCustomization = Object.assign({}, template.stylingBackup);
      newConvertedCustomization['template:uid'] = ui;
      const patch = template.stylingBackup;
      patch['template:name'] = this.elementService.templates[ui].templateName;
      this.forms.templateEditUI = ui;
      this.forms.convertedCustomization.patchValue(patch);
      this.forms.newOverrides = {};
      this.forms.templateValues = {};
      this.forms.templateValueGroups = {};
      this.forms.newDisabled = Object.assign({},template.disabled);
      this.ccViewElementType = 'link';
      this.enableMode('templateEdit',true);
      this.updateAffectedElements();
    }
  }

  newElement(uid: string, event): void {
    this.parentUI = uid;
    this.enableMode('elementType',true,undefined,uid,event);
  }

  createNewElement(elementType: string, customize: boolean = true, ui?: string, parentUI?: string, event?): void {
    //console.log(`Creating new element of type ${elementType}`);
    //console.log(`customize: ${customize} | ui: ${ui} | parentUI: ${parentUI} | event: ${event != undefined}`);
    let newElementUID = (ui === undefined) ? this.elementService.generateUID() : ui;
    let newParentUID = (parentUI === undefined) ? this.parentUI : parentUI;
    //console.log(`newElementUID: ${newElementUID} | newParentUID: ${newParentUID}`);
    const createElementPointerAndPullInfo = () => {
      this.elementService.createNewElement(newElementUID, elementType);
      if (customize) {
        this.parentUI = newParentUID;
        this.ccViewUI = newElementUID;
        this.ccViewElementType = elementType;
        this.deleteOnCancel = (customize) ? newElementUID : '';
      }
      if (!Array.isArray(this.elementService.elements[newParentUID].customization['content:elementUIs'])) {
        throw new Error(`Element UIs for ui ${newParentUID} of type: ${elementType} is not an array.`); 
      }
      this.elementService.elements[newParentUID].customization['content:elementUIs'].push(newElementUID);
      const currentTheme = this.elementService.themes[this.elementService.currentTheme];
      if (currentTheme != undefined && !currentTheme.disabledTypes[elementType]) {
        const themeTemplate = currentTheme.stylingTemplates[elementType];
        if (themeTemplate != undefined && themeTemplate != '') {
          //console.log(`Setting element to template ${themeTemplate}`);
          this.elementService.setTemplate(newElementUID, themeTemplate, false, true);
        }
      } else if (currentTheme === undefined) {
        const parentElement = this.elementService.elements[newParentUID];
        const styleCustomization = JSON.parse(JSON.stringify(this.elementService.elements[newElementUID].customization));
        Object.keys(parentElement.customization).filter(style => style.split(":")[0] != 'content').forEach(style => styleCustomization[style] = parentElement.customization[style]);
        this.elementService.elements[newElementUID].customization = styleCustomization;
        //console.log(`Keys for styleCustomization are ${JSON.stringify(styleCustomization)}`);
        this.elementService.fullParse(newElementUID, styleCustomization, true);
      }
    }

    const enableViewAndSetDeleteOnCancel = () => {
      this.enableMode('newCustomization',true, newElementUID, newParentUID);
      this.newPullCCViewInfo(newElementUID);
      this.enableMode('elementType',false);
      //this.deleteOnCancel = this.ccViewUI;
    }

    const parseContentOfParentElement = () => {
      const parentElement = this.elementService.elements[newParentUID];
      const newContent = this.elementService.parseContent(parentElement.customization);
      //console.log(`New Content is ${JSON.stringify(newContent)}`);
      this.elementService.elements[newParentUID].parsedCustomization.content = newContent; 
    }

    //console.log(`About to create new element with type ${elementType}`);
    createElementPointerAndPullInfo();
    //console.log(`About to enable view mode`);
    if (customize) {enableViewAndSetDeleteOnCancel()};
    //console.log(`Parsing the content of the element we just updated`);
    //console.log(`Element Creation complete`);
  }

  confirmElementDeletion(uid: string): void {
    this.elementAwaitingDeletion = uid;
    this.enableMode('confirmDelete',true);
  }

  setOverride(customizationName: string, state: boolean = true): void {
    this.forms.newOverrides[customizationName] = state;
  }

  cementThemeTypeInfo(typeName?: string, typeInfo?: object): void {
    const value = this.forms.convertedCustomization.value;
    const templateUID = value['template:uid']
    const disabled = this.forms.newDisabled;

    const fillDefaults = () => {
      typeName = typeName || this.ccViewElementType;
      typeInfo = typeInfo || this.forms.convertedCustomization.value;
    }

    let backupStyling;
    const assembleBackupStyling = () => {
      backupStyling = Object.assign({}, typeInfo);
    }

    const publishNewInfo = () => {
      this.forms.newTheme.info['stylingBackups'][typeName] = backupStyling;
      this.forms.newTheme.info['stylingTemplates'][typeName] = templateUID;
      this.forms.newTheme.info['stylingDisabled'][typeName] = disabled;
    }
    
    fillDefaults();
    assembleBackupStyling();
    publishNewInfo();
  }

  disableThemeType(typeName: string, state?: boolean): void {
    const fillDefaultState = () => {
      if (state === undefined) {
        const currentState = this.forms.newTheme.info.disabledTypes[typeName] || false;
        state = !currentState;
      }
    }

    const setNewState = () => {
      this.forms.newTheme.info.disabledTypes[typeName] = state;
    }

    fillDefaultState();
    setNewState();
  }

  setThemeType(type: string, cementFirst: boolean = true): void {
    const typeIsDisabled: boolean = this.forms.newTheme.info.disabledTypes[type];

    const setToFirstAvailableType = () => {
      const types: Array<string> = this.forms.newTheme.elementTypeList;
      const result: boolean = types.some(name => {
        if (!this.forms.newTheme.info.disabledTypes[name]) {
          this.setThemeType(name);
          return true;
        }
      })
      if (!result) {
        this.disableThemeType(type,false);
      }
    }

    const cementTypeInfoAndSetNewType = () => {
      if (cementFirst) {
        this.cementThemeTypeInfo();
      }
      this.ccViewElementType = type;
    }

    const setNewCCViewForm = () => {
      const patch = this.forms.newTheme.info['stylingBackups'][type];
      patch['template:uid'] = this.forms.newTheme.info['stylingTemplates'][type];
      this.forms.convertedCustomization.patchValue(patch);
    }

    const cementLast = () => {
      this.cementThemeTypeInfo();
    }

    if (typeIsDisabled) {setToFirstAvailableType();return;}
    cementTypeInfoAndSetNewType();
    setNewCCViewForm();
    if (!cementFirst) {cementLast()};
  }

  createTheme(themeName?: string, ui?: string): void {
    const fillDefaults = () => {
      ui = (ui === undefined) ? ui : this.elementService.generateUID();
      themeName = (themeName === undefined) ? themeName : '';
    };

    const newTheme: ThemeInfo = {
      themeName: themeName,
      ui: ui,
      stylingTemplates: {},
      stylingBackups: {},
      disabledTypes: {},
    };
    let themeType: string;
    const assembleNewThemeInfo = () => {
      const elementTypes: Array<string> = this.forms.newTheme.elementTypeList;
      elementTypes.forEach(type => {
        if (themeType === undefined) {
          themeType = type;
        }
        const defaultCustomization = this.elementService.elementTypes[type].defaultInfo.customization;
        newTheme.stylingBackups[type] = Object.assign({}, defaultCustomization);
      })
    };

    const postThemeInfoAndEnableView = () => {
      this.forms.newTheme.info = newTheme;
      this.setThemeType(themeType,false);
      this.enableMode('themeEdit',true);
    }

    fillDefaults();
    assembleNewThemeInfo();
    postThemeInfoAndEnableView();
  }

  toggleNewThemeEditorDisable(elementType: string): void {
    const newState: boolean = !this.forms.newThemeEditorDisabled[elementType];
    this.forms.newThemeEditorDisabled[elementType] = newState;
    this.updateCustomizationFromForm();
  }

  editTheme(ui?: string): void {
    const elementTypes = this.forms.newTheme.elementTypeList;
    const theme: ThemeInfo = this.elementService.themes[ui];
    if (theme != undefined) {
      const setThemeInfo = () => {
        const patch = Object.assign({}, theme.stylingTemplates);
        patch['name'] = theme.themeName;
        patch['ui'] = theme.ui;
        this.forms.newThemeEditor.patchValue(patch);
        this.forms.newNames.patchValue({
          theme: theme.themeName,
        })
      }

      const setCurrentType = () => {
        let themeType: string;
        elementTypes.some(type => {
          themeType = type;
          return !theme.disabledTypes[type];
        })
        this.setThemeType(themeType,false);
      }

      const turnOnThemeEditMode = () => {
        this.enableMode('themeEdit',true);
        this.updateCustomizationFromForm();
      }

      setThemeInfo();
      //setCurrentType();
      turnOnThemeEditMode();
    } else {
      throw new Error(`Theme with UI ${ui} could not be found!`);
    }
  }

  newSubmitThemeInfo(): void {
    const editorValues = this.forms.newThemeEditor.value;
    const disabledValues = this.forms.newThemeEditorDisabled;

    const themeObject = {
      themeName: undefined,
      ui: undefined,
      stylingTemplates: undefined,
      disabledTypes: undefined,
    };
    const assembleThemeObject = () => {
      themeObject.themeName = editorValues.name;
      themeObject.ui = editorValues.ui;
      themeObject.stylingTemplates = {
        'background': editorValues.background,
        'checklist': editorValues.checklist,
        'container': editorValues.container,
        'link': editorValues.link,
        'multilink': editorValues.multilink,
        'note': editorValues.note,
      }
      themeObject.disabledTypes = disabledValues;
    }

    const publishThemeObject = () => {
      this.elementService.createTheme(themeObject);
      //this.enableMode('themeEdit',false);
      //console.log(`Checking if theme being edited is current theme`);
      if (editorValues.ui != this.elementService.currentTheme) {
        //console.log(`It is not.`);
        this.revertAllCustomization();
      }
    }

    //console.log(`Submitting theme info for customization`);

    assembleThemeObject();
    publishThemeObject();
  }

  submitThemeInfo(): void {
    this.cementThemeTypeInfo();
    const themeName: string = this.forms.newNames.value.theme;
    if (themeName === '') {
      return;
    }
    this.forms.newTheme.info['themeName'] = themeName;
    this.elementService.createTheme(this.forms.newTheme.info);
    this.enableMode('themeEdit',false);
  }
}
