import { Injectable } from '@angular/core';
import { NewGame, Game ,GameType } from '@app/classes/game';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ACCESS } from '@app/classes/acces';
import { SocketService } from '@app/services/socket/socket.service';
import { GameService } from '@app/services/game/game.service';

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

  // URL
  private baseUrl = environment.api_url;
  private createGameUrl = this.baseUrl + "/api/games/create";
  private joinUrl = this.baseUrl + "/api/games/join";
  private addVirtualPlayerUrl = this.baseUrl + "/api/games/add/virtual/player";
  private deleteVirtualPlayerUrl = this.baseUrl + "/api/games/remove/virtual/player";
  private startGameUrl = this.baseUrl + "/api/games/start";

  constructor(private http: HttpClient, private socketService: SocketService, private gameService: GameService) {
    this.gameService.initialize();
  }

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
    throw new Error('Method not implemented.');

    // Unbind event from socket
    this.socketService.unbind('dispatchTeams');

    // TODO: Http request to quit the lobby

    // TODO: Add Router Link to last page
  }

  create(game: NewGame) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'authorization': localStorage.getItem(ACCESS.TOKEN)!});
    const options = { headers: headers };
    return this.http.post<any>(this.createGameUrl, game, options);
  }

  join(id: string, game: NewGame) {
    this.game = {
      id: id,
      name: game.gameName,
      type: game.gameType,
      difficulty: game.difficulty,
      player: [],
      team1: [],
      team2: []
    }
    this.listen();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'authorization': localStorage.getItem(ACCESS.TOKEN)!});
    const options = { headers: headers, responseType: 'text' as 'json'};
    return this.http.post<any>(this.joinUrl, {lobbyId: id}, options);
  }

  private listen() {
      this.socketService.emit('listenLobby', {oldLobbyId: '', lobbyId: this.game.id});
      this.socketService.bind('dispatchTeams', (res: any) => {
        this.clearPlayers();
        res.players.forEach((user: { username: string; avatar: number; team: number}) => {
          this.game.player.push(user.username);
          if (user.team == 0) {
            this.game.team1.push(user.username);
            if (user.avatar > 5)
              this.virtalPlayer0 = user.username;
          } else { 
            this.game.team2.push(user.username);
            if (user.avatar > 5)
              this.virtalPlayer1 = user.username;
          }
        });
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
    } else {
      this.team1Full = (this.game.team1.length < 4) ? false: true;
      this.isLobbyFull = this.team1Full;
    }
  }
}
