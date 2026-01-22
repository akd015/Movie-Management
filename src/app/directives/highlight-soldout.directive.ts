import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
  selector: '[appHighlightSoldout]',
  standalone: true
})
export class HighlightSoldoutDirective {
  @Input('appHighlightSoldout') soldOut = false;
  @Input() premium = false;

  @HostBinding('class.sold-out')
  get isSoldOutClass() {
    return this.soldOut;
  }

  @HostBinding('class.premium')
  get isPremiumClass() {
    return this.premium;
  }

  @HostBinding('attr.aria-disabled')
  get ariaDisabled() {
    return this.soldOut ? true : null;
  }
}
