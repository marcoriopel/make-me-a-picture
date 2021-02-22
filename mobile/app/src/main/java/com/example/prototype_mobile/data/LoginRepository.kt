package com.example.prototype_mobile.data

import android.content.Context
import com.example.prototype_mobile.data.model.LoggedInUser
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import okhttp3.Response
import org.json.JSONObject


/**
 * Class that requests authentication and user information from the remote data source and
 * maintains an in-memory cache of login status and user credentials information.
 */

class LoginRepository(val httpRequest: HttpRequestDrawGuess) {
    companion object {
        private var instance: LoginRepository? = null

        fun getInstance(httpRequest: HttpRequestDrawGuess): LoginRepository? {
            if (instance == null) {
                synchronized(LoginRepository::class.java) {
                    if (instance == null) {
                        instance = LoginRepository(httpRequest)
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
        // TODO: To fix when logout is made
        user = null

    }

     suspend fun login(username: String, password: String): Result<LoggedInUser> {
        // handle login
         val mapLogin = HashMap<String, String>()
         mapLogin["username"] = username
         mapLogin["password"] = password
         val response = httpRequest.httpRequest("/api/auth/authenticate", mapLogin)


         val result = analyseLoginAnswer(response, username)

         if (result is Result.Success) {
             setLoggedInUser((result).data)
         }

         return result;

    }

    fun setLoggedInUser(loggedInUser: LoggedInUser) {
        this.user = loggedInUser
        // If user credentials will be cached in local storage, it is recommended it be encrypted
        // @see https://developer.android.com/training/articles/keystore
    }

    fun analyseLoginAnswer(response: Response, username: String): Result<LoggedInUser> {
        val jsonData: String = response.body()!!.string()
        if(response.code() == 200) {
            val Jobject = JSONObject(jsonData)
            val Jarray = Jobject.getString("token")
            val user = LoggedInUser(Jarray.toString(), username)
            return  Result.Success(user)
        } else {
            return Result.Error("Erreur dans le mot de passe ou le nom d'utilisateur")
        }
    }
}