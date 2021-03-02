package com.example.prototype_mobile.viewmodel.mainmenu

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.example.prototype_mobile.model.mainmenu.GameListRepository
import com.example.prototype_mobile.viewmodel.connection.sign_up.SignUpViewModel

class GameListViewModelFactory : ViewModelProvider.Factory {

    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(GameListViewModel::class.java)) {
            return GameListViewModel(GameListRepository()) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}