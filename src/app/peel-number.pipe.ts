import { Pipe, PipeTransform } from '@angular/core';

const peelNumberRegex: RegExp = /\w+(\d+)/;

@Pipe({
  name: 'peelNumber'
})
export class PeelNumberPipe implements PipeTransform {

  transform(s: string): string {
    const match = s.match(peelNumberRegex);
    const number: number = Number(match[1])+1;
    return String(number);
  }

}
