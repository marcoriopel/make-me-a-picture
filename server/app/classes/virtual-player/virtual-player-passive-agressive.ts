import { GameType } from '@app/ressources/variables/game-variables';
import { Personnality } from '@app/ressources/variables/virtual-player-variables';
import { vPlayerText } from '@app/ressources/variables/vplayer-messages';
import { injectable } from 'inversify';
import { VirtualPlayer } from './virtual-player';

@injectable()
export class VirtualPlayerPassiveAgressive extends VirtualPlayer {

    constructor(gameId: string, gameType: number) {
        super(gameId, gameType);
        this.personnality = Personnality.PASSIVE_AGRESSIVE
        this.username = "Robert";
        this.avatar = 8;
    }

    sayHello() {
        if (this.lastMutualGames[0]) {
            this.sayHelloAgain();
        }
        else {
            let str = vPlayerText.passiveAgressive.meet.split("##");
            let message = str[0] + this.teammates + str[1];
            const timestamp = new Date();
            this.socketService.getSocket().to(this.gameId).emit('message', { "user": this.getBasicUser(), "text": message, "timestamp": timestamp.getTime(), "textColor": "#000000", chatId: this.gameId });
            const incomingMessage = {
                token: "0",
                text: message,
                chatId: this.gameId
            }
            this.chatManagerService.addMessageToDB(this.getBasicUser(), incomingMessage, timestamp);
        }
    }

