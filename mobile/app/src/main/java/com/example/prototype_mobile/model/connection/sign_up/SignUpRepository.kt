package com.example.prototype_mobile.model.connection.sign_up

import com.example.prototype_mobile.LoggedInUser
import com.example.prototype_mobile.SignUpInfo
import com.example.prototype_mobile.model.HttpRequestDrawGuess
import com.example.prototype_mobile.model.*
import com.example.prototype_mobile.model.connection.login.LoginRepository
import com.example.prototype_mobile.model.connection.sign_up.model.ResponseCode
import okhttp3.Response
import org.json.JSONObject

class SignUpRepository {
    suspend fun signUp(signUpInfo : SignUpInfo): Result<LoggedInUser> {
        val mapSignUp= HashMap<String, String>()
        mapSignUp["username"] = signUpInfo.username
        mapSignUp["password"] = signUpInfo.password
        mapSignUp["name"] = signUpInfo.firstName
        mapSignUp["surname"] = signUpInfo.lastName
        mapSignUp["avatar"] = signUpInfo.avatar.toString()
        val response = HttpRequestDrawGuess.httpRequestPost("/api/authenticate/register", mapSignUp)


        val result = analyseSignUpAnswer(response, signUpInfo.username)

        if (result is Result.Success) {
            val loginRepository = LoginRepository.getInstance()
            loginRepository!!.setLoggedInUser((result).data)
        }

        return result

    }

    fun analyseSignUpAnswer(response: Response, username: String): Result<LoggedInUser> {
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
}
