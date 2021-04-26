import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'firstUpperCase'
})
export class FirstUpperCasePipe implements PipeTransform {

  transform(s?: string): string {
    if (s === undefined) {
      return "(none)";
    } else {
      const sArray: Array<any> = s.split("");
      for (var i = 0; i<sArray.length; i++) {
        if (i > 0) {
          //console.log(`${sArray[i]} is ${(!isNaN(sArray[i])) ? '' : 'not '}a number.`);
          if (sArray[i] === sArray[i].toUpperCase() && isNaN(sArray[i])) {
            sArray.splice(i,0," ");
            i++;
          }
        } else {
          sArray[i] = sArray[i].toUpperCase();
        }
      }
      return sArray.join("");
    }
  }

}
