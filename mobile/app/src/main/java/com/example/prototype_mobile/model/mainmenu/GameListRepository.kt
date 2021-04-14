package com.example.prototype_mobile.model.mainmenu

import android.util.Log
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


    companion object {
        private var instance: GameListRepository? = null

        fun getInstance(): GameListRepository? {
            if (instance == null) {
                synchronized(GameListRepository::class.java) {
                    if (instance == null) {
                        instance = GameListRepository()
                    }
                }
            }
            return instance
        }
    }
    var lobbyRepository = LobbyRepository.getInstance()!!
    val filters = arrayOf(true, true, true, true, true)
    var filterGameName: String = ""
    var allGames: MutableList<Game> = mutableListOf()

    suspend fun getGameList(): Result<MutableList<Game>> {
        val response = HttpRequestDrawGuess.httpRequestGet("/api/games/list")
        return analyseGameListAnswer(response)
    }

    fun analyseGameListAnswer(response: Response): Result<MutableList<Game>> {
        val jsonData: String = response.body()!!.string()
        allGames  = mutableListOf()
        if(response.code() == ResponseCode.OK.code){
            val jObject = JSONObject(jsonData)
            val jArray = jObject.getJSONArray("lobbies")
            for (i in 0 until jArray.length()) {
                val gameJson = jArray.getJSONObject(i)
                val game = Game(
                    gameJson.getString("id"),
                    gameJson.getString("gameName"),
                    GameDifficulty.values()[gameJson.getInt("difficulty")],
                    GameType.values()[gameJson.getInt("gameType")],
                        gameJson.getBoolean("isPrivate")
                )
                allGames.add(game)


            }
            val filteredGameList = allGames.filter{ filterGame(it) } as MutableList<Game>
            return Result.Success(filteredGameList)
        } else {
            return Result.Error(response.code())
        }
    }

    private fun filterGame(game: Game) :Boolean {
        if (game.gameType == GameType.SOLO) {
            return false
        }
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
        if(game.isPrivate)
            return false

        return game.gameName.toLowerCase().startsWith(filterGameName.toLowerCase())
    }

    fun setFilter(filter: GameFilter, showThisTypeOfGame: Boolean) {
        filters[filter.filter] = showThisTypeOfGame
    }

    fun listenLobby(lobbyID: String) {
        lobbyRepository.listenLobby(lobbyID)
    }

    suspend fun joinLobby(game: Game): Result<Game> {
        println("Game list join lobby")
        return lobbyRepository.joinLobby(game)
    }
}