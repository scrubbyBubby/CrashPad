import { Injectable } from '@angular/core';
import { ChecklistOverlayService } from '../checklist-overlay/checklist-overlay.service';
import { ElementService } from '../element/element.service';
import { FlowControlService } from '../flow-control/flow-control.service';

interface TemplateInfo {
  templateName: string,
  ui: string,
  styling: object,
  disabled: object,
  stylingBackup?: object,
}

@Injectable({
  providedIn: 'root'
})
export class ContainerService {
  public controlOpen: boolean;

  public overlayOpen: boolean;
  public overlayExpanded: boolean = false;

  private overlayTimeoutID: number;

  public defaultInfo = {
    template: <TemplateInfo>{
      ui: '(defaultContainerTemplate)',
      templateName: 'Default Container',
      styling: {
        'font:size': '24px',
        'font:family': 'Arial',
        'font:color': '#000000',
        'font:style': 'normal',
        'border:width': '3px',
        'border:style': 'solid',
        'border:color': '#CCCCCC',
        'border:radius': '15px',
        'background:color': '#FFFFFF',
        'background:image': '',
        'shadow:inset': 'outset',
        'shadow:xOffset': '0px',
        'shadow:yOffset': '0px',
        'shadow:color': '#FFFFFF',
        'shadow:blur': '0px',
        'shadow:spread': '0px',
      },
      disabled: {},
      stylingBackup: {
        'font:size': '24px',
        'font:family': 'Arial',
        'font:color': '#000000',
        'font:style': 'normal',
        'border:width': '3px',
        'border:style': 'solid',
        'border:color': '#CCCCCC',
        'border:radius': '15px',
        'background:color': '#FFFFFF',
        'background:image': '',
        'shadow:inset': 'outset',
        'shadow:xOffset': '0px',
        'shadow:yOffset': '0px',
        'shadow:color': '#FFFFFF',
        'shadow:blur': '0px',
        'shadow:spread': '0px',
      },
    },
    content: {
      'elementUIs': [],
      'title': "New Pad",
      'theme': '',
      'themeStrict': false,
    },
    contentList: [
      'title',
    ],
    customization: {
      'font:size': '24px',
      'font:family': 'Arial',
      'font:color': '#000000',
      'font:style': 'normal',
      'border:width': '3px',
      'border:style': 'solid',
      'border:color': '#CCCCCC',
      'border:radius': '15px',
      'background:color': '#FFFFFF',
      'background:image': '',
      'shadow:inset': 'outset',
      'shadow:xOffset': '0px',
      'shadow:yOffset': '0px',
      'shadow:color': '#FFFFFF',
      'shadow:blur': '0px',
      'shadow:spread': '0px',
    },
    disabled: {},
    overrides: {},
    ui: 'testContainer',
    elementType: 'container',
  }

  public uiLists: Object = {
  };

