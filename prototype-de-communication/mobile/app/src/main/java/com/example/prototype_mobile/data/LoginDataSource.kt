package com.example.prototype_mobile.data

import android.content.Context
import com.example.prototype_mobile.data.model.LoggedInUser
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.*
import org.json.JSONObject


/**
 * Class that handles authentication w/ login credentials and retrieves user information.
 */
class LoginDataSource() {

     suspend fun login(username: String, password: String): Result<LoggedInUser> {
        return withContext(Dispatchers.IO) {
            val client = OkHttpClient()
            val formBody: RequestBody = FormBody.Builder()
                    .add("username", username)
                    .add("password", password)
                    .build()

            val request: Request = Request.Builder()
                //.url("http://10.0.2.2:3000/api/auth/authenticate")
                    .url("http://18.217.235.167:3000/api/auth/authenticate")
                    .post(formBody)
                    .build()

            val call: Call = client.newCall(request)
            val response: Response = call.execute()
            val jsonData: String = response.body()!!.string()

            if(response.code() == 200) {
                val Jobject = JSONObject(jsonData)
                val Jarray = Jobject.getString("token")
                val user = LoggedInUser(Jarray.toString(), username)
                Result.Success(user)
            } else {
                Result.Error("Erreur dans le mot de passe ou le nom d'utilisateur")
            }


        }
    }

    fun logout() {
        // TODO: revoke authentication
    }
}