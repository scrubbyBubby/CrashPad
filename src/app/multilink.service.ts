import { Injectable } from '@angular/core';
import { ElementService } from './element.service';
import { AlertOverlayService } from './alert-overlay.service';

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
export class MultilinkService {
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
      title: 'New Multilink',
      text1: '',
      link1: '',
      linkCount: 1,
    },
    contentList: [
      'text1',
      'link1',
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
    elementType: 'multilink',
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
      const linkTags = Object.keys(parsedObject).filter(style => style.indexOf('link') === 0).map(style => style.substring(4)).filter(style => ['Count','TagList'].indexOf(style) === -1);
      console.log(`Found link tags in multilink to be ${JSON.stringify(linkTags)}`);
      parsedObject['linkTagList'] = linkTags;
      return parsedObject;
    },
    'innerReverseTextTagWRadius': (customization) => {
      let parsedObject = {};

      const fontColor: string = customization['font:color'];
      if (fontColor != undefined) {
        parsedObject['backgroundColor'] = fontColor;
      }

      const backgroundColor: string = customization['background:color'];
      if (backgroundColor != undefined) {
        parsedObject['color'] = backgroundColor;
      }
      
      parsedObject = Object.assign(parsedObject,this.elementService.specialParse(['border'],customization));
      parsedObject['borderRadius'] = `${Number(parsedObject['borderRadius'].split("px")[0]) * 0.5}px`;
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
    private alert: AlertOverlayService,
  ) {}

  initializeElement(uid: string): void {
    this.elementService.initializeElement(uid);
  }

  registerWithElementService(): void {
    let typeInfo;
    const getTypeInfo = () => {
      typeInfo = {
        typeName: 'multilink',
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

  openLinks(uid: string): void {
    if (this.elementService.mode === 'customize') {return};

    const content = this.elementService.elements[uid].parsedCustomization.content;

    let links: Array<string>
    const getLinks = () => {
      const urlRegExp = RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
      const linkRegExp: RegExp = RegExp('link');
      links = Object.keys(content).filter(name => (linkRegExp.test(name) && content[name] != '')).map(name => content[name]).filter(link => urlRegExp.test(link));
    }

    const openLinks = () => {
      const newWindows = {};
      let linkNumber: number = 0;
      links.forEach(link => {
        setTimeout(function(href) {
          return function() {
            newWindows[link] = window.open(href);
          }
        }(link),150+(linkNumber*500));
        linkNumber++;
      })
      setTimeout(() => {
        links.some(link => {
          const newWin = newWindows[link];
          if (!newWin || newWin.closed || typeof newWin.closed=='undefined') {
            this.alert.newAlert({message:`One or more windows could not be opened from your multilink. Disabling your pop up blocker for this site will allow full mutlilink functionality.`});
            return true;
          }
        })
      },(2000 + (linkNumber * 500)));
    }

    getLinks();
    openLinks();
  }

  openLink(uid: string, linkTag) {
    const urlRegExp = RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
      
    const linkTarget = this.elementService.elements[uid].parsedCustomization.content[`link${linkTag}`];
    const valid: boolean = urlRegExp.test(linkTarget);
    if (valid) {
      window.open(linkTarget);
    }
  }

  postText(uid: string, text: string): void {
    this.elementService.fastUpdate(uid,'content:title',text);
    this.elementService.saveElements();
  }
}
