package com.example.prototype_mobile.model.mainmenu

import com.example.prototype_mobile.Game
import com.example.prototype_mobile.model.HttpRequestDrawGuess
import com.example.prototype_mobile.model.Result
import com.example.prototype_mobile.model.connection.sign_up.model.GameDifficulty
import com.example.prototype_mobile.model.connection.sign_up.model.GameFilter
import com.example.prototype_mobile.model.connection.sign_up.model.GameType
import com.example.prototype_mobile.model.connection.sign_up.model.ResponseCode
import okhttp3.Response
import org.json.JSONObject

class GameListRepository {


    var lobbyRepository = LobbyRepository.getInstance()!!
    val filters = arrayOf(true, true, true, true, true)

    suspend fun getGameList(): Result<MutableList<Game>> {
        val response = HttpRequestDrawGuess.httpRequestGet("/api/games/list")
        return analyseGameListAnswer(response)
    }

    fun analyseGameListAnswer(response: Response): Result<MutableList<Game>> {
        val jsonData: String = response.body()!!.string()
        if(response.code() == ResponseCode.OK.code) {
            var gameList: MutableList<Game> = mutableListOf()
            val jObject = JSONObject(jsonData)
            val jArray = jObject.getJSONArray("lobbies")
            for (i in 0 until jArray.length()) {
                val gameJson = jArray.getJSONObject(i)
                val game = Game(
                    gameJson.getString("id"),
                    gameJson.getString("gameName"),
                    GameDifficulty.values()[gameJson.getInt("difficulty")],
                    GameType.values()[gameJson.getInt("gameType")])
                gameList.add(game)
            }
            println(gameList)
            val filteredGameList = gameList.filter{ filterGame(it) } as MutableList<Game>
            println(filteredGameList)
            return Result.Success(filteredGameList)
        } else {
            return Result.Error(response.code())
        }
    }

    private fun filterGame(game: Game) :Boolean {
        if (!filters[GameFilter.CLASSIC.filter] && game.gameType == GameType.CLASSIC) {
            return false
        }
        if (!filters[GameFilter.COOP.filter] && game.gameType == GameType.COOP) {
            return false
        }
        if (!filters[GameFilter.EASY.filter] && game.difficulty == GameDifficulty.EASY) {
            return false
        }
        if (!filters[GameFilter.MEDIUM.filter] && game.difficulty == GameDifficulty.MEDIUM) {
            return false
        }
        if (!filters[GameFilter.HARD.filter] && game.difficulty == GameDifficulty.HARD) {
            return false
        }
        return true
    }

    fun setFilter(filter: GameFilter, showThisTypeOfGame: Boolean) {
        filters[filter.filter] = showThisTypeOfGame
    }

    fun listenLobby(lobbyID: String) {
        lobbyRepository.listenLobby(lobbyID)
    }

    fun joinLobby(game: Game) {
        lobbyRepository.joinLobby(game)
    }
}