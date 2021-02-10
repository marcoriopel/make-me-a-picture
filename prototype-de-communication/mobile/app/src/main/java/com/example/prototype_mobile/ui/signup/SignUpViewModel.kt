package com.example.prototype_mobile.ui.signup

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.example.prototype_mobile.data.Signup.SignupDataSource
import com.example.prototype_mobile.ui.login.LoginFormState
import com.example.prototype_mobile.ui.login.LoginResult

class SignUpViewModel(private val signupDataSource: SignupDataSource) : ViewModel() {

    /*Creating observed variable*/

    private val _singupForm = MutableLiveData<SignupFormState>()
    val loginFormState: LiveData<SignupFormState> = _singupForm

    private val _signupResult =  MutableLiveData<SignupResult>()
    val loginResult: LiveData<SignupResult> = _signupResult
}