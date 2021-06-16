import { Injectable } from '@angular/core';
import { ElementService } from '../element/element.service';

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
export class ChecklistService {

  public defaultInfo = {
    template: <TemplateInfo>{
      ui: '(defaultChecklistTemplate)',
      templateName: 'Default Checklist',
      styling: {
        'font:size': '20px',
        'font:family': 'Arial',
        'font:color': '#000000',
        'font:style': 'normal',
        'border:width': '2px',
        'border:style': 'solid',
        'border:color': '#CCCCCC',
        'border:radius': '0px',
        'background:color': '#FFFFFF',
        'background:image': '',
        'shadow:inset': 'outset',
        'shadow:xOffset': '0px',
        'shadow:yOffset': '0px',
        'shadow:color': '#FFFFFF',
        'shadow:blur': '0px',
        'shadow:spread': '0px',
        'checkbox:icon': 'X',
        'checkbox:color': 'unset',
        'listItems:size': 'medium',
        'listItems:fontColor': 'unset',
        'listItems:background': 'unset',
        'listItems:borderWidth': '1px',
        'listItems:borderStyle': 'solid',
        'listItems:borderColor': 'unset',
      },
      disabled: {},
      stylingBackup: {
        'font:size': '20px',
        'font:family': 'Arial',
        'font:color': '#000000',
        'font:style': 'normal',
        'border:width': '2px',
        'border:style': 'solid',
        'border:color': '#CCCCCC',
        'border:radius': '0px',
        'background:color': '#FFFFFF',
        'background:image': '',
        'shadow:inset': 'outset',
        'shadow:xOffset': '0px',
        'shadow:yOffset': '0px',
        'shadow:color': '#FFFFFF',
        'shadow:blur': '0px',
        'shadow:spread': '0px',
        'checkbox:icon': 'X',
        'checkbox:color': '#000000',
        'listItems:size': 'medium',
        'listItems:fontColor': '#000000',
        'listItems:background': '#FFFFFF',
        'listItems:borderWidth': '1px',
        'listItems:borderStyle': 'solid',
        'listItems:borderColor': '#000000',
      },
    },
    content: {
      title: "New Checklist",
      itemObj: {
        '1': {
          text: "New Checklist Task",
          note: 'Task description and notes',
          completed: false,
        },
      },
      itemList: [
        '1',
      ],
    },
    contentList: [
      'title',
    ],
    customization: {
      'font:size': '20px',
      'font:family': 'Arial',
      'font:color': '#000000',
      'font:style': 'normal',
      'border:width': '2px',
      'border:style': 'solid',
      'border:color': '#CCCCCC',
      'border:radius': '0px',
      'background:color': '#FFFFFF',
      'background:image': '',
      'shadow:inset': 'outset',
      'shadow:xOffset': '0px',
      'shadow:yOffset': '0px',
      'shadow:color': '#FFFFFF',
      'shadow:blur': '0px',
      'shadow:spread': '0px',
      'checkbox:icon': 'X',
      'checkbox:color': '#000000',
      'listItems:size': 'medium',
      'listItems:fontColor': '#000000',
      'listItems:background': '#FFFFFF',
      'listItems:borderWidth': '1px',
      'listItems:borderStyle': 'solid',
      'listItems:borderColor': '#000000',
    },
    overrides: {},
    disabled: {},
    ui: undefined,
    elementType: 'checklist',
  }

