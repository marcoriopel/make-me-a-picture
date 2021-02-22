package com.example.prototype_mobile.view.connection.signup

import com.example.prototype_mobile.model.Signup.AccountCreation

data class SignupResult(val success: AccountCreation?= null,
                        val error: Int ?= null
    )