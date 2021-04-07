import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { GameService } from '@app/services/game/game.service';
import { SocketService } from '@app/services/socket/socket.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-drawing-suggestions',
  templateUrl: './drawing-suggestions.component.html',
  styleUrls: ['./drawing-suggestions.component.scss']
})
export class DrawingSuggestionsComponent implements OnInit {
  private baseUrl = environment.api_url;
  private wordSelectionUrl = this.baseUrl + '/api/games/word/selection';
  
  constructor(public gameService: GameService, public socketService: SocketService, private http: HttpClient) { }

  ngOnInit(): void {
  }

  refreshWords(): void {
    this.socketService.emit('drawingSuggestions', {'gameId': this.gameService.gameId});
  }

  setWord(word: string): void {
    this.gameService.suggestionDialogRef.close();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'authorization': localStorage.getItem('token')!});
    const options = { headers: headers};
    this.http.post<any>(this.wordSelectionUrl, {"drawingName": word, 'gameId': this.gameService.gameId}, options)
    .subscribe((data: any) => {
    });
  }

}
