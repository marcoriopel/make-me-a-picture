package com.example.prototype_mobile

import android.graphics.Paint
import android.graphics.Path
import androidx.annotation.DrawableRes
import com.example.prototype_mobile.model.connection.sign_up.model.ChannelState
import com.example.prototype_mobile.model.connection.sign_up.model.EndGamePageType
import com.example.prototype_mobile.model.connection.sign_up.model.GameDifficulty
import com.example.prototype_mobile.model.connection.sign_up.model.GameType
import java.util.*

// Data class for the chat
data class Message (val username : String, val text : String, val time : String, val messageType: Int, val timestamp: Long, val avatar: Int)
data class MessageReceive (val id : String, val user : User, val text : String, val timestamp : Long, val textColor : String, val chatId: String)
data class User (val username: String, val avatar: Int)
data class InitialData (val token : String)
data class SendMessage(val text: String, val token: String, val chatId: String)
data class ChannelReceived(val chatId: String, val chatName: String, val isGameChat: Boolean = false)
data class ChannelList(val chats: Array<ChannelReceived>)
data class Channel(val chatId: String, val chatName: String, var channelState: ChannelState)
data class JoinChannel(val chatId: String)
data class ChatHistoryMessage(val username : String?, val message : String, val timestamp : Long, val avatar: Int)
data class ChatHistory(val chatHistory: Array<ChatHistoryMessage>)

// Data class for the sign up
data class SignUpInfo(val firstName: String, val lastName: String, val username: String, val password: String, val avatar: Int)

// Data class for the login
data class LoggedInUser(val token: String, val username: String, val avatar: Int)
data class LoginResult(val success: String? = null, val error: Int? = null)

//Data class for the Lobbies and list of lobbies
data class LobbyId(val lobbyId: String)
data class PrivateLobby( val lobbyInvited: String, val lobbyId: String)
data class Game(val gameID: String, val gameName: String, val difficulty: GameDifficulty, val gameType: GameType, val isPrivate: Boolean)
data class GameInvited(val gameID: String, val gameName: String, val difficulty: GameDifficulty, val gameType: GameType, val lobbyInvited: String?)
data class GameListResult(val success: MutableList<Game>? = null, val error: Int? = null)

//Merge data change in form
data class GameName(val name:String): GameCreationMergeData()
data class Difficulty(val difficulty:GameDifficulty): GameCreationMergeData()

// Game creation
data class CreateGame(val gameType: GameType?, val gameName: String?, val gameDifficulty: GameDifficulty?)
data class Suggestions(val drawingNames: Array<String>)
data class GameId(val gameId: String)
data class ListenLobby(val oldLobbyId: String, val lobbyId: String)
data class LobbyPlayers(val players: Array<Players>)
data class Players(val username: String, val avatar: Int, val team: Int = 0)
sealed class GameCreationMergeData

// Data class for the Game
data class Score(val score: IntArray)
data class Timer(val timer: Int)
data class Transition(val timer: Int, val state: Int)

// Data class for the drawing
data class PaintedPath(val path: Path, val paint: Paint)
data class DrawingEvent(val eventType: Int, val event: Event?, val gameId: String)
abstract class Event
data class MouseDown(val lineColor: String, val lineWidth: Int, val lineOpacity: Double = 1.00, val coords: Vec2, val strokeNumber: Int, val isEraser: Boolean = false): Event()
data class Vec2(val x: Int, val y : Int): Event()
data class GuessEvent(val gameId: String, val guess: String)
data class GuessesLeft(val guessesLeft: Array<Int>)
data class EraserStrokesReceived(val eraserStrokes: Array<EraserStroke>)
data class EraserStroke(val path: Array<Vec2>, val isEraser: Boolean, val strokeNumber: Int, val lineWidth: Int, val lineColor: String)

data class BasicUser(val username: String, val avatar: Int)
data class GuessCallBack(val isCorrectGuess: Boolean, val guessingPlayer: String)
data class HintRequest(val gameId: String, val user: BasicUser)

//Data class for the profil
data class PrivateReceivedInfo(val privateInfo: PrivateInfo)
data class PrivateInfo(val name: String, val surname: String, val stats: Stats, val logs: Array<Log>, val games: Array<GameLog>)
data class Stats(val gamesPlayed: Int, val timePlayed: Long, val bestSoloScore: Int, val bestCoopScore: Int, val classicWinRatio: Double, val meanGameTime: Double)
data class Log(val _id: String, val username: String, val isLogin: Boolean, val timestamp: Long)
data class GameLog(val _id: String, val gameName: String, val gameType: Int, val players: Array<Players>, val start: Long, val end: Long, val score: Array<Int> = arrayOf(0, 0))
data class Connection(val date: String, val action: String)
data class GameHistoric(val date: String, val name: String, val mode: String, val team1: String, val team2: String, val score: String)

data class StaticTutorialInfo(val title:String, @DrawableRes val image: Int, val description: String?)

data class StaticEndGameInfo(val title:String, val description: String, val type: EndGamePageType, val data: EndGameData?)
abstract class EndGameData() {
    abstract val image: String?
}
data class VDrawingData(val drawingName: String, override var image: String, val id: String): EndGameData()
data class DrawingData(val drawingName: String, override var image: String?, val drawingEventList: LinkedList<DrawingEvent>, val hint: MutableList<String>): EndGameData()
data class EndGameResult(val win: Boolean, override var image: String?): EndGameData()
data class VPlayerDrawingEndGame(val virtualPlayerDrawings: List<String>, val virtualPlayerIds: List<String>)

// Export drawing
data class Drawing(val difficulty: Difficulty, val pencilStrokes: MutableList<Stroke>, val eraserStrokes: MutableList<Stroke>, val hints: MutableList<String>, val drawingName : String)
data class Stroke(val path: MutableList<Vec2>, val strokeNumber: Int, val isEraser: Boolean, val lineWidth: Int, val lineColor: String)
