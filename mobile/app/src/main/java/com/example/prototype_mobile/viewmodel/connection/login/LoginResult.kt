package com.example.prototype_mobile.viewmodel.connection.login

import com.example.prototype_mobile.view.connection.login.LoggedInUserView

/**
 * Authentication result : success (user details) or error message.
 */
data class LoginResult(
        val success: LoggedInUserView? = null,
        val error: Int? = null
)