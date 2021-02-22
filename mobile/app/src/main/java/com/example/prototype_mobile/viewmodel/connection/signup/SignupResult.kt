package com.example.prototype_mobile.viewmodel.connection.signup

import com.example.prototype_mobile.model.connection.signup.AccountCreation

data class SignupResult(val success: AccountCreation?= null,
                        val error: Int ?= null
    )