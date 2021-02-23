package com.example.prototype_mobile.viewmodel.connection.sign_up

import android.util.Patterns
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.prototype_mobile.LoggedInUser
import com.example.prototype_mobile.LoginResult
import com.example.prototype_mobile.R
import com.example.prototype_mobile.SignUpInfo
import com.example.prototype_mobile.model.Result
import com.example.prototype_mobile.model.connection.sign_up.SignUpRepository
import com.example.prototype_mobile.model.connection.sign_up.model.ResponseCode
import com.example.prototype_mobile.util.StringUtil
import com.example.prototype_mobile.view.connection.sign_up.SignUpFormState
import kotlinx.coroutines.launch

//https://developer.android.com/kotlin/coroutines

class SignUpViewModel(private val signUpRepository: SignUpRepository) : ViewModel() {

    /*Creating observed variable*/
    private val _signUpForm = MutableLiveData<SignUpFormState>()
    val signUpFormState: LiveData<SignUpFormState> = _signUpForm

    private val _signUpResult = MutableLiveData<LoginResult>()
    val signUpResult: LiveData<LoginResult> = _signUpResult

    fun signUp(signUpInfo: SignUpInfo) {
        // can be launched in a separate asynchronous job
        viewModelScope.launch()
        {
            val result: Result<LoggedInUser> = try {
                signUpRepository.signUp(signUpInfo)
            } catch (e: Exception) {
                Result.Error(ResponseCode.BAD_REQUEST.code)
            }

            if (result is Result.Success) {
                _signUpResult.value = LoginResult(success = result.data.username)
            }

            if(result is Result.Error){
                when(result.exception) {
                    ResponseCode.CONFLICT.code -> _signUpResult.value = LoginResult(error = R.string.username_used)
                    ResponseCode.BAD_REQUEST.code -> _signUpResult.value = LoginResult(error = R.string.bad_request)
                }
            }
        }
    }

    fun signUpDataVerification(signUpData: SignUpInfo, passwordConfirmation: String): Boolean {
        var isFormWellFilled = true
        if (signUpData.username.isBlank()) {
            _signUpForm.value = SignUpFormState(usernameError = R.string.mandatory_field)
            isFormWellFilled = false
        }
        if (signUpData.firstName.isBlank()) {
            _signUpForm.value = SignUpFormState(firstNameError = R.string.mandatory_field)
            isFormWellFilled = false
        }
        if (signUpData.lastName.isBlank()) {
            _signUpForm.value = SignUpFormState(lastNameError = R.string.mandatory_field)
            isFormWellFilled = false
        }
        if (signUpData.password == StringUtil.hashSha256("")) {
            _signUpForm.value = SignUpFormState(passwordError = R.string.mandatory_field)
            isFormWellFilled = false
        }
        if (signUpData.password != passwordConfirmation) {
            _signUpForm.value = SignUpFormState(passwordError = R.string.password_not_matched)
            isFormWellFilled = false
        }

        return isFormWellFilled
    }
}