  private parseTypes = {
    'main': (customization) => {
      const parseList: Array<string> = ['font','border','background','shadow',];
      //console.log(`About to special parse main...`);
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
      
      //console.log(`About to special parse icon tag...`);
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
    'checkbox': (customization) => {
      //console.log(`About to special parse checkbox...`);
      const parsedObject = this.elementService.specialParse('checkbox',customization);
      return parsedObject;
    },
    'listItems': (customization) => {
      //console.log(`About to special parse list items...`);
      const parsedObject = this.elementService.specialParse('listItems',customization);
      return parsedObject;
    },
    'focusItem': (customization) => {
      const parsedObject = {};

      const shadowColor = (customization['shadow:color'] != undefined) ? customization['shadow:color'] : customization['font:color'];
      
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
      
      //console.log(`About to special parse text tag...`);
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
      //console.log(`About to special parse reverseTextTag...`);
      //console.log(`Keys for tempCustomization are ${JSON.stringify(Object.keys(tempCustomization))}`);
      parsedObject = Object.assign(parsedObject,this.elementService.specialParse(['simpleBorder'],tempCustomization));
      return parsedObject;
    },
    'divider': (customization) => {
      let parsedObject = {};

      const borderColor: string = customization['listItems:borderColor'];
      if (borderColor != undefined) {
        parsedObject['borderColor'] = borderColor;
      }
      
      const borderWidth: string = customization['listItems:borderWidth'];
      if (borderWidth != undefined) {
        parsedObject['borderWidth'] = borderWidth;
      }
      
      const borderStyle: string = customization['listItems:borderStyle'];
      if (borderStyle != undefined) {
        parsedObject['borderStyle'] = borderStyle;
      }

      //const parsedObject = this.elementService.specialParse('simpleBorder',customization);
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
    'borderAsBackground': (customization) => {
      let parsedObject = {};

      const borderColor: string = customization['border:color'];
      if (borderColor != undefined) {
        parsedObject['backgroundColor'] = borderColor;
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
    }
  }

  public checklists = {};

  constructor(
    public elementService: ElementService,
  ) { }

  initializeElement(uid: string): void {
    this.elementService.initializeElement(uid);
  }

  registerWithElementService(): void {
    let typeInfo;
    const getTypeInfo = () => {
      typeInfo = {
        typeName: 'checklist',
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

  updateChecklists(checklistUI: string,customContent?): void {
    const element = this.elementService.elements[checklistUI];
    const elementIsChecklist = (element.elementType === 'checklist') ? true : false;
    
    let checked: Array<string> = [], unchecked: Array<string> = [];
    const assembleNewCheckedAndUncheckedLists = () => {
      if (customContent === undefined) {customContent = this.elementService.typeParse(checklistUI, 'content', element.customization, false)};
      const checklist: Array<string> = customContent.itemList || this.elementService.elements[checklistUI].content.itemList;
      const checklistObj = customContent.itemObj;
      checklist.forEach(item => {
        if (checklistObj[item] != undefined && checklistObj[item].completed) {
          checked.push(item);
        } else {
          unchecked.push(item);
        }
      })
    }

    const publishNewCheckedAndUncheckedLists = () => {
      this.checklists[checklistUI] = {
        checked: checked.slice(),
        unchecked: unchecked.slice(),
      }
    }

    if (!elementIsChecklist) {return};
    assembleNewCheckedAndUncheckedLists();
    publishNewCheckedAndUncheckedLists();
  }

  addItem(uid: string): string {
    const itemList: Array<string> = this.elementService.elements[uid].customization['content:itemList'];
    const itemObj: Array<string> = this.elementService.elements[uid].customization['content:itemObj'];

    let newItemObj;
    const assembleNewItemObj = () => {
      newItemObj = {
        text: "New Checklist Task",
        note: 'Task description and notes',
        completed: false,
      };
    }

    let itemId: string;
    const findFirstAvailableItemId = () => {
      let idNumber: number = 0, idString: string;
      while (true) {
        idString = `${idNumber}`;
        const alreadyExists: boolean = (itemObj[idString] === undefined && itemList.indexOf(idString) === -1) ? false : true;
        if (alreadyExists) {
          idNumber++;
        } else {
          itemId = idString;
          break;
        }
      }
    }

    const createNewItemObjAndItemList = () => {
      const itemList: Array<string> = this.elementService.elements[uid].customization['content:itemList'];
      const newItemList: Array<string> = itemList.slice();
      newItemList.push(itemId);
      //console.log(`NewItemList is ${JSON.stringify(newItemList)}`);
      //console.log(`NewItemObj is ${JSON.stringify(newItemObj)}`);
      this.elementService.elements[uid].customization['content:itemList'] = newItemList;
      this.elementService.elements[uid].customization['content:itemObj'][itemId] = newItemObj;
      const customization = this.elementService.elements[uid].customization;
      this.elementService.typeParse(uid, 'content', customization, true);
      this.updateChecklists(uid);
      this.elementService.saveElements();
    }

    assembleNewItemObj();
    findFirstAvailableItemId();
    //console.log(`ItemId found is ${itemId}`);
    createNewItemObjAndItemList();
    return itemId;
  }

  removeItem(uid: string, item: string): void {
    const element = this.elementService.elements[uid];
    const content = this.elementService.typeParse(uid, 'content', element.customization, false);

    const removeItemFromItemList = () => {
      const index = content.itemList.indexOf(item);
      const itemIsInList: boolean = (index != -1) ? true : false;
      if (itemIsInList) {
        this.elementService.elements[uid].customization['content:itemList'].splice(index,1);
      }
    }

    const removeItemFromItemObj = () => {
      const itemIsInObj: boolean = (content.itemObj[item] != undefined) ? true : false;
      if (itemIsInObj) {
        delete this.elementService.elements[uid].customization['content:itemObj'][item];
      }
    }

    const saveNewElements = () => {
      this.elementService.saveElements();
    }
    
    removeItemFromItemList();
    removeItemFromItemObj();
    saveNewElements();
  }

  postText(uid: string, item: string, text: string): void {
    const customizationTag: string = 'content:itemObj';
    const newValue = JSON.parse(JSON.stringify(this.elementService.elements[uid].content.itemObj));
    newValue[item].text = text;
    this.elementService.fastUpdate(uid,customizationTag,newValue);
    this.elementService.saveElements();
  }

  postNote(uid: string, item: string, text:string): void {
    const customizationTag: string = 'content:itemObj';
    const newValue = JSON.parse(JSON.stringify(this.elementService.elements[uid].content.itemObj));
    newValue[item].note = text;
    this.elementService.fastUpdate(uid,customizationTag,newValue);
    this.elementService.saveElements();
  }

  postHeader(uid: string, text: string): void {
    const customizationTag: string = 'content:title';
    const newValue: string = text;
    this.elementService.fastUpdate(uid,customizationTag,newValue);
    this.elementService.saveElements();
  }
}
