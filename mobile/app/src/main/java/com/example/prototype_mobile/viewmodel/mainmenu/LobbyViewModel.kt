package com.example.prototype_mobile.viewmodel.mainmenu

import androidx.lifecycle.*
import com.example.prototype_mobile.LobbyPlayers
import com.example.prototype_mobile.model.Result
import com.example.prototype_mobile.model.connection.sign_up.model.ResponseCode
import com.example.prototype_mobile.model.game.CanvasRepository
import com.example.prototype_mobile.model.game.GameRepository
import com.example.prototype_mobile.model.mainmenu.LobbyRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.lang.Exception

class LobbyViewModel:  ViewModel() {
    private val _lobbyPlayers = MutableLiveData<LobbyPlayers>()
    val lobbyPlayers: LiveData<LobbyPlayers> = _lobbyPlayers

    private val _isPlayerDrawing = MutableLiveData<Boolean>()
    val isPlayerDrawing: LiveData<Boolean> = _isPlayerDrawing

    val lobbyRepository: LobbyRepository = LobbyRepository.getInstance()!!

    init {
        lobbyRepository.lobbyPlayers.observeForever(Observer {
            _lobbyPlayers.value = it ?: return@Observer
        })

        lobbyRepository.isPlayerDrawing.observeForever(Observer {
            _isPlayerDrawing.value = it ?: return@Observer
            val gameRepository = GameRepository.getInstance()!!
            gameRepository.setIsPlayerDrawing(it)
            gameRepository.gameId = lobbyRepository.currentListenLobby
            _lobbyPlayers.value.players.
        })

        // Initialize Singleton
        GameRepository.getInstance()
    }

    fun addVirtualPlayer(team: Int) {
        viewModelScope.launch(Dispatchers.IO) {
            try {
                lobbyRepository.addVirtualPlayer(team)
            } catch (e: Exception) {
                Result.Error(ResponseCode.BAD_REQUEST.code)
            }
        }
    }

    fun removeVirtualPlayer(team: Int, username: String) {
        viewModelScope.launch(Dispatchers.IO) {
            try {
                lobbyRepository.removeVirtualPlayer(team, username)
            } catch (e: Exception) {
                Result.Error(ResponseCode.BAD_REQUEST.code)
            }
        }
    }

    fun startGame() {
        viewModelScope.launch(Dispatchers.IO) {
            try {
                lobbyRepository.startGame()
            } catch (e: Exception) {
                Result.Error(ResponseCode.BAD_REQUEST.code)
            }
        }
    }
}