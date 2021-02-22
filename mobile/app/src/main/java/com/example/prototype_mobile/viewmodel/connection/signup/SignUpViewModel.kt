package com.example.prototype_mobile.viewmodel.connection.signup

import android.util.Patterns
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.prototype_mobile.R
import com.example.prototype_mobile.model.Result
import com.example.prototype_mobile.model.connection.signup.SignupDataSource
import com.example.prototype_mobile.model.connection.login.LoggedInUser
import com.example.prototype_mobile.view.connection.login.LoggedInUserView
import com.example.prototype_mobile.view.connection.login.LoginFormState
import com.example.prototype_mobile.viewmodel.connection.login.LoginResult
import kotlinx.coroutines.launch

//https://developer.android.com/kotlin/coroutines

//this class may need to be migrated in LoginViewModel since a lot of the methos are repeating
//theirself and follow basically the same architecture.
class SignUpViewModel(private val signupDataSource: SignupDataSource) : ViewModel() {

    /*Creating observed variable*/


    //Change the generic type when we will be able to send data to the server.
    private val _signupForm = MutableLiveData<LoginFormState>()
    val loginFormState: LiveData<LoginFormState> = _signupForm

    private val _signupResult = MutableLiveData<LoginResult>()
    val signupResult: LiveData<LoginResult> = _signupResult

    fun createAccount(username:String, password: String) {
        // can be launched in a separate asynchronous job
        viewModelScope.launch()
        {
            val result: Result<LoggedInUser> = try {
                signupDataSource.createAccount(username, password)
            } catch (e: Exception) {
                Result.Error("Network request failed")
            }
            when(result) {
                is Result.Success<LoggedInUser>
                    ->  _signupResult.value =  LoginResult(success = LoggedInUserView(displayName = result.data.displayName))
                else -> println("Erreur de creation de compte")
            }

        }
    }

    fun loginDataChanged(username: String) {
        if (!isUserNameValid(username)) {
            _signupForm.value = LoginFormState(usernameError = R.string.invalid_username_password)
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