package com.example.prototype_mobile.ui.login

import android.content.Context
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import android.util.Patterns
import com.example.prototype_mobile.data.LoginRepository
import com.example.prototype_mobile.data.Result
import com.example.prototype_mobile.R
import com.example.prototype_mobile.data.model.LoggedInUser
import kotlinx.coroutines.*
import kotlin.system.*

class LoginViewModel(val loginRepository: LoginRepository) : ViewModel() {

    private val _loginForm = MutableLiveData<LoginFormState>()
    val loginFormState: LiveData<LoginFormState> = _loginForm

    private val _loginResult = MutableLiveData<LoginResult>()
    val loginResult: LiveData<LoginResult> = _loginResult

    fun login(username: String, password: String, context: Context) {
        // can be launched in a separate asynchronous job
        val result : Deferred<Result<LoggedInUser>> = GlobalScope.async { loginRepository.login(username, password) }

        runBlocking {
            val r = result.await()
            if (r is Result.Success) {
                _loginResult.value =
                    LoginResult(success = LoggedInUserView(displayName = r.data.displayName))
            } else {
                _loginResult.value = LoginResult(error = R.string.login_failed)
            }
        }
    }

    fun loginDataChanged(username: String) {
        if (!isUserNameValid(username)) {
            _loginForm.value = LoginFormState(usernameError = R.string.invalid_username)
        }
        else {
            _loginForm.value = LoginFormState(isDataValid = true)
        }
    }

    // A placeholder username validation check
    private fun isUserNameValid(username: String): Boolean {
        return if (username.contains('@')) {
            Patterns.EMAIL_ADDRESS.matcher(username).matches()
        } else {
            username.isNotBlank()
        }
    }
}