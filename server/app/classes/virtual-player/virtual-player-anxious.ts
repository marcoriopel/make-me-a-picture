import { GameType } from '@app/ressources/variables/game-variables';
import { Personnality } from '@app/ressources/variables/virtual-player-variables';
import { vPlayerText } from '@app/ressources/variables/vplayer-messages';
import { injectable } from 'inversify';
import { VirtualPlayer } from './virtual-player';

@injectable()
export class VirtualPlayerAnxious extends VirtualPlayer {

    constructor(gameId: string, gameType: number) {
        super(gameId, gameType);
        this.personnality = Personnality.ANXIOUS;
        this.username = "Ginette";
        this.avatar = 7;
    }

    sayHello() {
        if (this.lastMutualGames[0]) {
            this.sayHelloAgain();
        }
        else {
            let str = vPlayerText.anxious.meet.split("##");
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
        const lastMutualGame = this.lastMutualGames[0];
        let str = vPlayerText.anxious.meetAgainSolo.split("##");
        let message = str[0] + this.teammates + str[1] + this.getDate(lastMutualGame.start) + str[2] + lastMutualGame.score[0] + str[3];
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
        let str = vPlayerText.anxious.meetAgainCoop.split("##");
        let friends = [];
        for (let player of lastMutualGame.players) {
            if (player.username != this.username && player.username != this.teammates[0]) {
                friends.push(player.username);
            }
        }
        let friendsStr = this.arrayToString(friends);
        let message = str[0] + this.teammates + str[1] + friendsStr + str[2] + this.getDate(lastMutualGame.start) + str[3] + lastMutualGame.score[0] + str[4];
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
        let message;
        let opposingTeamNames = [];
        for (let player of lastMutualGame.players) {
            if (player.team == opposingTeamNumber) {
                opposingTeamNames.push(player.username);
            }
        }
        if (lastMutualGame.score[teamNumber] > lastMutualGame.score[opposingTeamNumber]) {
            let str = vPlayerText.anxious.meetAgainClassicWin.split("##");
            message = str[0] + this.teammates + str[1];
        }
        else if (lastMutualGame.score[teamNumber] < lastMutualGame.score[opposingTeamNumber]) {
            let str = vPlayerText.anxious.meetAgainClassicLose.split("##");
            message = str[0] + this.teammates + str[1] + this.arrayToString(opposingTeamNames) + str[2];
        }
        else {
            let str = vPlayerText.anxious.meetAgainClassicTie.split("##");
            message = str[0] + this.teammates + str[1] + this.arrayToString(opposingTeamNames) + str[2];
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

    private sayHelloAgainClassicOpposingTeam(teamNumber: number) {
        let str = vPlayerText.anxious.meetAgainClassicOpposingTeam.split("##");
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

    sayHelloMany() {
        for (let lastMutualGame of this.lastMutualGames) {
            if (lastMutualGame) {
                this.sayHelloAgainMany();
                return;
            }
        }
        let str = vPlayerText.anxious.meetMany.split("##");
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
            let message = vPlayerText.anxious.meetAgainAll;
            this.socketService.getSocket().to(this.gameId).emit('message', { "user": this.getBasicUser(), "text": message, "timestamp": timestamp.getTime(), "textColor": "#000000", chatId: this.gameId });
            const incomingMessage = {
                token: "0",
                text: message,
                chatId: this.gameId
            }
            this.chatManagerService.addMessageToDB(this.getBasicUser(), incomingMessage, timestamp);

        }
        else {
            let str = vPlayerText.anxious.meetAgainMany.split("##");
            let message = str[0] + this.arrayToString(newPlayers) + str[1] + this.arrayToString(oldPlayers) + str[2];
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
        let message = vPlayerText.anxious.rightGuess;
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
        let message = vPlayerText.anxious.wrongGuess;
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
        let message = vPlayerText.anxious.wrongTry;
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
        let str = vPlayerText.anxious.weWon.split("##");
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
        const teammateStats = this.teammatesStats[0];

        let str = vPlayerText.anxious.weLost.split("##");
        let message = str[0] + teammateStats.classicWinRatio + str[1];
        const timestamp = new Date();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": this.getBasicUser(), "text": message, "timeStamp": timestamp.getTime(), "textColor": "#000000", chatId: this.gameId });
        const incomingMessage = {
            token: "0",
            text: message,
            chatId: this.gameId
        }
        this.chatManagerService.addMessageToDB(this.getBasicUser(), incomingMessage, timestamp);

    }

    sayWeTied() {
        const teammateStats = this.teammatesStats[0];

        let str = vPlayerText.anxious.weTied.split("##");
        let message = str[0] + (teammateStats.gamesPlayed + 1) + str[1];
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
            let str = vPlayerText.anxious.endSoloGame.split("##");
            let message = str[0] + teammateStats.bestSoloScore + str[1] + (teammateStats.gamesPlayed + 1) + str[2];
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
            let str = vPlayerText.anxious.endSoloGameBestScore.split("##");
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
        for (let i = 0; i < this.teammates.length; ++i) {
            if (finalScore <= this.teammatesStats[i].bestCoopScore) {
                oldHighScorePlayers.push(this.teammates[i]);
            }
            else {
                newHighScorePlayers.push(this.teammates[i]);
            }
        }

        const timestamp = new Date();
        if (newHighScorePlayers.length == 0) {
            let message = vPlayerText.anxious.endCoopGame;
            this.socketService.getSocket().to(this.gameId).emit('message', { "user": this.getBasicUser(), "text": message, "timestamp": timestamp.getTime(), "textColor": "#000000", chatId: this.gameId });
            const incomingMessage = {
                token: "0",
                text: message,
                chatId: this.gameId
            }
            this.chatManagerService.addMessageToDB(this.getBasicUser(), incomingMessage, timestamp);

        }
        else if (oldHighScorePlayers.length == 0) {
            let str = vPlayerText.anxious.endCoopGameBestScoreAll.split("##");
            let message = str[0] + finalScore + str[1];
            this.socketService.getSocket().to(this.gameId).emit('message', { "user": this.getBasicUser(), "text": message, "timestamp": timestamp.getTime(), "textColor": "#000000", chatId: this.gameId });
            const incomingMessage = {
                token: "0",
                text: message,
                chatId: this.gameId
            }
            this.chatManagerService.addMessageToDB(this.getBasicUser(), incomingMessage, timestamp);

        }
        else {
            let str = vPlayerText.anxious.endCoopGameBestScoreSome.split("##");
            let messageStart: string;
            let messageEnd: string;
            if (oldHighScorePlayers.length > 1) {
                messageStart = str[0] + this.arrayToString(oldHighScorePlayers) + str[1] + "vous " + str[2] + "votre" + str[3];
            }
            else {
                messageStart = str[0] + this.arrayToString(oldHighScorePlayers) + str[1] + "t'" + str[2] + "ton" + str[3];
            }
            if (newHighScorePlayers.length > 1) {
                messageEnd = this.arrayToString(newHighScorePlayers) + " ont" + str[4] + "leur" + str[5];
            }
            else {
                messageEnd = this.arrayToString(newHighScorePlayers) + " a" + str[4] + "sien" + str[5];
            }
            let message: string = messageStart + messageEnd;
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