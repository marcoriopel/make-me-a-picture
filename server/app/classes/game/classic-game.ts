import { Drawing } from '@app/ressources/interfaces/drawings.interface';
import { Player } from '@app/ressources/interfaces/user.interface';
import { GameType } from '@app/ressources/variables/game-variables';
import { injectable } from 'inversify';
import { VirtualPlayer } from '../virtual-player/virtual-player';
import { Game } from './game';

@injectable()
export class ClassicGame extends Game {
    private teams = [];
    private totalGameRounds: number = 4;
    private drawingTeamTurn;
    private drawingPlayerIndiceTurn: number[] = new Array(2);
    private guessingPlayerIndiceTurn: number[] = new Array(2);
    private score: number[] = new Array(2);
    private teamHasVirtual: boolean[] = [false, false];
    private gameDrawings: Drawing[] = new Array(this.totalGameRounds);
    private guessAttempts: number = 0;
    private round: number = 0;
    private gameDrawingsNames: string[] = new Array(this.totalGameRounds);

    constructor(difficulty: number, gameName: string, players: Player[]) {
        super(difficulty, gameName, players);
        this.teams.push([]);
        this.teams.push([]);
        this.gameType = GameType.CLASSIC;
        console.log("Created classic game with difficulty: " + this.difficulty + " and name: " + this.gameName);
    }

    startGame(): void {
        this.drawingTeamTurn = this.selectRandomBinary();
        this.checkIfVirtualInTeams();
        this.addPlayersToTeam();
        this.assignRandomDrawerInTeam(0);
        this.assignRandomDrawerInTeam(1);
    }

    guessDrawing(username: string, guess: string) {
        if (this.teams[this.drawingTeamTurn][this.guessingPlayerIndiceTurn[this.drawingTeamTurn]].username != username)
            return false;
        if (this.gameDrawingsNames[this.round] == guess) {
            this.score[this.drawingTeamTurn] += 1;
            this.round += 1;
            if (this.round <= this.totalGameRounds)
                return this.setupRound();
            else
                return this.endGame();
        }
        else {
            this.guessAttempts += 1;
            return false;
        }
    }

    private selectRandomBinary() {
        return Math.floor(Math.random() + 0.5);
    }

    private checkIfVirtualInTeams() {
        for (let player of this.players) {
            if (player.isVirtual)
                this.teamHasVirtual[player.team] = true;
        }
    }

    private addPlayersToTeam() {
        console.log("This is inside add players");
        console.log(this.players);
        for (let player of this.players) {
            this.teams[player.team].push(player);
        }
    }

    private assignRandomDrawerInTeam(team: number) {
        if (!this.teamHasVirtual[team]) {
            this.drawingPlayerIndiceTurn[team] = this.selectRandomBinary();
            this.guessingPlayerIndiceTurn[team] = this.selectOppositeBinary(this.drawingPlayerIndiceTurn[team]);
        }
        else {
            if (this.teams[team][0].isVirtual) {
                this.drawingPlayerIndiceTurn[team] = 0;
                this.guessingPlayerIndiceTurn[team] = 1;
            }
            else {
                this.drawingPlayerIndiceTurn[team] = 1;
                this.guessingPlayerIndiceTurn[team] = 0;
            }
        }
    }

    private setupRound() {
        this.guessAttempts = 0;
        this.drawingTeamTurn = this.selectOppositeBinary(this.drawingTeamTurn);
        this.changeDrawingPlayer();
    }

    private endGame() {

    }

    private selectOppositeBinary(binary: number) {
        if (binary)
            return 0;
        else
            return 1;
    }

    private changeDrawingPlayer() {
        if (!this.teamHasVirtual[this.drawingTeamTurn]) {
            this.drawingPlayerIndiceTurn[this.drawingTeamTurn] = this.selectOppositeBinary(this.drawingPlayerIndiceTurn[this.drawingTeamTurn]);
            this.guessingPlayerIndiceTurn[this.drawingTeamTurn] = this.selectOppositeBinary(this.guessingPlayerIndiceTurn[this.drawingTeamTurn]);
        }
    }

    chooseDrawingName(username: string, drawingName: string) {
        if (this.teams[this.drawingTeamTurn][this.drawingPlayerIndiceTurn[this.drawingTeamTurn]].username != username)
            throw new Error("User not authorized to select drawing name");
        this.gameDrawingsNames.push(drawingName);
    }

}