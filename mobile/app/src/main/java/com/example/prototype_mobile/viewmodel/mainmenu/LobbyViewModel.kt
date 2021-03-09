package com.example.prototype_mobile.viewmodel.mainmenu

import androidx.lifecycle.*
import com.example.prototype_mobile.Game
import com.example.prototype_mobile.GameListResult
import com.example.prototype_mobile.LobbyPlayers
import com.example.prototype_mobile.R
import com.example.prototype_mobile.model.Result
import com.example.prototype_mobile.model.connection.sign_up.model.ResponseCode
import com.example.prototype_mobile.model.mainmenu.LobbyRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.lang.Exception

class LobbyViewModel:  ViewModel() {
    private val _lobbyPlayers = MutableLiveData<LobbyPlayers>()
    val lobbyPlayers: LiveData<LobbyPlayers> = _lobbyPlayers

    val lobbyRepository: LobbyRepository = LobbyRepository.getInstance()!!

    init {
        lobbyRepository.lobbyPlayers.observeForever(Observer {
            _lobbyPlayers.value = it ?: return@Observer
        })
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
}