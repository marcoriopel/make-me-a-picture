package com.example.prototype_mobile.ui.signup

import com.example.prototype_mobile.data.Signup.AccountCreation

data class SignupResult(val success: AccountCreation?= null,
                        val error: Int ?= null
    )