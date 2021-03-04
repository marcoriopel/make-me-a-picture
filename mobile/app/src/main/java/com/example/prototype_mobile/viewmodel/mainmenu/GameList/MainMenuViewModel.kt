package com.example.prototype_mobile.viewmodel.mainmenu.GameList

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.example.prototype_mobile.model.mainmenu.GameListRepository
import com.example.prototype_mobile.model.mainmenu.MainMenuRepository

//This class is a sharedViewModel that will allow us to send information to the server
//Join information between fragments
class MainMenuViewModel(val mainMenuRepository: MainMenuRepository) : ViewModel(){

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

    private val _gameDifficulty = Mutable

    fun setCreationGameButtonType(selection: SelectedButton){
        _creationGameButtonType.value = selection
    }

    fun setGameName(name: String){
        _gameName.value = name
    }

    fun setIcognitoPassword(password: String){
        _icognitoPassword.value = password
    }

    fun setIcognitoMode(mode:Boolean) {
        _icognitoModeActivated.value = mode
    }






    fun createGame() {
        mainMenuRepository.createGame()
    }


}