import { GameType } from '@app/ressources/variables/game-variables';
import { Personnality } from '@app/ressources/variables/virtual-player-variables';
import { vPlayerText } from '@app/ressources/variables/vplayer-messages';
import { injectable } from 'inversify';
import { VirtualPlayer } from './virtual-player';

@injectable()
export class VirtualPlayerCompetitive extends VirtualPlayer {
    
    constructor(gameId: string, gameType: number) {
        super(gameId, gameType);
        this.personnality = Personnality.COMPETITIVE;
        this.username = "Émilio";
        this.avatar = 9;
    }

    sayHello(){
        if(this.lastMutualGames[0]){
            this.sayHelloAgain();
        }
        let str = vPlayerText.competitive.meet.split("##");
        let message = str[0] + this.teammates + str[1];
        const timestamp = new Date().getTime();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timestamp": timestamp, "textColor": "#000000", chatId: this.gameId });
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

        const timestamp = new Date().getTime();
        let message: string;
        if(lastMutualGame.gameType == this.gameType){
            let str = vPlayerText.competitive.meetAgainSoloInSolo.split("##");
            message = str[0] + this.teammates + str[1] + lastMutualGame.score + str[2];
        }
        else{
            let str = vPlayerText.competitive.meetAgainSolo.split("##");
            message = str[0] + this.teammates + str[1];
        }
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timestamp": timestamp, "textColor": "#000000", chatId: this.gameId });
    }

    private sayHelloAgainCoop(){
        const lastMutualGame = this.lastMutualGames[0];
        const timestamp = new Date().getTime();
        let str = vPlayerText.competitive.meetAgainCoop.split("##");
        let message = str[0] + this.teammates + str[1] + this.getDate(lastMutualGame.start) + str[2];
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timestamp": timestamp, "textColor": "#000000", chatId: this.gameId });
    }

    private sayHelloAgainClassic(){
        const lastMutualGame = this.lastMutualGames[0];
        let teammateTeam;
        let vPlayerTeam;
        for(let player of lastMutualGame.players){
            if(player.username == this.username){
                vPlayerTeam = player.team;
            }
            if(player.username == this.teammates[0]){
                teammateTeam = player.team;
            }
        }

        if(teammateTeam == vPlayerTeam){
            this.sayHelloAgainClassicSameTeam(vPlayerTeam);
        }
        else{
            this.sayHelloAgainClassicOpposingTeam(vPlayerTeam);
        }
    }

    private sayHelloAgainClassicSameTeam(teamNumber: number){
        const lastMutualGame = this.lastMutualGames[0];
        let opposingTeamNumber = this.getOpposingTeamNumber(teamNumber);
        let message;
        let opposingTeamNames = [];
        for(let player of lastMutualGame.players){
            if(player.team == opposingTeamNumber){
                opposingTeamNames.push(player.username);
            }
        }
        if(lastMutualGame.score[teamNumber] > lastMutualGame.score[opposingTeamNumber]){
            let str = vPlayerText.competitive.meetAgainClassicWin.split("##");
            message = str[0] + this.teammates + str[1];
        }
        else if(lastMutualGame.score[teamNumber] < lastMutualGame.score[opposingTeamNumber]){
            let str = vPlayerText.competitive.meetAgainClassicLose.split("##");
            message = str[0] + this.getDate(lastMutualGame.start) + str[1] + this.arrayToString(opposingTeamNames) + str[2] + lastMutualGame.score[opposingTeamNumber] + str[3] + lastMutualGame.score[teamNumber] + str[4];
        }
        else{
            message = vPlayerText.competitive.meetAgainClassicTie;
        }
        const timestamp = new Date().getTime();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timestamp": timestamp, "textColor": "#000000", chatId: this.gameId });
    }

