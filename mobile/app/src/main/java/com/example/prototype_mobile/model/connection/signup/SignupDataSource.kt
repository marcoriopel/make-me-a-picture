package com.example.prototype_mobile.model.connection.signup

import com.example.prototype_mobile.model.Result
import com.example.prototype_mobile.model.connection.login.LoggedInUser
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.Call
import okhttp3.FormBody
import okhttp3.OkHttpClient
import okhttp3.RequestBody
import org.json.JSONObject

class SignupDataSource() {

    suspend fun createAccount(username: String, password: String): Result<LoggedInUser> {
        return withContext(Dispatchers.IO) {
            val client = OkHttpClient()
            val formBody: RequestBody = FormBody.Builder()
                .add("username", username)
                .add("password", password)
                .build()

            val request: okhttp3.Request = okhttp3.Request.Builder()
               // .url("http://10.0.2.2:3000/api/auth/register")
                .url("http://18.217.235.167:3000/api/auth/register")
                .post(formBody)
                .build()

            val call: Call = client.newCall(request)
            val response: okhttp3.Response = call.execute()
            val jsonData: String = response.body()!!.string()
            val Jobject = JSONObject(jsonData)
            val Jarray = Jobject.getString("token")
            val user = LoggedInUser(Jarray.toString(), username)

             if (response.code() == 200) {
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