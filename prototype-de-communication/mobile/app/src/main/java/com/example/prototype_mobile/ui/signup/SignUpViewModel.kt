package com.example.prototype_mobile.ui.signup

import android.content.Context
import android.util.Patterns
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.android.volley.RequestQueue
import com.example.prototype_mobile.R
import com.example.prototype_mobile.data.Result
import com.example.prototype_mobile.data.Signup.SignupDataSource
import com.example.prototype_mobile.ui.login.LoggedInUserView
import com.example.prototype_mobile.ui.login.LoginFormState
import com.example.prototype_mobile.ui.login.LoginResult
import kotlinx.coroutines.Dispatchers.IO
import kotlinx.coroutines.launch
import okhttp3.Dispatcher


//this class may need to be migrated in LoginViewModel since a lot of the methos are repeating
//theirself and follow basically the same architecture.
class SignUpViewModel(private val signupDataSource: SignupDataSource) : ViewModel() {

    /*Creating observed variable*/


    //Change the generic type when we will be able to send data to the server.
    private val _signupForm = MutableLiveData<LoginFormState>()
    val loginFormState: LiveData<LoginFormState> = _signupForm

    private val _signupResult = MutableLiveData<LoginResult>()
    val loginResult: LiveData<LoginResult> = _signupResult

    fun createAccount(username:String, password: String) {
        // can be launched in a separate asynchronous job
        viewModelScope.launch(IO)
        {
            val result = signupDataSource.createAccount(username, password)
        }

        /*if (result is Result.Success) {
            _signupResult.value = LoginResult(success = LoggedInUserView(displayName = result.data.displayName))
        } else {
            _signupResult.value = LoginResult(error = R.string.login_failed)
        }*/
    }

    fun loginDataChanged(username: String, password: String) {
        if (!isUserNameValid(username)) {
            _signupForm.value = LoginFormState(usernameError = R.string.invalid_username)
        }
        else {
            _signupForm.value = LoginFormState(isDataValid = true)
        }
    }

    private fun isUserNameValid(username: String): Boolean {
        return if (username.contains('@')) {
            Patterns.EMAIL_ADDRESS.matcher(username).matches()
        } else {
            username.isNotBlank()
        }
    }

}