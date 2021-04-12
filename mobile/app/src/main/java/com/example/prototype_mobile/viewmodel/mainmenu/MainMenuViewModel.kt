package com.example.prototype_mobile.viewmodel.mainmenu

import androidx.lifecycle.*
import com.example.prototype_mobile.*
import com.example.prototype_mobile.model.connection.sign_up.model.GameDifficulty
import com.example.prototype_mobile.model.connection.sign_up.model.GameType
import com.example.prototype_mobile.model.mainmenu.LobbyRepository
import com.example.prototype_mobile.model.mainmenu.MainMenuRepository
import kotlinx.coroutines.launch
import com.example.prototype_mobile.model.Result
import com.example.prototype_mobile.model.connection.login.LoginRepository
import com.example.prototype_mobile.model.connection.sign_up.model.ResponseCode
import com.example.prototype_mobile.model.connection.sign_up.model.SelectedButton
import com.example.prototype_mobile.model.mainmenu.GameListRepository
import java.lang.Exception

//This class is a sharedViewModel that will allow us to send information to the server
//Join information between fragments
class MainMenuViewModel(private val mainMenuRepository: MainMenuRepository) : ViewModel(){

    //Information that we need to observe in order to send an gameCreation request.
    private val _creationGameButtonType = MutableLiveData<SelectedButton>()
    val creationGameButtonType: LiveData<SelectedButton> = _creationGameButtonType

    private val _gameName = MutableLiveData<String>()
    val _isPrivate = MutableLiveData<Boolean>()
    private val _incognitoPassword= MutableLiveData<String>()
    private val _gameDifficulty = MutableLiveData<GameDifficulty>()


    var _gameInviteID = MutableLiveData<String?>()


    var liveDataMerger: MediatorLiveData<GameCreationMergeData> = MediatorLiveData()

    private val _lobbyJoined = MutableLiveData<Game>()
    val lobbyJoined: LiveData<Game> = _lobbyJoined

    private val _logout = MutableLiveData<Boolean>()
    val logout: LiveData<Boolean> = _logout

    val lobbyRepository: LobbyRepository
    val avatar = LoginRepository.getInstance()!!.user!!.avatar

    init {
        liveDataMerger= fetchData()
        lobbyRepository = LobbyRepository.getInstance()!!

        _isPrivate.value = false
        lobbyRepository.lobbyJoined.observeForever(Observer {
            _lobbyJoined.value = it ?: return@Observer
        })
    }

    fun setCreationGameButtonType(selection: SelectedButton){
        _creationGameButtonType.value = selection
    }

    fun setGameName(name: String){
        _gameName.value = name
    }

    fun setIncognitoPassword(password: String){
        _incognitoPassword.value = password
    }

    fun setIncognitoMode(mode:Boolean) {
        _isPrivate.value = mode
    }

    fun setGameDifficulty(difficulty: GameDifficulty) {
        _gameDifficulty.value = difficulty
    }

    //adaptation from https://code.luasoftware.com/tutorials/android/use-mediatorlivedata-to-query-and-merge-different-data-type/
    fun fetchData(): MediatorLiveData<GameCreationMergeData> {
        val liveDataMerger = MediatorLiveData<GameCreationMergeData>()
        liveDataMerger.addSource(_gameDifficulty,  Observer<GameDifficulty>{
            if(it !=null) {
                liveDataMerger.value = Difficulty(it)
            }

        })

        liveDataMerger.addSource(_gameName){
            if(it != null){
                liveDataMerger.value= GameName(it)
            }
        }

        return liveDataMerger
    }

    fun updateData(difficulty: GameDifficulty, str: String) {
        liveDataMerger.value = Difficulty(difficulty)
        liveDataMerger.value = GameName(str)
    }

    fun createGame() {
        viewModelScope.launch {
            var gameData = CreateGame(null, null, null)

            when (creationGameButtonType.value) {
                SelectedButton.CLASSIC -> {
                    gameData = CreateGame(GameType.CLASSIC, _gameName.value, _gameDifficulty.value)
                }
                SelectedButton.SPRINT -> {
                    gameData = CreateGame(GameType.SOLO, _gameName.value, _gameDifficulty.value)
                }
                SelectedButton.COOP -> {
                    gameData = CreateGame(GameType.COOP, _gameName.value, _gameDifficulty.value)
                }
                else -> println("Somethings wrong with game data")
            }
            val result: Result<Game> = mainMenuRepository.createGame(gameData, _isPrivate.value!! )
            if (result is Result.Success) {
                println(result.data.lobbyInvited)
                if(result.data.lobbyInvited != null) {
                    _gameInviteID.value = result.data.lobbyInvited
                }
                lobbyRepository.listenLobby(result.data.gameID)
                lobbyRepository.joinLobby(result.data)
            }
            if (result is Result.Error) {
                println("Bad request")
            }
        }
    }

     fun joinPrivateGame(code: String) {

         viewModelScope.launch {
             var result = lobbyRepository.joinPrivate(code)

             if(result is Result.Success) {
                 val game = GameListRepository.getInstance()!!.findGame(result.data.lobbyId)
                 if(game is Result.Success){
                     lobbyRepository.joinLobby(game.data)
                 }

             }

         }
    }

    fun logout() {
        viewModelScope.launch {
            val result: Result<Boolean> = try {
                LoginRepository.getInstance()!!.logout()
            } catch (e: Exception) {
            Result.Error(ResponseCode.BAD_REQUEST.code)
            }

            if (result is Result.Success) {
                _logout.postValue(true)
            }
            if (result is Result.Error) {
                println("Bad request")
            }
        }
    }
}
