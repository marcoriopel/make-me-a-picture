import { AfterViewInit, Component } from '@angular/core';

@Component({
    selector: 'app-userguide',
    templateUrl: './user-guide.component.html',
    styleUrls: ['./user-guide.component.scss'],
})
export class UserGuideComponent implements AfterViewInit {
    disableAnimation: boolean = true;

    ngAfterViewInit(): void {
        setTimeout(() => (this.disableAnimation = false));
    }
}
