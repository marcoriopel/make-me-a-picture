package com.example.prototype_mobile.data

import android.content.Context
import com.example.prototype_mobile.data.model.LoggedInUser
import okhttp3.*
import org.json.JSONObject


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
                    .url("http://10.0.2.2:3000/api/auth/authenticate")
                    .post(formBody)
                    .build()

            val call: Call = client.newCall(request)
            val response: okhttp3.Response = call.execute()
            val jsonData: String = response.body()!!.string()
            val Jobject = JSONObject(jsonData)
            val Jarray = Jobject.getString("token")
            val user = LoggedInUser(Jarray.toString(), username)

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