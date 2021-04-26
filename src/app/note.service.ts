import { Injectable } from '@angular/core';
import { ElementService } from './element.service';

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
export class NoteService {
  public defaultInfo = {
    template: <TemplateInfo>{
      ui: '(defaultMultilinkTemplate)',
      templateName: 'Default Multilink',
      styling: {
        'font:size': '30px',
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
      },
      disabled: {},
      stylingBackup: {
        'font:size': '30px',
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
      },
    },
    content: {
      text: 'New note to help you remember things',
    },
    contentList: [
      'text',
    ],
    customization: {
      'font:size': '30px',
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
    },
    overrides: {},
    disabled: {},
    ui: undefined,
    elementType: 'note',
  }

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
    'textTag': (customization) => {
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
  }

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
        typeName: 'note',
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

  postText(uid: string, text: string): void {

  }
}
