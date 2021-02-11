package com.example.prototype_mobile.ui.signup

import android.app.Activity
import android.content.Context
import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.core.content.MimeTypeFilter.matches
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProvider
import com.example.prototype_mobile.R
import com.example.prototype_mobile.ui.chat.ChatActivity
import com.example.prototype_mobile.ui.login.LoggedInUserView
import com.example.prototype_mobile.ui.login.LoginViewModel
import java.util.regex.Matcher
import java.util.regex.Matcher.*
import java.util.regex.Pattern.matches
import kotlin.math.log

class SingUpActivity : AppCompatActivity() {
    private lateinit var signupViewModel: SignUpViewModel

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContentView(R.layout.activity_sign_up)

        val username = findViewById<EditText>(R.id.usernameSignin);
        val passwordSignUp = findViewById<EditText>(R.id.passwordSignIn)
        val passwordSignUpConfirm = findViewById<EditText>(R.id.passwordSignConfirm)
        val signup = findViewById<Button>(R.id.sendInscription)

        val signInViewModel = ViewModelProvider(this, SignUpViewModelFactory())
            .get(SignUpViewModel::class.java)


        signupViewModel = ViewModelProvider(this, SignUpViewModelFactory())
            .get(SignUpViewModel::class.java)

        signupViewModel.loginFormState.observe(this@SingUpActivity, Observer {
            val loginState = it ?: return@Observer

            // disable login button unless both username / password is valid
            signup.isEnabled = loginState.isDataValid

            if (loginState.usernameError != null) {
                username.error = getString(loginState.usernameError)
            }
        })

        signupViewModel.signupResult.observe(this@SingUpActivity, Observer {
            val loginResult = it ?: return@Observer
            if (loginResult.success != null) {
                updateUiWithUser(loginResult.success)
                //Complete and destroy login activity once successful
                setResult(Activity.RESULT_OK)
                finish()
            }
        })


        signup.setOnClickListener {
            println("signup button clicked")
           // val queue = RequestQueueSingleton.getInstance(applicationContext).requestQueue
            signInViewModel.createAccount(username.text.toString(), passwordSignUp.text.toString())
        }

    }
    private fun updateUiWithUser(model: LoggedInUserView) {
        // val welcome = getString(R.string.welcome)
        val displayName = model.displayName
        // TODO : initiate successful logged in experience
        val intent = Intent(this, ChatActivity::class.java);
        intent.putExtra("USERNAME", displayName);
        startActivity(intent)
        Toast.makeText(
            applicationContext,
            "Bienvenue $displayName",
            Toast.LENGTH_LONG
        ).show()
    }
}
