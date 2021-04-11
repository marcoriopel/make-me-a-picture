package com.example.prototype_mobile.model.connection.login

import android.util.Log
import com.example.prototype_mobile.LoggedInUser
import com.example.prototype_mobile.model.HttpRequestDrawGuess
import com.example.prototype_mobile.model.Result
import com.example.prototype_mobile.model.connection.sign_up.model.ResponseCode
import okhttp3.Response
import org.json.JSONObject


/**
 * Class that requests authentication and user information from the remote data source and
 * maintains an in-memory cache of login status and user credentials information.
 */

class LoginRepository {
    companion object {
        private var instance: LoginRepository? = null

        fun getInstance(): LoginRepository? {
            if (instance == null) {
                synchronized(LoginRepository::class.java) {
                    if (instance == null) {
                        instance = LoginRepository()
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

     suspend fun login(username: String, password: String): Result<LoggedInUser> {
        // handle login
         val mapLogin = HashMap<String, String>()
         mapLogin["username"] = username
         mapLogin["password"] = password
         val response = HttpRequestDrawGuess.httpRequestPost("/api/authenticate/login", mapLogin)


         val result = analyseLoginAnswer(response, username)

         if (result is Result.Success) {
             setLoggedInUser((result).data)
             Log.d("token", result.data.token)
         }

         return result
     }

    fun setLoggedInUser(loggedInUser: LoggedInUser?) {
        this.user = loggedInUser
        // If user credentials will be cached in local storage, it is recommended it be encrypted
        // @see https://developer.android.com/training/articles/keystore
    }

    fun analyseLoginAnswer(response: Response, username: String): Result<LoggedInUser> {
        val jsonData: String = response.body()!!.string()
        if(response.code() == ResponseCode.OK.code) {
            val Jobject = JSONObject(jsonData)
            val Jarray = Jobject.getString("token")
            val avatar = Jobject.getString("avatar")
            val user = LoggedInUser(Jarray.toString(), username, avatar.toInt())
            return Result.Success(user)
        } else {
            return Result.Error(response.code())
        }
    }

    suspend fun logout(): Result<Boolean> {
        // handle logout
        val response = HttpRequestDrawGuess.httpRequestPost("/api/authenticate/logout", HashMap(), true)

        val result = analyseLogoutAnswer(response)

        if (result is Result.Success) {
            setLoggedInUser(null)
        }

        return result
    }

    fun analyseLogoutAnswer(response: Response): Result<Boolean> {
        if(response.code() == ResponseCode.OK.code) {
            return Result.Success(true)
        } else {
            return Result.Error(response.code())
        }
    }
}