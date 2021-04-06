import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Game } from '@app/classes/game';
import { GameService } from '@app/services/game/game.service';
import { LobbyService } from '@app/services/lobby/lobby.service';

@Component({
  selector: 'app-join-private-game',
  templateUrl: './join-private-game.component.html',
  styleUrls: ['./join-private-game.component.scss']
})
export class JoinPrivateGameComponent implements OnInit {

  gameIdForm = this.formBuilder.group({
    id: '',
  })

  constructor(private formBuilder: FormBuilder, private lobbyService: LobbyService, private snackBar: MatSnackBar, private gameService: GameService) { }

  ngOnInit(): void {
  }

  joinGame(): void {
    console.log(this.gameIdForm.value.id)
    this.lobbyService.joinPrivateGame(this.gameIdForm.value.id).subscribe(
      res => {
        // I need full game info here
        this.lobbyService.oldLobbyId = "";
        this.lobbyService.game.id = res.lobbyId;
        this.gameService.gameId = res.lobbyId;
        this.lobbyService.listen();
        console.log(res)
      },
      err => {
        this.snackBar.open("Impossible de rejoindre la partie", "", {
          duration: 2000,
        });;
      }
    );
  }

}
