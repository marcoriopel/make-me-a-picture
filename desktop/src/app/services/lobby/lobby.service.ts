import { Injectable } from '@angular/core';
import { NewGame, Game ,GameType } from '@app/classes/game';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ACCESS } from '@app/classes/acces';
import { SocketService } from '@app/services/socket/socket.service';
import { GameService } from '@app/services/game/game.service';
import { Router } from '@angular/router';
import { ChatService } from '../chat/chat.service';

@Injectable({
  providedIn: 'root'
})
export class LobbyService {
  
  // Attribute
  game: Game;
  virtalPlayer0: string | null = null;
  virtalPlayer1: string | null = null;
  team1Full: boolean = false;
  isTeam2Full: boolean = false;
  isLobbyFull: boolean = false;
  oldLobbyId: string = "";
  lobbyInviteId: string = "";

  // URL
  private baseUrl = environment.api_url;
  private createPrivateGameUrl = this.baseUrl + "/api/games/create/private";
  private createPublicGameUrl = this.baseUrl + "/api/games/create/public";
  private joinPublicGameUrl = this.baseUrl + "/api/games/join/public";
  private joinPrivateGameUrl = this.baseUrl + "/api/games/join/private";
  private addVirtualPlayerUrl = this.baseUrl + "/api/games/add/virtual/player";
  private deleteVirtualPlayerUrl = this.baseUrl + "/api/games/remove/virtual/player";
  private startGameUrl = this.baseUrl + "/api/games/start";
  private leaveUrl = this.baseUrl + "/api/games/leave";

  constructor(private http: HttpClient, private socketService: SocketService, private gameService: GameService, private router: Router, private chatService: ChatService) { }

  addVirtualPlayer(teamNumber: number): void {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'authorization': localStorage.getItem(ACCESS.TOKEN)!});
    const options = { headers: headers,  responseType: 'text' as 'json'};
    const body = { lobbyId: this.game.id, teamNumber: teamNumber, username: teamNumber ? this.virtalPlayer1: this.virtalPlayer0}
    this.http.post<any>(this.addVirtualPlayerUrl, body, options).subscribe()
  }

  removeVirtualPlayer(teamNumber: number): void {
    const username = teamNumber ? this.virtalPlayer1: this.virtalPlayer0
    if(!username) return;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'authorization': localStorage.getItem(ACCESS.TOKEN)!
    });
    let params = new HttpParams();
    params = params.append('lobbyId', this.game.id);
    params = params.append('teamNumber', teamNumber.toString());
    params = params.append('username', username);
    const options = { params: params, headers: headers,  responseType: 'text' as 'json'};
    this.http.delete(this.deleteVirtualPlayerUrl, options).subscribe();
  }

  start(): void {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'authorization': localStorage.getItem(ACCESS.TOKEN)!});
    const options = { headers: headers,  responseType: 'text' as 'json'};
    const body = {
      lobbyId: this.game.id,
    }
    this.http.post<any>(this.startGameUrl, body, options).subscribe();
    this.gameService.gameId = this.game.id;
  }

  quit(): void {
    this.socketService.unbind('dispatchTeams');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'authorization': localStorage.getItem(ACCESS.TOKEN)!
    });
    let params = new HttpParams();
    params = params.append('lobbyId', this.game.id);
    const options = { params: params, headers: headers,  responseType: 'text' as 'json'};
    this.http.delete(this.leaveUrl, options).subscribe(() => {
      this.router.navigate(['/home']);
    });
    this.chatService.leaveChat(this.gameService.gameId);
  }

  createPublicGame(game: NewGame) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'authorization': localStorage.getItem(ACCESS.TOKEN)!});
    const options = { headers: headers };
    return this.http.post<any>(this.createPublicGameUrl, game, options);
  }

  createPrivateGame(game: NewGame) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'authorization': localStorage.getItem(ACCESS.TOKEN)!});
    const options = { headers: headers };
    return this.http.post<any>(this.createPrivateGameUrl, game, options);
  }

  joinPublicGame(id: string, game: NewGame) {
    this.game = {
      id: id,
      name: game.gameName,
      type: game.gameType,
      difficulty: game.difficulty,
      player: [],
      team1: [],
      team2: []
    }
    this.listen(this.game);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'authorization': localStorage.getItem(ACCESS.TOKEN)!});
    const options = { headers: headers, responseType: 'text' as 'json'};
    return this.http.post<any>(this.joinPublicGameUrl, {lobbyId: id, socketId: this.socketService.socketId}, options);
  }

  joinPrivateGame(id: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'authorization': localStorage.getItem(ACCESS.TOKEN)!});
    const options = { headers: headers, responseType: 'text' as 'json'};
    return this.http.post<any>(this.joinPrivateGameUrl, {lobbyInviteId: id, socketId: this.socketService.socketId}, options);
  }

  listen(game: Game) {
      this.socketService.emit('listenLobby', {oldLobbyId: this.oldLobbyId, lobbyId: game.id});
      this.oldLobbyId = game.id;
      this.socketService.bind('dispatchTeams', (res: any) => {
        this.clearPlayers();
        if(game.type == GameType.Classic){
          res.players.forEach((user: { username: string; avatar: number; team: number}) => {
            game.player.push({username: user.username, avatar: user.avatar });
            if (user.team == 0) {
              game.team1.push({username: user.username, avatar: user.avatar });
              if (user.avatar > 5)
                this.virtalPlayer0 = user.username;
            } else { 
              game.team2.push({username: user.username, avatar: user.avatar });
              if (user.avatar > 5)
                this.virtalPlayer1 = user.username;
            }
          });          
        } else {
          res.players.forEach((user: { username: string; avatar: number}) => {
            game.player.push({username: user.username, avatar: user.avatar });
          });
        }
      this.isFull();
    });
  }

  private clearPlayers(): void {
    this.game.player = [];
    this.game.team1 = [];
    this.game.team2 = [];
    this.virtalPlayer0 = null;
    this.virtalPlayer1 = null;
  }

  private isFull(): void {
    if (this.game.type == GameType.Classic) {
      this.team1Full = (this.game.team1.length < 2) ? false: true;
      this.isTeam2Full = (this.game.team2.length < 2) ? false: true;
      this.isLobbyFull = this.team1Full && this.isTeam2Full;
    } else if (this.game.type == GameType.SprintCoop) {
      this.game.player.length > 1 ? this.isLobbyFull = true : this.isLobbyFull = false;
    } else {
      this.game.player.length == 1 ? this.isLobbyFull = true : this.isLobbyFull = false;
    }
  }
}
