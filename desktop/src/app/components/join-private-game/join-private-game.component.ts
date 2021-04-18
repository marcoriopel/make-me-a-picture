import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ACCESS } from '@app/classes/acces';
import { NewGame } from '@app/classes/game';
import { ChatService } from '@app/services/chat/chat.service';
import { GameService } from '@app/services/game/game.service';
import { LobbyService } from '@app/services/lobby/lobby.service';
import { SocketService } from '@app/services/socket/socket.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-join-private-game',
  templateUrl: './join-private-game.component.html',
  styleUrls: ['./join-private-game.component.scss']
})
export class JoinPrivateGameComponent implements OnInit {

  gameIdForm = this.formBuilder.group({
    id: '',
  })

  constructor(private formBuilder: FormBuilder, private lobbyService: LobbyService, private snackBar: MatSnackBar, private gameService: GameService, private http: HttpClient, private router: Router, private chatService: ChatService, private socketService: SocketService) { }
  private baseUrl = environment.api_url;
  private listGameUrl = this.baseUrl + "/api/games/list";
  
  ngOnInit(): void {
  }

  joinGame(): void {
    this.lobbyService.joinPrivateGame(this.gameIdForm.value.id).subscribe(
      res => {
        let lobbyId = res;
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'authorization': localStorage.getItem(ACCESS.TOKEN)!});
        const options = { headers: headers };
        this.http.get<any>(this.listGameUrl, options).subscribe(
          res => {
            res.lobbies.forEach((lobby: any) => {
              if(lobby.id == lobbyId){
                this.lobbyService.game = {
                  'id': lobby.id,
                  'name': lobby.gameName,
                  'type': lobby.gameType,
                  'difficulty': lobby.difficulty,
                  'player': [],
                  'team1': [],
                  'team2': []
                }
                let newGame: NewGame = {
                  gameType: lobby.gameType,
                  gameName: lobby.gameName,
                  difficulty: lobby.difficulty,
                }
                this.lobbyService.joinPublicGame(lobby.id, newGame).subscribe(
                  res => {
                    this.gameService.gameId = this.lobbyService.game.id;
                    this.router.navigate(['/lobby']);
                    this.socketService.emit('joinLobby', {lobbyId: this.lobbyService.game.id});
                    this.gameService.initialize(newGame.gameType);
            
                    this.socketService.bind('joinChatRoomCallback', async () => {
                      await this.chatService.refreshChatList();
                      this.chatService.setCurrentChat(this.lobbyService.game.id);
                      this.socketService.unbind('joinChatRoomCallback')
                    });
                    this.chatService.joinChat(this.lobbyService.game.id);
                  }
                );
              }
            });
            
          },
          err => {
            console.log(err.error);
          }
        )
      },
      err => {
        this.snackBar.open("Impossible de rejoindre la partie", "", {
          duration: 2000,
        });;
      }
    );
  }

}