  private parseTypes = {
    'main': (customization) => {
      const parseList: Array<string> = ['font','border','background','shadow',];
      const parsedObject = this.elementService.specialParse(parseList,customization);
      return parsedObject;
    },
    'insideBorderRadius': (customization) => {
      const parsedObject = {};
      const defaultBorderRadius: number = Number(customization['border:radius'].split('px').join(''));
      parsedObject['borderRadius'] = `${Math.floor(defaultBorderRadius * 0.9)}px`;

      return parsedObject;
    },
    'iconTag': (customization) => {
      let parsedObject = {};

      const fontColor: string = customization['font:color'];
      if (fontColor != undefined) {
        parsedObject['color'] = fontColor;
      }

      const backgroundColor: string = customization['background:color'];
      if (backgroundColor != undefined) {
        parsedObject['backgroundColor'] = backgroundColor;
      }
      
      parsedObject = Object.assign(parsedObject,this.elementService.specialParse(['simpleBorder'],customization));
      parsedObject['fontWeight'] = '500';
      parsedObject['fontStyle'] = 'normal';

      const defaultBorderRadius: number = Number(customization['border:radius'].split('px').join(''));
      parsedObject['borderRadius'] = `0 ${Math.floor(defaultBorderRadius * 0.9)}px 0 ${Math.floor(defaultBorderRadius * 0.9)}px`;

      return parsedObject;
    },
    'content': (customization) => {
      const parsedObject = this.elementService.parseContent(customization);
      return parsedObject;
    },
    'headerBorder': (customization) => {
      const parsedObject = this.elementService.specialParse('border',customization);
      return parsedObject;
    },
    'listItems': (customization) => {
      const parsedObject = this.elementService.specialParse('listItems',customization);
      return parsedObject;
    },
    'textTag': (customization) => {
      let parsedObject = {};

      const fontColor: string = customization['font:color'];
      if (fontColor != undefined) {
        parsedObject['color'] = fontColor;
        parsedObject['fill'] = fontColor;
        parsedObject['stroke'] = fontColor;
      }

      const backgroundColor: string = customization['background:color'];
      if (backgroundColor != undefined) {
        parsedObject['backgroundColor'] = backgroundColor;
      }
      
      const borderObj = this.elementService.specialParse(['simpleBorder'],customization);
      //Object.keys(borderObj).forEach(name => console.log(`${name} = ${borderObj[name]}`));
      parsedObject = Object.assign(parsedObject, borderObj);
      return parsedObject;
    },
    'reverseTextTag': (customization) => {
      let parsedObject = {};

      const fontColor: string = customization['font:color'];
      if (fontColor != undefined) {
        parsedObject['backgroundColor'] = fontColor;
      }

      const backgroundColor: string = customization['background:color'];
      if (backgroundColor != undefined) {
        parsedObject['color'] = backgroundColor;
        parsedObject['fill'] = backgroundColor;
        parsedObject['stroke'] = backgroundColor;
      }

      const tempCustomization = JSON.parse(JSON.stringify(customization));
      tempCustomization['border:color'] = fontColor;
      //console.log(`Width: ${customization['border:width']} | Style: ${customization['border:style']} | Color: ${customization['border:color']} vs ${customization['font:color']}`);
      parsedObject = Object.assign(parsedObject,this.elementService.specialParse(['simpleBorder'],tempCustomization));
      return parsedObject;
    },
    'backgroundAndTextOnly': (customization) => {
      let parsedObject = {};

      const fontColor: string = customization['font:color'];
      if (fontColor != undefined) {
        parsedObject['color'] = fontColor;
      }

      const backgroundColor: string = customization['background:color'];
      if (backgroundColor != undefined) {
        parsedObject['backgroundColor'] = backgroundColor;
      }

      return parsedObject;
    },
    'fontColorOnly': (customization) => {
      let parsedObject = {};

      const fontColor: string = customization['font:color'];
      if (fontColor != undefined) {
        parsedObject['color'] = fontColor;
      }

      return parsedObject;
    },
    'fontColorAsBackground': (customization) => {
      let parsedObject = {};

      const fontColor: string = customization['font:color'];
      if (fontColor != undefined) {
        parsedObject['backgroundColor'] = fontColor;
      }

      return parsedObject;
    },
    'fontColorAsFillAndStroke': (customization) => {
      let parsedObject = {};

      const fontColor: string = customization['font:color'];
      if (fontColor != undefined) {
        parsedObject['fill'] = fontColor;
        parsedObject['stroke'] = fontColor;
      }

      return parsedObject;
    },
  }

  constructor(
    private elementService: ElementService,
    private flowService: FlowControlService,
    public checklistOverlayService: ChecklistOverlayService,
  ) { }

  initializeElement(uid: string): void {
    this.elementService.initializeElement(uid);
  }

  registerWithElementService(): void {
    let typeInfo;
    const getTypeInfo = () => {
      typeInfo = {
        typeName: 'container',
        defaultInfo: this.defaultInfo,
        parseTypes: this.parseTypes,
      }
    }

    const registerElementType = () => {
      this.elementService.registerElementType(typeInfo);
    }

    getTypeInfo();
    registerElementType();
  }

  postHeader(uid: string, text: string): void {
    const customizationTag: string = 'content:title';
    this.elementService.fastUpdate(uid,customizationTag,text);
    this.elementService.saveElements();
    this.flowService.assembleDisplayList();
  }
  
  setMainMenu(state?: boolean): void {
    const newState: boolean = (state === undefined) ? !this.controlOpen : state;
    this.controlOpen = newState;
    //console.log(`Main menu was set to ${newState}`);
  }

  closeOtherMenusIfMobile(toggling?: string): void {
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const mobile: boolean = (vw <= 700) ? true : false;
    if (mobile) {
      if (toggling != 'mainMenu') {
        this.setMainMenu(false);
      }
      if (toggling != 'overlay') {
        this.checklistOverlayService.setOpen(false);
      }
      this.holdHoveredElement();
    }
  }

  public hoveredElement: string = undefined;
  public hoveredElementHold: string;
  public hoverStyles = {};

  holdHoveredElement(ui?: string, force: boolean = false) {
    const oldUI: string = this.hoveredElementHold;
    const toggle: boolean = (ui === oldUI && !force) ? true : false;
    //console.log(`Hover hold: oldUI: ${oldUI} | ui: ${ui} | toggle: ${toggle}`);
    if (oldUI != undefined || toggle) {
      this.hoverStyles[oldUI] = 'textTag';
    }
    this.hoveredElementHold = (toggle) ? undefined : ui;
    if (ui != undefined && !toggle) {
      this.hoverStyles[ui] = 'reverseTextTag';
    }
  }

  setHoveredElement(ui?: string) {
    const oldUI: string = this.hoveredElement;
    //console.log(`Hover set: oldUI: ${oldUI} | ui: ${ui} | hoverHold: ${this.hoveredElementHold}`);
    if (oldUI != undefined && oldUI != this.hoveredElementHold) {
      this.hoverStyles[oldUI] = 'textTag';
    }
    this.hoveredElement = ui;
    if (ui != undefined) {
      this.hoverStyles[ui] = 'reverseTextTag';
    }
  }
}
