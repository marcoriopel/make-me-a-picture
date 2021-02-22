package com.example.prototype_mobile.viewmodel.connection.login

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.prototype_mobile.model.connection.login.LoginRepository
import com.example.prototype_mobile.model.Result
import com.example.prototype_mobile.R
import com.example.prototype_mobile.model.connection.login.LoggedInUser
import com.example.prototype_mobile.util.StringUtil
import com.example.prototype_mobile.view.connection.login.LoggedInUserView
import com.example.prototype_mobile.view.connection.login.LoginFormState
import kotlinx.coroutines.*

class LoginViewModel(val loginRepository: LoginRepository) : ViewModel() {

    private val _loginForm = MutableLiveData<LoginFormState>()
    val loginFormState: LiveData<LoginFormState> = _loginForm

    private val _loginResult = MutableLiveData<LoginResult>()
    val loginResult: LiveData<LoginResult> = _loginResult

    fun login(username: String, password: String) {
        // can be launched in a separate asynchronous job
        viewModelScope.launch {
            val result : Result<LoggedInUser> = loginRepository.login(username, StringUtil.hashSha256(password))
            if (result is Result.Success) {
                _loginResult.value =
                        LoginResult(success = LoggedInUserView(displayName = result.data.displayName))
            } else {
                _loginResult.value = LoginResult(error = R.string.login_failed)
            }
        }
    }

    fun loginDataChanged(loginData: String) {
        if (!loginData.isNotBlank()) {
            _loginForm.value = LoginFormState(usernameError = R.string.invalid_username_password)
        }
        else {
            _loginForm.value = LoginFormState(isDataValid = true)
        }
    }

}