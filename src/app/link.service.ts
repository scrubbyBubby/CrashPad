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
export class LinkService {
  public defaultInfo = {
    template: <TemplateInfo>{
      ui: '(defaultLinkTemplate)',
      templateName: 'Default Link',
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
      text: 'New Link',
      link: 'https://www.reddit.com/r/games+news+worldnews',
    },
    contentList: [
      'text',
      'link',
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
    disabled: {},
    overrides: {},
    ui: undefined,
    elementType: 'link',
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
  }

  initializeElement(uid: string): void {
    this.elementService.initializeElement(uid);
  }

  parse(parseType: string, uid: string): void {
    const element = this.elementService.elements[uid];
    const customization = element.customization;
    const parsedObject = this.parseTypes[parseType](customization);
    if (this.elementService.elements[uid].parsedCustomization === undefined) {
      this.elementService.elements[uid].parsedCustomization = {};
    }
    this.elementService.elements[uid].parsedCustomization[parseType] = parsedObject;
  }

  constructor(
    public elementService: ElementService,
  ) { }

  registerWithElementService(): void {
    let typeInfo;
    const getTypeInfo = () => {
      typeInfo = {
        typeName: 'link',
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

  openLink(uid: string): void {
    let link: string;
    const getLink = () => {
      const content = this.elementService.elements[uid].content;
      link = content.link;
    }

    const openLink = () => {
      window.open(link);
    }

    getLink();
    openLink();
  }

  postText(uid: string, text: string): void {
    this.elementService.fastUpdate(uid,'content:title',text);
    this.elementService.saveElements();
  }
}
