package com.example.prototype_mobile.viewmodel.mainmenu

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider

class MainMenuViewModelFactory: ViewModelProvider.Factory {

    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(MainMenuViewModel::class.java)) {
            return MainMenuViewModel() as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}