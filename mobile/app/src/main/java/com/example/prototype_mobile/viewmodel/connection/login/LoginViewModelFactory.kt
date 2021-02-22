package com.example.prototype_mobile.viewmodel.connection.login

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.example.prototype_mobile.model.HttpRequestDrawGuess
import com.example.prototype_mobile.model.connection.login.LoginRepository


/**
 * ViewModel provider factory to instantiate LoginViewModel.
 * Required given LoginViewModel has a non-empty constructor
 */
class LoginViewModelFactory : ViewModelProvider.Factory {

    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(LoginViewModel::class.java)) {
            return LoginRepository.getInstance(
            )?.let {
                LoginViewModel(
                        loginRepository = it
                )
            } as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}