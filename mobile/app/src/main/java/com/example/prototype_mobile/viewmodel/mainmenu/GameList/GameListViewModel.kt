package com.example.prototype_mobile.viewmodel.mainmenu.GameList

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.prototype_mobile.Game
import com.example.prototype_mobile.GameListResult
import com.example.prototype_mobile.LobbyPlayers
import com.example.prototype_mobile.R
import com.example.prototype_mobile.model.Result
import com.example.prototype_mobile.model.connection.sign_up.model.GameFilter
import com.example.prototype_mobile.model.connection.sign_up.model.ResponseCode
import com.example.prototype_mobile.model.mainmenu.GameListRepository
import com.example.prototype_mobile.model.mainmenu.LobbyRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.lang.Exception

class GameListViewModel(val gameListRepository: GameListRepository) : ViewModel() {
    private val _gameListResult = MutableLiveData<GameListResult>()
    val gameListResult: LiveData<GameListResult> = _gameListResult

    private val _lobbyPlayers = MutableLiveData<LobbyPlayers>()
    val lobbyPlayers: LiveData<LobbyPlayers> = _lobbyPlayers

    private val _joinLobbyResult= MutableLiveData<GameListResult>()
    val joinLobbyResult: LiveData<GameListResult> = _joinLobbyResult

    init {
        val lobbyRepository = LobbyRepository.getInstance()!!
        lobbyRepository.lobbyPlayers.observeForever(Observer {
            _lobbyPlayers.value = it ?: return@Observer
        })
    }

    fun getGameList() {
        viewModelScope.launch(Dispatchers.IO) {
            val result: Result<MutableList<Game>> = try {
                gameListRepository.getGameList()
            } catch (e: Exception) {
                Result.Error(ResponseCode.BAD_REQUEST.code)
            }

            if (result is Result.Success) {
                _gameListResult.postValue(GameListResult(result.data))
            }

            if (result is Result.Error){
                when(result.exception) {
                    ResponseCode.NOT_AUTHORIZED.code -> _gameListResult.postValue(GameListResult(error = R.string.not_authorized))
                    ResponseCode.BAD_REQUEST.code -> _gameListResult.postValue(GameListResult(error = R.string.bad_request))
                }
            }
        }
    }

    fun listenLobby(lobbyID : String) {
        gameListRepository.listenLobby(lobbyID)
    }

    fun setFilter(filter: GameFilter, showThisTypeOfGame: Boolean) {
        gameListRepository.setFilter(filter, showThisTypeOfGame)
        getGameList()
    }

    fun filterByGameName(gameName: String) {
        gameListRepository.filterGameName = gameName
        getGameList()
    }

    fun joinLobby(game: Game) {
        viewModelScope.launch {
            val result: Result<Game> = try {
                gameListRepository.joinLobby(game)
            } catch (e: Exception) {
                Result.Error(ResponseCode.BAD_REQUEST.code)
            }

            if (result is Result.Error) {
                when (result.exception) {
                    ResponseCode.NOT_AUTHORIZED.code -> _joinLobbyResult.value = GameListResult(error = R.string.not_authorized)
                    ResponseCode.BAD_REQUEST.code -> _joinLobbyResult.value = GameListResult(error = R.string.bad_request)
                    ResponseCode.FULL.code -> _joinLobbyResult.value = GameListResult(error = R.string.lobby_full)
                }
            }
        }
    }
}