    private sayHelloAgain() {
        const lastMutualGame = this.lastMutualGames[0];
        switch (lastMutualGame.gameType) {
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

    private sayHelloAgainSolo() {
        let str = vPlayerText.passiveAgressive.meetAgainSolo.split("##");
        let message = str[0] + this.teammates + str[1];
        const timestamp = new Date();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": this.getBasicUser(), "text": message, "timestamp": timestamp.getTime(), "textColor": "#000000", chatId: this.gameId });
        const incomingMessage = {
            token: "0",
            text: message,
            chatId: this.gameId
        }
        this.chatManagerService.addMessageToDB(this.getBasicUser(), incomingMessage, timestamp);
    }

    private sayHelloAgainCoop() {
        const lastMutualGame = this.lastMutualGames[0];
        let str = vPlayerText.passiveAgressive.meetAgainCoop.split("##");
        let friends = [];
        for (let player of lastMutualGame.players) {
            if (player.username != this.username && player.username != this.teammates[0]) {
                friends.push(player.username);
            }
        }
        let friendsStr = this.arrayToString(friends);
        let message = str[0] + this.teammates + str[1] + friendsStr + str[2] + lastMutualGame.score[0] + str[3];
        const timestamp = new Date();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": this.getBasicUser(), "text": message, "timestamp": timestamp.getTime(), "textColor": "#000000", chatId: this.gameId });
        const incomingMessage = {
            token: "0",
            text: message,
            chatId: this.gameId
        }
        this.chatManagerService.addMessageToDB(this.getBasicUser(), incomingMessage, timestamp);

    }

    private sayHelloAgainClassic() {
        const lastMutualGame = this.lastMutualGames[0];
        let teammateTeam;
        let vPlayerTeam;
        for (let player of lastMutualGame.players) {
            if (player.username == this.username) {
                vPlayerTeam = player.team;
            }
            if (player.username == this.teammates[0]) {
                teammateTeam = player.team;
            }
        }

        if (teammateTeam == vPlayerTeam) {
            this.sayHelloAgainClassicSameTeam(vPlayerTeam);
        }
        else {
            this.sayHelloAgainClassicOpposingTeam(vPlayerTeam);
        }
    }

    private sayHelloAgainClassicSameTeam(teamNumber: number) {
        const lastMutualGame = this.lastMutualGames[0];
        let opposingTeamNumber = this.getOpposingTeamNumber(teamNumber);
        let str = vPlayerText.passiveAgressive.meetAgainClassicSameTeam.split("##");
        let message = str[0] + lastMutualGame.score[teamNumber] + str[1] + lastMutualGame.score[opposingTeamNumber];
        const timestamp = new Date();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": this.getBasicUser(), "text": message, "timestamp": timestamp.getTime(), "textColor": "#000000", chatId: this.gameId });
        const incomingMessage = {
            token: "0",
            text: message,
            chatId: this.gameId
        }
        this.chatManagerService.addMessageToDB(this.getBasicUser(), incomingMessage, timestamp);

    }

    private sayHelloAgainClassicOpposingTeam(teamNumber: number) {
        const lastMutualGame = this.lastMutualGames[0];
        let opposingTeamNumber = this.getOpposingTeamNumber(teamNumber);
        let message;
        let oldTeammate: string;
        for (let player of lastMutualGame.players) {
            if (player.team == teamNumber && player.username != this.username) {
                oldTeammate = player.username;
            }
        }
        if (lastMutualGame.score[teamNumber] < lastMutualGame.score[opposingTeamNumber]) {
            let str = vPlayerText.passiveAgressive.meetAgainClassicOpposingTeamWin.split("##");
            message = str[0] + this.teammates + str[1] + this.getDate(lastMutualGame.start) + str[2] + oldTeammate + str[3];
        }
        else if (lastMutualGame.score[teamNumber] > lastMutualGame.score[opposingTeamNumber]) {
            let str = vPlayerText.passiveAgressive.meetAgainClassicOpposingTeamLose.split("##");
            message = str[0] + this.teammates + str[1] + this.getDate(lastMutualGame.start) + str[2];
        }
        else {
            let str = vPlayerText.passiveAgressive.meetAgainClassicOpposingTeamTie.split("##");
            message = str[0] + this.teammates + str[1] + lastMutualGame.score[0] + str[2] + lastMutualGame.score[1] + str[3];
        }
        const timestamp = new Date();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": this.getBasicUser(), "text": message, "timestamp": timestamp.getTime(), "textColor": "#000000", chatId: this.gameId });
        const incomingMessage = {
            token: "0",
            text: message,
            chatId: this.gameId
        }
        this.chatManagerService.addMessageToDB(this.getBasicUser(), incomingMessage, timestamp);

    }

    sayHelloMany() {
        for (let lastMutualGame of this.lastMutualGames) {
            if (lastMutualGame) {
                this.sayHelloAgainMany();
                return;
            }
        }
        let str = vPlayerText.passiveAgressive.meetMany.split("##");
        let teamStr = this.arrayToString(this.teammates);
        let message = str[0] + teamStr + str[1];
        const timestamp = new Date();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": this.getBasicUser(), "text": message, "timestamp": timestamp.getTime(), "textColor": "#000000", chatId: this.gameId });
        const incomingMessage = {
            token: "0",
            text: message,
            chatId: this.gameId
        }
        this.chatManagerService.addMessageToDB(this.getBasicUser(), incomingMessage, timestamp);

    }

    sayHelloAgainMany() {
        let newPlayers: string[] = [];
        let oldPlayers: string[] = [];
        for (let i = 0; i < this.teammates.length; ++i) {
            if (this.lastMutualGames[i]) {
                oldPlayers.push(this.teammates[i]);
            }
            else {
                newPlayers.push(this.teammates[i]);
            }
        }

        const timestamp = new Date();
        if (newPlayers.length == 0) {
            let str = vPlayerText.passiveAgressive.meetAgainAll.split("##");
            let message = str[0] + this.arrayToString(this.teammates) + str[1];
            this.socketService.getSocket().to(this.gameId).emit('message', { "user": this.getBasicUser(), "text": message, "timestamp": timestamp.getTime(), "textColor": "#000000", chatId: this.gameId });
            const incomingMessage = {
                token: "0",
                text: message,
                chatId: this.gameId
            }
            this.chatManagerService.addMessageToDB(this.getBasicUser(), incomingMessage, timestamp);

        }
        else {
            let str = vPlayerText.passiveAgressive.meetAgainMany.split("##");
            let message = str[0] + this.arrayToString(newPlayers) + str[1] + (newPlayers.length > 1 ? "votre" : "ta") + str[2] + this.arrayToString(oldPlayers) + (oldPlayers.length > 1 ? "leur" : "sa") + str[3];
            this.socketService.getSocket().to(this.gameId).emit('message', { "user": this.getBasicUser(), "text": message, "timestamp": timestamp.getTime(), "textColor": "#000000", chatId: this.gameId });
            const incomingMessage = {
                token: "0",
                text: message,
                chatId: this.gameId
            }
            this.chatManagerService.addMessageToDB(this.getBasicUser(), incomingMessage, timestamp);

        }
    }

    sayRightGuess() {
        let message = vPlayerText.passiveAgressive.rightGuess;
        const timestamp = new Date();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": this.getBasicUser(), "text": message, "timestamp": timestamp.getTime(), "textColor": "#000000", chatId: this.gameId });
        const incomingMessage = {
            token: "0",
            text: message,
            chatId: this.gameId
        }
        this.chatManagerService.addMessageToDB(this.getBasicUser(), incomingMessage, timestamp);

    }

    sayWrongGuess() {
        let str = vPlayerText.passiveAgressive.wrongGuess.split("##");
        let message = str[0] + this.teammates + str[1];
        const timestamp = new Date();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": this.getBasicUser(), "text": message, "timestamp": timestamp.getTime(), "textColor": "#000000", chatId: this.gameId });
        const incomingMessage = {
            token: "0",
            text: message,
            chatId: this.gameId
        }
        this.chatManagerService.addMessageToDB(this.getBasicUser(), incomingMessage, timestamp);

    }

    sayWrongTry() {
        let message = vPlayerText.passiveAgressive.wrongTry;
        const timestamp = new Date();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": this.getBasicUser(), "text": message, "timestamp": timestamp.getTime(), "textColor": "#000000", chatId: this.gameId });
        const incomingMessage = {
            token: "0",
            text: message,
            chatId: this.gameId
        }
        this.chatManagerService.addMessageToDB(this.getBasicUser(), incomingMessage, timestamp);

    }

    sayWeWon() {
        let str = vPlayerText.passiveAgressive.weWon.split("##");
        let message = str[0] + this.teammates + str[1];
        const timestamp = new Date();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": this.getBasicUser(), "text": message, "timestamp": timestamp.getTime(), "textColor": "#000000", chatId: this.gameId });
        const incomingMessage = {
            token: "0",
            text: message,
            chatId: this.gameId
        }
        this.chatManagerService.addMessageToDB(this.getBasicUser(), incomingMessage, timestamp);

    }

    sayWeLost() {
        let message = vPlayerText.passiveAgressive.weLost;
        const timestamp = new Date();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": this.getBasicUser(), "text": message, "timestamp": timestamp.getTime(), "textColor": "#000000", chatId: this.gameId });
        const incomingMessage = {
            token: "0",
            text: message,
            chatId: this.gameId
        }
        this.chatManagerService.addMessageToDB(this.getBasicUser(), incomingMessage, timestamp);

    }

    sayWeTied() {
        let message = vPlayerText.passiveAgressive.weTied;
        const timestamp = new Date();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": this.getBasicUser(), "text": message, "timestamp": timestamp.getTime(), "textColor": "#000000", chatId: this.gameId });
        const incomingMessage = {
            token: "0",
            text: message,
            chatId: this.gameId
        }
        this.chatManagerService.addMessageToDB(this.getBasicUser(), incomingMessage, timestamp);

    }

    sayEndSoloGame(finalScore: number) {
        const teammateStats = this.teammatesStats[0];

        if (finalScore <= teammateStats.bestSoloScore) {
            let str = vPlayerText.passiveAgressive.endSoloGameBestScore.split("##");
            let message = str[0] + finalScore + str[1] + teammateStats.bestSoloScore + str[2];
            const timestamp = new Date();
            this.socketService.getSocket().to(this.gameId).emit('message', { "user": this.getBasicUser(), "text": message, "timestamp": timestamp.getTime(), "textColor": "#000000", chatId: this.gameId });
            const incomingMessage = {
                token: "0",
                text: message,
                chatId: this.gameId
            }
            this.chatManagerService.addMessageToDB(this.getBasicUser(), incomingMessage, timestamp);

        }
        else {
            let str = vPlayerText.passiveAgressive.endSoloGameBestScore.split("##");
            let message = str[0] + teammateStats.bestSoloScore + str[1];
            const timestamp = new Date();
            this.socketService.getSocket().to(this.gameId).emit('message', { "user": this.getBasicUser(), "text": message, "timestamp": timestamp.getTime(), "textColor": "#000000", chatId: this.gameId });
            const incomingMessage = {
                token: "0",
                text: message,
                chatId: this.gameId
            }
            this.chatManagerService.addMessageToDB(this.getBasicUser(), incomingMessage, timestamp);

        }
    }

    sayEndCoopGame(finalScore: number) {
        let newHighScorePlayers: string[] = [];
        let oldHighScorePlayers: string[] = [];
        let worstCoopScoreIndex = 0;
        let bestCoopScoreIndex = 0;
        for (let i = 0; i < this.teammates.length; ++i) {
            if (finalScore <= this.teammatesStats[i].bestCoopScore) {
                oldHighScorePlayers.push(this.teammates[i]);
            }
            else {
                newHighScorePlayers.push(this.teammates[i]);
            }
            if (this.teammatesStats[i].bestCoopScore <= this.teammatesStats[worstCoopScoreIndex].bestCoopScore) {
                worstCoopScoreIndex = i;
            }
            if (this.teammatesStats[i].bestCoopScore >= this.teammatesStats[bestCoopScoreIndex].bestCoopScore) {
                bestCoopScoreIndex = i;
            }
        }

        const timestamp = new Date();
        if (newHighScorePlayers.length == 0) {
            let str = vPlayerText.passiveAgressive.endCoopGame.split("##");
            let message = str[0] + finalScore + str[1] + this.teammates[worstCoopScoreIndex] + str[2];
            this.socketService.getSocket().to(this.gameId).emit('message', { "user": this.getBasicUser(), "text": message, "timestamp": timestamp.getTime(), "textColor": "#000000", chatId: this.gameId });
            const incomingMessage = {
                token: "0",
                text: message,
                chatId: this.gameId
            }
            this.chatManagerService.addMessageToDB(this.getBasicUser(), incomingMessage, timestamp);

        }
        else if (oldHighScorePlayers.length == 0) {
            let str = vPlayerText.passiveAgressive.endCoopGameBestScoreAll.split("##");
            let message = str[0] + this.teammates[bestCoopScoreIndex] + str[2];
            this.socketService.getSocket().to(this.gameId).emit('message', { "user": this.getBasicUser(), "text": message, "timestamp": timestamp.getTime(), "textColor": "#000000", chatId: this.gameId });
            const incomingMessage = {
                token: "0",
                text: message,
                chatId: this.gameId
            }
            this.chatManagerService.addMessageToDB(this.getBasicUser(), incomingMessage, timestamp);

        }
        else {
            let str = vPlayerText.passiveAgressive.endCoopGameBestScoreSome.split("##");
            let message = str[0] + this.arrayToString(newHighScorePlayers) + str[1] + this.arrayToString(oldHighScorePlayers) + str[2];
            this.socketService.getSocket().to(this.gameId).emit('message', { "user": this.getBasicUser(), "text": message, "timestamp": timestamp.getTime(), "textColor": "#000000", chatId: this.gameId });
            const incomingMessage = {
                token: "0",
                text: message,
                chatId: this.gameId
            }
            this.chatManagerService.addMessageToDB(this.getBasicUser(), incomingMessage, timestamp);

        }
    }
}