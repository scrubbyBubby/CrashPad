import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {
  constructor() { }

  alphaCompare(s1: string, s2: string): boolean {
    let result: boolean = true;
    if (s1 === s2) {return result};

    const alphanumer = "01234567890abcdefghijklmnopqrstuvwxyz";
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    const chars1: Array<string> = s1.split("");
    const chars2: Array<string> = s2.split("");
    chars1.some((char1, index) => {
      const char2: string = chars2[index];
      if (char2 === undefined) {
        result = false
        return true;
      }

      const firstLocation: number = alphanumer.indexOf(char1);
      const secondLocation: number = alphanumer.indexOf(char2);

      if (firstLocation < secondLocation) {
        result = true;
        return true;
      } else if (firstLocation > secondLocation) {
        result = false;
        return true;
      }
    })

    return result;
  }
  
  sPush(array: Array<any>, value: any, pushTo: boolean = true) {
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
    return array;
  }
  
  pushAlphabetical(array: Array<string>,s: string): Array<string> {
    for (var a = 0; a<array.length; a++) {
      if (this.alphaCompare(s,array[a])) {
        array.splice(a,0,s);
        return array;
      }
    }
    array.push(s);
    return array;
  }
  
  pushAlphaAndLocate(array: Array<string>,s: string,duplicates: boolean = false) {
    let retObj = {
      array: array,
      location: -1,
    }
    const isDuplicate: boolean = (!duplicates && array.indexOf(s) != -1) ? true : false;
    //if (isDuplicate) {return retObj;}

    if (array.length === 0) {
      //console.log(`Pushed to 0 because array was empty...`);
      retObj.array.push(s);
      retObj.location = 0;
      return retObj;
    }

    for (var a = 0; a<array.length; a++) {
      //console.log(`Comparing words ${s} to ${array[a]}`);
      if (this.alphaCompare(s,array[a])) {
        retObj.array.splice(a,0,s);
        retObj.location = a;
        return retObj;
      }
    }

    retObj.array.push(s);
    retObj.location = array.length-1;
    return retObj;
  }
}
