import { Component } from '@angular/core';
import { Feature, GENERALS_FEATURE } from '@app/ressources/texts/feature';

@Component({
    selector: 'app-general-detail',
    templateUrl: './general-detail.component.html',
    styleUrls: ['./general-detail.component.scss'],
})
export class GeneralDetailComponent {
    informations: Feature[] = GENERALS_FEATURE;
}
