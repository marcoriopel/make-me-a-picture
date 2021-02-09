package com.example.prototype_mobile.ui.signup

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.EditText
import androidx.lifecycle.ViewModelProvider
import com.example.prototype_mobile.R
import com.example.prototype_mobile.ui.login.LoginViewModel

class SingUpActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContentView(R.layout.activity_sign_up)

        val username = findViewById<EditText>(R.id.usernameSignin);
        val passwordSignIn = findViewById<EditText>(R.id.passwordSignIn)
        val passwordSignInConfirm = findViewById<EditText>(R.id.passwordSignConfirm)

        val signInViewModel = ViewModelProvider(this, SignUpViewModelFactory())
            .get(LoginViewModel::class.java)

        fun CreateAccount() {}

    }
}