package com.example.prototype_mobile.data

import android.content.Context
import android.widget.Toast
import com.android.volley.Response
import com.example.prototype_mobile.data.model.LoggedInUser
import okhttp3.FormBody
import okhttp3.Request
import okhttp3.RequestBody
import okhttp3.*
import java.io.IOException


/**
 * Class that handles authentication w/ login credentials and retrieves user information.
 */
class LoginDataSource() {

    fun login(username: String, password: String, applicationContext: Context): Result<LoggedInUser> {
        try {
            val client = OkHttpClient()
            val formBody: RequestBody = FormBody.Builder()
                    .add("username", username)
                    .add("password", password)
                    .build()

            val request: Request = Request.Builder()
                    .url("http://18.217.235.167:3000/api/auth/authenticate")
                    .post(formBody)
                    .build()

            val call: Call = client.newCall(request)
            val response: okhttp3.Response = call.execute()
            val user = LoggedInUser(response.body().toString(), username)

            return if(response.code() == 200) {
                Result.Success(user)
            } else {
                Result.Error("Erreur dans le mot de passe ou le nom d'utilisateur")
            }


        } catch (e: Throwable) {
            return Result.Error("La requête n'a pas pu être envoyée.")
        }
    }

    fun logout() {
        // TODO: revoke authentication
    }
}