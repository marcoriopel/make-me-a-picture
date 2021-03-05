package com.example.prototype_mobile.viewmodel.mainmenu

import androidx.lifecycle.*
import com.example.prototype_mobile.*
import com.example.prototype_mobile.model.connection.sign_up.model.GameDifficulty
import com.example.prototype_mobile.model.connection.sign_up.model.GameType
import com.example.prototype_mobile.model.mainmenu.LobbyRepository
import com.example.prototype_mobile.model.mainmenu.MainMenuRepository
import com.example.prototype_mobile.viewmodel.mainmenu.GameList.SelectedButton
import kotlinx.coroutines.launch
import com.example.prototype_mobile.model.Result

//This class is a sharedViewModel that will allow us to send information to the server
//Join information between fragments
class MainMenuViewModel(private val mainMenuRepository: MainMenuRepository) : ViewModel(){

    //Information that we need to observe in order to send an gameCreation request.
    private val _creationGameButtonType = MutableLiveData<SelectedButton>()
    val creationGameButtonType: LiveData<SelectedButton> = _creationGameButtonType


    private val _gameName = MutableLiveData<String>()
    val gameName: LiveData<String> = _gameName

    private val _icognitoModeActivated = MutableLiveData<Boolean>()
    val icognitoModeActivated: LiveData<Boolean> = _icognitoModeActivated

    //For another sprint
    private val _icognitoPassword= MutableLiveData<String>()
    val icognitoPassword: LiveData<String> = _icognitoPassword

    private val _gameDifficulty = MutableLiveData<GameDifficulty>()
    val gameDifficulty: LiveData<GameDifficulty> = _gameDifficulty

    private val _lobbyJoined = MutableLiveData<Game>()
    val lobbyJoined: LiveData<Game> = _lobbyJoined

    val lobbyRepository: LobbyRepository


    var liveDataMerger: MediatorLiveData<GameCreationMergeData> = MediatorLiveData()


    init {
        liveDataMerger= fetchData()

        lobbyRepository = LobbyRepository.getInstance()!!


        lobbyRepository.lobbyJoined.observeForever(Observer {
            _lobbyJoined.value = it ?: return@Observer
        })

    }

    fun setCreationGameButtonType(selection: SelectedButton){
        _creationGameButtonType.value = selection
    }

    fun setGameName(name: String){
        println("setGameName: " + name)
        _gameName.value = name
        println("gameName: "+ _gameName.value)
    }

    fun setIcognitoPassword(password: String){
        _icognitoPassword.value = password
    }

    fun setIcognitoMode(mode:Boolean) {
        _icognitoModeActivated.value = mode
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
            println("livedataMerger: " + it)
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
                    gameData = CreateGame(GameType.CLASSIC, gameName.value, gameDifficulty.value)
                }
                SelectedButton.SPRINT -> {
                    gameData = CreateGame(GameType.SOLO, gameName.value, gameDifficulty.value)
                }
                SelectedButton.COOP -> {
                    gameData = CreateGame(GameType.COOP, gameName.value, gameDifficulty.value)
                }
                else -> println("Somethings wrong with game data")
            }
            val result: Result<Game> = mainMenuRepository.createGame(gameData)

            if (result is Result.Success) {
                lobbyRepository.joinLobby(result.data)
            }
            if (result is Result.Error) {
                println("Bad request")
            }
        }
    }

    fun clear() {
        liveDataMerger.value = Difficulty(GameDifficulty.NONE)
        liveDataMerger.value = GameName("")
    }


}