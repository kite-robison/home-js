import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toggle'
})
export class TogglePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return null;
  }

}
