package com.example.prototype_mobile.data

import android.content.Context
import com.example.prototype_mobile.data.model.LoggedInUser
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope


/**
 * Class that requests authentication and user information from the remote data source and
 * maintains an in-memory cache of login status and user credentials information.
 */

class LoginRepository(val dataSource: LoginDataSource) {
    companion object {
        private var instance: LoginRepository? = null

        fun getInstance(datasource: LoginDataSource): LoginRepository? {
            if (instance == null) {
                synchronized(LoginRepository::class.java) {
                    if (instance == null) {
                        instance = LoginRepository(datasource)
                    }
                }
            }
            return instance
        }
    }

    // in-memory cache of the loggedInUser object
    var user: LoggedInUser? = null
        private set

    val isLoggedIn: Boolean
        get() = user != null

    init {
        // If user credentials will be cached in local storage, it is recommended it be encrypted
        // @see https://developer.android.com/training/articles/keystore
        user = null
    }

    fun logout() {
        user = null
        dataSource.logout()
    }

     suspend fun login(username: String, password: String): Result<LoggedInUser> {
        // handle login

         val result = dataSource.login(username, password)
         if (result is Result.Success) {
             setLoggedInUser((result as Result.Success<LoggedInUser>).data)
         }
         return result;

    }

    fun setLoggedInUser(loggedInUser: LoggedInUser) {
        this.user = loggedInUser
        // If user credentials will be cached in local storage, it is recommended it be encrypted
        // @see https://developer.android.com/training/articles/keystore
    }
}