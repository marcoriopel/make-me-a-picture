import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChatService } from '@app/services/chat/chat.service';
import { GameService } from '@app/services/game/game.service';
import { LobbyService } from '@app/services/lobby/lobby.service';
import { SearchGameService } from '@app/services/search-game/search-game.service';
import { SocketService } from '@app/services/socket/socket.service';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
    providers: [ ChatService, SearchGameService, LobbyService, SocketService ]
})
export class MainPageComponent {
    readonly title: string = 'PolyDessin';
    constructor(public dialog: MatDialog, public chatService: ChatService, public gameService: GameService) {
    }

}
