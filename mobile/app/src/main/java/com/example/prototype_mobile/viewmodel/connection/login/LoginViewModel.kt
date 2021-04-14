package com.example.prototype_mobile.viewmodel.connection.login

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.prototype_mobile.LoggedInUser
import com.example.prototype_mobile.LoginResult
import com.example.prototype_mobile.model.connection.login.LoginRepository
import com.example.prototype_mobile.model.Result
import com.example.prototype_mobile.R
import com.example.prototype_mobile.model.connection.sign_up.model.ResponseCode
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
            val result : Result<LoggedInUser> = try{ loginRepository.login(username, password)}
            catch(e: Exception) {
                Result.Error(ResponseCode.BAD_REQUEST.code)
            }
            if (result is Result.Success) {
                _loginResult.value = LoginResult(success = result.data.username)
            }

            if(result is Result.Error){
                when(result.exception) {
                    ResponseCode.NOT_FOUND.code -> _loginResult.value = LoginResult(error = R.string.login_failed)
                    ResponseCode.BAD_REQUEST.code -> _loginResult.value = LoginResult(error = R.string.bad_request)
                }
            }
        }
    }

    fun loginDataChanged(loginData: String, isPassword: Boolean) {
        if (loginData.isBlank()) {
            if (!isPassword) {
                _loginForm.value = LoginFormState(usernameError = R.string.invalid_username)
            } else {
                _loginForm.value = LoginFormState(passwordError = R.string.invalid_password)
            }
        }
        else {
            _loginForm.value = LoginFormState(isDataValid = true)
        }
    }

}