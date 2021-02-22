package com.example.prototype_mobile.model.connection.login

/**
 * Data class that captures user information for logged in users retrieved from LoginRepository
 */
data class LoggedInUser(
        val token: String,
        val displayName: String
)