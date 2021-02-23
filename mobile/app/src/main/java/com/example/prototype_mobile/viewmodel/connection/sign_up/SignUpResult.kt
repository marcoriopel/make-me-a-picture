package com.example.prototype_mobile.viewmodel.connection.sign_up

import com.example.prototype_mobile.model.connection.sign_up.SignUpRepository

data class SignUpResult(val success: SignUpRepository?= null,
                        val error: Int ?= null
    )