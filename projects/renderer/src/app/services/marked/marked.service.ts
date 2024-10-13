import { Injectable } from '@angular/core';
import { parse, parseInline } from 'marked';

@Injectable({
  providedIn: 'root'
})
export class MarkedService {

  constructor() { }
  parse(src: string) {
    return parse(src, { gfm: true, async: false });
  }
  parseInline(src: string) {
    return parseInline(src, { gfm: true, async: false });
  }
}
