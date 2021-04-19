import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChatService } from '@app/services/chat/chat.service';
import { GameService } from '@app/services/game/game.service';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly title: string = 'PolyDessin';
    constructor(public dialog: MatDialog, public chatService: ChatService, public gameService: GameService) {
    }

}