    private sayHelloAgainClassicOpposingTeam(teamNumber: number){
        let str = vPlayerText.anxious.meetAgainClassicOpposingTeam.split("##");
        let message = str[0] + this.teammates + str[1];
        switch(this.gameType){
            case GameType.SOLO:
                message += "ton meilleur score solo de " + this.teammatesStats[0].bestSoloScore + ".";
                break;
            case GameType.CLASSIC:
                const lastMutualGame = this.lastMutualGames[0];
                let opposingTeamNumber = this.getOpposingTeamNumber(teamNumber);
                let opposingTeamNames = [];
                for(let player of lastMutualGame.players){
                    if(player.team == opposingTeamNumber){
                        opposingTeamNames.push(player.username);
                    }
                }
                message += this.arrayToString(opposingTeamNames) + ".";;
                break;
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
        let str = vPlayerText.competitive.meetMany.split("##");
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
            let bestCoopScoreIndex = 0;
            for(let i = 0; i < this.teammates.length; ++i){
                if(this.teammatesStats[i].bestCoopScore >= this.teammatesStats[bestCoopScoreIndex].bestCoopScore){
                    bestCoopScoreIndex = i;
                }
            }
            let str = vPlayerText.competitive.meetAgainAll.split("##");
            let message = str[0] + this.teammates[bestCoopScoreIndex] + str[1] + this.teammatesStats[bestCoopScoreIndex].bestCoopScore + str[2];
            this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timestamp": timestamp, "textColor": "#000000", chatId: this.gameId });
        }
        else{
            let str = vPlayerText.competitive.meetAgainMany.split("##");
            let message = str[0] + this.arrayToString(oldPlayers) + str[1] + this.arrayToString(newPlayers) + str[2];
            this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timestamp": timestamp, "textColor": "#000000", chatId: this.gameId });
        }
    }

    sayRightGuess(){
        let message = vPlayerText.competitive.rightGuess;
        const timestamp = new Date().getTime();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timestamp": timestamp, "textColor": "#000000", chatId: this.gameId });
    }

    sayWrongGuess(){
        let str = vPlayerText.competitive.wrongGuess.split("##");
        let message = str[0] + this.teammates + str[1];
        const timestamp = new Date().getTime();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timestamp": timestamp, "textColor": "#000000", chatId: this.gameId });
    }

    sayWrongTry(){
        let message = vPlayerText.competitive.wrongTry;
        const timestamp = new Date().getTime();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timestamp": timestamp, "textColor": "#000000", chatId: this.gameId });
    }

    sayWeWon(){
        let str = vPlayerText.competitive.weWon.split("##");
        let message = str[0] + this.teammates + str[1];
        const timestamp = new Date().getTime();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timestamp": timestamp, "textColor": "#000000", chatId: this.gameId });
    }

    sayWeLost(){
        let message = vPlayerText.competitive.weLost;
        const timestamp = new Date().getTime();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timestamp": timestamp, "textColor": "#000000", chatId: this.gameId });
    }

    sayWeTied(){
        let message = vPlayerText.competitive.weTied;
        const timestamp = new Date().getTime();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timestamp": timestamp, "textColor": "#000000", chatId: this.gameId });
    }

    sayEndSprintGame(){
        let message = vPlayerText.competitive.endSprintGame;
        const timestamp = new Date().getTime();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timestamp": timestamp, "textColor": "#000000", chatId: this.gameId });
    }

    sayEndSoloGame(finalScore: number){
        const teammateStats = this.teammatesStats[0];

        if(teammateStats.bestSoloScore <= finalScore){
            let message = vPlayerText.competitive.endSoloGame;
            const timestamp = new Date().getTime();
            this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timestamp": timestamp, "textColor": "#000000", chatId: this.gameId });
        }
        else{
            let str = vPlayerText.competitive.endSoloGameBestScore.split("##");
            let message = str[0] + teammateStats.bestSoloScore + str[1] + finalScore + str[2];
            const timestamp = new Date().getTime();
            this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timestamp": timestamp, "textColor": "#000000", chatId: this.gameId });
        }
    }

    

}