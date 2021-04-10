package com.example.prototype_mobile.view.connection.sign_up

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.view.Gravity
import android.view.Menu
import android.widget.Toast
import androidx.annotation.StringRes
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProvider
import com.example.prototype_mobile.R
import com.example.prototype_mobile.SignUpInfo
import com.example.prototype_mobile.databinding.ActivitySignUpBinding
import com.example.prototype_mobile.util.StringUtil
import com.example.prototype_mobile.view.connection.login.LoginActivity
import com.example.prototype_mobile.view.tutorial.StaticTutorialActivity
import com.example.prototype_mobile.viewmodel.connection.sign_up.SignUpViewModel
import com.example.prototype_mobile.viewmodel.connection.sign_up.SignUpViewModelFactory

class SignUpActivity : AppCompatActivity() {
    private lateinit var signUpViewModel: SignUpViewModel
    private lateinit var binding: ActivitySignUpBinding
    private var avatar = 0

    override fun onCreateOptionsMenu(menu: Menu?): Boolean {
        val inflater = menuInflater
        inflater.inflate(R.menu.loginmenu, menu)
        supportActionBar?.setLogo(R.mipmap.ic_launcher2)
        supportActionBar?.setDisplayUseLogoEnabled(true)
        return true
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySignUpBinding.inflate(layoutInflater)
        val view = binding.root
        setContentView(view)
        val toolbar = findViewById<androidx.appcompat.widget.Toolbar>(R.id.my_toolbar)
        toolbar.setTitleTextColor(ContextCompat.getColor(applicationContext, R.color.white))
        setSupportActionBar(toolbar)
        setAvatar()

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
                StringUtil.hashSha256(binding.passwordSignUp.text.toString()),
                avatar)

            val isFormFilled = signUpViewModel.signUpDataVerification(
                formData,
                StringUtil.hashSha256(binding.passwordConfirmSignUp.text.toString()))

            if (isFormFilled) {
                signUpViewModel.signUp(formData)
            }
        }
        binding.signIn.setOnClickListener {
            val intent = Intent(this, LoginActivity::class.java)
            startActivity(intent)
            finish()
        }
    }

    private fun setAvatar() {
        val avatarButtons = arrayOf(binding.avatar0, binding.avatar1, binding.avatar2, binding.avatar3, binding.avatar4, binding.avatar5)
        val selectedAvatarsResources = arrayOf(R.drawable.avatar0_selected, R.drawable.avatar1_selected, R.drawable.avatar2_selected, R.drawable.avatar3_selected, R.drawable.avatar4_selected, R.drawable.avatar5_selected)
        val avatarsResources = arrayOf(R.drawable.avatar0, R.drawable.avatar1, R.drawable.avatar2, R.drawable.avatar3, R.drawable.avatar4, R.drawable.avatar5)
        avatarButtons[avatar].setImageResource(selectedAvatarsResources[avatar])

        for (i in avatarButtons.indices) {
            avatarButtons[i].setOnClickListener {
                avatarButtons[avatar].setImageResource(avatarsResources[avatar])
                avatar = i
                avatarButtons[avatar].setImageResource(selectedAvatarsResources[avatar])
            }
        }
    }

    private fun updateUiWithUser(username: String) {
        // initiate successful logged in experience
        val intent = Intent(this, StaticTutorialActivity::class.java)
        //val intent = Intent(this,   MainMenuActivity::class.java);
        startActivity(intent)
        Toast.makeText(
            applicationContext,
            "Bienvenue $username ! Veillez bien lire les intructions de ce tutoriel ",
            Toast.LENGTH_LONG
        ).show()
    }

    private fun showSignUpFailed(@StringRes errorString: Int) {
        val toast = Toast.makeText(applicationContext, errorString, Toast.LENGTH_LONG)
        toast.setGravity(Gravity.CENTER_VERTICAL, 0, 0)
        toast.show()
    }

}
