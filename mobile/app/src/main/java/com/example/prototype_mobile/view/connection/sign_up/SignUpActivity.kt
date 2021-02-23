package com.example.prototype_mobile.view.connection.sign_up

import android.app.Activity
import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.Gravity
import android.widget.Toast
import androidx.annotation.StringRes
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProvider
import com.example.prototype_mobile.SignUpInfo
import com.example.prototype_mobile.databinding.ActivitySignUpBinding
import com.example.prototype_mobile.util.StringUtil
import com.example.prototype_mobile.view.chat.ChatActivity
import com.example.prototype_mobile.viewmodel.connection.sign_up.SignUpViewModel
import com.example.prototype_mobile.viewmodel.connection.sign_up.SignUpViewModelFactory
import java.util.regex.Matcher.*

class SignUpActivity : AppCompatActivity() {
    private lateinit var signUpViewModel: SignUpViewModel
    private lateinit var binding: ActivitySignUpBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySignUpBinding.inflate(layoutInflater)
        val view = binding.root
        setContentView(view)

        signUpViewModel = ViewModelProvider(this, SignUpViewModelFactory())
            .get(SignUpViewModel::class.java)

        signUpViewModel.signUpFormState.observe(this@SignUpActivity, Observer {
            val signUpState = it ?: return@Observer

            if (signUpState.firstNameError != null) {
                binding.firstNameSignUp.error = getString(signUpState.firstNameError)
            }
            if (signUpState.lastNameError != null) {
                binding.lastNameSignUp.error = getString(signUpState.lastNameError)
            }
            if (signUpState.usernameError != null) {
                binding.usernameSignUp.error = getString(signUpState.usernameError)
            }
            if (signUpState.passwordError != null) {
            binding.passwordSignUp.error = getString(signUpState.passwordError)
            }
            if (signUpState.passwordConfirmationError != null) {
                binding.passwordConfirmSignUp.error = getString(signUpState.passwordConfirmationError)
            }

        })

        signUpViewModel.signUpResult.observe(this@SignUpActivity, Observer {
            val signUpResult = it ?: return@Observer

            if (signUpResult.error != null) {
                showSignUpFailed(signUpResult.error)
            }

            if (signUpResult.success != null) {
                updateUiWithUser(signUpResult.success)
                //Complete and destroy login activity once successful
                setResult(Activity.RESULT_OK)
                finish()
            }
        })


        binding.sendSignUp.setOnClickListener {
            val formData = SignUpInfo(
                    binding.firstNameSignUp.text.toString(),
                    binding.lastNameSignUp.text.toString(),
                    binding.usernameSignUp.text.toString(),
                    StringUtil.hashSha256(binding.passwordSignUp.text.toString()))

            val isFormFilled = signUpViewModel.signUpDataVerification(
                    formData,
                    StringUtil.hashSha256(binding.passwordConfirmSignUp.text.toString()))

            if (isFormFilled) {
                signUpViewModel.signUp(formData)
            }
        }
    }

    private fun updateUiWithUser(username: String) {

        // initiate successful logged in experience
        val intent = Intent(this, ChatActivity::class.java);
        startActivity(intent)
        Toast.makeText(
                applicationContext,
                "Bienvenue $username",
                Toast.LENGTH_LONG
        ).show()
    }

    private fun showSignUpFailed(@StringRes errorString: Int) {
        val toast = Toast.makeText(applicationContext, errorString, Toast.LENGTH_LONG)
        toast.setGravity(Gravity.CENTER_VERTICAL, 0, 0)
        toast.show()
    }

}
