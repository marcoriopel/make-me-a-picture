import { GameType } from '@app/ressources/variables/game-variables';
import { Personnality } from '@app/ressources/variables/virtual-player-variables';
import { vPlayerText } from '@app/ressources/variables/vplayer-messages';
import { injectable } from 'inversify';
import { VirtualPlayer } from './virtual-player';

@injectable()
export class VirtualPlayerAnxious extends VirtualPlayer {
    
    constructor(gameId: string) {
        super(gameId);
        this.personnality = Personnality.ANXIOUS;
        this.username = "Ginette";
        this.avatar = 7;
    }

    sayHello(){
        if(this.lastMutualGames[0]){
            this.sayHelloAgain();
        }
        else{
            let str = vPlayerText.anxious.meet.split("##");
            let message = str[0] + this.teammates + str[1];
            const timestamp = new Date().getTime();
            this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timestamp": timestamp, "textColor": "#000000", chatId: this.gameId });
        }
    }

    private sayHelloAgain(){
        const lastMutualGame = this.lastMutualGames[0];
        switch(lastMutualGame.gameType){
            case GameType.SOLO:
                this.sayHelloAgainSolo();
                break;
            case GameType.COOP:
                this.sayHelloAgainCoop();
                break;
            case GameType.CLASSIC:
                this.sayHelloAgainClassic();
                break;
        }
    }

    private sayHelloAgainSolo(){
        const lastMutualGame = this.lastMutualGames[0];
        let str = vPlayerText.anxious.meetAgainSolo.split("##");
        let message = str[0] + this.teammates + str[1] + this.getDate(lastMutualGame.start) + str[2] + lastMutualGame.score + str[3];
        const timestamp = new Date().getTime();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timestamp": timestamp, "textColor": "#000000", chatId: this.gameId });
    }

    private sayHelloAgainCoop(){
        const lastMutualGame = this.lastMutualGames[0];
        let str = vPlayerText.anxious.meetAgainCoop.split("##");
        let friends = [];
        for(let player of lastMutualGame.players){
            if(player.username != this.username && player.username != this.teammates[0]){
                friends.push(player.username);
            }
        }
        let friendsStr = this.arrayToString(friends);
        let message = str[0] + this.teammates + str[1] + friendsStr + str[2] + this.getDate(lastMutualGame.start) + str[3] + lastMutualGame.score + str[4];
        const timestamp = new Date().getTime();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timestamp": timestamp, "textColor": "#000000", chatId: this.gameId });
    }

    private sayHelloAgainClassic(){
        const lastMutualGame = this.lastMutualGames[0];
        let teamNumber;
        let opposingTeamNumber;
        let message;
        let opposingTeamNames = [];
        for(let player of lastMutualGame.players){
            if(player.username == this.username){
                teamNumber = player.team;
                opposingTeamNumber = this.getOpposingTeamNumber(teamNumber);
            }
        }
        for(let player of lastMutualGame.players){
            if(player.team == opposingTeamNumber){
                opposingTeamNames.push(player.username);
            }
        }
        if(lastMutualGame.score[teamNumber] > lastMutualGame.score[opposingTeamNumber]){
            let str = vPlayerText.anxious.meetAgainClassicWin.split("##");
            message = str[0] + this.teammates + str[1];
        }
        else if(lastMutualGame.score[teamNumber] < lastMutualGame.score[opposingTeamNumber]){
            let str = vPlayerText.anxious.meetAgainClassicLose.split("##");
            message = str[0] + this.teammates + str[1] + this.arrayToString(opposingTeamNames) + str[2];
        }
        else{
            let str = vPlayerText.anxious.meetAgainClassicTie.split("##");
            message = str[0] + this.teammates + str[1] + this.arrayToString(opposingTeamNames) + str[2];
        }
        const timestamp = new Date().getTime();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timestamp": timestamp, "textColor": "#000000", chatId: this.gameId });
    }

    sayHelloMany(){
        for(let lastMutualGame of this.lastMutualGames){
            if(lastMutualGame){
                this.sayHelloAgainMany();
                return;
            }
        }
        let str = vPlayerText.anxious.meetMany.split("##");
        let teamStr = this.arrayToString(this.teammates);
        let message = str[0] + teamStr + str[1];
        const timestamp = new Date().getTime();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timestamp": timestamp, "textColor": "#000000", chatId: this.gameId });
    }

    sayHelloAgainMany(){
        let newPlayers: string[] = [];
        let oldPlayers: string[] = [];
        for(let i = 0; i < this.teammates.length; ++i){
            if(this.lastMutualGames[i]){
                oldPlayers.push(this.teammates[i]);
            }
            else{
                newPlayers.push(this.teammates[i]);
            }
        }

        const timestamp = new Date().getTime();
        if(newPlayers.length == 0){
            let message = vPlayerText.anxious.meetAgainAll;
            this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timestamp": timestamp, "textColor": "#000000", chatId: this.gameId });
        }
        else{
            let str = vPlayerText.anxious.meetAgainMany.split("##");
            let message = str[0] + this.arrayToString(newPlayers) + str[1] + this.arrayToString(oldPlayers) + str[2];
            this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timestamp": timestamp, "textColor": "#000000", chatId: this.gameId });
        }
    }

    sayRightGuess(){
        let message = vPlayerText.anxious.rightGuess;
        const timestamp = new Date().getTime();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timestamp": timestamp, "textColor": "#000000", chatId: this.gameId });
    }

    sayWrongGuess(){
        let message = vPlayerText.anxious.wrongGuess;
        const timestamp = new Date().getTime();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timestamp": timestamp, "textColor": "#000000", chatId: this.gameId });
    }

    sayWrongTry(){
        let message = vPlayerText.anxious.wrongTry;
        const timestamp = new Date().getTime();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timestamp": timestamp, "textColor": "#000000", chatId: this.gameId });
    }

    sayWeWon(){
        let str = vPlayerText.anxious.weWon.split("##");
        let message = str[0] + this.teammates + str[1];
        const timestamp = new Date().getTime();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timestamp": timestamp, "textColor": "#000000", chatId: this.gameId });
    }

    sayWeLost(){
        let message = vPlayerText.anxious.weLost;
        const timestamp = new Date().getTime();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timeStamp": timestamp, "textColor": "#000000", chatId: this.gameId });
    }

    sayWeTied(){
        let message = vPlayerText.anxious.weTied;
        const timestamp = new Date().getTime();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timestamp": timestamp, "textColor": "#000000", chatId: this.gameId });
    }

    sayEndSprintGame(){
        let message = vPlayerText.anxious.endSprintGame;
        const timestamp = new Date().getTime();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timestamp": timestamp, "textColor": "#000000", chatId: this.gameId });
    }
}